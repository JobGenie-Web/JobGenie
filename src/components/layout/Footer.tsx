'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeUp, inViewProps } from '@/lib/motion/landing';

const columns = {
    product: [
        { href: '#features', label: 'Platform' },
        { href: '/candidate/signup', label: 'Candidates' },
        { href: '/employer/signup', label: 'Employers' },
    ],
    company: [
        { href: '#about', label: 'Overview' },
        { href: '#contact', label: 'Contact' },
        { href: '/login', label: 'Sign in' },
    ],
    legal: [
        { href: '/privacy', label: 'Privacy' },
        { href: '/terms', label: 'Terms' },
    ],
};

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <motion.footer
            className="border-t border-border/60 bg-muted/30 dark:bg-muted/10"
            {...inViewProps}
            variants={fadeUp}
        >
            <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-5">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/logo.jpg"
                                alt="JobGenie"
                                width={108}
                                height={40}
                                className="h-9 w-auto rounded-md opacity-95"
                            />
                        </Link>
                        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                            JobGenie connects verified employers with intent-rich candidates — one
                            operating system for modern recruiting teams.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:justify-items-end">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Product
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {columns.product.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-foreground/90 transition-colors hover:text-primary"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Company
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {columns.company.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-foreground/90 transition-colors hover:text-primary"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Legal
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {columns.legal.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-foreground/90 transition-colors hover:text-primary"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-border/50 pt-10 text-sm text-muted-foreground md:flex-row md:items-center">
                    <p>© {year} JobGenie. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a
                            href="https://linkedin.com"
                            className="transition-colors hover:text-primary"
                            aria-label="LinkedIn"
                        >
                            LinkedIn
                        </a>
                        <a
                            href="https://twitter.com"
                            className="transition-colors hover:text-primary"
                            aria-label="X"
                        >
                            X / Twitter
                        </a>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}
