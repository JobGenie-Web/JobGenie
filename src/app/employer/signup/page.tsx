import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerSignupWizard } from "@/components/employer/EmployerSignupWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Employer Signup | JobGenie",
    description: "Register your company and start hiring top talent",
};

export default async function EmployerSignupPage() {
    // Check if user is already authenticated
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Redirect if already logged in
        redirect("/employer/dashboard");
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Employer Registration
                    </h1>
                    <p className="text-muted-foreground">
                        Create your company account and start recruiting talent
                    </p>
                </div>

                {/* Wizard */}
                <EmployerSignupWizard />

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/employer/login"
                        className="text-primary hover:underline font-medium"
                    >
                        Log in here
                    </Link>
                </div>

                {/* Back link */}
                <div className="mt-4 text-center">
                    <Button variant="ghost" asChild size="sm">
                        <Link href="/" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
