import crypto from "crypto";
import { getServerSql } from "@/lib/db/server-postgres";

export type VerifyEmailDirectResult =
    | { ok: true; userId: string }
    | {
          ok: false;
          reason:
              | "no_database_url"
              | "not_found"
              | "already_verified"
              | "invalid_code"
              | "expired"
              | "db_error";
          message?: string;
      };

function localIsoString(d: Date): string {
    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0") +
        "T" +
        String(d.getHours()).padStart(2, "0") +
        ":" +
        String(d.getMinutes()).padStart(2, "0") +
        ":" +
        String(d.getSeconds()).padStart(2, "0")
    );
}

function verificationExpired(storedExpiry: string | Date | null): boolean {
    if (storedExpiry == null) return true;
    const nowDate = new Date();
    const nowLocalString = localIsoString(nowDate);
    const storedStr =
        typeof storedExpiry === "string"
            ? storedExpiry
            : localIsoString(storedExpiry);
    return storedStr < nowLocalString;
}

/**
 * Load user, validate OTP and expiry, mark verified — all over Postgres (no PostgREST).
 */
export async function verifyEmailCodeDirect(
    email: string,
    code: string
): Promise<VerifyEmailDirectResult> {
    const sql = getServerSql();
    if (!sql) {
        return { ok: false, reason: "no_database_url" };
    }

    const emailNorm = email.trim();

    try {
        const rows = await sql`
            SELECT
                "id",
                "email_verification_token",
                "verification_token_expires_at",
                "email_verified"
            FROM "users"
            WHERE LOWER(TRIM("email")) = LOWER(${emailNorm})
            LIMIT 1
        `;

        const row = rows[0] as
            | {
                  id: string;
                  email_verification_token: string | null;
                  verification_token_expires_at: string | Date | null;
                  email_verified: boolean;
              }
            | undefined;

        if (!row) {
            return { ok: false, reason: "not_found" };
        }

        if (row.email_verified) {
            return { ok: false, reason: "already_verified" };
        }

        const storedToken = row.email_verification_token || "";
        const codeOk =
            storedToken.length === code.length &&
            crypto.timingSafeEqual(Buffer.from(storedToken), Buffer.from(code));

        if (!codeOk) {
            return { ok: false, reason: "invalid_code" };
        }

        if (verificationExpired(row.verification_token_expires_at)) {
            return { ok: false, reason: "expired" };
        }

        const updatedAt = new Date().toISOString();

        await sql`
            UPDATE "users"
            SET
                "email_verified" = true,
                "status" = ${"active"}::"UserStatus",
                "email_verification_token" = NULL,
                "verification_token_expires_at" = NULL,
                "updated_at" = ${updatedAt}
            WHERE "id" = ${row.id}::uuid
        `;

        return { ok: true, userId: row.id };
    } catch (e) {
        console.error("verifyEmailCodeDirect:", e);
        return {
            ok: false,
            reason: "db_error",
            message: e instanceof Error ? e.message : String(e),
        };
    }
}
