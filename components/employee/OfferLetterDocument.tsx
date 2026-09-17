import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { COMPANY_BRANCH_ADDRESS, COMPANY_EMAIL, COMPANY_NAME, COMPANY_PHONE_1, COMPANY_WEBSITE } from "@/lib/config";
import type { EmployeeRecord } from "@/lib/employees";

/* eslint-disable jsx-a11y/alt-text -- react-pdf Image is not an HTML image and has no alt prop */

const logo = readFileSync(join(process.cwd(), "public", "logo.jpg"));
const signature = readFileSync(join(process.cwd(), "public", "sign-ganesh.png"));
const s = StyleSheet.create({
  page:{paddingTop:38,paddingBottom:24,paddingHorizontal:50,fontFamily:"Helvetica",fontSize:10,color:"#172033",lineHeight:1.45},
  header:{flexDirection:"row",alignItems:"center",paddingBottom:14,borderBottom:"2 solid #07518A",marginBottom:20},
  logo:{width:55,height:55,objectFit:"contain",marginRight:16}, company:{fontFamily:"Helvetica-Bold",fontSize:15,color:"#073B6B"}, contact:{fontSize:7.5,color:"#526176",marginTop:2},
  reference:{flexDirection:"row",justifyContent:"space-between",fontSize:8.5,color:"#526176",marginBottom:16},
  title:{fontFamily:"Helvetica-Bold",fontSize:16,textAlign:"center",color:"#073B6B",letterSpacing:1.2,marginBottom:16},
  name:{fontFamily:"Helvetica-Bold",fontSize:11.5,marginBottom:8}, p:{marginBottom:8}, bold:{fontFamily:"Helvetica-Bold"},
  panel:{backgroundColor:"#F1F7FB",borderLeft:"3 solid #1AA7C8",padding:12,marginVertical:8},
  row:{flexDirection:"row",marginBottom:4}, label:{width:"35%",fontFamily:"Helvetica-Bold",color:"#33445C"}, value:{flex:1},
  list:{marginLeft:12,marginBottom:4}, closing:{marginTop:10}, signature:{marginTop:16,width:150}, signatureImage:{width:102,height:28,objectFit:"contain",alignSelf:"center"}, signLine:{width:150,borderTop:"0.7 solid #7A8798",paddingTop:5,fontFamily:"Helvetica-Bold",textAlign:"center"},
  footer:{marginTop:"auto",borderTop:"0.5 solid #B8C6D5",paddingTop:6,flexDirection:"row",justifyContent:"space-between",fontSize:7,color:"#637083"}
});
const fmtDate=(x:string)=>new Date(`${x}T00:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
const fmtMoney=(x:number)=>`INR ${x.toLocaleString("en-IN",{maximumFractionDigits:0})} per annum`;
const typeLabel=(x:string)=>x.split("_").map(v=>v[0].toUpperCase()+v.slice(1)).join(" ");

export default function OfferLetterDocument({ employee }: { employee: EmployeeRecord }) {
  return <Document title={`Offer Letter - ${employee.fullName}`} author={COMPANY_NAME} subject="Employment offer letter"><Page size="A4" style={s.page}>
    <View style={s.header}><Image src={logo} style={s.logo}/><View><Text style={s.company}>{COMPANY_NAME}</Text><Text style={s.contact}>{COMPANY_BRANCH_ADDRESS}</Text><Text style={s.contact}>{COMPANY_EMAIL} | {COMPANY_PHONE_1} | www.{COMPANY_WEBSITE}</Text></View></View>
    <View style={s.reference}><Text>Reference: {employee.employeeCode}</Text><Text>Date: {new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</Text></View>
    <Text style={s.title}>OFFER OF EMPLOYMENT</Text><Text style={s.name}>Dear {employee.fullName},</Text>
    <Text style={s.p}>We are pleased to offer you employment with {COMPANY_NAME}. Your experience and potential will be a valued addition to our team. The principal terms of this offer are set out below.</Text>
    <View style={s.panel}><View style={s.row}><Text style={s.label}>Position</Text><Text style={s.value}>{employee.role}</Text></View><View style={s.row}><Text style={s.label}>Department</Text><Text style={s.value}>{employee.department}</Text></View><View style={s.row}><Text style={s.label}>Employment</Text><Text style={s.value}>{typeLabel(employee.employmentType)}</Text></View><View style={s.row}><Text style={s.label}>Joining date</Text><Text style={s.value}>{fmtDate(employee.joiningDate)}</Text></View><View style={s.row}><Text style={s.label}>Work location</Text><Text style={s.value}>{employee.workLocation}</Text></View><View style={s.row}><Text style={s.label}>Annual CTC</Text><Text style={s.value}>{fmtMoney(employee.annualCtc)}</Text></View>{employee.reportingManager ? <View style={s.row}><Text style={s.label}>Reporting to</Text><Text style={s.value}>{employee.reportingManager}</Text></View> : null}</View>
    <Text style={s.p}>Your first {employee.probationMonths} month{employee.probationMonths===1?"":"s"} of employment will be a probationary period. Confirmation of employment will be subject to satisfactory performance and compliance with company policies.</Text>
    <Text style={[s.p,s.bold]}>Conditions of employment</Text><Text style={s.list}>• You will maintain the confidentiality of company, client, and employee information.</Text><Text style={s.list}>• You will comply with all policies and reasonable instructions issued by the company.</Text><Text style={s.list}>• This offer is subject to verification of the information and documents supplied by you.</Text><Text style={s.list}>• Detailed compensation, leave, notice, and benefit terms will follow applicable company policy and your employment agreement.</Text>
    {employee.notes ? <Text style={s.p}><Text style={s.bold}>Additional terms: </Text>{employee.notes}</Text> : null}
    <Text style={s.closing}>Please sign and return a copy of this letter to confirm your acceptance. We look forward to welcoming you to {COMPANY_NAME}.</Text>
    <View style={s.signature} wrap={false}><Text>For {COMPANY_NAME}</Text><Image src={signature} style={s.signatureImage}/><Text style={s.signLine}>Authorized Signatory</Text></View>
    <View style={s.footer}><Text>{COMPANY_NAME} · Employment offer</Text><Text render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`}/></View>
  </Page></Document>;
}
