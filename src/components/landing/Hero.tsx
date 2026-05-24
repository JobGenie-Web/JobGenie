'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/* ── Cursor spotlight ──────────────────────────────────────────────────────── */
function CursorSpotlight() {
    const [pos, setPos] = useState({ x: -2000, y: -2000 });
    useEffect(() => {
        const fn = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', fn, { passive: true });
        return () => window.removeEventListener('mousemove', fn);
    }, []);
    return (
        <div
            className="pointer-events-none fixed inset-0 z-[1]"
            style={{
                background: `radial-gradient(700px at ${pos.x}px ${pos.y}px, rgba(0,200,60,0.08), transparent 40%)`,
            }}
        />
    );
}

/* ── Hero background blobs ─────────────────────────────────────────────────── */
function HeroBg() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="dot-grid absolute inset-0 opacity-70" />
            <div className="absolute rounded-full" style={{
                top: '-18%', right: '-8%', width: 900, height: 900,
                background: 'radial-gradient(circle, var(--lp-blob-green) 0%, transparent 58%)',
                filter: 'blur(32px)', animation: 'blobFloat 22s ease-in-out infinite',
            }} />
            <div className="absolute rounded-full" style={{
                bottom: '-12%', left: '-5%', width: 700, height: 700,
                background: 'radial-gradient(circle, var(--lp-blob-blue) 0%, transparent 60%)',
                filter: 'blur(32px)', animation: 'blobFloat2 26s ease-in-out infinite',
            }} />
            <div className="absolute rounded-full" style={{
                top: '40%', left: '38%', width: 500, height: 500,
                background: 'radial-gradient(circle, var(--lp-blob-purple) 0%, transparent 60%)',
                filter: 'blur(32px)', animation: 'blobFloat3 17s ease-in-out infinite',
            }} />
            <div className="absolute bottom-0 left-0 right-0 h-80" style={{ background: 'var(--lp-fade-bottom)' }} />
            <div className="absolute inset-0" style={{ background: 'var(--lp-vignette)' }} />
        </div>
    );
}

/* ── Match score widget ─────────────────────────────────────────────────────── */
function MatchCard() {
    const pct = 96;
    const circ = 2 * Math.PI * 38;
    return (
        <div style={{
            padding: '18px 20px', borderRadius: 16, width: 215,
            background: 'var(--lp-glass-bg)', border: '1px solid var(--lp-glass-border)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            boxShadow: 'var(--lp-glass-shadow)',
            animation: 'floatA 8s ease-in-out 0.8s infinite',
        }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.11em', color: 'var(--lp-text-28)', marginBottom: 12 }}>AI MATCH SCORE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative', width: 54, height: 54, flexShrink: 0 }}>
                    <svg width={54} height={54} viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="44" cy="44" r="38" fill="none" stroke="var(--lp-border)" strokeWidth="7" />
                        <circle cx="44" cy="44" r="38" fill="none" stroke="#00cc36" strokeWidth="7"
                            strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 9px rgba(0,200,54,0.7))' }} />
                    </svg>
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--lp-text)', fontFamily: 'monospace' }}>{pct}%</span>
                </div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lp-text)', marginBottom: 3 }}>Senior Engineer</div>
                    <div style={{ fontSize: 11, color: 'var(--lp-text-28)', marginBottom: 8 }}>TechCorp · Remote</div>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em', background: 'rgba(0,180,60,0.12)', color: '#00aa30', border: '1px solid rgba(0,180,60,0.25)' }}>✦ TOP MATCH</span>
                </div>
            </div>
        </div>
    );
}

/* ── Pipeline card widget ───────────────────────────────────────────────────── */
function PipelineCard() {
    const stages = [
        { label: 'Applied', n: 124, color: '#f59e0b' },
        { label: 'Screened', n: 47, color: '#3b82f6' },
        { label: 'Interview', n: 19, color: '#8b5cf6' },
        { label: 'Offer', n: 6, color: '#00bb30' },
    ];
    return (
        <div style={{
            padding: '18px 20px', borderRadius: 16, width: 275,
            background: 'var(--lp-glass-bg)', border: '1px solid var(--lp-glass-border)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            boxShadow: 'var(--lp-glass-shadow)',
            animation: 'floatB 9s ease-in-out infinite',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#00bb30" strokeWidth="2"><rect x="2" y="3" width="7" height="9" rx="1" /><rect x="9.5" y="3" width="5" height="5" rx="1" /><rect x="15" y="3" width="7" height="7" rx="1" /></svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lp-text-60)' }}>Hiring Pipeline</span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, color: '#00aa30', letterSpacing: '0.08em' }}>
                    <span className="anim-pulse-green" style={{ width: 5, height: 5, borderRadius: '50%', background: '#00aa30', display: 'inline-block' }} />
                    LIVE
                </span>
            </div>
            {stages.map((s, i) => (
                <div key={i} style={{ marginBottom: i < stages.length - 1 ? 9 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--lp-text-38)', fontWeight: 500 }}>{s.label}</span>
                        <span style={{ fontSize: 10, color: s.color, fontWeight: 700, fontFamily: 'monospace' }}>{s.n}</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 99, background: 'var(--lp-border)' }}>
                        <div style={{ height: '100%', width: `${(s.n / 124) * 100}%`, borderRadius: 99, background: s.color, boxShadow: `0 0 7px ${s.color}70` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Notification + genie bubble widget ─────────────────────────────────────── */
function NotifCard({ text, sub, color = '#00aa30', animClass = 'anim-float-c', genieRight = true }: {
    text: string; sub: string; color?: string; animClass?: string; genieRight?: boolean;
}) {
    return (
        <div className={animClass} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            {/* Notification pill */}
            <div style={{
                padding: '12px 16px',
                borderRadius: 16,
                background: 'var(--lp-glass-bg)',
                border: '1px solid var(--lp-glass-border)',
                backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                boxShadow: 'var(--lp-glass-shadow)',
                display: 'flex', alignItems: 'center', gap: 11,
                width: 230, flexShrink: 0, position: 'relative',
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: '16px 0 0 16px', background: color, opacity: 0.8 }} />
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, marginLeft: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--lp-text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--lp-text-28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
                </div>
            </div>
            {/* Genie peeking out — unclipped */}
            <div style={{
                position: 'absolute',
                ...(genieRight ? { right: -72 } : { left: -72 }),
                bottom: -12, width: 96, height: 130, pointerEvents: 'none',
            }}>
                <Image src="/genie.png" alt="Genie" fill className="object-contain"
                    style={{ objectPosition: 'center bottom', filter: 'saturate(1.2) brightness(1.05)', transform: genieRight ? 'scaleX(-1)' : 'none' }} />
            </div>
        </div>
    );
}

function useFadeIn() {
    const [show, setShow] = useState(false);
    useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);
    return show;
}

/* ── Hero section ───────────────────────────────────────────────────────────── */
export function Hero() {
    const show = useFadeIn();
    const fd = (delay: number): React.CSSProperties => ({
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(24px)',
        transition: `opacity 750ms ${delay}ms ease-out, transform 750ms ${delay}ms ease-out`,
    });

    return (
        <>
            <CursorSpotlight />
            <section
                className="relative overflow-hidden"
                style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--lp-bg)' }}
            >
                <HeroBg />

                {/* Background genie */}
                <div className="pointer-events-none absolute bottom-0 right-0 select-none" style={{ height: '92%', zIndex: 1 }}>
                    <Image src="/genie.png" alt="" aria-hidden width={700} height={900}
                        className="h-full w-auto anim-genie-bob"
                        style={{ opacity: 0.42, filter: 'saturate(1.2) brightness(1.05)' }}
                        priority
                    />
                </div>

                {/* Sparkle particles */}
                {[
                    { r: '9%', b: '8%', s: 5, d: 0 }, { r: '13%', b: '18%', s: 3.5, d: 0.4 },
                    { r: '7%', b: '28%', s: 4, d: 0.8 }, { r: '17%', b: '12%', s: 3, d: 1.1 },
                    { r: '5%', b: '38%', s: 5, d: 0.3 }, { r: '11%', b: '22%', s: 3, d: 1.5 },
                    { r: '15%', b: '6%', s: 4, d: 0.7 }, { r: '8%', b: '44%', s: 2.5, d: 1.9 },
                    { r: '20%', b: '15%', s: 3.5, d: 0.5 }, { r: '6%', b: '32%', s: 4.5, d: 1.2 },
                ].map((p, i) => (
                    <div key={i} className="pointer-events-none absolute rounded-full" style={{
                        right: p.r, bottom: p.b, width: p.s, height: p.s,
                        background: '#00cc44',
                        boxShadow: `0 0 ${p.s * 2}px rgba(0,200,60,0.85)`,
                        animation: `sparkleUp ${1.8 + i * 0.25}s ${p.d}s ease-out infinite`,
                        zIndex: 2,
                    }} />
                ))}

                {/* Smoke wisps */}
                {[{ r: '10%', b: '5%', w: 28, d: 0.2 }, { r: '16%', b: '10%', w: 20, d: 0.9 }, { r: '7%', b: '15%', w: 24, d: 1.4 }].map((s, i) => (
                    <div key={i} className="pointer-events-none absolute rounded-full" style={{
                        right: s.r, bottom: s.b, width: s.w, height: s.w,
                        background: 'radial-gradient(circle, rgba(0,200,60,0.18) 0%, transparent 70%)',
                        animation: `magicSmoke ${2.4 + i * 0.5}s ${s.d}s ease-out infinite`,
                        zIndex: 2,
                    }} />
                ))}

                {/* Main content grid */}
                <div className="relative mx-auto w-full" style={{ maxWidth: 1300, padding: '100px 56px 80px', zIndex: 2, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'center' }}>

                    {/* Left copy */}
                    <div>
                        <div style={{ ...fd(80), display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px 5px 6px', borderRadius: 99, border: '1px solid rgba(0,180,60,0.30)', background: 'rgba(0,180,60,0.07)', marginBottom: 32 }}>
                            <span style={{ padding: '2px 9px', borderRadius: 99, background: '#00cc44', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>NEW</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--lp-text-45)' }}>Recruitment OS for modern teams</span>
                        </div>

                        <h1 style={{ ...fd(180), fontSize: 'clamp(44px, 5.5vw, 72px)', fontWeight: 800, letterSpacing: '-0.042em', lineHeight: 1.02, color: 'var(--lp-heading)', marginBottom: 24 }}>
                            Hire the right<br />people,{' '}
                            <span style={{ color: '#00bb30', textShadow: '0 0 60px rgba(0,180,60,0.35)' }}>faster.</span>
                        </h1>

                        <p style={{ ...fd(280), fontSize: 17, color: 'var(--lp-text-45)', lineHeight: 1.78, maxWidth: 490, marginBottom: 40 }}>
                            A unified recruitment platform where candidates are verified, employers are trusted,
                            and every step of the hiring journey is transparent and trackable.
                        </p>

                        <div style={{ ...fd(360), display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
                            <Link href="/candidate/signup"
                                style={{ padding: '14px 30px', borderRadius: 9999, background: '#00cc44', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: '0 0 36px rgba(0,180,60,0.38)', transition: 'all 200ms' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 48px rgba(0,180,60,0.55)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 36px rgba(0,180,60,0.38)'; }}
                            >Start as Candidate →</Link>
                            <Link href="/employer/signup"
                                style={{ padding: '14px 30px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block', background: 'var(--lp-surface)', color: 'var(--lp-text-60)', border: '1px solid var(--lp-border)', transition: 'all 200ms' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,180,60,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--lp-text)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface-hover)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--lp-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--lp-text-60)'; (e.currentTarget as HTMLElement).style.background = 'var(--lp-surface)'; }}
                            >Register Company</Link>
                        </div>

                        {/* Social proof */}
                        <div style={{ ...fd(440), display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ display: 'flex' }}>
                                {['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'].map((c, i) => (
                                    <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: '2px solid var(--lp-bg)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                                        {['AC', 'NV', 'TW', 'EM', 'JP'][i]}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lp-text-60)' }}>Trusted by 45,000+ professionals</div>
                                <div style={{ display: 'flex', gap: 1, marginTop: 3, alignItems: 'center' }}>
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <svg key={i} width={12} height={12} viewBox="0 0 24 24" fill={i < 4 ? '#f59e0b' : 'var(--lp-border)'} stroke="none">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                                        </svg>
                                    ))}
                                    <span style={{ fontSize: 11, color: 'var(--lp-text-28)', marginLeft: 4 }}>4.9 / 5</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right widget cluster */}
                    <div style={{ ...fd(220), position: 'relative', height: 560 }}>
                        <div style={{ position: 'absolute', top: 30, left: 0 }}><PipelineCard /></div>
                        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}><MatchCard /></div>
                        <div style={{ position: 'absolute', bottom: 158, right: 80, zIndex: 3 }}>
                            <NotifCard text="Interview Confirmed" sub="TechCorp · Round 2 · May 26" animClass="anim-float-a" genieRight={true} />
                        </div>
                        <div style={{ position: 'absolute', bottom: 52, left: 0, zIndex: 2 }}>
                            <NotifCard text="Offer Received! 🎉" sub="Nexus Tech · $120k package" color="#f59e0b" animClass="anim-float-b" genieRight={false} />
                        </div>
                        <div style={{ position: 'absolute', top: '22%', left: '18%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,60,0.055) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="scroll-cue pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1" style={{ opacity: 0.3, zIndex: 2 }}>
                    <div style={{ width: 22, height: 36, borderRadius: 99, border: '1.5px solid var(--lp-border)', display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
                        <div className="anim-bounce-dot" style={{ width: 3, height: 7, borderRadius: 99, background: 'var(--lp-text-45)' }} />
                    </div>
                </div>
            </section>
        </>
    );
}
