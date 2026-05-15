import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardShell from '@/Layouts/DashboardShell';

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const ROSE   = "#e11d48";
const PURPLE = "#7e22ce";

const ACTION_META = {
    dossier_mis_a_jour:  { label: 'Mise à jour dossier', color: BLUE,   icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
    dossier_supprime:    { label: 'Suppression dossier', color: ROSE,   icon: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' },
    expert_affecte:      { label: 'Affectation expert',  color: PURPLE, icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    expert_confirme:     { label: 'Confirmation expert', color: GREEN,  icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' },
    expert_refuse:       { label: 'Refus expert',        color: ROSE,   icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M23 11l-5 5-2-2' },
    rapport_depose:      { label: 'Rapport déposé',      color: ORANGE, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
    connexion:           { label: 'Connexion',           color: GREEN,  icon: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3' },
};

const ROLE_COLOR = {
    admin_dee:      BLUE,
    expert:         GREEN,
    etablissement:  ORANGE,
    si:             PURPLE,
};

export default function AuditTrail({ logs, actions, roles, filters = {} }) {
    const [search, setSearch]     = useState(filters.search ?? '');
    const [action, setAction]     = useState(filters.action ?? '');
    const [role,   setRole]       = useState(filters.role   ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo,   setDateTo]   = useState(filters.date_to   ?? '');

    const applyFilters = () => {
        router.get('/dee/audit', { search, action, role, date_from: dateFrom, date_to: dateTo }, { preserveState: true, replace: true });
    };

    const reset = () => {
        setSearch(''); setAction(''); setRole(''); setDateFrom(''); setDateTo('');
        router.get('/dee/audit', {}, { replace: true });
    };

    const items   = logs?.data ?? [];
    const meta    = logs?.meta ?? {};
    const links   = logs?.links ?? {};

    return (
        <>
            <Head title="Audit Trail — DEE ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .audit-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .audit-row { transition: background 0.1s; }
                .audit-row:hover { background: #f8fafc !important; }
                .audit-input { border: 1.5px solid #e2e8f0; border-radius: 9px; padding: 8px 12px; font-size: 13px; outline: none; transition: border-color 0.15s; background: #fff; }
                .audit-input:focus { border-color: ${BLUE}; box-shadow: 0 0 0 3px ${BLUE}15; }
                .audit-select { border: 1.5px solid #e2e8f0; border-radius: 9px; padding: 8px 12px; font-size: 13px; outline: none; background: #fff; cursor: pointer; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .au-fu { animation: fadeUp 0.3s ease both; }
            `}</style>

            <div className="audit-root" style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* Header */}
                <div className="au-fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>Journal d'activité</h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Historique complet des actions effectuées sur la plateforme</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, background: `${BLUE}08`, border: `1px solid ${BLUE}15` }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: BLUE }}>{meta.total ?? items.length} entrées</span>
                    </div>
                </div>

                {/* Filtres */}
                <div className="au-fu" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', animationDelay: '0.05s' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Recherche</label>
                            <input className="audit-input" style={{ width: '100%' }} placeholder="Description, acteur, modèle..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Action</label>
                            <select className="audit-select" style={{ width: '100%' }} value={action} onChange={e => setAction(e.target.value)}>
                                <option value="">Toutes</option>
                                {actions.map(a => <option key={a} value={a}>{ACTION_META[a]?.label ?? a}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Rôle</label>
                            <select className="audit-select" style={{ width: '100%' }} value={role} onChange={e => setRole(e.target.value)}>
                                <option value="">Tous</option>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Du</label>
                            <input type="date" className="audit-input" style={{ width: '100%' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Au</label>
                            <input type="date" className="audit-input" style={{ width: '100%' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={applyFilters}
                                style={{ padding: '9px 18px', borderRadius: 9, background: BLUE, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Filtrer
                            </button>
                            <button onClick={reset}
                                style={{ padding: '9px 14px', borderRadius: 9, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: 13, cursor: 'pointer' }}>
                                ✕
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="au-fu" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden', animationDelay: '0.1s' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['Date / Heure', 'Action', 'Acteur', 'Rôle', 'Description', 'Objet'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0
                                ? <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Aucune activité enregistrée</td></tr>
                                : items.map((log, i) => {
                                    const meta  = ACTION_META[log.action] ?? { label: log.action, color: '#94a3b8', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' };
                                    const roleC = ROLE_COLOR[log.role] ?? '#94a3b8';
                                    return (
                                        <tr key={i} className="audit-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                                                    {log.created_at ? new Date(log.created_at).toLocaleDateString('fr-FR') : '—'}
                                                </p>
                                                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontFamily: "'DM Mono', monospace" }}>
                                                    {log.created_at ? new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </p>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: `${meta.color}12`, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={meta.icon}/></svg>
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                                {log.performed_by ?? '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {log.role && (
                                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: `${roleC}15`, color: roleC }}>
                                                        {log.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', maxWidth: 280 }}>
                                                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {log.description ?? log.details ?? '—'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>
                                                {log.model_name ?? '—'}
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {(meta.last_page ?? 1) > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                Page {meta.current_page} / {meta.last_page} — {meta.total} entrées
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {links.prev && (
                                    <button onClick={() => router.get(links.prev)}
                                        style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: BLUE }}>
                                        ← Précédent
                                    </button>
                                )}
                                {links.next && (
                                    <button onClick={() => router.get(links.next)}
                                        style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: BLUE }}>
                                        Suivant →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AuditTrail.layout = (page) => <DashboardShell>{page}</DashboardShell>;
