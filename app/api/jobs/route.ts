import { endOfMonth } from 'date-fns';
import { db } from "@/lib/firebase-admin";
import { auth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { JobStatus } from "@/types/job";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const jobData = await req.json();

    // Create job document
    const job = {
      ...jobData,
      status: JobStatus.OPEN,
      createdBy: {
        id: decodedToken.uid,
        name: decodedToken.name || "Anonymous",
        avatar: decodedToken.picture,
        email: decodedToken.email,
      },
      createdAt: new Date().toISOString(),
      bids: [],
    };

    const docRef = await db.collection("jobs").add(job);

    return NextResponse.json({ id: docRef.id, ...job });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const skills = searchParams.get("skills")?.split(",");

    let query: any = db.collection("jobs");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (skills?.length) {
      query = query.where("requiredSkills", "array-contains-any", skills);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    const jobs = snapshot.docs.map((doc: { id: any; data: () => any }) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
