import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { redirect } from 'next/navigation';

interface PageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const token = params.token;

    // If no token is provided, redirect to forgot password
    if (!token) {
        redirect('/forgot-password');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 text-primary">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                    </div>

                    {/* Header */}
                    <h1 className="mb-2 text-center text-2xl font-bold">
                        Set New Password
                    </h1>
                    <p className="mb-8 text-center text-muted-foreground">
                        Choose a strong password. You&apos;ll use it to sign in to your account.
                    </p>

                    {/* Form — token is passed from server so it's not re-read client-side from URL */}
                    <ResetPasswordForm token={token} />
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
