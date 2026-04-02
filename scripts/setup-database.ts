/**
 * Database Setup Script
 * ---------------------
 * Applies all RLS policies, grants, helper functions, and storage bucket
 * policies to a Supabase Postgres database.
 *
 * Run this script:
 *   • After every Prisma schema migration
 *   • When setting up a brand-new database
 *   • After any table restructuring that might drop policies
 *
 * Usage:
 *   npm run db:policies          — apply policies only (tables already exist)
 *   npm run db:setup             — migrate schema THEN apply policies
 *   npm run db:reset             — drop everything, remigrate, apply policies
 *
 * What it applies (in order):
 *   1. prisma/complete_rls_policies.sql
 *      • SECURITY DEFINER helper functions (is_mis_user, is_candidate, is_employer)
 *      • Table-level GRANTs for the authenticated / anon roles
 *      • ALTER TABLE … ENABLE ROW LEVEL SECURITY for all public tables
 *      • Performance indexes for RLS subquery columns
 *      • All RLS policies for every table
 *   2. supabase/storage_rls_policies.sql
 *      • Ensures all storage buckets exist with correct settings
 *      • All RLS policies for storage.objects (profile-images, company-logos,
 *        resume, resume_copy, br-certificates)
 *
 * Environment (loaded from .env / .env.local):
 *   DATABASE_URL — direct Postgres connection string
 *                  Supabase Dashboard → Project Settings → Database
 *                  Format: postgresql://postgres:[password]@[host]:5432/postgres
 */

import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env / .env.local the same way Next.js does
loadEnvConfig(process.cwd());

// ─── Files applied in order ──────────────────────────────────────────────────

const POLICY_FILES = [
    {
        label: "Table RLS policies, grants & helper functions",
        path: join(process.cwd(), "prisma", "complete_rls_policies.sql"),
    },
    {
        label: "Storage bucket RLS policies",
        path: join(process.cwd(), "supabase", "storage_rls_policies.sql"),
    },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
    console.log(`[db:setup] ${msg}`);
}

function separator(char = "─", width = 52) {
    return char.repeat(width);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    log(separator("═"));
    log("JobGenie — Database Policy Setup");
    log(separator("═"));

    // ── Validate env ─────────────────────────────────────────────────────────
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error(
            "\n[db:setup] ERROR: DATABASE_URL is not set.\n" +
            "  Add it to your .env file.\n" +
            "  Find it in: Supabase Dashboard → Project Settings → Database\n"
        );
        process.exit(1);
    }

    log(`Target: ${databaseUrl.replace(/:([^@]+)@/, ":***@")}`); // hide password in log

    // ── Connect ───────────────────────────────────────────────────────────────
    log("\nConnecting to database...");

    const sql = postgres(databaseUrl, {
        ssl: "require",
        max: 1,           // single connection is enough for sequential DDL
        idle_timeout: 60,
        connect_timeout: 30,
    });

    try {
        // Verify connection before running anything
        await sql`SELECT 1`;
        log("Connected.\n");

        // ── Apply each SQL file ───────────────────────────────────────────────
        for (const file of POLICY_FILES) {
            log(separator());
            log(`Applying: ${file.label}`);
            log(`  Path: ${file.path}`);

            let content: string;
            try {
                content = readFileSync(file.path, "utf-8");
            } catch {
                console.error(`\n  ERROR: Cannot read file: ${file.path}`);
                console.error("  Make sure you are running this from the project root.\n");
                throw new Error(`File not found: ${file.path}`);
            }

            await sql.unsafe(content);
            log("  Done.\n");
        }

        // ── Reload PostgREST schema cache ─────────────────────────────────────
        log(separator());
        log("Reloading PostgREST schema cache...");
        await sql.unsafe("SELECT pg_notify('pgrst', 'reload schema')");
        log("  Done.\n");

        // ── Summary ───────────────────────────────────────────────────────────
        log(separator("═"));
        log("All policies applied successfully.");
        log("The system is ready to use.");
        log(separator("═") + "\n");

    } finally {
        await sql.end();
    }
}

main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n[db:setup] FAILED: ${message}\n`);
    process.exit(1);
});
