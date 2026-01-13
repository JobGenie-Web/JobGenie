import { NextRequest, NextResponse } from "next/server";
import { verifyBRCertificate } from "@/app/actions/verify-br-certificate";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            fileBase64,
            mimeType,
            companyName,
            businessRegistrationNo,
        } = body;

        if (!fileBase64 || !mimeType || !companyName || !businessRegistrationNo) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required parameters",
                },
                { status: 400 }
            );
        }

        // Call the verification server action
        const result = await verifyBRCertificate(
            fileBase64,
            mimeType,
            companyName,
            businessRegistrationNo
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error("BR verification API error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred during verification",
            },
            { status: 500 }
        );
    }
}
