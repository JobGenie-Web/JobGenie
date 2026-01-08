import Link from "next/link";
import { MISSignupForm } from "@/components/auth/MISSignupForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlertCircle } from "lucide-react";

export default async function MISRegisterPage() {
    // Check if any MIS user already exists
    const adminClient = createAdminClient();
    const { count: misCount } = await adminClient
        .from("mis_user")
        .select("*", { count: "exact", head: true });

    const misExists = misCount && misCount > 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {misExists ? "MIS Admin Already Exists" : "Create MIS Account"}
                    </h1>
                    <p className="text-muted-foreground">
                        {misExists
                            ? "This system already has an administrator"
                            : "Register as a Management Information System user"}
                    </p>
                </div>

                {/* Form Card or Message */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    {misExists ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                        Registration Not Available
                                    </h3>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        Public MIS admin registration is restricted to the initial setup only.
                                        Please contact your system administrator for access.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center pt-2">
                                <Link
                                    href="/mis/login"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Already have an account? Log in →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <MISSignupForm />
                    )}
                </div>

                {/* Login Link - Only show if registration is available */}
                {!misExists && (
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link
                            href="/mis/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Log in
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
