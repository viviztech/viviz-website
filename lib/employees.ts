import "server-only";
import { getSql } from "@/lib/db";

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "internship"] as const;
export const EMPLOYEE_STATUSES = ["offer_drafted", "offer_sent", "accepted", "joined"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export interface EmployeeRecord {
  id: number; employeeCode: string; fullName: string; personalEmail: string; phone: string;
  address: string; role: string; department: string; employmentType: EmploymentType;
  workLocation: string; joiningDate: string; annualCtc: number; probationMonths: number;
  reportingManager: string | null; status: EmployeeStatus; notes: string | null; createdAt: string;
}

export type EmployeeInput = Omit<EmployeeRecord, "id" | "employeeCode" | "createdAt">;

function dateOnly(value: unknown) { return value instanceof Date ? value.toISOString().slice(0, 10) : String(value); }
function iso(value: unknown) { return value instanceof Date ? value.toISOString() : String(value); }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): EmployeeRecord {
  return { id: row.id, employeeCode: row.employee_code ?? `VZ-${String(row.id).padStart(4, "0")}`,
    fullName: row.full_name, personalEmail: row.personal_email, phone: row.phone, address: row.address,
    role: row.role, department: row.department, employmentType: row.employment_type,
    workLocation: row.work_location, joiningDate: dateOnly(row.joining_date), annualCtc: Number(row.annual_ctc),
    probationMonths: Number(row.probation_months), reportingManager: row.reporting_manager,
    status: row.status, notes: row.notes, createdAt: iso(row.created_at) };
}

export function parseEmployeePayload(value: unknown): { data: EmployeeInput } | { error: string } {
  if (!value || typeof value !== "object") return { error: "Invalid request." };
  const x = value as Record<string, unknown>;
  const required = ["fullName", "personalEmail", "phone", "address", "role", "department", "workLocation", "joiningDate"];
  for (const key of required) if (typeof x[key] !== "string" || !String(x[key]).trim()) return { error: `${key} is required.` };
  const employmentType = String(x.employmentType) as EmploymentType;
  const status = String(x.status ?? "offer_drafted") as EmployeeStatus;
  const annualCtc = Number(x.annualCtc), probationMonths = Number(x.probationMonths ?? 3);
  if (!EMPLOYMENT_TYPES.includes(employmentType)) return { error: "Invalid employment type." };
  if (!EMPLOYEE_STATUSES.includes(status)) return { error: "Invalid employee status." };
  if (!Number.isFinite(annualCtc) || annualCtc < 0) return { error: "Annual CTC must be a positive number." };
  if (!Number.isInteger(probationMonths) || probationMonths < 0 || probationMonths > 24) return { error: "Probation must be between 0 and 24 months." };
  if (!/^\S+@\S+\.\S+$/.test(String(x.personalEmail))) return { error: "Enter a valid email address." };
  return { data: { fullName: String(x.fullName).trim(), personalEmail: String(x.personalEmail).trim().toLowerCase(),
    phone: String(x.phone).trim(), address: String(x.address).trim(), role: String(x.role).trim(),
    department: String(x.department).trim(), employmentType, workLocation: String(x.workLocation).trim(),
    joiningDate: String(x.joiningDate), annualCtc, probationMonths,
    reportingManager: typeof x.reportingManager === "string" && x.reportingManager.trim() ? x.reportingManager.trim() : null,
    status, notes: typeof x.notes === "string" && x.notes.trim() ? x.notes.trim() : null } };
}

export async function listEmployees() { const rows = await getSql()`SELECT * FROM employees ORDER BY id DESC`; return rows.map(mapRow); }
export async function getEmployeeById(id: number) { const rows = await getSql()`SELECT * FROM employees WHERE id=${id}`; return rows[0] ? mapRow(rows[0]) : null; }
export async function createEmployee(x: EmployeeInput) {
  const sql = getSql();
  const rows = await sql`INSERT INTO employees (full_name,personal_email,phone,address,role,department,employment_type,work_location,joining_date,annual_ctc,probation_months,reporting_manager,status,notes)
    VALUES (${x.fullName},${x.personalEmail},${x.phone},${x.address},${x.role},${x.department},${x.employmentType},${x.workLocation},${x.joiningDate},${x.annualCtc},${x.probationMonths},${x.reportingManager},${x.status},${x.notes}) RETURNING *`;
  await sql`UPDATE employees SET employee_code=${`VZ-${String(rows[0].id).padStart(4, "0")}`} WHERE id=${rows[0].id}`;
  return (await getEmployeeById(rows[0].id))!;
}
export async function updateEmployee(id: number, x: EmployeeInput) {
  const rows = await getSql()`UPDATE employees SET full_name=${x.fullName},personal_email=${x.personalEmail},phone=${x.phone},address=${x.address},role=${x.role},department=${x.department},employment_type=${x.employmentType},work_location=${x.workLocation},joining_date=${x.joiningDate},annual_ctc=${x.annualCtc},probation_months=${x.probationMonths},reporting_manager=${x.reportingManager},status=${x.status},notes=${x.notes},updated_at=now() WHERE id=${id} RETURNING *`;
  return rows[0] ? mapRow(rows[0]) : null;
}
