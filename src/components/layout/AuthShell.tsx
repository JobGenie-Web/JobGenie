import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { AuthToolbar } from '@/components/layout/AuthToolbar';
import { AuthCardAnimator } from '@/components/layout/AuthCardAnimator';

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
    sideHeadline: string;
    sideDescription?: string;
    bullets?: string[];
    formWidth?: FormWidthKey;
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
        <div className="flex min-h-screen flex-col bg-[oklch(0.10_0.006_155)] text-foreground">
            {/* Top bar */}
            <header className="flex h-14 items-center justify-between border-b border-white/[0.06] px-6 flex-shrink-0">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-7 w-7 rounded-lg bg-primary/20 ring-1 ring-primary/30 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-foreground">JobGenie</span>
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Home
                </Link>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Left brand column ── */}
                <aside className="hidden lg:flex lg:w-[340px] xl:w-[400px] flex-shrink-0 flex-col justify-between border-r border-white/[0.06] p-10 xl:p-12 relative overflow-hidden">
                    {/* Atmosphere */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: `
                                radial-gradient(ellipse 90% 60% at 10% 20%, oklch(0.30 0.08 155 / 0.40), transparent 55%),
                                radial-gradient(ellipse 70% 50% at 90% 80%, oklch(0.26 0.06 175 / 0.30), transparent 50%),
                                radial-gradient(ellipse 60% 80% at 50% 50%, oklch(0.12 0.006 155), transparent 80%)
                            `,
                        }}
                        aria-hidden
                    />
                    {/* Grid overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, oklch(0.65 0.20 155 / 0.10) 1px, transparent 1px),
                                linear-gradient(to bottom, oklch(0.65 0.20 155 / 0.10) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px',
                        }}
                        aria-hidden
                    />

                    <div className="relative z-10 flex flex-col gap-8">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
                                JobGenie
                            </p>
                            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white xl:text-3xl">
                                {sideHeadline}
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-white/50 xl:text-[15px]">
                                {sideDescription}
                            </p>
                        </div>

                        <ul className="space-y-3">
                            {bullets.map((item) => (
                                <li key={item} className="flex gap-3 text-sm leading-snug text-white/70">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/30 text-primary">
                                        <Check className="h-3 w-3" strokeWidth={2.5} />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="relative z-10 text-xs text-white/25">© {year} JobGenie</p>
                </aside>

                {/* ── Right form column ── */}
                <main className="flex flex-1 flex-col overflow-y-auto">
                    {/* Subtle right-side atmosphere */}
                    <div
                        className="pointer-events-none fixed inset-0 lg:left-[340px] xl:left-[400px] z-0"
                        style={{
                            background: `
                                radial-gradient(ellipse 60% 40% at 80% 10%, oklch(0.25 0.06 155 / 0.15), transparent 55%),
                                radial-gradient(ellipse 50% 50% at 20% 90%, oklch(0.22 0.04 175 / 0.12), transparent 50%)
                            `,
                        }}
                        aria-hidden
                    />

                    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
                        <div className={`w-full ${mw}`}>
                            {bare ? (
                                children
                            ) : (
                                <AuthCardAnimator>
                                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm shadow-2xl shadow-black/40 p-7 sm:p-8">
                                        {children}
                                    </div>
                                </AuthCardAnimator>
                            )}
                        </div>
                    </div>

                    <footer className="relative z-10 border-t border-white/[0.06] py-4 text-center text-[12px] text-white/25">
                        © {year} JobGenie
                        <span className="mx-2 opacity-40">·</span>
                        <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
                        <span className="mx-2 opacity-40">·</span>
                        <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
                    </footer>
                </main>
            </div>
        </div>
    );
}
