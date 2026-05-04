import { Head, router } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75";

function InfoRow({ label, value }) {
    return (
        <div style={{ display: "flex", padding: "11px 0", borderBottom: "1px solid #f8fafc" }}>
            <div style={{ width: 210, fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 1 }}>{label}</div>
            <div style={{ flex: 1, fontSize: 13, color: value ? "#0f172a" : "#cbd5e1", fontStyle: value ? "normal" : "italic" }}>
                {value || "Non renseigné"}
            </div>
        </div>
    );
}

export default function EtablissementProfilShow({ etablissement, onboarding }) {
    const nom = etablissement.etablissement_2 || etablissement.etablissement || etablissement.acronyme || "Établissement";
    const complete = onboarding?.statut === "complete";

    return (
        <>
            <Head title="Mon profil" />
            <style>{`
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

                {/* Header */}
                <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mon profil</h1>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{nom}</p>
                    </div>
                    <button onClick={() => router.visit(route("etablissement.profil.edit"))}
                        style={{ padding: "10px 22px", background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 12px ${BLUE}40` }}>
                        ✏️ Modifier
                    </button>
                </div>

                {/* Statut */}
                {!complete && (
                    <div className="fade-up" style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: "1.25rem", fontSize: 13, color: "#ef4444", fontWeight: 500, animationDelay: "0.03s" }}>
                        ⚠️ Profil incomplet —{" "}
                        <button onClick={() => router.visit(route("etablissement.profil.edit"))}
                            style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                            Compléter maintenant →
                        </button>
                    </div>
                )}
                {complete && (
                    <div className="fade-up" style={{ background: "#ECFDF5", border: "1px solid #a7f3d0", borderRadius: 12, padding: "14px 18px", marginBottom: "1.25rem", fontSize: 13, color: GREEN, fontWeight: 500, animationDelay: "0.03s" }}>
                        ✅ Profil complété le {new Date(onboarding.completed_at).toLocaleDateString("fr-FR")}
                    </div>
                )}

                {/* Infos établissement */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "1.25rem", animationDelay: "0.06s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        🏛️ Informations établissement
                    </div>
                    <div style={{ padding: "4px 1.5rem 8px" }}>
                        <InfoRow label="Nom complet" value={etablissement.etablissement_2 || etablissement.etablissement} />
                        <InfoRow label="Acronyme"    value={etablissement.acronyme} />
                        <InfoRow label="Ville"       value={etablissement.ville} />
                        <InfoRow label="Université"  value={etablissement.universite} />
                        <InfoRow label="Email"       value={etablissement.email} />
                        <InfoRow label="Adresse"     value={onboarding?.adresse} />
                        <InfoRow label="Site web"    value={onboarding?.site_web} />
                        <InfoRow label="Téléphone"   value={onboarding?.telephone} />
                    </div>
                </div>

                {/* Responsable */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.1s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        👤 Responsable / Chef de comité
                    </div>
                    <div style={{ padding: "4px 1.5rem 8px" }}>
                        <InfoRow label="Nom et prénom" value={onboarding?.responsable_nom} />
                        <InfoRow label="Fonction"      value={onboarding?.responsable_fonction} />
                        <InfoRow label="Email"         value={onboarding?.responsable_email} />
                        <InfoRow label="Téléphone"     value={onboarding?.responsable_telephone} />
                    </div>
                </div>

            </div>
        </>
    );
}

EtablissementProfilShow.layout = page => <EtablissementLayout active="profil">{page}</EtablissementLayout>;
