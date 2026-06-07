// resources/js/Pages/SI/Etablissements/Edit.jsx

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

export default function Edit({ etablissement, universites = [], villes = [] }) {
    const [form, setForm] = useState({
        etablissement:         etablissement.etablissement         || "",
        etablissement_2:       etablissement.etablissement_2       || "",
        acronyme:              etablissement.acronyme              || "",
        universite:            etablissement.universite            || "",
        ville:                 etablissement.ville                 || "",
        email:                 etablissement.email                 || "",
        domaine_connaissances: etablissement.domaine_connaissances || "",
        evaluation:            etablissement.evaluation            || "",
    });
    const [errors, setErrors]         = useState({});
    const [processing, setProcessing] = useState(false);
    const [customVille, setCustomVille] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = () => {
        setProcessing(true);
        router.patch(`/si/etablissements/${etablissement.id}`, form, {
            onSuccess: () => setProcessing(false),
            onError:   (e) => { setErrors(e); setProcessing(false); },
        });
    };

    return (
        <>
            <Head title="Modifier un établissement" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .edit-etab * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .field-focus:focus { border-color: ${ORANGE} !important; box-shadow: 0 0 0 3px rgba(239,159,39,0.1) !important; }
                .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239,159,39,0.4) !important; }
                .section-card { transition: box-shadow 0.2s; }
                .section-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="edit-etab" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => router.visit("/si/etablissements")}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12, fontWeight: 500, padding: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = ORANGE}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                        >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                            Établissements
                        </button>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>Modifier</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${ORANGE}, #d4880f)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px rgba(239,159,39,0.3)` }}>
                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                Modifier l'établissement
                            </h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                {etablissement.etablissement}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

                    {/* Left column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Informations principales */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${ORANGE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/></svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Informations principales</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Nom, email et identification</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Field label="Nom de l'établissement" required error={errors.etablissement}>
                                    <input className="field-focus" style={inputStyle(errors.etablissement)} type="text" value={form.etablissement} onChange={e => set("etablissement", e.target.value)} />
                                </Field>
                                <Field label="Nom alternatif" optional error={errors.etablissement_2}>
                                    <input className="field-focus" style={inputStyle(errors.etablissement_2)} type="text" value={form.etablissement_2} onChange={e => set("etablissement_2", e.target.value)} />
                                </Field>
                                <Field label="Acronyme" optional error={errors.acronyme}>
                                    <input className="field-focus" style={{ ...inputStyle(errors.acronyme), fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }} type="text" value={form.acronyme} onChange={e => set("acronyme", e.target.value.toUpperCase())} />
                                </Field>
                                <Field label="Email de l'établissement" optional error={errors.email}>
                                    <input className="field-focus" style={inputStyle(errors.email)} type="email" placeholder="contact@etablissement.ma" value={form.email} onChange={e => set("email", e.target.value)} />
                                </Field>
                                <Field label="Domaine de connaissances" optional error={errors.domaine_connaissances}>
                                    <input className="field-focus" style={inputStyle(errors.domaine_connaissances)} type="text" value={form.domaine_connaissances} onChange={e => set("domaine_connaissances", e.target.value)} />
                                </Field>
                                <Field label="Évaluation" optional error={errors.evaluation}>
                                    <input className="field-focus" style={inputStyle(errors.evaluation)} type="text" value={form.evaluation} onChange={e => set("evaluation", e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Localisation */}
                        <div className="section-card" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Localisation & Université</h3>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Field label="Ville" required error={errors.ville}>
                                    {!customVille ? (
                                        <div style={{ position: "relative" }}>
                                            <select className="field-focus" value={form.ville} onChange={e => { if (e.target.value === "__custom__") { setCustomVille(true); set("ville", ""); } else set("ville", e.target.value); }} style={{ ...inputStyle(errors.ville), cursor: "pointer", appearance: "none", paddingRight: 36 }}>
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
                                            <input className="field-focus" style={{ ...inputStyle(errors.ville), flex: 1 }} type="text" value={form.ville} onChange={e => set("ville", e.target.value)} autoFocus />
                                            <button type="button" onClick={() => { setCustomVille(false); set("ville", ""); }} style={{ padding: "0 12px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", color: "#64748b", fontSize: 12, fontWeight: 600 }}>← Liste</button>
                                        </div>
                                    )}
                                </Field>
                                <Field label="Université de rattachement" required error={errors.universite}>
                                    <div style={{ position: "relative" }}>
                                        <select className="field-focus" value={form.universite} onChange={e => set("universite", e.target.value)} style={{ ...inputStyle(errors.universite), cursor: "pointer", appearance: "none", paddingRight: 36 }}>
                                            <option value="">Sélectionner une université...</option>
                                            {universites.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                        </select>
                                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: "2rem" }}>
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.5rem" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>Résumé</p>
                            {[
                                { label: "Établissement", value: form.etablissement },
                                { label: "Email",         value: form.email },
                                { label: "Ville",         value: form.ville },
                                { label: "Université",    value: form.universite },
                                { label: "Domaine",       value: form.domaine_connaissances },
                            ].filter(i => i.value).map(({ label, value }) => (
                                <div key={label} style={{ marginBottom: 10 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>{value}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <button className="submit-btn" onClick={handleSubmit} disabled={processing || !form.etablissement || !form.ville || !form.universite}
                                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: (!form.etablissement || !form.ville || !form.universite) ? "#e2e8f0" : `linear-gradient(135deg, ${ORANGE}, #d4880f)`, color: (!form.etablissement || !form.ville || !form.universite) ? "#94a3b8" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!form.etablissement || !form.ville || !form.universite) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                            >
                                {processing ? (
                                    <><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Enregistrement...</>
                                ) : (
                                    <><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Enregistrer les modifications</>
                                )}
                            </button>
                            <button onClick={() => router.visit("/si/etablissements")}
                                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
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

Edit.layout = page => <DashboardLayout>{page}</DashboardLayout>;
