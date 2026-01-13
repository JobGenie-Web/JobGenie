import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileUrl } = body;

        if (!fileUrl) {
            return NextResponse.json(
                { error: "File URL is required" },
                { status: 400 }
            );
        }

        // Extract file path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filepath]
        const urlParts = fileUrl.split("/storage/v1/object/public/");
        if (urlParts.length !== 2) {
            return NextResponse.json(
                { error: "Invalid file URL format" },
                { status: 400 }
            );
        }

        const [bucket, ...filePathParts] = urlParts[1].split("/");
        const filePath = filePathParts.join("/");

        // Delete from Supabase Storage using admin client
        const adminClient = createAdminClient();
        const { error } = await adminClient.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error("Storage deletion error:", error);
            return NextResponse.json(
                { error: "Failed to delete file" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
