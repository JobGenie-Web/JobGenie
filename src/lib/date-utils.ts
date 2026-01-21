import { format, parseISO, isValid } from "date-fns";

/**
 * Formats a UTC date and time string into a local time string.
 * @param dateStr The date string (e.g., "2024-01-20" or ISO string)
 * @param timeStr The time string (e.g., "14:30" or "14:30:00")
 * @param formatStr Optional format string (default: "h:mm a")
 * @returns Formatted local time string
 */
export function formatUTCTime(dateStr: string, timeStr: string, formatStr: string = "h:mm a"): string {
    try {
        if (!dateStr || !timeStr) return "";

        const cleanDate = dateStr.toString().trim();
        const cleanTime = timeStr.toString().trim();

        // Normalize date part: take YYYY-MM-DD
        const datePart = cleanDate.includes('T') ? cleanDate.split('T')[0] : cleanDate;

        // Construct a UTC ISO string:
        // Ensure time part doesn't have spaces or AM/PM causing ISO parse failure
        // If time is "4:30 PM", this naive ISO construction will fail.
        // For now, let's assume it's roughly ISO-compatible.
        const utcIsoString = `${datePart}T${cleanTime}Z`;

        const date = parseISO(utcIsoString);

        if (!isValid(date)) {
            // console.warn("formatUTCTime: Invalid date constructed from:", utcIsoString);
            return cleanTime; // Fallback
        }

        return format(date, formatStr);
    } catch (error) {
        console.error("Error formatting time:", error);
        return timeStr; // Fallback to original string
    }
}

/**
 * Formats a date string to a standarad local date format.
 * @param dateStr Date string or Date object
 * @param formatStr Format string (default: "MMM d, yyyy")
 */
export function formatDate(dateStr: string | Date, formatStr: string = "MMM d, yyyy"): string {
    try {
        if (!dateStr) return "";
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return format(date, formatStr);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "";
    }
}
