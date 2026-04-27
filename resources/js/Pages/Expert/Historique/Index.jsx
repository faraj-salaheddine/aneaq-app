// resources/js/Pages/Expert/Historique/Index.jsx
import { Head, router } from "@inertiajs/react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";

const SP_META = {
    invite:   { label: "Invité",    color: ORANGE,    bg: "#FFF7ED" },
    confirme: { label: "Confirmé",  color: GREEN,     bg: "#ECFDF5" },
    refuse:   { label: "Refusé",    color: "#ef4444", bg: "#fff1f2" },
};
const SR_META = {
    depose: { label: "Déposé", color: ORANGE,    bg: "#FFF7ED" },
    valide: { label: "Validé", color: GREEN,     bg: "#ECFDF5" },
    rejete: { label: "Rejeté", color: "#ef4444", bg: "#fff1f2" },
};

function Badge({ meta }) {
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, color: meta.color, background: meta.bg }}>{meta.label}</span>;
}

export default function HistoriqueIndex({ expert, participations = [] }) {
    const total    = participations.length;
    const confirme = participations.filter(p => p.statut_participation === "confirme").length;
    const clotures = participations.filter(p => ["valide","transfere","cloture"].includes(p.statut)).length;

    const thS = { textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9", whiteSpace: "nowrap" };
    const tdS = { padding: "13px 16px", borderBottom: "1px solid #f8fafc", fontSize: 13, verticalAlign: "middle" };

    return (
        <>
            <Head title="Historique des participations" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
                .row-hover:hover { background: #f8fafc !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Historique des participations</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Toutes vos missions d'évaluation ANEAQ</p>
                </div>

                {/* Stats */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem", animationDelay: "0.05s" }}>
                    {[
                        { label: "Total missions",  value: total,    color: BLUE   },
                        { label: "Confirmées",       value: confirme, color: GREEN  },
                        { label: "Clôturées",        value: clotures, color: "#64748b" },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <span style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</span>
                            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animationDelay: "0.1s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        🕒 Toutes les missions ({total})
                    </div>
                    {total === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Aucune participation enregistrée.</div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#fafbfc" }}>
                                        <th style={thS}>Établissement</th>
                                        <th style={thS}>Université</th>
                                        <th style={thS}>Vague</th>
                                        <th style={thS}>Rôle</th>
                                        <th style={thS}>Invitation</th>
                                        <th style={thS}>Participation</th>
                                        <th style={thS}>Rapport</th>
                                        <th style={thS}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participations.map((p, i) => {
                                        const sp = SP_META[p.statut_participation] ?? SP_META.invite;
                                        const sr = p.rapport_statut ? (SR_META[p.rapport_statut] ?? null) : null;
                                        return (
                                            <tr key={i} className="row-hover" style={{ transition: "background 0.1s" }}>
                                                <td style={tdS}>
                                                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{p.acronyme} — {p.ville}</div>
                                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{p.nom}</div>
                                                </td>
                                                <td style={{ ...tdS, fontSize: 12, color: "#475569", maxWidth: 160 }}>{p.universite}</td>
                                                <td style={{ ...tdS, fontFamily: "monospace", fontSize: 12 }}>{p.vague}</td>
                                                <td style={{ ...tdS, fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>{p.role_comite}</td>
                                                <td style={{ ...tdS, fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>
                                                    {p.date_invitation ? new Date(p.date_invitation).toLocaleDateString("fr-FR") : "—"}
                                                </td>
                                                <td style={tdS}><Badge meta={sp} /></td>
                                                <td style={tdS}>{sr ? <Badge meta={sr} /> : <span style={{ fontSize: 11, color: "#94a3b8" }}>Non déposé</span>}</td>
                                                <td style={tdS}>
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        <button onClick={() => router.visit(route("expert.dossiers.show", p.id))}
                                                            style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${BLUE}25`, background: `${BLUE}08`, color: BLUE, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                                            Voir
                                                        </button>
                                                        {p.rapport_id && (
                                                            <button onClick={() => router.visit(route("expert.rapports.telecharger", p.rapport_id))}
                                                                style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${GREEN}25`, background: `${GREEN}08`, color: GREEN, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                                                ⬇
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
HistoriqueIndex.layout = page => <ExpertLayout active="historique">{page}</ExpertLayout>;