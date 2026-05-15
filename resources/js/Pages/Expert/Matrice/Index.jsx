import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";

/* ── Design tokens ── */
const BLUE   = "#0C447C";
const BLIGHT = "#1a6abf";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#DC2626";

const PRIO = {
    haute:   { label: "Haute",   color: RED,    bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
    moyenne: { label: "Moyenne", color: ORANGE, bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
    basse:   { label: "Basse",   color: GREEN,  bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
};

export default function MatriceIndex({
    expert,
    dossier,
    criteres      = [],
    recommandations = [],
    dejaSoumis,
}) {
    const etab = dossier.etablissement;

    const [lignes, setLignes] = useState(
        recommandations.length > 0
            ? recommandations.map(r => ({
                id:             r.id,
                critere_id:     r.critere_id     ?? "",
                constat:        r.constat        ?? "",
                point_fort:     r.point_fort     ?? "",
                point_faible:   r.point_faible   ?? "",
                recommandation: r.recommandation ?? "",
                priorite:       r.priorite       ?? "moyenne",
            }))
            : [newLigne()]
    );
    const [submitted,  setSubmitted]  = useState(dejaSoumis);
    const [saving,     setSaving]     = useState(false);
    const [confirmDlg, setConfirmDlg] = useState({ open: false });

    function newLigne() {
        return { id: null, critere_id: "", constat: "", point_fort: "", point_faible: "", recommandation: "", priorite: "moyenne" };
    }

    const update    = (i, f, v) => setLignes(p => p.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
    const addLigne  = () => setLignes(p => [...p, newLigne()]);
    const removeLigne = i => setLignes(p => p.filter((_, idx) => idx !== i));

    const sauvegarder = async () => {
        setSaving(true);
        try {
            await axios.post(route("expert.recommandations.sauvegarder", dossier.id), { lignes });
        } finally {
            setSaving(false);
        }
    };

    const soumettre = () => {
        setConfirmDlg({
            open: true,
            title: "Soumettre la matrice",
            message: "La matrice sera verrouillée et transmise à la DEE. Cette action est irréversible.",
            confirmLabel: "Soumettre",
            type: "info",
            onConfirm: () => {
                setConfirmDlg({ open: false });
                router.post(route("expert.recommandations.soumettre", dossier.id), {}, {
                    onSuccess: () => setSubmitted(true),
                });
            },
        });
    };

    const nHaute   = lignes.filter(l => l.priorite === "haute").length;
    const nMoyenne = lignes.filter(l => l.priorite === "moyenne").length;
    const nBasse   = lignes.filter(l => l.priorite === "basse").length;

    return (
        <>
            <Head title="Matrice de recommandations" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', system-ui, sans-serif; }

                @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin    { to { transform: rotate(360deg); } }

                .fu  { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
                .d1  { animation-delay:.06s; }
                .d2  { animation-delay:.12s; }
                .d3  { animation-delay:.18s; }

                .mat-row { transition: background .12s; }
                .mat-row:hover { background: #f8fafc !important; }

                .back-btn { transition: background .15s, transform .15s; }
                .back-btn:hover { background: #f1f5f9 !important; transform: translateX(-2px); }

                textarea, select { font-family: inherit; outline: none; transition: border-color .15s, box-shadow .15s; }
                textarea:focus, select:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px ${BLUE}1a !important; }

                .prio-btn { transition: background .12s, border-color .12s, transform .1s, box-shadow .12s; }
                .prio-btn:hover:not(:disabled) { transform: scale(1.05); }

                ::-webkit-scrollbar { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4f8 0%,#e8eef5 100%)", padding: "2rem 1.5rem 5rem" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto" }}>

                    {/* ── Top bar ── */}
                    <div className="fu" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 26, flexWrap: "wrap" }}>
                        <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>
                            <a href="/expert/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>Espace Expert</a>
                            <Chev />
                            <button onClick={() => router.visit(route("expert.dossiers.show", dossier.id))}
                                style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}>
                                {etab?.acronyme || "Dossier"}
                            </button>
                            <Chev />
                            <span style={{ color: BLUE, fontWeight: 800 }}>Matrice</span>
                        </nav>
                        <button className="back-btn" onClick={() => router.visit(route("expert.dossiers.show", dossier.id))}
                            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            <ArrowLeft size={14} /> Retour au dossier
                        </button>
                    </div>

                    {/* ── Hero ── */}
                    <div className="fu d1" style={{ borderRadius: 22, overflow: "hidden", marginBottom: 22, boxShadow: `0 10px 40px ${BLUE}28` }}>
                        <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1558a8 55%, #0d6abf 100%)`, padding: "2.2rem 2.5rem 1.8rem", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
                            <div style={{ position: "absolute", bottom: -30, right: 160, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
                            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                        <span style={{ padding: "4px 14px", borderRadius: 30, background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em" }}>
                                            Matrice de recommandations
                                        </span>
                                        {submitted && (
                                            <span style={{ padding: "4px 14px", borderRadius: 30, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 }}>
                                                ✓ Soumise
                                            </span>
                                        )}
                                    </div>
                                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                                        {etab?.acronyme || "—"} — {etab?.ville || "—"}
                                    </h1>
                                    <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,.72)", fontWeight: 500 }}>
                                        Vague {dossier.campagne || dossier.vague || "—"} · {lignes.length} ligne{lignes.length !== 1 ? "s" : ""} de recommandation{lignes.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                {/* Priority summary chips */}
                                <div style={{ display: "flex", gap: 10 }}>
                                    {[
                                        { key: "haute",   icon: "🔴", label: "Haute",   n: nHaute   },
                                        { key: "moyenne", icon: "🟠", label: "Moyenne", n: nMoyenne },
                                        { key: "basse",   icon: "🟢", label: "Basse",   n: nBasse   },
                                    ].map(s => (
                                        <div key={s.key} style={{ background: "rgba(255,255,255,.13)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 16, padding: ".8rem 1.1rem", textAlign: "center", minWidth: 70 }}>
                                            <p style={{ margin: "0 0 2px", fontSize: 20 }}>{s.icon}</p>
                                            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.n}</p>
                                            <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em" }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Progress bar footer */}
                        <div style={{ background: "#fff", padding: ".9rem 2.5rem", borderTop: "1px solid #e8edf3", display: "flex", alignItems: "center", gap: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".12em" }}>Priorités</span>
                            <div style={{ flex: 1, height: 8, borderRadius: 99, background: "#f1f5f9", overflow: "hidden", display: "flex" }}>
                                {lignes.length > 0 && <>
                                    <div style={{ width: `${(nHaute   / lignes.length) * 100}%`, background: RED,    transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
                                    <div style={{ width: `${(nMoyenne / lignes.length) * 100}%`, background: ORANGE, transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
                                    <div style={{ width: `${(nBasse   / lignes.length) * 100}%`, background: GREEN,  transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
                                </>}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>{lignes.length} ligne{lignes.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    {/* ── Submitted banner ── */}
                    {submitted && (
                        <div className="fu d1" style={{ marginBottom: 18, borderRadius: 14, background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#166534" }}>Matrice soumise et verrouillée</p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#15803d", fontWeight: 500 }}>La DEE a été notifiée. Vous ne pouvez plus modifier cette matrice.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Table card ── */}
                    <div className="fu d2" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(12,68,124,.07)" }}>

                        {/* Card header */}
                        <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${ORANGE}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.2">
                                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                                        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                                    </svg>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Recommandations par critère</p>
                                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{lignes.length} ligne{lignes.length !== 1 ? "s" : ""} au total</p>
                                </div>
                            </div>
                            {!submitted && (
                                <button onClick={addLigne}
                                    style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${BLUE}30`, background: `${BLUE}08`, color: BLUE, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "background .15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = `${BLUE}14`}
                                    onMouseLeave={e => e.currentTarget.style.background = `${BLUE}08`}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    Ajouter une ligne
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>
                                <thead>
                                    <tr style={{ background: "#fafbfc", borderBottom: "2px solid #f1f5f9" }}>
                                        <th style={TH}>#</th>
                                        <th style={{ ...TH, minWidth: 180 }}>Critère</th>
                                        <th style={{ ...TH, minWidth: 175 }}>Constat</th>
                                        <th style={{ ...TH, minWidth: 175 }}>Point fort</th>
                                        <th style={{ ...TH, minWidth: 175 }}>Point faible</th>
                                        <th style={{ ...TH, minWidth: 200 }}>Recommandation</th>
                                        <th style={{ ...TH, minWidth: 160 }}>Priorité</th>
                                        {!submitted && <th style={TH}></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lignes.map((l, i) => (
                                        <tr key={i} className="mat-row" style={{ borderBottom: "1px solid #f1f5f9" }}>

                                            {/* Row number */}
                                            <td style={{ ...TD, width: 44, textAlign: "center" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: "#f1f5f9", fontSize: 12, fontWeight: 800, color: "#64748b" }}>
                                                    {i + 1}
                                                </span>
                                            </td>

                                            {/* Critère select */}
                                            <td style={TD}>
                                                <select value={l.critere_id ?? ""} onChange={e => update(i, "critere_id", e.target.value)} disabled={submitted}
                                                    style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "#374151", background: submitted ? "#f8fafc" : "#fff", cursor: submitted ? "default" : "pointer" }}>
                                                    <option value="">— Choisir —</option>
                                                    {criteres.map(c => (
                                                        <option key={c.id} value={c.id}>{c.code} — {c.libelle}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Text areas */}
                                            {["constat", "point_fort", "point_faible", "recommandation"].map(f => (
                                                <td key={f} style={TD}>
                                                    <textarea value={l[f]} onChange={e => update(i, f, e.target.value)} rows={2}
                                                        disabled={submitted}
                                                        placeholder={f === "point_fort" ? "point fort" : f === "point_faible" ? "point faible" : f}
                                                        style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 12, fontWeight: 500, color: "#1e293b", resize: "vertical", lineHeight: 1.6, background: submitted ? "#f8fafc" : "#fff" }}
                                                    />
                                                </td>
                                            ))}

                                            {/* Priority selector */}
                                            <td style={{ ...TD, verticalAlign: "middle" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                    {Object.entries(PRIO).map(([key, meta]) => {
                                                        const selected = l.priorite === key;
                                                        return (
                                                            <button key={key} type="button" className="prio-btn"
                                                                disabled={submitted}
                                                                onClick={() => update(i, "priorite", key)}
                                                                style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${selected ? meta.color : "#e2e8f0"}`, background: selected ? meta.color : "#fff", color: selected ? "#fff" : meta.text, fontSize: 11, fontWeight: 800, cursor: submitted ? "default" : "pointer", textAlign: "center", boxShadow: selected ? `0 2px 8px ${meta.color}44` : "none", letterSpacing: ".04em" }}>
                                                                {meta.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>

                                            {/* Remove button */}
                                            {!submitted && (
                                                <td style={{ ...TD, textAlign: "center", width: 48 }}>
                                                    {lignes.length > 1 && (
                                                        <button onClick={() => removeLigne(i)}
                                                            style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #fee2e2", background: "#fef2f2", color: RED, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background .12s" }}
                                                            onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                                                            onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
                                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Footer actions ── */}
                        {!submitted && (
                            <div style={{ padding: "1.1rem 1.5rem", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", gap: 10 }}>
                                <button onClick={sauvegarder} disabled={saving}
                                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 11, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .7 : 1, transition: "background .15s" }}
                                    onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#f8fafc"; }}
                                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                                    {saving ? (
                                        <>
                                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                            Sauvegarde…
                                        </>
                                    ) : (
                                        <>
                                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                            Sauvegarder
                                        </>
                                    )}
                                </button>

                                <button onClick={soumettre}
                                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 11, border: "none", background: `linear-gradient(135deg, ${BLUE}, ${BLIGHT})`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 16px ${BLUE}40`, letterSpacing: ".01em", transition: "opacity .15s, transform .1s" }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    Soumettre la matrice
                                </button>

                                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>
                                    {lignes.length} ligne{lignes.length !== 1 ? "s" : ""} · auto-sauvegarde recommandée avant soumission
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDlg.open}
                title={confirmDlg.title}
                message={confirmDlg.message}
                confirmLabel={confirmDlg.confirmLabel}
                type={confirmDlg.type}
                onConfirm={confirmDlg.onConfirm}
                onCancel={() => setConfirmDlg({ open: false })}
            />
        </>
    );
}

/* ── Style constants ── */
const TH = {
    textAlign: "left",
    padding: "11px 14px",
    fontSize: 10,
    fontWeight: 800,
    color: "#94a3b8",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
};

const TD = {
    padding: "12px 14px",
    verticalAlign: "top",
};

/* ── Icons ── */
function ArrowLeft({ size = 16 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}
function Chev() {
    return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}

MatriceIndex.layout = page => <ExpertLayout active="dossiers">{page}</ExpertLayout>;
