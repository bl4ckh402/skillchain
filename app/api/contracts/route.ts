import { db, auth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const { jobId, bidId } = await req.json();

    // Get job and bid details
    const jobDoc = await db.collection("jobs").doc(jobId).get();
    const bidDoc = await db
      .collection("jobs")
      .doc(jobId)
      .collection("bids")
      .doc(bidId)
      .get();

    if (!jobDoc.exists || !bidDoc.exists) {
      return NextResponse.json(
        { error: "Job or bid not found" },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();
    const bidData = bidDoc.data();

    // Create contract
    const contract = {
      jobId,
      bidId,
      client: jobData?.createdBy,
      freelancer: bidData?.freelancer,
      amount: bidData?.amount,
      status: "ACTIVE",
      milestones: [],
      createdAt: new Date().toISOString(),
    };

    const contractRef = await db.collection("contracts").add(contract);

    return NextResponse.json({ id: contractRef.id, ...contract });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
