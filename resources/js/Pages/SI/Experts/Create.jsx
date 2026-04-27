// resources/js/Pages/SI/Experts/Create.jsx

import { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";

const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const FileUpload = ({ label, name, accept, file, onChange, hint }) => {
    const ref = useRef();
    return (
        <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>{label}</label>
            <div
                onClick={() => ref.current.click()}
                style={{ border: `2px dashed ${file ? GREEN : "#e2e8f0"}`, borderRadius: 12, padding: "1.25rem", background: file ? `${GREEN}06` : "#fafbfc", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12 }}
                onMouseEnter={e => { if (!file) e.currentTarget.style.borderColor = "#94a3b8"; }}
                onMouseLeave={e => { if (!file) e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: file ? `${GREEN}15` : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {file ? (
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {file ? (
                        <>
                            <p style={{ fontSize: 13, fontWeight: 600, color: GREEN, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{(file.size / 1024).toFixed(1)} KB · Cliquer pour changer</p>
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>Cliquer pour uploader</p>
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{hint || "JPG, PNG ou PDF — max 5 MB"}</p>
                        </>
                    )}
                </div>
                {file && (
                    <button type="button" onClick={e => { e.stopPropagation(); onChange(null); }}
                        style={{ background: "#fef2f2", border: "none", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: "#ef4444", flexShrink: 0 }}
                    >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                )}
            </div>
            <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={e => onChange(e.target.files[0] || null)} />
        </div>
    );
};

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
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
            </span>
        )}
    </div>
);

const inputStyle = (hasError) => ({
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px",
    border: hasError ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
    borderRadius: 10, fontSize: 14, color: "#0f172a",
    background: "#fafbfc", outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'DM Sans', sans-serif",
});

const SectionHeader = ({ icon, title, subtitle, color = BLUE }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">{icon}</svg>
        </div>
        <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>{subtitle}</p>}
        </div>
    </div>
);

export default function Create() {
    const [form, setForm] = useState({
        nom: "", prenom: "", email: "", password: "",
        telephone: "", cin_number: "", rib: "",
        contract_start: "", contract_end: "",
        contract_renewals: "", car_horsepower: "",
    });
    const [files, setFiles]               = useState({ cin_file: null, rib_file: null, contract_file: null, carte_grise_file: null });
    const [errors, setErrors]             = useState({});
    const [processing, setProcessing]     = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const set     = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const setFile = (k, v) => setFiles(f => ({ ...f, [k]: v }));

    const handleGenerate = () => {
        const pwd = generatePassword();
        set("password", pwd);
        setShowPassword(true);
    };

    const handleRIB = (val) => {
        const clean = val.replace(/\D/g, "").slice(0, 24);
        set("rib", clean);
    };

    const ribLength    = form.rib.length;
    const ribComplete  = ribLength === 24;
    const ribHasInput  = ribLength > 0;

    const handleSubmit = () => {
        setProcessing(true);
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== "") data.append(k, v); });
        Object.entries(files).forEach(([k, v]) => { if (v) data.append(k, v); });
        router.post("/si/experts", data, {
            forceFormData: true,
            onSuccess: () => setProcessing(false),
            onError: (e) => { setErrors(e); setProcessing(false); },
        });
    };

    return (
        <>
            <Head title="Ajouter un expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .create-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .field-input:focus { border-color: ${GREEN} !important; box-shadow: 0 0 0 3px rgba(29,158,117,0.1) !important; }
                .section-card { transition: box-shadow 0.2s; }
                .section-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="create-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => router.visit("/si/experts")}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12, fontWeight: 500, padding: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = GREEN}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                        >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                            Experts
                        </button>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Nouvel expert</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${GREEN}, #178a63)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(29,158,117,0.3)` }}>
                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                            </svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Ajouter un expert</h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                Les champs marqués <span style={{ color: "#ef4444" }}>*</span> sont obligatoires
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

                    {/* ── Left column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Section 1 — Identité */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader color={GREEN}
                                icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                                title="Identité de l'expert" subtitle="Informations personnelles obligatoires"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Nom" required error={errors.nom}>
                                    <input className="field-input" style={inputStyle(errors.nom)} type="text" placeholder="Ex: Benali" value={form.nom} onChange={e => set("nom", e.target.value)} />
                                </Field>
                                <Field label="Prénom" required error={errors.prenom}>
                                    <input className="field-input" style={inputStyle(errors.prenom)} type="text" placeholder="Ex: Ahmed" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Field label="Adresse email" required error={errors.email}>
                                    <input className="field-input" style={inputStyle(errors.email)} type="email" placeholder="expert@exemple.ma" value={form.email} onChange={e => set("email", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Field label="Téléphone" optional error={errors.telephone}>
                                    <input className="field-input" style={inputStyle(errors.telephone)} type="tel" placeholder="+212 6XX XXX XXX" value={form.telephone} onChange={e => set("telephone", e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Section 2 — CIN + RIB */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader color={BLUE}
                                icon={<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>}
                                title="Identité & Informations bancaires" subtitle="Optionnel — CIN et RIB de l'expert"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Numéro CIN" optional error={errors.cin_number}>
                                    <input className="field-input" style={{ ...inputStyle(errors.cin_number), fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }} type="text" placeholder="AB123456" value={form.cin_number} onChange={e => set("cin_number", e.target.value)} />
                                </Field>
                                <FileUpload label="Photo / Scan CIN" name="cin_file" accept="image/*,.pdf" file={files.cin_file} onChange={v => setFile("cin_file", v)} hint="JPG, PNG ou PDF · max 5 MB" />
                            </div>

                            {/* RIB field */}
                            <div style={{ marginTop: 16 }}>
                                <Field label="RIB Bancaire" optional error={errors.rib}>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={ribComplete ? GREEN : "#94a3b8"} strokeWidth="2">
                                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                                <line x1="1" y1="10" x2="23" y2="10"/>
                                            </svg>
                                        </div>
                                        <input
                                            className="field-input"
                                            style={{
                                                ...inputStyle(errors.rib || (ribHasInput && !ribComplete)),
                                                paddingLeft: 36,
                                                paddingRight: 64,
                                                fontFamily: "'DM Mono', monospace",
                                                letterSpacing: "0.08em",
                                                border: ribComplete
                                                    ? `1.5px solid ${GREEN}`
                                                    : ribHasInput && !ribComplete
                                                    ? `1.5px solid ${ORANGE}`
                                                    : "1px solid #e2e8f0",
                                                background: ribComplete ? `${GREEN}04` : "#fafbfc",
                                            }}
                                            type="text"
                                            placeholder="007780000012345678901234"
                                            maxLength={24}
                                            value={form.rib}
                                            onChange={e => handleRIB(e.target.value)}
                                        />

                                        
                                        {/* Counter badge */}
                                        <div style={{
                                            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                            display: "flex", alignItems: "center", gap: 4,
                                            padding: "3px 8px", borderRadius: 99,
                                            background: ribComplete ? `${GREEN}15` : ribHasInput ? `${ORANGE}15` : "#f1f5f9",
                                            transition: "all 0.2s",
                                        }}>
                                            {ribComplete && (
                                                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            )}
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                                                color: ribComplete ? GREEN : ribHasInput ? ORANGE : "#94a3b8",
                                            }}>
                                                {ribLength}/24
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    {ribHasInput && (
                                        <div style={{ marginTop: 6, height: 3, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%", borderRadius: 99,
                                                width: `${(ribLength / 24) * 100}%`,
                                                background: ribComplete ? GREEN : ORANGE,
                                                transition: "width 0.2s ease, background 0.2s",
                                            }} />
                                        </div>
                                    )}

                                    {ribHasInput && !ribComplete && (
                                        <span style={{ fontSize: 11, color: ORANGE, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                            {24 - ribLength} chiffre{24 - ribLength > 1 ? "s" : ""} manquant{24 - ribLength > 1 ? "s" : ""}
                                        </span>
                                    )}
                                    {ribComplete && (
                                        <span style={{ fontSize: 11, color: GREEN, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                            RIB valide — 24 chiffres
                                        </span>
                                    )}
                                </Field>
                            </div>

                            {/* RIB document upload */}
<div style={{ marginTop: 16 }}>
    <FileUpload
        label="Document RIB bancaire"
        name="rib_file"
        accept="image/*,.pdf"
        file={files.rib_file}
        onChange={v => setFile("rib_file", v)}
        hint="Scan ou photo du RIB bancaire · JPG, PNG, PDF"
    />
</div>
                        </div>

                        

                        {/* Section 3 — Contrat */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader color="#7e22ce"
                                icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}
                                title="Informations contractuelles" subtitle="Optionnel — Détails du contrat"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                                <Field label="Date de début" optional error={errors.contract_start}>
                                    <input className="field-input" style={inputStyle(errors.contract_start)} type="date" value={form.contract_start} onChange={e => set("contract_start", e.target.value)} />
                                </Field>
                                <Field label="Date de fin" optional error={errors.contract_end}>
                                    <input className="field-input" style={inputStyle(errors.contract_end)} type="date" value={form.contract_end} onChange={e => set("contract_end", e.target.value)} />
                                </Field>
                                <Field label="Renouvellements" optional error={errors.contract_renewals}>
                                    <input className="field-input" style={{ ...inputStyle(errors.contract_renewals), fontFamily: "'DM Mono', monospace" }} type="number" min="0" placeholder="0" value={form.contract_renewals} onChange={e => set("contract_renewals", e.target.value)} />
                                </Field>
                            </div>
                            <FileUpload label="Document du contrat" name="contract_file" accept="image/*,.pdf" file={files.contract_file} onChange={v => setFile("contract_file", v)} hint="Scan ou photo du contrat signé" />
                        </div>

                        {/* Section 4 — Voiture */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader color="#c2410c"
                                icon={<><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}
                                title="Carte grise du véhicule" subtitle="Optionnel — Informations du véhicule"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Puissance fiscale (CV)" optional error={errors.car_horsepower}>
                                    <div style={{ position: "relative" }}>
                                        <input className="field-input" style={{ ...inputStyle(errors.car_horsepower), paddingRight: 48, fontFamily: "'DM Mono', monospace" }} type="number" min="0" max="9999" placeholder="Ex: 7" value={form.car_horsepower} onChange={e => set("car_horsepower", e.target.value)} />
                                        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>CV</span>
                                    </div>
                                </Field>
                                <FileUpload label="Carte grise" name="carte_grise_file" accept="image/*,.pdf" file={files.carte_grise_file} onChange={v => setFile("carte_grise_file", v)} hint="Photo ou scan de la carte grise" />
                            </div>
                        </div>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: "2rem" }}>

                        {/* Password card */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader color={BLUE}
                                icon={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                                title="Mot de passe" subtitle="Obligatoire — min. 8 caractères"
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                                    Mot de passe <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <button type="button" onClick={handleGenerate}
                                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, border: `1px solid ${GREEN}30`, background: `${GREEN}08`, color: GREEN, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = `${GREEN}08`; e.currentTarget.style.color = GREEN; }}
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
                                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
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

                        {/* Summary card */}
                        <div style={{ background: `linear-gradient(135deg, ${BLUE}08, ${GREEN}06)`, border: `1px solid ${GREEN}20`, borderRadius: 18, padding: "1.5rem" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 1rem" }}>Résumé</p>
                            {[
                                { label: "Nom complet",     value: form.nom && form.prenom ? `${form.nom} ${form.prenom}` : null },
                                { label: "Email",           value: form.email || null },
                                { label: "Téléphone",       value: form.telephone || null },
                                { label: "CIN",             value: form.cin_number || null },
                                { label: "RIB",             value: ribComplete ? form.rib : null },
                                { label: "Contrat",         value: form.contract_start ? `${form.contract_start} → ${form.contract_end || "?"}` : null },
                                { label: "Renouvellements", value: form.contract_renewals !== "" ? `${form.contract_renewals}x` : null },
                                { label: "Puissance",       value: form.car_horsepower ? `${form.car_horsepower} CV` : null },
                            ].map(({ label, value }) => value && (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
                                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, textAlign: "right", wordBreak: "break-all", fontFamily: label === "RIB" ? "'DM Mono', monospace" : "inherit" }}>{value}</span>
                                </div>
                            ))}
                            {[
                                { label: "CIN", key: "cin_file" },
                                { label: "Contrat", key: "contract_file" },
                                { label: "Carte grise", key: "carte_grise_file" },
                            ].map(({ label, key }) => files[key] && (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>Fichier {label} prêt</span>
                                </div>
                            ))}
                            {!form.nom && !form.email && (
                                <p style={{ fontSize: 12, color: "#cbd5e1", fontStyle: "italic", margin: 0 }}>Remplissez le formulaire pour voir le résumé</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <button onClick={handleSubmit} disabled={processing}
                                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: processing ? "#5ab894" : `linear-gradient(135deg, ${GREEN}, #178a63)`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: processing ? "not-allowed" : "pointer", boxShadow: processing ? "none" : `0 4px 14px rgba(29,158,117,0.4)`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
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
                                        Créer l'expert
                                    </>
                                )}
                            </button>
                            <button onClick={() => router.visit("/si/experts")}
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
        </>
    );
}

Create.layout = page => <DashboardLayout>{page}</DashboardLayout>;