import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

/* ── tokens ── */
const BLUE   = '#0C447C';
const BLIGHT = '#1a6abf';
const GREEN  = '#1D9E75';
const ORANGE = '#EF9F27';
const RED    = '#DC2626';
const PURPLE = '#7c3aed';

const U = {
    rouge:  { label: 'Urgent',       color: RED,    light: '#FEF2F2', border: '#FECACA', text: '#991B1B', ring: '#FCA5A5' },
    orange: { label: 'Modéré',       color: ORANGE, light: '#FFFBEB', border: '#FDE68A', text: '#92400E', ring: '#FCD34D' },
    vert:   { label: 'Satisfaisant', color: GREEN,  light: '#F0FDF4', border: '#BBF7D0', text: '#166534', ring: '#6EE7B7' },
};

const S = {
    brouillon:       { label: 'Brouillon',      bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: '✏️' },
    soumise_dee:     { label: 'Soumise DEE',    bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '📤' },
    renvoyee_expert: { label: 'À réviser',      bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', icon: '↩️' },
    validee_dee:     { label: 'Validée',        bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: '✅' },
    envoyee_etablissement: { label: 'Envoyée étab.', bg: '#faf5ff', color: PURPLE, border: '#e9d5ff', icon: '🏫' },
    en_cours:        { label: 'En attente',     bg: '#fefce8', color: '#a16207', border: '#fef08a', icon: '⏳' },
    cloturee:        { label: 'Clôturée',       bg: '#f0fdf4', color: '#166534', border: '#86efac', icon: '🔒' },
};

const DOMAIN_COLORS = ['#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316','#EAB308','#06B6D4','#84CC16'];

export default function RecommandationsDomaines({
    expert          = {},
    dossier         = {},
    domaines        = [],
    recommandations = [],
}) {
    const { props } = usePage();
    const flash = props.flash || {};
    const errors = props.errors || {};
    const etab = dossier.etablissement || {};

    /* state */
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [form,   setForm]   = useState({ domaine_code: '', recommandation: '', urgence: 'rouge' });
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [expandedId, setExpandedId] = useState(null);
    const [filterU, setFilterU] = useState('all');
    const [filterD, setFilterD] = useState('all');
    const [filterS, setFilterS] = useState('all');
    const [saving,  setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    /* derived */
    const domaineMap = useMemo(() =>
        Object.fromEntries(domaines.map((d, i) => [
            String(d.code ?? d.id),
            { ...d, color: DOMAIN_COLORS[i % DOMAIN_COLORS.length] }
        ])), [domaines]);

    const filtered = useMemo(() => recommandations.filter(r => {
        if (filterU !== 'all' && r.urgence !== filterU) return false;
        if (filterS !== 'all' && (r.statut || 'brouillon') !== filterS) return false;
        const dc = String(r.domaine_code ?? r.domaine_id ?? '');
        if (filterD !== 'all' && dc !== filterD) return false;
        return true;
    }), [recommandations, filterU, filterD, filterS]);

    const domainesUtilises = useMemo(() => new Set(
        recommandations
            .map(r => String(r.domaine_code ?? r.domaine_id ?? ''))
            .filter(Boolean)
    ), [recommandations]);

    const domainesDisponibles = useMemo(() => domaines.filter(
        d => !domainesUtilises.has(String(d.code ?? d.id))
    ), [domaines, domainesUtilises]);

    const domainesDisponiblesPourEdition = useMemo(() => domaines.filter(
        d => String(d.code ?? d.id) === String(editForm.domaine_code ?? '')
            || !domainesUtilises.has(String(d.code ?? d.id))
    ), [domaines, domainesUtilises, editForm.domaine_code]);

    const counts = {
        rouge:    recommandations.filter(r => r.urgence === 'rouge').length,
        orange:   recommandations.filter(r => r.urgence === 'orange').length,
        vert:     recommandations.filter(r => r.urgence === 'vert').length,
        total:    recommandations.length,
        brouillon:       recommandations.filter(r => (r.statut || 'brouillon') === 'brouillon').length,
        soumise_dee:     recommandations.filter(r => r.statut === 'soumise_dee').length,
        renvoyee_expert: recommandations.filter(r => r.statut === 'renvoyee_expert').length,
        a_soumettre:     recommandations.filter(r => ['brouillon', 'renvoyee_expert'].includes(r.statut || 'brouillon')).length,
    };

    /* handlers */
    function submitAdd(e) {
        e.preventDefault();
        if (!form.domaine_code || !form.recommandation.trim() || saving) return;
        setSaving(true);
        router.post(`/expert/recommandations-domaine/${dossier.id}`, {
            domaine_code:   form.domaine_code || null,
            recommandation: form.recommandation,
            urgence:        form.urgence,
        }, {
            preserveScroll: true,
            onSuccess: () => { setForm({ domaine_code: '', recommandation: '', urgence: 'rouge' }); setShowAddPanel(false); setSaving(false); },
            onError:   () => setSaving(false),
        });
    }

    function submitEdit(e) {
        e.preventDefault();
        if (!editForm.domaine_code || !editForm.recommandation?.trim() || saving) return;
        setSaving(true);
        router.patch(`/expert/recommandations-domaine/${dossier.id}/${editId}`, editForm, {
            preserveScroll: true,
            onSuccess: () => { setEditId(null); setSaving(false); },
            onError:   () => setSaving(false),
        });
    }

    function deleteRec(id) {
        if (!confirm('Supprimer ce brouillon ?')) return;
        router.delete(`/expert/recommandations-domaine/${dossier.id}/${id}`, { preserveScroll: true });
    }

    function soumettreADee() {
        setSubmitting(true);
        router.post(`/expert/recommandations-domaine/${dossier.id}/soumettre-dee`, {}, {
            preserveScroll: true,
            onFinish: () => { setSubmitting(false); setConfirmSubmit(false); },
        });
    }

    return (
        <>
            <Head title={`Recommandations — ${dossier.reference || 'Dossier'}`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@500&display=swap');
                *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', system-ui, sans-serif; }
                @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes slideDown { from { opacity:0; max-height:0; } to { opacity:1; max-height:700px; } }
                @keyframes spin      { to { transform:rotate(360deg); } }
                @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.5} }
                .fu  { animation: fadeUp .42s cubic-bezier(.22,1,.36,1) both; }
                .d1  { animation-delay:.05s; } .d2 { animation-delay:.10s; } .d3 { animation-delay:.15s; }
                .tr-hover { transition: background .1s; }
                .tr-hover:hover { background: #f8fafc !important; }
                .tr-hover:hover .row-actions { opacity: 1 !important; }
                .row-actions { opacity: 0; transition: opacity .15s; }
                .back-btn { transition: background .15s, transform .15s; }
                .back-btn:hover { background: #f1f5f9 !important; transform: translateX(-2px); }
                .add-btn  { transition: box-shadow .15s, transform .12s, background .12s; }
                .add-btn:hover  { transform: translateY(-1px); box-shadow: 0 6px 20px ${BLUE}44 !important; }
                .submit-btn { transition: all .15s; }
                .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px ${PURPLE}55 !important; }
                .filter-chip { transition: background .1s, border-color .1s, color .1s; cursor: pointer; border: none; }
                textarea, select { outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s; }
                textarea:focus, select:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px ${BLUE}1a !important; }
                .urgence-swatch { transition: transform .12s, box-shadow .12s; cursor: pointer; }
                .urgence-swatch:hover { transform: scale(1.06); }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f4f8 0%,#e8eef5 100%)', padding: '2rem 1.5rem 5rem' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>

                    {/* ── Breadcrumb ── */}
                    <div className="fu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
                            <a href="/expert/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Espace Expert</a>
                            <Chev /><a href="/expert/dossiers" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dossiers</a>
                            <Chev /><a href={`/expert/dossiers/${dossier.id}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>{dossier.reference}</a>
                            <Chev /><span style={{ color: BLUE, fontWeight: 800 }}>Recommandations</span>
                        </nav>
                        <button className="back-btn" onClick={() => router.visit(`/expert/dossiers/${dossier.id}`)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                            <IcoArrow /> Retour au dossier
                        </button>
                    </div>

                    {/* Flash */}
                    {flash.success && (
                        <div className="fu" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', borderRadius: 12, padding: '14px 18px', marginBottom: 18, color: '#166534', fontSize: 14, fontWeight: 600 }}>
                            ✓ {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="fu" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: 12, padding: '14px 18px', marginBottom: 18, color: '#991b1b', fontSize: 14, fontWeight: 600 }}>
                            ✕ {flash.error}
                        </div>
                    )}
                    {errors.domaine_code && (
                        <div className="fu" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: 12, padding: '14px 18px', marginBottom: 18, color: '#991b1b', fontSize: 14, fontWeight: 600 }}>
                            ✕ {errors.domaine_code}
                        </div>
                    )}

                    {/* À réviser alert */}
                    {counts.renvoyee_expert > 0 && (
                        <div className="fu" style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderLeft: '4px solid #f97316', borderRadius: 12, padding: '14px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{ fontSize: 22 }}>↩️</span>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#c2410c' }}>
                                    {counts.renvoyee_expert} recommandation(s) à réviser
                                </div>
                                <div style={{ fontSize: 12, color: '#9a3412', marginTop: 2 }}>
                                    La DEE a demandé des corrections. Consultez les commentaires ci-dessous, modifiez puis soumettez à nouveau.
                                </div>
                            </div>
                            <button className="filter-chip" onClick={() => setFilterS('renvoyee_expert')}
                                style={{ marginLeft: 'auto', padding: '7px 16px', borderRadius: 8, background: '#c2410c', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                                Voir →
                            </button>
                        </div>
                    )}

                    {/* ── HERO ── */}
                    <div className="fu d1" style={{ borderRadius: 22, overflow: 'hidden', marginBottom: 22, boxShadow: `0 10px 40px ${BLUE}28` }}>
                        <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1558a8 55%, #0d6abf 100%)`, padding: '2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                                <div>
                                    <p style={{ margin: '0 0 7px', fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>
                                        {etab.acronyme && `${etab.acronyme} · `}{etab.ville || ''}{dossier.campagne && ` · Vague ${dossier.campagne}`}
                                    </p>
                                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Recommandations par domaine</h1>
                                    <p style={{ margin: '7px 0 0', fontSize: 13, color: 'rgba(255,255,255,.68)', fontWeight: 500 }}>
                                        {counts.total} recommandation{counts.total !== 1 ? 's' : ''} · Dossier {dossier.reference}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'rouge',  label: 'Urgent',  n: counts.rouge  },
                                        { key: 'orange', label: 'Modéré',  n: counts.orange },
                                        { key: 'vert',   label: 'OK',      n: counts.vert   },
                                    ].map(s => (
                                        <div key={s.key} style={{ background: 'rgba(255,255,255,.13)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 14, padding: '.75rem 1.1rem', textAlign: 'center', minWidth: 68 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: U[s.key].color, margin: '0 auto 6px', boxShadow: `0 0 0 3px ${U[s.key].color}44` }} />
                                            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.n}</p>
                                            <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</p>
                                        </div>
                                    ))}
                                    {/* Statut DEE mini-cards */}
                                    {counts.soumise_dee > 0 && (
                                        <div style={{ background: 'rgba(219,234,254,.18)', border: '1px solid rgba(147,197,253,.3)', borderRadius: 14, padding: '.75rem 1.1rem', textAlign: 'center', minWidth: 68 }}>
                                            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#93c5fd', lineHeight: 1 }}>{counts.soumise_dee}</p>
                                            <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>En attente</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 6, display: 'flex', background: '#f1f5f9' }}>
                            {counts.total > 0 && Object.entries(U).map(([k]) => (
                                <div key={k} style={{ width: `${(counts[k] / counts.total) * 100}%`, background: U[k].color, transition: 'width .9s cubic-bezier(.22,1,.36,1)' }} />
                            ))}
                        </div>
                    </div>

                    {/* ── Soumettre à la DEE banner ── */}
                    {counts.a_soumettre > 0 && (
                        <div className="fu d2" style={{ background: `linear-gradient(135deg, ${PURPLE}12, ${PURPLE}06)`, border: `1px solid ${PURPLE}30`, borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${PURPLE}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📤</div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: PURPLE }}>
                                        {counts.a_soumettre} recommandation(s) prête(s) à soumettre
                                    </div>
                                    <div style={{ fontSize: 12, color: '#7c3aed99', marginTop: 2 }}>
                                        {counts.brouillon > 0 && `${counts.brouillon} brouillon(s)`}
                                        {counts.brouillon > 0 && counts.renvoyee_expert > 0 && ' · '}
                                        {counts.renvoyee_expert > 0 && `${counts.renvoyee_expert} révision(s) en attente`}
                                    </div>
                                </div>
                            </div>
                            {!confirmSubmit ? (
                                <button className="submit-btn"
                                    onClick={() => setConfirmSubmit(true)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, background: PURPLE, color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: `0 4px 16px ${PURPLE}44`, flexShrink: 0 }}>
                                    <IcoSend /> Soumettre à la DEE
                                </button>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: PURPLE }}>Confirmer ?</span>
                                    <button onClick={soumettreADee} disabled={submitting}
                                        style={{ padding: '9px 20px', borderRadius: 10, background: PURPLE, color: '#fff', fontSize: 13, fontWeight: 800, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                                        {submitting ? <Spinner /> : 'Oui, soumettre'}
                                    </button>
                                    <button onClick={() => setConfirmSubmit(false)}
                                        style={{ padding: '9px 16px', borderRadius: 10, background: '#f1f5f9', color: '#64748b', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                        Annuler
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TABLE CARD ── */}
                    <div className="fu d3" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(12,68,124,.08)' }}>

                        {/* Toolbar */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BLUE}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IcoTable />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Tableau des recommandations</p>
                                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{counts.total} entrée{counts.total !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {/* Urgence chips */}
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                {[{ k: 'all', label: 'Toutes' }, ...Object.entries(U).map(([k, v]) => ({ k, label: v.label }))].map(f => {
                                    const active = filterU === f.k;
                                    const meta   = f.k !== 'all' ? U[f.k] : null;
                                    return (
                                        <button key={f.k} className="filter-chip" onClick={() => setFilterU(f.k)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 13px', borderRadius: 30, background: active ? (meta ? meta.color : BLUE) : '#f1f5f9', color: active ? '#fff' : '#64748b', fontSize: 12, fontWeight: 700 }}>
                                            {meta && <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'rgba(255,255,255,.6)' : meta.color, display: 'inline-block' }} />}
                                            {f.label}
                                            {f.k !== 'all' && <span style={{ fontSize: 10, fontWeight: 800, opacity: .8 }}>{counts[f.k]}</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Statut filter */}
                            <select value={filterS} onChange={e => setFilterS(e.target.value)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>
                                <option value="all">Tous les statuts</option>
                                {Object.entries(S).map(([k, v]) => (
                                    <option key={k} value={k}>{v.icon} {v.label}</option>
                                ))}
                            </select>

                            {/* Domain filter */}
                            {domaines.length > 0 && (
                                <select value={filterD} onChange={e => setFilterD(e.target.value)}
                                    style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>
                                    <option value="all">Tous les domaines</option>
                                    {domaines.map(d => <option key={d.code ?? d.id} value={d.code ?? d.id}>{d.code} — {d.libelle}</option>)}
                                </select>
                            )}

                            <div style={{ marginLeft: 'auto' }}>
                                <button className="add-btn" disabled={domainesDisponibles.length === 0}
                                    onClick={() => { setShowAddPanel(p => !p); setEditId(null); }}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 11, background: domainesDisponibles.length === 0 || showAddPanel ? '#e2e8f0' : BLUE, color: domainesDisponibles.length === 0 || showAddPanel ? '#64748b' : '#fff', fontSize: 13, fontWeight: 800, border: 'none', cursor: domainesDisponibles.length === 0 ? 'not-allowed' : 'pointer', boxShadow: domainesDisponibles.length === 0 || showAddPanel ? 'none' : `0 4px 14px ${BLUE}33` }}>
                                    {domainesDisponibles.length === 0
                                        ? 'Tous les domaines sont renseignés'
                                        : showAddPanel
                                            ? <><IcoX size={13}/> Fermer</>
                                            : <><IcoPlus size={13}/> Nouvelle recommandation</>}
                                </button>
                            </div>
                        </div>

                        {/* ── ADD PANEL ── */}
                        {showAddPanel && (
                            <div style={{ borderBottom: '2px solid #e8edf3', background: 'linear-gradient(135deg,#f0f7ff,#fafbfc)', padding: '1.5rem', animation: 'slideDown .25s cubic-bezier(.22,1,.36,1)' }}>
                                <form onSubmit={submitAdd}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, marginBottom: 14, alignItems: 'start' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 7 }}>Domaine <span style={{ color: RED }}>*</span></label>
                                            <select required value={form.domaine_code} onChange={e => setForm(f => ({ ...f, domaine_code: e.target.value }))}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: 11, border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>
                                                <option value="">— Sélectionner un domaine —</option>
                                                {domainesDisponibles.map(d => <option key={d.code ?? d.id} value={d.code ?? d.id}>{d.code} — {d.libelle}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 7 }}>Niveau d'urgence</label>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {Object.entries(U).map(([key, meta]) => {
                                                    const sel = form.urgence === key;
                                                    return (
                                                        <button key={key} type="button" className="urgence-swatch"
                                                            onClick={() => setForm(f => ({ ...f, urgence: key }))}
                                                            style={{ flex: 1, padding: '9px 6px', borderRadius: 11, border: `2px solid ${sel ? meta.color : '#e2e8f0'}`, background: sel ? meta.color : '#fff', color: sel ? '#fff' : meta.text, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: sel ? `0 3px 12px ${meta.color}44` : 'none' }}>
                                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: sel ? 'rgba(255,255,255,.5)' : meta.color, flexShrink: 0 }} />
                                                            {meta.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'transparent', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 7, userSelect: 'none' }}>.</label>
                                            <button type="submit" disabled={saving}
                                                style={{ padding: '10px 22px', borderRadius: 11, background: saving ? '#e2e8f0' : '#1d4ed8', color: saving ? '#94a3b8' : '#fff', fontSize: 13, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', boxShadow: saving ? 'none' : '0 3px 12px #1d4ed844', transition: 'all .15s' }}>
                                                {saving ? <Spinner /> : '+ Enreg. brouillon'}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 7 }}>Recommandation <span style={{ color: RED, fontSize: 13 }}>*</span></label>
                                        <textarea value={form.recommandation} onChange={e => setForm(f => ({ ...f, recommandation: e.target.value }))}
                                            rows={3} required placeholder="Rédigez votre recommandation..."
                                            style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 500, color: '#1e293b', lineHeight: 1.7, resize: 'vertical', background: '#fff' }} />
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ── TABLE ── */}
                        {filtered.length === 0 ? (
                            <EmptyState total={counts.total} onAdd={() => setShowAddPanel(true)} />
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
                                    <thead>
                                        <tr style={{ background: '#fafbfc', borderBottom: '2px solid #f1f5f9' }}>
                                            <Th w={44}>#</Th>
                                            <Th w={90}>Urgence</Th>
                                            <Th w={130}>Statut</Th>
                                            <Th w={170}>Domaine</Th>
                                            <Th>Recommandation</Th>
                                            <Th w={90} right>Actions</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((rec, idx) => {
                                            const u    = U[rec.urgence] || U.vert;
                                            const s    = S[rec.statut || 'brouillon'] || S.brouillon;
                                            const dc   = String(rec.domaine_code ?? rec.domaine_id ?? '');
                                            const dom  = domaineMap[dc];
                                            const stat = rec.statut || 'brouillon';
                                            const canEdit   = ['brouillon', 'renvoyee_expert'].includes(stat);
                                            const canDelete = stat === 'brouillon';
                                            const isEditing  = editId === rec.id;
                                            const isExpanded = expandedId === rec.id;
                                            const isRenvoye  = stat === 'renvoyee_expert';

                                            return (
                                                <tr key={rec.id} className="tr-hover"
                                                    style={{ borderBottom: '1px solid #f1f5f9', background: isEditing ? `${BLUE}05` : isRenvoye ? '#fff7ed' : 'transparent', borderLeft: `4px solid ${isRenvoye ? ORANGE : u.color}` }}>

                                                    <td style={TD}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 7, background: '#f1f5f9', fontSize: 11, fontWeight: 800, color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>

                                                    <td style={TD}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 30, background: u.light, border: `1px solid ${u.border}` }}>
                                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.color, flexShrink: 0, boxShadow: `0 0 0 2px ${u.ring}` }} />
                                                            <span style={{ fontSize: 11, fontWeight: 800, color: u.text, whiteSpace: 'nowrap' }}>{u.label}</span>
                                                        </span>
                                                    </td>

                                                    {/* Statut */}
                                                    <td style={TD}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 30, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700, color: s.color, whiteSpace: 'nowrap' }}>
                                                            {s.icon} {s.label}
                                                        </span>
                                                    </td>

                                                    {/* Domain */}
                                                    <td style={TD}>
                                                        {dom ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <div style={{ width: 30, height: 30, borderRadius: 8, background: dom.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: `0 2px 8px ${dom.color}44` }}>
                                                                    {dom.code}
                                                                </div>
                                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                                    {dom.libelle}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic' }}>—</span>
                                                        )}
                                                    </td>

                                                    {/* Recommandation + commentaire DEE */}
                                                    <td style={{ ...TD, maxWidth: 0 }}>
                                                        {isEditing ? (
                                                            <form onSubmit={submitEdit}>
                                                                <select required value={editForm.domaine_code || ''} onChange={e => setEditForm(f => ({ ...f, domaine_code: e.target.value }))}
                                                                    style={{ width: '100%', marginBottom: 9, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff' }}>
                                                                    <option value="">— Sélectionner un domaine —</option>
                                                                    {domainesDisponiblesPourEdition.map(d => <option key={d.code ?? d.id} value={d.code ?? d.id}>{d.code} — {d.libelle}</option>)}
                                                                </select>
                                                                <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
                                                                    {Object.entries(U).map(([key, meta]) => {
                                                                        const sel = editForm.urgence === key;
                                                                        return (
                                                                            <button key={key} type="button"
                                                                                onClick={() => setEditForm(f => ({ ...f, urgence: key }))}
                                                                                style={{ flex: 1, padding: '6px 8px', borderRadius: 8, border: `2px solid ${sel ? meta.color : '#e2e8f0'}`, background: sel ? meta.color : '#fff', color: sel ? '#fff' : meta.text, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sel ? 'rgba(255,255,255,.5)' : meta.color, flexShrink: 0 }} />
                                                                                {meta.label}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <textarea value={editForm.recommandation} onChange={e => setEditForm(f => ({ ...f, recommandation: e.target.value }))}
                                                                    rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, resize: 'vertical', lineHeight: 1.7, fontWeight: 500, color: '#1e293b' }} />
                                                                {isRenvoye && (
                                                                    <textarea value={editForm.commentaire_revision || ''} onChange={e => setEditForm(f => ({ ...f, commentaire_revision: e.target.value }))}
                                                                        rows={2} placeholder="Commentaire de révision (optionnel)..."
                                                                        style={{ width: '100%', marginTop: 8, padding: '9px 12px', borderRadius: 9, border: '1.5px solid #fed7aa', fontSize: 12, resize: 'vertical', lineHeight: 1.6, fontWeight: 500, color: '#92400e', background: '#fffbeb' }} />
                                                                )}
                                                                <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
                                                                    <button type="submit" disabled={saving}
                                                                        style={{ padding: '7px 18px', borderRadius: 9, background: GREEN, color: '#fff', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: `0 2px 8px ${GREEN}44` }}>
                                                                        {saving ? 'Enreg…' : 'Enregistrer'}
                                                                    </button>
                                                                    <button type="button" onClick={() => setEditId(null)}
                                                                        style={{ padding: '7px 14px', borderRadius: 9, background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Annuler</button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <div>
                                                                <p onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                                                                    style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#1e293b', lineHeight: 1.75, cursor: 'pointer', overflow: isExpanded ? 'visible' : 'hidden', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? undefined : 2, WebkitBoxOrient: 'vertical', whiteSpace: isExpanded ? 'pre-wrap' : 'normal' }}>
                                                                    {rec.recommandation}
                                                                </p>
                                                                {rec.recommandation.length > 120 && (
                                                                    <button onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                                                                        style={{ marginTop: 3, padding: 0, border: 'none', background: 'none', fontSize: 11, fontWeight: 700, color: BLUE, cursor: 'pointer' }}>
                                                                        {isExpanded ? '▲ Réduire' : '▼ Voir tout'}
                                                                    </button>
                                                                )}
                                                                {/* Commentaire DEE si renvoyé */}
                                                                {isRenvoye && rec.commentaire_dee && (
                                                                    <div style={{ marginTop: 8, background: '#fef2f2', border: '1px solid #fecaca', borderLeft: `3px solid ${RED}`, borderRadius: 8, padding: '8px 12px' }}>
                                                                        <div style={{ fontSize: 10, fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Commentaire DEE</div>
                                                                        <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{rec.commentaire_dee}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td style={{ ...TD, textAlign: 'right' }}>
                                                        {canEdit || canDelete ? (
                                                            <div className="row-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                                {canEdit && (
                                                                    <IconBtn title="Modifier" color={BLUE} bg={`${BLUE}0d`} onClick={() => { setEditId(rec.id); setEditForm({ domaine_code: rec.domaine_code || '', recommandation: rec.recommandation, urgence: rec.urgence, commentaire_revision: '' }); setShowAddPanel(false); }}>
                                                                        <IcoEdit />
                                                                    </IconBtn>
                                                                )}
                                                                {canDelete && (
                                                                    <IconBtn title="Supprimer" color={RED} bg="#fef2f2" onClick={() => deleteRec(rec.id)}>
                                                                        <IcoTrash />
                                                                    </IconBtn>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: 11, color: '#cbd5e1', fontStyle: 'italic' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ padding: '.75rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                {filtered.length} / {counts.total} entrée{counts.total !== 1 ? 's' : ''}
                                {(filterU !== 'all' || filterD !== 'all' || filterS !== 'all') && (
                                    <button onClick={() => { setFilterU('all'); setFilterD('all'); setFilterS('all'); }}
                                        style={{ marginLeft: 10, padding: '2px 10px', borderRadius: 30, border: 'none', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                        ✕ Réinitialiser filtres
                                    </button>
                                )}
                            </span>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                {Object.entries(U).map(([k, meta]) => (
                                    <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
                                        {counts[k]} {meta.label.toLowerCase()}
                                    </span>
                                ))}
                                <span style={{ width: 1, height: 14, background: '#e2e8f0' }} />
                                {counts.brouillon > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>✏️ {counts.brouillon} brouillon(s)</span>}
                                {counts.soumise_dee > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8' }}>📤 {counts.soumise_dee} soumise(s)</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ── Sub-components ── */
function EmptyState({ total, onAdd }) {
    return (
        <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: `${BLUE}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <IcoTable size={30} color={`${BLUE}60`} />
            </div>
            <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#374151' }}>
                {total === 0 ? 'Aucune recommandation' : 'Aucun résultat pour ces filtres'}
            </p>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                {total === 0 ? 'Cliquez sur "Nouvelle recommandation" pour commencer' : 'Modifiez les filtres pour voir plus de résultats'}
            </p>
            {total === 0 && (
                <button onClick={onAdd}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 24px', borderRadius: 11, background: BLUE, color: '#fff', fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${BLUE}33` }}>
                    <IcoPlus size={14} /> Ajouter la première recommandation
                </button>
            )}
        </div>
    );
}

function Th({ children, w, right }) {
    return (
        <th style={{ textAlign: right ? 'right' : 'left', padding: '11px 14px', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em', whiteSpace: 'nowrap', width: w || undefined, minWidth: w || undefined }}>
            {children}
        </th>
    );
}

function IconBtn({ children, onClick, color, bg, title }) {
    return (
        <button title={title} onClick={onClick}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${color}22`, background: bg, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, transition: 'background .12s, transform .1s' }}
            onMouseEnter={e => { e.currentTarget.style.background = color + '22'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.transform = 'scale(1)'; }}>
            {children}
        </button>
    );
}

function Spinner() {
    return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}

const TD = { padding: '13px 14px', verticalAlign: 'middle' };

function IcoArrow() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function Chev()     { return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function IcoPlus({ size = 14 })  { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IcoX({ size = 14 })     { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IcoEdit()  { return <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function IcoTrash() { return <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>; }
function IcoSend()  { return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function IcoTable({ size = 18, color = BLUE }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
}

RecommandationsDomaines.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;
