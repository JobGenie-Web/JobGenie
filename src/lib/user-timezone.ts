import { getServerSql } from "@/lib/db/server-postgres";

/**
 * Look up a user's IANA timezone (e.g., "Asia/Colombo"). Falls back to "UTC"
 * when the column is missing, empty, or the user cannot be found. Safe to
 * call from server code (emails, SSR, API routes).
 */
export async function getUserTimezone(userId: string | null | undefined): Promise<string> {
    if (!userId) return "UTC";
    try {
        const sql = getServerSql();
        if (!sql) return "UTC";
        const rows = await sql`
            SELECT "timezone"
            FROM "users"
            WHERE "id" = ${userId}::uuid
            LIMIT 1
        `;
        const row = rows[0] as { timezone?: string | null } | undefined;
        const tz = row?.timezone?.trim();
        return tz && tz.length > 0 ? tz : "UTC";
    } catch {
        return "UTC";
    }
}

/** Look up timezone by user email (useful for recipient formatting). */
export async function getUserTimezoneByEmail(
    email: string | null | undefined
): Promise<string> {
    if (!email) return "UTC";
    try {
        const sql = getServerSql();
        if (!sql) return "UTC";
        const rows = await sql`
            SELECT "timezone"
            FROM "users"
            WHERE LOWER(TRIM("email")) = LOWER(${email.trim()})
            LIMIT 1
        `;
        const row = rows[0] as { timezone?: string | null } | undefined;
        const tz = row?.timezone?.trim();
        return tz && tz.length > 0 ? tz : "UTC";
    } catch {
        return "UTC";
    }
}
