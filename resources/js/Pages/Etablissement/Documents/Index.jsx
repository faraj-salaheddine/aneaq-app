import { Head, useForm, usePage } from "@inertiajs/react";
import { useState, useRef } from "react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
.doc-wrap { font-family:'Inter',sans-serif; }
.doc-wrap *, .doc-wrap *::before, .doc-wrap *::after { box-sizing:border-box; }
.doc-row { transition:background .08s; }
.doc-row:hover { background:#f8fafc!important; }
.doc-dl:hover  { background:#1c5fdc!important; color:#fff!important; border-color:#1c5fdc!important; }
.doc-see:hover { background:#0e7c5b!important; color:#fff!important; border-color:#0e7c5b!important; }
.doc-drop { transition:border-color .15s, background .15s; cursor:pointer; }
.doc-submit:hover:not(:disabled) { background:#1445b8!important; }
`;

const STATUT = {
    "Déposé":  { color:"#b35c00", bg:"#fdf5ec", border:"#fde8cc" },
    "Validé":  { color:"#0e7c5b", bg:"#ecfaf4", border:"#c6f0df" },
    "Rejeté":  { color:"#b91c1c", bg:"#fef2f2", border:"#fecaca" },
};

function Svg({ d, w=16, h=16, sw=1.6, color="currentColor" }) {
    return (
        <svg width={w} height={h} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <path d={d}/>
        </svg>
    );
}

const IC = {
    upload:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    file:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
    dl:      "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
    check:   "M20 6L9 17l-5-5",
    warn:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4v.01",
    chevron: "M9 18l6-6-6-6",
    x:       "M18 6L6 18M6 6l12 12",
    clock:   "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
    info:    "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 7v5m0 4v.01",
};

// Single drop zone component
function DropZone({ label, accept, mimeLabel, color, bgColor, borderColor, preview, onFile, error, inputRef, dragState, onDragOver, onDragLeave, onDrop }) {
    return (
        <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#3d4461", marginBottom:6, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{
                    display:"inline-block", width:7, height:7, borderRadius:"50%",
                    background:color, flexShrink:0,
                }}/>
                {label}
                <span style={{ color:"#b91c1c" }}>*</span>
            </div>
            <div
                className="doc-drop"
                onClick={() => inputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                style={{
                    border:`2px dashed ${dragState ? color : preview ? color : "#d0d5e8"}`,
                    borderRadius:10, padding:"22px 16px", textAlign:"center",
                    background: dragState ? bgColor : preview ? bgColor : "#fafbfc",
                    minHeight:130,
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6,
                }}
            >
                <input ref={inputRef} type="file" accept={accept} style={{ display:"none" }}
                    onChange={e => onFile(e.target.files[0])}
                />
                {preview ? (
                    <>
                        <div style={{
                            width:36, height:36, borderRadius:8,
                            background:bgColor, border:`1px solid ${borderColor}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                            <Svg d={IC.file} w={16} h={16} color={color} sw={2}/>
                        </div>
                        <p style={{ fontSize:13, fontWeight:600, color:"#1a1f2e", margin:0, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {preview.name}
                        </p>
                        <p style={{ fontSize:11, color:"#8891aa", margin:0 }}>{preview.size}</p>
                        <span style={{ fontSize:11, color, fontWeight:500 }}>Changer</span>
                    </>
                ) : (
                    <>
                        <div style={{
                            width:36, height:36, borderRadius:8,
                            background:"#f4f6fb", border:"1px solid #e4e7f0",
                            display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                            <Svg d={IC.upload} w={16} h={16} color="#8891aa" sw={1.8}/>
                        </div>
                        <p style={{ fontSize:12, color:"#5c6480", margin:0 }}>
                            Glisser ou <span style={{ color, fontWeight:600 }}>parcourir</span>
                        </p>
                        <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{mimeLabel}</p>
                    </>
                )}
            </div>
            {error && (
                <p style={{ fontSize:11, color:"#b91c1c", margin:"5px 0 0", display:"flex", alignItems:"center", gap:4 }}>
                    <Svg d={IC.x} w={11} h={11} color="#b91c1c" sw={2.5}/>
                    {error}
                </p>
            )}
        </div>
    );
}

export default function EtablissementDocuments({ etablissement, dossier, documents = [] }) {
    const { flash } = usePage().props;

    const [dragPdf, setDragPdf]     = useState(false);
    const [dragWord, setDragWord]   = useState(false);
    const [previewPdf, setPrevPdf]  = useState(null);
    const [previewWord, setPrevWord]= useState(null);
    const pdfRef                    = useRef();
    const wordRef                   = useRef();

    const { data, setData, post, processing, errors, progress, reset } = useForm({
        fichier_pdf:   null,
        fichier_word:  null,
        type_document: "rapport_autoevaluation",
        observation:   "",
    });

    function makePreview(f) {
        const kb = f.size / 1024;
        return { name: f.name, size: kb < 1024 ? `${kb.toFixed(1)} Ko` : `${(kb/1024).toFixed(1)} Mo` };
    }

    function handlePdf(f) {
        if (!f) return;
        setData("fichier_pdf", f);
        setPrevPdf(makePreview(f));
    }

    function handleWord(f) {
        if (!f) return;
        setData("fichier_word", f);
        setPrevWord(makePreview(f));
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route("etablissement.documents.store"), {
            onSuccess: () => { reset(); setPrevPdf(null); setPrevWord(null); },
        });
    }

    const canSubmit = !processing && data.fichier_pdf && data.fichier_word;

    const rapports = documents;
    const dernierRapport = rapports[0] ?? null;

    return (
        <>
            <Head title="Rapport d'autoévaluation — ANEAQ"/>
            <style>{CSS}</style>
            <div className="doc-wrap" style={{ background:"#f4f6fb", minHeight:"100vh" }}>

                {/* ── Header ── */}
                <div style={{ background:"#fff", borderBottom:"1px solid #e4e7f0", padding:"18px 32px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                        <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500 }}>Espace établissement</span>
                        <Svg d={IC.chevron} w={10} h={10} color="#d1d5db" sw={2}/>
                        <span style={{ fontSize:11, color:"#1c5fdc", fontWeight:600 }}>Rapport d'autoévaluation</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{
                                width:40, height:40, borderRadius:10, flexShrink:0,
                                background:"#eef3fd", border:"1px solid #d6e4fb",
                                display:"flex", alignItems:"center", justifyContent:"center",
                            }}>
                                <Svg d={IC.file} w={18} h={18} color="#1c5fdc" sw={1.7}/>
                            </div>
                            <div>
                                <h1 style={{ fontSize:18, fontWeight:700, color:"#1a1f2e", margin:"0 0 2px", letterSpacing:"-.02em" }}>
                                    Rapport d'autoévaluation
                                </h1>
                                <p style={{ fontSize:12, color:"#8891aa", margin:0 }}>
                                    Déposez votre rapport en deux formats obligatoires — PDF et Word · Max 50 Mo chacun
                                </p>
                            </div>
                        </div>
                        {dossier && (
                            <div style={{
                                display:"flex", alignItems:"center", gap:7,
                                padding:"6px 12px", borderRadius:8,
                                background:"#f4f6fb", border:"1px solid #e4e7f0",
                            }}>
                                <Svg d={IC.clock} w={13} h={13} color="#8891aa" sw={1.5}/>
                                <span style={{ fontSize:11, fontWeight:600, color:"#3d4461", fontFamily:"'JetBrains Mono',monospace" }}>
                                    Réf. {dossier.reference ?? dossier.id}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Content ── */}
                <div style={{ padding:"20px 32px", display:"flex", flexDirection:"column", gap:16 }}>

                    {/* flash */}
                    {flash?.success && (
                        <div style={{
                            padding:"11px 16px", borderRadius:8,
                            background:"#ecfaf4", border:"1px solid #c6f0df",
                            display:"flex", alignItems:"center", gap:8,
                        }}>
                            <Svg d={IC.check} w={14} h={14} color="#0e7c5b" sw={2.5}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"#0e7c5b" }}>{flash.success}</span>
                        </div>
                    )}

                    {/* last status banner */}
                    {dernierRapport && (() => {
                        const s = STATUT[dernierRapport.status] ?? { color:"#5c6480", bg:"#f4f6fb", border:"#e4e7f0" };
                        return (
                            <div style={{
                                padding:"12px 16px", borderRadius:8,
                                background:s.bg, border:`1px solid ${s.border}`,
                                display:"flex", alignItems:"center", gap:10,
                            }}>
                                <Svg d={dernierRapport.status === "Validé" ? IC.check : IC.warn}
                                    w={15} h={15} color={s.color} sw={2}/>
                                <span style={{ fontSize:13, fontWeight:600, color:s.color }}>
                                    Dernier dépôt — statut :
                                </span>
                                <span style={{
                                    fontSize:11, fontWeight:700, color:s.color,
                                    padding:"2px 8px", borderRadius:999,
                                    background:"rgba(255,255,255,.6)", border:`1px solid ${s.border}`,
                                    textTransform:"uppercase", letterSpacing:".04em",
                                }}>{dernierRapport.status}</span>
                                <span style={{ fontSize:11, color:"#8891aa", marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace" }}>
                                    {new Date(dernierRapport.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}
                                </span>
                            </div>
                        );
                    })()}

                    {/* ── Upload card ── */}
                    <div style={{ background:"#fff", border:"1px solid #e4e7f0", borderRadius:12, overflow:"hidden" }}>
                        <div style={{
                            padding:"11px 18px", borderBottom:"1px solid #f1f5f9",
                            background:"#fafbfc", display:"flex", alignItems:"center", gap:8,
                        }}>
                            <Svg d={IC.upload} w={14} h={14} color="#1c5fdc" sw={2}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"#1a1f2e" }}>Déposer le rapport</span>
                            <span style={{
                                marginLeft:"auto", fontSize:11, color:"#b35c00",
                                background:"#fdf5ec", border:"1px solid #fde8cc",
                                padding:"2px 8px", borderRadius:999, fontWeight:600,
                            }}>
                                PDF + Word obligatoires
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding:"20px 24px" }}>

                            {/* info */}
                            <div style={{
                                padding:"10px 14px", borderRadius:8, marginBottom:16,
                                background:"#eef3fd", border:"1px solid #d6e4fb",
                                display:"flex", alignItems:"center", gap:8,
                            }}>
                                <Svg d={IC.info} w={14} h={14} color="#1c5fdc" sw={1.8}/>
                                <p style={{ fontSize:12, color:"#1c5fdc", margin:0 }}>
                                    Les deux fichiers sont <b>obligatoires</b> — déposez votre rapport en format PDF et en format Word (.doc/.docx).
                                </p>
                            </div>

                            {/* two drop zones side by side */}
                            <div style={{ display:"flex", gap:16, marginBottom:16 }}>
                                <DropZone
                                    label="Version PDF"
                                    accept=".pdf"
                                    mimeLabel="PDF uniquement"
                                    color="#1c5fdc"
                                    bgColor="#eef3fd"
                                    borderColor="#d6e4fb"
                                    preview={previewPdf}
                                    onFile={handlePdf}
                                    error={errors.fichier_pdf}
                                    inputRef={pdfRef}
                                    dragState={dragPdf}
                                    onDragOver={e => { e.preventDefault(); setDragPdf(true); }}
                                    onDragLeave={() => setDragPdf(false)}
                                    onDrop={e => { e.preventDefault(); setDragPdf(false); handlePdf(e.dataTransfer.files[0]); }}
                                />
                                <DropZone
                                    label="Version Word"
                                    accept=".doc,.docx"
                                    mimeLabel=".doc ou .docx uniquement"
                                    color="#7c3aed"
                                    bgColor="#f5f3ff"
                                    borderColor="#dddaf7"
                                    preview={previewWord}
                                    onFile={handleWord}
                                    error={errors.fichier_word}
                                    inputRef={wordRef}
                                    dragState={dragWord}
                                    onDragOver={e => { e.preventDefault(); setDragWord(true); }}
                                    onDragLeave={() => setDragWord(false)}
                                    onDrop={e => { e.preventDefault(); setDragWord(false); handleWord(e.dataTransfer.files[0]); }}
                                />
                            </div>

                            {/* observation */}
                            <div style={{ marginBottom:16 }}>
                                <label style={{ fontSize:12, fontWeight:600, color:"#3d4461", display:"block", marginBottom:5 }}>
                                    Observation
                                    <span style={{ color:"#9ca3af", fontWeight:400, marginLeft:6 }}>(optionnel)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Remarques ou contexte sur ce dépôt…"
                                    value={data.observation}
                                    onChange={e => setData("observation", e.target.value)}
                                    style={{
                                        width:"100%", resize:"vertical",
                                        border:"1px solid #e4e7f0", borderRadius:7,
                                        padding:"8px 11px", fontSize:13,
                                        fontFamily:"'Inter',sans-serif", color:"#374151",
                                        background:"#fff", outline:"none", lineHeight:1.6,
                                    }}
                                />
                            </div>

                            {/* progress */}
                            {processing && progress && (
                                <div style={{ marginBottom:14 }}>
                                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                                        <span style={{ fontSize:11, color:"#8891aa" }}>Envoi en cours…</span>
                                        <span style={{ fontSize:11, color:"#1c5fdc", fontWeight:600 }}>{progress.percentage}%</span>
                                    </div>
                                    <div style={{ height:4, background:"#e4e7f0", borderRadius:999, overflow:"hidden" }}>
                                        <div style={{
                                            height:"100%", borderRadius:999,
                                            background:"linear-gradient(90deg,#1c5fdc,#7c3aed)",
                                            width:`${progress.percentage}%`, transition:"width .3s ease",
                                        }}/>
                                    </div>
                                </div>
                            )}

                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                                <div style={{ display:"flex", gap:8 }}>
                                    {/* PDF status */}
                                    <span style={{
                                        fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:999,
                                        background: previewPdf ? "#ecfaf4" : "#f4f6fb",
                                        color: previewPdf ? "#0e7c5b" : "#9ca3af",
                                        border: `1px solid ${previewPdf ? "#c6f0df" : "#e4e7f0"}`,
                                    }}>
                                        {previewPdf ? "✓ PDF prêt" : "PDF manquant"}
                                    </span>
                                    {/* Word status */}
                                    <span style={{
                                        fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:999,
                                        background: previewWord ? "#ecfaf4" : "#f4f6fb",
                                        color: previewWord ? "#0e7c5b" : "#9ca3af",
                                        border: `1px solid ${previewWord ? "#c6f0df" : "#e4e7f0"}`,
                                    }}>
                                        {previewWord ? "✓ Word prêt" : "Word manquant"}
                                    </span>
                                </div>

                                <button type="submit" className="doc-submit" disabled={!canSubmit} style={{
                                    display:"flex", alignItems:"center", gap:6,
                                    padding:"9px 20px", borderRadius:8,
                                    background: canSubmit ? "#1c5fdc" : "#e4e7f0",
                                    color: canSubmit ? "#fff" : "#9ca3af",
                                    border:"none", fontSize:13, fontWeight:600,
                                    cursor: canSubmit ? "pointer" : "not-allowed",
                                    transition:"background .1s",
                                }}>
                                    <Svg d={IC.upload} w={14} h={14} color="currentColor" sw={2}/>
                                    {processing ? "Dépôt en cours…" : "Déposer le rapport"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── History ── */}
                    <div style={{ background:"#fff", border:"1px solid #e4e7f0", borderRadius:12, overflow:"hidden" }}>
                        <div style={{
                            padding:"11px 18px", borderBottom:"1px solid #f1f5f9",
                            background:"#fafbfc", display:"flex", alignItems:"center", gap:8,
                        }}>
                            <Svg d={IC.clock} w={14} h={14} color="#8891aa" sw={1.7}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"#1a1f2e" }}>Historique des dépôts</span>
                            <span style={{
                                marginLeft:"auto", fontSize:10, fontWeight:700,
                                padding:"2px 8px", borderRadius:999,
                                background:"#f4f6fb", color:"#8891aa", border:"1px solid #e4e7f0",
                            }}>{rapports.length} fichier{rapports.length !== 1 ? "s" : ""}</span>
                        </div>

                        {rapports.length === 0 ? (
                            <div style={{ padding:"48px 24px", textAlign:"center" }}>
                                <div style={{
                                    width:48, height:48, borderRadius:12,
                                    background:"#f4f6fb", border:"1px solid #e4e7f0",
                                    margin:"0 auto 12px",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                    <Svg d={IC.file} w={20} h={20} color="#d1d5db" sw={1.5}/>
                                </div>
                                <p style={{ fontSize:14, fontWeight:600, color:"#374151", margin:"0 0 4px" }}>
                                    Aucun rapport déposé
                                </p>
                                <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>
                                    Votre premier dépôt (PDF + Word) apparaîtra ici
                                </p>
                            </div>
                        ) : (
                            <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                <thead>
                                    <tr style={{ background:"#fafbfc" }}>
                                        {["Fichier", "Format", "Date de dépôt", "Statut", "Actions"].map(h => (
                                            <th key={h} style={{
                                                textAlign:"left", padding:"9px 16px",
                                                fontSize:10, fontWeight:700, color:"#8891aa",
                                                letterSpacing:".08em", textTransform:"uppercase",
                                                borderBottom:"1px solid #e4e7f0",
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rapports.map((doc, i) => {
                                        const s = STATUT[doc.status] ?? { color:"#5c6480", bg:"#f4f6fb", border:"#e4e7f0" };
                                        const isPdf  = doc.original_name?.toLowerCase().endsWith(".pdf");
                                        const isWord = doc.original_name?.toLowerCase().match(/\.(doc|docx)$/);
                                        const fmtColor  = isPdf ? "#1c5fdc" : "#7c3aed";
                                        const fmtBg     = isPdf ? "#eef3fd" : "#f5f3ff";
                                        const fmtBorder = isPdf ? "#d6e4fb" : "#dddaf7";
                                        const fmtLabel  = isPdf ? "PDF" : isWord ? "Word" : "Fichier";
                                        return (
                                            <tr key={doc.id} className="doc-row" style={{ background:"#fff" }}>
                                                <td style={{ padding:"12px 16px", borderBottom:"1px solid #f4f6fb", verticalAlign:"middle" }}>
                                                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                                        <div style={{
                                                            width:30, height:30, borderRadius:7, flexShrink:0,
                                                            background:fmtBg, border:`1px solid ${fmtBorder}`,
                                                            display:"flex", alignItems:"center", justifyContent:"center",
                                                        }}>
                                                            <Svg d={IC.file} w={13} h={13} color={fmtColor} sw={2}/>
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize:13, fontWeight:500, color:"#1a1f2e", margin:0, maxWidth:240, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                                                {doc.original_name}
                                                            </p>
                                                            {i < 2 && (
                                                                <span style={{ fontSize:9, fontWeight:700, color:"#1c5fdc", textTransform:"uppercase", letterSpacing:".05em" }}>
                                                                    Dernier dépôt
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding:"12px 16px", borderBottom:"1px solid #f4f6fb", verticalAlign:"middle" }}>
                                                    <span style={{
                                                        fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:999,
                                                        color:fmtColor, background:fmtBg, border:`1px solid ${fmtBorder}`,
                                                        textTransform:"uppercase", letterSpacing:".04em",
                                                    }}>{fmtLabel}</span>
                                                </td>
                                                <td style={{ padding:"12px 16px", borderBottom:"1px solid #f4f6fb", verticalAlign:"middle" }}>
                                                    <span style={{ fontSize:12, color:"#5c6480", fontFamily:"'JetBrains Mono',monospace" }}>
                                                        {new Date(doc.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}
                                                    </span>
                                                </td>
                                                <td style={{ padding:"12px 16px", borderBottom:"1px solid #f4f6fb", verticalAlign:"middle" }}>
                                                    <span style={{
                                                        fontSize:10, fontWeight:700,
                                                        padding:"3px 9px", borderRadius:999,
                                                        color:s.color, background:s.bg,
                                                        border:`1px solid ${s.border}`,
                                                        textTransform:"uppercase", letterSpacing:".04em",
                                                    }}>{doc.status}</span>
                                                </td>
                                                <td style={{ padding:"12px 16px", borderBottom:"1px solid #f4f6fb", verticalAlign:"middle" }}>
                                                    <div style={{ display:"flex", gap:6 }}>
                                                        {isPdf && (
                                                            <a className="doc-see"
                                                                href={route("etablissement.documents.voir", doc.id)}
                                                                target="_blank"
                                                                style={{
                                                                    display:"inline-flex", alignItems:"center", gap:4,
                                                                    padding:"5px 11px", borderRadius:7,
                                                                    border:"1px solid #c6f0df", background:"#ecfaf4",
                                                                    color:"#0e7c5b", fontSize:11, fontWeight:600,
                                                                    textDecoration:"none", transition:"all .1s",
                                                                }}>
                                                                <Svg d={IC.eye} w={12} h={12} color="currentColor" sw={2}/>
                                                                Voir
                                                            </a>
                                                        )}
                                                        <a className="doc-dl"
                                                            href={route("etablissement.documents.telecharger", doc.id)}
                                                            style={{
                                                                display:"inline-flex", alignItems:"center", gap:4,
                                                                padding:"5px 11px", borderRadius:7,
                                                                border:"1px solid #d6e4fb", background:"#eef3fd",
                                                                color:"#1c5fdc", fontSize:11, fontWeight:600,
                                                                textDecoration:"none", transition:"all .1s",
                                                            }}>
                                                            <Svg d={IC.dl} w={12} h={12} color="currentColor" sw={2}/>
                                                            Télécharger
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

EtablissementDocuments.layout = page => <EtablissementLayout active="documents">{page}</EtablissementLayout>;