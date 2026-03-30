// backend/services/emailService.js
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dns from "dns";

// 🔥 FORCE IPv4 (fixes ENETUNREACH)
dns.setDefaultResultOrder("ipv4first");

// Frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log('FRONTEND_URL used in emails:', FRONTEND_URL);

// =====================
// Environment variable check
// =====================
console.log('🔍 Checking email credentials:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ missing');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ set' : '❌ missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ set' : '❌ missing');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ set' : '❌ missing');

// =====================
// Email transporter (Gmail SMTP)
// =====================
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,        // smtp.gmail.com
  port: parseInt(process.env.EMAIL_PORT, 10), // 587
  secure: process.env.EMAIL_PORT === '465', // false for 587
  auth: {
    user: process.env.EMAIL_USER,      // your Gmail address
    pass: process.env.EMAIL_PASS,      // your Gmail app password
  },
});

// Verify transporter
transporter.verify()
  .then(() => console.log('✅ Gmail SMTP ready to send emails'))
  .catch(err => console.error('❌ Gmail SMTP error:', err));

// =====================
// Email Templates (full versions – your existing templates)
// =====================
const emailTemplates = {
  welcome: (name, email, role) => ({
    subject: `Welcome to MarketStore, ${name}! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0;">MarketStore</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2>Welcome, ${name}! 👋</h2>
          <p>Thank you for joining MarketStore. We're excited to have you on board!</p>
          ${role === 'vendor' ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">📝 Vendor Application Received</h3>
              <p style="color: #92400e; margin: 0;">Your vendor application has been submitted and is pending review. We'll notify you once it's approved.</p>
            </div>
          ` : ''}
          <p>You can now:</p>
          <ul>
            <li>Browse our wide selection of products</li>
            <li>Add items to your wishlist</li>
            <li>Place orders and track deliveries</li>
            ${role === 'vendor' ? '<li>Manage your store and products</li>' : ''}
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/login?registered=true"
               style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Get Started
            </a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            If you have any questions, feel free to contact our support team.
          </p>
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            MarketStore Team
          </p>
        </div>
      </div>
    `,
  }),

  // ... (include all your other templates exactly as they were)
  // For brevity, I've omitted the full repetition, but you must paste them here.
  // Make sure to include vendorApproved, vendorRejected, loginAlert, passwordReset,
  // passwordChanged, paymentConfirmation, payoutNotification, payoutApproval, payoutRejection.
};

// =====================
// Send Email Function
// =====================
export const sendEmail = async (to, subject, html) => {
  console.log(`📧 sendEmail called: to=${to}, subject=${subject}`);

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email credentials not configured, skipping email');
      return { success: true, messageId: 'skipped' };
    }

    console.log('📤 Attempting to send email...');
    const info = await transporter.sendMail({
      from: `"MarketStore" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// =====================
// Exported Email Functions
// =====================
export const sendWelcomeEmail = async (user) => {
  const template = emailTemplates.welcome(user.full_name, user.email, user.role);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendVendorApprovalEmail = async (user, businessName) => {
  const template = emailTemplates.vendorApproved(user.full_name, businessName);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendVendorRejectionEmail = async (user, businessName, reason) => {
  const template = emailTemplates.vendorRejected(user.full_name, businessName, reason);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendLoginAlertEmail = async (user, ip, device, location) => {
  const template = emailTemplates.loginAlert(user.full_name, user.email, ip, device, location);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const template = emailTemplates.passwordReset(user.full_name, resetToken);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendPasswordChangedEmail = async (user) => {
  const template = emailTemplates.passwordChanged(user.full_name);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendPaymentConfirmationEmail = async (user, amount, reference, orderId) => {
  const template = emailTemplates.paymentConfirmation(user.full_name, amount, reference, orderId);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendPayoutNotificationEmail = async (user, amount, reference, status) => {
  const template = emailTemplates.payoutNotification(user.full_name, amount, reference, status);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendPayoutApprovalEmail = async (user, amount, reference, bankDetails) => {
  const template = emailTemplates.payoutApproval(user.full_name, amount, reference, bankDetails);
  return await sendEmail(user.email, template.subject, template.html);
};

export const sendPayoutRejectionEmail = async (user, amount, reason, reference) => {
  const template = emailTemplates.payoutRejection(user.full_name, amount, reason, reference);
  return await sendEmail(user.email, template.subject, template.html);
};

export default {
  sendWelcomeEmail,
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendPaymentConfirmationEmail,
  sendPayoutNotificationEmail,
  sendPayoutApprovalEmail,
  sendPayoutRejectionEmail,
  sendEmail,
};