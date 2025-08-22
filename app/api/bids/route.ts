import { db, auth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) return NextResponse.json([], { status: 200 });

  const bidsSnap = await db
    .collection("jobs")
    .doc(jobId)
    .collection("bids")
    .get();
  const bids = bidsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(bids);
}
export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const bidData = await req.json();

    // Check if user already bid on this job
    const existingBid = await db
      .collection("jobs")
      .doc(bidData.jobId)
      .collection("bids")
      .where("freelancerId", "==", decodedToken.uid)
      .get();

    if (!existingBid.empty) {
      return NextResponse.json(
        { error: "You have already bid on this job" },
        { status: 400 }
      );
    }

    const bid = {
      ...bidData,
      freelancerId: decodedToken.uid,
      freelancer: {
        name: decodedToken.name || "Anonymous",
        avatar: decodedToken.picture,
        rating: 0, // Get actual rating from user profile
      },
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db
      .collection("jobs")
      .doc(bidData.jobId)
      .collection("bids")
      .add(bid);

    return NextResponse.json({ success: true });
    return NextResponse.json({ id: docRef.id, ...bid });
  } catch (error) {
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}
