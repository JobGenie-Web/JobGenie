import Link from 'next/link';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateLoginForm } from '@/components/auth/CandidateLoginForm';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 text-primary">
                            <LogIn className="h-10 w-10" />
                        </div>
                    </div>

                    {/* Header */}
                    <h1 className="mb-2 text-center text-2xl font-bold">
                        Welcome Back
                    </h1>
                    <p className="mb-8 text-center text-muted-foreground">
                        Sign in to your account to continue
                    </p>

                    {/* Login Form */}
                    <CandidateLoginForm />

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/candidate/signup" className="font-medium text-primary hover:underline">
                            Create one
                        </Link>
                    </div>
                </div>

                {/* Back link */}
                <div className="mt-6 text-center">
                    <Button variant="ghost" asChild>
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
