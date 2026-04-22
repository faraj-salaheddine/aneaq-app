// resources/js/Pages/SI/VueEnsemble.jsx

import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const PURPLE = "#7e22ce";

const TYPE_META = {
    expert: { label: "Expert",        color: GREEN,  bg: "#ECFDF5", dot: "#10b981" },
    dee:    { label: "Utilisateur DEE", color: BLUE, bg: "#EBF4FF", dot: "#3b82f6" },
};

const ROLE_META = {
    dee:      { label: "DEE",      color: BLUE,   bg: "#EBF4FF" },
    chef_dee: { label: "Chef DEE", color: PURPLE, bg: "#FAF5FF" },
};

export default function VueEnsemble({ stats = {}, recentActivity = [] }) {
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

    const createdCount  = recentActivity.filter(a => a.action === "Compte créé").length;
    const modifiedCount = recentActivity.filter(a => a.action === "Compte modifié").length;
    const expertActivity = recentActivity.filter(a => a.type === "expert").length;
    const deeActivity    = recentActivity.filter(a => a.type === "dee").length;

    return (
        <>
            <Head title="Vue d'ensemble" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .vue-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .stat-card { transition: all 0.2s ease; }
                .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important; }
                .action-btn { transition: all 0.18s ease; }
                .action-btn:hover { transform: translateY(-2px); }
                .activity-row:hover { background: #f8fafc !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
            `}</style>

            <div className="vue-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                    <div>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px", textTransform: "capitalize", fontWeight: 500, letterSpacing: "0.02em" }}>
                            {today}
                        </p>
                        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>
                            {greeting} 👋
                        </h1>
                        <p style={{ color: "#64748b", fontSize: 14, margin: 0, fontWeight: 500 }}>
                            Bienvenue sur le tableau de bord du Système d'Information ANEAQ
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 99, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px #bbf7d0", animation: "pulse 2s infinite" }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>Système opérationnel</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 99, background: "#fff", border: "1px solid #e2e8f0" }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                                {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Main stat cards ── */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: "1.5rem", animationDelay: "0.05s" }}>
                    {[
                        { label: "Utilisateurs DEE", value: stats.dee,            color: BLUE,   bg: "#EBF4FF", href: "/si/utilisateurs-dee",
                          icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
                        { label: "Experts",          value: stats.experts,        color: GREEN,  bg: "#ECFDF5", href: "/si/experts",
                          icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
                        { label: "Établissements",   value: stats.etablissements, color: ORANGE, bg: "#FFFBEB", href: "/si/etablissements",
                          icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></> },
                        { label: "Universités",      value: stats.universites,    color: PURPLE, bg: "#FAF5FF", href: "/si/universites",
                          icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
                    ].map((s, i) => (
                        <div key={i} className="stat-card"
                            onClick={() => router.visit(s.href)}
                            style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 16, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: "pointer", position: "relative", overflow: "hidden" }}
                        >
                            {/* Background decoration */}
                            <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: `${s.color}08`, pointerEvents: "none" }} />

                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 99, background: `${s.color}10`, color: s.color, fontSize: 11, fontWeight: 700 }}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                                    Voir
                                </div>
                            </div>

                            <p style={{ fontSize: 42, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.03em" }}>
                                {s.value ?? 0}
                            </p>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0, fontWeight: 500 }}>{s.label}</p>

                            {/* Bottom accent */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}40)`, borderRadius: "0 0 16px 16px" }} />
                        </div>
                    ))}
                </div>

                {/* ── Activity summary strip ── */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "2rem", animationDelay: "0.1s" }}>
                    {[
                        { label: "Comptes créés",   value: createdCount,  color: GREEN,  icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></> },
                        { label: "Comptes modifiés", value: modifiedCount, color: ORANGE, icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></> },
                        { label: "Activité experts", value: expertActivity, color: GREEN,  icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
                        { label: "Activité DEE",     value: deeActivity,   color: BLUE,   icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></> },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1 }}>{s.value}</p>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, animationDelay: "0.15s" }} className="fade-up">

                    {/* ── Recent Activity ── */}
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>

                        {/* Header */}
                        <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Historique des activités</h3>
                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>Dernières modifications du système</p>
                                </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: `${BLUE}10`, color: BLUE }}>
                                {recentActivity.length} entrées
                            </span>
                        </div>

                        {/* Timeline */}
                        <div style={{ padding: "0.5rem 0" }}>
                            {recentActivity.length === 0 ? (
                                <div style={{ padding: "3rem", textAlign: "center" }}>
                                    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: "0 auto 1rem", display: "block" }}>
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Aucune activité récente</p>
                                </div>
                            ) : recentActivity.map((a, i) => {
                                const meta = TYPE_META[a.type] || TYPE_META.expert;
                                const isCreated = a.action === "Compte créé";
                                return (
                                    <div key={i} className="activity-row"
                                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < recentActivity.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.1s" }}
                                    >
                                        {/* Avatar */}
                                        <div style={{ width: 40, height: 40, borderRadius: 11, background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${meta.color}20`, letterSpacing: "0.02em" }}>
                                            {a.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {a.name}
                                                </span>
                                                {a.role && (
                                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: ROLE_META[a.role]?.bg || "#f1f5f9", color: ROLE_META[a.role]?.color || "#64748b", flexShrink: 0 }}>
                                                        {ROLE_META[a.role]?.label || a.role}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{a.email}</span>
                                            </div>
                                        </div>

                                        {/* Right side */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: isCreated ? "#f0fdf4" : "#fffbeb", color: isCreated ? "#16a34a" : "#d97706" }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: isCreated ? "#16a34a" : "#d97706" }} />
                                                {a.action}
                                            </span>
                                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{a.date_human}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Quick actions */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Actions rapides</h3>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {[
                                    { label: "Ajouter un utilisateur DEE", href: "/si/utilisateurs-dee/create", color: BLUE },
                                    { label: "Ajouter un expert",           href: "/si/experts/create",          color: GREEN },
                                    { label: "Ajouter un établissement",    href: "/si/etablissements/create",   color: ORANGE },
                                    { label: "Voir les universités",         href: "/si/universites",             color: PURPLE },
                                ].map((a, i) => (
                                    <button key={i} className="action-btn"
                                        onClick={() => router.visit(a.href)}
                                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: `1px solid ${a.color}20`, background: `${a.color}06`, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.borderColor = a.color; e.currentTarget.querySelector("span").style.color = "#fff"; e.currentTarget.querySelector("div").style.background = "rgba(255,255,255,0.2)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = `${a.color}06`; e.currentTarget.style.borderColor = `${a.color}20`; e.currentTarget.querySelector("span").style.color = a.color; e.currentTarget.querySelector("div").style.background = `${a.color}12`; }}
                                    >
                                        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${a.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.5">
                                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: a.color, transition: "color 0.15s" }}>{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* System info */}
                        <div style={{ background: `linear-gradient(135deg, ${BLUE}08, ${GREEN}06)`, border: `1px solid ${BLUE}15`, borderRadius: 18, padding: "1.5rem" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 1rem" }}>Informations système</p>
                            {[
                                { label: "Plateforme",  value: "ANEAQ SI v1.0" },
                                { label: "Environnement", value: "Production" },
                                { label: "Base de données", value: "MySQL — aneaq_db" },
                                { label: "Dernière activité", value: recentActivity[0]?.date_human || "—" },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
                                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

VueEnsemble.layout = page => <DashboardLayout>{page}</DashboardLayout>;