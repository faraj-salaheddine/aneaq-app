// resources/js/Pages/Expert/Dossiers/Index.jsx

import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";

const STATUT_META = {
    en_preparation:     { label: "En préparation",    color: "#64748b", bg: "#f1f5f9" },
    autoeval_en_cours:  { label: "Autoéval. en cours",color: "#d97706", bg: "#fffbeb" },
    autoeval_depose:    { label: "Autoéval. déposée", color: "#0891b2", bg: "#ecfeff" },
    en_evaluation:      { label: "En évaluation",     color: BLUE,      bg: "#EBF4FF" },
    visite_planifiee:   { label: "Visite planifiée",  color: ORANGE,    bg: "#FFF7ED" },
    rapport_en_attente: { label: "Rapport attendu",   color: "#ef4444", bg: "#fff1f2" },
    rapport_depose:     { label: "Rapport déposé",    color: GREEN,     bg: "#ECFDF5" },
    valide:             { label: "Validé",            color: GREEN,     bg: "#ECFDF5" },
    transfere:          { label: "Transféré",         color: GREEN,     bg: "#ECFDF5" },
    cloture:            { label: "Clôturé",           color: "#64748b", bg: "#f1f5f9" },
};

function Badge({ statut }) {
    const m = STATUT_META[statut] ?? { label: statut, color: "#64748b", bg: "#f1f5f9" };
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, color: m.color, background: m.bg }}>{m.label}</span>;
}

export default function DossiersIndex({ expert, dossiers = [] }) {
    const [tab, setTab] = useState("en_cours");
    const enCours   = dossiers.filter(d => !["valide","transfere","cloture"].includes(d.statut));
    const finalises = dossiers.filter(d =>  ["valide","transfere","cloture"].includes(d.statut));
    const list      = tab === "en_cours" ? enCours : finalises;

    const thS = { textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9" };
    const tdS = { padding: "14px 16px", borderBottom: "1px solid #f8fafc", fontSize: 13, verticalAlign: "middle" };

    return (
        <>
            <Head title="Dossiers affectés — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .expert-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .row-hover:hover { background: #f8fafc !important; cursor: pointer; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div className="expert-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Espace Expert</span>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Dossiers affectés</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a" }}>Dossiers affectés</h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                <span style={{ color: BLUE, fontWeight: 700 }}>{enCours.length}</span> en cours · <span style={{ color: "#64748b", fontWeight: 600 }}>{finalises.length}</span> finalisés
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="fade-up" style={{ display: "flex", gap: 4, marginBottom: "1.25rem", animationDelay: "0.05s" }}>
                    {[{ key: "en_cours", label: `En cours (${enCours.length})` }, { key: "finalises", label: `Finalisés (${finalises.length})` }].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                            border: "1px solid", transition: "all 0.15s",
                            borderColor: tab === t.key ? BLUE : "#e2e8f0",
                            background: tab === t.key ? `${BLUE}10` : "#fff",
                            color: tab === t.key ? BLUE : "#64748b",
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* Table */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden", animationDelay: "0.1s" }}>
                    {list.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Aucun dossier dans cette catégorie.</div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#fafbfc" }}>
                                        <th style={thS}>Établissement</th>
                                        <th style={thS}>Université</th>
                                        <th style={thS}>Domaine</th>
                                        <th style={thS}>Vague</th>
                                        <th style={thS}>Visite</th>
                                        <th style={thS}>Rôle</th>
                                        <th style={thS}>Statut</th>
                                        <th style={thS}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.map(d => (
                                        <tr key={d.id} className="row-hover" onClick={() => router.visit(route("expert.dossiers.show", d.id))} style={{ transition: "background 0.1s" }}>
                                            <td style={tdS}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${BLUE}12`, color: BLUE, fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        {d.acronyme?.slice(0,3)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{d.acronyme} — {d.ville}</div>
                                                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{d.nom}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ ...tdS, fontSize: 12, color: "#475569" }}>{d.universite}</td>
                                            <td style={tdS}><span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", color: "#475569" }}>{d.domaine_connaissances}</span></td>
                                            <td style={{ ...tdS, fontFamily: "monospace", fontSize: 12 }}>{d.vague}</td>
                                            <td style={{ ...tdS, fontSize: 12, color: d.date_visite ? ORANGE : "#94a3b8", fontFamily: "monospace" }}>
                                                {d.date_visite ? new Date(d.date_visite).toLocaleDateString("fr-FR") : "—"}
                                            </td>
                                            <td style={{ ...tdS, fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>{d.role_comite}</td>
                                            <td style={tdS}><Badge statut={d.statut} /></td>
                                            <td style={tdS} onClick={e => e.stopPropagation()}>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button onClick={() => router.visit(route("expert.dossiers.show", d.id))}
                                                        style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${GREEN}25`, background: `${GREEN}08`, color: GREEN, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                                        Voir
                                                    </button>
                                                    <button onClick={() => router.visit(route("expert.evaluation.index", d.id))}
                                                        style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${BLUE}25`, background: `${BLUE}08`, color: BLUE, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                                        Évaluer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

DossiersIndex.layout = page => <ExpertLayout active="dossiers">{page}</ExpertLayout>;