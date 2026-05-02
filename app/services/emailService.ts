// ─────────────────────────────────────────────────────
// Brevo Email Service — reusable across the application
// ─────────────────────────────────────────────────────

const BREVO_API_KEY = () => process.env.BREVO_API_KEY || "";
const PROXY_TOKEN = () => process.env.PROXY_TOKEN || "";
const PROXY_BASE = "https://proxy.etherealtechno.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@etherealtechno.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LOGO_URL = "https://ethereal-misc.s3.eu-west-1.amazonaws.com/Ethereal-Techno-Logo.png";


interface SendEmailParams {
  to: string | string[];
  subject: string;
  htmlContent: string;
  tags?: string[];
  sender?: { name: string; email: string };
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


export async function sendEmail({ to, subject, htmlContent, tags, sender }: SendEmailParams) {
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
      cache: "no-store",
      keepalive: true,
      headers: {
        "api-key": apiKey,
        "X-Proxy-Token": proxyToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: tags && tags.includes("artist-messaging") && sender
          ? sender
          : (sender || { name: "Ethereal Techno", email: "noreply@etherealtechno.com" }),
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

// ─── Templates for Artist Messaging ──────────────────

export const artistMessageEmail = (artistName: string, senderName: string, senderUsername: string, messageBody: string) => emailLayout(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 20px;font-weight:700;letter-spacing:-0.5px;">New Message</h2>
    <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">Hi ${artistName},</p>
    <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">
        <strong style="color:#ffffff;">${senderName}</strong> (@${senderUsername}) sent you a secure message:
    </p>
    
    <div style="background:#0a0a0a;border:1px solid #1f1f22;padding:24px;border-radius:8px;margin:32px 0;white-space:pre-wrap;color:#e4e4e7;font-size:15px;line-height:1.7;">
        ${messageBody}
    </div>
    
    <div style="margin:40px 0 20px;">
        <p style="color:#a1a1aa;font-size:14px;margin-bottom:20px;">To reply, visit their profile on Ethereal Techno:</p>
        <a href="${APP_URL}/artist/${senderUsername}" style="display:inline-block;background:#ffffff;color:#000000;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;">View Profile to Reply</a>
    </div>
    <p style="color:#52525b;font-size:12px;margin-top:40px;">This message was sent securely via Ethereal Techno. Your email address is protected.</p>
`);

export async function sendArtistMessageEmail(
  toEmail: string,
  artistName: string,
  senderName: string,
  senderUsername: string,
  subject: string,
  messageBody: string
) {
  return sendEmail({
    to: toEmail,
    subject: `New message from ${senderName}`,
    htmlContent: artistMessageEmail(artistName, senderName, senderUsername, messageBody),
    tags: ["artist-messaging"],
    sender: { name: senderName, email: `${senderUsername}@etherealtechno.com` },
  });
}

// ─── Templates for Forgot Password ───────────────────

export const resetPasswordEmail = (name: string, otp: string) => emailLayout(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 20px;font-weight:700;letter-spacing:-0.5px;text-align:center;">Reset Password</h2>
    <p style="color:#a1a1aa;font-size:15px;line-height:1.6;text-align:center;margin-bottom:32px;">
        We received a request to reset your Ethereal Techno password.<br>Enter the following verification code to proceed:
    </p>
    
    <div style="text-align:center;margin:32px 0;">
        <div style="display:inline-block;background:#0a0a0a;border:1px solid #27272a;border-radius:12px;padding:24px 48px;">
            <span style="font-size:40px;font-weight:700;letter-spacing:16px;color:#ffffff;font-family:'Courier New',monospace;">${otp}</span>
        </div>
    </div>
    
    <p style="color:#52525b;font-size:13px;line-height:1.6;text-align:center;margin-top:40px;">
        This code expires in 2 minutes. If you did not request this, you can safely ignore this email.
    </p>
`);

export async function sendResetPasswordEmail(toEmail: string, name: string, otp: string) {
  return sendEmail({
    to: toEmail,
    subject: "Reset your Ethereal Techno password",
    htmlContent: resetPasswordEmail(name, otp),
    tags: ["forgot-password"],
  });
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
      cache: "no-store",
      keepalive: true,
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
<body style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#000000;">
        <tr>
            <td align="center" style="padding:60px 20px;">
                <table role="presentation" style="max-width:600px;width:100%;border:1px solid #1f1f22;background-color:#09090b;border-radius:12px;overflow:hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color:#040405;border-bottom:1px solid #1f1f22;padding:40px 20px;text-align:center;">
                            <img src="${LOGO_URL}" alt="Ethereal Techno" width="160" style="display:block;margin:0 auto;filter:brightness(1.2);" />
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:48px 40px;color:#ffffff;">
                            ${body}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:32px 40px;text-align:center;border-top:1px solid #1f1f22;background-color:#040405;">
                            <p style="margin:0 0 16px;">
                                <a href="https://etherealtechno.com" style="color:#a1a1aa;text-decoration:none;margin:0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Website</a>
                                <span style="color:#27272a;">|</span>
                                <a href="https://instagram.com/etherealtechno" style="color:#a1a1aa;text-decoration:none;margin:0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Instagram</a>
                                <span style="color:#27272a;">|</span>
                                <a href="https://soundcloud.com/etherealtechno" style="color:#a1a1aa;text-decoration:none;margin:0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">SoundCloud</a>
                            </p>
                            <p style="color:#52525b;font-size:11px;margin:0;line-height:1.5;">© ${new Date().getFullYear()} Ethereal Techno. All rights reserved.<br>London, United Kingdom</p>
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

/** Sent to a new regular user upons successful signup */
export const welcomeEmail = () => emailLayout(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;">Welcome to Ethereal Techno.</h2>
    <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">Your account is now active.</p>
    <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:32px;">You can explore our sound libraries, access your dashboard, and manage your profile.<br>Producers may also apply to join the Circle.</p>
    
    <div style="margin:40px 0 20px;">
        <a href="https://ethereal-techno.com/signin" style="display:inline-block;background:#ffffff;color:#000000;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;">👉 Access your account</a>
    </div>
`);

export async function sendWelcomeEmail(toEmail: string, _name?: string) {
  return sendEmail({
    to: toEmail,
    subject: "Welcome to Ethereal Techno",
    htmlContent: welcomeEmail(),
    tags: ["welcome-email"],
    sender: { name: "Ethereal Techno", email: "noreply@etherealtechno.com" },
  });
}

/** Sent to a user confirming account deletion */
export const accountDeletionEmail = (name: string) => emailLayout(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;">Account deletion confirmed</h2>
    <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">Hi ${name},</p>
    <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">Your account has now been deleted.</p>
    <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">We’re sorry to see you go, but we respect your decision.</p>
    <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">If you ever wish to return, you’re always welcome to join Ethereal Techno again.</p>
    <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">For any questions, you can contact us anytime at support@etherealtechno.com.</p>
    <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-top:32px;">Best regards,<br><strong style="color:#ffffff;">Ethereal Techno</strong></p>
`);

export async function sendAccountDeletionEmail(toEmail: string, name: string) {
  return sendEmail({
    to: toEmail,
    subject: "Account deletion confirmed",
    htmlContent: accountDeletionEmail(name),
    tags: ["account-deletion"],
    sender: { name: "Ethereal Techno", email: "noreply@etherealtechno.com" },
  });
}

/** Sent to applicant when their Circle application is submitted */
export function applicationConfirmationEmail(artistName: string): EmailContent {
  return {
    subject: "Application Received — Ethereal Techno",
    tags: ["application-confirmation"],
    htmlContent: emailLayout(`
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;">Application Received</h2>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">Hi ${artistName},</p>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">Thank you for applying to join the Ethereal Techno community of producers. We're excited to review your application.</p>
            
            <div style="background:#0a0a0a;border:1px solid #1f1f22;padding:24px;border-radius:8px;margin:32px 0;">
                <p style="color:#ffffff;margin:0 0 16px;font-weight:600;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;">What happens next?</p>
                <p style="color:#a1a1aa;font-size:14px;margin:8px 0;">• Our team will review your application within 5–7 business days.</p>
                <p style="color:#a1a1aa;font-size:14px;margin:8px 0;">• We carefully review your music, production abilities, and vision.</p>
                <p style="color:#a1a1aa;font-size:14px;margin:8px 0;">• You'll receive an email with our decision.</p>
                <p style="color:#a1a1aa;font-size:14px;margin:8px 0;">• If approved, you'll get immediate access to the artist dashboard.</p>
            </div>
            
            <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">We receive many applications from talented artists, and we appreciate your patience during the review process.</p>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-top:32px;">Best regards,<br><strong style="color:#ffffff;">The Ethereal Techno Team</strong></p>
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
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;">Action Required: New Application</h2>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">A new artist has submitted an application and is waiting for review.</p>
            
            <div style="background:#0a0a0a;border:1px solid #1f1f22;padding:24px;border-radius:8px;margin:32px 0;">
                <p style="color:#d4d4d8;margin:12px 0;font-size:14px;"><strong style="color:#ffffff;min-width:120px;display:inline-block;text-transform:uppercase;font-size:12px;letter-spacing:1px;">Artist Name:</strong> ${artistName}</p>
                <p style="color:#d4d4d8;margin:12px 0;font-size:14px;"><strong style="color:#ffffff;min-width:120px;display:inline-block;text-transform:uppercase;font-size:12px;letter-spacing:1px;">Email:</strong> ${applicantEmail}</p>
                <p style="color:#d4d4d8;margin:12px 0;font-size:14px;font-family:monospace;"><strong style="color:#ffffff;min-width:120px;display:inline-block;font-family:sans-serif;text-transform:uppercase;font-size:12px;letter-spacing:1px;">Application ID:</strong> ${applicationId}</p>
                <p style="color:#d4d4d8;margin:12px 0;font-size:14px;"><strong style="color:#ffffff;min-width:120px;display:inline-block;text-transform:uppercase;font-size:12px;letter-spacing:1px;">Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="text-align:center;margin:40px 0;">
                <a href="${applicationUrl}" style="display:inline-block;background:#ffffff;color:#000000;padding:12px 32px;text-decoration:none;border-radius:4px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Review Application</a>
            </div>
            <p style="color:#52525b;font-size:12px;margin-top:40px;text-align:center;">Applicants are expecting a response within 5–7 business days.</p>
        `),
  };
}

/** Sent to applicant when their application is approved */
export function applicationApprovedEmail(artistName: string): EmailContent {
  return {
    subject: "Welcome to the Circle — Ethereal Techno",
    tags: ["application-approved"],
    htmlContent: emailLayout(`
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;">Welcome to the Circle</h2>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">Hi ${artistName},</p>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">We're thrilled to let you know that your application to join Ethereal Techno has been <strong style="color:#ffffff;">approved</strong>.</p>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:32px;">You now have access to the full artist dashboard, where you can configure your identity, manage tracks, and connect with the community.</p>
            
            <div style="text-align:center;margin:40px 0;">
                <a href="${APP_URL}/dashboard/producer" style="display:inline-block;background:#ffffff;color:#000000;padding:12px 32px;text-decoration:none;border-radius:4px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Access Dashboard</a>
            </div>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-top:40px;">Welcome aboard,<br><strong style="color:#ffffff;">The Ethereal Techno Team</strong></p>
        `),
  };
}

/** Sent to applicant when their application is rejected */
export function applicationRejectedEmail(artistName: string): EmailContent {
  return {
    subject: "Application Update — Ethereal Techno",
    tags: ["application-rejected"],
    htmlContent: emailLayout(`
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;">Application Update</h2>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">Hi ${artistName},</p>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-bottom:24px;">Thank you for your interest in joining Ethereal Techno.</p>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:24px;">After careful review, our curation team was unable to approve your application at this time.</p>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:32px;">We encourage you to continue developing your artistic direction. You are welcome to apply again in the future as your sound evolves to align with the Ethereal Techno vision.</p>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin-top:40px;">Best regards,<br><strong style="color:#ffffff;">The Ethereal Techno Team</strong></p>
        `),
  };
}

/** Waitlist welcome email */
export function waitlistWelcomeEmail(): EmailContent {
  return {
    subject: "You're on the waitlist!",
    tags: ["waitlist-welcome"],
    htmlContent: emailLayout(`
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;text-align:center;">You're on the waitlist</h2>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;text-align:center;margin-bottom:24px;">You have successfully joined the priority access waitlist for Ethereal Techno.</p>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.6;text-align:center;">We'll keep you posted with exclusive updates as we approach our rollout. Stay tuned.</p>
        `),
  };
}

/** OTP verification email for signup */
export function otpVerificationEmail(name: string, otp: string): EmailContent {
  return {
    subject: "Your Verification Code — Ethereal Techno",
    tags: ["otp-verification"],
    htmlContent: emailLayout(`
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 24px;font-weight:700;letter-spacing:-0.5px;text-align:center;">Verify Your Access</h2>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;text-align:center;margin-bottom:32px;">
                Hi ${name},<br>Use the code below to verify your identity and access your account.
            </p>
            
            <div style="text-align:center;margin:32px 0;">
                <div style="display:inline-block;background:#0a0a0a;border:1px solid #27272a;border-radius:12px;padding:24px 48px;">
                    <span style="font-size:40px;font-weight:700;letter-spacing:16px;color:#ffffff;font-family:'Courier New',monospace;">${otp}</span>
                </div>
            </div>
            
            <p style="color:#52525b;font-size:13px;line-height:1.6;text-align:center;margin-top:40px;">
                This code expires in 10 minutes. If you did not request this, you can safely ignore this email.
            </p>
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


export async function sendApplicationConfirmation(applicantEmail: string, artistName: string) {
  const email = applicationConfirmationEmail(artistName);
  return sendEmail({ to: applicantEmail, ...email });
}

export async function sendAdminNotification(
  artistName: string,
  applicantEmail: string,
  applicationId: string
) {
  const email = adminApplicationNotificationEmail(artistName, applicantEmail, applicationId);
  return sendEmail({ to: ADMIN_EMAIL, ...email });
}

export async function sendApprovalNotification(applicantEmail: string, artistName: string) {
  const email = applicationApprovedEmail(artistName);
  return sendEmail({ to: applicantEmail, ...email });
}
export async function sendRejectionNotification(applicantEmail: string, artistName: string) {
  const email = applicationRejectedEmail(artistName);
  return sendEmail({ to: applicantEmail, ...email });
}

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
