// resources/js/Pages/SI/Profile.jsx

import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE  = "#0C447C";
const GREEN = "#1D9E75";

const inputStyle = (hasError) => ({
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px",
    border: hasError ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
    borderRadius: 10, fontSize: 14, color: "#0f172a",
    background: "#fafbfc", outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'DM Sans', sans-serif",
});

const Field = ({ label, error, children }) => (
    <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
            {label}
        </label>
        {children}
        {error && (
            <span style={{ fontSize: 11, color: "#ef4444", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
            </span>
        )}
    </div>
);

export default function Profile({ user }) {
    const { flash } = usePage().props;

    const [form, setForm] = useState({
        name:                  user.name     || "",
        email:                 user.email    || "",
        password:              "",
        password_confirmation: "",
    });
    const [errors, setErrors]         = useState({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = () => {
        setProcessing(true);
        router.put("/si/profile", form, {
            onSuccess: () => { setProcessing(false); set("password", ""); set("password_confirmation", ""); },
            onError: (e) => { setErrors(e); setProcessing(false); },
        });
    };

    const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <>
            <Head title="Mon Profil — ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .field-focus:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,0.1) !important; outline: none; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Système d'Information</span>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>Mon Profil</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(12,68,124,0.3)`, color: "#fff", fontSize: 18, fontWeight: 800 }}>
                            {initials}
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Mon Profil</h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                Gérez vos informations de connexion
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success toast */}
                {flash?.success && (
                    <div style={{ marginBottom: 24, padding: "14px 18px", borderRadius: 12, background: `${GREEN}10`, border: `1px solid ${GREEN}30`, display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>{flash.success}</span>
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

                    {/* Left — Form */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Identity section */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Informations du compte</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Nom et adresse email</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Field label="Nom complet" error={errors.name}>
                                    <input className="field-focus" style={inputStyle(errors.name)} type="text" value={form.name} onChange={e => set("name", e.target.value)} />
                                </Field>
                                <Field label="Adresse email" error={errors.email}>
                                    <input className="field-focus" style={inputStyle(errors.email)} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Password section */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Changer le mot de passe</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Laisser vide pour ne pas modifier</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Field label="Nouveau mot de passe" error={errors.password}>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            className="field-focus"
                                            type="text"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={e => set("password", e.target.value)}
                                            style={{
                                                ...inputStyle(errors.password),
                                                paddingRight: 40,
                                                fontFamily: "'DM Mono', monospace",
                                                WebkitTextSecurity: showPassword ? "none" : "disc",
                                                letterSpacing: showPassword ? "0.05em" : "0.2em",
                                            }}
                                        />
                                        <button type="button" onClick={() => setShowPassword(s => !s)}
                                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: showPassword ? BLUE : "#94a3b8" }}
                                        >
                                            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                {showPassword
                                                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                                                }
                                            </svg>
                                        </button>
                                    </div>
                                </Field>
                                <Field label="Confirmer le mot de passe" error={errors.password_confirmation}>
                                    <input
                                        className="field-focus"
                                        type="text"
                                        placeholder="••••••••"
                                        value={form.password_confirmation}
                                        onChange={e => set("password_confirmation", e.target.value)}
                                        style={{
                                            ...inputStyle(errors.password_confirmation),
                                            fontFamily: "'DM Mono', monospace",
                                            WebkitTextSecurity: showPassword ? "none" : "disc",
                                            letterSpacing: showPassword ? "0.05em" : "0.2em",
                                        }}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Right — Summary + Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: "2rem" }}>

                        {/* Current info card */}
                        <div style={{ background: `linear-gradient(135deg, ${BLUE}08, ${GREEN}06)`, border: `1px solid ${BLUE}15`, borderRadius: 18, padding: "1.5rem" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 1rem" }}>Informations actuelles</p>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "12px", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                                    {initials}
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{user.name}</p>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{user.email}</p>
                                </div>
                            </div>

                            <div style={{ padding: "10px 12px", borderRadius: 10, background: `${BLUE}08`, border: `1px solid ${BLUE}15` }}>
                                <p style={{ fontSize: 11, color: "#64748b", margin: 0, fontWeight: 500 }}>
                                    Rôle: <strong style={{ color: BLUE }}>Administrateur SI</strong>
                                </p>
                                <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0", fontWeight: 500 }}>
                                    ID: <strong style={{ color: BLUE, fontFamily: "'DM Mono', monospace" }}>#{user.id}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Save button */}
                        <button
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
                    </div>
                </div>
            </div>
        </>
    );
}

Profile.layout = page => <DashboardLayout>{page}</DashboardLayout>;