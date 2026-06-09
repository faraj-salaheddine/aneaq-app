import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

/* ─── Design tokens ─── */
const BLUE   = '#0C447C';
const BLIGHT = '#1a6abf';
const GREEN  = '#1D9E75';
const ORANGE = '#EF9F27';
const RED    = '#e53e3e';

const STATUT_META = {
    en_preparation:     { label: 'En préparation',     color: '#64748b', bg: '#f1f5f9',  dot: '#94a3b8' },
    autoeval_en_cours:  { label: 'Autoéval. en attente', color: '#b45309', bg: '#fffbeb',  dot: '#f59e0b' },
    autoeval_depose:    { label: 'Autoéval. déposée',  color: '#0e7490', bg: '#ecfeff',  dot: '#06b6d4' },
    en_evaluation:      { label: 'En évaluation',      color: BLUE,      bg: '#dbeafe',  dot: BLIGHT   },
    visite_planifiee:   { label: 'Visite planifiée',   color: '#92400e', bg: '#fef3c7',  dot: ORANGE   },
    date_visite_planifiee: { label: 'Visite planifiée',color: '#92400e', bg: '#fef3c7',  dot: ORANGE   },
    rapport_en_attente: { label: 'Rapport attendu',    color: '#991b1b', bg: '#fee2e2',  dot: RED      },
    rapport_depose:     { label: 'Rapport déposé',     color: '#166534', bg: '#dcfce7',  dot: GREEN    },
    valide:             { label: 'Validé',             color: '#166534', bg: '#dcfce7',  dot: GREEN    },
    transfere:          { label: 'Transféré',          color: '#166534', bg: '#dcfce7',  dot: GREEN    },
    cloture:            { label: 'Clôturé',            color: '#374151', bg: '#f3f4f6',  dot: '#6b7280'},
    comite_confirme:    { label: 'Comité confirmé',    color: '#166534', bg: '#dcfce7',  dot: GREEN    },
};

const FINAL_STATUSES = ['valide', 'transfere', 'cloture'];

export default function DossiersIndex({ dossiers = [] }) {
    const [tab, setTab]       = useState('en_cours');
    const [search, setSearch] = useState('');
    const [view, setView]     = useState('cards'); // 'cards' | 'table'

    const enCours   = dossiers.filter(d => !FINAL_STATUSES.includes(d.statut));
    const finalises = dossiers.filter(d =>  FINAL_STATUSES.includes(d.statut));
    const baseList  = tab === 'en_cours' ? enCours : finalises;
    const list      = search.trim()
        ? baseList.filter(d =>
            [d.nom, d.acronyme, d.universite, d.ville, d.vague]
                .some(v => v && String(v).toLowerCase().includes(search.toLowerCase()))
          )
        : baseList;

    return (
        <>
            <Head title="Dossiers affectés — Expert" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
                *, *::before, *::after { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fu  { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
                .d1  { animation-delay: .07s; }
                .d2  { animation-delay: .14s; }
                .d3  { animation-delay: .21s; }

                .doss-card { transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s; cursor: pointer; }
                .doss-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(12,68,124,.13) !important; }

                .doss-row  { transition: background .15s; cursor: pointer; }
                .doss-row:hover { background: #f8fafc !important; }

                .tab-pill  { transition: all .18s; cursor: pointer; border: none; outline: none; }
                .view-btn  { transition: background .15s, color .15s; cursor: pointer; border: none; outline: none; }
                .search-inp:focus { outline: none; border-color: ${BLUE} !important; box-shadow: 0 0 0 3px ${BLUE}18; }
                .act-btn   { transition: opacity .15s, transform .15s; }
                .act-btn:hover { opacity: .85; transform: scale(1.03); }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f8fafc 0%,#eef2f7 100%)', padding: '2rem 1.5rem 4rem' }}>
                <div style={{ maxWidth: 1240, margin: '0 auto' }}>

                    {/* ── Header ── */}
                    <div className="fu" style={{ marginBottom: 28 }}>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>
                            <a href="/expert/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Espace Expert</a>
                            <IcoChev />
                            <span style={{ color: BLUE, fontWeight: 800 }}>Dossiers affectés</span>
                        </nav>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg,${BLUE},${BLIGHT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${BLUE}38`, flexShrink: 0 }}>
                                    <IcoFolder color="#fff" size={24} />
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px' }}>Dossiers affectés</h1>
                                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                                        <span style={{ fontWeight: 800, color: BLUE }}>{enCours.length}</span> en attente ·{' '}
                                        <span style={{ fontWeight: 700, color: '#94a3b8' }}>{finalises.length}</span> finalisés ·{' '}
                                        <span style={{ fontWeight: 700, color: '#64748b' }}>{dossiers.length}</span> total
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Stat strip ── */}
                    <div className="fu d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                        <MiniStat label="Total dossiers"    value={dossiers.length}   accent={BLUE}   icon={<IcoFolder size={18} />} />
                        <MiniStat label="En attente"        value={enCours.length}    accent={BLIGHT} icon={<IcoProgress size={18} />} />
                        <MiniStat label="Finalisés"         value={finalises.length}  accent={GREEN}  icon={<IcoCheck size={18} />} />
                        <MiniStat label="Rapport attendu"   value={dossiers.filter(d => d.statut === 'rapport_en_attente').length} accent={ORANGE} icon={<IcoAlert size={18} />} />
                    </div>

                    {/* ── Controls bar ── */}
                    <div className="fu d2" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            {[
                                { key: 'en_cours',  label: 'En attente',  count: enCours.length  },
                                { key: 'finalises', label: 'Finalisés', count: finalises.length },
                            ].map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)} className="tab-pill"
                                    style={{
                                        padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                                        background: tab === t.key ? BLUE : '#fff',
                                        color:      tab === t.key ? '#fff' : '#64748b',
                                        border:     `1.5px solid ${tab === t.key ? BLUE : '#e2e8f0'}`,
                                        boxShadow:  tab === t.key ? `0 4px 14px ${BLUE}30` : 'none',
                                    }}>
                                    {t.label}
                                    <span style={{ marginLeft: 7, padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 800, background: tab === t.key ? 'rgba(255,255,255,.22)' : '#f1f5f9', color: tab === t.key ? '#fff' : '#94a3b8' }}>
                                        {t.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                <IcoSearch size={15} />
                            </span>
                            <input
                                className="search-inp"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher un établissement, ville, université…"
                                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#0f172a', transition: 'border .15s, box-shadow .15s' }}
                            />
                        </div>

                        {/* View toggle */}
                        <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#fff' }}>
                            {[
                                { key: 'cards', icon: <IcoGrid size={16} /> },
                                { key: 'table', icon: <IcoList size={16} /> },
                            ].map(v => (
                                <button key={v.key} className="view-btn" onClick={() => setView(v.key)}
                                    style={{ padding: '8px 12px', background: view === v.key ? BLUE : 'transparent', color: view === v.key ? '#fff' : '#94a3b8' }}>
                                    {v.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div className="fu d3">
                        {list.length === 0 ? (
                            <EmptyState search={search} />
                        ) : view === 'cards' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
                                {list.map(d => <DossierCard key={d.id} d={d} />)}
                            </div>
                        ) : (
                            <TableView list={list} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Dossier Card ─── */
function DossierCard({ d }) {
    const sm = STATUT_META[d.statut] || { label: d.statut || '—', color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' };
    const initials = d.acronyme ? d.acronyme.slice(0, 3).toUpperCase() : (d.nom || '?').slice(0, 2).toUpperCase();
    const roleColor = d.role_comite === 'Coordonnateur expert' ? ORANGE : BLUE;
    const roleBg    = d.role_comite === 'Coordonnateur expert' ? '#fef3c7' : '#dbeafe';

    return (
        <div className="doss-card" onClick={() => router.visit(route('expert.dossiers.show', d.id))}
            style={{ background: '#fff', border: '1px solid #e8edf3', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(12,68,124,.06)', display: 'flex', flexDirection: 'column' }}>

            {/* Card top accent */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${BLUE}, ${BLIGHT})` }} />

            <div style={{ padding: '1.4rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${BLUE}18,${BLUE}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: BLUE, flexShrink: 0, border: `1.5px solid ${BLUE}22` }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: 15, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {d.acronyme ? `${d.acronyme} — ${d.ville || '?'}` : (d.nom || '—')}
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {d.nom || d.universite || '—'}
                        </p>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 30, background: sm.bg, color: sm.color, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {sm.label}
                    </span>
                </div>

                {/* Info chips */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <InfoChip label="Université" value={d.universite} />
                    <InfoChip label="Vague"      value={d.vague} mono />
                    <InfoChip label="Domaine"    value={d.domaine_connaissances} />
                    <InfoChip label="Visite"     value={d.date_visite ? new Date(d.date_visite).toLocaleDateString('fr-FR') : '—'} accent={d.date_visite ? ORANGE : undefined} />
                </div>

                {/* Role badge */}
                {d.role_comite && (
                    <span style={{ alignSelf: 'flex-start', padding: '5px 12px', borderRadius: 30, background: roleBg, color: roleColor, fontSize: 12, fontWeight: 800 }}>
                        {d.role_comite}
                    </span>
                )}
            </div>

            {/* Card footer */}
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '.9rem 1.5rem', display: 'flex', gap: 8 }}>
                <button className="act-btn" onClick={e => { e.stopPropagation(); router.visit(route('expert.dossiers.show', d.id)); }}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: '#f8fafc', border: `1.5px solid #e2e8f0`, color: '#374151', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <IcoEye size={14} /> Voir le dossier
                </button>
                <button className="act-btn" onClick={e => { e.stopPropagation(); router.visit(route('expert.evaluations.index', d.id)); }}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: BLUE, border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, boxShadow: `0 3px 12px ${BLUE}30` }}>
                    <IcoChart size={14} /> Évaluer
                </button>
            </div>
        </div>
    );
}

/* ─── Table view ─── */
function TableView({ list }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e8edf3', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,.05)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                    <thead>
                        <tr style={{ background: '#fafbfc', borderBottom: '2px solid #f1f5f9' }}>
                            {['Établissement', 'Université', 'Domaine', 'Vague', 'Visite', 'Rôle', 'Statut', ''].map((h, i) => (
                                <th key={i} style={{ padding: '12px 16px', textAlign: i === 7 ? 'right' : 'left', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.12em', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(d => {
                            const sm = STATUT_META[d.statut] || { label: d.statut || '—', color: '#64748b', bg: '#f1f5f9' };
                            const initials = d.acronyme ? d.acronyme.slice(0, 3).toUpperCase() : (d.nom || '?').slice(0, 2).toUpperCase();
                            return (
                                <tr key={d.id} className="doss-row" onClick={() => router.visit(route('expert.dossiers.show', d.id))}
                                    style={{ borderTop: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BLUE}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: BLUE, flexShrink: 0 }}>{initials}</div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{d.acronyme} — {d.ville || '?'}</p>
                                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: 0 }}>{d.nom || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{d.universite || '—'}</td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: '#f1f5f9', color: '#475569' }}>{d.domaine_connaissances || '—'}</span>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>{d.vague || '—'}</td>
                                    <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: d.date_visite ? ORANGE : '#94a3b8' }}>
                                        {d.date_visite ? new Date(d.date_visite).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>{d.role_comite || '—'}</td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, background: sm.bg, color: sm.color }}>{sm.label}</span>
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            <button className="act-btn" onClick={() => router.visit(route('expert.dossiers.show', d.id))}
                                                style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${GREEN}40`, background: `${GREEN}0a`, color: GREEN, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                                                Voir
                                            </button>
                                            <button className="act-btn" onClick={() => router.visit(route('expert.evaluations.index', d.id))}
                                                style={{ padding: '6px 12px', borderRadius: 8, background: BLUE, border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: `0 2px 8px ${BLUE}28` }}>
                                                Évaluer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── Sub-components ─── */

function MiniStat({ label, value, accent, icon }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e8edf3', borderRadius: 16, padding: '1.1rem 1.3rem', borderTop: `3px solid ${accent}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
                    {icon}
                </div>
            </div>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: '#64748b' }}>{label}</p>
        </div>
    );
}

function InfoChip({ label, value, mono, accent }) {
    return (
        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10, padding: '.6rem .8rem' }}>
            <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.16em', color: '#94a3b8' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: accent || '#1e293b', fontFamily: mono ? 'monospace' : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</p>
        </div>
    );
}

function EmptyState({ search }) {
    return (
        <div style={{ background: '#fff', border: '1.5px dashed #e2e8f0', borderRadius: 20, padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IcoFolder size={28} color="#94a3b8" />
            </div>
            <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#374151' }}>
                {search ? 'Aucun résultat trouvé' : 'Aucun dossier dans cette catégorie'}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                {search
                    ? `Aucun dossier ne correspond à « ${search} »`
                    : 'Vos dossiers affectés apparaîtront ici une fois votre participation confirmée.'}
            </p>
        </div>
    );
}

/* ─── SVG Icons ─── */
function IcoChev() {
    return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function IcoFolder({ size = 20, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
function IcoProgress({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IcoCheck({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcoAlert({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function IcoSearch({ size = 15 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IcoGrid({ size = 16 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function IcoList({ size = 16 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function IcoChart({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IcoEye({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

DossiersIndex.layout = page => <ExpertLayout>{page}</ExpertLayout>;
