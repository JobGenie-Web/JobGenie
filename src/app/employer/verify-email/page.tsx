"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { verifyEmail, resendVerificationCode } from "@/app/actions/auth";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function EmployerVerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [code, setCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error("Email parameter is missing");
            router.push("/employer/signup");
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code || code.length !== 6) {
            toast.error("Please enter a valid 6-digit verification code");
            return;
        }

        setIsVerifying(true);

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("code", code);

            const result = await verifyEmail(null, formData);

            if (result.success) {
                toast.success(result.message);
                if (result.redirectTo) {
                    setTimeout(() => {
                        router.push(result.redirectTo!);
                    }, 1000);
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);

        try {
            const result = await resendVerificationCode(email);

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Resend error:", error);
            toast.error("Failed to resend code. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit verification code to
                        <br />
                        <strong className="text-foreground">{email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                className="text-center text-2xl tracking-widest"
                                disabled={isVerifying}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isVerifying || code.length !== 6}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Email"
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Didn't receive the code?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-primary hover:underline font-medium disabled:opacity-50"
                            >
                                {isResending ? "Sending..." : "Resend"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link
                            href="/employer/signup"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Back to signup
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
