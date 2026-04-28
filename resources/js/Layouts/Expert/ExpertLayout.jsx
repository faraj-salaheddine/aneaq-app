// resources/js/Layouts/Expert/ExpertLayout.jsx

import { Link, router, usePage } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";

const BLUE  = "#0C447C";
const GREEN = "#1D9E75";

const NAV_ITEMS = [
    { key: "dashboard",      label: "Vue d'ensemble",   icon: "grid",      route: "expert.dashboard" },
    { key: "participations", label: "Mes invitations",   icon: "mail",      route: "expert.participations.index", badgeKey: "invitationsEnAttente" },
    { key: "dossiers",       label: "Dossiers affectés", icon: "folder",    route: "expert.dossiers.index" },
    { key: "rapports",       label: "Mes rapports",      icon: "file-text", route: "expert.rapports.index" },
    { key: "notifications",  label: "Notifications",     icon: "bell",      route: "expert.notifications.index", badgeKey: "notificationsNonLues" },
    { key: "historique",     label: "Historique",        icon: "clock",     route: "expert.historique.index" },
];

const ICONS = {
    grid: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    mail: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    folder: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    "file-text": <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    bell: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    clock: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    home: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    logout: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    eye: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    edit: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    chevron: <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
};

const PALETTE = [
    { bg: "#EBF4FF", color: "#1d4ed8" },
    { bg: "#ECFDF5", color: "#065f46" },
    { bg: "#FFF7ED", color: "#9a3412" },
    { bg: "#FAF5FF", color: "#6b21a8" },
];
const getColor = str => PALETTE[(str?.charCodeAt(0) || 0) % PALETTE.length];

export default function ExpertLayout({ children, active }) {
    const { auth, notificationsNonLues = 0, invitationsEnAttente = 0 } = usePage().props;
    const expert = auth?.expert ?? null;
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    const badges   = { notificationsNonLues, invitationsEnAttente };
    const initiales = expert
        ? (expert.prenom?.[0] ?? "").toUpperCase() + (expert.nom?.[0] ?? "").toUpperCase()
        : "EX";
    const av = getColor(expert?.nom ?? "");

    // Ferme le menu si clic en dehors — sans overlay qui bloque les clics
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        }
        if (showProfileMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showProfileMenu]);

    // Navigation propre : ferme le menu PUIS navigue
    const goTo = (routeName) => {
        setShowProfileMenu(false);
        setTimeout(() => router.visit(route(routeName)), 50);
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; }
                .nav-link { transition: all 0.15s ease; text-decoration: none; }
                .nav-link:hover { background: #f1f5f9 !important; color: #0f172a !important; }
                .nav-link-active { background: ${BLUE}10 !important; color: ${BLUE} !important; }
                .logout-btn:hover { background: #fff1f2 !important; color: #ef4444 !important; }
                .profile-btn { transition: all 0.15s; }
                .profile-btn:hover { background: #f1f5f9 !important; border-color: #e2e8f0 !important; }
                .p-action { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; font-size:13px; font-weight:500; color:#374151; background:transparent; border:none; width:100%; text-align:left; cursor:pointer; transition:background 0.1s; }
                .p-action:hover { background: #f1f5f9 !important; }
                .p-action-red { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; font-size:13px; font-weight:500; color:#ef4444; background:transparent; border:none; width:100%; text-align:left; cursor:pointer; transition:background 0.1s; }
                .p-action-red:hover { background: #fff1f2 !important; }
                @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
                .pdrop { animation: fadeDown 0.15s ease; }
            `}</style>

            {/* SIDEBAR */}
            <aside style={{ width: 240, minHeight: "100vh", background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0 }}>

                {/* Logo */}
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>AN</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>ANEAQ</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>Espace Expert</div>
                        </div>
                    </div>
                </div>

                {/* CARTE PROFIL */}
                <div ref={menuRef} style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", position: "relative" }}>

                    <button className="profile-btn" onClick={() => setShowProfileMenu(s => !s)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: showProfileMenu ? "#f1f5f9" : "#fafbfc", border: `1px solid ${showProfileMenu ? "#e2e8f0" : "#f1f5f9"}`, cursor: "pointer", textAlign: "left" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: av.bg, color: av.color, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${av.color}20` }}>
                            {initiales}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {expert ? `${expert.prenom} ${expert.nom}` : "Expert"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                                <span style={{ fontSize: 10, color: GREEN, fontWeight: 600 }}>Expert Évaluateur</span>
                            </div>
                        </div>
                        <span style={{ color: "#94a3b8", flexShrink: 0, display: "flex", transform: showProfileMenu ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                            {ICONS.chevron}
                        </span>
                    </button>

                    {/* DROPDOWN */}
                    {showProfileMenu && (
                        <div className="pdrop" style={{ position: "absolute", top: "calc(100% - 4px)", left: 14, right: 14, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,0.12)", zIndex: 300, overflow: "hidden" }}>

                            {/* Header */}
                            <div style={{ padding: "14px 16px", background: `linear-gradient(135deg, ${BLUE}06, ${GREEN}04)`, borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: av.bg, color: av.color, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${av.color}20` }}>
                                        {initiales}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {expert ? `${expert.prenom} ${expert.nom}` : "Expert"}
                                        </div>
                                        {expert?.email && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expert.email}</div>}
                                        {expert?.grade && <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{expert.grade}</div>}
                                        {expert?.specialite && <span style={{ display: "inline-block", marginTop: 4, fontSize: 10, padding: "2px 8px", borderRadius: 99, background: `${GREEN}12`, color: GREEN, fontWeight: 700 }}>{expert.specialite}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Boutons navigation */}
                            <div style={{ padding: "6px" }}>
                                <button className="p-action" onClick={() => goTo("expert.profil.show")}>
                                    <span style={{ color: BLUE, display: "flex", flexShrink: 0 }}>{ICONS.eye}</span>
                                    <span>Voir mon profil</span>
                                </button>
                                <button className="p-action" onClick={() => goTo("expert.profil.edit")}>
                                    <span style={{ color: GREEN, display: "flex", flexShrink: 0 }}>{ICONS.edit}</span>
                                    <span>Modifier mon profil</span>
                                </button>
                            </div>

                            <div style={{ height: 1, background: "#f1f5f9", margin: "0 10px" }} />

                            {/* Déconnexion */}
                            <div style={{ padding: "6px" }}>
                                <Link href={route("logout")} method="post" as="button" className="p-action-red" onClick={() => setShowProfileMenu(false)}>
                                    <span style={{ color: "#ef4444", display: "flex", flexShrink: 0 }}>{ICONS.logout}</span>
                                    <span>Se déconnecter</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* NAVIGATION */}
                <nav style={{ flex: 1, padding: "10px 10px 0" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 10px 4px", margin: 0 }}>Navigation</p>
                    {NAV_ITEMS.map(item => {
                        const isActive = active === item.key;
                        const badge    = item.badgeKey ? badges[item.badgeKey] : 0;
                        return (
                            <Link key={item.key} href={route(item.route)}
                                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, marginBottom: 2, fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? BLUE : "#475569" }}>
                                <span style={{ color: isActive ? BLUE : "#94a3b8", flexShrink: 0 }}>{ICONS[item.icon]}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {badge > 0 && (
                                    <span style={{ background: item.badgeKey === "notificationsNonLues" ? "#ef4444" : "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, minWidth: 18, textAlign: "center" }}>{badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* BAS */}
                <div style={{ padding: "10px 10px 14px", borderTop: "1px solid #f1f5f9" }}>
                    <Link href={route("dashboard")} className="nav-link"
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, marginBottom: 2, fontSize: 13, fontWeight: 500, color: "#475569" }}>
                        <span style={{ color: "#94a3b8" }}>{ICONS.home}</span>
                        <span>Accueil</span>
                    </Link>
                    <Link href={route("logout")} method="post" as="button" className="logout-btn nav-link"
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, width: "100%", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#475569", textAlign: "left" }}>
                        <span style={{ color: "#94a3b8" }}>{ICONS.logout}</span>
                        <span>Déconnexion</span>
                    </Link>
                </div>
            </aside>

            {/* MAIN */}
            <main style={{ flex: 1, minHeight: "100vh", overflow: "auto" }}>
                {children}
            </main>
        </div>
    );
}