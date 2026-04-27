// resources/js/Pages/Expert/Evaluations/Index.jsx

import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75";

function ScoreBtn({ value, selected, onClick, disabled }) {
    const isHigh = value >= 4;
    const color  = isHigh ? "#d97706" : BLUE;
    return (
        <button onClick={() => !disabled && onClick(value)} style={{
            width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 700,
            border: `1px solid ${selected ? color : "#e2e8f0"}`,
            background: selected ? (isHigh ? "#FFF7ED" : "#EBF4FF") : "#fff",
            color: selected ? color : "#94a3b8",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s", opacity: disabled ? 0.6 : 1,
        }}>{value}</button>
    );
}

export default function EvaluationsIndex({ expert, dossier, axes = [], evaluations = {}, progression, dejaSoumis }) {
    const etab = dossier.etablissement;
    const [evals, setEvals] = useState(() => {
        const m = {};
        Object.values(evaluations).forEach(e => { m[e.critere_id] = { note: e.note, commentaire: e.commentaire ?? "" }; });
        return m;
    });
    const [saved, setSaved]       = useState(false);
    const [saving, setSaving]     = useState(false);
    const [submitted, setSubmitted] = useState(dejaSoumis);

    const update = (id, field, val) => { setEvals(p => ({ ...p, [id]: { ...(p[id] ?? {}), [field]: val } })); setSaved(false); };
    const totalNotes = Object.values(evals).filter(e => e.note).length;

    const sauvegarder = async () => {
        setSaving(true);
        const payload = Object.entries(evals).map(([critere_id, v]) => ({ critere_id: parseInt(critere_id), ...v }));
        try {
            await axios.post(route("expert.evaluation.sauvegarder", dossier.id), { evaluations: payload });
            setSaved(true);
        } finally { setSaving(false); }
    };

    const soumettre = () => {
        if (!confirm("Confirmer la soumission ? Les notes seront verrouillées et consultables par la DEE.")) return;
        router.post(route("expert.evaluation.soumettre", dossier.id), {}, { onSuccess: () => setSubmitted(true) });
    };

    return (
        <>
            <Head title="Évaluation quantitative" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .expert-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .eval-textarea { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; width: 100%; font-family: inherit; font-size: 12px; color: #0f172a; resize: vertical; outline: none; transition: border-color 0.15s; }
                .eval-textarea:focus { border-color: ${BLUE}; box-shadow: 0 0 0 3px ${BLUE}15; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>

            <div className="expert-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Espace Expert</span>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <button onClick={() => router.visit(route("expert.dossiers.show", dossier.id))} style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{etab?.acronyme} {etab?.ville}</button>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Évaluation quantitative</span>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Évaluation quantitative</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{etab?.acronyme} — {etab?.ville} · {etab?.universite} · Vague {dossier.vague}</p>
                </div>

                {/* Progression */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 20px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 20, animationDelay: "0.05s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{totalNotes} critère(s) noté(s)</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: progression >= 100 ? GREEN : BLUE }}>{progression}%</span>
                        </div>
                        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", background: progression >= 100 ? GREEN : `linear-gradient(90deg, ${BLUE}, ${GREEN})`, width: `${progression}%`, transition: "width 0.5s ease", borderRadius: 3 }} />
                        </div>
                    </div>
                    {submitted ? (
                        <span style={{ fontSize: 12, padding: "5px 14px", borderRadius: 99, color: GREEN, background: "#ECFDF5", fontWeight: 600, whiteSpace: "nowrap" }}>✅ Soumise à la DEE</span>
                    ) : saved ? (
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>✔ Sauvegardé</span>
                    ) : null}
                </div>

                {submitted && (
                    <div style={{ background: "#ECFDF5", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 18px", marginBottom: "1.25rem", fontSize: 13, color: "#15803d", fontWeight: 500 }}>
                        ✅ Votre évaluation a été soumise. Les notes sont verrouillées et consultables par la DEE.
                    </div>
                )}

                {/* Axes */}
                {axes.map((axe, ai) => (
                    <div key={axe.id} className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animationDelay: `${0.06 + ai * 0.03}s` }}>
                        <div style={{ padding: "13px 20px", background: `${BLUE}06`, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{axe.code} — {axe.libelle}</span>
                            {axe.poids > 0 && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#EBF4FF", color: BLUE, fontWeight: 700 }}>Poids {axe.poids}%</span>}
                        </div>
                        <div style={{ padding: "4px 20px" }}>
                            {axe.enfants?.map((c, ci) => {
                                const ev = evals[c.id] ?? {};
                                return (
                                    <div key={c.id} style={{ padding: "14px 0", borderBottom: ci < axe.enfants.length - 1 ? "1px solid #f8fafc" : "none" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                            <span style={{ fontSize: 12.5, color: "#475569" }}>
                                                <strong style={{ color: "#0f172a" }}>{c.code}</strong> — {c.libelle}
                                            </span>
                                            {ev.note && <span style={{ fontSize: 11, fontFamily: "monospace", color: ev.note >= 4 ? "#d97706" : BLUE, fontWeight: 700 }}>Note: {ev.note}/5</span>}
                                        </div>
                                        <div style={{ display: "flex", gap: 6, marginBottom: submitted ? 0 : 8 }}>
                                            {[1,2,3,4,5].map(n => (
                                                <ScoreBtn key={n} value={n} selected={ev.note === n} onClick={v => update(c.id, "note", v)} disabled={submitted} />
                                            ))}
                                        </div>
                                        {!submitted && (
                                            <textarea className="eval-textarea" rows={2} value={ev.commentaire ?? ""} onChange={e => update(c.id, "commentaire", e.target.value)} placeholder="Commentaire / justification..." style={{ marginTop: 6 }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Actions */}
                {!submitted && (
                    <div className="fade-up" style={{ display: "flex", gap: 10, marginTop: 6, animationDelay: "0.2s" }}>
                        <button onClick={sauvegarder} disabled={saving}
                            style={{ padding: "11px 22px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            {saving ? "⏳ Sauvegarde..." : "💾 Sauvegarder (brouillon)"}
                        </button>
                        <button onClick={soumettre} disabled={totalNotes === 0}
                            style={{ padding: "11px 22px", borderRadius: 9, border: "none", background: totalNotes === 0 ? "#e2e8f0" : `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, color: totalNotes === 0 ? "#94a3b8" : "#fff", fontSize: 13, fontWeight: 600, cursor: totalNotes === 0 ? "not-allowed" : "pointer", boxShadow: totalNotes > 0 ? `0 4px 14px ${BLUE}40` : "none" }}>
                            ✅ Soumettre l'évaluation
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

EvaluationsIndex.layout = page => <ExpertLayout active="dossiers">{page}</ExpertLayout>;