import nodemailer from "nodemailer";

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate verification code expiry time (15 minutes from now)
 * Returns both local ISO string (for storage) and milliseconds (for comparison)
 */
export function getVerificationExpiry(): { isoString: string; timestamp: number } {
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Format as local time string (without 'Z' suffix) for PostgreSQL timestamp without timezone
    const localISOString = expiryDate.getFullYear() + '-' +
        String(expiryDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(expiryDate.getDate()).padStart(2, '0') + 'T' +
        String(expiryDate.getHours()).padStart(2, '0') + ':' +
        String(expiryDate.getMinutes()).padStart(2, '0') + ':' +
        String(expiryDate.getSeconds()).padStart(2, '0');

    return {
        isoString: localISOString,
        timestamp: expiryDate.getTime()
    };
}

/**
 * Create NodeMailer transporter
 * Configure SMTP settings in .env file:
 * - SMTP_HOST (e.g., smtp.gmail.com)
 * - SMTP_PORT (e.g., 587)
 * - SMTP_USER (your email)
 * - SMTP_PASS (your app password)
 */
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

/**
 * Generate JobGenie themed HTML email template
 */
function getVerificationEmailTemplate(firstName: string, code: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - JobGenie</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                                JobGenie
                            </h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                                Find Your Perfect Career Match
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1f2937;">
                                Verify Your Email
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                Hi <strong>${firstName}</strong>,
                            </p>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                Thank you for registering with JobGenie! Please use the verification code below to complete your registration:
                            </p>
                            
                            <!-- Verification Code Box -->
                            <div style="text-align: center; margin: 32px 0;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 24px 48px;">
                                    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">
                                        Your Verification Code
                                    </p>
                                    <p style="margin: 0; font-size: 40px; font-weight: 700; color: #15803d; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                        ${code}
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Expiry Notice -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0;">
                                <p style="margin: 0; font-size: 14px; color: #92400e;">
                                    <strong>⏰ Important:</strong> This code will expire in <strong>15 minutes</strong>.
                                </p>
                            </div>
                            
                            <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                                If you didn't create an account with JobGenie, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                                Need help? Contact us at <a href="mailto:support@jobgenie.com" style="color: #22c55e; text-decoration: none;">support@jobgenie.com</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                © ${new Date().getFullYear()} JobGenie. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Security Notice -->
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 24px;">
                    <tr>
                        <td style="text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                                🔒 This is an automated message from JobGenie. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Send verification email using NodeMailer
 */
export async function sendVerificationEmail(
    email: string,
    code: string,
    firstName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if SMTP is configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`[DEV] Verification code for ${email}: ${code}`);
            console.log("[DEV] SMTP not configured. Set SMTP_USER and SMTP_PASS in .env to send actual emails.");
            return { success: true };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"JobGenie" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your Email - JobGenie",
            html: getVerificationEmailTemplate(firstName, code),
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Verification email sent to ${email}`);

        return { success: true };
    } catch (error) {
        console.error("Email sending error:", error);
        return {
            success: false,
            error: "Failed to send verification email",
        };
    }
}

/**
 * Mask email for display (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");
    if (!domain) return email;
    if (localPart.length <= 2) {
        return `${localPart[0]}***@${domain}`;
    }
    return `${localPart[0]}${localPart[1]}***@${domain}`;
}
