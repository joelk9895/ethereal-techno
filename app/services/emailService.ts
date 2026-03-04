// ─────────────────────────────────────────────────────
// Brevo Email Service — reusable across the application
// ─────────────────────────────────────────────────────

const BREVO_API_KEY = () => process.env.BREVO_API_KEY || "";
const PROXY_TOKEN = () => process.env.PROXY_TOKEN || "";
const PROXY_BASE = "https://proxy.etherealtechno.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@etherealtechno.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LOGO_URL = "https://ethereal-misc.s3.eu-west-1.amazonaws.com/Ethereal-Techno-Logo.png";

// ─── Types ───────────────────────────────────────────

interface SendEmailParams {
  to: string | string[];
  subject: string;
  htmlContent: string;
  tags?: string[];
}

interface ContactParams {
  email: string;
  listIds?: number[];
  attributes?: Record<string, unknown>;
}

interface EmailContent {
  subject: string;
  htmlContent: string;
  tags?: string[];
}

// ─── Core: Send Email ────────────────────────────────

export async function sendEmail({ to, subject, htmlContent, tags }: SendEmailParams) {
  const apiKey = BREVO_API_KEY();
  const proxyToken = PROXY_TOKEN();

  if (!apiKey || !proxyToken) {
    console.error("Email service: Missing BREVO_API_KEY or PROXY_TOKEN");
    return { success: false, error: "Configuration error" };
  }

  const recipients = Array.isArray(to) ? to.map((e) => ({ email: e })) : [{ email: to }];

  try {
    const res = await fetch(`${PROXY_BASE}/v3/smtp/email`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "X-Proxy-Token": proxyToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Ethereal Techno", email: "noreply@etherealtechno.com" },
        to: recipients,
        subject,
        htmlContent,
        ...(tags && { tags }),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Brevo send email error:", errText);
      return { success: false, error: errText };
    }

    const data = res.status === 204 ? null : await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: String(error) };
  }
}

// ─── Core: Add / Update Contact ──────────────────────

export async function addOrUpdateContact({ email, listIds = [], attributes = {} }: ContactParams) {
  const apiKey = BREVO_API_KEY();
  const proxyToken = PROXY_TOKEN();

  if (!apiKey || !proxyToken) {
    console.error("Email service: Missing BREVO_API_KEY or PROXY_TOKEN");
    return { success: false, error: "Configuration error" };
  }

  try {
    const res = await fetch(`${PROXY_BASE}/v3/contacts`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "X-Proxy-Token": proxyToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds,
        updateEnabled: true,
        attributes,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Brevo contact error:", errText);
      return { success: false, error: errText };
    }

    const data = res.status === 204 ? null : await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("Contact service error:", error);
    return { success: false, error: String(error) };
  }
}

// ─── Shared Layout ───────────────────────────────────

function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" style="max-width:600px;width:100%;border:1px solid #1a1a1a;background-color:#111111;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#00ff87 0%,#60efff 100%);padding:30px 20px;text-align:center;">
                            <img src="${LOGO_URL}" alt="Ethereal Techno" width="140" style="display:block;margin:0 auto;" />
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px 30px;color:#ffffff;">
                            ${body}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:25px 30px;text-align:center;border-top:1px solid #1a1a1a;">
                            <p style="margin:5px 0;">
                                <a href="https://etherealtechno.com" style="color:#00ff87;text-decoration:none;margin:0 8px;font-size:13px;">Website</a> •
                                <a href="https://instagram.com/etherealtechno" style="color:#00ff87;text-decoration:none;margin:0 8px;font-size:13px;">Instagram</a> •
                                <a href="https://soundcloud.com/etherealtechno" style="color:#00ff87;text-decoration:none;margin:0 8px;font-size:13px;">SoundCloud</a>
                            </p>
                            <p style="color:#555;font-size:12px;margin:10px 0 0;">© ${new Date().getFullYear()} Ethereal Techno. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// ─── Templates ───────────────────────────────────────

/** Sent to applicant when their Circle application is submitted */
export function applicationConfirmationEmail(artistName: string): EmailContent {
  return {
    subject: "Application Received — Ethereal Techno",
    tags: ["application-confirmation"],
    htmlContent: emailLayout(`
            <h2 style="color:#00ff87;font-size:24px;margin:0 0 20px;">Application Received!</h2>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Hi ${artistName},</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Thank you for applying to join the Ethereal Techno community of producers. We're excited to review your application!</p>
            <div style="background:#1a1a1a;border-left:4px solid #00ff87;padding:15px 20px;margin:25px 0;">
                <p style="color:#fff;margin:5px 0;"><strong style="color:#00ff87;">What happens next?</strong></p>
                <p style="color:#ccc;margin:5px 0;">• Our team will review your application within 5–7 business days</p>
                <p style="color:#ccc;margin:5px 0;">• We'll carefully review your music, production abilities, and vision</p>
                <p style="color:#ccc;margin:5px 0;">• You'll receive an email with our decision</p>
                <p style="color:#ccc;margin:5px 0;">• If approved, you'll get access to the artist dashboard</p>
            </div>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">We receive many applications from talented artists, and we appreciate your patience during the review process.</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Best regards,<br><strong style="color:#00ff87;">The Ethereal Techno Team</strong></p>
        `),
  };
}

/** Sent to admin when a new Circle application arrives */
export function adminApplicationNotificationEmail(
  artistName: string,
  applicantEmail: string,
  applicationId: string
): EmailContent {
  const applicationUrl = `${APP_URL}/admin/applications/${applicationId}`;
  return {
    subject: `New Artist Application: ${artistName}`,
    tags: ["admin-notification"],
    htmlContent: emailLayout(`
            <h2 style="color:#00ff87;font-size:24px;margin:0 0 20px;">🎵 New Application</h2>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">A new artist has submitted an application and is waiting for review.</p>
            <div style="background:#1a1a1a;border-left:4px solid #00ff87;padding:15px 20px;margin:25px 0;">
                <p style="color:#ccc;margin:8px 0;"><strong style="color:#00ff87;min-width:120px;display:inline-block;">Artist Name:</strong> ${artistName}</p>
                <p style="color:#ccc;margin:8px 0;"><strong style="color:#00ff87;min-width:120px;display:inline-block;">Email:</strong> ${applicantEmail}</p>
                <p style="color:#ccc;margin:8px 0;"><strong style="color:#00ff87;min-width:120px;display:inline-block;">Application ID:</strong> ${applicationId}</p>
                <p style="color:#ccc;margin:8px 0;"><strong style="color:#00ff87;min-width:120px;display:inline-block;">Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align:center;margin:30px 0;">
                <a href="${applicationUrl}" style="display:inline-block;background:linear-gradient(135deg,#00ff87 0%,#60efff 100%);color:#000;padding:14px 28px;text-decoration:none;border-radius:25px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Review Application →</a>
            </div>
            <p style="color:#666;font-size:13px;margin-top:30px;"><strong>Note:</strong> Applicants are expecting a response within 5–7 business days.</p>
        `),
  };
}

/** Sent to applicant when their application is approved */
export function applicationApprovedEmail(artistName: string): EmailContent {
  return {
    subject: "Welcome to the Circle — Ethereal Techno",
    tags: ["application-approved"],
    htmlContent: emailLayout(`
            <h2 style="color:#00ff87;font-size:24px;margin:0 0 20px;">Welcome to the Circle!</h2>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Hi ${artistName},</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">We're thrilled to let you know that your application to join the Ethereal Techno Circle has been <strong style="color:#00ff87;">approved</strong>!</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">You now have access to the full artist dashboard, where you can customize your profile, connect with the community, and showcase your work.</p>
            <div style="text-align:center;margin:30px 0;">
                <a href="${APP_URL}/dashboard/producer" style="display:inline-block;background:linear-gradient(135deg,#00ff87 0%,#60efff 100%);color:#000;padding:14px 28px;text-decoration:none;border-radius:25px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Go to Dashboard →</a>
            </div>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Welcome aboard.<br><strong style="color:#00ff87;">The Ethereal Techno Team</strong></p>
        `),
  };
}

/** Sent to applicant when their application is rejected */
export function applicationRejectedEmail(artistName: string): EmailContent {
  return {
    subject: "Application Update — Ethereal Techno",
    tags: ["application-rejected"],
    htmlContent: emailLayout(`
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 20px;">Application Update</h2>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Hi ${artistName},</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Thank you for your interest in joining the Ethereal Techno Circle.</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">After careful review, we were unable to approve your application at this time.</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">We encourage you to continue developing your artistic direction and apply again in the future when you feel your work aligns closely with the Ethereal Techno aesthetic.</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Best regards,<br><strong style="color:#00ff87;">The Ethereal Techno Team</strong></p>
        `),
  };
}

/** Waitlist welcome email */
export function waitlistWelcomeEmail(): EmailContent {
  return {
    subject: "You're on the waitlist!",
    tags: ["waitlist-welcome"],
    htmlContent: emailLayout(`
            <h2 style="color:#00ff87;font-size:24px;margin:0 0 20px;">You're on the waitlist!</h2>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">You have successfully joined the waitlist for Ethereal Techno.</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">We'll keep you posted with updates as we approach early access. Stay tuned!</p>
        `),
  };
}

/** OTP verification email for signup */
export function otpVerificationEmail(name: string, otp: string): EmailContent {
  return {
    subject: "Your Verification Code — Ethereal Techno",
    tags: ["otp-verification"],
    htmlContent: emailLayout(`
            <h2 style="color:#00ff87;font-size:24px;margin:0 0 20px;">Verify Your Email</h2>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Hi ${name},</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;">Use the code below to verify your email address and complete your registration.</p>
            <div style="text-align:center;margin:30px 0;">
                <div style="display:inline-block;background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px 40px;">
                    <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#00ff87;font-family:'Courier New',monospace;">${otp}</span>
                </div>
            </div>
            <p style="color:#888;font-size:14px;line-height:1.6;">This code expires in <strong style="color:#fff;">10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
            <p style="color:#ccc;font-size:16px;line-height:1.6;margin-top:20px;">— <strong style="color:#00ff87;">The Ethereal Techno Team</strong></p>
        `),
  };
}

/** Generic email — pass your own subject, body HTML, and optional tags */
export function genericEmail(subject: string, bodyHtml: string, tags?: string[]): EmailContent {
  return {
    subject,
    tags,
    htmlContent: emailLayout(bodyHtml),
  };
}

// ─── Convenience Helpers ─────────────────────────────

/** Send application confirmation to the applicant */
export async function sendApplicationConfirmation(applicantEmail: string, artistName: string) {
  const email = applicationConfirmationEmail(artistName);
  return sendEmail({ to: applicantEmail, ...email });
}

/** Send notification to admin about a new application */
export async function sendAdminNotification(
  artistName: string,
  applicantEmail: string,
  applicationId: string
) {
  const email = adminApplicationNotificationEmail(artistName, applicantEmail, applicationId);
  return sendEmail({ to: ADMIN_EMAIL, ...email });
}

/** Send approval notification to the applicant */
export async function sendApprovalNotification(applicantEmail: string, artistName: string) {
  const email = applicationApprovedEmail(artistName);
  return sendEmail({ to: applicantEmail, ...email });
}

/** Send rejection notification to the applicant */
export async function sendRejectionNotification(applicantEmail: string, artistName: string) {
  const email = applicationRejectedEmail(artistName);
  return sendEmail({ to: applicantEmail, ...email });
}

/** Send OTP verification email */
export async function sendOtpEmail(recipientEmail: string, name: string, otp: string) {
  const email = otpVerificationEmail(name, otp);
  return sendEmail({ to: recipientEmail, ...email });
}

/** Send waitlist confirmation email and add contact to list */
export async function sendWaitlistWelcome(
  email: string,
  attributes?: Record<string, unknown>
) {
  // Determine lists
  const listIds: number[] = [];
  const isProducer = attributes?.IS_PRODUCER;
  const isFan = attributes?.IS_FAN;
  if (isProducer) listIds.push(20);
  if (isFan) listIds.push(21);
  if (listIds.length === 0) listIds.push(21);

  // Add/update contact
  const contactResult = await addOrUpdateContact({ email, listIds, attributes });

  // Send welcome email
  const emailContent = waitlistWelcomeEmail();
  const emailResult = await sendEmail({ to: email, ...emailContent });

  return {
    success: contactResult.success && emailResult.success,
    contact: contactResult,
    email: emailResult,
    listIds,
  };
}
