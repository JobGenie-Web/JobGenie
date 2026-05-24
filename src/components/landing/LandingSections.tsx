'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.15) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [visible, ref] as const;
}

function useCountUp(end: number, duration = 2000) {
    const [count, setCount] = useState(0);
    const started = useRef(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                const inc = end / (duration / 16); let s = 0;
                const t = setInterval(() => { s += inc; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 16);
            }
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [end, duration]);
    return [count, ref] as const;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGO STRIP
═══════════════════════════════════════════════════════════════════════════ */
export function LogoStrip() {
    const companies = ['TechCorp', 'Nexus Group', 'FinancePlus', 'ScaleUp Inc', 'DataBridge', 'CloudStack', 'DesignLab', 'StartupABC', 'MediCare', 'Vertex Systems', 'GreenField Capital', 'Innovate.io'];
    const doubled = [...companies, ...companies];
    return (
        <section style={{ background: 'var(--lp-bg-2)', borderTop: '1px solid var(--lp-border-2)', borderBottom: '1px solid var(--lp-border-2)', padding: '22px 0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, padding: '0 56px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--lp-border-2)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--lp-text-16)', whiteSpace: 'nowrap' }}>TRUSTED BY LEADING COMPANIES</span>
                <div style={{ flex: 1, height: 1, background: 'var(--lp-border-2)' }} />
            </div>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="anim-marquee" style={{ display: 'flex', gap: 56, alignItems: 'center', width: 'max-content' }}>
                    {doubled.map((c, i) => (
                        <span key={i} style={{ fontSize: 12, fontWeight: 600, color: 'var(--lp-text-16)', whiteSpace: 'nowrap', letterSpacing: '0.04em', fontFamily: 'monospace' }}>{c}</span>
                    ))}
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 120, background: 'var(--lp-fade-left)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 120, background: 'var(--lp-fade-right)', pointerEvents: 'none' }} />
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS SECTION
═══════════════════════════════════════════════════════════════════════════ */
function StatItem({ end, suffix, label, icon, color }: { end: number; suffix: string; label: string; icon: React.ReactNode; color: string }) {
    const [v, ref] = useCountUp(end);
    const [hover, setHover] = useState(false);
    return (
        <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ padding: '40px 32px', background: hover ? 'var(--lp-surface-hover)' : 'var(--lp-surface-2)', textAlign: 'center', position: 'relative', overflow: 'hidden', transition: 'background 250ms', cursor: 'default' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.55 }} />
            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, filter: 'blur(20px)' }} />
            <div style={{ width: 48, height: 48, borderRadius: 13, background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative' }}>{icon}</div>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.045em', color: 'var(--lp-text)', lineHeight: 1, marginBottom: 10, textShadow: `0 0 40px ${color}40`, fontFamily: 'monospace' }}>
                {v.toLocaleString()}{suffix}
            </div>
            <div style={{ fontSize: 12, color: 'var(--lp-text-28)', fontWeight: 500 }}>{label}</div>
        </div>
    );
}

export function StatsSection() {
    const stats = [
        { end: 2400, suffix: '+', label: 'Active Job Listings', color: '#3b82f6', icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg> },
        { end: 180, suffix: '+', label: 'Verified Employers', color: '#8b5cf6', icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M8 6h8M8 10h8M8 14h5" /></svg> },
        { end: 45000, suffix: '+', label: 'Registered Candidates', color: '#00bb30', icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#00bb30" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
        { end: 94, suffix: '%', label: 'Placement Match Rate', color: '#f59e0b', icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg> },
    ];
    return (
        <section style={{ background: 'var(--lp-bg-2)', padding: '72px 56px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--lp-border)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                {stats.map((s, i) => (
                    <div key={i} style={{ borderRight: i < 3 ? '1px solid var(--lp-border)' : 'none' }}>
                        <StatItem {...s} />
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════ */
function HowStep({ step, idx, visible, last }: {
    step: { n: string; title: string; desc: string; icon: React.ReactNode; color: string };
    idx: number; visible: boolean; last: boolean;
}) {
    const [hover, setHover] = useState(false);
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ padding: '52px 44px', position: 'relative', borderRight: last ? 'none' : '1px solid var(--lp-border)', background: hover ? 'var(--lp-surface)' : 'transparent', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(26px)', transition: `background 220ms, opacity 650ms ${idx * 140}ms ease-out, transform 650ms ${idx * 140}ms ease-out`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 150, height: 80, background: `radial-gradient(ellipse, ${step.color}16 0%, transparent 70%)`, filter: 'blur(20px)', pointerEvents: 'none', opacity: hover ? 1 : 0, transition: 'opacity 300ms' }} />
            {!last && (
                <div style={{ position: 'absolute', top: '50%', right: -17, transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'var(--lp-bg-2)', border: '1px solid var(--lp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--lp-text-22)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
            )}
            <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--lp-text-12)', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 24, fontFamily: 'monospace' }}>{step.n}</div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${step.color}12`, border: `1px solid ${step.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: hover ? `0 0 32px ${step.color}30` : 'none', transition: 'box-shadow 280ms' }}>{step.icon}</div>
            <h3 style={{ fontSize: 21, fontWeight: 700, color: 'var(--lp-text)', marginBottom: 12, letterSpacing: '-0.015em' }}>{step.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--lp-text-38)', lineHeight: 1.72 }}>{step.desc}</p>
        </div>
    );
}

export function HowItWorksSection() {
    const [visible, ref] = useInView(0.2);
    const steps = [
        { n: '01', title: 'Create Your Profile', color: '#3b82f6', desc: 'Sign up, complete your profile, upload your resume, and our AI starts building your match fingerprint.', icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        { n: '02', title: 'Get Matched & Apply', color: '#00bb30', desc: 'Browse AI-ranked job listings tailored to your skills and experience. One-click applications to verified employers only.', icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#00bb30" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg> },
        { n: '03', title: 'Track Every Step', color: '#8b5cf6', desc: 'Get real-time updates as you move through rounds. Accept interviews, view roadmaps, and sign your offer — all in one place.', icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    ];
    return (
        <section id="how-it-works" style={{ background: 'var(--lp-bg-2)', padding: '96px 56px', borderTop: '1px solid var(--lp-border-2)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 68 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, border: '1px solid var(--lp-border)', background: 'var(--lp-surface)', marginBottom: 18 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lp-text-38)' }}>HOW IT WORKS</span>
                    </div>
                    <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--lp-text)', lineHeight: 1.1 }}>Up and running in 3 steps.</h2>
                </div>
                <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--lp-border)' }}>
                    {steps.map((step, i) => <HowStep key={i} step={step} idx={i} visible={visible} last={i === steps.length - 1} />)}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════════════════════════ */
function TestiCard({ quote: q, idx, visible }: {
    quote: { text: string; name: string; role: string; color: string; initials: string; stars: number };
    idx: number; visible: boolean;
}) {
    const [hover, setHover] = useState(false);
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ padding: 34, borderRadius: 18, position: 'relative', overflow: 'hidden', background: hover ? 'var(--lp-surface-hover)' : 'var(--lp-surface-2)', border: `1px solid ${hover ? 'var(--lp-border)' : 'var(--lp-border-2)'}`, boxShadow: hover ? '0 20px 56px rgba(0,0,0,0.1)' : 'none', display: 'flex', flexDirection: 'column', gap: 20, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(26px)', transition: `background 220ms, border-color 220ms, box-shadow 220ms, opacity 650ms ${idx * 140}ms ease-out, transform 650ms ${idx * 140}ms ease-out` }}>
            <div style={{ position: 'absolute', top: 10, right: 18, fontSize: 96, fontWeight: 800, color: 'var(--lp-text-12)', lineHeight: 1, fontFamily: 'Georgia,serif', pointerEvents: 'none', userSelect: 'none' }}>"</div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${q.color}60, transparent)`, opacity: hover ? 1 : 0, transition: 'opacity 280ms' }} />
            <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2, 3, 4].map(i => (
                    <svg key={i} width={13} height={13} viewBox="0 0 24 24" fill={i < q.stars ? '#f59e0b' : 'var(--lp-border)'} stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                    </svg>
                ))}
            </div>
            <p style={{ fontSize: 15, color: 'var(--lp-text-60)', lineHeight: 1.78, flex: 1, fontStyle: 'italic', position: 'relative' }}>"{q.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, paddingTop: 16, borderTop: '1px solid var(--lp-border-2)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${q.color}14`, border: `1.5px solid ${q.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: q.color, flexShrink: 0 }}>{q.initials}</div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lp-text)' }}>{q.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--lp-text-28)', marginTop: 2 }}>{q.role}</div>
                </div>
            </div>
        </div>
    );
}

export function TestimonialsSection() {
    const [visible, ref] = useInView();
    const quotes = [
        { text: "As a hiring manager, I've tried every ATS on the market. JobGenie is the first that gives me genuine, real-time pipeline visibility. It's become the backbone of our entire talent operation.", name: 'Omar Hassan', role: 'CPO, Nexus Technologies', color: '#3b82f6', initials: 'OH', stars: 5 },
        { text: "I signed up on Tuesday, had three interview invites by Thursday. The AI matching is genuinely accurate — no noise, only roles where I was actually qualified and excited about.", name: 'Alex Chen', role: 'Senior Engineer · Hired at TechCorp', color: '#00bb30', initials: 'AC', stars: 5 },
        { text: "The MIS audit trail alone saved us during a compliance review. Everything is logged, timestamped, exportable. Our ops team has reclaimed 12+ hours per week.", name: 'Rachel Tan', role: 'Head of Operations, MIS Division', color: '#8b5cf6', initials: 'RT', stars: 5 },
    ];
    return (
        <section id="testimonials" style={{ background: 'var(--lp-bg)', padding: '96px 56px', borderTop: '1px solid var(--lp-border-2)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, border: '1px solid var(--lp-border)', background: 'var(--lp-surface)', marginBottom: 18 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lp-text-38)' }}>TESTIMONIALS</span>
                    </div>
                    <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--lp-text)', lineHeight: 1.1 }}>Trusted by teams<br />who move fast.</h2>
                </div>
                <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    {quotes.map((q, i) => <TestiCard key={i} quote={q} idx={i} visible={visible} />)}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PORTAL SHOWCASE
═══════════════════════════════════════════════════════════════════════════ */
const portals = {
    candidate: { label: 'Candidate Portal', color: '#00bb30', icon: <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#00bb30" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, headline: 'Your career command centre.', desc: 'Browse AI-matched jobs, track every application through custom stages, attend interviews, and accept offers — all from one clean dashboard.', features: ['AI job recommendations & match scores', 'Application status tracking', 'Multi-round interview calendar', 'Resume vault & profile builder'], href: '/candidate/signup' },
    employer: { label: 'Employer Portal', color: '#3b82f6', icon: <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>, headline: 'Hire with precision and speed.', desc: 'Post verified roles, review applicants intelligently, run multi-round interviews with your team, and extend offers — with full pipeline transparency.', features: ['Drag-and-drop Kanban pipeline', 'Smart candidate search & invite', 'Team collaboration tools', 'Offer management & contracts'], href: '/employer/signup' },
    mis: { label: 'Admin System', color: '#8b5cf6', icon: <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, headline: 'Full platform. Full control.', desc: 'Manage all users, roles, and permissions. Approve employers and candidates, generate compliance reports, and maintain a tamper-proof audit log.', features: ['User & role management', 'Approval workflow engine', 'Analytics & data exports', 'Immutable audit logs'], href: '/login' },
};

export function PortalShowcase() {
    const [active, setActive] = useState<'candidate' | 'employer' | 'mis'>('candidate');
    const p = portals[active];
    return (
        <section id="portals" style={{ background: 'var(--lp-bg-2)', padding: '96px 56px', borderTop: '1px solid var(--lp-border-2)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 52 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, border: '1px solid var(--lp-border)', background: 'var(--lp-surface)', marginBottom: 18 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lp-text-38)' }}>THREE PORTALS</span>
                    </div>
                    <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--lp-text)', lineHeight: 1.1 }}>Purpose-built for<br />every stakeholder.</h2>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 36 }}>
                    {(Object.keys(portals) as Array<keyof typeof portals>).map(key => (
                        <button key={key} onClick={() => setActive(key)}
                            style={{ padding: '9px 22px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 200ms', background: active === key ? portals[key].color : 'var(--lp-surface)', color: active === key ? '#fff' : 'var(--lp-text-38)', borderColor: active === key ? portals[key].color : 'var(--lp-border)', boxShadow: active === key ? `0 0 28px ${portals[key].color}35` : 'none' }}>
                            {portals[key].label}
                        </button>
                    ))}
                </div>
                <div key={active} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--lp-border)', animation: 'fadeInUp 300ms ease-out' }}>
                    <div style={{ padding: 56, background: 'var(--lp-surface)', borderRight: '1px solid var(--lp-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 340, position: 'relative' }}>
                        <div className="dot-grid" style={{ position: 'absolute', inset: 0 }} />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${p.color}12 0%, transparent 70%)`, filter: 'blur(22px)' }} />
                        <div style={{ textAlign: 'center', position: 'relative' }}>
                            <div style={{ width: 92, height: 92, borderRadius: 24, background: `${p.color}12`, border: `1px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: `0 0 64px ${p.color}22` }}>{p.icon}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: p.color, marginBottom: 10, textTransform: 'uppercase' }}>{p.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--lp-text)', letterSpacing: '-0.02em' }}>{p.headline}</div>
                        </div>
                    </div>
                    <div style={{ padding: '50px 54px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ fontSize: 15, color: 'var(--lp-text-45)', lineHeight: 1.78, marginBottom: 28 }}>{p.desc}</p>
                        <ul style={{ listStyle: 'none', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {p.features.map(f => (
                                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${p.color}14`, border: `1px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <span style={{ fontSize: 14, color: 'var(--lp-text-45)', fontWeight: 500 }}>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href={p.href}
                            style={{ alignSelf: 'flex-start', padding: '11px 22px', borderRadius: 8, border: `1.5px solid ${p.color}45`, background: `${p.color}0a`, color: p.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 200ms' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${p.color}18`; (e.currentTarget as HTMLElement).style.borderColor = p.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${p.color}28`; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${p.color}0a`; (e.currentTarget as HTMLElement).style.borderColor = `${p.color}45`; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                            Open {p.label}
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CTA SECTION
═══════════════════════════════════════════════════════════════════════════ */
export function CTASection() {
    return (
        <section id="contact" style={{ background: 'var(--lp-bg)', padding: '120px 56px', borderTop: '1px solid var(--lp-border-2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,180,60,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 450, height: 350, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,180,60,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div className="dot-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                <div className="anim-glow-pulse" style={{ width: 68, height: 68, borderRadius: 18, background: 'rgba(0,180,60,0.08)', border: '1px solid rgba(0,180,60,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#00bb30" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <h2 style={{ fontSize: 54, fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--lp-text)', marginBottom: 16, lineHeight: 1.08 }}>Ready to transform<br />how you hire?</h2>
                <p style={{ fontSize: 16, color: 'var(--lp-text-38)', lineHeight: 1.78, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>
                    Join thousands of companies and candidates already using JobGenie to move faster, hire smarter, and stay fully accountable.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                    <Link href="/candidate/signup"
                        style={{ padding: '15px 34px', borderRadius: 9999, background: '#00cc44', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 44px rgba(0,180,60,0.38)', transition: 'all 220ms' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 60px rgba(0,180,60,0.55)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 44px rgba(0,180,60,0.38)'; }}>
                        Join as Candidate
                    </Link>
                    <Link href="/employer/signup"
                        style={{ padding: '15px 34px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', background: 'var(--lp-surface)', color: 'var(--lp-text-60)', border: '1px solid var(--lp-border)', transition: 'all 220ms' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,180,60,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--lp-text)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface-hover)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--lp-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--lp-text-60)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface)'; }}>
                        Register Your Company
                    </Link>
                </div>
                <p style={{ fontSize: 12, color: 'var(--lp-text-16)', letterSpacing: '0.01em' }}>
                    No credit card required · Free to start · Setup in under 5 minutes
                </p>
            </div>
        </section>
    );
}
