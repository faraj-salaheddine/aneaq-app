// resources/js/Pages/Expert/Matrice/Index.jsx
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";

export default function MatriceIndex({ expert, dossier, criteres = [], recommandations = [], dejaSoumis }) {
    const etab = dossier.etablissement;
    const [lignes, setLignes] = useState(
        recommandations.length > 0
            ? recommandations.map(r => ({ id: r.id, critere_id: r.critere_id ?? "", constat: r.constat ?? "", point_fort: r.point_fort ?? "", point_faible: r.point_faible ?? "", recommandation: r.recommandation ?? "", priorite: r.priorite ?? "moyenne" }))
            : [{ id: null, critere_id: "", constat: "", point_fort: "", point_faible: "", recommandation: "", priorite: "moyenne" }]
    );
    const [submitted, setSubmitted] = useState(dejaSoumis);
    const [saving, setSaving] = useState(false);

    const update = (i, f, v) => setLignes(p => p.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
    const addLigne = () => setLignes(p => [...p, { id: null, critere_id: "", constat: "", point_fort: "", point_faible: "", recommandation: "", priorite: "moyenne" }]);
    const removeLigne = i => setLignes(p => p.filter((_, idx) => idx !== i));

    const sauvegarder = async () => {
        setSaving(true);
        try { await axios.post(route("expert.matrice.sauvegarder", dossier.id), { lignes }); }
        finally { setSaving(false); }
    };
    const soumettre = () => {
        if (!confirm("Soumettre la matrice ? Elle sera verrouillée.")) return;
        router.post(route("expert.matrice.soumettre", dossier.id), {}, { onSuccess: () => setSubmitted(true) });
    };

    const inputS = { width: "100%", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 10px", fontSize: 12, color: "#0f172a", resize: "vertical", fontFamily: "inherit", background: "#fff", outline: "none" };
    const thS = { textAlign: "left", padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9", whiteSpace: "nowrap" };
    const tdS = { padding: "10px 12px", borderBottom: "1px solid #f8fafc", verticalAlign: "top" };

    return (
        <>
            <Head title="Matrice de recommandations" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
                textarea:focus, select:focus { border-color: ${BLUE} !important; outline: none; box-shadow: 0 0 0 3px ${BLUE}15; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Matrice de recommandations</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{etab?.acronyme} — {etab?.ville} · Vague {dossier.vague}</p>
                </div>

                {submitted && (
                    <div style={{ background: "#ECFDF5", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 18px", marginBottom: "1.25rem", fontSize: 13, color: "#15803d", fontWeight: 500 }}>
                        ✅ Matrice soumise et verrouillée.
                    </div>
                )}

                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animationDelay: "0.05s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recommandations par critère</h3>
                        {!submitted && (
                            <button onClick={addLigne} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${BLUE}25`, background: `${BLUE}08`, color: BLUE, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                + Ajouter une ligne
                            </button>
                        )}
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                            <thead>
                                <tr style={{ background: "#fafbfc" }}>
                                    {["Critère","Constat","Point fort","Point faible","Recommandation","Priorité",""].map((h,i) => <th key={i} style={thS}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {lignes.map((l, i) => (
                                    <tr key={i}>
                                        <td style={{ ...tdS, minWidth: 160 }}>
                                            <select value={l.critere_id ?? ""} onChange={e => update(i, "critere_id", e.target.value)} disabled={submitted} style={{ ...inputS, padding: "7px 10px" }}>
                                                <option value="">— Choisir —</option>
                                                {criteres.map(c => <option key={c.id} value={c.id}>{c.code} — {c.libelle}</option>)}
                                            </select>
                                        </td>
                                        {["constat","point_fort","point_faible","recommandation"].map(f => (
                                            <td key={f} style={{ ...tdS, minWidth: 170 }}>
                                                <textarea value={l[f]} onChange={e => update(i, f, e.target.value)} rows={2} disabled={submitted} placeholder={f.replace("_"," ")} style={inputS} />
                                            </td>
                                        ))}
                                        <td style={{ ...tdS, minWidth: 110 }}>
                                            <select value={l.priorite} onChange={e => update(i, "priorite", e.target.value)} disabled={submitted}
                                                style={{ ...inputS, color: l.priorite === "haute" ? "#ef4444" : l.priorite === "basse" ? GREEN : ORANGE, fontWeight: 600, padding: "7px 10px" }}>
                                                <option value="haute">Haute</option>
                                                <option value="moyenne">Moyenne</option>
                                                <option value="basse">Basse</option>
                                            </select>
                                        </td>
                                        <td style={tdS}>
                                            {!submitted && lignes.length > 1 && (
                                                <button onClick={() => removeLigne(i)} style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", fontSize: 12 }}>✕</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!submitted && (
                        <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
                            <button onClick={sauvegarder} disabled={saving}
                                style={{ padding: "10px 22px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                {saving ? "⏳..." : "💾 Sauvegarder"}
                            </button>
                            <button onClick={soumettre}
                                style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 14px ${BLUE}40` }}>
                                ✅ Soumettre la matrice
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
MatriceIndex.layout = page => <ExpertLayout active="dossiers">{page}</ExpertLayout>;