// resources/js/Pages/SI/Historique.jsx

import { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#ef4444";
const PURPLE = "#7e22ce";

const ACTION_META = {
    "Compte créé":    { color: GREEN,  bg: `${GREEN}12`,  icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></> },
    "Compte modifié": { color: BLUE,   bg: `${BLUE}12`,   icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></> },
    "Compte supprimé":{ color: RED,    bg: `${RED}12`,    icon: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></> },
};

const ROLE_META = {
    si:        { label: "SI",          color: BLUE,   bg: `${BLUE}12`   },
    expert:    { label: "Expert",      color: GREEN,  bg: `${GREEN}12`  },
    dee:       { label: "DEE",         color: PURPLE, bg: `${PURPLE}12` },
    chef_dee:  { label: "Chef DEE",    color: ORANGE, bg: `${ORANGE}12` },
};

const MODEL_META = {
    Expert:        { label: "Expert",         color: GREEN  },
    UtilisateurDEE:{ label: "Utilisateur DEE",color: PURPLE },
    User:          { label: "Utilisateur",    color: BLUE   },
};

export default function Historique({ logs = [] }) {
    const [search, setSearch]       = useState("");
    const [actionFilter, setAction] = useState("");
    const [roleFilter, setRole]     = useState("");
    const [modelFilter, setModel]   = useState("");
    const [dateFrom, setDateFrom]   = useState("");
    const [dateTo, setDateTo]       = useState("");
    const [page, setPage]           = useState(1);
    const pageSize = 20;

    const actions = [...new Set(logs.map(l => l.action).filter(Boolean))];
    const roles   = [...new Set(logs.map(l => l.role).filter(Boolean))];
    const models  = [...new Set(logs.map(l => l.model_type).filter(Boolean))];

    const filtered = useMemo(() => logs.filter(l => {
        const s = search.toLowerCase();
        const matchSearch = !s || [l.model_name, l.performed_by, l.details, l.action].some(v => (v || "").toLowerCase().includes(s));
        const matchAction = !actionFilter || l.action === actionFilter;
        const matchRole   = !roleFilter   || l.role === roleFilter;
        const matchModel  = !modelFilter  || l.model_type === modelFilter;
        const matchFrom   = !dateFrom     || l.created_at >= dateFrom;
        const matchTo     = !dateTo       || l.created_at <= dateTo + " 23:59";
        return matchSearch && matchAction && matchRole && matchModel && matchFrom && matchTo;
    }), [logs, search, actionFilter, roleFilter, modelFilter, dateFrom, dateTo]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

    const resetAll = () => { setSearch(""); setAction(""); setRole(""); setModel(""); setDateFrom(""); setDateTo(""); setPage(1); };
    const activeFilters = [search, actionFilter, roleFilter, modelFilter, dateFrom, dateTo].filter(Boolean).length;

    return (
        <>
            <Head title="Historique — ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .hist-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .filter-input:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,0.08) !important; outline: none; }
                .log-row:hover { background: #f8fafc !important; }
                .page-btn:hover { background: #f1f5f9 !important; }
            `}</style>

            <div className="hist-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Système d'Information</span>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Historique</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #475569, #334155)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(71,85,105,0.3)" }}>
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div>
                                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Historique des activités</h1>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                    <span style={{ color: "#475569", fontWeight: 700 }}>{filtered.length}</span> entrée{filtered.length !== 1 ? "s" : ""} · {logs.length} au total
                                </p>
                            </div>
                        </div>

                        {/* Stats pills */}
                        <div style={{ display: "flex", gap: 8 }}>
                            {[
                                { label: "Créations",    value: logs.filter(l => l.action === "Compte créé").length,     color: GREEN  },
                                { label: "Modifications",value: logs.filter(l => l.action === "Compte modifié").length,  color: BLUE   },
                                { label: "Suppressions", value: logs.filter(l => l.action === "Compte supprimé").length, color: RED    },
                            ].map((s, i) => (
                                <div key={i} style={{ padding: "8px 16px", borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{s.value}</span>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Main panel ── */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                    {/* Toolbar */}
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#fafbfc" }}>

                        {/* Search */}
                        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </span>
                            <input className="filter-input" type="text" placeholder="Rechercher..."
                                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff" }}
                            />
                        </div>

                        {/* Action filter */}
                        <select className="filter-input" value={actionFilter} onChange={e => { setAction(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: actionFilter ? `1.5px solid ${BLUE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: actionFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}
                        >
                            <option value="">Toutes les actions</option>
                            {actions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>

                        {/* Role filter */}
                        <select className="filter-input" value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: roleFilter ? `1.5px solid ${PURPLE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: roleFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}
                        >
                            <option value="">Tous les rôles</option>
                            {roles.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
                        </select>

                        {/* Model filter */}
                        <select className="filter-input" value={modelFilter} onChange={e => { setModel(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: modelFilter ? `1.5px solid ${GREEN}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: modelFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}
                        >
                            <option value="">Tous les types</option>
                            {models.map(m => <option key={m} value={m}>{MODEL_META[m]?.label || m}</option>)}
                        </select>

                        {/* Date from */}
                        <input className="filter-input" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: dateFrom ? `1.5px solid ${ORANGE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: dateFrom ? "#0f172a" : "#94a3b8", background: "#fff", outline: "none", cursor: "pointer" }}
                        />

                        {/* Date to */}
                        <input className="filter-input" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: dateTo ? `1.5px solid ${ORANGE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: dateTo ? "#0f172a" : "#94a3b8", background: "#fff", outline: "none", cursor: "pointer" }}
                        />

                        {/* Reset */}
                        {activeFilters > 0 && (
                            <button onClick={resetAll}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Effacer ({activeFilters})
                            </button>
                        )}
                    </div>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "44px 160px 140px 120px 1fr 160px", padding: "10px 24px", background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                        {["", "Action", "Type", "Rôle", "Détails", "Date"].map((col, i) => (
                            <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase" }}>{col}</span>
                        ))}
                    </div>

                    {/* Rows */}
                    {paginated.length === 0 ? (
                        <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f1f5f9", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Aucune activité trouvée</p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Essayez d'autres critères de recherche</p>
                        </div>
                    ) : paginated.map((log, i) => {
                        const actionMeta = ACTION_META[log.action] || { color: "#64748b", bg: "#f1f5f9", icon: null };
                        const roleMeta   = ROLE_META[log.role]     || { label: log.role, color: "#64748b", bg: "#f1f5f9" };
                        const modelMeta  = MODEL_META[log.model_type] || { label: log.model_type, color: "#64748b" };
                        return (
                            <div key={log.id} className="log-row"
                                style={{ display: "grid", gridTemplateColumns: "44px 160px 140px 120px 1fr 160px", padding: "13px 24px", borderBottom: i < paginated.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center", transition: "background 0.1s" }}
                            >
                                {/* Icon */}
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: actionMeta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={actionMeta.color} strokeWidth="2">{actionMeta.icon}</svg>
                                </div>

                                {/* Action + who */}
                                <div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: actionMeta.color, display: "block" }}>{log.action}</span>
                                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>par {log.performed_by}</span>
                                </div>

                                {/* Model type + name */}
                                <div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: modelMeta.color, display: "block" }}>{modelMeta.label}</span>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 130 }}>{log.model_name}</span>
                                </div>

                                {/* Role badge */}
                                <div>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: roleMeta.bg, color: roleMeta.color }}>
                                        {roleMeta.label}
                                    </span>
                                </div>

                                {/* Details */}
<div style={{ minWidth: 0 }}>
    {log.details && log.details.includes('→') ? (
        <details style={{ cursor: "pointer" }}>
            <summary style={{ fontSize: 12, color: BLUE, fontWeight: 600, listStyle: "none", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                Voir les modifications
            </summary>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {log.details.split(' | ').map((change, idx) => {
                    const [field, rest] = change.split(': ');
                    const [from, to]   = (rest || '').split(' → ');
                    return (
                        <div key={idx} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, color: "#374151" }}>{field}:</span>
                            <span style={{ padding: "1px 6px", borderRadius: 4, background: "#fee2e2", color: "#991b1b", fontFamily: "'DM Mono', monospace" }}>{from}</span>
                            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            <span style={{ padding: "1px 6px", borderRadius: 4, background: "#dcfce7", color: "#166534", fontFamily: "'DM Mono', monospace" }}>{to}</span>
                        </div>
                    );
                })}
            </div>
        </details>
    ) : (
        <span style={{ fontSize: 12, color: "#64748b" }}>{log.details || "—"}</span>
    )}
</div>

                                {/* Date */}
                                <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
                                    {log.created_at}
                                </span>
                            </div>
                        );
                    })}

                    {/* Footer / Pagination */}
                    {filtered.length > 0 && (
                        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                Affichage de <strong style={{ color: "#374151" }}>{(page - 1) * pageSize + 1}</strong>–<strong style={{ color: "#374151" }}>{Math.min(page * pageSize, filtered.length)}</strong> sur <strong style={{ color: "#374151" }}>{filtered.length}</strong> entrées
                            </span>

                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, color: page === 1 ? "#cbd5e1" : "#475569" }}
                                >
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                                    Précédent
                                </button>

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
                                            <button key={p} onClick={() => setPage(p)}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: page === p ? BLUE : "#fff", color: page === p ? "#fff" : "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                            >
                                                {p}
                                            </button>
                                        ))
                                    }
                                </div>

                                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, color: page === totalPages ? "#cbd5e1" : "#475569" }}
                                >
                                    Suivant
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Historique.layout = page => <DashboardLayout>{page}</DashboardLayout>;