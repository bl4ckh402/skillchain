import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    // Get the signature from the headers
    const paystackSignature = request.headers.get("x-paystack-signature");

    if (!paystackSignature) {
      return NextResponse.json(
        { message: "Missing Paystack signature" },
        { status: 400 }
      );
    }

    // Get the raw body
    const body = await request.text();

    // Verify signature
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

    if (hash !== paystackSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the event
    const event = JSON.parse(body);

    // Handle only successful charge events
    if (event.event === "charge.success") {
      const {
        reference,
        status,
        amount,
        currency,
        metadata,
        customer,
        paid_at,
      } = event.data;

      // Verify transaction status and currency
      if (status === "success" && currency === "KES") {
        // Find the payment session
        const paymentSessionsRef = db.collection("paymentSessions");
        const sessionQuery = await paymentSessionsRef
          .where("reference", "==", reference)
          .limit(1)
          .get();

        if (!sessionQuery.empty) {
          const sessionDoc = sessionQuery.docs[0];
          const sessionData = sessionDoc.data();

          // Update payment session status
          await sessionDoc.ref.update({
            status: "completed",
            completedAt: FieldValue.serverTimestamp(),
            paymentDetails: event.data,
            // Include split details if available
            splitDetails: event.data.split || null,
          });

          // Create a completed payment record
          await db.collection("payments").add({
            reference,
            userId: sessionData.userId,
            courseId: sessionData.courseId,
            instructorId: sessionData.instructorId,
            amount: amount / 100, // Convert from cents to KES
            currency,
            platformFee: sessionData.platformFee,
            creatorAmount: sessionData.creatorAmount,
            hasSplit: !!event.data.split,
            splitDetails: event.data.split || null,
            status: "completed",
            method: "paystack",
            customerEmail: customer.email,
            paidAt: new Date(paid_at),
            createdAt: FieldValue.serverTimestamp(),
          });

          // Enroll user in the course
          const userId = sessionData.userId;
          const courseId = sessionData.courseId;

          // Check if enrollment already exists
          const enrollmentRef = db
            .collection("enrollments")
            .doc(`${userId}_${courseId}`);
          const enrollmentDoc = await enrollmentRef.get();

          if (!enrollmentDoc.exists) {
            // Get course details
            const courseRef = db.collection("courses").doc(courseId);
            const courseDoc = await courseRef.get();

            if (courseDoc.exists) {
              const courseData = courseDoc.data() || {};

              // Create enrollment
              await enrollmentRef.set({
                courseId,
                userId,
                enrolledAt: FieldValue.serverTimestamp(),
                status: "active",
                progress: {
                  progress: 0,
                  completedLessons: [],
                  lastAccessed: FieldValue.serverTimestamp(),
                  totalLessons: courseData.lessons?.length || 0,
                  nextLesson: courseData.modules?.[0]?.lessons?.[0]?.id || "",
                  currentLesson: "",
                  moduleProgress: {},
                },
              });

              // Update course students count
              await courseRef.update({
                students: FieldValue.increment(1),
              });

              // Update user stats
              const userStatsRef = db.collection("userStats").doc(userId);
              const userStatsDoc = await userStatsRef.get();

              if (userStatsDoc.exists) {
                await userStatsRef.update({
                  coursesEnrolled: FieldValue.increment(1),
                });
              } else {
                await userStatsRef.set({
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
              if (sessionData.instructorId) {
                const instructorStatsRef = db
                  .collection("instructorStats")
                  .doc(sessionData.instructorId);
                const instructorStatsDoc = await instructorStatsRef.get();

                if (instructorStatsDoc.exists) {
                  await instructorStatsRef.update({
                    totalStudents: FieldValue.increment(1),
                    totalEnrollments: FieldValue.increment(1),
                    totalRevenue: FieldValue.increment(
                      sessionData.creatorAmount || 0
                    ),
                  });
                } else {
                  await instructorStatsRef.set({
                    userId: sessionData.instructorId,
                    totalStudents: 1,
                    totalEnrollments: 1,
                    totalCourses: 1,
                    totalRevenue: sessionData.creatorAmount || 0,
                  });
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
