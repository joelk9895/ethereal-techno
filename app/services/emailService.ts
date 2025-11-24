import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const FROM_EMAIL =
  process.env.AWS_SES_FROM_EMAIL || "noreply@etherealtechno.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@etherealtechno.com";

interface SendEmailParams {
  to: string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
}: SendEmailParams) {
  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: to,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: "UTF-8",
        },
        ...(textBody && {
          Text: {
            Data: textBody,
            Charset: "UTF-8",
          },
        }),
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", response.MessageId);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Email template for applicant confirmation
export function getApplicantConfirmationEmail(artistName: string) {
  const subject = "Application Received - Ethereal Techno";

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #000000;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #0a0a0a;
            border: 1px solid #1a1a1a;
          }
          .header {
            background: linear-gradient(135deg, #00ff87 0%, #60efff 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: #000000;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .content {
            padding: 40px 30px;
            color: #ffffff;
          }
          .content h2 {
            color: #00ff87;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            margin: 15px 0;
            color: #cccccc;
          }
          .highlight {
            background-color: #1a1a1a;
            border-left: 4px solid #00ff87;
            padding: 15px 20px;
            margin: 25px 0;
          }
          .highlight p {
            margin: 5px 0;
            color: #ffffff;
          }
          .footer {
            background-color: #0a0a0a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #1a1a1a;
          }
          .footer p {
            margin: 5px 0;
            color: #666666;
            font-size: 14px;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            color: #00ff87;
            text-decoration: none;
            margin: 0 10px;
          }
          strong {
            color: #00ff87;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ETHEREAL TECHNO</h1>
          </div>
          <div class="content">
            <h2>Application Received!</h2>
            <p>Hi ${artistName},</p>
            <p>Thank you for applying to join the Ethereal Techno community of producers. We're excited to review your application!</p>
            
            <div class="highlight">
              <p><strong>What happens next?</strong></p>
              <p>• Our team will review your application within 5-7 business days</p>
              <p>• We'll carefully review your music, production abilities, and vision</p>
              <p>• You'll receive an email with our decision</p>
              <p>• If approved, you'll get access to the artist dashboard</p>
            </div>
            
            <p>We receive many applications from talented artists, and we appreciate your patience during the review process.</p>
            
            <p>If you have any questions in the meantime, feel free to reach out to us.</p>
            
            <p>Best regards,<br>
            <strong>The Ethereal Techno Team</strong></p>
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="https://etherealtechno.com">Website</a> •
              <a href="https://instagram.com/etherealtechno">Instagram</a> •
              <a href="https://soundcloud.com/etherealtechno">SoundCloud</a>
            </div>
            <p>© ${new Date().getFullYear()} Ethereal Techno. All rights reserved.</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
ETHEREAL TECHNO - Application Received

Hi ${artistName},

Thank you for applying to join the Ethereal Techno community of producers. We're excited to review your application!

What happens next?
• Our team will review your application within 5-7 business days
• We'll carefully review your music, production abilities, and vision
• You'll receive an email with our decision
• If approved, you'll get access to the artist dashboard

We receive many applications from talented artists, and we appreciate your patience during the review process.

If you have any questions in the meantime, feel free to reach out to us.

Best regards,
The Ethereal Techno Team

© ${new Date().getFullYear()} Ethereal Techno. All rights reserved.
  `;

  return { subject, htmlBody, textBody };
}

// Email template for admin notification
export function getAdminNotificationEmail(
  artistName: string,
  email: string,
  applicationId: string,
  applicationUrl: string
) {
  const subject = `New Artist Application: ${artistName}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .content h2 {
            color: #333;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 8px 0;
          }
          .info-box strong {
            color: #667eea;
            display: inline-block;
            min-width: 120px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            opacity: 0.9;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 New Artist Application</h1>
          </div>
          <div class="content">
            <h2>New Application Submitted</h2>
            <p>A new artist has submitted an application and is waiting for review.</p>
            
            <div class="info-box">
              <p><strong>Artist Name:</strong> ${artistName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>Please review the application at your earliest convenience.</p>
            
            <div style="text-align: center;">
              <a href="${applicationUrl}" class="button">Review Application →</a>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
              <strong>Note:</strong> Applicants are expecting a response within 5-7 business days.
            </p>
          </div>
          <div class="footer">
            <p>Ethereal Techno Admin Panel</p>
            <p>© ${new Date().getFullYear()} Ethereal Techno. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
NEW ARTIST APPLICATION

A new artist has submitted an application and is waiting for review.

Artist Name: ${artistName}
Email: ${email}
Application ID: ${applicationId}
Submitted: ${new Date().toLocaleString()}

Please review the application at your earliest convenience.

Review Application: ${applicationUrl}

Note: Applicants are expecting a response within 5-7 business days.

© ${new Date().getFullYear()} Ethereal Techno. All rights reserved.
  `;

  return { subject, htmlBody, textBody };
}

// Send application confirmation to applicant
export async function sendApplicationConfirmation(
  applicantEmail: string,
  artistName: string
) {
  const { subject, htmlBody, textBody } =
    getApplicantConfirmationEmail(artistName);

  return await sendEmail({
    to: [applicantEmail],
    subject,
    htmlBody,
    textBody,
  });
}

// Send notification to admin
export async function sendAdminNotification(
  artistName: string,
  applicantEmail: string,
  applicationId: string
) {
  const applicationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/admin/applications/${applicationId}`;

  const { subject, htmlBody, textBody } = getAdminNotificationEmail(
    artistName,
    applicantEmail,
    applicationId,
    applicationUrl
  );

  return await sendEmail({
    to: [ADMIN_EMAIL],
    subject,
    htmlBody,
    textBody,
  });
}
