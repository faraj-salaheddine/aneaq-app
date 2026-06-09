import { Head, router, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import { useMemo, useState } from 'react';

const ACCENT = "#2563eb";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const PURPLE = "#7e22ce";
const RED    = "#e11d48";

function statusMeta(value) {
    const v = String(value || '').toLowerCase();
    if (v.includes('active'))            return { label: 'Active',    bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' };
    if (v.includes('clôtur') || v.includes('clotur')) return { label: 'Clôturée', bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' };
    return { label: value || 'Brouillon', bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' };
}

function Index({ campagnes = [] }) {
    const { props } = usePage();
    const isChefDee = props?.auth?.user?.dee_role === 'chef_dee';

    const [selectedCampagne, setSelectedCampagne] = useState(null);
    const [showDeleteModal, setShowDeleteModal]   = useState(false);
    const [search, setSearch]                     = useState('');
    const [deletePassword, setDeletePassword]     = useState('');
    const [deletePasswordError, setDeletePasswordError] = useState('');
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const stats = useMemo(() => ({
        total:         campagnes.length,
        actives:       campagnes.filter(c => String(c.statut ?? c.status ?? '').toLowerCase().includes('active')).length,
        etablissements: campagnes.reduce((s, c) => s + Number(c.etablissements_count ?? 0), 0),
        dossiers:      campagnes.reduce((s, c) => s + Number(c.dossiers_count ?? 0), 0),
    }), [campagnes]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return campagnes;
        return campagnes.filter(c =>
            [c.reference, c.annee, c.vocation, c.statut].filter(Boolean).join(' ').toLowerCase().includes(q)
        );
    }, [campagnes, search]);

    const openDeleteModal = (c) => {
        setSelectedCampagne(c);
        setDeletePassword('');
        setDeletePasswordError('');
        setShowDeleteModal(true);
    };
    const closeDeleteModal = () => {
        setSelectedCampagne(null);
        setShowDeleteModal(false);
        setDeletePassword('');
        setDeletePasswordError('');
    };
    const submitDelete = () => {
        if (!selectedCampagne) return;
        if (!isChefDee && !deletePassword.trim()) {
            setDeletePasswordError('Le mot de passe est obligatoire.');
            return;
        }
        setDeleteProcessing(true);
        router.delete(`/dee/campagnes/${selectedCampagne.id}`, {
            data: isChefDee ? {} : { password: deletePassword },
            preserveScroll: true, preserveState: true,
            onSuccess: () => { setDeleteProcessing(false); closeDeleteModal(); },
            onError: (errors) => {
                setDeleteProcessing(false);
                if (errors.password) setDeletePasswordError(errors.password);
            },
        });
    };

    return (
        <>
            <Head title="Vagues d'évaluation — DEE ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .dee-campagnes * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .dee-row:hover { background: #f8fafc !important; }
                .dee-kpi:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important; }
                @keyframes dee-fu { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .dee-fu { animation: dee-fu 0.3s ease both; }
            `}</style>

            <div className="dee-campagnes" style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* ── Header ── */}
                <div className="dee-fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', fontWeight: 500 }}>DEE — Gestion</p>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
                            Vagues d'évaluation
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0, fontWeight: 500 }}>
                            Créez, consultez et pilotez les campagnes d'évaluation des établissements.
                        </p>
                    </div>
                    <button
                        onClick={() => router.visit('/dee/campagnes/create')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: ACCENT, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 14px ${ACCENT}35` }}
                    >
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Créer une vague
                    </button>
                </div>

                {/* ── KPI cards ── */}
                <div className="dee-fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: '1.5rem', animationDelay: '0.05s' }}>
                    {[
                        { label: 'Total vagues',     value: stats.total,         color: ACCENT,  bg: '#EFF6FF', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
                        { label: 'Actives',           value: stats.actives,       color: GREEN,   bg: '#ECFDF5', icon: <><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></> },
                        { label: 'Établissements',    value: stats.etablissements, color: ORANGE,  bg: '#FFFBEB', icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></> },
                        { label: 'Dossiers',          value: stats.dossiers,      color: PURPLE,  bg: '#FAF5FF', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></> },
                    ].map((s, i) => (
                        <div key={i} className="dee-kpi" style={{ background: '#fff', border: '1px solid #e8edf3', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `${s.color}08`, pointerEvents: 'none' }} />
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                            </div>
                            <p style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</p>
                            <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 500 }}>{s.label}</p>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}40)`, borderRadius: '0 0 16px 16px' }} />
                        </div>
                    ))}
                </div>

                {/* ── Table card ── */}
                <div className="dee-fu" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', animationDelay: '0.1s' }}>
                    {/* Table header */}
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc' }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Toutes les vagues</h3>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                                {isChefDee ? 'Confirmation requise pour supprimer' : 'Suppression sécurisée via mot de passe'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ position: 'relative' }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher…"
                                    style={{ height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', paddingLeft: 32, paddingRight: 12, fontSize: 13, color: '#374151', outline: 'none', width: 220 }}
                                />
                            </div>
                            <button
                                onClick={() => router.visit('/dee/campagnes/create')}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, background: ACCENT, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                            >
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Nouvelle vague
                            </button>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: '0 auto 1rem', display: 'block' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', margin: 0 }}>Aucune vague trouvée</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                                        {['Référence', 'Année', 'Vocation', 'Statut', 'Établissements', 'Dossiers', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Actions' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((c, i) => {
                                        const sm = statusMeta(c.statut || c.status);
                                        return (
                                            <tr key={c.id} className="dee-row" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s' }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{c.reference || '—'}</p>
                                                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontFamily: "'DM Mono', monospace" }}>Créée le {c.created_at || '—'}</p>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{c.annee || '—'}</td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{c.vocation || '—'}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: sm.bg, color: sm.color }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot }} />
                                                        {sm.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{c.etablissements_count ?? 0}</td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{c.dossiers_count ?? 0}</td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                                        <button
                                                            onClick={() => router.visit(`/dee/campagnes/${c.id}`)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${ACCENT}25`, background: `${ACCENT}08`, color: ACCENT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                            Voir
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(c)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff1f2', color: RED, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Delete modal ── */}
            {showDeleteModal && selectedCampagne && (
                <div onClick={closeDeleteModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', padding: '2rem' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Confirmer la suppression</h3>
                        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
                            Vous êtes sur le point de supprimer la vague <strong style={{ color: '#0f172a' }}>{selectedCampagne.reference || `#${selectedCampagne.id}`}</strong>. Cette action est irréversible.
                        </p>

                        {!isChefDee && (
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                    Confirmez avec votre mot de passe
                                </label>
                                <input
                                    type="password"
                                    autoFocus
                                    placeholder="Votre mot de passe"
                                    value={deletePassword}
                                    onChange={e => { setDeletePassword(e.target.value); setDeletePasswordError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && submitDelete()}
                                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${deletePasswordError ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 9, fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                                />
                                {deletePasswordError && (
                                    <p style={{ margin: '5px 0 0', fontSize: 12, color: RED }}>{deletePasswordError}</p>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button onClick={closeDeleteModal} style={{ height: 38, padding: '0 16px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                            <button onClick={submitDelete} disabled={deleteProcessing} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 9, border: 'none', background: RED, color: '#fff', fontSize: 13, fontWeight: 700, cursor: deleteProcessing ? 'not-allowed' : 'pointer', opacity: deleteProcessing ? 0.6 : 1 }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                {deleteProcessing ? 'Suppression…' : 'Supprimer définitivement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <DashboardShell>{page}</DashboardShell>;
export default Index;
