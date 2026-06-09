import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

const BLUE   = '#0C447C';
const GREEN  = '#15803d';
const RED    = '#dc2626';
const ORANGE = '#c2410c';
const PURPLE = '#7c3aed';

const S = {
    brouillon:             { label: 'Brouillon',       bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
    soumise_dee:           { label: 'Soumise DEE',     bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    renvoyee_expert:       { label: 'Renvoyée expert', bg: '#fff7ed', color: ORANGE,    border: '#fed7aa' },
    validee_dee:           { label: 'Validée DEE',     bg: '#f0fdf4', color: GREEN,     border: '#bbf7d0' },
    envoyee_etablissement: { label: 'Envoyée étab.',   bg: '#faf5ff', color: PURPLE,    border: '#e9d5ff' },
    en_cours:              { label: 'En cours',        bg: '#fefce8', color: '#a16207', border: '#fef08a' },
    cloturee:              { label: 'Clôturée',        bg: '#f0fdf4', color: '#166534', border: '#86efac' },
};

const U = {
    rouge:  { label: 'Urgent',       color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    orange: { label: 'Modéré',       color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    vert:   { label: 'Satisfaisant', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
};

const MEO = {
    sans_echeance: { label: 'Sans échéance', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    non_demarree:  { label: 'Non démarrée',  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    en_cours:      { label: 'En cours',      bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    realisee:      { label: 'Réalisée',      bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    en_attente:    { label: 'En attente',    bg: '#fefce8', color: '#a16207', border: '#fef08a' },
};

const ORDER = ['soumise_dee','renvoyee_expert','validee_dee','envoyee_etablissement','en_cours','brouillon','cloturee'];

function Badge({ statut }) {
    const cfg = S[statut] || S.brouillon;
    return (
        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {cfg.label}
        </span>
    );
}

function UBadge({ urgence }) {
    const cfg = U[urgence] || U.vert;
    return (
        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
            {cfg.label}
        </span>
    );
}

function PreuveBadge({ count }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: count > 0 ? '#f0fdf4' : '#f8fafc', color: count > 0 ? '#15803d' : '#94a3b8', border: `1px solid ${count > 0 ? '#86efac' : '#e2e8f0'}`, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 800 }}>
            {count > 0 ? '📎' : '📋'} {count > 0 ? `${count} preuve(s)` : 'Sans preuve'}
        </span>
    );
}

function Btn({ onClick, color, bg, children, disabled = false, outline = false, style = {} }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: outline ? `1.5px solid ${color}` : 'none', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? '#e2e8f0' : (outline ? (bg || 'transparent') : color), color: disabled ? '#94a3b8' : (outline ? color : '#fff'), transition: 'all .12s', ...style }}>
            {children}
        </button>
    );
}

function Modal({ open, onClose, title, subtitle, children }) {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: 540, maxWidth: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.22)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{title}</h3>
                        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, marginLeft: 12 }}>×</button>
                    </div>
                    {subtitle && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>{subtitle}</p>}
                </div>
                {children}
            </div>
        </div>
    );
}

export default function SuiviRecommandationsTab({ dossier, recommandations = [], stats = {}, rappels = [], prochainRappel, etablissement = {} }) {
    const { flash = {} } = usePage().props;

    const [modal, setModal]           = useState(null);
    const [selected, setSelected]     = useState(null);
    const [commentaire, setCommentaire] = useState('');
    const [rappelType, setRappelType] = useState('standard');
    const [rappelMsg, setRappelMsg]   = useState('');
    const [processing, setProcessing] = useState(false);
    const [filterS, setFilterS]       = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const close = () => { setModal(null); setSelected(null); setCommentaire(''); };
    const base  = `/dee/dossiers/${dossier.id}/recommandations-suivi`;

    function post(url, data) {
        setProcessing(true);
        router.post(url, data, { preserveScroll: true, onFinish: () => { setProcessing(false); close(); } });
    }

    const validees = recommandations.filter(r => r.statut === 'validee_dee');
    const soumises = recommandations.filter(r => r.statut === 'soumise_dee');
    const enCours  = recommandations.filter(r => ['envoyee_etablissement','en_cours'].includes(r.statut));

    const joursRestants = prochainRappel
        ? Math.ceil((new Date(prochainRappel) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const sorted   = [...recommandations].sort((a, b) => ORDER.indexOf(a.statut || 'brouillon') - ORDER.indexOf(b.statut || 'brouillon'));
    const filtered = filterS === 'all' ? sorted : sorted.filter(r => (r.statut || 'brouillon') === filterS);

    const statCounts = {};
    recommandations.forEach(r => { const s = r.statut || 'brouillon'; statCounts[s] = (statCounts[s] || 0) + 1; });

    return (
        <div style={{ fontFamily: 'inherit' }}>
            <style>{`
                .srec-card { transition: box-shadow .15s, transform .1s; }
                .srec-card:hover { box-shadow: 0 6px 24px rgba(12,68,124,.12) !important; transform: translateY(-1px); }
            `}</style>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 20 }}>
                {[
                    { label: 'Total',          val: stats.total    ?? 0, color: '#0f172a' },
                    { label: 'Soumises DEE',   val: stats.soumises ?? 0, color: '#1d4ed8' },
                    { label: 'Validées',       val: stats.validees ?? 0, color: GREEN },
                    { label: 'Envoyées étab.', val: stats.envoyees ?? 0, color: PURPLE },
                    { label: 'Réalisées',      val: stats.realisees ?? 0, color: '#15803d' },
                    { label: 'Clôturées',      val: stats.cloturees ?? 0, color: '#166534' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Alert soumises + bouton global */}
            {soumises.length > 0 && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📥</div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1d4ed8' }}>{soumises.length} recommandation(s) en attente de révision</div>
                        <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>Acceptez-les une par une ou toutes d'un coup.</div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm(`Accepter et envoyer les ${soumises.length} recommandation(s) à l'établissement ?`))
                                router.post(`${base}/accepter-et-envoyer-tous`, {}, { preserveScroll: true });
                        }}
                        style={{ padding: '9px 20px', background: '#15803d', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', boxShadow: '0 2px 8px #15803d44' }}>
                        ✓ Accepter et envoyer tout ({soumises.length})
                    </button>
                </div>
            )}

            {/* Alert validées à envoyer */}
            {validees.length > 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #15803d', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏫</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d' }}>{validees.length} recommandation(s) validée(s) prêtes à envoyer</div>
                        <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>Envoyez-les toutes ou individuellement depuis chaque carte.</div>
                    </div>
                    <button onClick={() => { if (confirm(`Envoyer les ${validees.length} recommandation(s) validée(s) à l'établissement ?`)) router.post(`${base}/envoyer-etablissement`, {}, { preserveScroll: true }); }}
                        style={{ padding: '7px 16px', background: '#15803d', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        Envoyer tout →
                    </button>
                </div>
            )}

            {/* Alert rappel */}
            {joursRestants !== null && joursRestants <= 30 && enCours.length > 0 && (
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderLeft: '4px solid #7c3aed', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 20, flexShrink: 0 }}>🔔</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#6d28d9' }}>
                        {joursRestants <= 0 ? 'Rappel 6 mois échu' : `Prochain rappel dans ${joursRestants} jour(s)`} — {enCours.length} en attente
                    </div>
                    <Btn color={PURPLE} onClick={() => setModal('rappel')} style={{ flexShrink: 0 }}>Envoyer rappel</Btn>
                </div>
            )}

            {/* Actions globales */}
            {enCours.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <Btn color={PURPLE} outline bg="#faf5ff" onClick={() => setModal('rappel')}>🔔 Envoyer un rappel à l'établissement</Btn>
                </div>
            )}

            {/* Filtres */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
                {[{ k: 'all', label: `Toutes (${recommandations.length})` }, ...ORDER.filter(k => statCounts[k]).map(k => ({ k, label: `${S[k]?.label ?? k} (${statCounts[k]})` }))].map(f => (
                    <button key={f.k} onClick={() => setFilterS(f.k)} style={{ padding: '5px 14px', borderRadius: 30, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: filterS === f.k ? BLUE : '#f1f5f9', color: filterS === f.k ? '#fff' : '#64748b', transition: 'all .1s' }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    Aucune recommandation{recommandations.length === 0 ? ' pour ce dossier.' : ' pour ce filtre.'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(r => {
                        const stat       = r.statut || 'brouillon';
                        const sCfg       = S[stat] || S.brouillon;
                        const isExpanded = expandedId === r.id;
                        const isSoumise  = stat === 'soumise_dee';
                        const isValidee  = stat === 'validee_dee';
                        const isEnvoyee  = ['envoyee_etablissement','en_cours'].includes(stat);
                        const showProofs = ['envoyee_etablissement','en_cours','cloturee'].includes(stat);
                        const nProofs    = r.preuves_count || 0;

                        return (
                            <div key={r.id} className="srec-card" style={{ background: '#fff', border: `1px solid ${isSoumise ? '#bfdbfe' : isValidee ? '#bbf7d0' : '#e2e8f0'}`, borderLeft: `4px solid ${sCfg.color}`, borderRadius: 14, overflow: 'hidden', boxShadow: isSoumise ? '0 2px 12px #bfdbfe55' : isValidee ? '0 2px 12px #bbf7d055' : '0 1px 4px rgba(0,0,0,.04)' }}>

                                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Badges */}
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                                            <Badge statut={stat} />
                                            {r.urgence && <UBadge urgence={r.urgence} />}
                                            {(r.domaine_label || r.domaine_code) && (
                                                <span style={{ background: BLUE + '12', color: BLUE, border: `1px solid ${BLUE}22`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                                                    {r.domaine_label || r.domaine_code}
                                                </span>
                                            )}
                                            <span style={{ fontSize: 11, color: '#cbd5e1', marginLeft: 'auto', fontFamily: 'monospace', fontWeight: 700 }}>#{r.id}</span>
                                        </div>

                                        {/* Texte */}
                                        <p style={{ margin: '0 0 8px', fontSize: 14, color: '#1e293b', lineHeight: 1.65, fontWeight: 500 }}>
                                            {isExpanded ? r.recommandation : (r.recommandation?.length > 200 ? r.recommandation.substring(0, 200) + '…' : r.recommandation)}
                                        </p>
                                        {r.recommandation?.length > 200 && (
                                            <button onClick={() => setExpandedId(isExpanded ? null : r.id)} style={{ padding: 0, border: 'none', background: 'none', fontSize: 11, fontWeight: 700, color: BLUE, cursor: 'pointer', marginBottom: 6 }}>
                                                {isExpanded ? '▲ Réduire' : '▼ Voir tout'}
                                            </button>
                                        )}

                                        {/* Meta */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>👤 {r.expert_nom || 'Expert'}</span>
                                            {showProofs && <PreuveBadge count={nProofs} />}
                                            {['envoyee_etablissement','en_cours','cloturee'].includes(stat) && (
                                                <span style={{ background: MEO[r.statut_mise_en_oeuvre]?.bg || '#f8fafc', color: MEO[r.statut_mise_en_oeuvre]?.color || '#64748b', border: `1px solid ${MEO[r.statut_mise_en_oeuvre]?.border || '#e2e8f0'}`, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 800 }}>
                                                    Mise en œuvre : {MEO[r.statut_mise_en_oeuvre]?.label || 'Non démarrée'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'stretch', minWidth: 155 }}>
                                        {isSoumise && (
                                            <Btn color={ORANGE} outline bg="#fff7ed" onClick={() => { setSelected(r); setModal('renvoyer'); }}>↩ Renvoyer</Btn>
                                        )}
                                        {isValidee && (
                                            <Btn color={GREEN} onClick={() => { if (confirm('Envoyer cette recommandation à l\'établissement ?')) router.post(`${base}/${r.id}/envoyer-etablissement-one`, {}, { preserveScroll: true }); }}>
                                                ✓ Envoyer à l'étab.
                                            </Btn>
                                        )}
                                        {isEnvoyee && (
                                            <Btn color="#166534" outline bg="#f0fdf4" onClick={() => { if (confirm('Clôturer cette recommandation ?')) router.post(`${base}/${r.id}/cloturer`, {}, { preserveScroll: true }); }}>
                                                ✓ Clôturer
                                            </Btn>
                                        )}
                                    </div>
                                </div>

                                {/* Commentaire DEE */}
                                {r.commentaire_dee && (
                                    <div style={{ margin: '0 18px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '3px solid #64748b', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#374151' }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Commentaire DEE</div>
                                        {r.commentaire_dee}
                                    </div>
                                )}

                                {/* Réponse établissement */}
                                {r.reponse_etablissement && (
                                    <div style={{ margin: '0 18px 12px', background: '#faf5ff', border: '1px solid #e9d5ff', borderLeft: `3px solid ${PURPLE}`, borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#374151' }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: PURPLE, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Réponse établissement</div>
                                        {r.reponse_etablissement}
                                        {r.delai_etablissement && <span style={{ marginLeft: 10, background: '#ede9fe', color: PURPLE, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Délai : {r.delai_etablissement}</span>}
                                    </div>
                                )}

                                {/* Preuves de mise en œuvre (établissement) */}
                                {showProofs && (
                                    <div style={{ borderTop: `2px solid ${nProofs > 0 ? '#bbf7d0' : '#fee2e2'}`, margin: '0 0 0 0', background: nProofs > 0 ? '#f0fdf4' : '#fff5f5' }}>
                                        {/* Header preuves */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: nProofs > 0 ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                                    {nProofs > 0 ? '✅' : '⏳'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: nProofs > 0 ? '#15803d' : '#b91c1c' }}>
                                                        Preuves de mise en œuvre
                                                    </div>
                                                    <div style={{ fontSize: 11, color: nProofs > 0 ? '#16a34a' : '#ef4444', fontWeight: 600, marginTop: 1 }}>
                                                        {nProofs > 0
                                                            ? `${nProofs} preuve(s) déposée(s) par l'établissement`
                                                            : 'Aucune preuve déposée — en attente de l\'établissement'}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{ flexShrink: 0, background: nProofs > 0 ? '#dcfce7' : '#fee2e2', color: nProofs > 0 ? '#15803d' : '#b91c1c', border: `1px solid ${nProofs > 0 ? '#86efac' : '#fca5a5'}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
                                                {nProofs > 0 ? `${nProofs} / renseigné(s)` : 'Non renseigné'}
                                            </span>
                                        </div>
                                        {/* Fichiers */}
                                        {nProofs > 0 && (
                                            <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {r.preuves.map(p => (
                                                    <a key={p.id} href={p.url} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #86efac', borderRadius: 8, padding: '5px 11px', color: '#15803d', fontSize: 11, fontWeight: 700, textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                                                        ⬇ {p.fichier_nom}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ MODALS ═══ */}

            {/* Accepter et envoyer */}
            <Modal open={modal === 'valider_envoyer'} onClose={close} title="Accepter et envoyer à l'établissement" subtitle={selected?.recommandation?.substring(0, 80) + (selected?.recommandation?.length > 80 ? '…' : '')}>
                {selected && <>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>{selected.recommandation}</div>
                    <div style={{ marginBottom: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                        🏫 Cette recommandation sera validée et envoyée directement à l'établissement. L'établissement devra déposer ses preuves de mise en œuvre.
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Commentaire pour l'établissement (optionnel)</label>
                        <textarea rows={3} value={commentaire} onChange={e => setCommentaire(e.target.value)} placeholder="Précisions ou instructions pour l'établissement..." style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Btn color="#64748b" outline onClick={close}>Annuler</Btn>
                        <Btn color={GREEN} disabled={processing} onClick={() => post(`${base}/${selected.id}/valider-et-envoyer`, { commentaire_dee: commentaire })}>✓ Accepter et envoyer</Btn>
                    </div>
                </>}
            </Modal>

            {/* Renvoyer expert */}
            <Modal open={modal === 'renvoyer'} onClose={close} title="Renvoyer à l'expert pour révision" subtitle="Un email sera envoyé à l'expert avec votre commentaire.">
                {selected && <>
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>{selected.recommandation}</div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Commentaire pour l'expert <span style={{ color: RED }}>*</span></label>
                        <textarea rows={4} value={commentaire} onChange={e => setCommentaire(e.target.value)} placeholder="Expliquez ce qui doit être corrigé..." style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Btn color="#64748b" outline onClick={close}>Annuler</Btn>
                        <Btn color={ORANGE} disabled={processing || !commentaire.trim()} onClick={() => post(`${base}/${selected.id}/renvoyer-expert`, { commentaire_dee: commentaire })}>↩ Renvoyer à l'expert</Btn>
                    </div>
                </>}
            </Modal>

            {/* Rappel */}
            <Modal open={modal === 'rappel'} onClose={close} title="Envoyer un rappel à l'établissement" subtitle={`${enCours.length} recommandation(s) en attente · ${etablissement?.nom || ''}`}>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Type de rappel</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { k: 'standard',     label: 'Standard',    desc: 'Message automatique généré par la plateforme', icon: '📋' },
                            { k: 'personnalise', label: 'Personnalisé', desc: 'Rédigez un message spécifique', icon: '✍️' },
                        ].map(t => (
                            <button key={t.k} onClick={() => setRappelType(t.k)} style={{ padding: '12px', borderRadius: 11, cursor: 'pointer', textAlign: 'left', border: rappelType === t.k ? `2px solid ${PURPLE}` : '1.5px solid #e2e8f0', background: rappelType === t.k ? '#faf5ff' : '#fff' }}>
                                <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: rappelType === t.k ? PURPLE : '#374151' }}>{t.label}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{t.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
                {rappelType === 'personnalise' && (
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Message <span style={{ color: RED }}>*</span></label>
                        <textarea rows={5} value={rappelMsg} onChange={e => setRappelMsg(e.target.value)} placeholder="Votre message personnalisé..." style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Btn color="#64748b" outline onClick={close}>Annuler</Btn>
                    <Btn color={PURPLE} disabled={processing || (rappelType === 'personnalise' && !rappelMsg.trim())} onClick={() => post(`${base}/envoyer-rappel`, { type: rappelType, message: rappelMsg })}>🔔 Envoyer le rappel</Btn>
                </div>
            </Modal>
        </div>
    );
}
