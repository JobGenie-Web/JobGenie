import Link from "next/link";
import { MISLoginForm } from "@/components/auth/MISLoginForm";

export default function MISLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">MIS Login</h1>
                    <p className="text-muted-foreground">
                        Sign in to your MIS account
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <MISLoginForm />
                </div>

                {/* Register Link */}
                {/* <div className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link
                        href="/mis/register"
                        className="font-medium text-primary hover:underline"
                    >
                        Register here
                    </Link>
                </div> */}
            </div>
        </div>
    );
}
