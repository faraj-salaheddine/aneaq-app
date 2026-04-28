// resources/js/Pages/Expert/Profil/Edit.jsx

import { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";

const Field = ({ label, required, optional, error, children }) => (
    <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>
            {label}
            {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
            {optional && <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 5 }}>(optionnel)</span>}
        </label>
        {children}
        {error && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{error}</span>}
    </div>
);

const inputS = (err) => ({
    width: "100%", padding: "10px 14px",
    border: err ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
    borderRadius: 9, fontSize: 13, color: "#0f172a",
    background: "#fafbfc", outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
});

const SectionCard = ({ title, subtitle, color, icon, children }) => (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">{icon}</svg>
            </div>
            <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h3>
                {subtitle && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

const FileUpload = ({ label, file, existing, onChange }) => {
    const ref = useRef();
    return (
        <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
            {existing && !file && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: `${BLUE}06`, border: `1px solid ${BLUE}15`, borderRadius: 7, marginBottom: 6 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ fontSize: 11, color: BLUE, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{existing}</span>
                </div>
            )}
            <div onClick={() => ref.current.click()}
                style={{ border: `2px dashed ${file ? GREEN : "#e2e8f0"}`, borderRadius: 9, padding: "12px 14px", background: file ? `${GREEN}05` : "#fafbfc", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}
                onMouseEnter={e => { if (!file) e.currentTarget.style.borderColor = "#94a3b8"; }}
                onMouseLeave={e => { if (!file) e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: file ? `${GREEN}15` : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {file
                        ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {file
                        ? <p style={{ fontSize: 12, fontWeight: 600, color: GREEN, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                        : <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{existing ? "Remplacer le fichier" : "Cliquer pour uploader"}</p>
                    }
                </div>
                {file && (
                    <button type="button" onClick={e => { e.stopPropagation(); onChange(null); }}
                        style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "3px 6px", cursor: "pointer", color: "#ef4444", flexShrink: 0 }}>
                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                )}
            </div>
            <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => onChange(e.target.files[0] || null)} />
        </div>
    );
};

export default function ProfilEdit({ expert, documents = {} }) {
    const existingDocs = {
        cin:         documents.cin?.[0]?.original_name ?? null,
        contract:    documents.contract?.[0]?.original_name ?? null,
        carte_grise: documents.carte_grise?.[0]?.original_name ?? null,
        rib:         documents.rib?.[0]?.original_name ?? null,
    };

    const [form, setForm] = useState({
        telephone:          expert?.telephone         ?? "",
        ville:              expert?.ville             ?? "",
        pays:               expert?.pays              ?? "",
        specialite:         expert?.specialite        ?? "",
        grade:              expert?.grade             ?? "",
        fonction_actuelle:  expert?.fonction_actuelle ?? "",
        universite_ou_departement_ministeriel: expert?.universite_ou_departement_ministeriel ?? "",
        type_etablissement: expert?.type_etablissement ?? "",
        etablissement:      expert?.etablissement     ?? "",
        diplomes_obtenus:   expert?.diplomes_obtenus  ?? "",
        responsabilite:     expert?.responsabilite    ?? "",
        cin_number:         expert?.cin_number        ?? "",
        rib:                expert?.rib               ?? "",
        password:           "",
        password_confirmation: "",
    });

    const [files, setFiles]       = useState({ cin_file: null, contract_file: null, carte_grise_file: null, rib_file: null });
    const [errors, setErrors]     = useState({});
    const [processing, setProc]   = useState(false);
    const [showPwd, setShowPwd]   = useState(false);

    const set     = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const setFile = (k, v) => setFiles(f => ({ ...f, [k]: v }));

    const ribLength   = form.rib.replace(/\D/g, "").length;
    const ribComplete = ribLength === 24;

    const handleRIB = v => set("rib", v.replace(/\D/g, "").slice(0, 24));

    const handleSubmit = () => {
        setProc(true);
        const data = new FormData();
        data.append("_method", "PUT");
        Object.entries(form).forEach(([k, v]) => { if (v !== "") data.append(k, v); });
        Object.entries(files).forEach(([k, v]) => { if (v) data.append(k, v); });

        router.post(route("expert.profil.update"), data, {
            forceFormData: true,
            onSuccess: () => router.visit(route("expert.profil.show")),
            onError: e => { setErrors(e); setProc(false); },
        });
    };

    return (
        <>
            <Head title="Modifier mon profil" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
                .fi:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,0.1) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.25s ease both; }
            `}</style>

            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => router.visit(route("expert.profil.show"))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 12, fontWeight: 500, padding: 0, display: "flex", alignItems: "center", gap: 4 }}
                            onMouseEnter={e => e.currentTarget.style.color = BLUE}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                            Mon profil
                        </button>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Modifier</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Modifier mon profil</h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0" }}>{expert?.prenom} {expert?.nom} · ID #{expert?.id}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>

                    {/* Colonne gauche */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Contact */}
                        <div className="fade-up" style={{ animationDelay: "0.04s" }}>
                            <SectionCard title="Coordonnées" subtitle="Informations de contact" color={GREEN}
                                icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <Field label="Téléphone" optional error={errors.telephone}>
                                        <input className="fi" style={inputS(errors.telephone)} type="tel" placeholder="+212 6XX XXX XXX" value={form.telephone} onChange={e => set("telephone", e.target.value)} />
                                    </Field>
                                    <Field label="Ville" optional error={errors.ville}>
                                        <input className="fi" style={inputS(errors.ville)} type="text" placeholder="Ex: Rabat" value={form.ville} onChange={e => set("ville", e.target.value)} />
                                    </Field>
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <Field label="Pays" optional error={errors.pays}>
                                        <input className="fi" style={inputS(errors.pays)} type="text" placeholder="Ex: Maroc" value={form.pays} onChange={e => set("pays", e.target.value)} />
                                    </Field>
                                </div>
                            </SectionCard>
                        </div>

                        {/* Profil académique */}
                        <div className="fade-up" style={{ animationDelay: "0.06s" }}>
                            <SectionCard title="Profil académique" subtitle="Informations professionnelles" color="#7e22ce"
                                icon={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <Field label="Spécialité" optional error={errors.specialite}>
                                        <input className="fi" style={inputS(errors.specialite)} type="text" value={form.specialite} onChange={e => set("specialite", e.target.value)} />
                                    </Field>
                                    <Field label="Grade" optional error={errors.grade}>
                                        <input className="fi" style={inputS(errors.grade)} type="text" value={form.grade} onChange={e => set("grade", e.target.value)} />
                                    </Field>
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <Field label="Université / Département ministériel" optional error={errors.universite_ou_departement_ministeriel}>
                                        <input className="fi" style={inputS(errors.universite_ou_departement_ministeriel)} type="text" value={form.universite_ou_departement_ministeriel} onChange={e => set("universite_ou_departement_ministeriel", e.target.value)} />
                                    </Field>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                                    <Field label="Type établissement" optional error={errors.type_etablissement}>
                                        <select className="fi" style={{ ...inputS(errors.type_etablissement), cursor: "pointer" }} value={form.type_etablissement} onChange={e => set("type_etablissement", e.target.value)}>
                                            <option value="">Sélectionner...</option>
                                            <option>Etablissement public</option>
                                            <option>Etablissements publics ne relevant pas des universités</option>
                                            <option>Etablissement universitaire Privé</option>
                                            <option>Etablissements privés ne relevant pas des universités</option>
                                        </select>
                                    </Field>
                                    <Field label="Établissement" optional error={errors.etablissement}>
                                        <input className="fi" style={inputS(errors.etablissement)} type="text" value={form.etablissement} onChange={e => set("etablissement", e.target.value)} />
                                    </Field>
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <Field label="Diplômes obtenus" optional error={errors.diplomes_obtenus}>
                                        <textarea className="fi" style={{ ...inputS(errors.diplomes_obtenus), resize: "vertical", minHeight: 70 }} value={form.diplomes_obtenus} onChange={e => set("diplomes_obtenus", e.target.value)} />
                                    </Field>
                                </div>
                            </SectionCard>
                        </div>

                        {/* CIN + RIB */}
                        <div className="fade-up" style={{ animationDelay: "0.08s" }}>
                            <SectionCard title="Identité & Bancaire" subtitle="CIN et RIB" color={BLUE}
                                icon={<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <Field label="Numéro CIN" optional error={errors.cin_number}>
                                        <input className="fi" style={{ ...inputS(errors.cin_number), fontFamily: "'DM Mono', monospace" }} type="text" placeholder="AB123456" value={form.cin_number} onChange={e => set("cin_number", e.target.value)} />
                                    </Field>
                                    <FileUpload label="Photo / Scan CIN" file={files.cin_file} existing={existingDocs.cin} onChange={v => setFile("cin_file", v)} />
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <Field label="RIB Bancaire (24 chiffres)" optional error={errors.rib}>
                                        <div style={{ position: "relative" }}>
                                            <input className="fi"
                                                style={{ ...inputS(errors.rib), paddingLeft: 12, paddingRight: 64, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", border: ribComplete ? `1.5px solid ${GREEN}` : ribLength > 0 ? `1.5px solid ${ORANGE}` : "1px solid #e2e8f0" }}
                                                type="text" placeholder="007780000012345678901234" maxLength={24}
                                                value={form.rib} onChange={e => handleRIB(e.target.value)} />
                                            <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: "2px 8px", borderRadius: 99, background: ribComplete ? `${GREEN}15` : ribLength > 0 ? `${ORANGE}15` : "#f1f5f9" }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: ribComplete ? GREEN : ribLength > 0 ? ORANGE : "#94a3b8" }}>{ribLength}/24</span>
                                            </div>
                                        </div>
                                        {ribLength > 0 && (
                                            <div style={{ marginTop: 4, height: 3, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                                                <div style={{ height: "100%", borderRadius: 99, width: `${(ribLength / 24) * 100}%`, background: ribComplete ? GREEN : ORANGE, transition: "width 0.2s, background 0.2s" }} />
                                            </div>
                                        )}
                                    </Field>
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <FileUpload label="Document RIB" file={files.rib_file} existing={existingDocs.rib} onChange={v => setFile("rib_file", v)} />
                                </div>
                            </SectionCard>
                        </div>

                        {/* Documents contrat + carte grise */}
                        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
                            <SectionCard title="Documents" subtitle="Contrat et carte grise" color={ORANGE}
                                icon={<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <FileUpload label="Document du contrat" file={files.contract_file} existing={existingDocs.contract} onChange={v => setFile("contract_file", v)} />
                                    <FileUpload label="Carte grise du véhicule" file={files.carte_grise_file} existing={existingDocs.carte_grise} onChange={v => setFile("carte_grise_file", v)} />
                                </div>
                            </SectionCard>
                        </div>
                    </div>

                    {/* Colonne droite — sticky */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: "2rem" }}>

                        {/* Mot de passe */}
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mot de passe</h3>
                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>Laisser vide pour ne pas modifier</p>
                                </div>
                            </div>
                            <Field label="Nouveau mot de passe" optional error={errors.password}>
                                <div style={{ position: "relative" }}>
                                    <input className="fi"
                                        type={showPwd ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => set("password", e.target.value)}
                                        style={{ ...inputS(errors.password), paddingRight: 40 }} />
                                    <button type="button" onClick={() => setShowPwd(s => !s)}
                                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: showPwd ? BLUE : "#94a3b8" }}>
                                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            {showPwd ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                                        </svg>
                                    </button>
                                </div>
                            </Field>
                            <div style={{ marginTop: 12 }}>
                                <Field label="Confirmer le mot de passe" optional error={errors.password_confirmation}>
                                    <input className="fi" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={e => set("password_confirmation", e.target.value)} style={inputS(errors.password_confirmation)} />
                                </Field>
                            </div>
                        </div>

                        {/* Résumé */}
                        <div style={{ background: `linear-gradient(135deg, ${BLUE}06, ${GREEN}04)`, border: `1px solid ${BLUE}12`, borderRadius: 16, padding: "1.25rem" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>Résumé des changements</p>
                            {[
                                { l: "Téléphone",   v: form.telephone },
                                { l: "Ville",        v: form.ville },
                                { l: "Spécialité",   v: form.specialite },
                                { l: "Grade",        v: form.grade },
                                { l: "CIN",          v: form.cin_number },
                                { l: "RIB",          v: ribComplete ? form.rib : null, mono: true },
                            ].filter(i => i.v).map(i => (
                                <div key={i.l} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{i.l}</span>
                                    <span style={{ fontSize: 11, color: "#374151", fontWeight: 600, textAlign: "right", wordBreak: "break-all", fontFamily: i.mono ? "'DM Mono', monospace" : "inherit" }}>{i.v}</span>
                                </div>
                            ))}
                        </div>

                        {/* Boutons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <button onClick={handleSubmit} disabled={processing}
                                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: processing ? "#6b9fd4" : `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: processing ? "not-allowed" : "pointer", boxShadow: processing ? "none" : `0 4px 14px ${BLUE}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                {processing
                                    ? <><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Enregistrement...</>
                                    : <><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Enregistrer</>
                                }
                            </button>
                            <button onClick={() => router.visit(route("expert.profil.show"))}
                                style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ProfilEdit.layout = page => <ExpertLayout active="profil">{page}</ExpertLayout>;