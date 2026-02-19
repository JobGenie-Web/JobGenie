import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 text-primary">
                            <KeyRound className="h-10 w-10" />
                        </div>
                    </div>

                    {/* Header */}
                    <h1 className="mb-2 text-center text-2xl font-bold">
                        Forgot Password?
                    </h1>
                    <p className="mb-8 text-center text-muted-foreground">
                        Enter your registered email address and we&apos;ll send you a link to reset your password.
                    </p>

                    {/* Form */}
                    <ForgotPasswordForm />
                </div>

                {/* Back link */}
                <div className="mt-6 text-center">
                    <Button variant="ghost" asChild>
                        <Link href="/login" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
