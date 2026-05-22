import { Resend } from "resend";

/**
 * Shared Resend client instance
 * Configure RESEND_API_KEY in .env.local
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Default FROM email address
 * Configure EMAIL_FROM in .env.local
 */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@jobgenie.com";
