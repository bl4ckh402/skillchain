"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { useCourses } from "./CourseContext";
import { Currency } from "lucide-react";
import React from "react";

// Define platform fee percentage (5%)
const PLATFORM_FEE_PERCENTAGE = 5;

interface SubaccountData {
  id: string;
  userId: string;
  subaccountCode: string;
  businessName: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentContextType {
  loading: boolean;
  processingPayment: boolean;
  payForCourse: (courseId: string) => Promise<boolean>;
  initializePayment: (
    courseId: string
  ) => Promise<{ reference: string; authorizationUrl: string } | null>;
  verifyPayment: (
    reference: string
  ) => Promise<{ success: boolean; courseId?: string }>;
  getPaymentHistory: () => Promise<any[]>;
  // Subaccount context to manage instructor payment details
  createSubaccount: (
    data: Omit<
      SubaccountData,
      "id" | "userId" | "createdAt" | "updatedAt" | "subaccountCode"
    >
  ) => Promise<SubaccountData>;
  updateSubaccount: (data: Partial<SubaccountData>) => Promise<SubaccountData>;
  fetchSubaccount: () => Promise<SubaccountData | null>;
  subaccount: SubaccountData | null;
  hasSubaccount: boolean;
}

const PaymentContext = createContext<PaymentContextType | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [subaccount, setSubaccount] = useState<SubaccountData | null>(null);
  const { user } = useAuth();
  const { getCourseById } = useCourses();
  const { toast } = useToast();

  // Initialize a payment session with Paystack
  const initializePayment = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase this course",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    setProcessingPayment(true);

    try {
      // Get course details
      const course = await getCourseById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Calculate amounts
      const totalAmount = Number(course.price || 0);
      const platformFeeAmount = (totalAmount * PLATFORM_FEE_PERCENTAGE) / 100;
      const creatorAmount = totalAmount - platformFeeAmount;

      // Check if instructor has a subaccount
      let instructorSubaccount = null;
      if (course.instructor?.id) {
        const subaccountQuery = query(
          collection(db, "subaccounts"),
          where("userId", "==", course.instructor.id)
        );
        const snapshot = await getDocs(subaccountQuery);
        if (!snapshot.empty) {
          instructorSubaccount = snapshot.docs[0].data();
        }
      }

      // Create a payment session via API route
      const response = await fetch("/api/initialize-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          userId: user.uid,
          userEmail: user.email,
          courseTitle: course.title,
          coursePrice: totalAmount,
          instructorId: course.instructor.id,
          platformFee: platformFeeAmount,
          creatorAmount: creatorAmount,
          Currency: "KES", // Kenyan Shilling
          subaccount: instructorSubaccount?.subaccountCode || null, // Use subaccount code if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initialize payment");
      }

      const { reference, authorizationUrl } = await response.json();

      // Save payment session reference
      await addDoc(collection(db, "paymentSessions"), {
        reference,
        userId: user.uid,
        courseId,
        instructorId: course.instructor.id,
        amount: totalAmount,
        platformFee: platformFeeAmount,
        creatorAmount,
        currency: "KES",
        hasSplit: !!instructorSubaccount,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      return { reference, authorizationUrl };
    } catch (error: any) {
      console.error("Error initializing payment:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start payment process",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  // Verify payment status
  // Fix for verifyPayment function in PaymentProvider.tsx
  const verifyPayment = async (reference: string) => {
    if (!user) throw new Error("Authentication required");

    try {
      // Verify payment status via API route
      const response = await fetch(
        `/api/verify-payment?reference=${reference}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify payment");
      }

      const { status, courseId, data } = await response.json();

      if (status === "success") {
        // Payment succeeded, update payment session status
        const paymentSessionQuery = query(
          collection(db, "paymentSessions"),
          where("reference", "==", reference)
        );

        const snapshot = await getDocs(paymentSessionQuery);
        if (!snapshot.empty) {
          const paymentSessionDoc = snapshot.docs[0];
          await updateDoc(paymentSessionDoc.ref, {
            status: "completed",
            completedAt: serverTimestamp(),
            // Store Split payment details if available
            splitDetails: data?.split || null,
          });

          // Extract courseId from the payment session if not provided by the API
          const paymentSessionData = paymentSessionDoc.data();
          const sessionCourseId = paymentSessionData.courseId;

          // Enroll user in course
          await enrollUserInCourse(sessionCourseId || courseId);

          // Return object with success status and courseId
          return { success: true, courseId: sessionCourseId || courseId };
        } else {
          throw new Error("Payment session not found");
        }
      }

      return { success: false };
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Verification Error",
        description: error.message || "Could not verify your payment",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create a subaccount for instructors
  const createSubaccount = useCallback(
    async (
      data: Omit<
        SubaccountData,
        "id" | "userId" | "createdAt" | "updatedAt" | "subaccountCode"
      >
    ): Promise<SubaccountData> => {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      setLoading(true);

      try {
        // Call API to create subaccount
        const response = await fetch("/api/instructors/create-subaccount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName: data.businessName,
            bankCode: data.bankCode,
            accountNumber: data.accountNumber,
            percentageCharge: data.percentageCharge,
            currency: "KES", // Specify Kenyan Shillings
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create subaccount");
        }

        const { subaccountCode } = await response.json();

        // Create document in Firestore
        const subaccountData: SubaccountData = {
          id: doc(collection(db, "subaccounts")).id,
          userId: user.uid,
          subaccountCode,
          businessName: data.businessName,
          bankCode: data.bankCode,
          accountNumber: data.accountNumber,
          percentageCharge: data.percentageCharge,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, "subaccounts", subaccountData.id), subaccountData);
        setSubaccount(subaccountData);

        toast({
          title: "Subaccount created",
          description: "Your payment account has been set up successfully.",
        });

        return subaccountData;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create subaccount";
        toast({
          title: "Error creating subaccount",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, toast]
  );

  // Update subaccount
  const updateSubaccount = useCallback(
    async (data: Partial<SubaccountData>): Promise<SubaccountData> => {
      if (!user || !subaccount) {
        throw new Error("User is not authenticated or subaccount not found");
      }

      setLoading(true);

      try {
        // Update subaccount in Paystack
        if (data.bankCode || data.accountNumber || data.percentageCharge) {
          const response = await fetch("/api/instructors/update-subaccount", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subaccountCode: subaccount.subaccountCode,
              ...data,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update subaccount");
          }
        }

        // Update document in Firestore
        const updatedData = {
          ...data,
          updatedAt: new Date(),
        };

        await updateDoc(doc(db, "subaccounts", subaccount.id), updatedData);

        const updatedSubaccount = {
          ...subaccount,
          ...data,
          updatedAt: new Date(),
        };

        setSubaccount(updatedSubaccount);

        toast({
          title: "Subaccount updated",
          description: "Your payment account has been updated successfully.",
        });

        return updatedSubaccount;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to update subaccount";
        toast({
          title: "Error updating subaccount",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, subaccount, toast]
  );

  // Fetch subaccount
  const fetchSubaccount =
    useCallback(async (): Promise<SubaccountData | null> => {
      if (!user) {
        return null;
      }

      setLoading(true);

      try {
        const subaccountQuery = query(
          collection(db, "subaccounts"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(subaccountQuery);

        if (snapshot.empty) {
          setSubaccount(null);
          return null;
        }

        const subaccountData = snapshot.docs[0].data() as SubaccountData;
        setSubaccount(subaccountData);
        return subaccountData;
      } catch (err) {
        console.error("Error fetching subaccount:", err);
        return null;
      } finally {
        setLoading(false);
      }
    }, [user]);

  // Handle direct payment (for testing purposes)
  const payForCourse = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase this course",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    setProcessingPayment(true);

    try {
      // Implement production version using initializePayment instead

      // For testing only:
      // This is a mock direct payment method - in production always use Paystack

      // Get course details
      const course = await getCourseById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Create payment record
      const paymentId = await addDoc(collection(db, "payments"), {
        userId: user.uid,
        courseId,
        instructorId: course.instructor.id,
        amount: course.price || 0,
        platformFee:
          (Number(course.price || 0) * PLATFORM_FEE_PERCENTAGE) / 100,
        status: "completed",
        method: "direct",
        reference: `TEST_${Math.random().toString(36).substring(2, 15)}`,
        createdAt: serverTimestamp(),
      });

      // Enroll user in course
      await enrollUserInCourse(courseId);

      toast({
        title: "Payment successful",
        description: "You've been enrolled in the course!",
      });

      return true;
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  // Helper function to enroll user in a course
  const enrollUserInCourse = async (courseId: string) => {
    if (!user) throw new Error("Authentication required");

    try {
      // Get course details
      const course = await getCourseById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Create enrollment
      const enrollmentRef = doc(db, "enrollments", `${user.uid}_${courseId}`);
      const enrollmentDoc = await getDoc(enrollmentRef);

      if (!enrollmentDoc.exists()) {
        // Create new enrollment if it doesn't exist
        await setDoc(enrollmentRef, {
          courseId,
          userId: user.uid,
          enrolledAt: serverTimestamp(),
          status: "active",
          progress: {
            progress: 0,
            completedLessons: [],
            lastAccessed: serverTimestamp(),
            totalLessons: course.lessons?.length || 0,
            nextLesson: course.modules?.[0]?.lessons?.[0]?.id || "",
            currentLesson: "",
            moduleProgress: {},
          },
        });

        // Update course students count
        const courseRef = doc(db, "courses", courseId);
        await updateDoc(courseRef, {
          students: increment(1),
        });

        // Update user stats
        const userStatsRef = doc(db, "userStats", user.uid);
        const userStatsDoc = await getDoc(userStatsRef);

        if (userStatsDoc.exists()) {
          await updateDoc(userStatsRef, {
            coursesEnrolled: increment(1),
          });
        } else {
          await setDoc(userStatsRef, {
            userId: user.uid,
            coursesEnrolled: 1,
            hoursLearned: 0,
            completedCourses: 0,
            achievements: 0,
            certificates: 0,
            projectsCompleted: 0,
            hackathonsParticipated: 0,
            jobsApplied: 0,
            eventsAttended: 0,
          });
        }

        // Update instructor stats
        if (course.instructor?.id) {
          const instructorStatsRef = doc(
            db,
            "instructorStats",
            course.instructor.id
          );
          const instructorStatsDoc = await getDoc(instructorStatsRef);

          if (instructorStatsDoc.exists()) {
            await updateDoc(instructorStatsRef, {
              totalStudents: increment(1),
              totalEnrollments: increment(1),
            });
          } else {
            await setDoc(instructorStatsRef, {
              userId: course.instructor.id,
              totalStudents: 1,
              totalEnrollments: 1,
              totalCourses: 1,
              totalRevenue: 0,
            });
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error enrolling user in course:", error);
      throw error;
    }
  };

  // Get payment history for the user
  const getPaymentHistory = async () => {
    if (!user) throw new Error("Authentication required");

    setLoading(true);

    try {
      const paymentsCollection = collection(db, "payments");
      const q = query(
        paymentsCollection,
        where("userId", "==", user.uid),
        where("status", "==", "completed")
      );

      const querySnapshot = await getDocs(q);

      const payments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : null,
        };
      });

      return payments;
    } catch (error: any) {
      console.error("Error fetching payment history:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  //load subaccount on mount
  React.useEffect(() => {
    if (user) {
      fetchSubaccount();
    } else {
      setSubaccount(null);
    }
  }, [user, fetchSubaccount]);

  const value = {
    loading,
    processingPayment,
    payForCourse,
    initializePayment,
    verifyPayment,
    getPaymentHistory,
    //Subaccount functionality
    createSubaccount,
    updateSubaccount,
    fetchSubaccount,
    subaccount,
    hasSubaccount: !!subaccount,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
