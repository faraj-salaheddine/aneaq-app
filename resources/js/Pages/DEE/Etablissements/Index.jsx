import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import { useMemo, useState } from 'react';

const ACCENT = "#2563eb";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#e11d48";

function EtablissementsIndex({ etablissements = [] }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [search, setSearch]           = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem]   = useState(null);

    const { data, setData, patch, reset, processing, errors, clearErrors } = useForm({
        etablissement: '', etablissement_2: '', ville: '', universite: '', email: '',
    });

    const filteredEtablissements = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return etablissements;
        return etablissements.filter((item) =>
            [item.display_name, item.etablissement, item.etablissement_2, item.ville, item.universite, item.email]
                .filter(Boolean).join(' ').toLowerCase().includes(q)
        );
    }, [search, etablissements]);

    const totalCampagnes = useMemo(() => etablissements.reduce((s, i) => s + Number(i.campagnes_count || 0), 0), [etablissements]);
    const totalDossiers  = useMemo(() => etablissements.reduce((s, i) => s + Number(i.dossiers_count  || 0), 0), [etablissements]);

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            etablissement:   item.etablissement || '',
            etablissement_2: item.etablissement_2 || item.display_name || '',
            ville:           item.ville || '',
            universite:      item.universite || '',
            email:           item.email || '',
        });
        clearErrors();
    };

    const closeEditModal = () => { setEditingItem(null); reset(); clearErrors(); };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingItem) return;
        patch(`/dee/etablissements/${editingItem.id}`, { preserveScroll: true, onSuccess: closeEditModal });
    };

    const submitDelete = () => {
        if (!deleteItem) return;
        router.delete(`/dee/etablissements/${deleteItem.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <>
            <Head title="Établissements — DEE ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .dee-etabs * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .dee-row:hover { background: #f8fafc !important; }
                .dee-kpi:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important; }
                @keyframes dee-fu { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .dee-fu { animation: dee-fu 0.3s ease both; }
                .dee-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; }
            `}</style>

            <div className="dee-etabs" style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* ── Header ── */}
                <div className="dee-fu" style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', fontWeight: 500 }}>DEE — Gestion</p>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
                        Gestion des établissements
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0, fontWeight: 500 }}>
                        Consultez, modifiez et gérez les établissements rattachés aux vagues.
                    </p>
                </div>

                {/* ── KPI cards ── */}
                <div className="dee-fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '1.5rem', animationDelay: '0.05s' }}>
                    {[
                        { label: 'Établissements',  value: etablissements.length, color: ACCENT,  bg: '#EFF6FF', icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M3 9l9-7 9 7"/></> },
                        { label: 'Campagnes liées', value: totalCampagnes,        color: ORANGE,  bg: '#FFFBEB', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
                        { label: 'Dossiers liés',   value: totalDossiers,         color: GREEN,   bg: '#ECFDF5', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></> },
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

                {/* ── Flash ── */}
                {flash.success && (
                    <div className="dee-fu" style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600, animationDelay: '0.08s' }}>
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="dee-fu" style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#fff1f2', border: '1px solid #fecaca', color: RED, fontSize: 13, fontWeight: 600, animationDelay: '0.08s' }}>
                        {flash.error}
                    </div>
                )}

                {/* ── Table card ── */}
                <div className="dee-fu" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', animationDelay: '0.1s' }}>
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc' }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Tous les établissements</h3>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Cliquez sur le nom pour accéder à l'historique complet</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Nom, ville, université ou email…"
                                style={{ height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', paddingLeft: 32, paddingRight: 12, fontSize: 13, color: '#374151', outline: 'none', width: 280 }}
                            />
                        </div>
                    </div>

                    {filteredEtablissements.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: '0 auto 1rem', display: 'block' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M3 9l9-7 9 7"/></svg>
                            <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', margin: 0 }}>Aucun établissement trouvé</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                                        {['Établissement', 'Ville', 'Université', 'Email', 'Campagnes', 'Dossiers', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: ['Campagnes', 'Dossiers', 'Actions'].includes(h) ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEtablissements.map((item, i) => (
                                        <tr key={item.id} className="dee-row" style={{ borderBottom: i < filteredEtablissements.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s', verticalAlign: 'top' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <Link
                                                    href={`/dee/etablissements/${item.id}`}
                                                    style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', textDecoration: 'none', display: 'block' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#0f172a'}
                                                >
                                                    {item.display_name || '—'}
                                                </Link>
                                                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{item.etablissement || '—'}</p>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                    {item.ville || '—'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', maxWidth: 200 }}>{item.universite || '—'}</td>
                                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                                    {item.email || '—'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, height: 22, borderRadius: 99, background: '#f1f5f9', fontSize: 12, fontWeight: 700, color: '#475569', padding: '0 8px' }}>
                                                    {item.campagnes_count ?? 0}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, height: 22, borderRadius: 99, background: '#f1f5f9', fontSize: 12, fontWeight: 700, color: '#475569', padding: '0 8px' }}>
                                                    {item.dossiers_count ?? 0}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                    <Link
                                                        href={`/dee/etablissements/${item.id}`}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: `1px solid ${ACCENT}25`, background: `${ACCENT}08`, color: ACCENT, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                                                    >
                                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
                                                        Historique
                                                    </Link>
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: `1px solid ${ORANGE}30`, background: '#FFFBEB', color: ORANGE, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteItem(item)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff1f2', color: RED, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Edit modal ── */}
            {editingItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Modification</span>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>Modifier l'établissement</h3>
                            </div>
                            <button onClick={closeEditModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <form onSubmit={submitEdit} style={{ padding: '1.5rem 1.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <EField label="Nom principal"  value={data.etablissement_2} onChange={v => setData('etablissement_2', v)} error={errors.etablissement_2} />
                                <EField label="Nom secondaire" value={data.etablissement}   onChange={v => setData('etablissement', v)}   error={errors.etablissement} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <EField label="Ville"      value={data.ville}      onChange={v => setData('ville', v)}      error={errors.ville} />
                                    <EField label="Université" value={data.universite} onChange={v => setData('universite', v)} error={errors.universite} />
                                </div>
                                <EField label="Email" type="email" value={data.email} onChange={v => setData('email', v)} error={errors.email} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                                <button type="button" onClick={closeEditModal} style={{ height: 38, padding: '0 16px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                                <button type="submit" disabled={processing} style={{ height: 38, padding: '0 20px', borderRadius: 9, border: 'none', background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1 }}>
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete confirm modal ── */}
            {deleteItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#fff1f2', color: RED, marginBottom: 10 }}>
                                        Suppression
                                    </span>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Confirmer la suppression</h3>
                                </div>
                                <button onClick={() => setDeleteItem(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px', lineHeight: 1.6 }}>
                                Vous allez supprimer définitivement l'établissement :{' '}
                                <strong style={{ color: '#0f172a' }}>{deleteItem.display_name}</strong>
                            </p>
                            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                                La suppression sera refusée si l'établissement est encore lié à des campagnes ou dossiers.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => setDeleteItem(null)} style={{ height: 38, padding: '0 16px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                                <button type="button" onClick={submitDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 9, border: 'none', background: RED, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    Supprimer définitivement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function EField({ label, value, onChange, error, type = 'text' }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="dee-input"
                style={{ height: 38, width: '100%', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fafbfc', padding: '0 12px', fontSize: 13, color: '#0f172a', outline: 'none', transition: 'border 0.15s, box-shadow 0.15s' }}
            />
            {error && <p style={{ fontSize: 11, color: '#e11d48', margin: '4px 0 0' }}>{error}</p>}
        </div>
    );
}

EtablissementsIndex.layout = (page) => <DashboardShell>{page}</DashboardShell>;
export default EtablissementsIndex;
