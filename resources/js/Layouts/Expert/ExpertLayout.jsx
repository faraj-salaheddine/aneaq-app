import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    Mail,
    FolderOpen,
    FileText,
    Bell,
    History,
    UserRound,
    LogOut,
    Home,
    ChevronRight,
    CalendarDays,
    ClipboardCheck,
} from 'lucide-react';

const GREEN = "#1D9E75";
const BLUE  = "#0C447C";

const navItems = [
    { label: "Vue d'ensemble",       href: '/expert/dashboard',              icon: LayoutDashboard, color: "#3b82f6" },
    { label: 'Mon profil',           href: '/expert/profil',                 icon: UserRound,       color: GREEN     },
    { label: 'Mes invitations',      href: '/expert/participations',         icon: Mail,            color: "#7e22ce" },
    { label: 'Dossiers affectés',    href: '/expert/dossiers',               icon: FolderOpen,      color: "#EF9F27" },
    { label: 'Éval. annexes',        href: '/expert/evaluations-annexes',    icon: ClipboardCheck,  color: "#0e7c5b" },
    { label: 'Mes rapports',         href: '/expert/rapports',               icon: FileText,        color: GREEN     },
    { label: 'Notifications',        href: '/expert/notifications',          icon: Bell,            color: "#e11d48" },
    { label: 'Mon calendrier',       href: '/expert/calendrier',             icon: CalendarDays,    color: "#ec4899" },
    { label: 'Historique',           href: '/expert/historique',             icon: History,         color: "#64748b" },
];

const getInitials = (name) => {
    if (!name) return "EX";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
};

export default function ExpertLayout({ children }) {
    const { auth } = usePage().props;
    const currentUrl = usePage().url;
    const user = auth?.user || {};

    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {
        const fetchCount = () => {
            axios.get('/api/notifications/count')
                .then(r => setNotifCount(r.data.count ?? 0))
                .catch(() => {});
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const isActive = (href) => {
        if (href === '/expert/dashboard') return currentUrl === href || currentUrl === '/expert/dashboard';
        return currentUrl.startsWith(href);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .expert-layout * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .expert-nav-link { transition: all 0.18s ease; }
                .expert-nav-link:hover { background: rgba(255,255,255,0.07) !important; }
                .expert-logout-btn { transition: all 0.18s ease; }
                .expert-logout-btn:hover { background: rgba(239,68,68,0.12) !important; color: #fca5a5 !important; }
                .expert-home-btn { transition: all 0.18s ease; }
                .expert-home-btn:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
                .expert-layout aside nav::-webkit-scrollbar { display: none; }
                .expert-layout aside nav { scrollbar-width: none; -ms-overflow-style: none; }
                @keyframes expertSlideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
                .expert-nav-link { animation: expertSlideIn 0.2s ease both; }
            `}</style>

            <div className="expert-layout" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f1f5f9" }}>

                {/* ── Sidebar ── */}
                <aside style={{
                    width: 240,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(180deg, #0c2d52 0%, #0C447C 50%, #063d2e 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Decorative blobs */}
                    <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 80, left: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(29,158,117,0.1)", pointerEvents: "none" }} />

                    {/* ── Brand ── */}
                    <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: `linear-gradient(135deg, ${GREEN}, #178a63)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 800, color: "#fff", fontSize: 16, letterSpacing: "-0.02em",
                                boxShadow: "0 4px 12px rgba(29,158,117,0.4)",
                                flexShrink: 0,
                            }}>
                                A
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>ANEAQ</p>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "2px 0 0", fontWeight: 500 }}>Espace Expert</p>
                            </div>
                        </div>

                        {/* User pill */}
                        <div style={{ marginTop: 16, position: "relative" }}>
                            <div
                                onClick={() => router.visit('/expert/profil')}
                                style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.18s" }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                                    e.currentTarget.querySelector('.expert-profile-tooltip').style.opacity = "1";
                                    e.currentTarget.querySelector('.expert-profile-tooltip').style.transform = "translateX(-50%) translateY(0)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                    e.currentTarget.querySelector('.expert-profile-tooltip').style.opacity = "0";
                                    e.currentTarget.querySelector('.expert-profile-tooltip').style.transform = "translateX(-50%) translateY(4px)";
                                }}
                            >
                                {/* Initials avatar */}
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                    background: `linear-gradient(135deg, ${GREEN}, #178a63)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.03em",
                                }}>
                                    {getInitials(user.name)}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {user.name || 'Expert'}
                                    </p>
                                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "1px 0 0" }}>Expert évaluateur</p>
                                </div>

                                {/* Green dot + arrow */}
                                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />
                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </div>

                                {/* Tooltip */}
                                <div
                                    className="expert-profile-tooltip"
                                    style={{
                                        position: "absolute", bottom: "110%", left: "50%",
                                        transform: "translateX(-50%) translateY(4px)",
                                        background: "#fff", color: GREEN, fontSize: 11, fontWeight: 700,
                                        padding: "6px 12px", borderRadius: 8, whiteSpace: "nowrap",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                        opacity: 0, transition: "all 0.18s ease", pointerEvents: "none",
                                        display: "flex", alignItems: "center", gap: 6,
                                    }}
                                >
                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    Mon profil
                                    <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #fff" }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Nav items ── */}
                    <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
                            Navigation
                        </p>

                        {navItems.map(({ label, href, icon: Icon, color }, i) => {
                            const active   = isActive(href);
                            const isNotif  = href === '/expert/notifications';
                            const showBadge = isNotif && notifCount > 0;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="expert-nav-link"
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 12px", borderRadius: 10,
                                        textDecoration: "none",
                                        background: active ? "rgba(255,255,255,0.12)" : "transparent",
                                        border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                                        animationDelay: `${i * 0.04}s`,
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    {active && (
                                        <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, borderRadius: "0 3px 3px 0", background: color }} />
                                    )}
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                        background: active ? `${color}25` : "rgba(255,255,255,0.07)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.18s",
                                        position: "relative",
                                    }}>
                                        <Icon size={15} color={active ? color : "rgba(255,255,255,0.6)"} />
                                        {showBadge && (
                                            <span style={{
                                                position: "absolute", top: -3, right: -3,
                                                minWidth: 16, height: 16, borderRadius: 99,
                                                background: "#e11d48", color: "#fff",
                                                fontSize: 9, fontWeight: 800,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                padding: "0 4px", border: "1.5px solid #0c2d52",
                                            }}>
                                                {notifCount > 99 ? "99+" : notifCount}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{
                                        fontSize: 13, fontWeight: active ? 600 : 500,
                                        color: active ? "#fff" : "rgba(255,255,255,0.65)",
                                        flex: 1,
                                    }}>
                                        {label}
                                    </span>
                                    {showBadge && !active && (
                                        <span style={{
                                            fontSize: 9, fontWeight: 800, padding: "2px 7px",
                                            borderRadius: 99, background: "#e11d4820", color: "#fca5a5",
                                        }}>
                                            {notifCount}
                                        </span>
                                    )}
                                    {active && <ChevronRight size={13} color="rgba(255,255,255,0.4)" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ── Bottom actions ── */}
                    <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 4 }}>

                        <button
                            className="expert-home-btn"
                            onClick={() => router.visit('/')}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                width: "100%", padding: "10px 12px", borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.08)",
                                background: "rgba(255,255,255,0.05)",
                                cursor: "pointer", color: "rgba(255,255,255,0.6)",
                            }}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Home size={15} color="rgba(255,255,255,0.6)" />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Accueil</span>
                        </button>

                        <button
                            className="expert-logout-btn"
                            onClick={() => router.post('/logout')}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                width: "100%", padding: "10px 12px", borderRadius: 10,
                                border: "1px solid rgba(239,68,68,0.15)",
                                background: "rgba(239,68,68,0.06)",
                                cursor: "pointer", color: "rgba(252,165,165,0.8)",
                            }}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <LogOut size={15} color="rgba(252,165,165,0.8)" />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Déconnexion</span>
                        </button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <main style={{ flex: 1, overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </>
    );
}
