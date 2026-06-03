import { Head } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
.ra-wrap { font-family:'Inter',sans-serif; }
.ra-wrap *, .ra-wrap *::before, .ra-wrap *::after { box-sizing:border-box; }
.ra-row { transition:background .08s; }
.ra-row:hover { background:#f8fafc!important; }
.ra-dl:hover  { background:#1c5fdc!important; color:#fff!important; border-color:#1c5fdc!important; }
.ra-see:hover { background:#0e7c5b!important; color:#fff!important; border-color:#0e7c5b!important; }
`;

function Svg({ d, w=16, h=16, sw=1.6, color="currentColor" }) {
    return (
        <svg width={w} height={h} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <path d={d}/>
        </svg>
    );
}

const IC = {
    award:   "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
    file:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
    dl:      "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
    check:   "M20 6L9 17l-5-5",
    clock:   "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
    chevron: "M9 18l6-6-6-6",
    lock:    "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
    info:    "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 7v5m0 4v.01",
};

export default function RapportAneaq({ dossier, documents = [] }) {
    const hasRapport = documents.length > 0;
    const dernierRapport = documents[0] ?? null;

    return (
        <>
            <Head title="Rapport ANEAQ — ANEAQ"/>
            <style>{CSS}</style>
            <div className="ra-wrap" style={{ background:"#f4f6fb", minHeight:"100vh" }}>

                {/* ── Header ── */}
                <div style={{ background:"#fff", borderBottom:"1px solid #e4e7f0", padding:"18px 32px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                        <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500 }}>Espace établissement</span>
                        <Svg d={IC.chevron} w={10} h={10} color="#d1d5db" sw={2}/>
                        <span style={{ fontSize:11, color:"#0e7c5b", fontWeight:600 }}>Rapport ANEAQ</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{
                                width:40, height:40, borderRadius:10, flexShrink:0,
                                background:"#ecfaf4", border:"1px solid #c6f0df",
                                display:"flex", alignItems:"center", justifyContent:"center",
                            }}>
                                <Svg d={IC.award} w={18} h={18} color="#0e7c5b" sw={1.7}/>
                            </div>
                            <div>
                                <h1 style={{ fontSize:18, fontWeight:700, color:"#1a1f2e", margin:"0 0 2px", letterSpacing:"-.02em" }}>
                                    Rapport ANEAQ
                                </h1>
                                <p style={{ fontSize:12, color:"#8891aa", margin:0 }}>
                                    Rapport final d'autoévaluation validé par la DEE
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

                    {/* status banner */}
                    {hasRapport ? (
                        <div style={{
                            padding:"12px 16px", borderRadius:8,
                            background:"#ecfaf4", border:"1px solid #c6f0df",
                            display:"flex", alignItems:"center", gap:10,
                        }}>
                            <Svg d={IC.check} w={15} h={15} color="#0e7c5b" sw={2.5}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"#0e7c5b" }}>
                                Votre rapport d'autoévaluation a été validé par la DEE.
                            </span>
                            <span style={{ fontSize:11, color:"#8891aa", marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace" }}>
                                {new Date(dernierRapport.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}
                            </span>
                        </div>
                    ) : (
                        <div style={{
                            padding:"12px 16px", borderRadius:8,
                            background:"#f4f6fb", border:"1px solid #e4e7f0",
                            display:"flex", alignItems:"center", gap:10,
                        }}>
                            <Svg d={IC.info} w={15} h={15} color="#8891aa" sw={1.8}/>
                            <span style={{ fontSize:13, color:"#5c6480" }}>
                                Aucun rapport validé disponible pour le moment. Il apparaîtra ici une fois validé par la DEE.
                            </span>
                        </div>
                    )}

                    {/* read-only notice */}
                    <div style={{
                        padding:"10px 14px", borderRadius:8,
                        background:"#fdf5ec", border:"1px solid #fde8cc",
                        display:"flex", alignItems:"center", gap:8,
                    }}>
                        <Svg d={IC.lock} w={14} h={14} color="#b35c00" sw={1.8}/>
                        <span style={{ fontSize:12, color:"#b35c00" }}>
                            Cette page est en <b>lecture seule</b>. Les documents sont déposés exclusivement par la DEE.
                        </span>
                    </div>

                    {/* ── Documents list ── */}
                    <div style={{ background:"#fff", border:"1px solid #e4e7f0", borderRadius:12, overflow:"hidden" }}>
                        <div style={{
                            padding:"11px 18px", borderBottom:"1px solid #f1f5f9",
                            background:"#fafbfc", display:"flex", alignItems:"center", gap:8,
                        }}>
                            <Svg d={IC.file} w={14} h={14} color="#8891aa" sw={1.7}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"#1a1f2e" }}>
                                Rapport{documents.length > 1 ? "s" : ""} disponible{documents.length > 1 ? "s" : ""}
                            </span>
                            <span style={{
                                marginLeft:"auto", fontSize:10, fontWeight:700,
                                padding:"2px 8px", borderRadius:999,
                                background: hasRapport ? "#ecfaf4" : "#f4f6fb",
                                color: hasRapport ? "#0e7c5b" : "#8891aa",
                                border: `1px solid ${hasRapport ? "#c6f0df" : "#e4e7f0"}`,
                            }}>{documents.length} rapport{documents.length !== 1 ? "s" : ""}</span>
                        </div>

                        {documents.length === 0 ? (
                            <div style={{ padding:"56px 24px", textAlign:"center" }}>
                                <div style={{
                                    width:56, height:56, borderRadius:14,
                                    background:"#f4f6fb", border:"1px solid #e4e7f0",
                                    margin:"0 auto 14px",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                    <Svg d={IC.award} w={24} h={24} color="#d1d5db" sw={1.5}/>
                                </div>
                                <p style={{ fontSize:15, fontWeight:700, color:"#374151", margin:"0 0 6px" }}>
                                    Rapport en attente de validation
                                </p>
                                <p style={{ fontSize:12, color:"#9ca3af", margin:0, maxWidth:360, marginLeft:"auto", marginRight:"auto", lineHeight:1.6 }}>
                                    Votre rapport d'autoévaluation final apparaîtra ici une fois que la DEE l'aura validé et déposé.
                                </p>
                            </div>
                        ) : (
                            <div>
                                {documents.map((doc, i) => (
                                    <div key={doc.id} className="ra-row" style={{
                                        padding:"16px 18px",
                                        borderBottom: i < documents.length - 1 ? "1px solid #f4f6fb" : "none",
                                        background:"#fff",
                                    }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                                            {/* icon */}
                                            <div style={{
                                                width:40, height:40, borderRadius:10, flexShrink:0,
                                                background:"#ecfaf4", border:"1px solid #c6f0df",
                                                display:"flex", alignItems:"center", justifyContent:"center",
                                            }}>
                                                <Svg d={IC.file} w={17} h={17} color="#0e7c5b" sw={2}/>
                                            </div>

                                            {/* info */}
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                                                    <span style={{
                                                        fontSize:13, fontWeight:600, color:"#1a1f2e",
                                                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                                                        maxWidth:320,
                                                    }}>{doc.original_name}</span>
                                                    {i === 0 && (
                                                        <span style={{
                                                            fontSize:9, fontWeight:700, color:"#0e7c5b",
                                                            background:"#ecfaf4", border:"1px solid #c6f0df",
                                                            padding:"2px 7px", borderRadius:999,
                                                            textTransform:"uppercase", letterSpacing:".05em",
                                                        }}>Dernier rapport</span>
                                                    )}
                                                </div>
                                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                                    <span style={{
                                                        fontSize:11, color:"#8891aa",
                                                        fontFamily:"'JetBrains Mono',monospace",
                                                    }}>
                                                        Déposé le {new Date(doc.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}
                                                    </span>
                                                    <span style={{
                                                        fontSize:9.5, fontWeight:700, color:"#0e7c5b",
                                                        background:"#ecfaf4", border:"1px solid #c6f0df",
                                                        padding:"1px 7px", borderRadius:999,
                                                        textTransform:"uppercase", letterSpacing:".04em",
                                                    }}>Validé</span>
                                                </div>
                                                {doc.observation && (
                                                    <p style={{
                                                        fontSize:12, color:"#5c6480", margin:"7px 0 0",
                                                        padding:"6px 10px", background:"#f9fafb",
                                                        borderRadius:6, border:"1px solid #f1f5f9",
                                                        lineHeight:1.6,
                                                    }}>
                                                        <b style={{ color:"#3d4461" }}>Note DEE : </b>
                                                        {doc.observation}
                                                    </p>
                                                )}
                                            </div>

                                            {/* actions */}
                                            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                                                {doc.url && (
                                                    <a className="ra-see"
                                                        href={doc.source === 'expert' ? doc.url : route("etablissement.documents.voir", doc.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display:"inline-flex", alignItems:"center", gap:4,
                                                            padding:"6px 13px", borderRadius:7,
                                                            border:"1px solid #c6f0df", background:"#ecfaf4",
                                                            color:"#0e7c5b", fontSize:12, fontWeight:600,
                                                            textDecoration:"none", transition:"all .1s",
                                                        }}>
                                                        <Svg d={IC.eye} w={13} h={13} color="currentColor" sw={2}/>
                                                        Voir
                                                    </a>
                                                )}
                                                {doc.url && (
                                                    <a className="ra-dl"
                                                        href={doc.source === 'expert' ? doc.url : route("etablissement.documents.telecharger", doc.id)}
                                                        download={doc.source === 'expert' ? true : undefined}
                                                        target={doc.source === 'expert' ? "_blank" : undefined}
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display:"inline-flex", alignItems:"center", gap:4,
                                                            padding:"6px 13px", borderRadius:7,
                                                            border:"1px solid #d6e4fb", background:"#eef3fd",
                                                            color:"#1c5fdc", fontSize:12, fontWeight:600,
                                                            textDecoration:"none", transition:"all .1s",
                                                        }}>
                                                        <Svg d={IC.dl} w={13} h={13} color="currentColor" sw={2}/>
                                                        Télécharger
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

RapportAneaq.layout = page => <EtablissementLayout active="rapport-aneaq">{page}</EtablissementLayout>;