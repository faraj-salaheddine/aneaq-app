// resources/js/Layouts/Expert/ExpertLayout.jsx

import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

const BLUE  = "#0C447C";
const GREEN = "#1D9E75";

const NAV_ITEMS = [
    { key: "dashboard",      label: "Vue d'ensemble",          icon: "grid",         route: "expert.dashboard" },
    { key: "participations", label: "Mes invitations",          icon: "mail",         route: "expert.participations.index", badgeKey: "invitationsEnAttente" },
    { key: "dossiers",       label: "Dossiers affectés",        icon: "folder",       route: "expert.dossiers.index" },
    { key: "rapports",       label: "Mes rapports",             icon: "file-text",    route: "expert.rapports.index" },
    { key: "notifications",  label: "Notifications",            icon: "bell",         route: "expert.notifications.index", badgeKey: "notificationsNonLues" },
    { key: "historique",     label: "Historique",               icon: "clock",        route: "expert.historique.index" },
    
];

const NAV_BOTTOM = [
    { key: "accueil",        label: "Accueil",                  icon: "home",         route: "dashboard" },
];

const ICONS = {
    grid: (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
    ),
    mail: (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    ),
    folder: (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
    ),
    "file-text": (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
    ),
    bell: (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    ),
    clock: (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    home: (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    ),
    logout: (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
};

export default function ExpertLayout({ children, active }) {
    const { auth, notificationsNonLues = 0, invitationsEnAttente = 0 } = usePage().props;
    const expert = auth?.expert ?? null;

    const badges = { notificationsNonLues, invitationsEnAttente };

    const initiales = expert
        ? (expert.prenom?.[0] ?? "").toUpperCase() + (expert.nom?.[0] ?? "").toUpperCase()
        : "EX";

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; }
                .nav-link { transition: all 0.15s ease; }
                .nav-link:hover { background: #f1f5f9 !important; color: #0f172a !important; }
                .nav-link:hover svg { stroke: #0f172a !important; }
                .nav-link-active { background: ${BLUE}10 !important; color: ${BLUE} !important; }
                .nav-link-active svg { stroke: ${BLUE} !important; }
                .logout-btn:hover { background: #fff1f2 !important; color: #ef4444 !important; }
                .logout-btn:hover svg { stroke: #ef4444 !important; }
            `}</style>

            {/* ── SIDEBAR ── */}
            <aside style={{
                width: 240,
                minHeight: "100vh",
                background: "#fff",
                borderRight: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                height: "100vh",
                overflowY: "auto",
                flexShrink: 0,
            }}>
                {/* Logo */}
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "-0.5px" }}>AN</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>ANEAQ</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>Espace Expert</div>
                        </div>
                    </div>
                </div>

                {/* Expert card */}
                {expert && (
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", borderRadius: 10,
                            background: `linear-gradient(135deg, ${BLUE}08, ${GREEN}06)`,
                            border: `1px solid ${BLUE}15`,
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: `linear-gradient(135deg, ${GREEN}, #178a63)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
                            }}>{initiales}</div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {expert.prenom} {expert.nom}
                                </div>
                                <div style={{ fontSize: 10, color: GREEN, fontWeight: 600, marginTop: 1 }}>Expert Évaluateur</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "10px 10px 0" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 10px 4px", margin: 0 }}>
                        Navigation
                    </p>
                    {NAV_ITEMS.map(item => {
                        const isActive = active === item.key;
                        const badge    = item.badgeKey ? badges[item.badgeKey] : 0;
                        return (
                            <Link key={item.key}
                                href={item.route ? route(item.route) : "#"}
                                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "9px 12px", borderRadius: 9,
                                    marginBottom: 2, textDecoration: "none",
                                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                                    color: isActive ? BLUE : "#475569",
                                }}>
                                <span style={{ color: isActive ? BLUE : "#94a3b8", flexShrink: 0 }}>
                                    {ICONS[item.icon]}
                                </span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {badge > 0 && (
                                    <span style={{
                                        background: item.badgeKey === "notificationsNonLues" ? "#ef4444" : "#f59e0b",
                                        color: "#fff", fontSize: 10, fontWeight: 700,
                                        padding: "1px 6px", borderRadius: 99, minWidth: 18, textAlign: "center",
                                    }}>{badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom nav */}
                <div style={{ padding: "10px 10px 12px", borderTop: "1px solid #f1f5f9" }}>
                    {NAV_BOTTOM.map(item => (
                        <Link key={item.key}
                            href={route(item.route)}
                            className="nav-link"
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, marginBottom: 2, textDecoration: "none", fontSize: 13, fontWeight: 500, color: "#475569" }}>
                            <span style={{ color: "#94a3b8" }}>{ICONS[item.icon]}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <Link
                        href={route("logout")} method="post" as="button"
                        className="logout-btn nav-link"
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, width: "100%", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#475569", textAlign: "left" }}>
                        <span style={{ color: "#94a3b8" }}>{ICONS.logout}</span>
                        <span>Déconnexion</span>
                    </Link>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ flex: 1, minHeight: "100vh", overflow: "auto" }}>
                {children}
            </main>
        </div>
    );
}