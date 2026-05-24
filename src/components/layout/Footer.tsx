'use client';

import Link from 'next/link';

const cols = [
    { title: 'Product', links: ['Features', 'How It Works', 'Pricing', 'Enterprise', 'Changelog'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Partners'] },
    { title: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Community'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'] },
];

const hrefMap: Record<string, string> = {
    Features: '#features', 'How It Works': '#how-it-works', Pricing: '#', Enterprise: '#', Changelog: '#',
    About: '#', Blog: '#', Careers: '#', Press: '#', Partners: '#',
    Documentation: '#', 'API Reference': '#', Status: '#', Community: '#',
    'Privacy Policy': '/privacy', 'Terms of Service': '/terms', 'Cookie Policy': '#', GDPR: '#',
};

export function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer style={{ background: 'var(--lp-footer-bg)', borderTop: '1px solid var(--lp-border-2)', padding: '60px 56px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#00cc44', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(0,180,60,0.35)' }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--lp-text)' }}>
                                Job<span style={{ color: '#00aa28' }}>Genie</span>
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--lp-text-22)', lineHeight: 1.72, maxWidth: 240, marginBottom: 20 }}>
                            The recruitment operating system for teams who value clarity, speed, and accountability.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[
                                { label: 'Twitter', icon: <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.7 5.3 4.3 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg> },
                                { label: 'LinkedIn', icon: <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> },
                                { label: 'GitHub', icon: <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg> },
                            ].map(s => (
                                <div key={s.label}
                                    style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', color: 'var(--lp-text-28)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 160ms' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,180,60,0.4)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--lp-text)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--lp-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface)'; (e.currentTarget as HTMLElement).style.color = 'var(--lp-text-28)'; }}
                                    aria-label={s.label}>
                                    {s.icon}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {cols.map(col => (
                        <div key={col.title}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--lp-text-22)', letterSpacing: '0.12em', marginBottom: 14, textTransform: 'uppercase' }}>{col.title}</div>
                            {col.links.map(l => (
                                <div key={l} style={{ marginBottom: 9 }}>
                                    <Link href={hrefMap[l] ?? '#'}
                                        style={{ fontSize: 13, color: 'var(--lp-text-28)', transition: 'color 150ms', textDecoration: 'none', display: 'block' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00aa28'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lp-text-28)'; }}>
                                        {l}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid var(--lp-border-2)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--lp-text-16)' }}>
                        © {year} JobGenie Technologies Ltd. All rights reserved.
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 10, color: 'var(--lp-text-12)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>TALENT OS v1.0</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div className="anim-pulse-green" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bb30' }} />
                            <span style={{ fontSize: 11, color: 'var(--lp-text-22)', fontWeight: 500 }}>All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
