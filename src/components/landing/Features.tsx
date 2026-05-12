'use client';

import {
    BarChart3,
    MessageSquare,
    Search,
    Shield,
    Users,
    Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    fadeUp,
    inViewProps,
    staggerCards,
} from '@/lib/motion/landing';
import { LandingWatermarks } from '@/components/landing/LandingWatermarks';

const features = [
    {
        icon: Search,
        title: 'Semantic matching',
        description:
            'Rank roles and candidates on skills, seniority, and intent — not keyword stuffing.',
        span: 'lg:col-span-6 lg:row-span-2',
        tall: true,
    },
    {
        icon: Shield,
        title: 'Verified parties',
        description: 'Employers and candidates meet after structured checks — fewer wasted loops.',
        span: 'lg:col-span-3',
        tall: false,
    },
    {
        icon: Zap,
        title: 'One-click apply',
        description: 'Reuse your profile payload safely across postings.',
        span: 'lg:col-span-3',
        tall: false,
    },
    {
        icon: Users,
        title: 'Curated talent pool',
        description: 'Surface prospects who opted in and fit your bar.',
        span: 'lg:col-span-3',
        tall: false,
    },
    {
        icon: BarChart3,
        title: 'Executive dashboards',
        description: 'Funnel velocity, source quality, and recruiter throughput in one pane.',
        span: 'lg:col-span-3',
        tall: false,
    },
    {
        icon: MessageSquare,
        title: 'Threaded context',
        description: 'Keep hiring conversations beside the record — not buried in inboxes.',
        span: 'sm:col-span-2 lg:col-span-12',
        tall: false,
    },
];

export function Features() {
    return (
        <section
            id="features"
            className="relative overflow-hidden border-t border-border/50 bg-muted/35 py-16 dark:bg-muted/15 sm:py-24"
        >
            <LandingWatermarks variant="features" />
            <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
                <motion.div
                    className="mx-auto max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex items-center gap-3">
                        <motion.span
                            className="h-px origin-left w-12 bg-primary/50"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            aria-hidden
                        />
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                            Platform surface
                        </p>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
                        Serious hiring infrastructure —{' '}
                        <span className="text-muted-foreground">without the enterprise drag.</span>
                    </h2>
                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Search, interviews, and decisions in flows your team can explain — without rewrites or vaporware.
                    </p>
                </motion.div>

                <motion.div
                    className="mt-16 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12"
                    {...inViewProps}
                    variants={staggerCards}
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={fadeUp}
                            whileHover={{
                                y: -6,
                                transition: { type: 'spring', stiffness: 400, damping: 28 },
                            }}
                            className={[
                                'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-colors duration-300 hover:border-primary/35 hover:shadow-lg dark:border-border/50 dark:hover:shadow-black/30',
                                feature.tall ? 'sm:col-span-2 sm:p-8' : '',
                                feature.span,
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-primary/10 opacity-60 transition-opacity group-hover:opacity-100" />
                            <motion.div
                                className={[
                                    'inline-flex rounded-xl border border-primary/15 bg-primary/10 p-3 text-primary transition-colors group-hover:border-primary/35 group-hover:bg-primary/15',
                                    feature.tall ? 'p-4' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                whileHover={{ rotate: [0, -4, 4, 0], scale: 1.05 }}
                                transition={{ duration: 0.45 }}
                            >
                                <feature.icon
                                    className={feature.tall ? 'h-8 w-8' : 'h-6 w-6'}
                                    strokeWidth={1.75}
                                />
                            </motion.div>
                            <h3
                                className={[
                                    'mt-5 font-semibold tracking-tight text-foreground',
                                    feature.tall ? 'text-2xl sm:text-3xl' : 'text-lg',
                                ].join(' ')}
                            >
                                {feature.title}
                            </h3>
                            <p
                                className={[
                                    'leading-relaxed text-muted-foreground',
                                    feature.tall ? 'mt-4 max-w-xl text-base sm:text-lg' : 'mt-2 text-sm sm:text-base',
                                ].join(' ')}
                            >
                                {feature.description}
                            </p>
                            {feature.tall && (
                                <div className="mt-8 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                                        Role-aware
                                    </span>
                                    <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                                        Enterprise SLA
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
