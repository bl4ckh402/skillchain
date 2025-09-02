import { db, auth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
// import { sendEmail } from "@/lib/email";

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

    // Add bid to the job's bids subcollection
    const docRef = await db
      .collection("jobs")
      .doc(bidData.jobId)
      .collection("bids")
      .add(bid);

    // Fetch job to get client info
    const jobDoc = await db.collection("jobs").doc(bidData.jobId).get();
    const job = jobDoc.data();

    // Send email notification to client
    if (job && job.createdBy && job.createdBy.email) {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: job.createdBy.email,
            subject: "New Bid on Your Job Posting",
            html: `<p><strong>${bid.freelancer.name}</strong> applied for the job you posted: <strong>${job.title}</strong>.</p>
             <p>Log in to SkillChain to review the proposal.</p>`,
          }),
        }
      );
    }

    return NextResponse.json({ id: docRef.id, ...bid });
  } catch (error) {
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}
