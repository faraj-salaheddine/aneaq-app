// resources/js/Pages/SI/Etablissements/Create.jsx

import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";

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

export default function Create({ universites = [], villes = [] }) {
    const [form, setForm] = useState({
        etablissement:         "",
        etablissement_2:       "",
        acronyme:              "",
        universite:            "",
        ville:                 "",
        domaine_connaissances: "",
        evaluation:            "",
    });
    const [errors, setErrors]         = useState({});
    const [processing, setProcessing] = useState(false);
    const [customVille, setCustomVille] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const selectedUniv = universites.find(u => u.name === form.universite);

    const handleSubmit = () => {
        setProcessing(true);
        router.post("/si/etablissements", form, {
            onSuccess: () => setProcessing(false),
            onError:   (e) => { setErrors(e); setProcessing(false); },
        });
    };

    return (
        <>
            <Head title="Ajouter un établissement" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .create-etab * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .field-focus:focus { border-color: ${ORANGE} !important; box-shadow: 0 0 0 3px rgba(239,159,39,0.1) !important; }
                .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239,159,39,0.4) !important; }
                .section-card { transition: box-shadow 0.2s; }
                .section-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
            `}</style>

            <div className="create-etab" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => router.visit("/si/etablissements")}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12, fontWeight: 500, padding: 0, transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = ORANGE}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                        >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                            Établissements
                        </button>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>Nouvel établissement</span>
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
                            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                Ajouter un établissement
                            </h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                Les champs marqués <span style={{ color: "#ef4444" }}>*</span> sont obligatoires
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

                    {/* ── Left column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Section 1 — Informations principales */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${ORANGE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <path d="M9 22V12h6v10"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Informations principales</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Nom et identification de l'établissement</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Field label="Nom de l'établissement" required error={errors.etablissement}>
                                    <input className="field-focus" style={inputStyle(errors.etablissement)} type="text" placeholder="Ex: Faculté des Sciences" value={form.etablissement} onChange={e => set("etablissement", e.target.value)} />
                                </Field>

                                <Field label="Nom alternatif" optional error={errors.etablissement_2}>
                                    <input className="field-focus" style={inputStyle(errors.etablissement_2)} type="text" placeholder="Ex: Nom en arabe ou abréviation" value={form.etablissement_2} onChange={e => set("etablissement_2", e.target.value)} />
                                </Field>

                                <Field label="Acronyme" optional error={errors.acronyme}>
                                    <input className="field-focus" style={{ ...inputStyle(errors.acronyme), fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em", textTransform: "uppercase" }} type="text" placeholder="Ex: FSR" value={form.acronyme} onChange={e => set("acronyme", e.target.value.toUpperCase())} />
                                </Field>

                                <Field label="Domaine de connaissances" optional error={errors.domaine_connaissances}>
                                    <input className="field-focus" style={inputStyle(errors.domaine_connaissances)} type="text" placeholder="Ex: Sciences et Techniques" value={form.domaine_connaissances} onChange={e => set("domaine_connaissances", e.target.value)} />
                                </Field>

                                <Field label="Évaluation" optional error={errors.evaluation}>
                                    <input className="field-focus" style={inputStyle(errors.evaluation)} type="text" placeholder="Ex: En cours, Validé..." value={form.evaluation} onChange={e => set("evaluation", e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Section 2 — Localisation & Université */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Localisation & Université</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Ville et université de rattachement</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                                {/* Ville */}
                                <Field label="Ville" required error={errors.ville}>
                                    {!customVille ? (
                                        <div style={{ position: "relative" }}>
                                            <select
                                                className="field-focus"
                                                value={form.ville}
                                                onChange={e => {
                                                    if (e.target.value === "__custom__") { setCustomVille(true); set("ville", ""); }
                                                    else set("ville", e.target.value);
                                                }}
                                                style={{ ...inputStyle(errors.ville), cursor: "pointer", appearance: "none", paddingRight: 36 }}
                                            >
                                                <option value="">Sélectionner une ville...</option>
                                                {villes.map(v => <option key={v} value={v}>{v}</option>)}
                                                <option value="__custom__">+ Nouvelle ville...</option>
                                            </select>
                                            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <input className="field-focus" style={{ ...inputStyle(errors.ville), flex: 1 }} type="text" placeholder="Entrez la ville..." value={form.ville} onChange={e => set("ville", e.target.value)} autoFocus />
                                            <button type="button" onClick={() => { setCustomVille(false); set("ville", ""); }}
                                                style={{ padding: "0 12px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", color: "#64748b", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}
                                            >
                                                ← Liste
                                            </button>
                                        </div>
                                    )}
                                </Field>

                                {/* Université */}
                                <Field label="Université de rattachement" required error={errors.universite}>
                                    <div style={{ position: "relative" }}>
                                        <select
                                            className="field-focus"
                                            value={form.universite}
                                            onChange={e => set("universite", e.target.value)}
                                            style={{ ...inputStyle(errors.universite), cursor: "pointer", appearance: "none", paddingRight: 36 }}
                                        >
                                            <option value="">Sélectionner une université...</option>
                                            {universites.map(u => (
                                                <option key={u.id} value={u.name}>{u.name}</option>
                                            ))}
                                        </select>
                                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </Field>

                                {/* Selected university preview */}
                                {form.universite && (
                                    <div style={{ padding: "12px 16px", borderRadius: 10, background: `${GREEN}08`, border: `1px solid ${GREEN}20`, display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${GREEN}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: GREEN, margin: 0 }}>Université sélectionnée</p>
                                            <p style={{ fontSize: 13, color: "#374151", margin: "2px 0 0", fontWeight: 500 }}>{form.universite}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: "2rem" }}>

                        {/* Summary card */}
                        <div style={{ background: `linear-gradient(135deg, ${ORANGE}08, ${BLUE}06)`, border: `1px solid ${ORANGE}20`, borderRadius: 18, padding: "1.5rem" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 1rem" }}>
                                Résumé
                            </p>

                            {[
                                { label: "Établissement", value: form.etablissement || null, icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></> },
                                { label: "Acronyme",      value: form.acronyme       || null, icon: <><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></> },
                                { label: "Ville",         value: form.ville          || null, icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
                                { label: "Université",    value: form.universite     || null, icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
                                { label: "Domaine",       value: form.domaine_connaissances || null, icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
                            ].map(({ label, value, icon }) => value && (
                                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${ORANGE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2">{icon}</svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>{label}</p>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0, wordBreak: "break-word" }}>{value}</p>
                                    </div>
                                </div>
                            ))}

                            {!form.etablissement && !form.ville && (
                                <p style={{ fontSize: 12, color: "#cbd5e1", fontStyle: "italic", margin: 0 }}>
                                    Remplissez le formulaire pour voir le résumé
                                </p>
                            )}
                        </div>

                        {/* Required fields reminder */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "1.25rem" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>Champs obligatoires</p>
                            {[
                                { label: "Nom de l'établissement", done: !!form.etablissement },
                                { label: "Ville",                  done: !!form.ville },
                                { label: "Université",             done: !!form.universite },
                            ].map(({ label, done }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? `${GREEN}15` : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${done ? GREEN : "#e2e8f0"}`, transition: "all 0.2s" }}>
                                        {done && (
                                            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 12, color: done ? "#374151" : "#94a3b8", fontWeight: done ? 600 : 400, transition: "all 0.2s" }}>{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={processing || !form.etablissement || !form.ville || !form.universite}
                                style={{
                                    width: "100%", padding: "13px", borderRadius: 12, border: "none",
                                    background: (processing || !form.etablissement || !form.ville || !form.universite)
                                        ? "#e2e8f0"
                                        : `linear-gradient(135deg, ${ORANGE}, #d4880f)`,
                                    color: (processing || !form.etablissement || !form.ville || !form.universite) ? "#94a3b8" : "#fff",
                                    fontSize: 15, fontWeight: 700,
                                    cursor: (processing || !form.etablissement || !form.ville || !form.universite) ? "not-allowed" : "pointer",
                                    boxShadow: (processing || !form.etablissement || !form.ville || !form.universite) ? "none" : `0 4px 14px rgba(239,159,39,0.4)`,
                                    transition: "all 0.2s",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                }}
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
                                        Ajouter l'établissement
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => router.visit("/si/etablissements")}
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

Create.layout = page => <DashboardLayout>{page}</DashboardLayout>;