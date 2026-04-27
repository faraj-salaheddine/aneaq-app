// resources/js/Pages/Expert/Rapports/Index.jsx

import { Head, router } from "@inertiajs/react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";
const RAPPORT_META = {
    depose: { label: "Déposé",  color: ORANGE,    bg: "#FFF7ED" },
    valide: { label: "Validé",  color: GREEN,     bg: "#ECFDF5" },
    rejete: { label: "Rejeté",  color: "#ef4444", bg: "#fff1f2" },
};

export default function RapportsIndex({ expert, rapports = [], dossiersEnAttente = [] }) {
    const thS = { textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9" };
    const tdS = { padding: "13px 16px", borderBottom: "1px solid #f8fafc", fontSize: 13, verticalAlign: "middle" };

    return (
        <>
            <Head title="Mes rapports — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .expert-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .row-hover:hover { background: #f8fafc !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div className="expert-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mes rapports</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Dépôt et suivi des rapports finaux d'évaluation</p>
                </div>

                {dossiersEnAttente.length > 0 && (
                    <div className="fade-up" style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 14, padding: "16px 20px", marginBottom: "1.25rem", animationDelay: "0.05s" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 10 }}>⏳ Rapports en attente ({dossiersEnAttente.length})</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {dossiersEnAttente.map(d => (
                                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid #fecaca" }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{d.acronyme} — {d.ville} · Vague {d.vague}</div>
                                    <button onClick={() => router.visit(route("expert.rapports.create", d.id))}
                                        style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                        📤 Déposer maintenant
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animationDelay: "0.1s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        Historique des dépôts
                    </div>
                    {rapports.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Aucun rapport déposé.</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead><tr style={{ background: "#fafbfc" }}>
                                <th style={thS}>Établissement</th>
                                <th style={thS}>Vague</th>
                                <th style={thS}>Fichier</th>
                                <th style={thS}>Taille</th>
                                <th style={thS}>Date</th>
                                <th style={thS}>Statut</th>
                                <th style={thS}>Actions</th>
                            </tr></thead>
                            <tbody>
                                {rapports.map(r => {
                                    const sm = RAPPORT_META[r.statut] ?? RAPPORT_META.depose;
                                    const kb = r.file_size / 1024;
                                    const taille = kb < 1024 ? `${kb.toFixed(1)} Ko` : `${(kb/1024).toFixed(1)} Mo`;
                                    return (
                                        <tr key={r.id} className="row-hover" style={{ transition: "background 0.1s" }}>
                                            <td style={tdS}><strong>{r.acronyme} — {r.ville}</strong></td>
                                            <td style={{ ...tdS, fontFamily: "monospace", fontSize: 12 }}>{r.vague}</td>
                                            <td style={{ ...tdS, fontSize: 11, color: "#64748b", maxWidth: 200 }}><span title={r.original_name}>{r.original_name?.length > 28 ? r.original_name.slice(0,28) + "…" : r.original_name}</span></td>
                                            <td style={{ ...tdS, fontFamily: "monospace", fontSize: 11 }}>{taille}</td>
                                            <td style={{ ...tdS, fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                                            <td style={tdS}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, color: sm.color, background: sm.bg }}>{sm.label}</span></td>
                                            <td style={tdS}>
                                                <button onClick={() => router.visit(route("expert.rapports.telecharger", r.id))}
                                                    style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${BLUE}25`, background: `${BLUE}08`, color: BLUE, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                                    ⬇ Télécharger
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

RapportsIndex.layout = page => <ExpertLayout active="rapports">{page}</ExpertLayout>;