import { router } from "@inertiajs/react";

const BLUE = "#0C447C", GREEN = "#1D9E75";

const NAV = [
    { key: "dashboard", label: "Tableau de bord", icon: "📊", route: "etablissement.dashboard" },
    { key: "profil",    label: "Mon profil",       icon: "🏛️", route: "etablissement.profil.show" },
    { key: "documents", label: "Documents",        icon: "📄", route: "etablissement.documents.index" },
];

export default function EtablissementLayout({ children, active }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

            {/* Sidebar */}
            <aside style={{ width: 220, background: BLUE, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
                {/* Logo */}
                <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>ANEAQ</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.1em" }}>Espace Établissement</div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "12px 10px" }}>
                    {NAV.map(item => {
                        const on = active === item.key;
                        return (
                            <button key={item.key}
                                onClick={() => router.visit(route(item.route))}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                                    padding: "10px 12px", marginBottom: 2, borderRadius: 10,
                                    background: on ? "rgba(255,255,255,0.15)" : "transparent",
                                    border: "none", cursor: "pointer",
                                    borderLeft: on ? `3px solid ${GREEN}` : "3px solid transparent",
                                }}>
                                <span style={{ fontSize: 17 }}>{item.icon}</span>
                                <span style={{ color: on ? "#fff" : "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: on ? 600 : 400 }}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 6 }}>
                    <button onClick={() => router.visit(route("home"))}
                        style={{ padding: "9px 12px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                        🏠 Accueil
                    </button>
                    <button onClick={() => router.post(route("logout"))}
                        style={{ padding: "9px 12px", background: "rgba(239,68,68,0.15)", border: "none", borderRadius: 8, color: "#fca5a5", cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                        ↩ Déconnexion
                    </button>
                </div>
            </aside>

            {/* Content */}
            <main style={{ flex: 1, overflow: "auto", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                {children}
            </main>
        </div>
    );
}
