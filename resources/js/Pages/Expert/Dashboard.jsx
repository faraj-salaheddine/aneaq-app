import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#e03131";

const STATUS_META = {
    en_attente_confirmation_dee:    { label: "En attente DEE",  color: "#64748b", bg: "#f8fafc" },
    en_attente_confirmation_expert: { label: "À confirmer",      color: ORANGE,    bg: "#fffbeb" },
    acces_envoye:                   { label: "À confirmer",      color: ORANGE,    bg: "#fffbeb" },
    confirme_par_expert:            { label: "Confirmé",         color: GREEN,     bg: "#ecfdf5" },
    refuse_par_expert:              { label: "Refusé",           color: RED,       bg: "#fef2f2" },
    comite_confirme:                { label: "Comité confirmé",  color: BLUE,      bg: "#eff6ff" },
};

export default function Dashboard({
    expert = {},
    stats = {},
    affectations = [],
    notifications = [],
    notificationsNonLues = 0,
}) {
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
    const expertName = getExpertName(expert);

    const [refusal, setRefusal] = useState({ id: null, motif: '' });
    const [localNotifications, setLocalNotifications] = useState(notifications ?? []);
    const [localNonLues, setLocalNonLues] = useState(notificationsNonLues ?? 0);

    const marquerLu = (id) => {
        axios.patch(route('expert.notifications.lire', id)).then(() => {
            setLocalNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, lu: true } : n)
            );
            setLocalNonLues(prev => Math.max(0, prev - 1));
        });
    };

    const toutLire = () => {
        axios.patch(route('expert.notifications.toutLire')).then(() => {
            setLocalNotifications(prev => prev.map(n => ({ ...n, lu: true })));
            setLocalNonLues(0);
        });
    };

    const pendingAffectations  = affectations.filter(a => ['en_attente_confirmation_expert', 'acces_envoye'].includes(a.status));
    const confirmedAffectations = affectations.filter(a => a.status === 'confirme_par_expert');
    const firstConfirmed = confirmedAffectations?.[0]?.dossier || null;
    const dossierTargetUrl = firstConfirmed?.id ? `/expert/dossiers/${firstConfirmed.id}` : '/expert/dossiers';

    const doAccept = (e, a) => {
        e.preventDefault(); e.stopPropagation();
        router.post(`/expert/affectations/${a.id}/accept`, {}, { preserveScroll: true });
    };

    const openRefusal = (e, a) => {
        e.preventDefault(); e.stopPropagation();
        setRefusal({ id: a.id, motif: '' });
    };

    const submitRefusal = () => {
        if (!refusal.motif.trim()) return;
        router.post(`/expert/affectations/${refusal.id}/refuse`, { motif_refus: refusal.motif }, {
            preserveScroll: true,
            onSuccess: () => setRefusal({ id: null, motif: '' }),
        });
    };

    const statCards = [
        { label: "Dossiers actifs",       value: metric(stats, 'dossiers_actifs',         'dossiersActifs'),       color: BLUE,   bg: "#EBF4FF", href: "/expert/dossiers",       icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" },
        { label: "Évaluations en cours",  value: metric(stats, 'evaluations_en_cours',     'evaluationsEnCours'),   color: GREEN,  bg: "#ecfdf5", href: dossierTargetUrl,          icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
        { label: "Invitations en attente",value: metric(stats, 'invitations_en_attente',   'invitationsEnAttente'), color: ORANGE, bg: "#fffbeb", href: "/expert/participations",   icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" },
        { label: "Rapports à déposer",    value: metric(stats, 'rapports_a_deposer',       'rapportsADeposer'),     color: RED,    bg: "#fef2f2", href: "/expert/rapports",         icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" },
    ];

    return (
        <>
            <Head title="Tableau de bord — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .exp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
                .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important; }
                .inv-card { transition: border-color 0.15s, background 0.15s; }
                .inv-card:hover { border-color: rgba(12,68,124,0.25) !important; }
                .row-hover { transition: background 0.1s; }
                .row-hover:hover { background: #f8fafc !important; }
                .btn-act { transition: opacity 0.15s; cursor: pointer; border: none; }
                .btn-act:hover { opacity: 0.88; }
                .qa-link { transition: all 0.15s ease; text-decoration: none; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 10px; }
                .qa-blue:hover  { background: ${BLUE}   !important; border-color: ${BLUE}   !important; }
                .qa-green:hover { background: ${GREEN}  !important; border-color: ${GREEN}  !important; }
                .qa-orange:hover{ background: ${ORANGE} !important; border-color: ${ORANGE} !important; }
                .qa-slate:hover { background: #475569   !important; border-color: #475569   !important; }
                .qa-link:hover span { color: #fff !important; }
                .qa-link:hover svg  { stroke: #fff !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            `}</style>

            <div className="exp-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                    <div>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px", textTransform: "capitalize", fontWeight: 500, letterSpacing: "0.02em" }}>{today}</p>
                        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>{greeting}, {expertName} 👋</h1>
                        <p style={{ color: "#64748b", fontSize: 14, margin: 0, fontWeight: 500 }}>Bienvenue dans votre espace expert ANEAQ</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 99, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px #bbf7d0", animation: "pulse 2s infinite" }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>Connecté</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 99, background: "#fff", border: "1px solid #e2e8f0" }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: "2rem", animationDelay: "0.05s" }}>
                    {statCards.map((s, i) => (
                        <div key={i} className="stat-card" onClick={() => router.visit(s.href)}
                            style={{ background: "#fff", border: "1px solid #e8edf3", borderTop: `3px solid ${s.color}`, borderRadius: 16, padding: "1.4rem 1.5rem", boxShadow: "0 2px 16px rgba(12,68,124,.06)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: `${s.color}06`, pointerEvents: "none" }} />
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2"><path d={s.icon}/></svg>
                            </div>
                            <p style={{ fontSize: 38, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.03em" }}>{s.value ?? 0}</p>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0, fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main grid */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, animationDelay: "0.1s" }}>

                    {/* Left column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Invitations */}
                        <Panel
                            color={ORANGE} iconPath="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"
                            title="Invitations à valider" subtitle="Confirmez ou refusez votre participation"
                            badge={`${pendingAffectations.length}`}
                        >
                            {pendingAffectations.length === 0
                                ? <EmptyBox text="Aucune invitation en attente." />
                                : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {pendingAffectations.map(a => <InvCard key={a.id} a={a} onAccept={doAccept} onRefuse={openRefusal} />)}
                                  </div>
                            }
                        </Panel>

                        {/* Confirmed dossiers */}
                        <Panel
                            color={BLUE} iconPath="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                            title="Dossiers confirmés" subtitle="Vos dossiers validés prêts pour l'évaluation"
                            badge={`${confirmedAffectations.length}`}
                            action={{ label: "Voir tous →", href: "/expert/dossiers" }}
                        >
                            {confirmedAffectations.length === 0
                                ? <EmptyBox text="Aucun dossier confirmé pour le moment." />
                                : <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 0.7fr auto", padding: "8px 16px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" }}>
                                        {["Dossier", "Établissement", "Visite", "Comité", ""].map((h, i) => (
                                            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
                                        ))}
                                    </div>
                                    {confirmedAffectations.map(a => <ConfRow key={a.id} a={a} />)}
                                  </>
                            }
                        </Panel>
                    </div>

                    {/* Right column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Notifications */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                            <div style={{ padding: "1.1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ position: "relative", width: 34, height: 34, borderRadius: 9, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                        {localNonLues > 0 && (
                                            <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", fontSize: 9, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {localNonLues > 9 ? "9+" : localNonLues}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Notifications</p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{localNonLues} non lue{localNonLues !== 1 ? "s" : ""}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {localNonLues > 0 && (
                                        <button onClick={toutLire}
                                            style={{ fontSize: 11, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}
                                            title="Tout marquer comme lu">
                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/><polyline points="13 17 7 11"/></svg>
                                        </button>
                                    )}
                                    <a href="/expert/notifications" style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: "none" }}>Tout voir →</a>
                                </div>
                            </div>
                            <div style={{ padding: "0.5rem" }}>
                                {localNotifications?.length > 0
                                    ? localNotifications.slice(0, 5).map((n, i) => (
                                        <div key={n.id || i}
                                            onClick={() => !n.lu && marquerLu(n.id)}
                                            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 10px", borderRadius: 10, background: n.lu ? "transparent" : `${BLUE}05`, marginBottom: 2, borderLeft: n.lu ? "3px solid transparent" : `3px solid ${BLUE}25`, cursor: n.lu ? "default" : "pointer", transition: "background 0.1s" }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 12.5, fontWeight: n.lu ? 600 : 700, color: "#0f172a", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.titre || "Notification"}</p>
                                                <p style={{ fontSize: 10.5, color: "#94a3b8", margin: 0, fontFamily: "'DM Mono', monospace" }}>{n.created_at ? new Date(n.created_at).toLocaleDateString("fr-FR") : "—"}</p>
                                            </div>
                                            {!n.lu && (
                                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: BLUE, flexShrink: 0, marginTop: 4 }} />
                                            )}
                                        </div>
                                    ))
                                    : <p style={{ padding: "1.5rem", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>Aucune notification.</p>
                                }
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Actions rapides</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                {[
                                    { label: "Mes invitations",  href: "/expert/participations", color: ORANGE, cls: "qa-orange" },
                                    { label: "Mes dossiers",     href: "/expert/dossiers",       color: BLUE,   cls: "qa-blue"   },
                                    { label: "Déposer rapport",  href: "/expert/rapports",       color: GREEN,  cls: "qa-green"  },
                                    { label: "Mon historique",   href: "/expert/historique",     color: "#64748b", cls: "qa-slate" },
                                    { label: "Mon profil",       href: "/expert/profil",         color: "#64748b", cls: "qa-slate" },
                                ].map((a, i) => (
                                    <a key={i} href={a.href} className={`qa-link ${a.cls}`}
                                        style={{ border: `1px solid ${a.color}20`, background: `${a.color}06` }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.label}</span>
                                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Per-dossier progress */}
                        <DossierProgressPanel affectations={confirmedAffectations} blue={BLUE} green={GREEN} orange={ORANGE} />
                    </div>
                </div>
            </div>

            {/* Refusal modal */}
            {refusal.id !== null && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24 }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Refuser la participation</h3>
                                <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Expliquez votre motif de refus</p>
                            </div>
                        </div>
                        <textarea
                            value={refusal.motif}
                            onChange={e => setRefusal(r => ({ ...r, motif: e.target.value }))}
                            placeholder="Décrivez votre motif de refus (obligatoire)…"
                            rows={4}
                            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }}
                        />
                        {!refusal.motif.trim() && (
                            <p style={{ fontSize: 11, color: RED, margin: "6px 0 0" }}>Le motif de refus est obligatoire.</p>
                        )}
                        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                            <button onClick={() => setRefusal({ id: null, motif: '' })}
                                style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
                                Annuler
                            </button>
                            <button onClick={submitRefusal} disabled={!refusal.motif.trim()}
                                style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: RED, color: "#fff", fontSize: 13, fontWeight: 700, cursor: refusal.motif.trim() ? "pointer" : "not-allowed", opacity: refusal.motif.trim() ? 1 : 0.5 }}>
                                Confirmer le refus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const WORKFLOW_STEPS = [
    { key: "mission",  label: "Mission acceptée"        },
    { key: "dossier",  label: "Consulter le dossier"    },
    { key: "eval",     label: "Évaluation quantitative" },
    { key: "visite",   label: "Visite sur site"         },
    { key: "rapport",  label: "Rapport final"           },
];

function getDossierSteps(a) {
    const today = new Date();
    const visitDate = a.dossier?.date_visite ? new Date(a.dossier.date_visite) : null;
    const visitPassed = visitDate && visitDate < today;

    return [
        { done: true,         active: false },
        { done: false,        active: true  },
        { done: false,        active: false },
        { done: visitPassed,  active: !visitPassed && visitDate != null },
        { done: false,        active: false },
    ];
}

function DossierProgressPanel({ affectations, blue, green, orange }) {
    const items = affectations.slice(0, 3);

    return (
        <div style={{ background: `linear-gradient(135deg, ${blue}07, ${green}05)`, border: `1px solid ${blue}14`, borderRadius: 18, padding: "1.25rem" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                Progression par dossier
            </p>

            {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 8px" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Aucun dossier confirmé.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {items.map((a, idx) => {
                        const steps = getDossierSteps(a);
                        const dossier = a.dossier || {};
                        const etab = a.etablissement || {};
                        return (
                            <div key={a.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", border: "1px solid #e8edf3" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {etab.nom !== "—" ? etab.nom : dossier.reference || "Dossier"}
                                        </p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontFamily: "'DM Mono', monospace" }}>
                                            {dossier.reference || "—"}
                                        </p>
                                    </div>
                                    {dossier.url && (
                                        <a href={dossier.url} style={{ fontSize: 11, color: blue, fontWeight: 600, textDecoration: "none", flexShrink: 0, marginLeft: 8 }}>
                                            Ouvrir →
                                        </a>
                                    )}
                                </div>

                                {/* Steps dots */}
                                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                                    {WORKFLOW_STEPS.map((s, i) => {
                                        const st = steps[i];
                                        const bg = st.done ? green : st.active ? blue : "#e2e8f0";
                                        return (
                                            <div key={s.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                                <div title={s.label} style={{ width: 22, height: 22, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "default" }}>
                                                    {st.done
                                                        ? <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                        : <span style={{ fontSize: 8, fontWeight: 800, color: st.active ? "#fff" : "#94a3b8" }}>{i + 1}</span>
                                                    }
                                                </div>
                                                {i < WORKFLOW_STEPS.length - 1 && (
                                                    <div style={{ flex: 1, height: 2, background: st.done ? `${green}40` : "#e2e8f0" }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Active step label */}
                                {(() => {
                                    const activeIdx = steps.findIndex(s => s.active);
                                    const doneCount = steps.filter(s => s.done).length;
                                    const idx = activeIdx !== -1 ? activeIdx : Math.min(doneCount, WORKFLOW_STEPS.length - 1);
                                    return (
                                        <p style={{ fontSize: 11, color: "#64748b", margin: "7px 0 0", fontWeight: 500 }}>
                                            Étape en cours : <strong style={{ color: "#374151" }}>{WORKFLOW_STEPS[idx]?.label}</strong>
                                        </p>
                                    );
                                })()}
                            </div>
                        );
                    })}
                    {affectations.length > 3 && (
                        <a href="/expert/dossiers" style={{ fontSize: 12, color: blue, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                            Voir tous les dossiers ({affectations.length}) →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

function Panel({ color, iconPath, title, subtitle, badge, action, children }) {
    return (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d={iconPath}/></svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h3>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: `${color}10`, color }}>{badge}</span>
                    {action && <a href={action.href} style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: "none" }}>{action.label}</a>}
                </div>
            </div>
            <div style={{ padding: "1.25rem 1.5rem" }}>{children}</div>
        </div>
    );
}

function InvCard({ a, onAccept, onRefuse }) {
    const dossier = a.dossier || {};
    const etab = a.etablissement || {};
    const meta = STATUS_META[a.status] || { label: a.status, color: "#64748b", bg: "#f8fafc" };

    return (
        <div className="inv-card" style={{ border: "1px solid #e8edf3", borderRadius: 14, padding: "1.1rem 1.25rem", background: "#fafbfc" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: meta.bg, color: meta.color }}>{meta.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#EBF4FF", color: BLUE }}>{formatRole(a.role)}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{dossier.reference || "Dossier"}</h3>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px" }}>{etab.nom || "—"} · {etab.ville || "—"}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                        <Pill label="Visite"  value={fmtDate(dossier.date_visite)} />
                        <Pill label="Comité"  value={`${a.comite_confirmed_count || 0}/${a.comite_total || 0}`} />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <button onClick={e => onAccept(e, a)} className="btn-act"
                        style={{ padding: "8px 16px", borderRadius: 9, background: GREEN, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Accepter
                    </button>
                    <button onClick={e => onRefuse(e, a)} className="btn-act"
                        style={{ padding: "8px 16px", borderRadius: 9, background: "#fef2f2", color: RED, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Refuser
                    </button>
                </div>
            </div>
        </div>
    );
}

function Pill({ label, value }) {
    return (
        <div style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 9, padding: "7px 11px" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>{value || "—"}</p>
        </div>
    );
}

function ConfRow({ a }) {
    const d = a.dossier || {};
    const e = a.etablissement || {};
    return (
        <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 0.7fr auto", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}>
            <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>{d.reference || "—"}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{d.statut || "—"}</p>
            </div>
            <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{e.nom || "—"}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{e.ville || "—"}</p>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: ORANGE }}>{fmtDate(d.date_visite)}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{a.comite_confirmed_count || 0}/{a.comite_total || 0}</div>
            <a href={`/expert/dossiers/${d.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, background: BLUE, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Ouvrir</a>
        </div>
    );
}

function EmptyBox({ text }) {
    return (
        <div style={{ padding: "2.5rem", textAlign: "center", border: "1.5px dashed #e2e8f0", borderRadius: 12 }}>
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 10px" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{text}</p>
        </div>
    );
}

function metric(stats, snakeKey, camelKey) { return stats?.[snakeKey] ?? stats?.[camelKey] ?? 0; }
function getExpertName(e) {
    if (e?.name) return e.name;
    return `${e?.prenom || ''} ${e?.nom || ''}`.trim() || 'Expert';
}
function formatRole(r) { return { chef_comite: 'Chef de comité', expert: 'Expert' }[r] || r || 'Expert'; }
function fmtDate(v) {
    if (!v) return 'Non planifiée';
    try { return new Date(v).toLocaleDateString('fr-FR'); } catch { return v; }
}

Dashboard.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;
