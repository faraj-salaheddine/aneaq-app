// resources/js/Pages/SI/Universites.jsx

import { useState } from "react";
import { Head } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const PURPLE = "#7e22ce";

const PALETTE = [
    { bg: "#EBF4FF", color: "#1d4ed8" },
    { bg: "#ECFDF5", color: "#065f46" },
    { bg: "#FFF7ED", color: "#9a3412" },
    { bg: "#FAF5FF", color: "#6b21a8" },
    { bg: "#FFF1F2", color: "#9f1239" },
    { bg: "#F0FDF4", color: "#14532d" },
    { bg: "#FEF9C3", color: "#854d0e" },
    { bg: "#F0F9FF", color: "#0369a1" },
];

const getColor = str => PALETTE[(str?.charCodeAt(0) || 0) % PALETTE.length];

const initials = name => name
    ? name.replace(/université|university|univ\./gi, "").trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

const formatUrl = url => url?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "";

export default function Universites({ universites = [] }) {
    const [search, setSearch] = useState("");

    const filtered = universites.filter(u =>
        (u.name    || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.website || "").toLowerCase().includes(search.toLowerCase())
    );

    const withWebsite    = universites.filter(u => u.website).length;
    const withoutWebsite = universites.length - withWebsite;

    return (
        <>
            <Head title="Universités — ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .univ-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .univ-row:hover { background: #f8fafc !important; }
                .univ-link:hover { text-decoration: underline !important; }
                .search-input:focus { border-color: ${PURPLE} !important; box-shadow: 0 0 0 3px rgba(126,34,206,0.08) !important; outline: none; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                .univ-row { animation: fadeUp 0.18s ease both; }
            `}</style>

            <div className="univ-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Système d'Information</span>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            <span style={{ fontSize: 12, color: PURPLE, fontWeight: 600 }}>Universités</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${PURPLE}, #6b21a8)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(126,34,206,0.3)` }}>
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                            </div>
                            <div>
                                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                    Universités
                                </h1>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                    <span style={{ color: PURPLE, fontWeight: 700 }}>{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""} · {universites.length} universités au total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats strip ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: "2rem" }}>
                    {[
                        { label: "Total universités", value: universites.length, color: PURPLE, icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
                        { label: "Avec site web",     value: withWebsite,        color: GREEN,  icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
                        { label: "Sans site web",     value: withoutWebsite,     color: "#94a3b8", icon: <><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></> },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main panel ── */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                    {/* Toolbar */}
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "center", background: "#fafbfc" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </span>
                            <input
                                className="search-input"
                                type="text" placeholder="Rechercher une université..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff", transition: "border-color 0.15s" }}
                            />
                        </div>

                        {search && (
                            <button onClick={() => setSearch("")}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Effacer
                            </button>
                        )}
                    </div>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr", padding: "10px 24px", background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                        {["Université", "Site web"].map(col => (
                            <span key={col} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase" }}>
                                {col}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    {filtered.map((univ, i) => {
                        const av = getColor(univ.name);
                        return (
                            <div
                                key={univ.id}
                                className="univ-row"
                                style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr", padding: "14px 24px", borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center", transition: "background 0.1s", animationDelay: `${Math.min(i * 0.03, 0.4)}s` }}
                            >
                                {/* Name + avatar */}
                                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: av.bg, color: av.color, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${av.color}20`, letterSpacing: "0.02em" }}>
                                        {initials(univ.name)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
                                            {univ.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontWeight: 500 }}>
                                            ID #{univ.id}
                                        </div>
                                    </div>
                                </div>

                                {/* Website */}
                                {univ.website ? (
                                    <a
                                        href={univ.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="univ-link"
                                        style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: PURPLE, textDecoration: "none", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}
                                    >
                                        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${PURPLE}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="2" y1="12" x2="22" y2="12"/>
                                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                            </svg>
                                        </div>
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {formatUrl(univ.website)}
                                        </span>
                                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}>
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                        </svg>
                                    </a>
                                ) : (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
                                                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
                                            </svg>
                                        </div>
                                        Non disponible
                                    </span>
                                )}
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                            <div style={{ width: 70, height: 70, borderRadius: 18, background: `linear-gradient(135deg, ${PURPLE}12, ${BLUE}10)`, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${PURPLE}20` }}>
                                <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Aucune université trouvée</p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 1.5rem" }}>Essayez un autre terme de recherche</p>
                            <button onClick={() => setSearch("")}
                                style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: PURPLE, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 12px rgba(126,34,206,0.3)` }}
                            >
                                Réinitialiser
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                Affichage de <strong style={{ color: "#374151" }}>{filtered.length}</strong> sur <strong style={{ color: "#374151" }}>{universites.length}</strong> universités
                            </span>
                            <div style={{ display: "flex", gap: 12 }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: GREEN }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                                    {filtered.filter(u => u.website).length} avec site
                                </span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }} />
                                    {filtered.filter(u => !u.website).length} sans site
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Universites.layout = page => <DashboardLayout>{page}</DashboardLayout>;