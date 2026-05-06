import { Head, router, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

const BLUE   = "#0f2d6e";
const ACCENT = "#2563eb";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const PURPLE = "#7e22ce";
const ROSE   = "#e11d48";

function AdminDashboard({ stats: dashboardStats = {} }) {
    const { props } = usePage();
    const user   = props?.auth?.user || null;
    const counts = dashboardStats || props?.stats || {};

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const firstName = user?.name?.split(' ')[0] || null;

    const kpis = [
        {
            label: 'Établissements', value: counts.etablissements ?? 0,
            href: '/dee/etablissements', color: ORANGE, bg: '#FFFBEB',
            icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></>,
        },
        {
            label: 'Experts', value: counts.experts ?? 0,
            href: '/dee/experts', color: GREEN, bg: '#ECFDF5',
            icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
        },
        {
            label: 'Vagues', value: counts.vagues ?? counts.campagnes ?? 0,
            href: '/dee/campagnes', color: ACCENT, bg: '#EFF6FF',
            icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
        },
        {
            label: 'Dossiers', value: counts.dossiers ?? 0,
            href: '/dee/dossiers', color: PURPLE, bg: '#FAF5FF',
            icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>,
        },
        {
            label: 'Visites', value: counts.visites ?? 0,
            href: '/dee/workflow/visites', color: ROSE, bg: '#FFF1F2',
            icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
        },
    ];

    const modules = [
        { label: "Vagues d'évaluation", desc: "Créer et piloter les campagnes.", href: '/dee/campagnes',             color: ACCENT },
        { label: 'Établissements',       desc: "Gérer le réseau et l'onboarding.", href: '/dee/etablissements',    color: ORANGE },
        { label: 'Experts',              desc: 'Consulter et gérer les évaluateurs.', href: '/dee/experts',        color: GREEN  },
        { label: 'Dossiers',             desc: 'Suivre statuts et documents.',    href: '/dee/dossiers',           color: PURPLE },
        { label: 'Affectations',         desc: 'Affecter experts aux dossiers.',  href: '/dee/workflow/affectations', color: '#06b6d4' },
        { label: 'Visites',              desc: 'Planifier les visites terrain.',  href: '/dee/workflow/visites',   color: ROSE   },
    ];

    const workflow = [
        { num: '01', title: 'Créer une vague',                desc: "Définir les paramètres de la campagne." },
        { num: '02', title: 'Sélectionner les établissements', desc: 'Rattacher les établissements et envoyer les accès.' },
        { num: '03', title: 'Affecter les experts',           desc: 'Assigner les évaluateurs aux dossiers.' },
        { num: '04', title: 'Suivre les dossiers',            desc: 'Gérer statuts, rapports et visites.' },
    ];

    return (
        <>
            <Head title="Tableau de bord — DEE ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .dee-dash * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .dee-kpi-card { transition: all 0.2s ease; }
                .dee-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important; }
                .dee-module-row { transition: background 0.15s ease; }
                .dee-module-row:hover { background: #f8fafc !important; }
                .dee-action-btn { transition: all 0.18s ease; }
                .dee-action-btn:hover { transform: translateY(-2px); }
                @keyframes dee-fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .dee-fade-up { animation: dee-fadeUp 0.3s ease both; }
                @keyframes pulse2 { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
            `}</style>

            <div className="dee-dash" style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* ── Header ── */}
                <div className="dee-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', textTransform: 'capitalize', fontWeight: 500, letterSpacing: '0.02em' }}>
                            {today}
                        </p>
                        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
                            {greeting}{firstName ? `, ${firstName}` : ''} 👋
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0, fontWeight: 500 }}>
                            Bienvenue dans votre espace de gestion des évaluations ANEAQ
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 99, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 3px #bbf7d0', animation: 'pulse2 2s infinite' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>Système opérationnel</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99, background: '#fff', border: '1px solid #e2e8f0' }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── KPI cards ── */}
                <div className="dee-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: '1.5rem', animationDelay: '0.05s' }}>
                    {kpis.map((s, i) => (
                        <div key={i} className="dee-kpi-card"
                            onClick={() => router.visit(s.href)}
                            style={{ background: '#fff', border: '1px solid #e8edf3', borderRadius: 16, padding: '1.75rem', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Background decoration */}
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `${s.color}08`, pointerEvents: 'none' }} />

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 99, background: `${s.color}10`, color: s.color, fontSize: 11, fontWeight: 700 }}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                                    Voir
                                </div>
                            </div>

                            <p style={{ fontSize: 42, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.03em' }}>
                                {s.value}
                            </p>
                            <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 500 }}>{s.label}</p>

                            {/* Bottom accent */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}40)`, borderRadius: '0 0 16px 16px' }} />
                        </div>
                    ))}
                </div>

                {/* ── Grid: modules + workflow ── */}
                <div className="dee-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, animationDelay: '0.1s' }}>

                    {/* Modules */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, background: '#fafbfc' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${ACCENT}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Modules principaux</h3>
                                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Accédez directement aux sections clés</p>
                            </div>
                        </div>

                        <div style={{ padding: '0.5rem 0' }}>
                            {modules.map((mod, i) => (
                                <div key={i} className="dee-module-row"
                                    onClick={() => router.visit(mod.href)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < modules.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${mod.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="2">
                                            <polyline points="9 18 15 12 9 6"/>
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{mod.label}</p>
                                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>{mod.desc}</p>
                                    </div>
                                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Workflow + Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Workflow steps */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BLUE}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                </div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Processus d'évaluation</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {workflow.map((step) => (
                                    <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 10, color: '#fff' }}>
                                            {step.num}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{step.title}</p>
                                            <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${GREEN}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Actions rapides</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: "Créer une nouvelle vague",     href: '/dee/campagnes/create',    color: ACCENT },
                                    { label: 'Voir tous les dossiers',        href: '/dee/dossiers',            color: PURPLE },
                                    { label: 'Gérer les experts',             href: '/dee/experts',             color: GREEN  },
                                    { label: 'Voir les établissements',       href: '/dee/etablissements',      color: ORANGE },
                                ].map((a, i) => (
                                    <button key={i} className="dee-action-btn"
                                        onClick={() => router.visit(a.href)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, border: `1px solid ${a.color}20`, background: `${a.color}06`, cursor: 'pointer', textAlign: 'left' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = a.color;
                                            e.currentTarget.style.borderColor = a.color;
                                            e.currentTarget.querySelector('span').style.color = '#fff';
                                            e.currentTarget.querySelector('div').style.background = 'rgba(255,255,255,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = `${a.color}06`;
                                            e.currentTarget.style.borderColor = `${a.color}20`;
                                            e.currentTarget.querySelector('span').style.color = a.color;
                                            e.currentTarget.querySelector('div').style.background = `${a.color}12`;
                                        }}
                                    >
                                        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${a.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: a.color, transition: 'color 0.15s' }}>{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── System info strip ── */}
                <div className="dee-fade-up" style={{ marginTop: 20, background: `linear-gradient(135deg, ${BLUE}08, ${ACCENT}06)`, border: `1px solid ${BLUE}15`, borderRadius: 18, padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: '0.15s' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Informations système</p>
                    <div style={{ display: 'flex', gap: 32 }}>
                        {[
                            { label: 'Plateforme',    value: 'ANEAQ DEE v1.0' },
                            { label: 'Environnement', value: 'Production' },
                            { label: 'Base de données', value: 'MySQL — aneaq_db' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label} </span>
                                <span style={{ fontSize: 11, color: '#374151', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}

AdminDashboard.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default AdminDashboard;
