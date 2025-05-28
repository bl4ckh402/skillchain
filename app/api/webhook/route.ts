import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(request: {
  text: () => any;
  headers: { get: (arg0: string) => any };
}) {
  const payload = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  // Verify webhook signature
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  // Parse event
  const event = JSON.parse(payload);

  try {
    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;

      // Add other event types as needed
      // case 'transfer.success':
      // case 'transfer.failed':

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Handle successful charge
async function handleChargeSuccess(transaction: {
  metadata: string;
  reference: unknown;
  amount: number;
  paid_at: string | number | Date;
}) {
  // Parse metadata to extract course and user details
  const metadata =
    typeof transaction.metadata === "string"
      ? JSON.parse(transaction.metadata)
      : transaction.metadata;

  const courseId = metadata?.courseId;
  const userId = metadata?.userId;
  const instructorId = metadata?.instructorId;
  const platformFee = metadata?.platformFee || 0;
  const creatorAmount = metadata?.creatorAmount || 0;

  if (!courseId || !userId) {
    console.error("Missing required metadata in transaction");
    return;
  }

  // Update payment session status if it exists
  const paymentSessionQuery = query(
    collection(db, "paymentSessions"),
    where("reference", "==", transaction.reference)
  );

  const snapshot = await getDocs(paymentSessionQuery);
  if (!snapshot.empty) {
    const paymentSessionDoc = snapshot.docs[0];
    await updateDoc(paymentSessionDoc.ref, {
      status: "completed",
      completedAt: serverTimestamp(),
    });
  }

  // Create a payment record
  const paymentsCollection = collection(db, "payments");

  // First check if payment record already exists
  const paymentQuery = query(
    paymentsCollection,
    where("reference", "==", transaction.reference)
  );
  const paymentSnapshot = await getDocs(paymentQuery);

  // Only create a new payment record if it doesn't exist
  if (paymentSnapshot.empty) {
    // Create a new payment record
    await addDoc(paymentsCollection, {
      reference: transaction.reference,
      userId,
      courseId,
      instructorId,
      amount: transaction.amount / 100, // Convert from kobo to naira
      platformFee,
      creatorAmount,
      status: "completed",
      method: "paystack",
      paymentDate: new Date(transaction.paid_at),
      createdAt: serverTimestamp(),
    });

    // Update instructor revenue stats
    if (instructorId) {
      const instructorStatsRef = doc(db, "instructorStats", instructorId);
      const instructorStatsDoc = await getDoc(instructorStatsRef);

      if (instructorStatsDoc.exists()) {
        await updateDoc(instructorStatsRef, {
          totalRevenue: increment(creatorAmount),
        });
      } else {
        await setDoc(instructorStatsRef, {
          userId: instructorId,
          totalStudents: 1,
          totalEnrollments: 1,
          totalCourses: 1,
          totalRevenue: creatorAmount,
        });
      }
    }

    // Enroll user in course
    await enrollUserInCourse(userId, courseId);
  }
}

// Helper function to enroll user in a course
async function enrollUserInCourse(userId: string, courseId: string) {
  try {
    // Get course details
    const courseRef = doc(db, "courses", courseId);
    const courseDoc = await getDoc(courseRef);

    if (!courseDoc.exists()) {
      throw new Error("Course not found");
    }

    const course = courseDoc.data();

    // Create enrollment
    const enrollmentRef = doc(db, "enrollments", `${userId}_${courseId}`);
    const enrollmentDoc = await getDoc(enrollmentRef);

    if (!enrollmentDoc.exists()) {
      // Create new enrollment if it doesn't exist
      await setDoc(enrollmentRef, {
        userId,
        courseId,
        instructorId: course.instructor.id,
        enrolledAt: serverTimestamp(),
        status: "active",
        progress: {
          progress: 0,
          lastAccessed: serverTimestamp(),
          completedLessons: [],
          totalLessons: course.lessons?.length || 0,
          nextLesson: course.lessons?.[0]?.id || "",
          currentLesson: "",
        },
      });

      // Update course students count
      await updateDoc(courseRef, {
        students: increment(1),
      });

      // Update user stats
      const userStatsRef = doc(db, "userStats", userId);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        await updateDoc(userStatsRef, {
          coursesEnrolled: increment(1),
        });
      } else {
        await setDoc(userStatsRef, {
          userId,
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
}
