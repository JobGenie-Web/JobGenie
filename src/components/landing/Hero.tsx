'use client';

import Link from 'next/link';
import { useRef } from 'react';
import {
    motion,
    useInView,
    useReducedMotion,
} from 'framer-motion';
import {
    ArrowRight,
    ArrowUpRight,
    Building2,
    Sparkles,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    fadeUp,
    inViewProps,
    landingEase,
    scaleIn,
    staggerFast,
} from '@/lib/motion/landing';
import { LandingWatermarks } from '@/components/landing/LandingWatermarks';

const metrics = [
    { value: '10K+', label: 'Live roles' },
    { value: '50K+', label: 'Professionals' },
    { value: '5K+', label: 'Organizations' },
    { value: '95%', label: 'Happy placements' },
];

const highlights = [
    'Verified employers',
    'Interview scheduling',
    'Audit-ready trails',
    'Intent-aware matching',
];

function HeroProgress() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-10%' });
    const reduce = useReducedMotion();

    return (
        <div ref={ref} className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: reduce ? '72%' : 0 }}
                animate={inView ? { width: '72%' } : { width: reduce ? '72%' : 0 }}
                transition={{
                    duration: reduce ? 0 : 1.1,
                    ease: landingEase,
                    delay: 0.12,
                }}
            />
        </div>
    );
}

export function Hero() {
    const reduce = useReducedMotion();

    return (
        <section id="about" className="relative overflow-hidden">
            <div className="landing-atmosphere relative">
                <div
                    className="landing-noise pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply dark:opacity-50 dark:mix-blend-overlay"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full blur-3xl landing-blob-a opacity-90"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-32 -right-32 h-[380px] w-[380px] rounded-full blur-3xl landing-blob-b opacity-80"
                    aria-hidden
                />

                <LandingWatermarks variant="hero" />

                <div className="relative z-10 mx-auto max-w-[1200px] px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-10">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                        {/* Copy */}
                        <motion.div
                            variants={staggerFast}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.p
                                variants={fadeUp}
                                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                            >
                                <motion.span
                                    animate={
                                        reduce
                                            ? undefined
                                            : { rotate: [0, 12, -8, 0], scale: [1, 1.08, 1] }
                                    }
                                    transition={{
                                        duration: 3.2,
                                        repeat: Infinity,
                                        repeatDelay: 4,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                                </motion.span>
                                Talent OS
                            </motion.p>

                            <motion.h1
                                variants={fadeUp}
                                className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]"
                            >
                                Hiring that stays{' '}
                                <motion.span
                                    className="text-primary"
                                    animate={
                                        reduce
                                            ? undefined
                                            : {
                                                  textShadow: [
                                                      '0 0 0px transparent',
                                                      '0 0 24px color-mix(in oklch, var(--primary) 35%, transparent)',
                                                      '0 0 0px transparent',
                                                  ],
                                              }
                                    }
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    clear
                                </motion.span>
                                <span className="text-muted-foreground">,</span> end to end.
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]"
                            >
                                One place for verified employers and candidates — discovery,
                                screening, and scheduling without juggling five tools.
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-12 rounded-xl px-8 text-[15px] font-semibold shadow-md shadow-primary/20"
                                    >
                                        <Link href="/candidate/signup" className="gap-2">
                                            Join as candidate
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="h-12 rounded-xl border-border bg-card px-8 text-[15px] font-semibold shadow-sm hover:bg-muted/80"
                                    >
                                        <Link href="/employer/signup" className="gap-2">
                                            Register company
                                            <ArrowUpRight className="h-4 w-4 opacity-80" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            </motion.div>

                            <motion.div className="mt-10 flex flex-wrap gap-2">
                                {highlights.map((h) => (
                                    <motion.span
                                        key={h}
                                        variants={fadeUp}
                                        whileHover={{
                                            y: -2,
                                            borderColor: 'color-mix(in oklch, var(--primary) 45%, transparent)',
                                        }}
                                        className="rounded-lg border border-border/80 bg-muted/70 px-3 py-1.5 text-xs font-medium text-muted-foreground dark:bg-muted/40"
                                    >
                                        {h}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Preview card */}
                        <motion.div
                            variants={scaleIn}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.12 }}
                            className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
                        >
                            <motion.div
                                className="rounded-3xl border border-border bg-card p-7 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] dark:border-border/80 dark:shadow-black/40"
                                animate={
                                    reduce
                                        ? undefined
                                        : {
                                              y: [0, -7, 0],
                                          }
                                }
                                transition={{
                                    duration: 5.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                whileHover={
                                    reduce
                                        ? undefined
                                        : {
                                              scale: 1.02,
                                              boxShadow:
                                                  '0 28px 60px -24px color-mix(in oklch, var(--primary) 22%, transparent)',
                                          }
                                }
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Pipeline pulse
                                        </p>
                                        <p className="mt-2 font-mono text-5xl font-bold tracking-tight text-primary">
                                            24
                                            <span className="text-2xl font-semibold text-muted-foreground">
                                                h
                                            </span>
                                        </p>
                                        <p className="mt-3 text-sm leading-snug text-muted-foreground">
                                            Typical time from accepted invite to first interview slot.
                                        </p>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.45, duration: 0.5, ease: landingEase }}
                                        className="rounded-2xl bg-primary/12 px-3 py-2 text-center dark:bg-primary/18"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                            Stage drift
                                        </p>
                                        <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                                            −38%
                                        </p>
                                    </motion.div>
                                </div>

                                <HeroProgress />
                                <div className="mt-3 flex justify-between font-mono text-[11px] text-muted-foreground">
                                    <span>Week 0</span>
                                    <span className="text-foreground/80">On track</span>
                                    <span>Offer</span>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-2 border-t border-border/70 pt-6">
                                    <span className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                        SOC2-ready workflows
                                    </span>
                                    <span className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                                        Verified orgs
                                    </span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Metrics */}
                    <motion.div
                        {...inViewProps}
                        variants={staggerFast}
                        className="mt-14 rounded-2xl border border-border/60 bg-muted/60 px-6 py-8 dark:bg-muted/25 sm:px-10"
                    >
                        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
                            {metrics.map((m) => (
                                <motion.div key={m.label} variants={fadeUp}>
                                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                        {m.label}
                                    </dt>
                                    <dd className="mt-2 font-mono text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                                        {m.value}
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </motion.div>

                    {/* Pathways */}
                    <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
                        <motion.article
                            {...inViewProps}
                            variants={scaleIn}
                            whileHover={reduce ? undefined : { y: -4 }}
                            className="rounded-3xl border border-border bg-muted/45 p-8 dark:bg-muted/20"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <motion.div
                                    whileHover={{ rotate: [0, -6, 6, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
                                >
                                    <Users className="h-6 w-6" strokeWidth={1.75} />
                                </motion.div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Candidates
                                </span>
                            </div>
                            <h2 className="mt-6 text-2xl font-bold tracking-tight">
                                Your profile, one timeline.
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Verified identity and applications that stay readable for hiring teams.
                            </p>
                            <Button
                                asChild
                                variant="link"
                                className="mt-6 h-auto p-0 text-base font-semibold text-primary"
                            >
                                <Link href="/candidate/signup" className="gap-1">
                                    Create account
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.article>

                        <motion.article
                            {...inViewProps}
                            variants={{
                                hidden: { opacity: 0, scale: 0.96, y: 16 },
                                visible: {
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: { duration: 0.55, ease: landingEase, delay: 0.12 },
                                },
                            }}
                            whileHover={reduce ? undefined : { y: -4 }}
                            className="rounded-3xl border border-border bg-card p-8 shadow-sm dark:bg-card/90"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <motion.div
                                    whileHover={{ rotate: [0, -6, 6, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary/35 bg-background text-primary dark:bg-card"
                                >
                                    <Building2 className="h-6 w-6" strokeWidth={1.75} />
                                </motion.div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Employers
                                </span>
                            </div>
                            <h2 className="mt-6 text-2xl font-bold tracking-tight">
                                Hiring ops in one trail.
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Verification, interviews, and outcomes linked for recruiting and leadership.
                            </p>
                            <Button
                                asChild
                                variant="link"
                                className="mt-6 h-auto p-0 text-base font-semibold text-primary"
                            >
                                <Link href="/employer/signup" className="gap-1">
                                    Register company
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.article>
                    </div>
                </div>
            </div>
        </section>
    );
}
