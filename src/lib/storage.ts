import { createAdminClient } from "@/lib/supabase/admin";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

const RESUME_BUCKET = "resume";
const RESUME_COPY_BUCKET = "resume_copy";
const PROFILE_IMAGE_BUCKET = "profile-images";

/**
 * Watermarks a PDF file with the company logo.
 * @param fileBuffer - The buffer of the PDF file.
 * @returns The buffer of the watermarked PDF.
 */
export async function watermarkPDF(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
    try {
        const pdfDoc = await PDFDocument.load(fileBuffer);

        // Load logo
        const logoPath = path.join(process.cwd(), "public", "logo.jpg");
        const logoImageBytes = await fs.readFile(logoPath);

        // Embed the JPG image
        const logoImage = await pdfDoc.embedJpg(logoImageBytes);
        const logoDims = logoImage.scale(0.1); // Scale down the logo (adjust as needed)

        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();

            // Draw logo at top right
            page.drawImage(logoImage, {
                x: width - logoDims.width - 20,
                y: height - logoDims.height - 20,
                width: logoDims.width,
                height: logoDims.height,
                opacity: 0.5, // Semi-transparent
            });
        }

        return await pdfDoc.save();
    } catch (error) {
        console.error("Error watermarking PDF:", error);
        throw new Error("Failed to watermark PDF");
    }
}

/**
 * Uploads a file to Supabase Storage.
 * @param bucket - The storage bucket name.
 * @param path - The path to store the file (e.g., "folder/filename.pdf").
 * @param fileBody - The file content (Buffer/ArrayBuffer).
 * @param contentType - The MIME type of the file.
 */
export async function uploadFile(
    bucket: string,
    filePath: string,
    fileBody: ArrayBuffer | Uint8Array | Buffer,
    contentType: string,
    allowedMimeTypes: string[] = ["application/pdf"] // Default to PDF for backward compatibility
) {
    const supabase = createAdminClient();

    // Check if bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find((b) => b.name === bucket);

    if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucket, {
            public: true, // Make public to allow resume_url access
            fileSizeLimit: 5242880, // 5MB limit
            allowedMimeTypes: allowedMimeTypes,
        });

        if (createError) {
            console.error(`Failed to create bucket '${bucket}':`, createError);
            // Don't throw here, try uploading anyway as listBuckets might fail due to permissions
            // but upload might succeed if bucket actually exists or RLS allows creation
        } else {
            console.log(`Created storage bucket: ${bucket}`);
        }
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBody, {
            contentType,
            upsert: true,
        });

    if (error) {
        console.error("Storage upload error:", error);
        throw error;
    }

    // Get public URL (assuming bucket is public, or we need to sign URL)
    // For 'resumes', it's likely a private bucket, but user asked for resume_url.
    // If it's private, we might need a signed URL, but usually profile fields store the path or public URL.
    // Let's assume public for now or standard getPublicUrl.
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Deletes a file from Supabase Storage.
 * @param bucket - The storage bucket name.
 * @param path - The path of the file to delete.
 */
export async function deleteFile(bucket: string, filePath: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
        console.error("Storage delete error:", error);
        // We log but don't throw, as this is often used in cleanup/rollback
    }
}

export const StorageService = {
    watermarkPDF,
    uploadResume: async (candidateId: string, file: File) => {
        const buffer = await file.arrayBuffer();

        // Watermark if PDF
        let fileData: ArrayBuffer | Uint8Array = buffer;
        if (file.type === "application/pdf") {
            try {
                fileData = await watermarkPDF(buffer);
            } catch (e) {
                console.warn("Watermarking failed, uploading original.", e);
            }
        }

        const fileName = `resume_${Date.now()}.pdf`; // Standardize name
        const filePath = `${candidateId}/${fileName}`;

        const url = await uploadFile(RESUME_BUCKET, filePath, fileData, "application/pdf", ["application/pdf"]);
        return { url, filePath };
    },
    deleteResume: async (filePath: string) => {
        await deleteFile(RESUME_BUCKET, filePath);
    },
    uploadCommonCV: async (candidateId: string, pdfBuffer: Uint8Array) => {
        // Watermark the generated common CV PDF
        let fileData: Uint8Array;
        try {
            // Create a new ArrayBuffer from the Uint8Array for watermarkPDF
            const arrayBuffer = new Uint8Array(pdfBuffer).buffer as ArrayBuffer;
            fileData = await watermarkPDF(arrayBuffer);
        } catch (e) {
            console.warn("Watermarking common CV failed, uploading without watermark.", e);
            fileData = pdfBuffer;
        }

        const fileName = `common_cv_${Date.now()}.pdf`;
        const filePath = `${candidateId}/${fileName}`;

        const url = await uploadFile(
            RESUME_COPY_BUCKET,
            filePath,
            fileData,
            "application/pdf",
            ["application/pdf"]
        );
        return { url, filePath };
    },
    deleteCommonCV: async (filePath: string) => {
        await deleteFile(RESUME_COPY_BUCKET, filePath);
    },
    uploadProfileImage: async (candidateId: string, file: File) => {
        const buffer = await file.arrayBuffer();
        const fileExt = file.name.split('.').pop();
        const fileName = `profile_${Date.now()}.${fileExt}`;
        const filePath = `${candidateId}/${fileName}`;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            throw new Error("Invalid file type. Only images are allowed.");
        }

        const url = await uploadFile(PROFILE_IMAGE_BUCKET, filePath, buffer, file.type, [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
        ]);
        return { url, filePath };
    },
    deleteProfileImage: async (filePath: string) => {
        await deleteFile(PROFILE_IMAGE_BUCKET, filePath);
    }
};
