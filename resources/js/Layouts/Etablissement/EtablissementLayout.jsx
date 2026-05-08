import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";

const NAV = [
    { key: "dashboard",     label: "Tableau de bord", icon: "grid",          route: "etablissement.dashboard" },
    { key: "profil",        label: "Mon profil",       icon: "building",      route: "etablissement.profil.show" },
    { key: "documents", label: "Rapport d'autoévaluation", icon: "file-text", route: "etablissement.documents.index" },
    { key: "annexes",       label: "Annexes",          icon: "clipboard-list",route: "etablissement.annexes" },
    { key: "complementaires",         label: "Documents complémentaires",icon: "paperclip",     route: "etablissement.documents.complementaires" },
    { key: "rapport-aneaq",           label: "Rapport ANEAQ",            icon: "award",         route: "etablissement.rapport.aneaq" },
    { key: "notifications", label: "Notifications",    icon: "bell",          route: "etablissement.notifications.index" },
    { key: "historique",    label: "Historique",       icon: "clock",         route: "etablissement.historique.index" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.el-wrap { display:flex; min-height:100vh; font-family:'Inter',sans-serif; }
.el-wrap * { box-sizing:border-box; }

/* ── Sidebar ── */
.el-aside {
  width:232px; flex-shrink:0;
  background:#0f1c2e;
  display:flex; flex-direction:column;
  position:sticky; top:0; height:100vh; overflow-y:auto;
  border-right:1px solid rgba(255,255,255,.05);
}

/* logo */
.el-logo {
  padding:20px 18px 16px;
  border-bottom:1px solid rgba(255,255,255,.06);
  display:flex; align-items:center; gap:10px;
}
.el-logo-mark {
  width:32px; height:32px; border-radius:8px;
  background:linear-gradient(135deg,#1e5cdc,#1094b5);
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; color:#fff; flex-shrink:0;
  letter-spacing:-.02em;
}
.el-logo-text { line-height:1; }
.el-logo-name  { font-size:13px; font-weight:700; color:#fff; letter-spacing:.02em; }
.el-logo-role  { font-size:9.5px; color:rgba(255,255,255,.35); margin-top:2px; text-transform:uppercase; letter-spacing:.08em; }

/* nav */
.el-nav { flex:1; padding:10px 10px; }
.el-nav-section { font-size:9px; font-weight:700; color:rgba(255,255,255,.2); text-transform:uppercase; letter-spacing:.1em; padding:10px 10px 4px; }

.el-nav-btn {
  width:100%; display:flex; align-items:center; gap:9px;
  padding:8px 10px; margin-bottom:1px; border-radius:8px;
  background:transparent; border:none; cursor:pointer;
  text-align:left; transition:background .12s;
  border-left:2px solid transparent;
}
.el-nav-btn:hover { background:rgba(255,255,255,.06); }
.el-nav-btn.active {
  background:rgba(30,92,220,.2);
  border-left-color:#1e5cdc;
}
.el-nav-btn .el-nav-icon {
  width:18px; height:18px; color:rgba(255,255,255,.4); flex-shrink:0;
  transition:color .12s;
}
.el-nav-btn.active .el-nav-icon { color:#60a5fa; }
.el-nav-btn:hover .el-nav-icon { color:rgba(255,255,255,.6); }
.el-nav-label {
  font-size:13px; font-weight:400; color:rgba(255,255,255,.5);
  transition:color .12s;
}
.el-nav-btn.active .el-nav-label { color:#fff; font-weight:500; }
.el-nav-btn:hover .el-nav-label { color:rgba(255,255,255,.8); }

/* footer */
.el-footer {
  padding:10px;
  border-top:1px solid rgba(255,255,255,.06);
  display:flex; flex-direction:column; gap:4px;
}
.el-footer-btn {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:7px 10px; border-radius:7px;
  background:transparent; border:none; cursor:pointer;
  text-align:left; transition:background .12s;
}
.el-footer-btn:hover { background:rgba(255,255,255,.06); }
.el-footer-btn span { font-size:12px; color:rgba(255,255,255,.45); font-family:'Inter',sans-serif; }
.el-footer-btn .el-f-icon { width:15px; height:15px; color:rgba(255,255,255,.3); flex-shrink:0; }
.el-logout span { color:rgba(248,113,113,.7); }
.el-logout .el-f-icon { color:rgba(248,113,113,.4); }
.el-logout:hover { background:rgba(239,68,68,.1); }

/* ── Main ── */
.el-main { flex:1; overflow:auto; background:#f4f6fb; min-width:0; }
`;

function Inject() {
    useEffect(() => {
        if (!document.getElementById("el-css")) {
            const s = document.createElement("style");
            s.id = "el-css"; s.textContent = CSS;
            document.head.appendChild(s);
        }
    }, []);
    return null;
}

// ── Inline SVG icons (Tabler-style outline) ────────────────────────────────
function Icon({ name, cls = "el-nav-icon" }) {
    const paths = {
        grid:           "M4 4h5v5H4V4zm7 0h5v5h-5V4zM4 11h5v5H4v-5zm7 0h5v5h-5v-5z",
        building:       "M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h2v4m4 0v-4h2v4M9 10h2v2H9v-2zm4 0h2v2h-2v-2z",
        "file-text":    "M14 3v4a1 1 0 001 1h4M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2zM9 9h1m-1 4h6m-6 4h6",
        "clipboard-list":"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h.01M9 12h.01M9 16h.01m3-4h3m-3 4h3",
        bell:           "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-5M15 17H9m6 0a3 3 0 11-6 0M3 3l18 18",
        clock:          "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        home:           "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6 11V12h6v8",
        logout:         "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
            paperclip:      "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
    award:          "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
    };
    const d = paths[name] || "";
    return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={d}/>
        </svg>
    );
}

export default function EtablissementLayout({ children, active }) {
    return (
        <>
            <Inject/>
            <div className="el-wrap">
                {/* ── Sidebar ── */}
                <aside className="el-aside">
                    {/* Logo */}
                    <div className="el-logo">
                        <div className="el-logo-mark">AN</div>
                        <div className="el-logo-text">
                            <div className="el-logo-name">ANEAQ</div>
                            <div className="el-logo-role">Espace établissement</div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="el-nav">
                        <div className="el-nav-section">Navigation</div>
                        {NAV.map(item => (
                            <button
                                key={item.key}
                                className={`el-nav-btn ${active === item.key ? "active" : ""}`}
                                onClick={() => router.visit(route(item.route))}
                            >
                                <Icon name={item.icon}/>
                                <span className="el-nav-label">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="el-footer">
                        <button className="el-footer-btn" onClick={() => router.visit(route("home"))}>
                            <Icon name="home" cls="el-f-icon"/>
                            <span>Accueil</span>
                        </button>
                        <button className="el-footer-btn el-logout" onClick={() => router.post(route("logout"))}>
                            <Icon name="logout" cls="el-f-icon"/>
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <main className="el-main">
                    {children}
                </main>
            </div>
        </>
    );
}