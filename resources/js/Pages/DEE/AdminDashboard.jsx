import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardShell from '@/Layouts/DashboardShell';

const BLUE   = "#0C447C";
const ACCENT = "#2563eb";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const PURPLE = "#7e22ce";
const ROSE   = "#e11d48";

/* ── Modern Donut SVG chart ── */
function DonutChart({ slices, size = 160 }) {
    const r = 58, cx = 80, cy = 80;
    const circumference = 2 * Math.PI * r;
    const total = slices.reduce((s, sl) => s + sl.value, 0);
    const GAP_DEG = slices.length > 1 ? 3 : 0;
    const gapLen = (GAP_DEG / 360) * circumference;

    let offset = 0;
    const paths = slices.map((sl, i) => {
        const pct  = total > 0 ? sl.value / total : 0;
        const dash = Math.max(0, pct * circumference - gapLen);
        const gap  = circumference - dash;
        const rot  = (offset / (total || 1)) * 360 - 90;
        offset    += sl.value;
        return (
            <circle key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke={sl.color} strokeWidth={18}
                strokeDasharray={`${dash} ${gap}`}
                strokeLinecap="round"
                transform={`rotate(${rot} ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 2px 4px ${sl.color}55)` }}
            />
        );
    });

    return (
        <svg width={size} height={size} viewBox="0 0 160 160">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={18}/>
            {total > 0 && paths}
            <circle cx={cx} cy={cy} r={r - 9} fill="#fff"/>
            <text x={cx} y={cy - 10} textAnchor="middle" fontSize={30} fontWeight={800} fill="#0f172a" style={{ letterSpacing: '-1px' }}>{total}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight={600} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>dossiers</text>
            <text x={cx} y={cy + 25} textAnchor="middle" fontSize={9} fill="#cbd5e1">au total</text>
        </svg>
    );
}

/* ── Bar chart SVG ── */
function BarChart({ labels, values, color = BLUE }) {
    const max   = Math.max(...values, 1);
    const H     = 80;
    const W     = 260;
    const barW  = 28;
    const gap   = (W - labels.length * barW) / (labels.length + 1);

    return (
        <svg width={W} height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
            {values.map((v, i) => {
                const bh  = (v / max) * H;
                const x   = gap + i * (barW + gap);
                const y   = H - bh;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barW} height={bh || 2}
                            rx={5} fill={`${color}20`}/>
                        <rect x={x} y={y} width={barW} height={Math.min(bh, 6)}
                            rx={5} fill={color}/>
                        {bh > 6 && <rect x={x} y={y + 6} width={barW} height={bh - 6} fill={color} opacity={0.7}/>}
                        <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={9} fill="#94a3b8">{labels[i]}</text>
                        {v > 0 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>{v}</text>}
                    </g>
                );
            })}
        </svg>
    );
}

/* ── Statut labels & colors — covers both snake_case keys and raw DB strings ── */
const STATUT_META = {
    // snake_case keys
    en_attente_formulaire:    { label: 'En attente formulaire', color: ORANGE,       bg: '#fffbeb' },
    formulaire_complete:      { label: 'Formulaire complété',   color: '#3b82f6',    bg: '#eff6ff' },
    formulaire_soumis:        { label: 'Formulaire soumis',     color: ACCENT,       bg: '#eff6ff' },
    en_cours_evaluation:      { label: 'En cours évaluation',   color: BLUE,         bg: '#e0eaf7' },
    rapport_depose:           { label: 'Rapport déposé',        color: PURPLE,       bg: '#f5f3ff' },
    visite_programmee:        { label: 'Visite planifiée',      color: '#06b6d4',    bg: '#ecfeff' },
    valide:                   { label: 'Validé',                color: GREEN,        bg: '#ecfdf5' },
    cloture:                  { label: 'Clôturé',               color: '#64748b',    bg: '#f8fafc' },
    rejete:                   { label: 'Rejeté',                color: ROSE,         bg: '#fef2f2' },
    // Raw French strings stored in DB
    // Raw French/mixed strings stored in DB
    'Établissement sélectionné': { label: 'Sélectionné',           color: '#94a3b8', bg: '#f8fafc' },
    'En attente formulaire':     { label: 'En attente formulaire', color: ORANGE,    bg: '#fffbeb' },
    'Formulaire complété':       { label: 'Formulaire complété',   color: '#3b82f6', bg: '#eff6ff' },
    'Rapport déposé':            { label: 'Rapport déposé',        color: PURPLE,    bg: '#f5f3ff' },
    'Date de visite planifiée':  { label: 'Visite planifiée',      color: '#06b6d4', bg: '#ecfeff' },
    'En cours évaluation':       { label: 'En cours évaluation',   color: BLUE,      bg: '#e0eaf7' },
    'Validé':                    { label: 'Validé',                 color: GREEN,     bg: '#ecfdf5' },
    'Clôturé':                   { label: 'Clôturé',               color: '#64748b', bg: '#f8fafc' },
    'Rejeté':                    { label: 'Rejeté',                 color: ROSE,      bg: '#fef2f2' },
};

const ASSIGN_META = {
    en_attente_confirmation_expert: { label: 'En attente expert', color: ORANGE },
    acces_envoye:                   { label: 'Accès envoyé',       color: ACCENT },
    accepte_par_expert:             { label: 'Accepté par expert', color: BLUE   },
    confirme_par_expert:            { label: 'Confirmé',           color: GREEN  },
    comite_confirme:                { label: 'Comité confirmé',    color: GREEN  },
    refuse_par_expert:              { label: 'Refusé',             color: ROSE   },
};

export default function AdminDashboard({
    stats: dashboardStats = {},
    dossierParStatut      = {},
    affectationsParStatut = {},
    graphMoisLabels       = [],
    graphMoisValeurs      = [],
    activiteRecente       = [],
    topExperts            = [],
}) {
    const { props } = usePage();
    const user      = props?.auth?.user || null;
    const counts    = dashboardStats || {};

    const [clock, setClock] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setClock(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const today    = clock.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hour     = clock.getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const firstName = user?.name?.split(' ')[0] || null;

    // KPI cards
    const kpis = [
        { label: 'Établissements', value: counts.etablissements ?? 0,  href: '/dee/etablissements',    color: ORANGE, bg: '#FFFBEB',
          icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></> },
        { label: 'Experts',        value: counts.experts ?? 0,         href: '/dee/experts',           color: GREEN,  bg: '#ECFDF5',
          icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
        { label: 'Campagnes',      value: counts.vagues ?? 0,          href: '/dee/campagnes',         color: ACCENT, bg: '#EFF6FF',
          icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
        { label: 'Dossiers',       value: counts.dossiers ?? 0,        href: '/dee/dossiers',          color: PURPLE, bg: '#FAF5FF',
          icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></> },
        { label: 'Rapports en att.', value: counts.rapports_en_attente ?? 0, href: '/dee/dossiers',  color: ROSE,   bg: '#FFF1F2',
          icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
        { label: 'Visites planif.',  value: counts.visites ?? 0,        href: '/dee/workflow/visites', color: '#06b6d4', bg: '#ECFEFF',
          icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
    ];

    // Donut slices — sorted descending, unknowns get a graceful fallback
    const FALLBACK_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#06b6d4','#8b5cf6','#ec4899','#0ea5e9'];
    let fbIdx = 0;
    const donutSlices = Object.entries(dossierParStatut)
        .map(([statut, total]) => {
            const meta = STATUT_META[statut];
            return {
                label: meta?.label ?? statut,
                color: meta?.color ?? FALLBACK_COLORS[fbIdx++ % FALLBACK_COLORS.length],
                bg:    meta?.bg    ?? '#f8fafc',
                value: Number(total),
            };
        })
        .filter(sl => sl.value > 0)
        .sort((a, b) => b.value - a.value);
    const donutTotal = donutSlices.reduce((s, sl) => s + sl.value, 0);

    return (
        <>
            <Head title="Tableau de bord — DEE ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .dee-dash * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .dee-kpi-card { transition: all 0.2s ease; cursor: pointer; }
                .dee-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(0,0,0,0.1) !important; }
                .dee-row-hover { transition: background 0.12s; cursor: pointer; }
                .dee-row-hover:hover { background: #f8fafc !important; }
                .dee-action-btn { transition: all 0.18s ease; cursor: pointer; }
                .dee-action-btn:hover { transform: translateY(-2px); }
                @keyframes dee-fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                .dee-fu { animation: dee-fadeUp 0.35s ease both; }
                @keyframes pulse2 { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
            `}</style>

            <div className="dee-dash" style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* ── Header ── */}
                <div className="dee-fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', textTransform: 'capitalize', fontWeight: 500 }}>{today}</p>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
                            {greeting}{firstName ? `, ${firstName}` : ''} 👋
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0, fontWeight: 500 }}>Tableau de bord DEE — ANEAQ</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 99, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse2 2s infinite' }}/>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>Système opérationnel</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, background: '#fff', border: '1px solid #e2e8f0' }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{clock.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                {/* ── KPI Row ── */}
                <div className="dee-fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 20, animationDelay: '0.05s' }}>
                    {kpis.map((s, i) => (
                        <div key={i} className="dee-kpi-card" onClick={() => router.visit(s.href)}
                            style={{ background: '#fff', border: '1px solid #e8edf3', borderRadius: 16, padding: '1.4rem', boxShadow: '0 1px 5px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -18, right: -18, width: 80, height: 80, borderRadius: '50%', background: `${s.color}08`, pointerEvents: 'none' }}/>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                            </div>
                            <p style={{ fontSize: 34, fontWeight: 700, color: '#0f172a', margin: '0 0 3px', lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>{s.label}</p>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}40)`, borderRadius: '0 0 16px 16px' }}/>
                        </div>
                    ))}
                </div>

                {/* ── Row 2 : Donut + Bar + Top experts ── */}
                <div className="dee-fu" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16, animationDelay: '0.1s' }}>

                    {/* Donut — dossiers par statut */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: PURPLE, display: 'inline-block' }}/>
                                Dossiers par statut
                            </p>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 99, padding: '2px 8px' }}>
                                {donutSlices.length} statut{donutSlices.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {donutSlices.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', color: '#94a3b8' }}>
                                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                                <p style={{ fontSize: 12, margin: '8px 0 0' }}>Aucun dossier</p>
                            </div>
                        ) : (
                            <>
                                {/* Donut centered */}
                                <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 12px' }}>
                                    <DonutChart slices={donutSlices}/>
                                </div>

                                {/* Legend with progress bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {donutSlices.map((sl, i) => {
                                        const pct = donutTotal > 0 ? Math.round((sl.value / donutTotal) * 100) : 0;
                                        return (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                                                        <span style={{ width: 9, height: 9, borderRadius: 3, background: sl.color, flexShrink: 0, boxShadow: `0 1px 3px ${sl.color}66` }}/>
                                                        <span style={{ fontSize: 11, color: '#374151', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{sl.label}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                                        <span style={{ fontSize: 10, fontWeight: 700, color: sl.color, background: sl.bg, padding: '1px 6px', borderRadius: 99 }}>{pct}%</span>
                                                        <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', minWidth: 18, textAlign: 'right' }}>{sl.value}</span>
                                                    </div>
                                                </div>
                                                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${sl.color}, ${sl.color}99)`, borderRadius: 99, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }}/>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bar — activité mensuelle */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, display: 'inline-block' }}/>
                            Dossiers créés (6 mois)
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <BarChart labels={graphMoisLabels} values={graphMoisValeurs} color={BLUE}/>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                            <div>
                                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total 6 mois</p>
                                <p style={{ fontSize: 20, fontWeight: 700, color: BLUE, margin: 0 }}>{graphMoisValeurs.reduce((a, b) => a + b, 0)}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 500 }}>Ce mois</p>
                                <p style={{ fontSize: 20, fontWeight: 700, color: GREEN, margin: 0 }}>{graphMoisValeurs[graphMoisValeurs.length - 1] ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Affectations par statut */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, display: 'inline-block' }}/>
                            Affectations experts
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {Object.keys(ASSIGN_META).map(key => {
                                const val   = affectationsParStatut[key] ?? 0;
                                const total = Object.values(affectationsParStatut).reduce((a, b) => a + b, 0) || 1;
                                const pct   = Math.round((val / total) * 100);
                                const meta  = ASSIGN_META[key];
                                return (
                                    <div key={key}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{meta.label}</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{val}</span>
                                        </div>
                                        <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 99, transition: 'width 0.5s ease' }}/>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Row 3 : Activité récente + Top experts + Actions ── */}
                <div className="dee-fu" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 280px', gap: 16, animationDelay: '0.15s' }}>

                    {/* Activité récente */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Activité récente</p>
                            <button onClick={() => router.visit('/dee/dossiers')}
                                style={{ fontSize: 11, fontWeight: 600, color: BLUE, background: `${BLUE}10`, border: 'none', borderRadius: 99, padding: '5px 12px', cursor: 'pointer' }}>
                                Voir tous
                            </button>
                        </div>
                        {activiteRecente.length === 0
                            ? <p style={{ padding: '1.5rem', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>Aucune activité</p>
                            : activiteRecente.map((d, i) => {
                                const meta = STATUT_META[d.statut] ?? { label: d.statut, color: '#94a3b8' };
                                return (
                                    <div key={i} className="dee-row-hover"
                                        onClick={() => router.visit(`/dee/dossiers/${d.id}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < activiteRecente.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.etablissement}</p>
                                            <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{d.reference} · {d.updated_at}</p>
                                        </div>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${meta.color}15`, color: meta.color, flexShrink: 0 }}>{meta.label}</span>
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* Top experts */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Top experts actifs</p>
                        </div>
                        {topExperts.length === 0
                            ? <p style={{ padding: '1.5rem', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>Aucun expert affecté</p>
                            : topExperts.map((e, i) => {
                                const initiales = `${e.prenom?.[0] ?? ''}${e.nom?.[0] ?? ''}`.toUpperCase() || '?';
                                const colors    = [BLUE, GREEN, PURPLE, ORANGE, ROSE];
                                const c         = colors[i % colors.length];
                                return (
                                    <div key={i} className="dee-row-hover"
                                        onClick={() => router.visit(`/dee/experts/${e.id}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: i < topExperts.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c, flexShrink: 0 }}>
                                            {initiales}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {e.prenom} {e.nom}
                                            </p>
                                            <p style={{ fontSize: 11, color: '#94a3b8', margin: '1px 0 0' }}>{e.nb_dossiers} dossier{e.nb_dossiers > 1 ? 's' : ''}</p>
                                        </div>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: c }}>
                                            {i + 1}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* Actions rapides */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Actions rapides</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'Créer une vague',      href: '/dee/campagnes/create',    color: ACCENT },
                                { label: 'Voir les dossiers',    href: '/dee/dossiers',            color: PURPLE },
                                { label: 'Gérer les experts',    href: '/dee/experts',             color: GREEN  },
                                { label: 'Établissements',       href: '/dee/etablissements',      color: ORANGE },
                                { label: 'Planifier une visite', href: '/dee/workflow/visites',    color: ROSE   },
                            ].map((a, i) => (
                                <button key={i} className="dee-action-btn" onClick={() => router.visit(a.href)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10, border: `1.5px solid ${a.color}20`, background: `${a.color}06`, textAlign: 'left', width: '100%' }}>
                                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Mini stats */}
                        <div style={{ marginTop: 16, padding: '14px', borderRadius: 12, background: `${BLUE}06`, border: `1px solid ${BLUE}15` }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>En ce moment</p>
                            {[
                                { label: 'Rapports en attente', value: counts.rapports_en_attente ?? 0, color: ROSE   },
                                { label: 'Rapports validés',    value: counts.rapports_valides   ?? 0, color: GREEN  },
                                { label: 'Campagnes actives',   value: counts.campagnes_actives  ?? 0, color: ACCENT },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

AdminDashboard.layout = (page) => <DashboardShell>{page}</DashboardShell>;
