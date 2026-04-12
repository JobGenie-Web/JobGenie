import { format, parse, isValid } from "date-fns";

function parseTimeString(timeStr: string) {
    const normalized = timeStr.toString().trim();
    const formats = ["H:mm", "HH:mm", "h:mm a", "hh:mm a"];

    for (const formatStr of formats) {
        const parsed = parse(normalized, formatStr, new Date());
        if (isValid(parsed)) {
            return parsed;
        }
    }

    return null;
}

function createUTCDateFromParts(datePart: string, timePart?: string): Date | null {
    if (!datePart) return null;

    const [year, month, day] = datePart.split('-').map(Number);
    if ([year, month, day].some((value) => Number.isNaN(value))) return null;

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (timePart) {
        const parsedTime = parseTimeString(timePart);
        if (!parsedTime) return null;

        hours = parsedTime.getHours();
        minutes = parsedTime.getMinutes();
        seconds = parsedTime.getSeconds();
    }

    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
}

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
        const datePart = cleanDate.includes('T') ? cleanDate.split('T')[0] : cleanDate;
        const date = createUTCDateFromParts(datePart, timeStr);

        if (!date || !isValid(date)) {
            return timeStr;
        }

        return format(date, formatStr);
    } catch (error) {
        console.error("Error formatting time:", error);
        return timeStr;
    }
}

/**
 * Formats a UTC date string into a local date string.
 * @param dateStr Date string or Date object
 * @param formatStr Format string (default: "MMM d, yyyy")
 */
export function formatUTCDate(dateStr: string | Date, formatStr: string = "MMM d, yyyy"): string {
    try {
        if (!dateStr) return "";

        if (typeof dateStr === 'string') {
            const cleanDate = dateStr.toString().trim();

            if (cleanDate.includes('T')) {
                const parsed = new Date(cleanDate);
                if (isValid(parsed)) {
                    return format(parsed, formatStr);
                }
            }

            const datePart = cleanDate.includes('T') ? cleanDate.split('T')[0] : cleanDate;
            const date = createUTCDateFromParts(datePart);
            if (date && isValid(date)) {
                return format(date, formatStr);
            }

            return "";
        }

        return format(dateStr, formatStr);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "";
    }
}

/**
 * Backward-compatible date formatter.
 * Accepts date strings stored in UTC and preserves calendar date across timezones.
 */
export function formatDate(dateStr: string | Date, formatStr: string = "MMM d, yyyy"): string {
    return formatUTCDate(dateStr, formatStr);
}

/**
 * Ensures a timestamp string is parsed as UTC by appending 'Z' if no timezone info is present.
 * Then formats it in the user's local timezone.
 */
export function formatTimestamp(timestamp: string, formatStr: string = "MMM d, yyyy 'at' h:mm a"): string {
    try {
        if (!timestamp) return "";
        const ts = timestamp.trim();
        // Append 'Z' if no timezone indicator present
        const utcTs = (ts.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(ts)) ? ts : ts + 'Z';
        const date = new Date(utcTs);
        if (!isValid(date)) return timestamp;
        return format(date, formatStr);
    } catch {
        return timestamp;
    }
}
