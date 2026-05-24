'use client';

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

/* ── AI Matching visual ─────────────────────────────────────────────────────── */
function AIMatchingVisual({ hover }: { hover: boolean }) {
    const candidates = [
        { init: 'AC', name: 'Alice Chen', score: 96, color: '#00bb30' },
        { init: 'BP', name: 'Ben Park', score: 87, color: '#3b82f6' },
        { init: 'CL', name: 'Chris Lee', score: 72, color: '#8b5cf6' },
        { init: 'DW', name: 'Dana Wu', score: 61, color: '#f59e0b' },
    ];
    return (
        <div style={{ width: 290, borderRadius: 14, overflow: 'hidden', background: 'var(--lp-card-bg)', border: `1px solid ${hover ? 'rgba(59,130,246,0.45)' : 'var(--lp-border)'}`, boxShadow: hover ? '0 0 48px rgba(59,130,246,0.15)' : 'var(--lp-glass-shadow)', transition: 'border-color 280ms, box-shadow 280ms' }}>
            <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--lp-border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-text-45)' }}>AI Match Ranking</span>
                </div>
                <span style={{ fontSize: 9, background: 'rgba(59,130,246,0.10)', color: '#3b82f6', padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.04em', border: '1px solid rgba(59,130,246,0.2)' }}>RANKED</span>
            </div>
            {candidates.map((c, i) => (
                <div key={i} style={{ padding: '10px 14px', borderBottom: i < 3 ? '1px solid var(--lp-border-2)' : 'none', background: i === 0 ? 'rgba(0,180,60,0.03)' : 'transparent', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${c.color}18`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.init}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-text)' }}>{c.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: c.color, flexShrink: 0, marginLeft: 8, fontFamily: 'monospace' }}>{c.score}%</span>
                        </div>
                        <div style={{ height: 2.5, borderRadius: 99, background: 'var(--lp-border)' }}>
                            <div style={{ height: '100%', width: `${c.score}%`, borderRadius: 99, background: c.color, boxShadow: `0 0 6px ${c.color}50` }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Pipeline Kanban visual ─────────────────────────────────────────────────── */
function PipelineKanbanVisual({ hover }: { hover: boolean }) {
    const cols = [
        { label: 'Applied', color: '#f59e0b', cards: [{ i: 'AC' }, { i: 'BL' }, { i: 'NM' }] },
        { label: 'Interview', color: '#3b82f6', cards: [{ i: 'RK' }, { i: 'TW' }] },
        { label: 'Offer', color: '#00bb30', cards: [{ i: 'VP' }] },
    ];
    return (
        <div style={{ width: 300, borderRadius: 14, overflow: 'hidden', background: 'var(--lp-card-bg)', border: `1px solid ${hover ? 'rgba(0,180,60,0.45)' : 'var(--lp-border)'}`, boxShadow: hover ? '0 0 48px rgba(0,180,60,0.12)' : 'var(--lp-glass-shadow)', transition: 'border-color 280ms, box-shadow 280ms' }}>
            <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--lp-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#00bb30" strokeWidth="2"><rect x="2" y="3" width="7" height="9" rx="1" /><rect x="9.5" y="3" width="5" height="5" rx="1" /><rect x="15" y="3" width="7" height="7" rx="1" /></svg>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-text-45)' }}>Pipeline Board</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9, color: 'var(--lp-text-28)', fontWeight: 500 }}>6 candidates</span>
                    <div className="anim-pulse-green" style={{ width: 5, height: 5, borderRadius: '50%', background: '#00bb30' }} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 12 }}>
                {cols.map((col, ci) => (
                    <div key={ci}>
                        <div style={{ fontSize: 8.5, fontWeight: 700, color: col.color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: col.color, display: 'inline-block' }} />{col.label}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {col.cards.map((card, i) => (
                                <div key={i} style={{ padding: '6px 7px', borderRadius: 6, background: 'var(--lp-surface)', border: '1px solid var(--lp-border-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 17, height: 17, borderRadius: 4, background: `${col.color}18`, border: `1px solid ${col.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 700, color: col.color, flexShrink: 0 }}>{card.i}</div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ height: 2.5, borderRadius: 99, background: 'var(--lp-border)', width: '85%' }} />
                                        <div style={{ height: 2, borderRadius: 99, background: 'var(--lp-border-2)', width: '55%', marginTop: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Verify visual ──────────────────────────────────────────────────────────── */
function VerifyVisual({ hover }: { hover: boolean }) {
    const steps = [
        { label: 'Identity Document', done: true, time: 'Verified 2h ago' },
        { label: 'Work Authorization', done: true, time: 'Verified 1h ago' },
        { label: 'Business Registration', done: true, time: 'Verified 30m ago' },
        { label: 'Background Check', done: false, active: true, time: 'In progress...' },
    ];
    return (
        <div style={{ width: 268, borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'var(--lp-card-bg)', border: `1px solid ${hover ? 'rgba(139,92,246,0.45)' : 'var(--lp-border)'}`, boxShadow: hover ? '0 0 48px rgba(139,92,246,0.14)' : 'var(--lp-glass-shadow)', transition: 'border-color 280ms, box-shadow 280ms' }}>
            <div className="scan-line" />
            <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--lp-border-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-text-45)' }}>Verification Status</span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {steps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: s.done ? 'rgba(0,180,60,0.12)' : s.active ? 'rgba(139,92,246,0.12)' : 'var(--lp-surface)', border: `1.5px solid ${s.done ? 'rgba(0,180,60,0.5)' : s.active ? 'rgba(139,92,246,0.55)' : 'var(--lp-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: s.active ? 'pulseGreen 2s infinite' : 'none' }}>
                            {s.done && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#00bb30" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
                            {s.active && !s.done && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b5cf6' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 500, color: s.done ? 'var(--lp-text-60)' : s.active ? '#8b5cf6' : 'var(--lp-text-22)' }}>{s.label}</div>
                            <div style={{ fontSize: 9, color: 'var(--lp-text-22)', marginTop: 1 }}>{s.time}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ margin: '0 14px 12px', padding: '8px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.06em', marginBottom: 2 }}>PROCESSING</div>
                <div style={{ fontSize: 10, color: 'var(--lp-text-28)' }}>Background check · Est. 2–3 hrs</div>
            </div>
        </div>
    );
}

/* ── Analytics visual ──────────────────────────────────────────────────────── */
function AnalyticsVisual({ hover }: { hover: boolean }) {
    const [inView, ref] = useInView(0.1);
    const [ready, setReady] = useState(false);
    useEffect(() => { if (inView) { const t = setTimeout(() => setReady(true), 180); return () => clearTimeout(t); } }, [inView]);
    const bars = [{ d: 'M', v: 45 }, { d: 'T', v: 72 }, { d: 'W', v: 58 }, { d: 'T', v: 92 }, { d: 'F', v: 76 }, { d: 'S', v: 38 }];
    const maxH = 64;
    return (
        <div ref={ref} style={{ width: 290, borderRadius: 14, overflow: 'hidden', background: 'var(--lp-card-bg)', border: `1px solid ${hover ? 'rgba(245,158,11,0.45)' : 'var(--lp-border)'}`, boxShadow: hover ? '0 0 48px rgba(245,158,11,0.12)' : 'var(--lp-glass-shadow)', transition: 'border-color 280ms, box-shadow 280ms' }}>
            <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--lp-border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-text-45)' }}>Hiring Velocity</span>
                </div>
                <span style={{ fontSize: 10, color: '#00bb30', fontWeight: 700, background: 'rgba(0,180,60,0.08)', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(0,180,60,0.18)' }}>↑ 34%</span>
            </div>
            <div style={{ padding: '14px 14px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: `${maxH + 6}px`, marginBottom: 8 }}>
                    {bars.map((b, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ width: '100%', height: ready ? `${(b.v / 100) * maxH}px` : '0px', borderRadius: '3px 3px 0 0', background: i === 3 ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 'rgba(245,158,11,0.22)', boxShadow: i === 3 ? '0 0 14px rgba(245,158,11,0.4)' : 'none', transition: `height 700ms ${i * 55}ms cubic-bezier(0.34,1.4,0.64,1)` }} />
                            <span style={{ fontSize: 8, color: 'var(--lp-text-22)', fontWeight: 500 }}>{b.d}</span>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '1px solid var(--lp-border-2)', paddingTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                    {[{ l: 'Applications', v: '1,284' }, { l: 'Interviews', v: '342' }, { l: 'Offers', v: '67' }].map((m, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: 'var(--lp-surface)' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lp-text)', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>{m.v}</div>
                            <div style={{ fontSize: 8.5, color: 'var(--lp-text-22)', marginTop: 2 }}>{m.l}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Feature row ────────────────────────────────────────────────────────────── */
type VisualComponent = React.FC<{ hover: boolean }>;

function FeatureRow({ row, idx, visible }: {
    row: { tag: string; color: string; title: string; desc: string; pills: string[]; Visual: VisualComponent; right: boolean };
    idx: number; visible: boolean;
}) {
    const [hover, setHover] = useState(false);
    const { Visual } = row;
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ display: 'grid', gridTemplateColumns: row.right ? '1fr 360px' : '360px 1fr', background: hover ? 'var(--lp-surface-hover)' : 'var(--lp-surface-2)', borderBottom: '1px solid var(--lp-border-2)', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: `background 220ms, opacity 580ms ${idx * 100}ms ease-out, transform 580ms ${idx * 100}ms ease-out` }}>
            {!row.right && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '52px 44px', background: 'var(--lp-surface)', borderRight: '1px solid var(--lp-border-2)' }}>
                    <Visual hover={hover} />
                </div>
            )}
            <div style={{ padding: '56px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', color: row.color, marginBottom: 16 }}>{row.tag}</div>
                <h3 style={{ fontSize: 31, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--lp-text)', marginBottom: 16, lineHeight: 1.22, whiteSpace: 'pre-line' }}>{row.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-text-38)', lineHeight: 1.78, marginBottom: 26 }}>{row.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {row.pills.map(p => (
                        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${row.color}14`, border: `1px solid ${row.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke={row.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--lp-text-45)', fontWeight: 500 }}>{p}</span>
                        </div>
                    ))}
                </div>
            </div>
            {row.right && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '52px 44px', background: 'var(--lp-surface)', borderLeft: '1px solid var(--lp-border-2)' }}>
                    <Visual hover={hover} />
                </div>
            )}
        </div>
    );
}

export function Features() {
    const [visible, ref] = useInView();
    const rows = [
        { tag: 'INTELLIGENT MATCHING', color: '#3b82f6', title: 'Find the right fit.\nEvery single time.', desc: 'Our AI engine scores every candidate against each job using skills, experience, location, and culture signals. No more resume pile sorting — just relevant matches, ranked by confidence.', pills: ['Skill graph analysis', 'Culture fit scoring', 'Real-time re-ranking'], Visual: AIMatchingVisual, right: false },
        { tag: 'PIPELINE MANAGEMENT', color: '#00bb30', title: 'Every candidate.\nEvery stage. In view.', desc: 'Drag-and-drop Kanban boards replace spreadsheet chaos. Move candidates through custom stages, add round feedback, and see where every person stands in real time.', pills: ['Drag-and-drop Kanban', 'Round feedback & ratings', 'Multi-recruiter pipeline'], Visual: PipelineKanbanVisual, right: true },
        { tag: 'TRUST & VERIFICATION', color: '#8b5cf6', title: 'Only verified parties.\nOn both sides.', desc: 'Every employer submits business registration and goes through MIS approval. Every candidate is document-verified before they can apply. No fake listings. No ghost candidates.', pills: ['Business registration check', 'Document verification', 'Admin approval gate'], Visual: VerifyVisual, right: false },
        { tag: 'REAL-TIME ANALYTICS', color: '#f59e0b', title: 'Full visibility.\nZero blind spots.', desc: 'Live dashboards track your hiring velocity, offer acceptance rate, pipeline health, and team performance. Export everything, anytime, in one click.', pills: ['Hiring funnel analytics', 'Velocity tracking', 'CSV & report exports'], Visual: AnalyticsVisual, right: true },
    ];
    return (
        <section id="features" style={{ background: 'var(--lp-bg)', padding: '96px 56px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 68 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(0,180,60,0.28)', background: 'rgba(0,180,60,0.06)', marginBottom: 18 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#00aa28' }}>PLATFORM CAPABILITIES</span>
                    </div>
                    <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.033em', color: 'var(--lp-text)', marginBottom: 14, lineHeight: 1.1 }}>Built for every stage<br />of hiring.</h2>
                    <p style={{ fontSize: 16, color: 'var(--lp-text-38)', maxWidth: 460, margin: '0 auto', lineHeight: 1.72 }}>From first application to signed offer — every step is transparent and auditable.</p>
                </div>
                <div ref={ref} style={{ display: 'flex', flexDirection: 'column', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--lp-border)' }}>
                    {rows.map((row, i) => <FeatureRow key={i} row={row} idx={i} visible={visible} />)}
                </div>
            </div>
        </section>
    );
}
