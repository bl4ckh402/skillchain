import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin"; // Your admin SDK init

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email)
    return NextResponse.json({ error: "Missing email" }, { status: 400 });

  try {
    const user = await getAuth(adminApp).getUserByEmail(email);
    return NextResponse.json({ uid: user.uid });
  } catch {
    return NextResponse.json({ uid: null });
  }
}
