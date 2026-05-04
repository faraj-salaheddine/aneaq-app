import { Head, useForm } from "@inertiajs/react";
import { useState, useRef } from "react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";

const TYPE_META = {
    rapport_autoevaluation: { label: "Rapport d'autoévaluation", color: BLUE,      bg: "#EFF6FF" },
    annexe:                 { label: "Annexe",                   color: ORANGE,    bg: "#FFF7ED" },
    lettre_dee:             { label: "Lettre DEE",               color: GREEN,     bg: "#ECFDF5" },
};

const STATUT_META = {
    "Déposé":  { color: ORANGE,    bg: "#FFF7ED" },
    "Validé":  { color: GREEN,     bg: "#ECFDF5" },
    "Rejeté":  { color: "#ef4444", bg: "#FFF1F2" },
};

export default function EtablissementDocuments({ etablissement, dossier, documents = [] }) {
    const [typeUpload, setTypeUpload] = useState("rapport_autoevaluation");
    const [drag, setDrag]             = useState(false);
    const [preview, setPreview]       = useState(null);
    const ref                         = useRef();

    const { data, setData, post, processing, errors, progress, reset } = useForm({
        fichier: null, type_document: "rapport_autoevaluation", observation: "",
    });

    const handleFile = f => {
        if (!f) return;
        setData("fichier", f);
        const kb = f.size / 1024;
        setPreview({ name: f.name, size: kb < 1024 ? `${kb.toFixed(1)} Ko` : `${(kb / 1024).toFixed(1)} Mo` });
    };

    const selectType = t => { setTypeUpload(t); setData("type_document", t); };

    const thS = { textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9" };
    const tdS = { padding: "12px 16px", borderBottom: "1px solid #f8fafc", fontSize: 13, verticalAlign: "middle" };

    return (
        <>
            <Head title="Documents" />
            <style>{`
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
                .row-hover:hover { background: #f8fafc !important; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Documents</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Dépôt du rapport d'autoévaluation et des annexes</p>
                </div>

                {/* Upload */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "1.5rem", animationDelay: "0.05s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        📤 Déposer un document
                    </div>
                    <div style={{ padding: "1.5rem" }}>
                        {/* Type selector */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            {[
                                { value: "rapport_autoevaluation", label: "Rapport d'autoévaluation" },
                                { value: "annexe",                 label: "Annexe" },
                            ].map(opt => (
                                <button key={opt.value} type="button" onClick={() => selectType(opt.value)}
                                    style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${typeUpload === opt.value ? BLUE : "#e2e8f0"}`, background: typeUpload === opt.value ? `${BLUE}10` : "#fff", color: typeUpload === opt.value ? BLUE : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginBottom: 14, padding: "10px 14px", background: "#fffbeb", borderRadius: 8, borderLeft: `3px solid ${ORANGE}`, fontSize: 12, color: "#92400e" }}>
                            Formats acceptés : <strong>PDF (.pdf)</strong>, <strong>Word (.doc, .docx)</strong> · Max <strong>50 Mo</strong>
                        </div>

                        <form onSubmit={e => { e.preventDefault(); post(route("etablissement.documents.store"), { onSuccess: () => { reset(); setPreview(null); } }); }}>
                            <div
                                onClick={() => ref.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                                style={{ border: `2px dashed ${drag ? BLUE : preview ? GREEN : "#e2e8f0"}`, borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer", background: drag ? `${BLUE}04` : preview ? `${GREEN}04` : "#fafbfc", transition: "all 0.2s" }}>
                                <input ref={ref} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                                {preview ? (
                                    <>
                                        <div style={{ fontSize: 32, marginBottom: 6 }}>📄</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{preview.name}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{preview.size}</div>
                                        <div style={{ fontSize: 11, color: BLUE, marginTop: 6 }}>Cliquez pour changer</div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 32, marginBottom: 6 }}>📎</div>
                                        <div style={{ fontSize: 13, color: "#64748b" }}>
                                            Glissez-déposez ici ou <strong style={{ color: BLUE }}>parcourir</strong>
                                        </div>
                                    </>
                                )}
                            </div>

                            {errors.fichier && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>❌ {errors.fichier}</p>}

                            {progress && (
                                <div style={{ marginTop: 10, height: 4, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`, width: `${progress.percentage}%`, transition: "width 0.2s" }} />
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                                <button type="submit" disabled={!data.fichier || processing}
                                    style={{ padding: "11px 24px", borderRadius: 9, border: "none", background: !data.fichier ? "#e2e8f0" : `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, color: !data.fichier ? "#94a3b8" : "#fff", cursor: !data.fichier ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
                                    {processing ? "⏳ Dépôt en cours..." : "📤 Déposer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Liste */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.1s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        Historique ({documents.length})
                    </div>
                    {documents.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Aucun document déposé.</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead><tr style={{ background: "#fafbfc" }}>
                                <th style={thS}>Type</th>
                                <th style={thS}>Fichier</th>
                                <th style={thS}>Date</th>
                                <th style={thS}>Statut</th>
                                <th style={thS}>Actions</th>
                            </tr></thead>
                            <tbody>
                                {documents.map(d => {
                                    const tm = TYPE_META[d.type_document] ?? { label: d.type_document, color: "#64748b", bg: "#f1f5f9" };
                                    const sm = STATUT_META[d.status]     ?? { color: "#64748b", bg: "#f1f5f9" };
                                    return (
                                        <tr key={d.id} className="row-hover" style={{ transition: "background 0.1s" }}>
                                            <td style={tdS}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, color: tm.color, background: tm.bg }}>{tm.label}</span></td>
                                            <td style={{ ...tdS, fontSize: 11, color: "#64748b" }}><span title={d.original_name}>{d.original_name?.length > 38 ? d.original_name.slice(0, 38) + "…" : d.original_name}</span></td>
                                            <td style={{ ...tdS, fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                                            <td style={tdS}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, color: sm.color, background: sm.bg }}>{d.status}</span></td>
                                            <td style={tdS}>
                                                <button onClick={() => { window.location.href = route("etablissement.documents.telecharger", d.id); }}
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

EtablissementDocuments.layout = page => <EtablissementLayout active="documents">{page}</EtablissementLayout>;
