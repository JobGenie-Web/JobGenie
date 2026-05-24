'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it Works' },
    { href: '#portals', label: 'Portals' },
    { href: '#testimonials', label: 'Testimonials' },
];

export function Header({ showSignIn = true }: { showSignIn?: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            padding: '0 40px', height: 64, display: 'flex', alignItems: 'center',
            background: scrolled ? 'var(--lp-nav-bg)' : 'transparent',
            backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
            borderBottom: `1px solid ${scrolled ? 'var(--lp-nav-border)' : 'transparent'}`,
            transition: 'all 350ms cubic-bezier(0.4,0,0.2,1)',
        }}>
            {/* Logo */}
            <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ display: 'flex', alignItems: 'center', gap: 9, flex: '0 0 auto', textDecoration: 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#00cc44', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(0,180,60,0.45)' }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--lp-text)' }}>
                    Job<span style={{ color: '#00aa28' }}>Genie</span>
                </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex" style={{ flex: 1, justifyContent: 'center', gap: 2, display: 'flex' }}>
                {navLinks.map(l => (
                    <a key={l.href} href={l.href}
                        style={{ padding: '6px 15px', borderRadius: 7, fontSize: 13, fontWeight: 500, color: 'var(--lp-nav-text)', transition: 'color 150ms, background 150ms', textDecoration: 'none' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lp-nav-text-hover)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-nav-hover-bg)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lp-nav-text)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        {l.label}
                    </a>
                ))}
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                {/* Theme toggle always visible */}
                <ThemeToggle />

                {showSignIn && (
                    <>
                        <Link href="/login"
                            className="hidden sm:inline-block"
                            style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid var(--lp-border)', background: 'transparent', color: 'var(--lp-text-45)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all 160ms' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lp-text)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,180,60,0.4)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lp-text-45)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--lp-border)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                            Sign In
                        </Link>
                        <Link href="/candidate/signup"
                            className="hidden sm:inline-block"
                            style={{ padding: '8px 20px', borderRadius: 7, background: '#00cc44', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 22px rgba(0,180,60,0.32)', transition: 'all 160ms' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 36px rgba(0,180,60,0.55)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 22px rgba(0,180,60,0.32)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                            Get Started →
                        </Link>
                    </>
                )}

                {/* Mobile hamburger */}
                <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
                    style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lp-text)' }}
                    aria-label="Menu">
                    {mobileOpen
                        ? <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        : <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                    }
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--lp-nav-bg)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--lp-nav-border)', padding: '16px 24px 20px' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                        {navLinks.map(l => (
                            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                                style={{ padding: '10px 12px', borderRadius: 7, fontSize: 14, fontWeight: 500, color: 'var(--lp-text-45)', textDecoration: 'none', transition: 'all 160ms' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lp-text)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lp-text-45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                {l.label}
                            </a>
                        ))}
                    </nav>
                    {showSignIn && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link href="/login" onClick={() => setMobileOpen(false)}
                                style={{ flex: 1, padding: '10px', borderRadius: 7, border: '1px solid var(--lp-border)', background: 'transparent', color: 'var(--lp-text-45)', fontSize: 13, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
                                Sign In
                            </Link>
                            <Link href="/candidate/signup" onClick={() => setMobileOpen(false)}
                                style={{ flex: 1, padding: '10px', borderRadius: 7, background: '#00cc44', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
