import { NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the user
    const decodedToken = await auth.verifyIdToken(token);

    // Get request body
    const jobData = await request.json();

    // Add additional fields
    const job = {
      ...jobData,
      postedBy: decodedToken.uid,
      postedAt: new Date().toISOString(),
      status: "active",
      applications: [],
      featured: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    // Add to Firestore
    const docRef = await db.collection("jobs").add(job);

    return NextResponse.json({
      success: true,
      jobId: docRef.id,
    });
  } catch (error: any) {
    console.error("Error posting job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post job" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch jobs
export async function GET() {
  try {
    const jobsRef = db.collection("jobs");
    const snapshot = await jobsRef
      .where("status", "==", "active")
      .orderBy("postedAt", "desc")
      .get();

    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
