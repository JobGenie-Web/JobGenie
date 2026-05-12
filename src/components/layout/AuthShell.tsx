import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { AuthToolbar } from '@/components/layout/AuthToolbar';
import { AuthCardAnimator } from '@/components/layout/AuthCardAnimator';
import { Card } from '@/components/ui/card';

const DEFAULT_BULLETS = [
    'Verified employers & credential-backed candidates',
    'Interview orchestration in one timeline',
    'Audit-ready trails for enterprise teams',
];

type FormWidthKey = 'md' | 'lg' | 'xl' | '2xl';

const formMaxWidth: Record<FormWidthKey, string> = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-4xl',
};

export type AuthShellProps = {
    /** Left-column headline (desktop) */
    sideHeadline: string;
    sideDescription?: string;
    bullets?: string[];
    /** Tailwind max-width class key for the form column */
    formWidth?: FormWidthKey;
    /** Use when child supplies its own surface (e.g. employer wizard) */
    bare?: boolean;
    children: React.ReactNode;
};

export function AuthShell({
    sideHeadline,
    sideDescription = 'One workspace for discovery, screening, and scheduling — built for teams that treat hiring like infrastructure.',
    bullets = DEFAULT_BULLETS,
    formWidth = 'md',
    bare = false,
    children,
}: AuthShellProps) {
    const year = new Date().getFullYear();
    const mw = formMaxWidth[formWidth];

    return (
        <div className="flex min-h-screen flex-col bg-background mesh-bg">
            <AuthToolbar />

            <div className="grid flex-1 lg:grid-cols-[minmax(280px,440px)_minmax(0,1fr)] lg:items-stretch">
                {/* Brand column — desktop */}
                <aside className="relative hidden overflow-hidden border-border bg-muted/40 lg:flex lg:flex-col lg:justify-between lg:border-r lg:p-10 xl:p-12 dark:bg-muted/15">
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_10%_15%,oklch(0.88_0.04_260/0.18),transparent_55%),radial-gradient(ellipse_70%_60%_at_90%_80%,oklch(0.93_0.03_95/0.35),transparent_50%)] dark:bg-[radial-gradient(ellipse_90%_70%_at_10%_15%,oklch(0.28_0.05_265/0.25),transparent_55%),radial-gradient(ellipse_70%_60%_at_90%_80%,oklch(0.22_0.03_265/0.2),transparent_50%)]"
                        aria-hidden
                    />
                    <div className="relative z-10 flex flex-col gap-8">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                                JobGenie
                            </p>
                            <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-foreground xl:text-3xl">
                                {sideHeadline}
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground xl:text-[15px]">
                                {sideDescription}
                            </p>
                        </div>
                        <ul className="space-y-3.5">
                            {bullets.map((item) => (
                                <li key={item} className="flex gap-3 text-sm leading-snug text-foreground/90">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Link
                        href="/"
                        className="relative z-10 mt-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to website
                    </Link>
                </aside>

                {/* Form column */}
                <main className="flex flex-1 flex-col px-4 py-8 sm:px-8 lg:justify-center lg:px-10 lg:py-10 xl:px-14">
                    <div className={`mx-auto w-full ${mw}`}>
                        {bare ? (
                            children
                        ) : (
                        <AuthCardAnimator>
                            <Card variant="glass" className="p-6 sm:p-8 w-full">
                                {children}
                            </Card>
                        </AuthCardAnimator>
                        )}
                    </div>
                </main>
            </div>

            <footer className="border-t border-border/60 bg-muted/25 py-5 text-center text-[13px] text-muted-foreground dark:bg-muted/10">
                <span>© {year} JobGenie</span>
                <span className="mx-2 text-border">·</span>
                <Link href="/privacy" className="underline-offset-4 hover:text-primary hover:underline">
                    Privacy
                </Link>
                <span className="mx-2 text-border">·</span>
                <Link href="/terms" className="underline-offset-4 hover:text-primary hover:underline">
                    Terms
                </Link>
            </footer>
        </div>
    );
}
