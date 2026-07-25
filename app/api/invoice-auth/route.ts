import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, verifyPassword } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    await createSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invoice auth route error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
