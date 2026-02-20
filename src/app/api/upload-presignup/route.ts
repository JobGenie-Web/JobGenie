import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/logger";

// This endpoint is intentionally unauthenticated.
// It is ONLY used during the employer signup flow to upload a BR certificate
// BEFORE the employer has a user account.
//
// Security controls applied to compensate for the lack of auth:
//   1. Bucket is hard-coded to "br-certificates" – cannot be overridden by the caller.
//   2. Only PDF and image MIME types are accepted.
//   3. Maximum file size is 10 MB.

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET = "br-certificates";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Only PDF and image files are accepted for BR certificates." },
                { status: 415 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size must be less than 10 MB." },
                { status: 413 }
            );
        }

        // Generate a unique file path
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExt = file.name.split(".").pop();
        const filePath = `presignup/${timestamp}-${randomString}.${fileExt}`;

        // Convert to buffer and upload via admin client
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const adminClient = createAdminClient();
        const { error: uploadError } = await adminClient.storage
            .from(BUCKET)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("BR certificate presignup upload error:", uploadError);
            return NextResponse.json(
                { error: "Failed to upload file. Please try again." },
                { status: 500 }
            );
        }

        const { data: urlData } = adminClient.storage
            .from(BUCKET)
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            fileName: filePath,
        });
    } catch (error) {
        console.error("Presignup upload error:", error);
        await logError({
            source: "api/upload-presignup:POST",
            errorType: "PresignupUploadError",
            message: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
