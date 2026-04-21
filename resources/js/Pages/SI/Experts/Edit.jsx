// resources/js/Pages/SI/Experts/Edit.jsx

import { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE  = "#0C447C";
const GREEN = "#1D9E75";

const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const FileUpload = ({ label, name, accept, file, existing, onChange, hint }) => {
    const ref = useRef();
    return (
        <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>{label}</label>

            {/* Existing file indicator */}
            {existing && !file && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${BLUE}08`, border: `1px solid ${BLUE}20`, borderRadius: 8, marginBottom: 8 }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span style={{ fontSize: 12, color: BLUE, fontWeight: 500, flex: 1 }}>Fichier existant : {existing}</span>
                </div>
            )}

            <div
                onClick={() => ref.current.click()}
                style={{
                    border: `2px dashed ${file ? GREEN : "#e2e8f0"}`,
                    borderRadius: 12, padding: "1.25rem",
                    background: file ? `${GREEN}06` : "#fafbfc",
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 12,
                }}
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
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>{existing ? "Remplacer le fichier" : "Cliquer pour uploader"}</p>
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

export default function Edit({ expert, documents = {} }) {
    const existingDocs = {
        cin:         documents.cin?.[0]?.original_name || null,
        contract:    documents.contract?.[0]?.original_name || null,
        carte_grise: documents.carte_grise?.[0]?.original_name || null,
    };

    const [form, setForm] = useState({
        nom:                expert.nom               || "",
        prenom:             expert.prenom            || "",
        email:              expert.email             || "",
        password:           "",
        telephone:          expert.telephone         || "",
        specialite:         expert.specialite        || "",
        ville:              expert.ville             || "",
        pays:               expert.pays              || "",
        cin_number:         expert.cin_number        || "",
        contract_start:     expert.contract_start    || "",
        contract_end:       expert.contract_end      || "",
        contract_renewals:  expert.contract_renewals ?? "",
        car_horsepower:     expert.car_horsepower    || "",
        // Expert profile fields
        date_naissance:     expert.date_naissance    || "",
        diplomes_obtenus:   expert.diplomes_obtenus  || "",
        specialite:         expert.specialite        || "",
        annee:              expert.annee             || "",
        fonction_actuelle:  expert.fonction_actuelle || "",
        universite_ou_departement_ministeriel: expert.universite_ou_departement_ministeriel || "",
        type_etablissement: expert.type_etablissement || "",
        etablissement:      expert.etablissement     || "",
        date_recrutement:   expert.date_recrutement  || "",
        grade:              expert.grade             || "",
        responsabilite:     expert.responsabilite    || "",
        etablissement_et_annee_responsabilite: expert.etablissement_et_annee_responsabilite || "",
    });

    const [files, setFiles]               = useState({ cin_file: null, contract_file: null, carte_grise_file: null });
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

    const handleSubmit = () => {
        setProcessing(true);
        const data = new FormData();
        data.append("_method", "PUT");
        Object.entries(form).forEach(([k, v]) => { if (v !== "") data.append(k, v); });
        Object.entries(files).forEach(([k, v]) => { if (v) data.append(k, v); });

        router.post(`/si/experts/${expert.id}`, data, {
            forceFormData: true,
            onSuccess: () => setProcessing(false),
            onError: (e) => { setErrors(e); setProcessing(false); },
        });
    };

    return (
        <>
            <Head title={`Modifier — ${expert.nom} ${expert.prenom}`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .edit-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .field-input:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,0.1) !important; }
                .section-card { transition: box-shadow 0.2s; }
                .section-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
            `}</style>

            <div className="edit-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => router.visit("/si/experts")}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12, fontWeight: 500, padding: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = BLUE}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                        >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                            Experts
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
                                Modifier — {expert.nom} {expert.prenom}
                            </h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                Modifiez les informations de l'expert · ID #{expert.id}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

                    {/* ── Left column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Section 1 — Identité */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader
                                color={GREEN}
                                icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                                title="Identité de l'expert"
                                subtitle="Informations personnelles"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Nom" required error={errors.nom}>
                                    <input className="field-input" style={inputStyle(errors.nom)} type="text" value={form.nom} onChange={e => set("nom", e.target.value)} />
                                </Field>
                                <Field label="Prénom" required error={errors.prenom}>
                                    <input className="field-input" style={inputStyle(errors.prenom)} type="text" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                                <Field label="Email" required error={errors.email}>
                                    <input className="field-input" style={inputStyle(errors.email)} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
                                </Field>
                                <Field label="Téléphone" optional error={errors.telephone}>
                                    <input className="field-input" style={inputStyle(errors.telephone)} type="tel" placeholder="+212 6XX XXX XXX" value={form.telephone} onChange={e => set("telephone", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                                <Field label="Date de naissance" optional error={errors.date_naissance}>
                                    <input className="field-input" style={inputStyle(errors.date_naissance)} type="date" value={form.date_naissance} onChange={e => set("date_naissance", e.target.value)} />
                                </Field>
                                <Field label="Ville" optional error={errors.ville}>
                                    <input className="field-input" style={inputStyle(errors.ville)} type="text" placeholder="Ex: Rabat" value={form.ville} onChange={e => set("ville", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Field label="Pays" optional error={errors.pays}>
                                    <input className="field-input" style={inputStyle(errors.pays)} type="text" placeholder="Ex: Maroc" value={form.pays} onChange={e => set("pays", e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Section 2 — Profil académique */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader
                                color="#7e22ce"
                                icon={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}
                                title="Profil académique"
                                subtitle="Informations professionnelles et académiques"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Spécialité" optional error={errors.specialite}>
                                    <input className="field-input" style={inputStyle(errors.specialite)} type="text" placeholder="Ex: Informatique" value={form.specialite} onChange={e => set("specialite", e.target.value)} />
                                </Field>
                                <Field label="Grade" optional error={errors.grade}>
                                    <input className="field-input" style={inputStyle(errors.grade)} type="text" placeholder="Ex: Professeur" value={form.grade} onChange={e => set("grade", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                                <Field label="Fonction actuelle" optional error={errors.fonction_actuelle}>
                                    <input className="field-input" style={inputStyle(errors.fonction_actuelle)} type="text" value={form.fonction_actuelle} onChange={e => set("fonction_actuelle", e.target.value)} />
                                </Field>
                                <Field label="Année" optional error={errors.annee}>
                                    <input className="field-input" style={inputStyle(errors.annee)} type="text" placeholder="Ex: 2024" value={form.annee} onChange={e => set("annee", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Field label="Université / Département ministériel" optional error={errors.universite_ou_departement_ministeriel}>
                                    <input className="field-input" style={inputStyle(errors.universite_ou_departement_ministeriel)} type="text" value={form.universite_ou_departement_ministeriel} onChange={e => set("universite_ou_departement_ministeriel", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                                <Field label="Type d'établissement" optional error={errors.type_etablissement}>
                                    <select className="field-input" style={{ ...inputStyle(errors.type_etablissement), cursor: "pointer" }} value={form.type_etablissement} onChange={e => set("type_etablissement", e.target.value)}>
                                        <option value="">Sélectionner...</option>
                                        <option>Etablissement public</option>
                                        <option>Etablissements publics ne relevant pas des universités</option>
                                        <option>Etablissement universitaire Privé</option>
                                        <option>Etablissements privés ne relevant pas des universités</option>
                                    </select>
                                </Field>
                                <Field label="Établissement" optional error={errors.etablissement}>
                                    <input className="field-input" style={inputStyle(errors.etablissement)} type="text" value={form.etablissement} onChange={e => set("etablissement", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Field label="Diplômes obtenus" optional error={errors.diplomes_obtenus}>
                                    <textarea className="field-input" style={{ ...inputStyle(errors.diplomes_obtenus), resize: "vertical", minHeight: 80 }} value={form.diplomes_obtenus} onChange={e => set("diplomes_obtenus", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                                <Field label="Responsabilité" optional error={errors.responsabilite}>
                                    <input className="field-input" style={inputStyle(errors.responsabilite)} type="text" value={form.responsabilite} onChange={e => set("responsabilite", e.target.value)} />
                                </Field>
                                <Field label="Date de recrutement" optional error={errors.date_recrutement}>
                                    <input className="field-input" style={inputStyle(errors.date_recrutement)} type="date" value={form.date_recrutement} onChange={e => set("date_recrutement", e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Field label="Établissement et année de responsabilité" optional error={errors.etablissement_et_annee_responsabilite}>
                                    <input className="field-input" style={inputStyle(errors.etablissement_et_annee_responsabilite)} type="text" value={form.etablissement_et_annee_responsabilite} onChange={e => set("etablissement_et_annee_responsabilite", e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Section 3 — CIN */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader
                                color={BLUE}
                                icon={<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>}
                                title="Carte d'identité nationale"
                                subtitle="Optionnel — CIN de l'expert"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Numéro CIN" optional error={errors.cin_number}>
                                    <input className="field-input" style={{ ...inputStyle(errors.cin_number), fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }} type="text" placeholder="AB123456" value={form.cin_number} onChange={e => set("cin_number", e.target.value)} />
                                </Field>
                                <FileUpload label="Photo / Scan CIN" name="cin_file" accept="image/*,.pdf" file={files.cin_file} existing={existingDocs.cin} onChange={v => setFile("cin_file", v)} />
                            </div>
                        </div>

                        {/* Section 4 — Contrat */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader
                                color="#7e22ce"
                                icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}
                                title="Informations contractuelles"
                                subtitle="Optionnel — Détails du contrat"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                                <Field label="Date de début" optional error={errors.contract_start}>
                                    <input className="field-input" style={inputStyle(errors.contract_start)} type="date" value={form.contract_start} onChange={e => set("contract_start", e.target.value)} />
                                </Field>
                                <Field label="Date de fin" optional error={errors.contract_end}>
                                    <input className="field-input" style={inputStyle(errors.contract_end)} type="date" value={form.contract_end} onChange={e => set("contract_end", e.target.value)} />
                                </Field>
                                <Field label="Nombre de renouvellements" optional error={errors.contract_renewals}>
                                    <input className="field-input" style={{ ...inputStyle(errors.contract_renewals), fontFamily: "'DM Mono', monospace" }} type="number" min="0" placeholder="0" value={form.contract_renewals} onChange={e => set("contract_renewals", e.target.value)} />
                                </Field>
                            </div>
                            <FileUpload label="Document du contrat" name="contract_file" accept="image/*,.pdf" file={files.contract_file} existing={existingDocs.contract} onChange={v => setFile("contract_file", v)} hint="Scan ou photo du contrat signé" />
                        </div>

                        {/* Section 5 — Voiture */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader
                                color="#c2410c"
                                icon={<><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}
                                title="Carte grise du véhicule"
                                subtitle="Optionnel — Informations du véhicule"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Puissance fiscale (CV)" optional error={errors.car_horsepower}>
                                    <div style={{ position: "relative" }}>
                                        <input className="field-input" style={{ ...inputStyle(errors.car_horsepower), paddingRight: 48, fontFamily: "'DM Mono', monospace" }} type="number" min="0" max="9999" placeholder="Ex: 7" value={form.car_horsepower} onChange={e => set("car_horsepower", e.target.value)} />
                                        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>CV</span>
                                    </div>
                                </Field>
                                <FileUpload label="Carte grise" name="carte_grise_file" accept="image/*,.pdf" file={files.carte_grise_file} existing={existingDocs.carte_grise} onChange={v => setFile("carte_grise_file", v)} hint="Photo ou scan de la carte grise" />
                            </div>
                        </div>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: "2rem" }}>

                        {/* Password card */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <SectionHeader
                                color={BLUE}
                                icon={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                                title="Mot de passe"
                                subtitle="Laisser vide pour ne pas modifier"
                            />

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
                                    className="field-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => set("password", e.target.value)}
                                    style={{ ...inputStyle(errors.password), paddingRight: 40, fontFamily: showPassword ? "'DM Mono', monospace" : "inherit" }}
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)}
                                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2 }}
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
                        <div style={{ background: `linear-gradient(135deg, ${BLUE}08, ${GREEN}06)`, border: `1px solid ${BLUE}15`, borderRadius: 18, padding: "1.5rem" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 1rem" }}>Résumé</p>
                            {[
                                { label: "Nom complet",     value: form.nom && form.prenom ? `${form.nom} ${form.prenom}` : null },
                                { label: "Email",           value: form.email || null },
                                { label: "Téléphone",       value: form.telephone || null },
                                { label: "Spécialité",      value: form.specialite || null },
                                { label: "Établissement",   value: form.etablissement || null },
                                { label: "CIN",             value: form.cin_number || null },
                                { label: "Contrat",         value: form.contract_start ? `${form.contract_start} → ${form.contract_end || "?"}` : null },
                                { label: "Renouvellements", value: form.contract_renewals !== "" ? `${form.contract_renewals}x` : null },
                                { label: "Puissance",       value: form.car_horsepower ? `${form.car_horsepower} CV` : null },
                            ].map(({ label, value }) => value && (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
                                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{value}</span>
                                </div>
                            ))}
                            {[
                                { label: "CIN",         key: "cin_file" },
                                { label: "Contrat",     key: "contract_file" },
                                { label: "Carte grise", key: "carte_grise_file" },
                            ].map(({ label, key }) => files[key] && (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>Nouveau fichier {label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                            <button
                                onClick={() => router.visit("/si/experts")}
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