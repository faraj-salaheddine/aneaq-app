// resources/js/Pages/SI/UtilisateursDEE/Index.jsx

import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const PURPLE = "#7e22ce";

const ROLE_META = {
    dee:      { label: "DEE",      bg: "#eff6ff", color: BLUE,   dot: "#3b82f6" },
    chef_dee: { label: "Chef DEE", bg: "#fdf4ff", color: PURPLE, dot: "#a855f7" },
};

const PALETTE = [
    { bg: "#EBF4FF", color: "#1d4ed8" },
    { bg: "#ECFDF5", color: "#065f46" },
    { bg: "#FFF7ED", color: "#9a3412" },
    { bg: "#FAF5FF", color: "#6b21a8" },
    { bg: "#FFF1F2", color: "#9f1239" },
    { bg: "#F0FDF4", color: "#14532d" },
];

const getColor = str => PALETTE[(str?.charCodeAt(0) || 0) % PALETTE.length];
const initials = u => `${u.nom?.[0] || ""}${u.prenom?.[0] || ""}`.toUpperCase() || "?";

export default function Index({ dee = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch]         = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [toast, setToast]           = useState(flash?.success || null);

    useEffect(() => {
        if (flash?.success) setToast(flash.success);
    }, [flash?.success]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const filtered = dee.filter(u => {
        const s = search.toLowerCase();
        const matchSearch = !s ||
            (u.nom         || "").toLowerCase().includes(s) ||
            (u.prenom      || "").toLowerCase().includes(s) ||
            (u.user?.email || "").toLowerCase().includes(s) ||
            (u.telephone   || "").toLowerCase().includes(s);
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const handleDelete = u => {
        if (!confirm(`Supprimer ${u.nom} ${u.prenom} ?`)) return;
        router.delete(`/si/utilisateurs-dee/${u.id}`);
    };

    const totalDEE     = dee.filter(u => u.role === "dee").length;
    const totalChefDEE = dee.filter(u => u.role === "chef_dee").length;

    return (
        <>
            <Head title="Utilisateurs DEE" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .dee-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .dee-row:hover { background: #f8fafc !important; }
                .btn-edit:hover { background: #EBF4FF !important; border-color: ${BLUE} !important; color: ${BLUE} !important; }
                .btn-del:hover  { background: #FFF1F2 !important; border-color: #fca5a5 !important; }
                .add-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(12,68,124,0.4) !important; }
                .filter-pill    { transition: all 0.15s; cursor: pointer; }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                .dee-row { animation: fadeUp 0.2s ease both; }
            `}</style>

            <div className="dee-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Système d'Information</span>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            <span style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>Utilisateurs DEE</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(12,68,124,0.3)` }}>
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div>
                                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                    Utilisateurs DEE
                                </h1>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                    <span style={{ color: BLUE, fontWeight: 700 }}>{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""} · {dee.length} utilisateurs au total
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="add-btn"
                        onClick={() => router.visit("/si/utilisateurs-dee/create")}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 24px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 14px rgba(12,68,124,0.35)`, transition: "all 0.2s" }}
                    >
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Ajouter un utilisateur
                    </button>
                </div>

                {/* ── Stats strip ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "2rem" }}>
                    {[
                        { label: "Total utilisateurs", value: dee.length,   color: BLUE,   icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
                        { label: "DEE",                value: totalDEE,     color: BLUE,   icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
                        { label: "Chef DEE",           value: totalChefDEE, color: PURPLE, icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
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
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: "#fafbfc" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </span>
                            <input
                                type="text" placeholder="Rechercher par nom, prénom, email ou téléphone..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", transition: "border-color 0.15s" }}
                                onFocus={e => e.target.style.borderColor = BLUE}
                                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>

                        <div style={{ display: "flex", gap: 6 }}>
                            {[
                                { value: "",         label: "Tous" },
                                { value: "dee",      label: "DEE" },
                                { value: "chef_dee", label: "Chef DEE" },
                            ].map(opt => (
                                <button key={opt.value} className="filter-pill" onClick={() => setRoleFilter(opt.value)}
                                    style={{ padding: "7px 14px", borderRadius: 99, border: `1.5px solid ${roleFilter === opt.value ? BLUE : "#e2e8f0"}`, background: roleFilter === opt.value ? `${BLUE}10` : "#fff", color: roleFilter === opt.value ? BLUE : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                >
                                    {opt.label}
                                    {opt.value && (
                                        <span style={{ marginLeft: 6, background: roleFilter === opt.value ? BLUE : "#e2e8f0", color: roleFilter === opt.value ? "#fff" : "#64748b", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                                            {opt.value === "dee" ? totalDEE : totalChefDEE}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {(search || roleFilter) && (
                            <button onClick={() => { setSearch(""); setRoleFilter(""); }}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Effacer
                            </button>
                        )}
                    </div>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 140px 160px", padding: "10px 24px", background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                        {["Utilisateur", "Email", "Téléphone", "Rôle", "Actions"].map((col, i) => (
                            <span key={col} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", textAlign: i === 4 ? "right" : "left" }}>
                                {col}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    {filtered.map((user, i) => {
                        const av   = getColor(user.nom);
                        const role = ROLE_META[user.role];
                        return (
                            <div key={user.id} className="dee-row"
                                style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 140px 160px", padding: "13px 24px", borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center", transition: "background 0.1s", animationDelay: `${i * 0.03}s` }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 11, background: av.bg, color: av.color, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${av.color}20` }}>
                                        {initials(user)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                            {user.nom} <span style={{ fontWeight: 500, color: "#64748b" }}>{user.prenom}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>ID #{user.id}</div>
                                    </div>
                                </div>

                                <a href={`mailto:${user.user?.email}`}
                                    style={{ fontSize: 13, color: BLUE, textDecoration: "none", fontWeight: 500, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                                >
                                    {user.user?.email || "—"}
                                </a>

                                <span style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                                    {user.telephone || "—"}
                                </span>

                                {role ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: role.bg, color: role.color, width: "fit-content" }}>
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: role.dot, flexShrink: 0 }} />
                                        {role.label}
                                    </span>
                                ) : (
                                    <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                                )}

                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                    <button className="btn-edit"
                                        onClick={() => router.visit(`/si/utilisateurs-dee/${user.id}/edit`)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#475569", transition: "all 0.15s" }}
                                    >
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        Modifier
                                    </button>
                                    <button className="btn-del"
                                        onClick={() => handleDelete(user)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#ef4444", transition: "all 0.15s" }}
                                    >
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                            <div style={{ width: 70, height: 70, borderRadius: 18, background: `linear-gradient(135deg, ${BLUE}12, ${PURPLE}10)`, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BLUE}20` }}>
                                <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Aucun utilisateur trouvé</p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 1.5rem" }}>
                                {search || roleFilter ? "Essayez d'autres critères" : "Commencez par ajouter un utilisateur DEE"}
                            </p>
                            {(search || roleFilter) && (
                                <button onClick={() => { setSearch(""); setRoleFilter(""); }}
                                    style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: BLUE, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                Affichage de <strong style={{ color: "#374151" }}>{filtered.length}</strong> sur <strong style={{ color: "#374151" }}>{dee.length}</strong> utilisateurs
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                {Object.entries(ROLE_META).map(([key, meta]) => {
                                    const count = filtered.filter(u => u.role === key).length;
                                    if (!count) return null;
                                    return (
                                        <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: meta.bg, color: meta.color }}>
                                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.dot }} />
                                            {count} {meta.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: "fixed", bottom: 32, right: 32, zIndex: 999,
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderRadius: 14, padding: "14px 20px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    display: "flex", alignItems: "center", gap: 12,
                    animation: "slideUp 0.3s ease",
                    minWidth: 280,
                }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Succès</p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{toast}</p>
                    </div>
                    <button onClick={() => setToast(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, flexShrink: 0 }}
                    >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
}

Index.layout = page => <DashboardLayout>{page}</DashboardLayout>;