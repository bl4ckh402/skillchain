import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { bidId: string } }
) {
  const { bidId } = params;
  const { status } = await req.json();

  // Find the job containing this bid
  // (You may need to pass jobId as well, or index bids globally)
  // For subcollection:
  // You must know the jobId to update the bid in jobs/{jobId}/bids/{bidId}
  // If you store bids globally, just update bids/{bidId}

  // Example for global bids collection:
  await db.collection("bids").doc(bidId).update({ status });

  return NextResponse.json({ success: true });
}
