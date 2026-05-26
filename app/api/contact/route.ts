import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = "viviztechnologies@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, service, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Viviz Website <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: email,
      subject: `New inquiry${service ? ` — ${service}` : ""} from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0B1120;color:#F8FAFC;border-radius:12px;">
          <h2 style="color:#00D4FF;margin-top:0;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#94A3B8;width:120px;">Name</td><td style="padding:8px 0;color:#F8FAFC;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#94A3B8;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#00D4FF;">${email}</a></td></tr>
            ${company ? `<tr><td style="padding:8px 0;color:#94A3B8;">Company</td><td style="padding:8px 0;color:#F8FAFC;">${company}</td></tr>` : ""}
            ${service ? `<tr><td style="padding:8px 0;color:#94A3B8;">Service</td><td style="padding:8px 0;color:#8B5CF6;font-weight:bold;">${service}</td></tr>` : ""}
          </table>
          <div style="margin-top:16px;padding:16px;background:#111827;border-radius:8px;border-left:3px solid #00D4FF;">
            <p style="margin:0;color:#94A3B8;font-size:13px;margin-bottom:8px;">Message</p>
            <p style="margin:0;color:#F8FAFC;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:24px;color:#475569;font-size:12px;">Sent from viviztechnologies.com contact form</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
