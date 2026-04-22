// resources/js/Layouts/SI/DashboardLayout.jsx
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Star,
    Building2,
    GraduationCap,
    LogOut,
    Home,
    ChevronRight,
} from 'lucide-react';

const BLUE  = "#0C447C";
const GREEN = "#1D9E75";

const navItems = [
    { label: "Vue d'ensemble", href: '/si/dashboard',       icon: LayoutDashboard, color: "#3b82f6" },
    { label: 'Utilisateurs DEE', href: '/si/utilisateurs-dee', icon: Users,          color: "#7e22ce" },
    { label: 'Experts',          href: '/si/experts',          icon: Star,           color: GREEN     },
    { label: 'Établissements',   href: '/si/etablissements',   icon: Building2,      color: "#ef9f27" },
    { label: 'Universités',      href: '/si/universites',      icon: GraduationCap,  color: "#e11d48" },
];

export default function DashboardLayout({ children }) {
    const { url } = usePage();

    const handleLogout = () => router.post('/logout');
    const handleHome = () => router.visit('/');
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .si-layout * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .nav-link { transition: all 0.18s ease; }
                .nav-link:hover { background: rgba(255,255,255,0.07) !important; }
                .logout-btn { transition: all 0.18s ease; }
                .logout-btn:hover { background: rgba(239,68,68,0.12) !important; color: #fca5a5 !important; }
                .home-btn { transition: all 0.18s ease; }
                .home-btn:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
                .nav-link { animation: slideIn 0.2s ease both; }
            `}</style>

            <div className="si-layout" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f1f5f9" }}>

                {/* ── Sidebar ── */}
                <aside style={{
                    width: 240,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    background: `linear-gradient(180deg, #0a2d5e 0%, ${BLUE} 50%, #0a3d2e 100%)`,
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Decorative blobs */}
                    <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 80, left: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(29,158,117,0.08)", pointerEvents: "none" }} />

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
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "2px 0 0", fontWeight: 500 }}>Système d'Information</p>
                            </div>
                        </div>

                        {/* User pill */}
                        <div style={{ marginTop: 16, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0 }}>Administrateur SI</p>
                                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "1px 0 0" }}>Accès complet</p>
                            </div>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
                        </div>
                    </div>

                    {/* ── Nav items ── */}
                    <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
                            Navigation
                        </p>

                        {navItems.map(({ label, href, icon: Icon, color }, i) => {
                            const isActive = url.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="nav-link"
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 12px", borderRadius: 10,
                                        textDecoration: "none",
                                        background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                                        border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                                        animationDelay: `${i * 0.05}s`,
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* Active left bar */}
                                    {isActive && (
                                        <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, borderRadius: "0 3px 3px 0", background: color }} />
                                    )}

                                    {/* Icon container */}
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                        background: isActive ? `${color}25` : "rgba(255,255,255,0.07)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.18s",
                                    }}>
                                        <Icon size={15} color={isActive ? color : "rgba(255,255,255,0.6)"} />
                                    </div>

                                    <span style={{
                                        fontSize: 13, fontWeight: isActive ? 600 : 500,
                                        color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                                        flex: 1,
                                    }}>
                                        {label}
                                    </span>

                                    {isActive && (
                                        <ChevronRight size={13} color="rgba(255,255,255,0.4)" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ── Bottom actions ── */}
                    <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 4 }}>

                        {/* Home button */}
                        <button
                            className="home-btn"
                            onClick={handleHome}
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

                        {/* Logout button */}
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
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