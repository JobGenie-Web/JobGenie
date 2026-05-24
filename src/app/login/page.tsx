import Link from 'next/link';
import { KeyRound, Sparkles, ArrowRight } from 'lucide-react';
import { UniversalLoginForm } from '@/components/auth/UniversalLoginForm';
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
            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-primary/15 ring-1 ring-primary/25 flex items-center justify-center shadow-lg shadow-primary/10">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl -z-10" />
                </div>
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
                Welcome back
            </h1>
            <p className="mb-7 mt-2 text-center text-sm text-white/50">
                Sign in to your JobGenie account to continue.
            </p>

            <UniversalLoginForm returnUrl={returnUrl} />

            <div className="mt-5 text-center">
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-white/40 transition-colors hover:text-primary"
                >
                    <KeyRound className="h-3.5 w-3.5" />
                    Forgot your password?
                </Link>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[11px] text-white/25 uppercase tracking-widest">New here?</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Link
                    href="/candidate/signup"
                    className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/30 transition-all px-4 py-3"
                >
                    <div>
                        <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">Candidate</p>
                        <p className="text-[11px] text-white/35 mt-0.5">Find jobs</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-white/25 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
                <Link
                    href="/employer/signup"
                    className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/30 transition-all px-4 py-3"
                >
                    <div>
                        <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">Employer</p>
                        <p className="text-[11px] text-white/35 mt-0.5">Hire talent</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-white/25 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
            </div>
        </AuthShell>
    );
}
