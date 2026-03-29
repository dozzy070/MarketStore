// test-smtp.js
import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,       // try 465 if this times out
  secure: false,   // true for port 465
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection successful!');
  })
  .catch(err => {
    console.error('❌ SMTP connection failed:', err.message);
  });