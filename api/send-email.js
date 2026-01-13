import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("API KEY EXISTS:", !!process.env.RESEND_API_KEY);


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send email" });
  }
}
