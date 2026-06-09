import { router } from "@inertiajs/react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

export default function EvaluationAnnexeListe({ expert, dossiers }) {
    return (
        <ExpertLayout>
            <div style={{ padding: "28px", maxWidth: 860, margin: "0 auto" }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1f2e", margin: "0 0 6px" }}>
                    Évaluation des annexes
                </h1>
                <p style={{ fontSize: 13, color: "#8891aa", margin: "0 0 24px" }}>
                    Sélectionnez un dossier pour noter les annexes soumises par l'établissement (0 à 3).
                </p>

                {dossiers.length === 0 ? (
                    <div style={{ background: "#f9fafc", border: "1px solid #e4e7f0", borderRadius: 10, padding: "40px 28px", textAlign: "center", color: "#8891aa" }}>
                        Aucun dossier affecté pour le moment.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {dossiers.map(d => {
                            const pct = d.total > 0 ? Math.round((d.evalue / d.total) * 100) : 0;
                            return (
                                <div key={d.id}
                                    onClick={() => router.visit(route("expert.evaluations-annexes.index", { dossier: d.id }))}
                                    style={{
                                        background: "#fff", border: "1px solid #e4e7f0", borderRadius: 10,
                                        padding: "16px 20px", cursor: "pointer", transition: "box-shadow .12s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.07)"}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "#1c5fdc", background: "#eef3fd", border: "1px solid #d6e4fb", borderRadius: 4, padding: "2px 7px" }}>
                                                    {d.reference}
                                                </span>
                                                {d.soumis && (
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#0e7c5b", background: "#ecfaf4", border: "1px solid #c6f0df", borderRadius: 999, padding: "2px 8px" }}>
                                                        ✓ Soumis au DEE
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1f2e", marginBottom: 2 }}>
                                                {d.nom ?? d.etablissement ?? "—"}
                                            </div>
                                            {d.etablissement && d.nom && (
                                                <div style={{ fontSize: 12, color: "#8891aa" }}>{d.etablissement}</div>
                                            )}
                                        </div>
                                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1f2e" }}>
                                                {d.evalue} <span style={{ fontWeight: 400, color: "#8891aa" }}>/ {d.total}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: pct === 100 ? "#0e7c5b" : "#8891aa", fontWeight: 600 }}>
                                                {pct}% évalué
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 10, height: 4, background: "#e4e7f0", borderRadius: 999, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: pct === 100 ? "#0e7c5b" : "#1c5fdc", transition: "width .4s" }}/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </ExpertLayout>
    );
}
