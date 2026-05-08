import { Head, Link, useForm } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import { useMemo, useState } from 'react';

const ACCENT = "#2563eb";
const GREEN  = "#1D9E75";
const PURPLE = "#7e22ce";
const RED    = "#e11d48";

const STATUS_LABELS = {
    etablissement_selectionne:        'Établissement sélectionné',
    compte_etablissement_cree:        'Compte établissement créé',
    en_attente_formulaire:            'En attente formulaire',
    formulaire_rempli:                'Formulaire rempli',
    rapport_autoevaluation_ajoute:    "Rapport d'autoévaluation ajouté",
    annexe_ajoutee:                   'Annexe ajoutée',
    rapport_expert_ajoute:            'Rapport expert ajouté',
    date_visite_planifiee:            'Date de visite planifiée',
};

function formatStatus(status) {
    return STATUS_LABELS[status] || status || '—';
}

function getStatusMeta(status) {
    const s = String(status || '');
    if (s.includes('visite'))     return { bg: '#EFF6FF', color: ACCENT,  dot: ACCENT  };
    if (s.includes('rapport'))    return { bg: '#FAF5FF', color: PURPLE,  dot: PURPLE  };
    if (s.includes('formulaire') && s.includes('rempli')) return { bg: '#ECFDF5', color: GREEN, dot: GREEN };
    if (s.includes('formulaire')) return { bg: '#FFFBEB', color: '#d97706', dot: '#f59e0b' };
    if (s.includes('compte'))     return { bg: '#f0fdfa', color: '#0d9488', dot: '#14b8a6' };
    return { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' };
}

function getText(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
        return value.nom ?? value.etablissement_2 ?? value.etablissement ??
               value.name ?? value.reference ?? value.ville ?? '—';
    }
    return String(value);
}

function getEtablissementName(d) {
    return getText(d.etablissement?.nom ?? d.etablissement_nom ?? d.nom_etablissement ?? d.etablissement);
}
function getVille(d) {
    return getText(d.etablissement?.ville ?? d.ville ?? d.etablissement_ville);
}
function getCampagne(d) {
    return getText(d.campagne?.reference ?? d.campagne_reference ?? d.campagne);
}

function getRawDateVisite(d) {
    return d.date_visite_value ?? d.date_visite ?? d.date_visite_planifiee ?? d.visite?.date_visite ?? '';
}

function hasDateVisite(d) {
    const v = String(getRawDateVisite(d) ?? '').trim().toLowerCase();
    return v && !['—', '-', 'null', 'undefined', 'non définie', 'non definie', 'non planifiée', 'non planifiee'].includes(v);
}

function formatDateVisite(d) {
    if (!hasDateVisite(d)) return '—';
    const text = String(getRawDateVisite(d));
    if (text.includes('/')) return text;
    const date = new Date(text);
    if (isNaN(date.getTime())) return text;
    return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DossiersIndex({ dossiers = [] }) {
    const [search, setSearch]                     = useState('');
    const [selectedDossier, setSelectedDossier]   = useState(null);
    const [showDeleteModal, setShowDeleteModal]   = useState(false);

    const deleteForm = useForm({ delete_password: '' });

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return dossiers;
        return dossiers.filter((d) =>
            [d.reference, getEtablissementName(d), getVille(d), getCampagne(d),
             formatStatus(d.statut), formatDateVisite(d)]
                .filter(Boolean).join(' ').toLowerCase().includes(q)
        );
    }, [dossiers, search]);

    const statsByStatus = useMemo(() => {
        const withVisite  = dossiers.filter((d) => hasDateVisite(d)).length;
        const withRapport = dossiers.filter((d) => String(d.statut || '').includes('rapport')).length;
        return { total: dossiers.length, withVisite, withRapport };
    }, [dossiers]);

    const openDeleteModal = (dossier) => {
        setSelectedDossier(dossier);
        deleteForm.setData('delete_password', '');
        deleteForm.clearErrors();
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedDossier(null);
        setShowDeleteModal(false);
        deleteForm.reset();
        deleteForm.clearErrors();
    };

    const submitDelete = (e) => {
        e.preventDefault();
        deleteForm.clearErrors();
        if (!selectedDossier) return;
        if (!deleteForm.data.delete_password.trim()) {
            deleteForm.setError('delete_password', 'Le mot de passe est obligatoire.');
            return;
        }
        deleteForm.delete(`/dee/dossiers/${selectedDossier.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: closeDeleteModal,
            onError: (errors) =>
                deleteForm.setError('delete_password', errors.delete_password || 'Mot de passe incorrect.'),
        });
    };

    return (
        <>
            <Head title="Dossiers — DEE ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .dee-dossiers * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .dee-row:hover { background: #f8fafc !important; }
                .dee-kpi:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important; }
                @keyframes dee-fu { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .dee-fu { animation: dee-fu 0.3s ease both; }
            `}</style>

            <div className="dee-dossiers" style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* ── Header ── */}
                <div className="dee-fu" style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', fontWeight: 500 }}>DEE — Gestion</p>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
                        Liste des dossiers
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0, fontWeight: 500 }}>
                        Dossiers créés automatiquement après confirmation des établissements dans une vague.
                    </p>
                </div>

                {/* ── KPI cards ── */}
                <div className="dee-fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '1.5rem', animationDelay: '0.05s' }}>
                    {[
                        { label: 'Total dossiers',        value: statsByStatus.total,      color: GREEN,  bg: '#ECFDF5', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></> },
                        { label: 'Avec visite planifiée', value: statsByStatus.withVisite,  color: ACCENT, bg: '#EFF6FF', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
                        { label: 'Avec rapport',          value: statsByStatus.withRapport, color: PURPLE, bg: '#FAF5FF', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> },
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
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc' }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dossiers enregistrés</h3>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Total : {filtered.length} — Suppression sécurisée via mot de passe</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Dossier, établissement, statut…"
                                style={{ height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', paddingLeft: 32, paddingRight: 12, fontSize: 13, color: '#374151', outline: 'none', width: 260 }}
                            />
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: '0 auto 1rem', display: 'block' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', margin: 0 }}>Aucun dossier trouvé</p>
                            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Aucun résultat ne correspond à votre recherche.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: 960, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                                        {['Référence', 'Établissement', 'Campagne', 'Statut', 'Date visite', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Actions' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((dossier, i) => {
                                        const sm = getStatusMeta(dossier.statut);
                                        return (
                                            <tr key={dossier.id} className="dee-row" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s' }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'DM Mono', monospace" }}>{dossier.reference || '—'}</p>
                                                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>ID : {dossier.id}</p>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{getEtablissementName(dossier)}</p>
                                                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{getVille(dossier)}</p>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: '#374151' }}>
                                                    {getCampagne(dossier)}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: sm.bg, color: sm.color }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot, flexShrink: 0 }} />
                                                        {formatStatus(dossier.statut)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                                        {formatDateVisite(dossier)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                                        <Link
                                                            href={`/dee/dossiers/${dossier.id}`}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: ACCENT, color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                                                        >
                                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                            Voir
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(dossier)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff1f2', color: RED, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
            {showDeleteModal && selectedDossier && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#fff1f2', color: RED, marginBottom: 10 }}>
                                        Suppression sécurisée
                                    </span>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Confirmer la suppression</h3>
                                    <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0', lineHeight: 1.5 }}>
                                        Saisissez le mot de passe administrateur DEE pour supprimer le dossier{' '}
                                        <strong style={{ color: '#0f172a' }}>
                                            {selectedDossier.reference || `#${selectedDossier.id}`}
                                        </strong>.
                                    </p>
                                </div>
                                <button onClick={closeDeleteModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={submitDelete} style={{ padding: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Mot de passe DEE</label>
                            <div style={{ position: 'relative' }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <input
                                    type="password"
                                    value={deleteForm.data.delete_password}
                                    onChange={e => {
                                        deleteForm.setData('delete_password', e.target.value);
                                        deleteForm.clearErrors('delete_password');
                                    }}
                                    placeholder="Mot de passe de confirmation"
                                    style={{ height: 42, width: '100%', borderRadius: 10, border: deleteForm.errors.delete_password ? '1px solid #fca5a5' : '1px solid #e2e8f0', paddingLeft: 36, paddingRight: 12, fontSize: 13, color: '#0f172a', outline: 'none', background: '#fafbfc' }}
                                />
                            </div>
                            {deleteForm.errors.delete_password && (
                                <p style={{ fontSize: 12, color: RED, margin: '6px 0 0', fontWeight: 500 }}>{deleteForm.errors.delete_password}</p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={closeDeleteModal} style={{ height: 38, padding: '0 16px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                                <button type="submit" disabled={deleteForm.processing} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 9, border: 'none', background: RED, color: '#fff', fontSize: 13, fontWeight: 700, cursor: deleteForm.processing ? 'not-allowed' : 'pointer', opacity: deleteForm.processing ? 0.6 : 1 }}>
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    {deleteForm.processing ? 'Suppression…' : 'Supprimer définitivement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

DossiersIndex.layout = (page) => <DashboardShell>{page}</DashboardShell>;
export default DossiersIndex;
