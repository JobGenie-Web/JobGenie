import Link from 'next/link';
import { User } from 'lucide-react';
import { CandidateSignupForm } from '@/components/auth/CandidateSignupForm';
import { AuthShell } from '@/components/layout/AuthShell';

export default function CandidateSignupPage() {
    return (
        <AuthShell
            sideHeadline="Your career graph, one verified profile."
            sideDescription="Show intent-rich credentials, track every application in one timeline, and get matched to roles that fit how you work."
            bullets={[
                'Credential-backed identity & résumé graph',
                'Transparent stages from screen to offer',
                'Calendar-aware scheduling with employers',
            ]}
            formWidth="lg"
        >
            <div className="mb-5 flex justify-center sm:mb-6">
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3.5 text-primary sm:p-4">
                    <User className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight sm:text-[1.65rem]">
                Create your candidate account
            </h1>
            <p className="mb-6 mt-2 text-center text-sm text-muted-foreground sm:mb-7 sm:text-[15px]">
                Join verified job seekers on JobGenie — free to get started.
            </p>

            <CandidateSignupForm />

            <p className="mt-6 text-center text-sm text-muted-foreground sm:mt-7">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthShell>
    );
}
