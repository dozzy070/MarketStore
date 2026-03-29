import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dns from "dns";

// 🔥 FORCE IPv4 (fixes ENETUNREACH)
dns.setDefaultResultOrder("ipv4first");

// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// Verify transporter configuration
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email transporter error:', error.message);
    return false;
  }
};

verifyTransporter();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log('FRONTEND_URL used in emails:', FRONTEND_URL);

// =====================
// Email Templates
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

  vendorApproved: (name, businessName) => ({
    subject: `🎉 Congratulations! Your vendor application has been approved!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0;">MarketStore</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2>Congratulations, ${name}! 🎉</h2>
          <p>Your vendor application for <strong>${businessName}</strong> has been approved!</p>
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0;">✅ What's Next?</h3>
            <ul style="color: #065f46; margin: 0;">
              <li>Log in to your vendor dashboard</li>
              <li>Add your first products</li>
              <li>Set up your store profile</li>
              <li>Start selling!</li>
            </ul>
          </div>
          <a href="${FRONTEND_URL}/vendor/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Go to Vendor Dashboard
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">Start selling and grow your business with MarketStore!</p>
        </div>
      </div>
    `,
  }),

  vendorRejected: (name, businessName, reason) => ({
    subject: `Update on your vendor application`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0;">MarketStore</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2>Hello ${name},</h2>
          <p>Thank you for applying to become a vendor at MarketStore.</p>
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin: 0 0 10px 0;">📋 Application Status: Not Approved</h3>
            <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${reason || 'Your application did not meet our requirements at this time.'}</p>
          </div>
          <p>You can reapply after addressing the issues mentioned above.</p>
          <a href="${FRONTEND_URL}/vendor/apply" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Reapply
          </a>
        </div>
      </div>
    `,
  }),

  loginAlert: (name, email, ip, device, location) => ({
    subject: `🔐 New Login to Your MarketStore Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0;">MarketStore</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2>New Login Detected</h2>
          <p>Hello ${name},</p>
          <p>We noticed a new login to your MarketStore account.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">📊 Login Details:</h3>
            <p><strong>📍 IP Address:</strong> ${ip}</p>
            <p><strong>💻 Device:</strong> ${device || 'Unknown'}</p>
            <p><strong>🌍 Location:</strong> ${location || 'Unknown'}</p>
            <p><strong>⏰ Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>If this was you, you can safely ignore this email.</p>
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0;"><strong>⚠️ If this wasn't you:</strong> Please secure your account immediately by changing your password.</p>
          </div>
          <a href="${FRONTEND_URL}/reset-password" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Change Password
          </a>
        </div>
      </div>
    `,
  }),

  passwordReset: (name, resetToken) => ({
    subject: `Reset Your MarketStore Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0;">MarketStore</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <a href="${FRONTEND_URL}/reset-password?token=${resetToken}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  // ... include all remaining templates exactly as in your original code
};

// =====================
// Send Email Function
// =====================
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.BREVO_EMAIL || !process.env.BREVO_SMTP_KEY) {
      console.log('📧 Email credentials not configured, skipping email');
      return { success: true, messageId: 'skipped' };
    }

    const info = await transporter.sendMail({
      from: `"MarketStore" <${process.env.BREVO_EMAIL}>`,
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
// Exported Functions
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