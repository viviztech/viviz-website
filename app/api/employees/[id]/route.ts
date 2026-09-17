import { NextResponse } from "next/server";
import { verifySessionFromCookies } from "@/lib/session";
import { parseEmployeePayload, updateEmployee } from "@/lib/employees";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifySessionFromCookies())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const id = Number((await params).id); if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid employee id." }, { status: 400 });
  try { const parsed = parseEmployeePayload(await req.json());
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const employee = await updateEmployee(id, parsed.data);
    return employee ? NextResponse.json({ employee }) : NextResponse.json({ error: "Employee not found." }, { status: 404 });
  } catch (error) { console.error("Update employee error:", error); return NextResponse.json({ error: "Could not update employee." }, { status: 500 }); }
}
