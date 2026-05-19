import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import DashboardShell from "@/Layouts/DashboardShell";

/* ── tokens ── */
const BLUE   = '#0C447C';
const GREEN  = '#15803d';
const RED    = '#dc2626';
const ORANGE = '#c2410c';
const PURPLE = '#7c3aed';

const S = {
    brouillon:             { label: 'Brouillon',      bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
    soumise_dee:           { label: 'Soumise DEE',    bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    renvoyee_expert:       { label: 'Renvoyée expert',bg: '#fff7ed', color: ORANGE,    border: '#fed7aa' },
    validee_dee:           { label: 'Validée',        bg: '#f0fdf4', color: GREEN,     border: '#bbf7d0' },
    envoyee_etablissement: { label: 'Envoyée étab.',  bg: '#faf5ff', color: PURPLE,    border: '#e9d5ff' },
    en_cours:              { label: 'En cours',       bg: '#fefce8', color: '#a16207', border: '#fef08a' },
    cloturee:              { label: 'Clôturée',       bg: '#f0fdf4', color: '#166534', border: '#86efac' },
};

const U = {
    rouge:  { label: 'Urgent',       color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    orange: { label: 'Modéré',       color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    vert:   { label: 'Satisfaisant', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
};

/* order for display priority */
const STATUT_ORDER = ['soumise_dee','renvoyee_expert','validee_dee','envoyee_etablissement','en_cours','brouillon','cloturee'];

function Badge({ statut, size = 'sm' }) {
    const cfg = S[statut] || S.brouillon;
    return (
        <span style={{
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            borderRadius: 20, padding: size === 'sm' ? '3px 10px' : '5px 14px',
            fontSize: size === 'sm' ? 11 : 12, fontWeight: 700, whiteSpace: 'nowrap',
        }}>
            {cfg.label}
        </span>
    );
}

function UBadge({ urgence }) {
    const cfg = U[urgence] || U.vert;
    return (
        <span style={{
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            {cfg.label}
        </span>
    );
}

function Modal({ open, onClose, title, subtitle, children }) {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: 520, maxWidth: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.22)', maxHeight: '90vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}>
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

function Btn({ onClick, color, bg, children, disabled = false, outline = false, style = {} }) {
    const base = {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        border: outline ? `1.5px solid ${color}` : 'none',
        borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? '#e2e8f0' : (outline ? (bg || 'transparent') : color),
        color: disabled ? '#94a3b8' : (outline ? color : '#fff'),
        transition: 'all .12s',
        ...style,
    };
    return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}

function StatCard({ label, val, color, sub }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 5, fontWeight: 600 }}>{label}</div>
            {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

export default function Suivi({ dossier, recommandations = [], stats = {}, rappels = [], dernierRappel, prochainRappel, etablissement }) {
    const { flash = {} } = usePage().props;

    const [modal, setModal]       = useState(null);
    const [selected, setSelected] = useState(null);
    const [commentaire, setCommentaire] = useState('');
    const [rappelType, setRappelType]   = useState('standard');
    const [rappelMsg, setRappelMsg]     = useState('');
    const [processing, setProcessing]   = useState(false);
    const [filterS, setFilterS]         = useState('all');
    const [expandedId, setExpandedId]   = useState(null);

    const close = () => { setModal(null); setSelected(null); setCommentaire(''); };
    const base  = `/dee/dossiers/${dossier.id}/recommandations-suivi`;

    function post(url, data) {
        setProcessing(true);
        router.post(url, data, { onFinish: () => { setProcessing(false); close(); } });
    }

    const validees  = recommandations.filter(r => r.statut === 'validee_dee');
    const soumises  = recommandations.filter(r => r.statut === 'soumise_dee');
    const enCours   = recommandations.filter(r => ['envoyee_etablissement','en_cours'].includes(r.statut));

    const joursRestants = prochainRappel
        ? Math.ceil((new Date(prochainRappel) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const sorted = [...recommandations].sort((a, b) =>
        STATUT_ORDER.indexOf(a.statut || 'brouillon') - STATUT_ORDER.indexOf(b.statut || 'brouillon')
    );
    const filtered = filterS === 'all' ? sorted : sorted.filter(r => (r.statut || 'brouillon') === filterS);

    /* Group counts for filter chips */
    const statCounts = {};
    recommandations.forEach(r => { const s = r.statut || 'brouillon'; statCounts[s] = (statCounts[s] || 0) + 1; });

    return (
        <>
            <Head title={`Suivi recommandations — ${dossier.reference}`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                .rec-card { transition: box-shadow .12s, transform .1s; }
                .rec-card:hover { box-shadow: 0 4px 20px rgba(12,68,124,.1) !important; transform: translateY(-1px); }
                .action-btn { transition: all .1s; }
                .action-btn:hover:not(:disabled) { opacity: .85; transform: translateY(-1px); }
                textarea:focus, input:focus, select:focus { outline: none; border-color: ${BLUE} !important; box-shadow: 0 0 0 3px ${BLUE}1a !important; }
            `}</style>

            <DashboardShell title={`Suivi recommandations`} subtitle={`${dossier.reference} · ${etablissement?.nom || '—'}`}>

                {/* Flash */}
                {flash.success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#166534', fontSize: 14, fontWeight: 600 }}>✓ {flash.success}</div>}
                {flash.error   && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#991b1b', fontSize: 14, fontWeight: 600 }}>✕ {flash.error}</div>}

                {/* ── Alert soumises ── */}
                {soumises.length > 0 && (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📥</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#1d4ed8' }}>{soumises.length} recommandation(s) en attente de votre révision</div>
                            <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>Validez-les ou renvoyez-les à l'expert pour correction.</div>
                        </div>
                        <button onClick={() => setFilterS('soumise_dee')}
                            style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
                            Réviser →
                        </button>
                    </div>
                )}

                {/* ── Rappel 6-mois ── */}
                {joursRestants !== null && joursRestants <= 30 && enCours.length > 0 && (
                    <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderLeft: '4px solid #7c3aed', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: 22, flexShrink: 0 }}>🔔</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#6d28d9' }}>
                                {joursRestants <= 0 ? 'Rappel 6 mois échu' : `Prochain rappel dans ${joursRestants} jour(s)`} — {enCours.length} recommandation(s) en attente
                            </div>
                        </div>
                        <Btn color={PURPLE} onClick={() => setModal('rappel')} style={{ flexShrink: 0 }}>Envoyer rappel</Btn>
                    </div>
                )}

                {/* ── Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 28 }}>
                    <StatCard label="Total"           val={stats.total    ?? 0} color="#0f172a" />
                    <StatCard label="Soumises DEE"    val={stats.soumises ?? 0} color="#1d4ed8" sub="à réviser" />
                    <StatCard label="Validées"        val={stats.validees ?? 0} color={GREEN} />
                    <StatCard label="Envoyées étab."  val={stats.envoyees ?? 0} color={PURPLE} />
                    <StatCard label="Clôturées"       val={stats.cloturees ?? 0} color="#166534" />
                </div>

                {/* ── Actions globales ── */}
                {(validees.length > 0 || enCours.length > 0) && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        {validees.length > 0 && (
                            <Btn color={BLUE} onClick={() => {
                                if (confirm(`Envoyer ${validees.length} recommandation(s) validée(s) à l'établissement ?`))
                                    router.post(`${base}/envoyer-etablissement`);
                            }}>
                                🏫 Envoyer {validees.length} validée(s) à l'établissement
                            </Btn>
                        )}
                        {enCours.length > 0 && (
                            <Btn color={PURPLE} outline bg="#faf5ff" onClick={() => setModal('rappel')}>
                                🔔 Envoyer un rappel à l'établissement
                            </Btn>
                        )}
                    </div>
                )}

                {/* ── Filter chips ── */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
                    {[{ k: 'all', label: `Toutes (${recommandations.length})` }, ...STATUT_ORDER.filter(k => statCounts[k]).map(k => ({ k, label: `${S[k]?.label ?? k} (${statCounts[k]})` }))].map(f => (
                        <button key={f.k} onClick={() => setFilterS(f.k)}
                            style={{
                                padding: '5px 14px', borderRadius: 30, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                                background: filterS === f.k ? BLUE : '#f1f5f9',
                                color: filterS === f.k ? '#fff' : '#64748b',
                                transition: 'all .1s',
                            }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* ── Recommandations cards ── */}
                {filtered.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                        Aucune recommandation pour ce filtre.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filtered.map((r, i) => {
                            const stat = r.statut || 'brouillon';
                            const sCfg = S[stat] || S.brouillon;
                            const isExpanded = expandedId === r.id;
                            const isSoumise  = stat === 'soumise_dee';
                            const isRenvoye  = stat === 'renvoyee_expert';
                            const isEnvoyee  = ['envoyee_etablissement','en_cours'].includes(stat);

                            return (
                                <div key={r.id} className="rec-card" style={{
                                    background: '#fff', border: `1px solid ${isSoumise ? '#bfdbfe' : '#e2e8f0'}`,
                                    borderLeft: `4px solid ${sCfg.color}`,
                                    borderRadius: 14, padding: '18px 20px',
                                    boxShadow: isSoumise ? '0 2px 12px #bfdbfe88' : '0 1px 4px rgba(0,0,0,.04)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Top row: badges */}
                                            <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                                                <Badge statut={stat} />
                                                {r.urgence && <UBadge urgence={r.urgence} />}
                                                {r.domaine_code && (
                                                    <span style={{ background: BLUE + '12', color: BLUE, border: `1px solid ${BLUE}22`, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}>
                                                        {r.domaine_code}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto', fontFamily: 'monospace' }}>#{r.id}</span>
                                            </div>

                                            {/* Recommandation text */}
                                            <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.65, fontWeight: 500 }}>
                                                {isExpanded ? r.recommandation : (r.recommandation?.length > 180 ? r.recommandation.substring(0, 180) + '…' : r.recommandation)}
                                            </div>
                                            {r.recommandation?.length > 180 && (
                                                <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                                    style={{ marginTop: 4, padding: 0, border: 'none', background: 'none', fontSize: 11, fontWeight: 700, color: BLUE, cursor: 'pointer' }}>
                                                    {isExpanded ? '▲ Réduire' : '▼ Voir tout'}
                                                </button>
                                            )}

                                            {/* Commentaire DEE */}
                                            {r.commentaire_dee && (
                                                <div style={{ marginTop: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '3px solid #64748b', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#374151' }}>
                                                    <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Commentaire DEE</div>
                                                    {r.commentaire_dee}
                                                </div>
                                            )}

                                            {/* Réponse établissement */}
                                            {r.reponse_etablissement && (
                                                <div style={{ marginTop: 10, background: '#faf5ff', border: '1px solid #e9d5ff', borderLeft: '3px solid ' + PURPLE, borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#374151' }}>
                                                    <div style={{ fontSize: 10, fontWeight: 800, color: PURPLE, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Réponse établissement</div>
                                                    {r.reponse_etablissement}
                                                    {r.delai_etablissement && (
                                                        <span style={{ marginLeft: 10, background: '#ede9fe', color: PURPLE, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                                                            Délai : {r.delai_etablissement}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                                            {isSoumise && (
                                                <>
                                                    <Btn color={GREEN} onClick={() => { setSelected(r); setModal('valider'); }}>
                                                        ✓ Valider
                                                    </Btn>
                                                    <Btn color={ORANGE} outline bg="#fff7ed" onClick={() => { setSelected(r); setModal('renvoyer'); }}>
                                                        ↩ Renvoyer
                                                    </Btn>
                                                </>
                                            )}
                                            {isEnvoyee && (
                                                <Btn color="#166534" outline bg="#f0fdf4" onClick={() => {
                                                    if (confirm('Clôturer cette recommandation ?')) router.post(`${base}/${r.id}/cloturer`);
                                                }}>
                                                    🔒 Clôturer
                                                </Btn>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Rappels historique ── */}
                {rappels.filter(r => r.type !== 'alerte_dee').length > 0 && (
                    <div style={{ marginTop: 32, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 15 }}>📬</span>
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Historique des rappels envoyés</h3>
                        </div>
                        <div>
                            {rappels.filter(r => r.type !== 'alerte_dee').map((r, i) => (
                                <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8', flexShrink: 0, marginTop: 1 }}>
                                        {new Date(r.envoye_le).toLocaleDateString('fr-FR')}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: r.type === 'personnalise' ? PURPLE : BLUE }}>
                                            {r.type === 'personnalise' ? '✍️ Personnalisé' : '📋 Standard'}
                                        </span>
                                        {r.message_personnalise && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.message_personnalise}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══ MODALS ═══ */}

                {/* Valider */}
                <Modal open={modal === 'valider'} onClose={close}
                    title="Valider la recommandation"
                    subtitle={selected?.recommandation?.substring(0, 80) + (selected?.recommandation?.length > 80 ? '…' : '')}>
                    {selected && <>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>
                            {selected.recommandation}
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Commentaire (optionnel)</label>
                            <textarea rows={3} value={commentaire} onChange={e => setCommentaire(e.target.value)}
                                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Btn color="#64748b" outline onClick={close}>Annuler</Btn>
                            <Btn color={GREEN} disabled={processing} onClick={() => post(`${base}/${selected.id}/valider`, { commentaire_dee: commentaire })}>
                                ✓ Valider la recommandation
                            </Btn>
                        </div>
                    </>}
                </Modal>

                {/* Renvoyer expert */}
                <Modal open={modal === 'renvoyer'} onClose={close}
                    title="Renvoyer à l'expert pour révision"
                    subtitle="Un email sera envoyé à l'expert avec votre commentaire.">
                    {selected && <>
                        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>
                            {selected.recommandation}
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                Commentaire pour l'expert <span style={{ color: RED }}>*</span>
                            </label>
                            <textarea rows={4} value={commentaire} onChange={e => setCommentaire(e.target.value)}
                                placeholder="Expliquez ce qui doit être corrigé ou précisé..."
                                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Btn color="#64748b" outline onClick={close}>Annuler</Btn>
                            <Btn color={ORANGE} disabled={processing || !commentaire.trim()} onClick={() => post(`${base}/${selected.id}/renvoyer-expert`, { commentaire_dee: commentaire })}>
                                ↩ Renvoyer à l'expert
                            </Btn>
                        </div>
                    </>}
                </Modal>

                {/* Rappel */}
                <Modal open={modal === 'rappel'} onClose={close}
                    title="Envoyer un rappel à l'établissement"
                    subtitle={`${enCours.length} recommandation(s) en attente · ${etablissement?.nom || ''}`}>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Type de rappel</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {[
                                { k: 'standard',    label: 'Standard',    desc: 'Message automatique généré par la plateforme', icon: '📋' },
                                { k: 'personnalise', label: 'Personnalisé', desc: 'Rédigez un message spécifique pour cet établissement', icon: '✍️' },
                            ].map(t => (
                                <button key={t.k} onClick={() => setRappelType(t.k)} style={{
                                    padding: '14px 14px', borderRadius: 11, cursor: 'pointer', textAlign: 'left',
                                    border: rappelType === t.k ? `2px solid ${PURPLE}` : '1.5px solid #e2e8f0',
                                    background: rappelType === t.k ? '#faf5ff' : '#fff',
                                }}>
                                    <div style={{ fontSize: 18, marginBottom: 5 }}>{t.icon}</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: rappelType === t.k ? PURPLE : '#374151' }}>{t.label}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {rappelType === 'personnalise' && (
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Message <span style={{ color: RED }}>*</span></label>
                            <textarea rows={5} value={rappelMsg} onChange={e => setRappelMsg(e.target.value)}
                                placeholder="Rédigez votre message personnalisé pour l'établissement..."
                                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Btn color="#64748b" outline onClick={close}>Annuler</Btn>
                        <Btn color={PURPLE} disabled={processing || (rappelType === 'personnalise' && !rappelMsg.trim())}
                            onClick={() => post(`${base}/envoyer-rappel`, { type: rappelType, message: rappelMsg })}>
                            🔔 Envoyer le rappel
                        </Btn>
                    </div>
                </Modal>
            </DashboardShell>
        </>
    );
}
