import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { verifySessionFromCookies } from "@/lib/session";
import { getEmployeeById } from "@/lib/employees";
import OfferLetterDocument from "@/components/employee/OfferLetterDocument";
export const runtime = "nodejs";
export async function GET(_req: Request,{params}:{params:Promise<{id:string}>}) {
  if (!(await verifySessionFromCookies())) return NextResponse.json({error:"Unauthorized."},{status:401});
  const id=Number((await params).id); if(!Number.isInteger(id)) return NextResponse.json({error:"Invalid employee id."},{status:400});
  try { const employee=await getEmployeeById(id); if(!employee) return NextResponse.json({error:"Employee not found."},{status:404});
    const buffer=await renderToBuffer(OfferLetterDocument({employee})); const safe=employee.fullName.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"");
    return new NextResponse(new Uint8Array(buffer),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="Offer-Letter-${safe}.pdf"`}});
  } catch(error){console.error("Offer letter error:",error);return NextResponse.json({error:"Could not generate offer letter."},{status:500});}
}
