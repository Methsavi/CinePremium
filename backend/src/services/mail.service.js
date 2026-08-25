import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporterPromise = null;

async function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  // 1. If explicit SMTP host is given
  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // 2. If Gmail user & app password are provided
  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // 3. Fallback: Ethereal test inbox / local transport
  try {
    if (!transporterPromise) {
      transporterPromise = nodemailer.createTestAccount().then((testAccount) => {
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      });
    }
    return await transporterPromise;
  } catch (err) {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

export const MailService = {
  /**
   * Send 6-Digit Email Verification Code
   */
  async sendVerificationEmail(toEmail, userName, code) {
    try {
      const transporter = await getTransporter();
      const sender = process.env.EMAIL_FROM || '"CinePremium Security" <no-reply@cinepremium.lk>';

      const info = await transporter.sendMail({
        from: sender,
        to: toEmail,
        subject: `[CinePremium] Your 6-Digit Email Verification Code: ${code}`,
        text: `Hello ${userName || 'Moviegoer'},\n\nYour 6-digit email verification code for CinePremium is: ${code}\n\nThis code will expire in 24 hours.\n\nThank you,\nCinePremium Team`,
        html: `
          <div style="background-color: #09090b; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #121216; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <tr>
                <td style="padding: 30px; text-align: center; background: linear-gradient(180deg, rgba(220, 38, 38, 0.15) 0%, transparent 100%);">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    Cine<span style="color: #ef4444;">Premium</span>
                  </h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">The Ultimate Cinematic Experience</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 32px 32px; text-align: center;">
                  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 12px;">Verify Your Email Address</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
                    Hello <strong>${userName || 'Moviegoer'}</strong>, thank you for registering with CinePremium. Please enter the following 6-digit verification code to activate your account:
                  </p>
                  
                  <div style="background-color: #09090b; border: 1px dashed #ef4444; border-radius: 12px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ffffff;">
                      ${code}
                    </span>
                  </div>

                  <p style="font-size: 12px; color: #71717a; margin: 0 0 16px 0;">
                    This verification code is valid for 24 hours. If you did not create a CinePremium account, please ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #09090b; padding: 20px; text-align: center; border-top: 1px solid #27272a;">
                  <p style="margin: 0; font-size: 11px; color: #52525b;">
                    © 2026 CinePremium Cinema Systems. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        `,
      });

      console.log(`[MailService] Verification email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`[MailService] Preview verification email: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[MailService] Failed to send verification email to ${toEmail}:`, error.message);
      // Fail gracefully so registration still succeeds
      return { success: false, error: error.message };
    }
  },

  /**
   * Send 6-Digit Password Reset OTP
   */
  async sendPasswordResetEmail(toEmail, userName, otp) {
    try {
      const transporter = await getTransporter();
      const sender = process.env.EMAIL_FROM || '"CinePremium Security" <no-reply@cinepremium.lk>';

      const info = await transporter.sendMail({
        from: sender,
        to: toEmail,
        subject: `[CinePremium] Your Password Reset OTP: ${otp}`,
        text: `Hello ${userName || 'User'},\n\nYour 6-digit password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you did not request a password reset, please secure your account immediately.\n\nThank you,\nCinePremium Team`,
        html: `
          <div style="background-color: #09090b; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #121216; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <tr>
                <td style="padding: 30px; text-align: center; background: linear-gradient(180deg, rgba(220, 38, 38, 0.15) 0%, transparent 100%);">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    Cine<span style="color: #ef4444;">Premium</span>
                  </h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">Security & Authentication Alert</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 32px 32px; text-align: center;">
                  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 12px;">Password Reset Request</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
                    Hello <strong>${userName || 'User'}</strong>, we received a request to reset your CinePremium account password. Enter the 6-digit OTP code below to proceed:
                  </p>
                  
                  <div style="background-color: #09090b; border: 1px dashed #ef4444; border-radius: 12px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ef4444;">
                      ${otp}
                    </span>
                  </div>

                  <p style="font-size: 12px; color: #ef4444; margin: 0 0 16px 0; font-weight: 600;">
                    ⏰ This OTP is strictly valid for 10 minutes.
                  </p>
                  <p style="font-size: 12px; color: #71717a; margin: 0;">
                    If you did not request this password reset, please ignore this message. Your account remains safe.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #09090b; padding: 20px; text-align: center; border-top: 1px solid #27272a;">
                  <p style="margin: 0; font-size: 11px; color: #52525b;">
                    © 2026 CinePremium Cinema Systems. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        `,
      });

      console.log(`[MailService] Password reset OTP dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`[MailService] Preview password reset email: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[MailService] Failed to send password reset OTP to ${toEmail}:`, error.message);
      return { success: false, error: error.message };
    }
  },
};
