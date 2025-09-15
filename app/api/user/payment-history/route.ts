import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export async function GET(request: { url: string | URL }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Query payments collection for user's payment history
    const paymentsCollection = collection(db, "payments");
    const q = query(
      paymentsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    // Transform the data for response
    const payments = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      // Convert Firestore timestamps to ISO strings for JSON serialization
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : null;

      return {
        id: doc.id,
        ...data,
        createdAt,
      };
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch payment history";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
