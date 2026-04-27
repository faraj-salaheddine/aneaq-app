// resources/js/Pages/Expert/Dashboard.jsx

import { Head, Link, router } from "@inertiajs/react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#ef4444";

const STATUT_META = {
    en_preparation:     { label: "En préparation",    color: "#64748b", bg: "#f1f5f9" },
    autoeval_en_cours:  { label: "Autoéval. en cours",color: "#d97706", bg: "#fffbeb" },
    autoeval_depose:    { label: "Autoéval. déposée", color: "#0891b2", bg: "#ecfeff" },
    en_evaluation:      { label: "En évaluation",     color: BLUE,      bg: "#EBF4FF" },
    visite_planifiee:   { label: "Visite planifiée",  color: ORANGE,    bg: "#FFF7ED" },
    rapport_en_attente: { label: "Rapport attendu",   color: RED,       bg: "#fff1f2" },
    rapport_depose:     { label: "Rapport déposé",    color: GREEN,     bg: "#ECFDF5" },
    valide:             { label: "Validé",            color: GREEN,     bg: "#ECFDF5" },
    cloture:            { label: "Clôturé",           color: "#64748b", bg: "#f1f5f9" },
};

function StatutBadge({ statut }) {
    const m = STATUT_META[statut] ?? { label: statut, color: "#64748b", bg: "#f1f5f9" };
    return (
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, color: m.color, background: m.bg }}>
            {m.label}
        </span>
    );
}

export default function Dashboard({ expert, stats, dossiers, notifications, notificationsNonLues }) {
    const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const hour  = new Date().getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

    return (
        <>
            <Head title="Tableau de bord — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .expert-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .stat-card { transition: all 0.2s; }
                .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important; }
                .action-btn:hover { transform: translateY(-1px); }
                .dossier-row:hover { background: #f8fafc !important; }
                .notif-row:hover { background: #f8fafc !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>

            <div className="expert-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                    <div>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px", textTransform: "capitalize", fontWeight: 500 }}>{today}</p>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                            {greeting} 👋
                        </h1>
                        <p style={{ color: "#64748b", fontSize: 14, margin: 0, fontWeight: 500 }}>
                            {expert?.prenom} {expert?.nom} — Espace Expert ANEAQ
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 99, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>Connecté</span>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: "1.5rem", animationDelay: "0.05s" }}>
                    {[
                        { label: "Dossiers actifs",         value: stats?.dossiersActifs ?? 0,        color: BLUE,   bg: "#EBF4FF", href: route("expert.dossiers.index"),
                          icon: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/> },
                        { label: "Évaluations en cours",    value: stats?.evaluationsEnCours ?? 0,    color: GREEN,  bg: "#ECFDF5", href: route("expert.dossiers.index"),
                          icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> },
                        { label: "Invitations en attente",  value: stats?.invitationsEnAttente ?? 0,  color: ORANGE, bg: "#FFF7ED", href: route("expert.participations.index"),
                          icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></> },
                        { label: "Rapports à déposer",      value: stats?.rapportsADeposer ?? 0,      color: RED,    bg: "#fff1f2", href: route("expert.rapports.index"),
                          icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
                    ].map((s, i) => (
                        <div key={i} className="stat-card"
                            onClick={() => router.visit(s.href)}
                            style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 14, padding: "1.5rem 1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}08`, pointerEvents: "none" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: s.bg, color: s.color }}>Voir →</span>
                            </div>
                            <p style={{ fontSize: 36, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 500 }}>{s.label}</p>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}40)`, borderRadius: "0 0 14px 14px" }} />
                        </div>
                    ))}
                </div>

                {/* Two columns */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, animationDelay: "0.1s" }}>

                    {/* Dossiers actifs */}
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Dossiers actifs</h3>
                            </div>
                            <Link href={route("expert.dossiers.index")} style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: "none" }}>
                                Voir tout →
                            </Link>
                        </div>
                        <div>
                            {!dossiers?.length && (
                                <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                    Aucun dossier actif.
                                </div>
                            )}
                            {dossiers?.map((d, i) => (
                                <div key={d.id} className="dossier-row"
                                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < dossiers.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.1s", cursor: "pointer" }}
                                    onClick={() => router.visit(route("expert.dossiers.show", d.id))}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                        {d.acronyme?.slice(0, 2)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{d.acronyme} — {d.ville}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {d.universite} · Vague <span style={{ fontFamily: "monospace" }}>{d.vague}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                        <StatutBadge statut={d.statut} />
                                        {d.date_visite && (
                                            <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>
                                                Visite: {new Date(d.date_visite).toLocaleDateString("fr-FR")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Colonne droite */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Notifications récentes */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                                    🔔 Notifications
                                    {notificationsNonLues > 0 && (
                                        <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>{notificationsNonLues}</span>
                                    )}
                                </h3>
                                <Link href={route("expert.notifications.index")} style={{ fontSize: 11, color: BLUE, fontWeight: 600, textDecoration: "none" }}>Tout voir</Link>
                            </div>
                            <div>
                                {!notifications?.length && (
                                    <p style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>Aucune notification.</p>
                                )}
                                {notifications?.slice(0, 4).map((n, i) => (
                                    <div key={n.id} className="notif-row"
                                        style={{ display: "flex", gap: 10, padding: "11px 16px", borderBottom: i < Math.min(notifications.length, 4) - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.1s" }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.lu ? "#e2e8f0" : BLUE, marginTop: 5, flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, color: n.lu ? "#64748b" : "#0f172a", fontWeight: n.lu ? 400 : 600, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {n.titre}
                                            </div>
                                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontFamily: "monospace" }}>
                                                {new Date(n.created_at).toLocaleDateString("fr-FR")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions rapides */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </div>
                                Actions rapides
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {[
                                    { label: "Mes invitations",  href: route("expert.participations.index"), color: ORANGE },
                                    { label: "Mes dossiers",     href: route("expert.dossiers.index"),      color: BLUE   },
                                    { label: "Déposer rapport",  href: route("expert.rapports.index"),      color: GREEN  },
                                    { label: "Mon historique",   href: route("expert.historique.index"),    color: "#64748b" },
                                ].map((a, i) => (
                                    <button key={i} className="action-btn"
                                        onClick={() => router.visit(a.href)}
                                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, border: `1px solid ${a.color}20`, background: `${a.color}06`, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.borderColor = a.color; e.currentTarget.querySelector("span").style.color = "#fff"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = `${a.color}06`; e.currentTarget.style.borderColor = `${a.color}20`; e.currentTarget.querySelector("span").style.color = a.color; }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: a.color, transition: "color 0.15s" }}>{a.label}</span>
                                        <svg style={{ marginLeft: "auto" }} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = page => <ExpertLayout active="dashboard">{page}</ExpertLayout>;