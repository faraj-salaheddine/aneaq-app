import { Head, router, useForm } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75";

function Field({ label, name, type = "text", value, onChange, error }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
            </label>
            <input
                type={type}
                value={value || ""}
                onChange={e => onChange(name, e.target.value)}
                style={{ width: "100%", padding: "10px 14px", border: `1px solid ${error ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 9, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff" }}
            />
            {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>❌ {error}</p>}
        </div>
    );
}

export default function EtablissementProfilEdit({ etablissement, onboarding }) {
    const { data, setData, patch, processing, errors } = useForm({
        adresse:               onboarding?.adresse               ?? "",
        site_web:              onboarding?.site_web              ?? "",
        telephone:             onboarding?.telephone             ?? "",
        responsable_nom:       onboarding?.responsable_nom       ?? "",
        responsable_fonction:  onboarding?.responsable_fonction  ?? "",
        responsable_email:     onboarding?.responsable_email     ?? "",
        responsable_telephone: onboarding?.responsable_telephone ?? "",
    });

    const nom = etablissement.etablissement_2 || etablissement.etablissement || etablissement.acronyme;

    return (
        <>
            <Head title="Modifier le profil" />
            <style>{`
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
                input:focus, textarea:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px ${BLUE}15; outline: none; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <button onClick={() => router.visit(route("etablissement.profil.show"))}
                        style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 8 }}>
                        ← Retour
                    </button>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Modifier le profil</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{nom}</p>
                </div>

                <form onSubmit={e => { e.preventDefault(); patch(route("etablissement.profil.update")); }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

                        {/* Coordonnées */}
                        <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.05s" }}>
                            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                🏛️ Coordonnées établissement
                            </div>
                            <div style={{ padding: "1.5rem" }}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Adresse
                                    </label>
                                    <textarea
                                        value={data.adresse}
                                        onChange={e => setData("adresse", e.target.value)}
                                        rows={3}
                                        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical" }}
                                    />
                                </div>
                                <Field label="Site web"   name="site_web"   type="url"  value={data.site_web}   onChange={setData} error={errors.site_web} />
                                <Field label="Téléphone"  name="telephone"              value={data.telephone}  onChange={setData} error={errors.telephone} />
                            </div>
                        </div>

                        {/* Responsable */}
                        <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.1s" }}>
                            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                👤 Responsable / Chef de comité
                            </div>
                            <div style={{ padding: "1.5rem" }}>
                                <Field label="Nom et prénom" name="responsable_nom"       value={data.responsable_nom}       onChange={setData} error={errors.responsable_nom} />
                                <Field label="Fonction"      name="responsable_fonction"   value={data.responsable_fonction}  onChange={setData} error={errors.responsable_fonction} />
                                <Field label="Email"         name="responsable_email" type="email" value={data.responsable_email} onChange={setData} error={errors.responsable_email} />
                                <Field label="Téléphone"     name="responsable_telephone"  value={data.responsable_telephone} onChange={setData} error={errors.responsable_telephone} />
                            </div>
                        </div>
                    </div>

                    <div className="fade-up" style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: 12, animationDelay: "0.15s" }}>
                        <button type="button" onClick={() => router.visit(route("etablissement.profil.show"))}
                            style={{ padding: "11px 24px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            style={{ padding: "11px 28px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, color: "#fff", cursor: processing ? "wait" : "pointer", fontSize: 13, fontWeight: 600, boxShadow: `0 4px 14px ${BLUE}40` }}>
                            {processing ? "⏳ Enregistrement..." : "💾 Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

EtablissementProfilEdit.layout = page => <EtablissementLayout active="profil">{page}</EtablissementLayout>;
