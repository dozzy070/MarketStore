import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

const testEmail = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection works");

    const info = await transporter.sendMail({
      from: `"MarketStore" <${process.env.BREVO_EMAIL}>`,
      to: "your-personal-email@example.com", // Use your own email for testing
      subject: "Test Brevo Email",
      html: "<h1>Hello from Brevo!</h1>",
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ SMTP error:", err);
  }
};

testEmail();