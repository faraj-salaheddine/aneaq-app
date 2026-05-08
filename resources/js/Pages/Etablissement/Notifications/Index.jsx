import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE = {
    info:    { label: "Info",    ink: "#1c5fdc", bg: "#eef3fd", border: "#d6e4fb", dot: "#1c5fdc" },
    warning: { label: "Alerte",  ink: "#b35c00", bg: "#fdf5ec", border: "#fde8cc", dot: "#b35c00" },
    urgent:  { label: "Urgent",  ink: "#b91c1c", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" },
    success: { label: "Succès",  ink: "#0e7c5b", bg: "#ecfaf4", border: "#c6f0df", dot: "#0e7c5b" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.nf-wrap{font-family:'Inter',sans-serif;}
.nf-wrap *{box-sizing:border-box;}
.nf-row{transition:background .08s;}
.nf-row:hover{background:#f8fafc!important;}
.nf-fbtn{transition:background .1s,color .1s,border-color .1s;}
.nf-mark{transition:background .1s,color .1s;}
.nf-mark:hover{background:#0e7c5b!important;color:#fff!important;border-color:#0e7c5b!important;}
.nf-allread{transition:all .12s;}
.nf-allread:hover{background:#0e7c5b!important;color:#fff!important;border-color:#0e7c5b!important;}
select:focus{outline:none;}
`;

function Svg({ d, w = 16, h = 16, sw = 1.6, color = "currentColor" }) {
    return (
        <svg width={w} height={h} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <path d={d}/>
        </svg>
    );
}

const ICONS = {
    bell:    "M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
    check:   "M20 6L9 17l-5-5",
    info:    "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5m0 4v.01",
    warn:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4v.01",
    ok:      "M20 6L9 17l-5-5",
    chevron: "M9 18l6-6-6-6",
    filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
};

export default function Index({ notifications = [], nonLues = 0 }) {
    const { flash } = usePage().props;
    const [filter, setFilter]     = useState("all");
    const [typeFilter, setTypeFilter] = useState("");

    const filtered = notifications.filter(n => {
        const matchRead = filter === "all"
            || (filter === "unread" && !n.lu)
            || (filter === "read"   &&  n.lu);
        const matchType = !typeFilter || n.type === typeFilter;
        return matchRead && matchType;
    });

    const handleMarquerLu  = id => router.patch(`/etablissement/notifications/${id}/lire`, {}, { preserveScroll: true });
    const handleToutLire   = ()  => router.patch("/etablissement/notifications/tout-lire",  {}, { preserveScroll: true });

    const counts = {
        total:   notifications.length,
        unread:  nonLues,
        alerts:  notifications.filter(n => n.type === "warning" || n.type === "urgent").length,
        read:    notifications.filter(n => n.lu).length,
    };

    const STATS = [
        { label: "Total",        value: counts.total,  color: "#1c5fdc", bg: "#eef3fd",  border: "#d6e4fb"  },
        { label: "Non lues",     value: counts.unread, color: "#b91c1c", bg: "#fef2f2",  border: "#fecaca"  },
        { label: "Alertes",      value: counts.alerts, color: "#b35c00", bg: "#fdf5ec",  border: "#fde8cc"  },
        { label: "Lues",         value: counts.read,   color: "#0e7c5b", bg: "#ecfaf4",  border: "#c6f0df"  },
    ];

    const FILTERS = [
        { key: "all",    label: "Toutes",   count: counts.total  },
        { key: "unread", label: "Non lues", count: counts.unread },
        { key: "read",   label: "Lues",     count: counts.read   },
    ];

    return (
        <>
            <Head title="Notifications — ANEAQ"/>
            <style>{CSS}</style>
            <div className="nf-wrap" style={{ background: "#f4f6fb", minHeight: "100vh" }}>

                {/* ── Page header ── */}
                <div style={{
                    background: "#fff", borderBottom: "1px solid #e4e7f0",
                    padding: "18px 32px 0",
                }}>
                    {/* breadcrumb */}
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                        <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500 }}>Espace établissement</span>
                        <Svg d={ICONS.chevron} w={10} h={10} color="#d1d5db" sw={2}/>
                        <span style={{ fontSize:11, color:"#1c5fdc", fontWeight:600 }}>Notifications</span>
                    </div>

                    {/* title row */}
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, paddingBottom:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            {/* bell icon block */}
                            <div style={{
                                width:40, height:40, borderRadius:10,
                                background:"#eef3fd", border:"1px solid #d6e4fb",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                position:"relative", flexShrink:0,
                            }}>
                                <Svg d={ICONS.bell} w={18} h={18} color="#1c5fdc" sw={1.8}/>
                                {nonLues > 0 && (
                                    <span style={{
                                        position:"absolute", top:-5, right:-5,
                                        minWidth:17, height:17, borderRadius:999,
                                        background:"#ef4444", color:"#fff",
                                        fontSize:9, fontWeight:800,
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        padding:"0 4px", border:"2px solid #fff",
                                    }}>{nonLues}</span>
                                )}
                            </div>
                            <div>
                                <h1 style={{ fontSize:18, fontWeight:700, color:"#1a1f2e", margin:"0 0 2px", letterSpacing:"-.02em" }}>
                                    Notifications
                                </h1>
                                <p style={{ fontSize:12, color:"#8891aa", margin:0 }}>
                                    {nonLues > 0
                                        ? <><b style={{ color:"#ef4444", fontWeight:700 }}>{nonLues} non lue{nonLues > 1 ? "s" : ""}</b> · </>
                                        : "Tout est à jour · "
                                    }
                                    {counts.total} au total
                                </p>
                            </div>
                        </div>

                        {nonLues > 0 && (
                            <button className="nf-allread" onClick={handleToutLire} style={{
                                display:"flex", alignItems:"center", gap:6,
                                padding:"8px 16px", borderRadius:8,
                                border:"1px solid #c6f0df", background:"#ecfaf4",
                                color:"#0e7c5b", fontSize:12, fontWeight:600,
                                cursor:"pointer",
                            }}>
                                <Svg d={ICONS.check} w={13} h={13} color="currentColor" sw={2.5}/>
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {/* filter tabs */}
                    <div style={{ display:"flex", gap:0 }}>
                        {FILTERS.map(f => (
                            <button key={f.key} className="nf-fbtn" onClick={() => setFilter(f.key)} style={{
                                padding:"10px 16px", border:"none", cursor:"pointer",
                                background:"transparent", fontSize:13, fontWeight:500,
                                color: filter === f.key ? "#1c5fdc" : "#8891aa",
                                borderBottom: filter === f.key ? "2px solid #1c5fdc" : "2px solid transparent",
                                marginBottom:-1,
                            }}>
                                {f.label}
                                <span style={{
                                    marginLeft:6, fontSize:10, fontWeight:700,
                                    padding:"1px 6px", borderRadius:999,
                                    background: filter === f.key ? "#eef3fd" : "#f4f6fb",
                                    color: filter === f.key ? "#1c5fdc" : "#9ca3af",
                                }}>{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content ── */}
                <div style={{ padding:"20px 32px" }}>

                    {/* flash */}
                    {flash?.success && (
                        <div style={{
                            marginBottom:16, padding:"11px 16px", borderRadius:8,
                            background:"#ecfaf4", border:"1px solid #c6f0df",
                            display:"flex", alignItems:"center", gap:8,
                        }}>
                            <Svg d={ICONS.check} w={14} h={14} color="#0e7c5b" sw={2.5}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"#0e7c5b" }}>{flash.success}</span>
                        </div>
                    )}

                    {/* stat cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
                        {STATS.map((s, i) => (
                            <div key={i} style={{
                                background:"#fff", border:`1px solid ${s.border}`,
                                borderRadius:10, padding:"13px 16px",
                                display:"flex", alignItems:"center", gap:12,
                            }}>
                                <div style={{
                                    width:36, height:36, borderRadius:8,
                                    background:s.bg, flexShrink:0,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                    <span style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.value}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize:13, fontWeight:700, color:"#1a1f2e" }}>{s.value}</div>
                                    <div style={{ fontSize:11, color:"#8891aa", marginTop:1 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* list card */}
                    <div style={{
                        background:"#fff", border:"1px solid #e4e7f0",
                        borderRadius:12, overflow:"hidden",
                    }}>
                        {/* toolbar */}
                        <div style={{
                            padding:"10px 18px", borderBottom:"1px solid #f1f5f9",
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            background:"#fafbfc",
                        }}>
                            <span style={{ fontSize:11, fontWeight:600, color:"#8891aa", textTransform:"uppercase", letterSpacing:".06em" }}>
                                {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
                            </span>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <Svg d={ICONS.filter} w={12} h={12} color="#9ca3af" sw={1.5}/>
                                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
                                    padding:"5px 10px", border:"1px solid #e4e7f0",
                                    borderRadius:7, fontSize:12, color: typeFilter ? "#1a1f2e" : "#9ca3af",
                                    background:"#fff", cursor:"pointer", outline:"none",
                                    fontFamily:"'Inter',sans-serif",
                                }}>
                                    <option value="">Tous les types</option>
                                    <option value="info">Info</option>
                                    <option value="warning">Alerte</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="success">Succès</option>
                                </select>
                            </div>
                        </div>

                        {/* empty state */}
                        {filtered.length === 0 ? (
                            <div style={{ padding:"56px 32px", textAlign:"center" }}>
                                <div style={{
                                    width:52, height:52, borderRadius:12, background:"#f4f6fb",
                                    border:"1px solid #e4e7f0",
                                    margin:"0 auto 12px",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                    <Svg d={ICONS.bell} w={22} h={22} color="#d1d5db" sw={1.5}/>
                                </div>
                                <p style={{ fontSize:14, fontWeight:600, color:"#374151", margin:"0 0 4px" }}>Aucune notification</p>
                                <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>Vous êtes à jour !</p>
                            </div>
                        ) : filtered.map((notif, i) => {
                            const m = TYPE[notif.type] || TYPE.info;
                            const iconD = notif.type === "warning" || notif.type === "urgent"
                                ? ICONS.warn
                                : notif.type === "success"
                                ? ICONS.ok
                                : ICONS.info;
                            return (
                                <div key={notif.id} className="nf-row" style={{
                                    display:"flex", alignItems:"flex-start", gap:14,
                                    padding:"14px 18px",
                                    borderBottom: i < filtered.length - 1 ? "1px solid #f4f6fb" : "none",
                                    background: notif.lu ? "#fff" : "#fafbfe",
                                }}>
                                    {/* unread dot */}
                                    <div style={{
                                        width:6, height:6, borderRadius:"50%", flexShrink:0,
                                        marginTop:6,
                                        background: notif.lu ? "transparent" : "#ef4444",
                                    }}/>

                                    {/* icon */}
                                    <div style={{
                                        width:36, height:36, borderRadius:9,
                                        background:m.bg, border:`1px solid ${m.border}`,
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        flexShrink:0,
                                    }}>
                                        <Svg d={iconD} w={15} h={15} color={m.ink} sw={2}/>
                                    </div>

                                    {/* content */}
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
                                            <span style={{
                                                fontSize:9.5, fontWeight:700,
                                                color:m.ink, background:m.bg,
                                                border:`1px solid ${m.border}`,
                                                padding:"2px 7px", borderRadius:999,
                                                textTransform:"uppercase", letterSpacing:".04em",
                                            }}>{m.label}</span>
                                            {!notif.lu && (
                                                <span style={{
                                                    fontSize:9.5, fontWeight:700,
                                                    color:"#b91c1c", background:"#fef2f2",
                                                    border:"1px solid #fecaca",
                                                    padding:"2px 7px", borderRadius:999,
                                                    textTransform:"uppercase", letterSpacing:".04em",
                                                }}>Nouveau</span>
                                            )}
                                            <span style={{ fontSize:11, color:"#9ca3af", marginLeft:"auto" }}>
                                                {notif.created_at}
                                            </span>
                                        </div>
                                        <p style={{ fontSize:13, color: notif.lu ? "#5c6480" : "#1a1f2e", margin:0, lineHeight:1.6, fontWeight: notif.lu ? 400 : 500 }}>
                                            {notif.message}
                                        </p>
                                    </div>

                                    {/* mark as read */}
                                    {!notif.lu && (
                                        <button className="nf-mark" onClick={() => handleMarquerLu(notif.id)} style={{
                                            padding:"5px 11px", borderRadius:7, flexShrink:0,
                                            border:"1px solid #c6f0df", background:"#ecfaf4",
                                            color:"#0e7c5b", fontSize:11, fontWeight:600,
                                            cursor:"pointer",
                                        }}>
                                            Marquer lu
                                        </button>
                                    )}
                                    {notif.lu && (
                                        <span style={{
                                            display:"flex", alignItems:"center", gap:4,
                                            fontSize:11, color:"#c4c9d4", flexShrink:0, paddingTop:2,
                                        }}>
                                            <Svg d={ICONS.check} w={12} h={12} color="#c4c9d4" sw={2}/>
                                            Lu
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = page => <EtablissementLayout active="notifications">{page}</EtablissementLayout>;