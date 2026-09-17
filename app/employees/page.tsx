import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySessionFromCookies } from "@/lib/session";
import { listEmployees } from "@/lib/employees";
import EmployeeManager from "@/components/employee/EmployeeManager";
export const metadata:Metadata={title:"Employee Onboarding",robots:{index:false,follow:false}};
export default async function EmployeesPage(){if(!(await verifySessionFromCookies()))redirect("/employees/login");return <EmployeeManager initialEmployees={await listEmployees()}/>;}
