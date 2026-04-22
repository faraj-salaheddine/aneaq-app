// resources/js/Pages/SI/Experts/Index.jsx

import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const YELLOW = "#EFC728";

const TYPE_OPTIONS = [
    "Etablissement public",
    "Etablissements publics ne relevant pas des universités",
    "Etablissement universitaire Privé",
    "Etablissements privés ne relevant pas des universités",
];

const TYPE_META = {
    "Etablissement public":                                   { short: "Pub.",         bg: "#EBF4FF", color: "#1d4ed8", dot: "#3b82f6" },
    "Etablissements publics ne relevant pas des universités": { short: "Pub. hors U",  bg: "#ECFDF5", color: "#065f46", dot: "#10b981" },
    "Etablissement universitaire Privé":                      { short: "Privé U.",     bg: "#FAF5FF", color: "#6b21a8", dot: "#a855f7" },
    "Etablissements privés ne relevant pas des universités":  { short: "Privé hors U", bg: "#FFF7ED", color: "#9a3412", dot: "#f97316" },
};

const ALL_COLUMNS = [
    { key: "nom",                label: "Expert",             default: true,  fixed: true  },
    { key: "email",              label: "Email",              default: true,  fixed: false },
    { key: "specialite",         label: "Spécialité",         default: true,  fixed: false },
    { key: "ville",              label: "Ville",              default: true,  fixed: false },
    { key: "telephone",          label: "Téléphone",          default: false, fixed: false },
    { key: "type_etablissement", label: "Type établissement", default: true,  fixed: false },
    { key: "fonction_actuelle",  label: "Fonction",           default: false, fixed: false },
    { key: "grade",              label: "Grade",              default: false, fixed: false },
    { key: "pays",               label: "Pays",               default: false, fixed: false },
];

const PALETTE = [
    { bg: "#EBF4FF", color: "#1d4ed8" },
    { bg: "#ECFDF5", color: "#065f46" },
    { bg: "#FFF7ED", color: "#9a3412" },
    { bg: "#FAF5FF", color: "#6b21a8" },
    { bg: "#FFF1F2", color: "#9f1239" },
    { bg: "#F0FDF4", color: "#14532d" },
];

const getColor  = str => PALETTE[(str?.charCodeAt(0) || 0) % PALETTE.length];
const initials  = (nom, prenom) => `${nom?.[0] || ""}${prenom?.[0] || ""}`.toUpperCase();

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Index({ experts = [] }) {
    const [search, setSearch]           = useState("");
    const [showColMenu, setShowColMenu] = useState(false);
    const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.filter(c => c.default).map(c => c.key));
    const [filters, setFilters]         = useState({ nom: "", prenom: "", email: "", telephone: "", type_etablissement: "" });
    const [page, setPage]               = useState(1);
    const [pageSize, setPageSize]       = useState(25);

    const setFilter  = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
    const toggleCol  = key    => setVisibleCols(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
    const activeCols = ALL_COLUMNS.filter(c => visibleCols.includes(c.key));
    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    const filtered = experts.filter(e => {
        const s = search.toLowerCase();
        const ms = !s || [e.nom, e.prenom, e.email, e.specialite, e.ville].some(v => (v || "").toLowerCase().includes(s));
        return ms &&
            (e.nom       || "").toLowerCase().includes(filters.nom.toLowerCase()) &&
            (e.prenom    || "").toLowerCase().includes(filters.prenom.toLowerCase()) &&
            (e.email     || "").toLowerCase().includes(filters.email.toLowerCase()) &&
            (e.telephone || "").toLowerCase().includes(filters.telephone.toLowerCase()) &&
            (!filters.type_etablissement || e.type_etablissement === filters.type_etablissement);
    });

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

    const handleDelete = expert => {
        if (!confirm(`Supprimer ${expert.nom} ${expert.prenom} ?`)) return;
        router.delete(`/si/experts/${expert.id}`);
    };

    const resetAll = () => {
        setFilters({ nom: "", prenom: "", email: "", telephone: "", type_etablissement: "" });
        setSearch("");
        setPage(1);
    };

    const extraCols = activeCols.filter(c => c.key !== "nom");
    const gridCols  = `260px ${extraCols.map(() => "1fr").join(" ")} 200px`;

    return (
        <>
            <Head title="Experts — ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .experts-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .row-hover:hover { background: #f8fafc !important; }
                .btn-edit:hover  { background: #EBF4FF !important; border-color: ${BLUE} !important; color: ${BLUE} !important; }
                .btn-del:hover   { background: #FFF1F2 !important; border-color: #fca5a5 !important; }
                .add-btn:hover   { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(29,158,117,0.4) !important; }
                .excel-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(34,197,94,0.3) !important; }
                .filter-input:focus { border-color: ${GREEN} !important; outline: none; box-shadow: 0 0 0 3px rgba(29,158,117,0.1); }
                .col-check:hover { background: #f8fafc; }
                .page-btn:hover  { background: #f1f5f9 !important; }
                .page-btn-active { background: ${BLUE} !important; color: #fff !important; border-color: ${BLUE} !important; }
                @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
                .col-menu { animation: fadeIn 0.15s ease; }
            `}</style>

            <div className="experts-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Hero Header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Système d'Information</span>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Experts</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${GREEN}, #178a63)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(29,158,117,0.3)` }}>
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            </div>
                            <div>
                                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Experts</h1>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                    <span style={{ color: GREEN, fontWeight: 700 }}>{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""} · {experts.length} experts au total
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {/* Excel export button */}
                        <a
                            href="/si/experts/export"
                            className="excel-btn"
                            style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 20px", borderRadius: 12, border: "1px solid #22c55e30", background: "#f0fdf4", color: "#16a34a", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(34,197,94,0.1)" }}
                        >
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Exporter Excel
                        </a>

                        {/* Add expert button */}
                        <button
                            className="add-btn"
                            onClick={() => router.visit("/si/experts/create")}
                            style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 24px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${GREEN}, #178a63)`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 14px rgba(29,158,117,0.35)`, transition: "all 0.2s" }}
                        >
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Ajouter un expert
                        </button>
                    </div>
                </div>

                {/* ── Stats strip ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "2rem" }}>
                    {[
                        { label: "Total experts",    value: experts.length,                                                          color: BLUE,      icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
                        { label: "Publics",          value: experts.filter(e => e.type_etablissement?.includes("public")).length,    color: "#1d4ed8",  icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></> },
                        { label: "Privés",           value: experts.filter(e => e.type_etablissement?.includes("riv")).length,       color: "#7e22ce",  icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
                        { label: "Résultats filtrés", value: filtered.length,                                                        color: GREEN,      icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">{s.icon}</svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main panel ── */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                    {/* Toolbar */}
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#fafbfc" }}>
                        <div style={{ position: "relative", minWidth: 220, flex: 1 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </span>
                            <input className="filter-input" type="text" placeholder="Recherche globale..." value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff", transition: "border-color 0.15s, box-shadow 0.15s" }}
                            />
                        </div>

                        {[
                            { key: "nom",       ph: "Nom..." },
                            { key: "prenom",    ph: "Prénom..." },
                            { key: "email",     ph: "Email..." },
                            { key: "telephone", ph: "Tél..." },
                        ].map(f => (
                            <input key={f.key} className="filter-input" type="text" placeholder={f.ph} value={filters[f.key]} onChange={e => setFilter(f.key, e.target.value)}
                                style={{ padding: "8px 12px", border: filters[f.key] ? `1.5px solid ${GREEN}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff", width: 110, transition: "border-color 0.15s, box-shadow 0.15s" }}
                            />
                        ))}

                        <select value={filters.type_etablissement} onChange={e => setFilter("type_etablissement", e.target.value)}
                            style={{ padding: "8px 12px", border: filters.type_etablissement ? `1.5px solid ${GREEN}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: filters.type_etablissement ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", maxWidth: 180, outline: "none" }}
                        >
                            <option value="">Tous les types...</option>
                            {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>

                        {(activeFiltersCount > 0 || search) && (
                            <button onClick={resetAll}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
                            >
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Effacer ({activeFiltersCount + (search ? 1 : 0)})
                            </button>
                        )}

                        {/* Column picker */}
                        <div style={{ position: "relative", marginLeft: "auto" }}>
                            <button onClick={() => setShowColMenu(s => !s)}
                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, border: `1px solid ${showColMenu ? BLUE : "#e2e8f0"}`, background: showColMenu ? BLUE : "#fff", color: showColMenu ? "#fff" : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                            >
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                                </svg>
                                Colonnes
                                <span style={{ background: showColMenu ? "rgba(255,255,255,0.25)" : `${GREEN}18`, color: showColMenu ? "#fff" : GREEN, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 7px", minWidth: 22, textAlign: "center" }}>
                                    {visibleCols.length}
                                </span>
                            </button>

                            {showColMenu && (
                                <div className="col-menu" style={{ position: "fixed", right: 24, top: 160, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,0.12)", zIndex: 999, width: 240, maxHeight: "60vh", overflowY: "auto" }}>
                                    <div style={{ padding: "12px 16px", background: `linear-gradient(135deg, ${BLUE}08, ${GREEN}08)`, borderBottom: "1px solid #f1f5f9" }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Colonnes visibles</p>
                                    </div>
                                    <div style={{ padding: "6px" }}>
                                        {ALL_COLUMNS.map(col => (
                                            <label key={col.key} className="col-check"
                                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: col.fixed ? "not-allowed" : "pointer", opacity: col.fixed ? 0.4 : 1, transition: "background 0.1s" }}
                                            >
                                                <input type="checkbox" checked={visibleCols.includes(col.key)} disabled={col.fixed} onChange={() => !col.fixed && toggleCol(col.key)}
                                                    style={{ accentColor: GREEN, width: 15, height: 15 }}
                                                />
                                                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, flex: 1 }}>{col.label}</span>
                                                {col.fixed && <span style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 700, letterSpacing: "0.05em" }}>FIXE</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scrollable table */}
                    <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: `${260 + activeCols.filter(c => c.key !== "nom").length * 160 + 200}px` }}>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: gridCols, padding: "10px 24px", background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                        {activeCols.map(col => (
                            <span key={col.key} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase" }}>
                                {col.label}
                            </span>
                        ))}
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", textAlign: "right" }}>Actions</span>
                    </div>

                    {/* Rows */}
                    {paginated.map((expert, i) => {
                        const av   = getColor(expert.nom);
                        const type = TYPE_META[expert.type_etablissement];
                        return (
                            <div key={expert.id} className="row-hover"
                                style={{ display: "grid", gridTemplateColumns: gridCols, padding: "13px 24px", borderBottom: i < paginated.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center", transition: "background 0.1s" }}
                            >
                                {activeCols.map(col => {
                                    if (col.key === "nom") return (
                                        <div key="nom" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 38, height: 38, borderRadius: 11, background: av.bg, color: av.color, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${av.color}20`, letterSpacing: "0.02em" }}>
                                                {initials(expert.nom, expert.prenom)}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {expert.nom} <span style={{ fontWeight: 500, color: "#64748b" }}>{expert.prenom}</span>
                                                </div>
                                                {expert.grade && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{expert.grade}</div>}
                                            </div>
                                        </div>
                                    );
                                    if (col.key === "email") return (
                                        <a key="email" href={`mailto:${expert.email}`}
                                            style={{ fontSize: 12, color: BLUE, textDecoration: "none", fontWeight: 500, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                                            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                                        >{expert.email || "—"}</a>
                                    );
                                    if (col.key === "specialite") return (
                                        <span key="specialite" style={{ fontSize: 12, color: "#475569", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {expert.specialite || "—"}
                                        </span>
                                    );
                                    if (col.key === "ville") return (
                                        <span key="ville" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                            {expert.ville || "—"}
                                        </span>
                                    );
                                    if (col.key === "telephone") return (
                                        <span key="telephone" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            {expert.telephone || "—"}
                                        </span>
                                    );
                                    if (col.key === "type_etablissement") return (
                                        <div key="type_etablissement">
                                            {type ? (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, background: type.bg, color: type.color, whiteSpace: "nowrap" }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: type.dot, flexShrink: 0 }} />
                                                    {type.short}
                                                </span>
                                            ) : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>}
                                        </div>
                                    );
                                    return <span key={col.key} style={{ fontSize: 12, color: "#64748b" }}>{expert[col.key] || "—"}</span>;
                                })}

                                {/* Actions */}
                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                    <button onClick={() => router.visit(`/si/experts/${expert.id}`)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, border: `1px solid ${GREEN}25`, background: `${GREEN}08`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: GREEN, transition: "all 0.15s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = GREEN; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = `${GREEN}08`; e.currentTarget.style.color = GREEN; e.currentTarget.style.borderColor = `${GREEN}25`; }}
                                    >
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        Voir
                                    </button>
                                    <button className="btn-edit" onClick={() => router.visit(`/si/experts/${expert.id}/edit`)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#475569", transition: "all 0.15s" }}
                                    >
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        Modifier
                                    </button>
                                    <button className="btn-del" onClick={() => handleDelete(expert)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#ef4444", transition: "all 0.15s" }}
                                    >
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                    </div>

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                            <div style={{ width: 70, height: 70, borderRadius: 18, background: `linear-gradient(135deg, ${GREEN}12, ${BLUE}10)`, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${GREEN}20` }}>
                                <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Aucun expert trouvé</p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 1.5rem" }}>
                                {search || activeFiltersCount > 0 ? "Essayez d'autres critères de recherche" : "Commencez par ajouter un expert"}
                            </p>
                            {(search || activeFiltersCount > 0) && (
                                <button onClick={resetAll} style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: GREEN, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Footer / Pagination ── */}
                    {filtered.length > 0 && (
                        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>

                            {/* Left — count + page size */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                    Affichage de <strong style={{ color: "#374151" }}>{(page - 1) * pageSize + 1}</strong>–<strong style={{ color: "#374151" }}>{Math.min(page * pageSize, filtered.length)}</strong> sur <strong style={{ color: "#374151" }}>{filtered.length}</strong> experts
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 12, color: "#94a3b8" }}>Par page:</span>
                                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                        style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#374151", background: "#fff", cursor: "pointer", outline: "none" }}
                                    >
                                        {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Right — pagination controls */}
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                {/* Previous */}
                                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, color: page === 1 ? "#cbd5e1" : "#475569", transition: "all 0.15s" }}
                                >
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                                    Précédent
                                </button>

                                {/* Page numbers */}
                                <div style={{ display: "flex", gap: 3 }}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                        .reduce((acc, p, idx, arr) => {
                                            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((p, idx) => p === "..." ? (
                                            <span key={`dots-${idx}`} style={{ padding: "6px 4px", fontSize: 12, color: "#94a3b8" }}>…</span>
                                        ) : (
                                            <button key={p} className={`page-btn ${page === p ? "page-btn-active" : ""}`}
                                                onClick={() => setPage(p)}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: page === p ? BLUE : "#fff", color: page === p ? "#fff" : "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                            >
                                                {p}
                                            </button>
                                        ))
                                    }
                                </div>

                                {/* Next */}
                                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, color: page === totalPages ? "#cbd5e1" : "#475569", transition: "all 0.15s" }}
                                >
                                    Suivant
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showColMenu && <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setShowColMenu(false)} />}
        </>
    );
}

Index.layout = page => <DashboardLayout>{page}</DashboardLayout>;