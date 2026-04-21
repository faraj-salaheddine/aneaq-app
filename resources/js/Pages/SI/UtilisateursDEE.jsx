// resources/js/Pages/SI/UtilisateursDEE.jsx

import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const ACCENT = "#0C447C";

const ROLE_LABELS = {
    dee:      "DEE",
    chef_dee: "Chef DEE",
};

const ROLE_COLORS = {
    dee:      { bg: "#eff6ff", color: "#0C447C" },
    chef_dee: { bg: "#fdf4ff", color: "#7e22ce" },
};

export default function UtilisateursDEE({ dee = [] }) {
    const [search, setSearch]           = useState("");
    const [showModal, setShowModal]     = useState(false);
    const [modalType, setModalType]     = useState("create");
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm]               = useState({ name: "", email: "", role: "dee", password: "" });
    const [errors, setErrors]           = useState({});
    const [processing, setProcessing]   = useState(false);

    const filtered = dee.filter(u =>
        (u.name  || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setModalType("create");
        setForm({ name: "", email: "", role: "dee", password: "" });
        setEditingUser(null);
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (user) => {
        setModalType("edit");
        setForm({ name: user.name || "", email: user.email || "", role: user.role || "dee", password: "" });
        setEditingUser(user);
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = () => {
        setProcessing(true);
        if (modalType === "create") {
            router.post("/si/utilisateurs-dee", form, {
                onSuccess: () => { setShowModal(false); setProcessing(false); },
                onError:   (e) => { setErrors(e); setProcessing(false); },
            });
        } else {
            router.put(`/si/utilisateurs-dee/${editingUser.id}`, form, {
                onSuccess: () => { setShowModal(false); setProcessing(false); },
                onError:   (e) => { setErrors(e); setProcessing(false); },
            });
        }
    };

    const handleDelete = (user) => {
        if (!confirm(`Supprimer ${user.name} ?`)) return;
        router.delete(`/si/utilisateurs-dee/${user.id}`);
    };

    const initials = (name) => name
        ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    const fields = [
        {
            label: "Nom complet",
            key: "name",
            type: "text",
            placeholder: "Ex: Ahmed Benali",
            icon: (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            ),
        },
        {
            label: "Adresse email",
            key: "email",
            type: "email",
            placeholder: "ex@aneaq.ma",
            icon: (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
            ),
        },
        {
            label: "Rôle",
            key: "role",
            type: "select",
            options: [
                { value: "dee",      label: "DEE" },
                { value: "chef_dee", label: "Chef DEE" },
            ],
            icon: (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                </svg>
            ),
        },
        {
            label: "Mot de passe",
            key: "password",
            type: "password",
            placeholder: modalType === "edit" ? "Laisser vide pour ne pas modifier" : "••••••••",
            icon: (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            ),
        },
    ];

    return (
        <>
            <Head title="Utilisateurs DEE" />
            <div style={{ padding: "2.5rem 3rem" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: "#0f172a" }}>
                            Utilisateurs DEE
                        </h1>
                        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
                            {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""} enregistré{filtered.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "11px 22px", borderRadius: 10, border: "none",
                            background: ACCENT, color: "#fff",
                            fontSize: 14, fontWeight: 600, cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(12,68,124,0.3)",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#0a3a6e"}
                        onMouseLeave={e => e.currentTarget.style.background = ACCENT}
                    >
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Ajouter un utilisateur
                    </button>
                </div>

                {/* ── Divider ── */}
                <div style={{ height: 1, background: "#f1f5f9", marginBottom: "1.5rem" }} />

                {/* ── Search ── */}
                <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: 380 }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            paddingLeft: 42, paddingRight: 16,
                            paddingTop: 10, paddingBottom: 10,
                            width: "100%", boxSizing: "border-box",
                            border: "1px solid #e2e8f0", borderRadius: 10,
                            fontSize: 14, color: "#0f172a",
                            background: "#fff", outline: "none",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                    />
                </div>

                {/* ── Table ── */}
                <div style={{
                    background: "#fff",
                    border: "1px solid #e8edf3",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                    {/* Table header */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1fr 180px",
                        padding: "12px 20px",
                        background: "#f8fafc",
                        borderBottom: "1px solid #e8edf3",
                    }}>
                        {["Nom", "Email", "Rôle", "Actions"].map((col, i) => (
                            <span key={col} style={{
                                fontSize: 11, fontWeight: 700,
                                color: "#9ca3af", letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                textAlign: i === 3 ? "right" : "left",
                            }}>
                                {col}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    {filtered.map((user, i) => (
                        <div
                            key={user.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 2fr 1fr 180px",
                                padding: "14px 20px",
                                borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                                alignItems: "center",
                                transition: "background 0.1s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            {/* Name with avatar */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    background: `${ACCENT}15`, color: ACCENT,
                                    fontWeight: 700, fontSize: 13,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    {initials(user.name)}
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                                    {user.name}
                                </span>
                            </div>

                            {/* Email */}
                            <span style={{ fontSize: 14, color: "#6b7280" }}>{user.email}</span>

                            {/* Role badge */}
                            <span style={{
                                display: "inline-flex", alignItems: "center",
                                padding: "3px 10px", borderRadius: 99,
                                background: ROLE_COLORS[user.role]?.bg || "#f1f5f9",
                                color: ROLE_COLORS[user.role]?.color || "#475569",
                                fontSize: 12, fontWeight: 600,
                                width: "fit-content",
                            }}>
                                {ROLE_LABELS[user.role] || user.role}
                            </span>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button
                                    onClick={() => openEdit(user)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "6px 12px", borderRadius: 7,
                                        border: "1px solid #e2e8f0",
                                        background: "#fff", cursor: "pointer",
                                        fontSize: 13, fontWeight: 500, color: "#475569",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
                                >
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(user)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "6px 12px", borderRadius: 7,
                                        border: "1px solid #fee2e2",
                                        background: "#fff", cursor: "pointer",
                                        fontSize: 13, fontWeight: 500, color: "#ef4444",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                >
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                    </svg>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%",
                                background: "#f1f5f9", margin: "0 auto 1rem",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
                                Aucun utilisateur trouvé
                            </p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                                {search ? "Essayez un autre terme de recherche" : "Commencez par ajouter un utilisateur DEE"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal ── */}
            {showModal && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    background: "rgba(15,23,42,0.5)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "1rem",
                }}>
                    <div style={{
                        background: "#fff",
                        borderRadius: 16,
                        width: "100%", maxWidth: 460,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                    }}>
                        {/* Modal header */}
                        <div style={{
                            padding: "1.5rem 1.75rem",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 9,
                                    background: `${ACCENT}12`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2">
                                        {modalType === "create"
                                            ? <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>
                                            : <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                                        }
                                    </svg>
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                                        {modalType === "create" ? "Créer un compte" : "Modifier le compte"}
                                    </h2>
                                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                                        {modalType === "create"
                                            ? "Remplissez les informations du nouvel utilisateur"
                                            : `Modification de ${editingUser?.name}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    border: "1px solid #e2e8f0", background: "#fff",
                                    cursor: "pointer", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    color: "#6b7280",
                                }}
                            >
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: 18 }}>
                            {fields.map(field => (
                                <div key={field.key}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                                        {field.label}
                                        {field.key !== "password" && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none", zIndex: 1 }}>
                                            {field.icon}
                                        </span>

                                        {field.type === "select" ? (
                                            <select
                                                value={form[field.key]}
                                                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                                style={{
                                                    width: "100%", boxSizing: "border-box",
                                                    paddingLeft: 38, paddingRight: 14,
                                                    paddingTop: 10, paddingBottom: 10,
                                                    border: errors[field.key] ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
                                                    borderRadius: 9, fontSize: 14, color: "#0f172a",
                                                    background: "#fafbfc", outline: "none",
                                                    cursor: "pointer", appearance: "none",
                                                }}
                                            >
                                                {field.options.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={form[field.key]}
                                                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                                style={{
                                                    width: "100%", boxSizing: "border-box",
                                                    paddingLeft: 38, paddingRight: 14,
                                                    paddingTop: 10, paddingBottom: 10,
                                                    border: errors[field.key] ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
                                                    borderRadius: 9, fontSize: 14, color: "#0f172a",
                                                    background: "#fafbfc", outline: "none",
                                                    transition: "border-color 0.15s",
                                                }}
                                                onFocus={e => e.target.style.borderColor = ACCENT}
                                                onBlur={e => e.target.style.borderColor = errors[field.key] ? "#ef4444" : "#e2e8f0"}
                                            />
                                        )}
                                    </div>
                                    {errors[field.key] && (
                                        <span style={{ fontSize: 12, color: "#ef4444", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                            {errors[field.key]}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Modal footer */}
                        <div style={{
                            padding: "1.25rem 1.75rem",
                            borderTop: "1px solid #f1f5f9",
                            display: "flex", gap: 10, justifyContent: "flex-end",
                        }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: "10px 20px", borderRadius: 9,
                                    border: "1px solid #e2e8f0",
                                    background: "#fff", cursor: "pointer",
                                    fontSize: 14, fontWeight: 500, color: "#475569",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                style={{
                                    padding: "10px 24px", borderRadius: 9, border: "none",
                                    background: processing ? "#6b9fd4" : ACCENT,
                                    color: "#fff", cursor: processing ? "not-allowed" : "pointer",
                                    fontSize: 14, fontWeight: 600,
                                    boxShadow: processing ? "none" : "0 4px 12px rgba(12,68,124,0.3)",
                                    transition: "all 0.15s",
                                    display: "flex", alignItems: "center", gap: 8,
                                }}
                            >
                                {processing && (
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                )}
                                {processing ? "En cours..." : modalType === "create" ? "Créer le compte" : "Enregistrer les modifications"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

UtilisateursDEE.layout = page => <DashboardLayout>{page}</DashboardLayout>;