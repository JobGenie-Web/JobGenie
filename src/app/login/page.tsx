import Link from 'next/link';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UniversalLoginForm } from '@/components/auth/UniversalLoginForm';
import { Separator } from '@/components/ui/separator';

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
                    <UniversalLoginForm />

                    {/* Separator */}
                    <div className="my-6">
                        <Separator />
                    </div>

                    {/* Signup Links */}
                    <div className="space-y-3">
                        <p className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" asChild size="sm">
                                <Link href="/candidate/signup">
                                    Sign up as Candidate
                                </Link>
                            </Button>
                            <Button variant="outline" asChild size="sm">
                                <Link href="/employer/signup">
                                    Sign up as Employer
                                </Link>
                            </Button>
                        </div>
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
