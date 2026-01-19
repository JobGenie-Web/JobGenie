import nodemailer from "nodemailer";
import { getBaseUrl } from "./email";

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

/**
 * Send interview invitation email to candidate
 */
export async function sendInterviewInvitationEmail(
    candidateEmail: string,
    candidateName: string,
    companyName: string,
    jobDesignation: string,
    timeSlots: Array<{ date: string; time: string }>,
    invitationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const baseUrl = getBaseUrl();
        const invitationUrl = `${baseUrl}/candidate/invitations/${invitationId}`;

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`\n====================================`);
            console.log(`[DEV] Interview Invitation Email`);
            console.log(`====================================`);
            console.log(`To: ${candidateEmail}`);
            console.log(`Candidate: ${candidateName}`);
            console.log(`Company: ${companyName}`);
            console.log(`Position: ${jobDesignation}`);
            console.log(`Invitation URL: ${invitationUrl}`);
            console.log(`====================================\n`);
            return { success: true };
        }

        const transporter = createTransporter();

        // Create deep link with login redirect
        const invitationDetailUrl = `${baseUrl}/candidate/invitations/${invitationId}`;
        const loginRedirectUrl = `${baseUrl}/login?returnUrl=${encodeURIComponent(invitationDetailUrl)}`;

        const timeSlotsHTML = timeSlots.map((slot, idx) => `
            <div style="display:flex;align-items:center;gap:8px;padding:12px;background:#f9fafb;border-radius:8px;margin-bottom:8px;">
                <span style="font-weight:600;color:#22c55e;min-width:30px;">${idx + 1}.</span>
                <span style="color:#1f2937;">${new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${slot.time}</span>
            </div>
        `).join('');

        const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);border-radius:16px 16px 0 0;">
<h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">JobGenie</h1>
<p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Find Your Perfect Career Match</p>
</td></tr>
<tr><td style="padding:40px;">
<div style="text-align:center;margin-bottom:24px;">
<div style="display:inline-block;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:50%;width:80px;height:80px;line-height:80px;">
<span style="font-size:40px;">📧</span>
</div></div>
<h2 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1f2937;text-align:center;">Interview Invitation</h2>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Hi <strong>${candidateName}</strong>,</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Great news! <strong>${companyName}</strong> is interested in interviewing you for the <strong>${jobDesignation}</strong> position.</p>
<div style="background-color:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#166534;">📅 Proposed Time Slots:</p>
${timeSlotsHTML}
</div>
<p style="margin:24px 0;font-size:16px;line-height:1.6;color:#4b5563;">Please review the invitation and select your preferred time slot.</p>
<div style="text-align:center;margin:32px 0;">
<a href="${loginRedirectUrl}" style="display:inline-block;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:600;">View Invitation</a>
</div>
</td></tr>
<tr><td style="padding:24px 40px;background-color:#f9fafb;border-radius:0 0 16px 16px;text-align:center;">
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Need help? Contact us at <a href="mailto:support@jobgenie.com" style="color:#22c55e;">support@jobgenie.com</a></p>
<p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} JobGenie. All rights reserved.</p>
</td></tr>
</table></td></tr>
</table></body></html>`;

        await transporter.sendMail({
            from: `"JobGenie" <${process.env.SMTP_USER}>`,
            to: candidateEmail,
            subject: `Interview Invitation from ${companyName} - JobGenie`,
            html,
        });

        console.log(`[EMAIL] Interview invitation sent to ${candidateEmail}`);
        return { success: true };
    } catch (error) {
        console.error("Interview invitation email error:", error);
        return { success: false, error: "Failed to send invitation email" };
    }
}

/**
 * Send interview confirmed email to candidate
 */
export async function sendInterviewConfirmedEmail(
    candidateEmail: string,
    candidateName: string,
    companyName: string,
    jobDesignation: string,
    interviewDate: string,
    interviewTime: string,
    interviewMode: string,
    meetingLinkOrAddress: string,
    invitationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const baseUrl = getBaseUrl();

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`\n====================================`);
            console.log(`[DEV] Interview Confirmed Email`);
            console.log(`====================================`);
            console.log(`To: ${candidateEmail}`);
            console.log(`Candidate: ${candidateName}`);
            console.log(`Company: ${companyName}`);
            console.log(`Date: ${interviewDate} at ${interviewTime}`);
            console.log(`====================================\n`);
            return { success: true };
        }

        const transporter = createTransporter();

        // Create deep link with login redirect
        const invitationDetailUrl = `${baseUrl}/candidate/invitations/${invitationId}`;
        const loginRedirectUrl = `${baseUrl}/login?returnUrl=${encodeURIComponent(invitationDetailUrl)}`;

        const locationHTML = interviewMode === 'online'
            ? `<p style="margin:0 0 8px;font-size:14px;color:#166534;"><strong>📹 Online Interview</strong></p>
               <p style="margin:0;font-size:14px;color:#166534;">Meeting Link: <a href="${meetingLinkOrAddress}" style="color:#22c55e;">${meetingLinkOrAddress}</a></p>`
            : `<p style="margin:0 0 8px;font-size:14px;color:#166534;"><strong>📍 Physical Interview</strong></p>
               <p style="margin:0;font-size:14px;color:#166534;">Address: ${meetingLinkOrAddress}</p>`;

        const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);border-radius:16px 16px 0 0;">
<h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">JobGenie</h1>
<p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Find Your Perfect Career Match</p>
</td></tr>
<tr><td style="padding:40px;">
<div style="text-align:center;margin-bottom:24px;">
<div style="display:inline-block;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:50%;width:80px;height:80px;line-height:80px;">
<span style="font-size:40px;">✅</span>
</div></div>
<h2 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1f2937;text-align:center;">Interview Confirmed!</h2>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Hi <strong>${candidateName}</strong>,</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Your interview with <strong>${companyName}</strong> for the <strong>${jobDesignation}</strong> position has been confirmed!</p>
<div style="background-color:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:20px;margin:24px 0;">
<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#166534;">📅 Interview Details:</p>
<p style="margin:0 0 8px;font-size:14px;color:#166534;"><strong>Date:</strong> ${new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<p style="margin:0 0 16px;font-size:14px;color:#166534;"><strong>Time:</strong> ${interviewTime}</p>
${locationHTML}
</div>
<div style="background-color:#dbeafe;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
<p style="margin:0;font-size:14px;color:#1e40af;"><strong>💡 Tip:</strong> Add this interview to your calendar and prepare your questions in advance. Good luck!</p>
</div>
<div style="text-align:center;margin:32px 0;">
<a href="${loginRedirectUrl}" style="display:inline-block;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:600;">View Details</a>
</div>
</td></tr>
<tr><td style="padding:24px 40px;background-color:#f9fafb;border-radius:0 0 16px 16px;text-align:center;">
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Need help? Contact us at <a href="mailto:support@jobgenie.com" style="color:#22c55e;">support@jobgenie.com</a></p>
<p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} JobGenie. All rights reserved.</p>
</td></tr>
</table></td></tr>
</table></body></html>`;

        await transporter.sendMail({
            from: `"JobGenie" <${process.env.SMTP_USER}>`,
            to: candidateEmail,
            subject: `Interview Confirmed with ${companyName} - JobGenie`,
            html,
        });

        console.log(`[EMAIL] Interview confirmed email sent to ${candidateEmail}`);
        return { success: true };
    } catch (error) {
        console.error("Interview confirmed email error:", error);
        return { success: false, error: "Failed to send confirmation email" };
    }
}

/**
 * Send cancellation notification to employer when candidate cancels
 */
export async function sendCandidateCancellationEmail(
    employerEmail: string,
    employerName: string,
    candidateName: string,
    jobDesignation: string,
    interviewDate: string,
    interviewTime: string,
    cancellationReason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const baseUrl = getBaseUrl();

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`\n====================================`);
            console.log(`[DEV] Candidate Cancellation Email`);
            console.log(`====================================`);
            console.log(`To: ${employerEmail}`);
            console.log(`Employer: ${employerName}`);
            console.log(`Candidate: ${candidateName}`);
            console.log(`Reason: ${cancellationReason}`);
            console.log(`====================================\n`);
            return { success: true };
        }

        const transporter = createTransporter();

        const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:16px 16px 0 0;">
<h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">JobGenie</h1>
<p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Employer Portal</p>
</td></tr>
<tr><td style="padding:40px;">
<div style="text-align:center;margin-bottom:24px;">
<div style="display:inline-block;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-radius:50%;width:80px;height:80px;line-height:80px;">
<span style="font-size:40px;">❌</span>
</div></div>
<h2 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1f2937;text-align:center;">Interview Canceled by Candidate</h2>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Hi <strong>${employerName}</strong>,</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;"><strong>${candidateName}</strong> has canceled the scheduled interview for the <strong>${jobDesignation}</strong> position.</p>
<div style="background-color:#fee2e2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:20px;margin:24px 0;">
<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#991b1b;">Interview Details:</p>
<p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><strong>Date:</strong> ${new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<p style="margin:0;font-size:14px;color:#991b1b;"><strong>Time:</strong> ${interviewTime}</p>
</div>
<div style="background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:20px;margin:24px 0;">
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#92400e;">Cancellation Reason:</p>
<p style="margin:0;font-size:15px;color:#78350f;line-height:1.6;">${cancellationReason}</p>
</div>
<div style="text-align:center;margin:32px 0;">
<a href="${baseUrl}/employer/invitations" style="display:inline-block;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:600;">View Invitations</a>
</div>
</td></tr>
<tr><td style="padding:24px 40px;background-color:#f9fafb;border-radius:0 0 16px 16px;text-align:center;">
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Need help? Contact us at <a href="mailto:support@jobgenie.com" style="color:#22c55e;">support@jobgenie.com</a></p>
<p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} JobGenie. All rights reserved.</p>
</td></tr>
</table></td></tr>
</table></body></html>`;

        await transporter.sendMail({
            from: `"JobGenie" <${process.env.SMTP_USER}>`,
            to: employerEmail,
            subject: `Interview Canceled by Candidate - JobGenie`,
            html,
        });

        console.log(`[EMAIL] Candidate cancellation email sent to ${employerEmail}`);
        return { success: true };
    } catch (error) {
        console.error("Candidate cancellation email error:", error);
        return { success: false, error: "Failed to send cancellation email" };
    }
}

/**
 * Send cancellation notification to candidate when employer cancels
 */
export async function sendEmployerCancellationEmail(
    candidateEmail: string,
    candidateName: string,
    companyName: string,
    jobDesignation: string,
    interviewDate: string,
    interviewTime: string,
    cancellationReason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const baseUrl = getBaseUrl();

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`\n====================================`);
            console.log(`[DEV] Employer Cancellation Email`);
            console.log(`====================================`);
            console.log(`To: ${candidateEmail}`);
            console.log(`Candidate: ${candidateName}`);
            console.log(`Company: ${companyName}`);
            console.log(`Reason: ${cancellationReason}`);
            console.log(`====================================\n`);
            return { success: true };
        }

        const transporter = createTransporter();

        const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);border-radius:16px 16px 0 0;">
<h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">JobGenie</h1>
<p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Find Your Perfect Career Match</p>
</td></tr>
<tr><td style="padding:40px;">
<div style="text-align:center;margin-bottom:24px;">
<div style="display:inline-block;background:linear-gradient(135deg,#fee2e2 0%,#fecaca 100%);border-radius:50%;width:80px;height:80px;line-height:80px;">
<span style="font-size:40px;">❌</span>
</div></div>
<h2 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1f2937;text-align:center;">Interview Canceled</h2>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Hi <strong>${candidateName}</strong>,</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">We're sorry to inform you that <strong>${companyName}</strong> has canceled the scheduled interview for the <strong>${jobDesignation}</strong> position.</p>
<div style="background-color:#fee2e2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:20px;margin:24px 0;">
<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#991b1b;">Interview Details:</p>
<p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><strong>Date:</strong> ${new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<p style="margin:0;font-size:14px;color:#991b1b;"><strong>Time:</strong> ${interviewTime}</p>
</div>
<div style="background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:20px;margin:24px 0;">
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#92400e;">Reason:</p>
<p style="margin:0;font-size:15px;color:#78350f;line-height:1.6;">${cancellationReason}</p>
</div>
<div style="background-color:#dbeafe;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
<p style="margin:0;font-size:14px;color:#1e40af;"><strong>💙 We're Here for You:</strong> Don't be discouraged! Keep exploring other opportunities on JobGenie.</p>
</div>
<div style="text-align:center;margin:32px 0;">
<a href="${baseUrl}/candidate/invitations" style="display:inline-block;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:600;">View Invitations</a>
</div>
</td></tr>
<tr><td style="padding:24px 40px;background-color:#f9fafb;border-radius:0 0 16px 16px;text-align:center;">
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Need help? Contact us at <a href="mailto:support@jobgenie.com" style="color:#22c55e;">support@jobgenie.com</a></p>
<p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} JobGenie. All rights reserved.</p>
</td></tr>
</table></td></tr>
</table></body></html>`;

        await transporter.sendMail({
            from: `"JobGenie" <${process.env.SMTP_USER}>`,
            to: candidateEmail,
            subject: `Interview Canceled - JobGenie`,
            html,
        });

        console.log(`[EMAIL] Employer cancellation email sent to ${candidateEmail}`);
        return { success: true };
    } catch (error) {
        console.error("Employer cancellation email error:", error);
        return { success: false, error: "Failed to send cancellation email" };
    }
}
