// resources/js/Pages/SI/UtilisateursDEE/Edit.jsx

import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const PURPLE = "#7e22ce";

const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const inputStyle = (hasError) => ({
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px",
    border: hasError ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
    borderRadius: 10, fontSize: 14, color: "#0f172a",
    background: "#fafbfc", outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'DM Sans', sans-serif",
});

const Field = ({ label, required, optional, error, children }) => (
    <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
            {label}
            {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
            {optional && <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>(optionnel)</span>}
        </label>
        {children}
        {error && (
            <span style={{ fontSize: 11, color: "#ef4444", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
            </span>
        )}
    </div>
);

export default function Edit({ utilisateur }) {
    const [form, setForm] = useState({
        nom:       utilisateur.nom       || "",
        prenom:    utilisateur.prenom    || "",
        email:     utilisateur.user?.email || "",
        telephone: utilisateur.telephone || "",
        role:      utilisateur.role      || "dee",
        password:  "",
    });
    const [errors, setErrors]             = useState({});
    const [processing, setProcessing]     = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleGenerate = () => {
        const pwd = generatePassword();
        set("password", pwd);
        setShowPassword(true);
    };

    const handleSubmit = () => {
        setProcessing(true);
        router.put(`/si/utilisateurs-dee/${utilisateur.id}`, form, {
            onSuccess: () => setProcessing(false),
            onError:   (e) => { setErrors(e); setProcessing(false); },
        });
    };

    const selectedRole = form.role === "chef_dee"
        ? { label: "Chef DEE", bg: "#fdf4ff", color: PURPLE, dot: "#a855f7" }
        : { label: "DEE",      bg: "#eff6ff", color: BLUE,   dot: "#3b82f6" };

    const initials = `${utilisateur.nom?.[0] || ""}${utilisateur.prenom?.[0] || ""}`.toUpperCase();

    return (
        <>
            <Head title={`Modifier — ${utilisateur.nom} ${utilisateur.prenom}`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .edit-dee * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .field-focus:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,0.1) !important; }
                .role-btn { transition: all 0.15s; cursor: pointer; }
                .role-btn:hover { transform: translateY(-1px); }
                .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(12,68,124,0.4) !important; }
            `}</style>

            <div className="edit-dee" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => router.visit("/si/utilisateurs-dee")}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12, fontWeight: 500, padding: 0, transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = BLUE}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                        >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                            Utilisateurs DEE
                        </button>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>Modifier</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(12,68,124,0.3)` }}>
                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                Modifier — {utilisateur.nom} {utilisateur.prenom}
                            </h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                Modifiez les informations de l'utilisateur · ID #{utilisateur.id}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

                    {/* ── Left column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Section 1 — Identité */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Identité</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Informations personnelles de l'utilisateur</p>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Nom" required error={errors.nom}>
                                    <input className="field-focus" style={inputStyle(errors.nom)} type="text" value={form.nom} onChange={e => set("nom", e.target.value)} />
                                </Field>
                                <Field label="Prénom" required error={errors.prenom}>
                                    <input className="field-focus" style={inputStyle(errors.prenom)} type="text" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
                                </Field>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <Field label="Adresse email" required error={errors.email}>
                                    <input className="field-focus" style={inputStyle(errors.email)} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
                                </Field>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <Field label="Téléphone" optional error={errors.telephone}>
                                    <input className="field-focus" style={inputStyle(errors.telephone)} type="tel" placeholder="+212 6XX XXX XXX" value={form.telephone} onChange={e => set("telephone", e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Section 2 — Rôle */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${PURPLE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2">
                                        <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Rôle</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Niveau d'accès dans le système</p>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {[
                                    { value: "dee",      label: "DEE",      desc: "Utilisateur standard", color: BLUE,   bg: "#eff6ff", dot: "#3b82f6" },
                                    { value: "chef_dee", label: "Chef DEE", desc: "Accès étendu",          color: PURPLE, bg: "#fdf4ff", dot: "#a855f7" },
                                ].map(role => (
                                    <button
                                        key={role.value}
                                        className="role-btn"
                                        type="button"
                                        onClick={() => set("role", role.value)}
                                        style={{
                                            padding: "1.25rem", borderRadius: 12,
                                            border: `2px solid ${form.role === role.value ? role.color : "#e2e8f0"}`,
                                            background: form.role === role.value ? role.bg : "#fafbfc",
                                            textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: form.role === role.value ? role.dot : "#cbd5e1", transition: "background 0.15s" }} />
                                            <span style={{ fontSize: 14, fontWeight: 700, color: form.role === role.value ? role.color : "#374151" }}>{role.label}</span>
                                            {form.role === role.value && (
                                                <span style={{ marginLeft: "auto" }}>
                                                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, fontWeight: 500 }}>{role.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: "2rem" }}>

                        {/* Current user info */}
                        <div style={{ background: `linear-gradient(135deg, ${BLUE}08, ${PURPLE}06)`, border: `1px solid ${BLUE}15`, borderRadius: 18, padding: "1.5rem", display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, color: "#fff", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, letterSpacing: "0.02em" }}>
                                {initials}
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{utilisateur.nom} {utilisateur.prenom}</div>
                                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{utilisateur.user?.email}</div>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: selectedRole.bg, color: selectedRole.color, marginTop: 6 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: selectedRole.dot }} />
                                    {selectedRole.label}
                                </span>
                            </div>
                        </div>

                        {/* Password card */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mot de passe</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Laisser vide pour ne pas modifier</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Nouveau mot de passe</label>
                                <button type="button" onClick={handleGenerate}
                                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, border: `1px solid ${BLUE}30`, background: `${BLUE}08`, color: BLUE, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = `${BLUE}08`; e.currentTarget.style.color = BLUE; }}
                                >
                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                    </svg>
                                    Générer (16 car.)
                                </button>
                            </div>

                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => set("password", e.target.value)}
                                    onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = "0 0 0 3px rgba(12,68,124,0.1)"; }}
                                    onBlur={e => { e.target.style.borderColor = errors.password ? "#ef4444" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: "10px 14px", paddingRight: 40,
                                        border: errors.password ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
                                        borderRadius: 10, fontSize: 14, color: "#0f172a",
                                        background: "#fafbfc", outline: "none",
                                        fontFamily: "'DM Mono', monospace",
                                        letterSpacing: showPassword ? "0.05em" : "0.2em",
                                        WebkitTextSecurity: showPassword ? "none" : "disc",
                                        textSecurity: showPassword ? "none" : "disc",
                                    }}
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)}
                                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: showPassword ? BLUE : "#94a3b8", padding: 2 }}
                                >
                                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {showPassword
                                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                                        }
                                    </svg>
                                </button>
                            </div>

                            {showPassword && form.password && (
                                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: `${BLUE}08`, border: `1px solid ${BLUE}20`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: BLUE, fontWeight: 600, letterSpacing: "0.05em", wordBreak: "break-all" }}>
                                        {form.password}
                                    </span>
                                    <button type="button" onClick={() => navigator.clipboard.writeText(form.password)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: BLUE, fontSize: 11, fontWeight: 700, padding: "0 0 0 8px", whiteSpace: "nowrap" }}
                                    >
                                        Copier
                                    </button>
                                </div>
                            )}
                            {errors.password && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 5, display: "block" }}>{errors.password}</span>}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={processing}
                                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: processing ? "#6b9fd4" : `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: processing ? "not-allowed" : "pointer", boxShadow: processing ? "none" : `0 4px 14px rgba(12,68,124,0.4)`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                            >
                                {processing ? (
                                    <>
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                        </svg>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                        Enregistrer les modifications
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => router.visit("/si/utilisateurs-dee")}
                                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

Edit.layout = page => <DashboardLayout>{page}</DashboardLayout>;