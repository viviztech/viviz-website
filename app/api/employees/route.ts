import { NextResponse } from "next/server";
import { verifySessionFromCookies } from "@/lib/session";
import { createEmployee, parseEmployeePayload } from "@/lib/employees";

export async function POST(req: Request) {
  if (!(await verifySessionFromCookies())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try { const parsed = parseEmployeePayload(await req.json());
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json({ employee: await createEmployee(parsed.data) }, { status: 201 });
  } catch (error) { console.error("Create employee error:", error); return NextResponse.json({ error: "Could not save employee. Has the employee database migration been run?" }, { status: 500 }); }
}
