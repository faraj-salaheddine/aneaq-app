import { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

// ─── Action metadata ──────────────────────────────────────────────────────────
const ACTION_LABELS = {
    dossier_cree:                  "Dossier créé",
    dossier_mis_a_jour:            "Dossier mis à jour",
    dossier_supprime:              "Dossier supprimé",
    rapport_depose:                "Rapport déposé",
    document_complementaire_depose:"Document complémentaire déposé",
    annexe_enregistree:            "Annexe enregistrée",
    profil_mis_a_jour:             "Profil mis à jour",
    question_posee:                "Question posée",
    question_repondue:             "Réponse reçue",
    expert_affecte:                "Expert affecté",
    expert_confirme:               "Expert confirmé",
    expert_refuse:                 "Expert refusé",
};

const ACTION_META = [
    { matches: ["cree","créé","creation"],     ink: "#0e7c5b", bg: "#ecfaf4", border: "#c6f0df", d: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8zM19 8v6M22 11h-6" },
    { matches: ["mis_a_jour","modifié","update"]  ,ink: "#1c5fdc", bg: "#eef3fd", border: "#d6e4fb", d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" },
    { matches: ["depose","déposé","rapport","document","annexe","enregistree"], ink: "#b35c00", bg: "#fdf5ec", border: "#fde8cc", d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" },
    { matches: ["supprime","supprimé","delete"],  ink: "#b91c1c", bg: "#fef2f2", border: "#fecaca", d: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" },
    { matches: ["connecte","connecté","login"],   ink: "#5046a8", bg: "#f0effc", border: "#dddaf7", d: "M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" },
    { matches: ["question","reponse","repondue"], ink: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
    { matches: ["expert"],                        ink: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", d: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
];
const DEFAULT_META = { ink: "#5c6480", bg: "#f4f6fb", border: "#e4e7f0", d: "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" };

function getMeta(action) {
    if (!action) return DEFAULT_META;
    const a = action.toLowerCase();
    return ACTION_META.find(m => m.matches.some(kw => a.includes(kw))) || DEFAULT_META;
}

function getLabel(action) {
    return ACTION_LABELS[action] ?? action?.replace(/_/g, " ") ?? "—";
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
.hx { font-family:'Inter',sans-serif; }
.hx *, .hx *::before, .hx *::after { box-sizing:border-box; }
.hx-row { transition:background .08s; }
.hx-row:hover { background:#f8fafc!important; }
.hx-input { font-family:'Inter',sans-serif; }
.hx-input:focus { border-color:#1c5fdc!important; box-shadow:0 0 0 3px rgba(28,95,220,.07); outline:none; }
.hx-sel:focus { outline:none; border-color:#1c5fdc!important; }
.hx-page-btn { transition:background .1s,color .1s; }
.hx-page-btn:hover:not(:disabled) { background:#f4f6fb!important; }
.hx-clear:hover { background:#fef2f2!important; }
details summary::-webkit-details-marker { display:none; }
`;

function Svg({ d, w = 16, h = 16, sw = 1.6, color = "currentColor" }) {
    return (
        <svg width={w} height={h} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <path d={d}/>
        </svg>
    );
}

const IC = {
    clock:    "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
    search:   "M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z",
    filter:   "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    chevron:  "M9 18l6-6-6-6",
    chevdown: "M6 9l6 6 6-9",
    x:        "M18 6L6 18M6 6l12 12",
    arrow:    "M5 12h14M12 5l7 7-7 7",
    user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
    building: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h2v4m4 0v-4h2v4M9 10h2v2H9v-2zm4 0h2v2h-2v-2z",
};

export default function Index({ etablissement, logs = [] }) {
    const [search,   setSearch]   = useState("");
    const [action,   setAction]   = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo,   setDateTo]   = useState("");
    const [page,     setPage]     = useState(1);
    const PAGE_SIZE = 15;

    const uniqueActions = [...new Set(logs.map(l => l.action).filter(Boolean))];

    const filtered = useMemo(() => {
        const s = search.toLowerCase();
        return logs.filter(l => {
            const matchS = !s || [l.action, l.model_name, l.details, l.performed_by]
                .some(v => (v || "").toLowerCase().includes(s));
            const matchA = !action   || l.action === action;
            const matchF = !dateFrom || l.created_at >= dateFrom;
            const matchT = !dateTo   || l.created_at <= dateTo + " 23:59";
            return matchS && matchA && matchF && matchT;
        });
    }, [logs, search, action, dateFrom, dateTo]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const activeF    = [search, action, dateFrom, dateTo].filter(Boolean).length;

    const reset = () => { setSearch(""); setAction(""); setDateFrom(""); setDateTo(""); setPage(1); };
    const go    = (n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

    const matchAction = (log, kws) => kws.some(kw => (log.action ?? "").toLowerCase().includes(kw));
    const SUMMARY = [
        { label: "Total",         value: logs.length,                                                                    color: "#1c5fdc", bg: "#eef3fd", border: "#d6e4fb" },
        { label: "Créations",     value: logs.filter(l => matchAction(l, ["cree","créé"])).length,                       color: "#0e7c5b", bg: "#ecfaf4", border: "#c6f0df" },
        { label: "Modifications", value: logs.filter(l => matchAction(l, ["mis_a_jour","modifié"])).length,              color: "#1c5fdc", bg: "#eef3fd", border: "#d6e4fb" },
        { label: "Documents",     value: logs.filter(l => matchAction(l, ["depose","document","annexe","rapport"])).length, color: "#b35c00", bg: "#fdf5ec", border: "#fde8cc" },
        { label: "Suppressions",  value: logs.filter(l => matchAction(l, ["supprime","supprimé"])).length,               color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    ];

    return (
        <>
            <Head title="Historique — ANEAQ"/>
            <style>{CSS}</style>
            <div className="hx" style={{ background:"#f4f6fb", minHeight:"100vh" }}>

                {/* ── Page header ── */}
                <div style={{ background:"#fff", borderBottom:"1px solid #e4e7f0", padding:"18px 32px 16px" }}>
                    {/* breadcrumb */}
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                        <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500 }}>Espace établissement</span>
                        <Svg d={IC.chevron} w={10} h={10} color="#d1d5db" sw={2}/>
                        <span style={{ fontSize:11, color:"#1c5fdc", fontWeight:600 }}>Historique</span>
                    </div>

                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{
                                width:40, height:40, borderRadius:10, flexShrink:0,
                                background:"#f4f6fb", border:"1px solid #e4e7f0",
                                display:"flex", alignItems:"center", justifyContent:"center",
                            }}>
                                <Svg d={IC.clock} w={18} h={18} color="#5c6480" sw={1.7}/>
                            </div>
                            <div>
                                <h1 style={{ fontSize:18, fontWeight:700, color:"#1a1f2e", margin:"0 0 2px", letterSpacing:"-.02em" }}>
                                    Historique des activités
                                </h1>
                                <p style={{ fontSize:12, color:"#8891aa", margin:0 }}>
                                    <b style={{ color:"#1a1f2e", fontWeight:600 }}>{filtered.length}</b> entrée{filtered.length !== 1 ? "s" : ""}
                                    {activeF > 0 && <span style={{ color:"#1c5fdc" }}> filtrées</span>}
                                    {" · "}{logs.length} au total
                                </p>
                            </div>
                        </div>

                        {/* Etablissement badge */}
                        {etablissement && (
                            <div style={{
                                display:"flex", alignItems:"center", gap:8,
                                padding:"7px 12px", borderRadius:8,
                                background:"#f4f6fb", border:"1px solid #e4e7f0",
                            }}>
                                <Svg d={IC.building} w={14} h={14} color="#8891aa" sw={1.5}/>
                                <span style={{ fontSize:12, fontWeight:600, color:"#3d4461" }}>
                                    {etablissement?.etablissement || etablissement?.nom || "—"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Content ── */}
                <div style={{ padding:"20px 32px", display:"grid", gridTemplateColumns:"1fr 256px", gap:18, alignItems:"start" }}>

                    {/* ── Main column ── */}
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

                        {/* stat cards */}
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                            {SUMMARY.map((s, i) => (
                                <div key={i} style={{
                                    background:"#fff", border:`1px solid ${s.border}`,
                                    borderRadius:9, padding:"11px 14px",
                                }}>
                                    <div style={{ fontSize:18, fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</div>
                                    <div style={{ fontSize:10.5, color:"#8891aa", marginTop:3, fontWeight:500 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* list card */}
                        <div style={{ background:"#fff", border:"1px solid #e4e7f0", borderRadius:12, overflow:"hidden" }}>

                            {/* toolbar */}
                            <div style={{
                                padding:"10px 16px", borderBottom:"1px solid #f1f5f9",
                                background:"#fafbfc", display:"flex", gap:7, alignItems:"center", flexWrap:"wrap",
                            }}>
                                {/* search */}
                                <div style={{ position:"relative", flex:1, minWidth:180 }}>
                                    <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                                        <Svg d={IC.search} w={13} h={13} color="#9ca3af" sw={2}/>
                                    </span>
                                    <input className="hx-input" type="text" placeholder="Rechercher…" value={search}
                                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                                        style={{
                                            paddingLeft:30, paddingRight:10, paddingTop:6, paddingBottom:6,
                                            width:"100%", border:"1px solid #e4e7f0", borderRadius:7,
                                            fontSize:12.5, color:"#1a1f2e", background:"#fff",
                                            transition:"border-color .12s, box-shadow .12s",
                                        }}
                                    />
                                </div>

                                {/* action select */}
                                <select className="hx-sel" value={action}
                                    onChange={e => { setAction(e.target.value); setPage(1); }}
                                    style={{
                                        padding:"6px 10px", border:"1px solid #e4e7f0", borderRadius:7,
                                        fontSize:12, color: action ? "#1a1f2e" : "#9ca3af",
                                        background:"#fff", cursor:"pointer",
                                        fontFamily:"'Inter',sans-serif",
                                        transition:"border-color .12s",
                                    }}
                                >
                                    <option value="">Toutes les actions</option>
                                    {uniqueActions.map(a => <option key={a} value={a}>{getLabel(a)}</option>)}
                                </select>

                                {/* date range */}
                                <input className="hx-input" type="date" value={dateFrom}
                                    onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                                    style={{
                                        padding:"6px 10px", border:"1px solid #e4e7f0", borderRadius:7,
                                        fontSize:12, color: dateFrom ? "#1a1f2e" : "#9ca3af",
                                        background:"#fff", cursor:"pointer",
                                        transition:"border-color .12s, box-shadow .12s",
                                    }}
                                />
                                <span style={{ fontSize:11, color:"#c4c9d4", flexShrink:0 }}>→</span>
                                <input className="hx-input" type="date" value={dateTo}
                                    onChange={e => { setDateTo(e.target.value); setPage(1); }}
                                    style={{
                                        padding:"6px 10px", border:"1px solid #e4e7f0", borderRadius:7,
                                        fontSize:12, color: dateTo ? "#1a1f2e" : "#9ca3af",
                                        background:"#fff", cursor:"pointer",
                                        transition:"border-color .12s, box-shadow .12s",
                                    }}
                                />

                                {activeF > 0 && (
                                    <button className="hx-clear" onClick={reset} style={{
                                        display:"flex", alignItems:"center", gap:4,
                                        padding:"6px 10px", borderRadius:7,
                                        border:"1px solid #fecaca", background:"#fff",
                                        color:"#b91c1c", fontSize:11.5, fontWeight:600, cursor:"pointer",
                                        transition:"background .1s",
                                    }}>
                                        <Svg d={IC.x} w={11} h={11} color="currentColor" sw={2.5}/>
                                        Effacer ({activeF})
                                    </button>
                                )}
                            </div>

                            {/* empty */}
                            {paginated.length === 0 ? (
                                <div style={{ padding:"52px 24px", textAlign:"center" }}>
                                    <div style={{
                                        width:48, height:48, borderRadius:12,
                                        background:"#f4f6fb", border:"1px solid #e4e7f0",
                                        margin:"0 auto 12px",
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                    }}>
                                        <Svg d={IC.clock} w={20} h={20} color="#d1d5db" sw={1.5}/>
                                    </div>
                                    <p style={{ fontSize:14, fontWeight:600, color:"#374151", margin:"0 0 4px" }}>Aucune activité</p>
                                    <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>
                                        {activeF > 0 ? "Essayez de modifier vos filtres" : "Votre historique apparaîtra ici"}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {paginated.map((log, i) => {
                                        const m = getMeta(log.action);
                                        const hasChanges = log.details?.includes("→");
                                        return (
                                            <div key={log.id} className="hx-row" style={{
                                                display:"flex", alignItems:"flex-start", gap:12,
                                                padding:"12px 16px",
                                                borderBottom: i < paginated.length - 1 ? "1px solid #f4f6fb" : "none",
                                                background:"#fff", position:"relative",
                                            }}>
                                                {/* timeline connector */}
                                                {i < paginated.length - 1 && (
                                                    <div style={{
                                                        position:"absolute", left:27, top:44, bottom:0,
                                                        width:1, background:"#f1f5f9",
                                                    }}/>
                                                )}

                                                {/* icon */}
                                                <div style={{
                                                    width:30, height:30, borderRadius:8, flexShrink:0, zIndex:1,
                                                    background:m.bg, border:`1px solid ${m.border}`,
                                                    display:"flex", alignItems:"center", justifyContent:"center",
                                                }}>
                                                    <Svg d={m.d} w={13} h={13} color={m.ink} sw={2}/>
                                                </div>

                                                {/* content */}
                                                <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                                                        <span style={{
                                                            fontSize:9.5, fontWeight:700,
                                                            color:m.ink, background:m.bg,
                                                            border:`1px solid ${m.border}`,
                                                            padding:"1px 7px", borderRadius:999,
                                                            textTransform:"uppercase", letterSpacing:".04em",
                                                        }}>{getLabel(log.action)}</span>
                                                        <span style={{
                                                            fontSize:11, color:"#9ca3af",
                                                            marginLeft:"auto", flexShrink:0,
                                                            fontFamily:"'JetBrains Mono',monospace",
                                                        }}>{log.created_at}</span>
                                                    </div>

                                                    {log.model_name && (
                                                        <p style={{ fontSize:12.5, color:"#1a1f2e", fontWeight:500, margin:"0 0 3px" }}>
                                                            {log.model_name}
                                                        </p>
                                                    )}

                                                    {/* details */}
                                                    {hasChanges ? (
                                                        <details style={{ marginTop:4 }}>
                                                            <summary style={{
                                                                fontSize:11, color:"#1c5fdc", fontWeight:600,
                                                                cursor:"pointer", display:"flex", alignItems:"center", gap:4,
                                                                userSelect:"none",
                                                            }}>
                                                                <Svg d={IC.chevdown} w={11} h={11} color="currentColor" sw={2}/>
                                                                Voir les modifications
                                                            </summary>
                                                            <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:4 }}>
                                                                {log.details.split(" | ").map((change, idx) => {
                                                                    const [field, rest] = change.split(": ");
                                                                    const [from, to]    = (rest || "").split(" → ");
                                                                    return (
                                                                        <div key={idx} style={{
                                                                            display:"flex", alignItems:"center", gap:5,
                                                                            flexWrap:"wrap", fontSize:11,
                                                                        }}>
                                                                            <span style={{ fontWeight:600, color:"#3d4461" }}>{field}</span>
                                                                            <span style={{
                                                                                padding:"1px 6px", borderRadius:4,
                                                                                background:"#fef2f2", color:"#991b1b",
                                                                                fontFamily:"'JetBrains Mono',monospace", fontSize:10.5,
                                                                            }}>{from}</span>
                                                                            <Svg d={IC.arrow} w={10} h={10} color="#c4c9d4" sw={2}/>
                                                                            <span style={{
                                                                                padding:"1px 6px", borderRadius:4,
                                                                                background:"#ecfaf4", color:"#166534",
                                                                                fontFamily:"'JetBrains Mono',monospace", fontSize:10.5,
                                                                            }}>{to}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </details>
                                                    ) : log.details ? (
                                                        <p style={{ fontSize:11.5, color:"#8891aa", margin:"3px 0 0" }}>
                                                            {log.details}
                                                        </p>
                                                    ) : null}

                                                    {/* performed by */}
                                                    <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:5 }}>
                                                        <Svg d={IC.user} w={11} h={11} color="#c4c9d4" sw={1.5}/>
                                                        <span style={{ fontSize:11, color:"#9ca3af" }}>
                                                            par <b style={{ color:"#5c6480", fontWeight:600 }}>{log.performed_by}</b>
                                                            {log.role && <span style={{ color:"#c4c9d4" }}> · {log.role}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* pagination */}
                            {filtered.length > PAGE_SIZE && (
                                <div style={{
                                    padding:"10px 16px", borderTop:"1px solid #f1f5f9",
                                    background:"#fafbfc",
                                    display:"flex", justifyContent:"space-between", alignItems:"center",
                                }}>
                                    <span style={{ fontSize:11.5, color:"#8891aa" }}>
                                        <b style={{ color:"#1a1f2e" }}>{(page-1)*PAGE_SIZE+1}</b>–
                                        <b style={{ color:"#1a1f2e" }}>{Math.min(page*PAGE_SIZE, filtered.length)}</b>
                                        {" sur "}
                                        <b style={{ color:"#1a1f2e" }}>{filtered.length}</b>
                                    </span>
                                    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                                        <button className="hx-page-btn" onClick={() => go(Math.max(1, page-1))} disabled={page===1} style={{
                                            padding:"5px 11px", borderRadius:7, border:"1px solid #e4e7f0",
                                            background:"#fff", fontSize:12, fontWeight:600,
                                            color: page===1 ? "#d1d5db" : "#3d4461",
                                            cursor: page===1 ? "not-allowed" : "pointer",
                                        }}>← Précédent</button>

                                        {/* page numbers */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let p;
                                            if (totalPages <= 5) p = i + 1;
                                            else if (page <= 3) p = i + 1;
                                            else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                            else p = page - 2 + i;
                                            return (
                                                <button key={p} className="hx-page-btn" onClick={() => go(p)} style={{
                                                    width:30, height:30, borderRadius:7,
                                                    border: p===page ? "1px solid #1c5fdc" : "1px solid #e4e7f0",
                                                    background: p===page ? "#1c5fdc" : "#fff",
                                                    color: p===page ? "#fff" : "#3d4461",
                                                    fontSize:12, fontWeight:600, cursor:"pointer",
                                                }}>{p}</button>
                                            );
                                        })}

                                        <button className="hx-page-btn" onClick={() => go(Math.min(totalPages, page+1))} disabled={page===totalPages} style={{
                                            padding:"5px 11px", borderRadius:7, border:"1px solid #e4e7f0",
                                            background:"#fff", fontSize:12, fontWeight:600,
                                            color: page===totalPages ? "#d1d5db" : "#3d4461",
                                            cursor: page===totalPages ? "not-allowed" : "pointer",
                                        }}>Suivant →</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right sidebar ── */}
                    <div style={{ display:"flex", flexDirection:"column", gap:10, position:"sticky", top:20 }}>

                        {/* summary */}
                        <div style={{ background:"#fff", border:"1px solid #e4e7f0", borderRadius:10, overflow:"hidden" }}>
                            <div style={{ padding:"10px 14px", borderBottom:"1px solid #f1f5f9", background:"#fafbfc" }}>
                                <span style={{ fontSize:10, fontWeight:700, color:"#8891aa", textTransform:"uppercase", letterSpacing:".08em" }}>
                                    Résumé
                                </span>
                            </div>
                            {SUMMARY.map((s, i) => (
                                <div key={i} style={{
                                    display:"flex", justifyContent:"space-between", alignItems:"center",
                                    padding:"9px 14px",
                                    borderBottom: i < SUMMARY.length-1 ? "1px solid #f4f6fb" : "none",
                                }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                        <div style={{ width:7, height:7, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                                        <span style={{ fontSize:12, color:"#5c6480" }}>{s.label}</span>
                                    </div>
                                    <span style={{
                                        fontSize:13, fontWeight:700, color:s.color,
                                        padding:"1px 8px", borderRadius:999,
                                        background:s.bg, border:`1px solid ${s.border}`,
                                    }}>{s.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* établissement info */}
                        <div style={{ background:"#fff", border:"1px solid #e4e7f0", borderRadius:10, overflow:"hidden" }}>
                            <div style={{ padding:"10px 14px", borderBottom:"1px solid #f1f5f9", background:"#fafbfc" }}>
                                <span style={{ fontSize:10, fontWeight:700, color:"#8891aa", textTransform:"uppercase", letterSpacing:".08em" }}>
                                    Établissement
                                </span>
                            </div>
                            <div style={{ padding:"12px 14px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                                    <div style={{
                                        width:32, height:32, borderRadius:8,
                                        background:"#eef3fd", border:"1px solid #d6e4fb",
                                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                                    }}>
                                        <Svg d={IC.building} w={14} h={14} color="#1c5fdc" sw={1.6}/>
                                    </div>
                                    <div>
                                        <p style={{ fontSize:12.5, fontWeight:700, color:"#1a1f2e", margin:0 }}>
                                            {etablissement?.etablissement || etablissement?.nom || "—"}
                                        </p>
                                        <p style={{ fontSize:11, color:"#8891aa", margin:"1px 0 0" }}>
                                            {etablissement?.ville || "—"}
                                        </p>
                                    </div>
                                </div>
                                {etablissement?.universite && (
                                    <p style={{ fontSize:11, color:"#5c6480", margin:0, padding:"7px 9px", background:"#f4f6fb", borderRadius:6 }}>
                                        {etablissement.universite}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* active filters */}
                        {activeF > 0 && (
                            <div style={{ background:"#eef3fd", border:"1px solid #d6e4fb", borderRadius:10, padding:"10px 14px" }}>
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                                    <span style={{ fontSize:10, fontWeight:700, color:"#1c5fdc", textTransform:"uppercase", letterSpacing:".08em" }}>
                                        Filtres actifs
                                    </span>
                                    <button onClick={reset} style={{
                                        fontSize:10, fontWeight:700, color:"#b91c1c",
                                        background:"none", border:"none", cursor:"pointer", padding:0,
                                    }}>Effacer tout</button>
                                </div>
                                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                    {search    && <Tag label={`"${search}"`}   onRemove={() => setSearch("")}/>}
                                    {action    && <Tag label={getLabel(action)} onRemove={() => setAction("")}/>}
                                    {dateFrom  && <Tag label={`Depuis ${dateFrom}`} onRemove={() => setDateFrom("")}/>}
                                    {dateTo    && <Tag label={`Jusqu'au ${dateTo}`} onRemove={() => setDateTo("")}/>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Tag({ label, onRemove }) {
    return (
        <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"4px 8px", borderRadius:6,
            background:"#fff", border:"1px solid #d6e4fb",
        }}>
            <span style={{ fontSize:11, color:"#1c5fdc", fontWeight:500 }}>{label}</span>
            <button onClick={onRemove} style={{
                background:"none", border:"none", cursor:"pointer", padding:0,
                color:"#8891aa", display:"flex", alignItems:"center",
            }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    );
}

Index.layout = page => <EtablissementLayout active="historique">{page}</EtablissementLayout>;