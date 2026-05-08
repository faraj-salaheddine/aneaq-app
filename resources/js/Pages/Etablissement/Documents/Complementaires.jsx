import { Head, useForm, usePage } from "@inertiajs/react";
import { useState, useRef } from "react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
.cp-wrap { font-family:'Inter',sans-serif; }
.cp-wrap *, .cp-wrap *::before, .cp-wrap *::after { box-sizing:border-box; }
.cp-row { transition:background .08s; }
.cp-row:hover { background:#f8fafc!important; }
.cp-dl:hover  { background:#1c5fdc!important; color:#fff!important; border-color:#1c5fdc!important; }
.cp-see:hover { background:#0e7c5b!important; color:#fff!important; border-color:#0e7c5b!important; }
.cp-drop { transition:border-color .15s, background .15s; }
.cp-submit:hover:not(:disabled) { background:#1445b8!important; }
.cp-ta:focus { border-color:#1c5fdc!important; box-shadow:0 0 0 3px rgba(28,95,220,.07)!important; outline:none; }
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
    upload:    "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    file:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
    dl:        "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
    check:     "M20 6L9 17l-5-5",
    warn:      "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4v.01",
    chevron:   "M9 18l6-6-6-6",
    x:         "M18 6L6 18M6 6l12 12",
    clock:     "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
    paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
    msg:       "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
};

export default function Complementaires({ etablissement, dossier, documents = [] }) {
    const { flash } = usePage().props;
    const [drag, setDrag]       = useState(false);
    const [preview, setPreview] = useState(null);
    const fileRef               = useRef();

    const { data, setData, post, processing, errors, progress, reset } = useForm({
        fichier:     null,
        observation: "",
    });

    function handleFile(f) {
        if (!f) return;
        // Block zip files
        if (f.name.toLowerCase().endsWith(".zip") || f.type === "application/zip") {
            alert("Les fichiers ZIP ne sont pas autorisés.");
            return;
        }
        setData("fichier", f);
        const kb = f.size / 1024;
        setPreview({
            name: f.name,
            size: kb < 1024 ? `${kb.toFixed(1)} Ko` : `${(kb/1024).toFixed(1)} Mo`,
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route("etablissement.documents.complementaires.store"), {
            onSuccess: () => { reset(); setPreview(null); },
        });
    }

    const canSubmit = !processing && data.fichier && data.observation.trim().length >= 10;

    return (
        <>
            <Head title="Documents complémentaires — ANEAQ"/>
            <style>{CSS}</style>
            <div className="cp-wrap" style={{ background:"#f4f6fb", minHeight:"100vh" }}>

                {/* ── Header ── */}
                <div style={{ background:"#fff", borderBottom:"1px solid #e4e7f0", padding:"18px 32px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                        <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500 }}>Espace établissement</span>
                        <Svg d={IC.chevron} w={10} h={10} color="#d1d5db" sw={2}/>
                        <span style={{ fontSize:11, color:"#1c5fdc", fontWeight:600 }}>Documents complémentaires</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{
                                width:40, height:40, borderRadius:10, flexShrink:0,
                                background:"#eef3fd", border:"1px solid #d6e4fb",
                                display:"flex", alignItems:"center", justifyContent:"center",
                            }}>
                                <Svg d={IC.paperclip} w={18} h={18} color="#1c5fdc" sw={1.7}/>
                            </div>
                            <div>
                                <h1 style={{ fontSize:18, fontWeight:700, color:"#1a1f2e", margin:"0 0 2px", letterSpacing:"-.02em" }}>
                                    Documents complémentaires
                                </h1>
                                <p style={{ fontSize:12, color:"#8891aa", margin:0 }}>
                                    Envoyez des documents à la DEE et aux experts — tout format sauf ZIP · Max 50 Mo
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

                    {/* info banner */}
                    <div style={{
                        padding:"11px 16px", borderRadius:8,
                        background:"#eef3fd", border:"1px solid #d6e4fb",
                        display:"flex", alignItems:"flex-start", gap:10,
                    }}>
                        <Svg d={IC.msg} w={15} h={15} color="#1c5fdc" sw={1.8}/>
                        <p style={{ fontSize:12, color:"#1c5fdc", margin:0, lineHeight:1.6 }}>
                            Ces documents seront transmis à la DEE et aux experts en charge de votre dossier.
                            Un commentaire explicatif est <b>obligatoire</b> pour chaque envoi.
                        </p>
                    </div>

                    {/* ── Upload card ── */}
                    <div style={{ background:"#fff", border:"1px solid #e4e7f0", borderRadius:12, overflow:"hidden" }}>
                        <div style={{
                            padding:"11px 18px", borderBottom:"1px solid #f1f5f9",
                            background:"#fafbfc", display:"flex", alignItems:"center", gap:8,
                        }}>
                            <Svg d={IC.upload} w={14} h={14} color="#1c5fdc" sw={2}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"#1a1f2e" }}>Envoyer un document</span>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding:"20px 24px" }}>

                            {/* drop zone */}
                            <div
                                className="cp-drop"
                                onClick={() => fileRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                                style={{
                                    border:`2px dashed ${drag ? "#1c5fdc" : preview ? "#0e7c5b" : "#d0d5e8"}`,
                                    borderRadius:10, padding:"28px 24px", textAlign:"center",
                                    cursor:"pointer",
                                    background: drag ? "#eef3fd" : preview ? "#ecfaf4" : "#fafbfc",
                                    marginBottom:16,
                                }}
                            >
                                <input ref={fileRef} type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt,.csv"
                                    style={{ display:"none" }}
                                    onChange={e => handleFile(e.target.files[0])}
                                />
                                {preview ? (
                                    <div>
                                        <div style={{
                                            width:44, height:44, borderRadius:10, margin:"0 auto 10px",
                                            background:"#ecfaf4", border:"1px solid #c6f0df",
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                        }}>
                                            <Svg d={IC.file} w={20} h={20} color="#0e7c5b" sw={1.7}/>
                                        </div>
                                        <p style={{ fontSize:14, fontWeight:700, color:"#1a1f2e", margin:"0 0 3px" }}>
                                            {preview.name}
                                        </p>
                                        <p style={{ fontSize:12, color:"#8891aa", margin:"0 0 6px" }}>{preview.size}</p>
                                        <span style={{ fontSize:11, color:"#1c5fdc", fontWeight:500 }}>
                                            Cliquez pour changer le fichier
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{
                                            width:44, height:44, borderRadius:10, margin:"0 auto 10px",
                                            background:"#f4f6fb", border:"1px solid #e4e7f0",
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                        }}>
                                            <Svg d={IC.upload} w={20} h={20} color="#8891aa" sw={1.6}/>
                                        </div>
                                        <p style={{ fontSize:13, color:"#5c6480", margin:"0 0 4px" }}>
                                            Glissez-déposez votre document ici
                                        </p>
                                        <p style={{ fontSize:12, color:"#8891aa", margin:0 }}>
                                            ou <span style={{ color:"#1c5fdc", fontWeight:600 }}>parcourir</span>
                                            {" "}· PDF, Word, Excel, PowerPoint, Image · Max 50 Mo
                                        </p>
                                        <p style={{ fontSize:11, color:"#b91c1c", margin:"6px 0 0", fontWeight:500 }}>
                                            ✕ Fichiers ZIP non acceptés
                                        </p>
                                    </div>
                                )}
                            </div>

                            {errors.fichier && (
                                <p style={{ fontSize:12, color:"#b91c1c", margin:"0 0 12px", display:"flex", alignItems:"center", gap:5 }}>
                                    <Svg d={IC.x} w={12} h={12} color="#b91c1c" sw={2.5}/>
                                    {errors.fichier}
                                </p>
                            )}

                            {/* comment — required */}
                            <div style={{ marginBottom:16 }}>
                                <label style={{ fontSize:12, fontWeight:600, color:"#3d4461", display:"block", marginBottom:5 }}>
                                    Commentaire
                                    <span style={{ color:"#b91c1c", marginLeft:4 }}>*</span>
                                    <span style={{ color:"#9ca3af", fontWeight:400, marginLeft:6 }}>
                                        (obligatoire — décrivez l'objet et l'utilité de ce document)
                                    </span>
                                </label>
                                <textarea
                                    className="cp-ta"
                                    rows={4}
                                    placeholder="Ex: Ce document présente les accréditations de nos laboratoires, requis pour la vérification lors de la visite du comité…"
                                    value={data.observation}
                                    onChange={e => setData("observation", e.target.value)}
                                    style={{
                                        width:"100%", resize:"vertical",
                                        border:"1px solid #e4e7f0", borderRadius:7,
                                        padding:"9px 11px", fontSize:13,
                                        fontFamily:"'Inter',sans-serif", color:"#374151",
                                        background:"#fff", lineHeight:1.6,
                                        transition:"border-color .12s, box-shadow .12s",
                                    }}
                                />
                                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                                    {errors.observation ? (
                                        <span style={{ fontSize:11, color:"#b91c1c", display:"flex", alignItems:"center", gap:4 }}>
                                            <Svg d={IC.x} w={11} h={11} color="#b91c1c" sw={2.5}/>
                                            {errors.observation}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize:11, color: data.observation.length < 10 ? "#b91c1c" : "#8891aa" }}>
                                            {data.observation.length < 10
                                                ? `${10 - data.observation.length} caractères minimum restants`
                                                : `${data.observation.length} caractères`
                                            }
                                        </span>
                                    )}
                                </div>
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
                                            background:"linear-gradient(90deg,#1c5fdc,#0e7c5b)",
                                            width:`${progress.percentage}%`, transition:"width .3s ease",
                                        }}/>
                                    </div>
                                </div>
                            )}

                            <div style={{ display:"flex", justifyContent:"flex-end" }}>
                                <button type="submit" className="cp-submit" disabled={!canSubmit} style={{
                                    display:"flex", alignItems:"center", gap:6,
                                    padding:"9px 20px", borderRadius:8,
                                    background: canSubmit ? "#1c5fdc" : "#e4e7f0",
                                    color: canSubmit ? "#fff" : "#9ca3af",
                                    border:"none", fontSize:13, fontWeight:600,
                                    cursor: canSubmit ? "pointer" : "not-allowed",
                                    transition:"background .1s",
                                }}>
                                    <Svg d={IC.upload} w={14} h={14} color="currentColor" sw={2}/>
                                    {processing ? "Envoi en cours…" : "Envoyer le document"}
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
                            <span style={{ fontSize:13, fontWeight:600, color:"#1a1f2e" }}>Documents envoyés</span>
                            <span style={{
                                marginLeft:"auto", fontSize:10, fontWeight:700,
                                padding:"2px 8px", borderRadius:999,
                                background:"#f4f6fb", color:"#8891aa", border:"1px solid #e4e7f0",
                            }}>{documents.length} document{documents.length !== 1 ? "s" : ""}</span>
                        </div>

                        {documents.length === 0 ? (
                            <div style={{ padding:"48px 24px", textAlign:"center" }}>
                                <div style={{
                                    width:48, height:48, borderRadius:12,
                                    background:"#f4f6fb", border:"1px solid #e4e7f0",
                                    margin:"0 auto 12px",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                    <Svg d={IC.paperclip} w={20} h={20} color="#d1d5db" sw={1.5}/>
                                </div>
                                <p style={{ fontSize:14, fontWeight:600, color:"#374151", margin:"0 0 4px" }}>
                                    Aucun document envoyé
                                </p>
                                <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>
                                    Vos documents complémentaires apparaîtront ici
                                </p>
                            </div>
                        ) : (
                            <div>
                                {documents.map((doc, i) => {
                                    const s = STATUT[doc.status] ?? { color:"#5c6480", bg:"#f4f6fb", border:"#e4e7f0" };
                                    return (
                                        <div key={doc.id} className="cp-row" style={{
                                            padding:"14px 18px",
                                            borderBottom: i < documents.length - 1 ? "1px solid #f4f6fb" : "none",
                                            background:"#fff",
                                        }}>
                                            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                                                {/* icon */}
                                                <div style={{
                                                    width:36, height:36, borderRadius:8, flexShrink:0,
                                                    background:"#eef3fd", border:"1px solid #d6e4fb",
                                                    display:"flex", alignItems:"center", justifyContent:"center",
                                                }}>
                                                    <Svg d={IC.file} w={15} h={15} color="#1c5fdc" sw={2}/>
                                                </div>

                                                {/* content */}
                                                <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                                                        <span style={{
                                                            fontSize:13, fontWeight:600, color:"#1a1f2e",
                                                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:300,
                                                        }}>{doc.original_name}</span>
                                                        <span style={{
                                                            fontSize:10, fontWeight:700,
                                                            padding:"2px 8px", borderRadius:999,
                                                            color:s.color, background:s.bg, border:`1px solid ${s.border}`,
                                                            textTransform:"uppercase", letterSpacing:".04em",
                                                        }}>{doc.status}</span>
                                                        <span style={{ fontSize:11, color:"#9ca3af", marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace" }}>
                                                            {new Date(doc.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}
                                                        </span>
                                                    </div>

                                                    {/* observation */}
                                                    {doc.observation && (
                                                        <div style={{
                                                            fontSize:12, color:"#5c6480", lineHeight:1.6,
                                                            padding:"7px 10px", background:"#f9fafb",
                                                            borderRadius:6, border:"1px solid #f1f5f9",
                                                            marginBottom:8,
                                                        }}>
                                                            <span style={{ fontSize:10, fontWeight:700, color:"#8891aa", textTransform:"uppercase", letterSpacing:".05em", display:"block", marginBottom:3 }}>
                                                                Commentaire
                                                            </span>
                                                            {doc.observation}
                                                        </div>
                                                    )}

                                                    {/* actions */}
                                                    <div style={{ display:"flex", gap:6 }}>
                                                        <a className="cp-see"
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
                                                        <a className="cp-dl"
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
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Complementaires.layout = page => <EtablissementLayout active="complementaires">{page}</EtablissementLayout>;