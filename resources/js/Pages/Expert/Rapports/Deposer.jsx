// resources/js/Pages/Expert/Rapports/Deposer.jsx
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useRef } from "react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75";

export default function RapportDeposer({ expert, dossier, rapportExistant }) {
    const etab = dossier.etablissement;
    const { data, setData, post, processing, errors, progress } = useForm({ rapport: null });
    const [drag, setDrag] = useState(false);
    const [preview, setPreview] = useState(null);
    const ref = useRef();

    const handleFile = f => {
        if (!f) return;
        setData("rapport", f);
        const kb = f.size / 1024;
        setPreview({ name: f.name, size: kb < 1024 ? `${kb.toFixed(1)} Ko` : `${(kb/1024).toFixed(1)} Mo` });
    };

    return (
        <>
            <Head title="Déposer un rapport" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)", fontFamily: "'DM Sans', sans-serif" }}>
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <button onClick={() => router.visit(route("expert.rapports.index"))} style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Retour</button>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Déposer un rapport final</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{etab?.acronyme} — {etab?.ville} · Vague {dossier.vague}</p>
                </div>

                {rapportExistant?.statut === "rejete" && (
                    <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: "1.25rem", fontSize: 13, color: "#ef4444", fontWeight: 500 }}>
                        ❌ Rapport rejeté. Motif : {rapportExistant.motif_rejet}. Veuillez déposer une nouvelle version.
                    </div>
                )}

                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", maxWidth: 600, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animationDelay: "0.05s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        📤 Téléverser le rapport
                    </div>
                    <div style={{ padding: "1.5rem" }}>
                        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fffbeb", borderRadius: 8, borderLeft: `3px solid ${ORANGE ?? "#EF9F27"}`, fontSize: 12.5, color: "#92400e" }}>
                            Formats acceptés : <strong>PDF (.pdf)</strong>, <strong>Word (.doc, .docx)</strong> · Taille maximale : <strong>50 Mo</strong>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); post(route("expert.rapports.store", dossier.id)); }}>
                            <div
                                onClick={() => ref.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                                style={{ border: `2px dashed ${drag ? BLUE : preview ? GREEN : "#e2e8f0"}`, borderRadius: 12, padding: "2.5rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: drag ? `${BLUE}04` : preview ? `${GREEN}04` : "#fafbfc" }}>
                                <input ref={ref} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                                {preview ? (
                                    <>
                                        <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{preview.name}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{preview.size}</div>
                                        <div style={{ fontSize: 11, color: BLUE, marginTop: 8 }}>Cliquez pour changer le fichier</div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 36, marginBottom: 8 }}>📎</div>
                                        <div style={{ fontSize: 14, color: "#64748b" }}>
                                            Glissez-déposez votre rapport ici<br/>ou <strong style={{ color: BLUE }}>cliquez pour parcourir</strong>
                                        </div>
                                    </>
                                )}
                            </div>
                            {errors.rapport && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>❌ {errors.rapport}</p>}
                            {progress && (
                                <div style={{ marginTop: 10, height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`, width: `${progress.percentage}%` }} />
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => router.visit(route("expert.rapports.index"))}
                                    style={{ flex: 1, padding: "11px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                    Annuler
                                </button>
                                <button type="submit" disabled={!data.rapport || processing}
                                    style={{ flex: 2, padding: "11px", borderRadius: 9, border: "none", background: !data.rapport ? "#e2e8f0" : `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, color: !data.rapport ? "#94a3b8" : "#fff", cursor: !data.rapport ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, boxShadow: data.rapport ? `0 4px 14px ${BLUE}40` : "none" }}>
                                    {processing ? "⏳ Dépôt en cours..." : "📤 Déposer le rapport"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
RapportDeposer.layout = page => <ExpertLayout active="rapports">{page}</ExpertLayout>;

// ── ORANGE const needed above ──
const ORANGE = "#EF9F27";