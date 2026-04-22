// resources/js/Pages/SI/Etablissements.jsx

import { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";

const CITY_COLORS = [
    { bg: "#EBF4FF", color: "#1d4ed8" },
    { bg: "#ECFDF5", color: "#065f46" },
    { bg: "#FFF7ED", color: "#9a3412" },
    { bg: "#FAF5FF", color: "#6b21a8" },
    { bg: "#FFF1F2", color: "#9f1239" },
    { bg: "#F0FDF4", color: "#14532d" },
    { bg: "#FEF9C3", color: "#854d0e" },
    { bg: "#F0F9FF", color: "#0369a1" },
];

const getCityColor = str => CITY_COLORS[(str?.charCodeAt(0) || 0) % CITY_COLORS.length];

const initials = str => str
    ? str.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

export default function Etablissements({ etablissements = [] }) {
    const [search, setSearch]       = useState("");
    const [villeFilter, setVille]   = useState("");
    const [univFilter, setUniv]     = useState("");

    // Build unique filter options from data
    const villes = useMemo(() =>
        [...new Set(etablissements.map(e => e.ville).filter(Boolean))].sort(),
        [etablissements]
    );

    const universites = useMemo(() =>
        [...new Set(etablissements.map(e => e.universite).filter(Boolean))].sort(),
        [etablissements]
    );

    const filtered = etablissements.filter(e => {
        const s = search.toLowerCase();
        const matchSearch = !s ||
            (e.etablissement || "").toLowerCase().includes(s) ||
            (e.universite    || "").toLowerCase().includes(s) ||
            (e.ville         || "").toLowerCase().includes(s);
        const matchVille = !villeFilter || e.ville === villeFilter;
        const matchUniv  = !univFilter  || e.universite === univFilter;
        return matchSearch && matchVille && matchUniv;
    });

    const resetAll = () => { setSearch(""); setVille(""); setUniv(""); };
    const activeFilters = [search, villeFilter, univFilter].filter(Boolean).length;

    // Group by university for summary
    const byUniv = useMemo(() => {
        const map = {};
        filtered.forEach(e => {
            const u = e.universite || "Autre";
            map[u] = (map[u] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
    }, [filtered]);

    return (
        <>
            <Head title="Établissements — ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .etab-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .etab-row:hover { background: #f8fafc !important; }
                .filter-input:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,0.08) !important; outline: none; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                .etab-row { animation: fadeUp 0.18s ease both; }
            `}</style>

            <div className="etab-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

{/* ── Header ── */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
    <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Système d'Information</span>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>Établissements</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${ORANGE}, #d4880f)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(239,159,39,0.3)` }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 22V12h6v10"/>
                    <path d="M9 7h1"/><path d="M14 7h1"/>
                    <path d="M9 11h1"/><path d="M14 11h1"/>
                </svg>
            </div>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                    Établissements
                </h1>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                    <span style={{ color: ORANGE, fontWeight: 700 }}>{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""} · {etablissements.length} établissements au total
                </p>
            </div>
        </div>
    </div>

    <button
    onClick={() => router.visit("/si/etablissements/create")}
    style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 24px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${ORANGE}, #d4880f)`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 14px rgba(239,159,39,0.35)`, transition: "all 0.2s", whiteSpace: "nowrap" }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 20px rgba(239,159,39,0.4)`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 14px rgba(239,159,39,0.35)`; }}
>
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    Ajouter un établissement
</button>
</div>

                {/* ── Stats + Top universities ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) 2fr", gap: 12, marginBottom: "2rem" }}>
                    {[
                        { label: "Total",       value: etablissements.length, color: ORANGE, icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></> },
                        { label: "Villes",      value: villes.length,         color: BLUE,   icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
                        { label: "Universités", value: universites.length,    color: GREEN,  icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
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

                    {/* Top universities mini chart */}
                    <div style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 12, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>
                            Top universités
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {byUniv.map(([univ, count]) => (
                                <div key={univ} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ flex: 1, height: 5, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                                        <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`, width: `${Math.round((count / filtered.length) * 100)}%`, transition: "width 0.4s ease" }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {univ.length > 20 ? univ.slice(0, 20) + "…" : univ}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, minWidth: 20, textAlign: "right" }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Main panel ── */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                    {/* Toolbar */}
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: "#fafbfc" }}>

                        {/* Search */}
                        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </span>
                            <input
                                className="filter-input"
                                type="text" placeholder="Rechercher un établissement..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff", transition: "border-color 0.15s" }}
                            />
                        </div>

                        {/* Ville filter */}
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
                            </span>
                            <select
                                className="filter-input"
                                value={villeFilter} onChange={e => setVille(e.target.value)}
                                style={{ paddingLeft: 30, paddingRight: 28, paddingTop: 9, paddingBottom: 9, border: villeFilter ? `1.5px solid ${BLUE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: villeFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", appearance: "none", minWidth: 150, transition: "border-color 0.15s" }}
                            >
                                <option value="">Toutes les villes</option>
                                {villes.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </div>

                        {/* Université filter */}
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                            </span>
                            <select
                                className="filter-input"
                                value={univFilter} onChange={e => setUniv(e.target.value)}
                                style={{ paddingLeft: 30, paddingRight: 28, paddingTop: 9, paddingBottom: 9, border: univFilter ? `1.5px solid ${GREEN}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: univFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", appearance: "none", minWidth: 200, transition: "border-color 0.15s" }}
                            >
                                <option value="">Toutes les universités</option>
                                {universites.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </div>

                        {/* Reset */}
                        {activeFilters > 0 && (
                            <button onClick={resetAll}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Effacer ({activeFilters})
                            </button>
                        )}
                    </div>

                    {/* Active filter chips */}
                    {(villeFilter || univFilter) && (
                        <div style={{ padding: "10px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {villeFilter && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, background: `${BLUE}10`, color: BLUE, fontSize: 12, fontWeight: 600 }}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {villeFilter}
                                    <button onClick={() => setVille("")} style={{ background: "none", border: "none", cursor: "pointer", color: BLUE, padding: 0, display: "flex" }}>
                                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </span>
                            )}
                            {univFilter && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, background: `${GREEN}10`, color: GREEN, fontSize: 12, fontWeight: 600 }}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                    {univFilter.length > 40 ? univFilter.slice(0, 40) + "…" : univFilter}
                                    <button onClick={() => setUniv("")} style={{ background: "none", border: "none", cursor: "pointer", color: GREEN, padding: 0, display: "flex" }}>
                                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", padding: "10px 24px", background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                        {["Établissement", "Université", "Ville"].map(col => (
                            <span key={col} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase" }}>
                                {col}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    {filtered.map((etab, i) => {
                        const cityColor = getCityColor(etab.ville);
                        return (
                            <div
                                key={etab.id}
                                className="etab-row"
                                style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", padding: "14px 24px", borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center", transition: "background 0.1s", animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
                            >
                                {/* Etablissement */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${ORANGE}15`, color: ORANGE, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${ORANGE}25`, letterSpacing: "0.02em" }}>
                                        {initials(etab.etablissement)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {etab.etablissement}
                                        </div>
                                    </div>
                                </div>

                                {/* Université */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" style={{ flexShrink: 0 }}>
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                    </svg>
                                    <span style={{ fontSize: 13, color: "#475569", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {etab.universite || "—"}
                                    </span>
                                </div>

                                {/* Ville badge */}
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: cityColor.bg, color: cityColor.color, width: "fit-content" }}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    {etab.ville || "—"}
                                </span>
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                            <div style={{ width: 70, height: 70, borderRadius: 18, background: `linear-gradient(135deg, ${ORANGE}12, ${BLUE}10)`, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${ORANGE}20` }}>
                                <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/>
                                </svg>
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Aucun établissement trouvé</p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 1.5rem" }}>
                                Essayez d'autres critères de recherche
                            </p>
                            <button onClick={resetAll}
                                style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 12px rgba(239,159,39,0.3)` }}
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                Affichage de <strong style={{ color: "#374151" }}>{filtered.length}</strong> sur <strong style={{ color: "#374151" }}>{etablissements.length}</strong> établissements
                            </span>
                            {villeFilter && (
                                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {filtered.length} établissement{filtered.length > 1 ? "s" : ""} à {villeFilter}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Etablissements.layout = page => <DashboardLayout>{page}</DashboardLayout>;