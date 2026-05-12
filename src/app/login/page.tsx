import Link from 'next/link';
import { KeyRound, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UniversalLoginForm } from '@/components/auth/UniversalLoginForm';
import { Separator } from '@/components/ui/separator';
import { AuthShell } from '@/components/layout/AuthShell';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ returnUrl?: string }>;
}) {
    const params = await searchParams;
    const returnUrl = params.returnUrl;

    return (
        <AuthShell
            sideHeadline="The hiring OS your team can actually run."
            sideDescription="Role-aware workspaces for candidates, employers, and operations — with verification and timelines in one place."
            formWidth="md"
        >
            <div className="mb-5 flex justify-center sm:mb-6">
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3.5 text-primary sm:p-4">
                    <LogIn className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight sm:text-[1.65rem]">
                Welcome back
            </h1>
            <p className="mb-6 mt-2 text-center text-sm text-muted-foreground sm:mb-7 sm:text-[15px]">
                Sign in with your work email to continue.
            </p>

            <UniversalLoginForm returnUrl={returnUrl} />

            <div className="mt-4 text-center sm:mt-5">
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                    <KeyRound className="h-3.5 w-3.5" />
                    Forgot your password?
                </Link>
            </div>

            <div className="my-6 sm:my-7">
                <Separator />
            </div>

            <p className="text-center text-sm text-muted-foreground">New to JobGenie?</p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                <Button variant="outline" asChild size="sm" className="h-10 w-full font-medium">
                    <Link href="/candidate/signup">Candidate sign up</Link>
                </Button>
                <Button variant="outline" asChild size="sm" className="h-10 w-full font-medium">
                    <Link href="/employer/signup">Employer sign up</Link>
                </Button>
            </div>
        </AuthShell>
    );
}
