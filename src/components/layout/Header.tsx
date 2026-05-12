'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const navLinks = [
    { href: '#about', label: 'Overview' },
    { href: '#features', label: 'Platform' },
    { href: '#contact', label: 'Contact' },
];

export function Header({ showSignIn = true }: { showSignIn?: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 lg:px-8">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/85 px-4 py-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)] backdrop-blur-md dark:bg-background/72 dark:shadow-black/50 md:px-5">
                <Link href="/" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90">
                    <Image
                        src="/logo.jpg"
                        alt="JobGenie"
                        width={112}
                        height={42}
                        className="h-9 w-auto rounded-md"
                        priority
                    />
                </Link>

                <nav className="hidden items-center gap-0.5 rounded-full border border-border/40 bg-muted/30 px-1.5 py-1 md:flex dark:bg-muted/20">
                    {navLinks.map((link) => (
                        <div key={link.href}>
                            <Link
                                href={link.href}
                                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background/90 hover:text-foreground dark:hover:bg-card/80"
                            >
                                {link.label}
                            </Link>
                        </div>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {showSignIn && (
                        <Button
                            asChild
                            size="sm"
                            className="hidden rounded-full px-6 font-semibold shadow-md shadow-primary/15 sm:inline-flex"
                        >
                            <Link href="/login">Sign in</Link>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setOpen(!open)}
                        aria-expanded={open}
                        aria-label="Menu"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {open && (
                <div className="mx-auto mt-2 max-w-[1400px] overflow-hidden rounded-2xl border border-border/70 bg-background/96 shadow-xl backdrop-blur-md md:hidden">
                    <nav className="flex flex-col gap-1 px-4 py-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {showSignIn && (
                            <Button asChild className="mt-3 h-11 w-full rounded-full font-semibold">
                                <Link href="/login" onClick={() => setOpen(false)}>
                                    Sign in
                                </Link>
                            </Button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
