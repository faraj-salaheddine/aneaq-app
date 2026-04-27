// resources/js/Pages/Expert/Participations/Index.jsx

import { Head, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";

const STATUT_META = {
    invite:   { label: "En attente",  color: ORANGE,    bg: "#FFF7ED" },
    confirme: { label: "Confirmée",   color: GREEN,     bg: "#ECFDF5" },
    refuse:   { label: "Refusée",     color: "#ef4444", bg: "#fff1f2" },
};

function ModalRefus({ dossier, onClose }) {
    const { data, setData, post, processing } = useForm({ motif_refus: "" });
    const submit = e => {
        e.preventDefault();
        post(route("expert.participations.refuser", dossier.dossier_id), { onSuccess: onClose });
    };
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#0f172a" }}>Refuser la participation</h3>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 18 }}>{dossier.acronyme} — {dossier.ville} · Vague {dossier.vague}</p>
                <form onSubmit={submit}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Motif du refus (optionnel)</label>
                    <textarea value={data.motif_refus} onChange={e => setData("motif_refus", e.target.value)} rows={3}
                        placeholder="Expliquez la raison du refus..."
                        style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#0f172a", resize: "vertical", fontFamily: "inherit", outline: "none" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                        <button type="button" onClick={onClose}
                            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            Confirmer le refus
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ParticipationsIndex({ expert, invitations = [] }) {
    const [modalRefus, setModalRefus] = useState(null);
    const { post, processing } = useForm();

    const confirmer = dossierId => post(route("expert.participations.confirmer", dossierId));

    const enAttente  = invitations.filter(i => i.statut_participation === "invite");
    const confirmees = invitations.filter(i => i.statut_participation === "confirme");
    const refusees   = invitations.filter(i => i.statut_participation === "refuse");

    const thS = { textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9" };
    const tdS = { padding: "13px 16px", borderBottom: "1px solid #f8fafc", fontSize: 13, verticalAlign: "middle" };

    return (
        <>
            <Head title="Mes invitations — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .expert-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .row-hover:hover { background: #f8fafc !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>

            <div className="expert-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Espace Expert</span>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Mes invitations</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${ORANGE}, #d97706)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a" }}>Demandes de participation</h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                <span style={{ color: ORANGE, fontWeight: 700 }}>{enAttente.length}</span> invitation(s) en attente · {invitations.length} au total
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem", animationDelay: "0.05s" }}>
                    {[
                        { label: "En attente",  value: enAttente.length,  color: ORANGE,    bg: "#FFF7ED" },
                        { label: "Confirmées",  value: confirmees.length, color: GREEN,     bg: "#ECFDF5" },
                        { label: "Refusées",    value: refusees.length,   color: "#ef4444", bg: "#fff1f2" },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
                            </div>
                            <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden", animationDelay: "0.1s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Toutes les invitations</h3>
                        {enAttente.length > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#FFF7ED", color: ORANGE }}>
                                {enAttente.length} action(s) requise(s)
                            </span>
                        )}
                    </div>

                    {invitations.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                            Aucune invitation reçue.
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                                <thead>
                                    <tr style={{ background: "#fafbfc" }}>
                                        <th style={thS}>Établissement</th>
                                        <th style={thS}>Université</th>
                                        <th style={thS}>Vague</th>
                                        <th style={thS}>Date invitation</th>
                                        <th style={thS}>Statut</th>
                                        <th style={thS}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations.map(inv => {
                                        const sm = STATUT_META[inv.statut_participation] ?? STATUT_META.invite;
                                        return (
                                            <tr key={inv.dossier_id} className="row-hover" style={{ transition: "background 0.1s" }}>
                                                <td style={tdS}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                                                            {inv.acronyme?.slice(0, 3)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{inv.acronyme} — {inv.ville}</div>
                                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{inv.domaine_connaissances}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ ...tdS, fontSize: 12, color: "#475569" }}>{inv.universite}</td>
                                                <td style={{ ...tdS, fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{inv.vague}</td>
                                                <td style={{ ...tdS, fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>
                                                    {inv.date_invitation ? new Date(inv.date_invitation).toLocaleDateString("fr-FR") : "—"}
                                                </td>
                                                <td style={tdS}>
                                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, color: sm.color, background: sm.bg }}>{sm.label}</span>
                                                </td>
                                                <td style={tdS}>
                                                    {inv.statut_participation === "invite" ? (
                                                        <div style={{ display: "flex", gap: 6 }}>
                                                            <button onClick={() => confirmer(inv.dossier_id)} disabled={processing}
                                                                style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${GREEN}30`, background: `${GREEN}08`, color: GREEN, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                                ✔ Confirmer
                                                            </button>
                                                            <button onClick={() => setModalRefus(inv)}
                                                                style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                                ✖ Refuser
                                                            </button>
                                                        </div>
                                                    ) : inv.statut_participation === "confirme" ? (
                                                        <button onClick={() => router.visit(route("expert.dossiers.show", inv.dossier_id))}
                                                            style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${BLUE}25`, background: `${BLUE}08`, color: BLUE, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                            Voir dossier →
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{inv.motif_refus ? `"${inv.motif_refus.slice(0, 30)}…"` : "—"}</span>
                                                    )}
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

            {modalRefus && <ModalRefus dossier={modalRefus} onClose={() => setModalRefus(null)} />}
        </>
    );
}

ParticipationsIndex.layout = page => <ExpertLayout active="participations">{page}</ExpertLayout>;