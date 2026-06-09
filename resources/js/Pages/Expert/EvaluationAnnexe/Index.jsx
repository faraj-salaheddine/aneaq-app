import { useState, useCallback, useMemo } from "react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";
import PreviewModal from "@/Components/PreviewModal";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const NOTE_OPTS = [
    { val: 0, label: "Absent",        color: "#c0344a", bg: "#fdf0f2", border: "#f8cdd3" },
    { val: 1, label: "Non conforme",  color: "#b35c00", bg: "#fdf5ec", border: "#fde8cc" },
    { val: 2, label: "Acceptable",    color: "#5046a8", bg: "#f0effc", border: "#dddaf7" },
    { val: 3, label: "Conforme",      color: "#0e7c5b", bg: "#ecfaf4", border: "#c6f0df" },
];
const noteOpt = val => NOTE_OPTS.find(o => o.val === val) ?? null;

/* ─────────── CSS ─────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
:root{
  --ink:#1a1f2e;--ink2:#2d3348;--slate:#5c6480;--muted:#8891aa;
  --border:#e4e7f0;--border2:#d0d5e8;--bg:#f5f6fa;--surface:#ffffff;--surface2:#f9fafc;
  --accent:#1c5fdc;--accent-s:#eef3fd;--accent-t:#d6e4fb;
  --emerald:#0e7c5b;--emerald-h:#0b6449;--emerald-s:#ecfaf4;--emerald-t:#c6f0df;
  --sand:#b35c00;--sand-s:#fdf5ec;--sand-t:#fde8cc;
  --rose:#c0344a;--rose-s:#fdf0f2;--rose-t:#f8cdd3;
  --indigo:#5046a8;--indigo-s:#f0effc;--indigo-t:#dddaf7;
}
.ea{font-family:'Inter',sans-serif;background:var(--bg);min-height:100vh;color:var(--ink);}
.ea *{box-sizing:border-box;}
.ea-header{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;}
.ea-header-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 28px 14px;}
.ea-header h1{font-size:18px;font-weight:700;color:var(--ink);margin:0 0 3px;letter-spacing:-.02em;}
.ea-header p{font-size:12px;color:var(--muted);margin:0;line-height:1.5;}
.ea-pills{display:flex;gap:6px;flex-shrink:0;margin-top:2px;}
.ea-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;white-space:nowrap;border:1px solid;}
.ea-pill.confirmed{background:var(--emerald-s);color:var(--emerald);border-color:var(--emerald-t);}
.ea-pill.left{background:var(--surface2);color:var(--slate);border-color:var(--border);}
.ea-pill.lock{background:#fdf5ff;color:#7c3aed;border-color:#e9d5ff;}
.ea-bar{display:flex;align-items:center;gap:8px;padding:9px 28px 11px;border-top:1px solid var(--border);flex-wrap:wrap;}
.ea-bar-info{font-size:11px;color:var(--muted);flex:1;min-width:160px;}
.ea-bar-info b{color:var(--emerald);}
.ea-progress{padding:10px 28px 14px;}
.ea-progress-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.ea-progress-label{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;}
.ea-progress-count{font-size:11px;color:var(--muted);}
.ea-progress-count b{color:var(--ink);font-weight:700;}
.ea-progress-track{height:4px;background:var(--border);border-radius:999px;overflow:hidden;}
.ea-progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--emerald));transition:width .5s;}
.ea-pct{display:inline-block;padding:1px 6px;border-radius:999px;font-size:10px;font-weight:700;margin-left:7px;background:var(--accent-s);color:var(--accent);}
.ea-pct.ok{background:var(--emerald-s);color:var(--emerald);}

/* domain/champ/ref */
.ea-body{padding:0;}
.ea-domain{border-bottom:1px solid var(--border);}
.ea-domain:last-child{border-bottom:none;}
.ea-domain-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:13px 28px;background:var(--surface);border:none;cursor:pointer;text-align:left;transition:background .1s;gap:12px;}
.ea-domain-btn:hover,.ea-domain-btn.open{background:var(--surface2);}
.ea-domain-letter{width:32px;height:32px;border-radius:7px;flex-shrink:0;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.ea-domain-title{font-size:13.5px;font-weight:600;color:var(--ink);flex:1;text-align:left;}
.ea-domain-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.ea-mini-bar{width:72px;height:3px;background:var(--border2);border-radius:999px;overflow:hidden;}
.ea-mini-fill{height:100%;border-radius:999px;background:var(--accent);transition:width .4s;}
.ea-mini-fill.full{background:var(--emerald);}
.ea-mini-frac{font-size:11px;font-weight:600;color:var(--muted);min-width:36px;text-align:right;}
.ea-chevron{width:15px;height:15px;color:var(--muted);transition:transform .18s ease;flex-shrink:0;}
.ea-chevron.open{transform:rotate(180deg);}
.ea-domain-content{border-top:2px solid var(--accent);background:var(--surface2);}
.ea-champ{border-bottom:1px solid var(--border);}
.ea-champ:last-child{border-bottom:none;}
.ea-champ-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 28px;background:transparent;border:none;cursor:pointer;text-align:left;transition:background .1s;gap:10px;}
.ea-champ-btn:hover{background:var(--surface);}
.ea-champ-code{font-size:9.5px;font-weight:700;color:var(--ink);background:var(--border);padding:2px 7px;border-radius:4px;font-family:'JetBrains Mono',monospace;flex-shrink:0;}
.ea-champ-label{font-size:13px;font-weight:600;color:var(--ink2);flex:1;text-align:left;}
.ea-count{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;flex-shrink:0;border:1px solid;}
.ea-count.full{background:var(--emerald-s);color:var(--emerald);border-color:var(--emerald-t);}
.ea-count.prog{background:var(--accent-s);color:var(--accent);border-color:var(--accent-t);}
.ea-count.zero{background:var(--surface2);color:var(--muted);border-color:var(--border);}
.ea-champ-content{padding:0 0 6px 50px;}
.ea-ref{border-bottom:1px solid var(--border);}
.ea-ref:last-child{border-bottom:none;}
.ea-ref-btn{width:100%;display:flex;align-items:flex-start;justify-content:space-between;padding:9px 28px 9px 0;background:transparent;border:none;cursor:pointer;text-align:left;gap:10px;}
.ea-ref-btn:hover{background:rgba(28,95,220,.025);}
.ea-ref-code{font-size:9px;font-weight:700;color:var(--accent);background:var(--accent-s);padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;flex-shrink:0;margin-top:1px;border:1px solid var(--accent-t);}
.ea-ref-label{font-size:12px;color:var(--slate);line-height:1.55;flex:1;}
.ea-ref-right{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-top:1px;}
.ea-ref-bar{width:32px;height:2px;background:var(--border2);border-radius:999px;overflow:hidden;}
.ea-ref-bar-fill{height:100%;border-radius:999px;background:var(--accent);}
.ea-ref-bar-fill.full{background:var(--emerald);}
.ea-ref-frac{font-size:10px;color:var(--muted);font-weight:600;min-width:24px;}
.ea-critere{border-bottom:1px solid var(--border);}
.ea-critere:last-child{border-bottom:none;}
.ea-critere-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:8px 28px 8px 0;gap:8px;background:var(--surface);}
.ea-critere-badge{font-size:8.5px;font-weight:700;color:var(--accent);background:var(--accent-s);padding:2px 6px;border-radius:4px;flex-shrink:0;margin-top:2px;text-transform:uppercase;letter-spacing:.05em;border:1px solid var(--accent-t);}
.ea-critere-label{font-size:12.5px;font-weight:500;color:var(--ink2);line-height:1.55;flex:1;}
.ea-critere-frac{font-size:10px;font-weight:600;color:var(--muted);flex-shrink:0;margin-top:2px;white-space:nowrap;}

/* proof rows */
.ea-proofs{background:var(--surface);}
.ea-proof{display:flex;align-items:flex-start;border-top:1px solid var(--border);transition:background .15s;}
.ea-proof-accent{width:3px;flex-shrink:0;align-self:stretch;transition:background .15s;}
.ea-proof-main{flex:1;padding:9px 28px 9px 12px;min-width:0;}
.ea-proof-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;cursor:pointer;user-select:none;}
.ea-proof-num{width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;margin-top:1px;background:var(--bg);color:var(--muted);border:1px solid var(--border);transition:all .15s;}
.ea-proof-text{font-size:12.5px;color:var(--ink2);line-height:1.6;flex:1;}
.ea-note-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:9.5px;font-weight:700;flex-shrink:0;white-space:nowrap;border:1px solid;text-transform:uppercase;letter-spacing:.03em;}

/* note buttons */
.ea-note-row{display:flex;gap:6px;flex-wrap:wrap;padding:8px 0 4px;}
.ea-note-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid;transition:all .1s;font-family:'Inter',sans-serif;}
.ea-note-btn:disabled{opacity:.4;pointer-events:none;}

/* confirm / modify / action buttons */
.ea-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid;transition:all .1s;font-family:'Inter',sans-serif;white-space:nowrap;}
.ea-btn:disabled{opacity:.35;pointer-events:none;}
.ea-btn.do-confirm{background:var(--emerald);color:#fff;border-color:var(--emerald);margin-top:10px;}
.ea-btn.do-confirm:hover{background:var(--emerald-h);}
.ea-btn.do-modify{background:var(--surface2);color:var(--slate);border-color:var(--border2);margin-top:8px;font-size:11px;padding:4px 10px;}
.ea-btn.do-modify:hover{background:var(--border);color:var(--ink2);}
.ea-btn.save-draft{background:var(--indigo-s);color:var(--indigo);border-color:var(--indigo-t);font-size:12px;padding:6px 14px;}
.ea-btn.save-draft:hover{background:var(--indigo-t);}
.ea-btn.save-publish{background:var(--emerald);color:#fff;border-color:var(--emerald);font-size:12px;padding:6px 14px;}
.ea-btn.save-publish:hover{background:var(--emerald-h);}
.ea-btn.ghost{background:transparent;color:var(--slate);border-color:var(--border2);}
.ea-btn.ghost:hover{background:var(--surface2);}
.ea-btn.modal-confirm{background:var(--emerald);color:#fff;border-color:var(--emerald);padding:8px 22px;font-size:13px;}

/* file chip / obs */
.ea-chip{display:inline-flex;align-items:center;gap:4px;background:var(--accent-s);border:1px solid var(--accent-t);border-radius:5px;padding:3px 8px;font-size:11px;color:var(--accent);font-family:'JetBrains Mono',monospace;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:5px 0 3px;}
.ea-no-file{font-size:11px;color:var(--muted);font-style:italic;margin:6px 0 3px;display:block;}
.ea-obs{width:100%;resize:vertical;border:1px solid var(--border2);border-radius:6px;padding:7px 10px;font-size:12.5px;font-family:'Inter',sans-serif;color:var(--ink2);background:var(--surface);outline:none;line-height:1.6;transition:border-color .12s;}
.ea-obs:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(28,95,220,.07);}
.ea-obs.readonly{background:var(--surface2);color:var(--slate);cursor:default;}
.ea-field-label{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:8px;margin-bottom:4px;}

/* confirmed row banner */
.ea-confirmed-banner{display:flex;align-items:center;gap:8px;background:var(--emerald-s);border:1px solid var(--emerald-t);border-radius:6px;padding:7px 10px;margin-top:6px;}
.ea-confirmed-banner span{font-size:11px;color:var(--emerald);font-weight:600;flex:1;}

/* spin */
.ea-spin{display:inline-block;width:11px;height:11px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .5s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}

/* modal */
.ea-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;animation:bdin .15s ease;}
@keyframes bdin{from{opacity:0}to{opacity:1}}
.ea-modal{background:var(--surface);border-radius:12px;padding:32px 28px 24px;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.18);animation:mdin .15s ease;}
@keyframes mdin{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
.ea-modal-icon{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;}
.ea-modal h2{font-size:17px;font-weight:700;color:var(--ink);text-align:center;margin:0 0 8px;}
.ea-modal p{font-size:13px;color:var(--slate);text-align:center;line-height:1.6;margin:0 0 24px;}
.ea-modal-actions{display:flex;gap:10px;justify-content:center;}

.ea-locked-bar{background:#fdf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:10px 16px;margin:6px 28px 0;display:flex;align-items:center;gap:10px;}
.ea-locked-bar span{font-size:12px;color:#7c3aed;font-weight:500;}

/* ── SWOT ── */
.ea-swot{margin:10px 28px 14px;border:1px solid var(--border2);border-radius:10px;overflow:hidden;}
.ea-swot-title{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--ink);cursor:pointer;user-select:none;}
.ea-swot-title h4{font-size:12px;font-weight:700;color:#fff;letter-spacing:.04em;text-transform:uppercase;margin:0;flex:1;}
.ea-swot-title span{font-size:10px;color:rgba(255,255,255,.6);}
.ea-swot-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;}
.ea-swot-cell{padding:12px 14px;border-top:1px solid var(--border);}
.ea-swot-cell:nth-child(odd){border-right:1px solid var(--border);}
.ea-swot-cell-hdr{display:flex;align-items:center;gap:6px;margin-bottom:6px;}
.ea-swot-cell-hdr span{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;}
.ea-swot-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.ea-swot-ta{width:100%;resize:vertical;border:1px solid var(--border2);border-radius:6px;padding:6px 9px;font-size:12px;font-family:'Inter',sans-serif;color:var(--ink2);background:var(--surface);outline:none;line-height:1.55;transition:border-color .12s;min-height:72px;}
.ea-swot-ta:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(28,95,220,.06);}
.ea-swot-ta.readonly{background:var(--surface2);color:var(--slate);cursor:default;}
.ea-swot-badge{display:inline-block;font-size:9px;font-weight:700;padding:1px 7px;border-radius:999px;margin-left:6px;}
.ea-swot-saved{font-size:10px;color:var(--emerald);font-weight:600;margin-left:auto;}

/* ── graphical summary ── */
.ea-view-tabs{display:flex;gap:8px;padding:11px 28px;background:var(--surface);border-bottom:1px solid var(--border);}
.ea-view-tab{display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:7px;border:1px solid var(--border2);background:var(--surface);color:var(--slate);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;}
.ea-view-tab:hover{background:var(--surface2);color:var(--ink);}
.ea-view-tab.active{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 4px 12px rgba(28,95,220,.18);}
.ea-report{display:flex;flex-direction:column;gap:18px;padding:20px 28px 36px;}
.ea-report-card{overflow:hidden;border:1px solid var(--border);border-radius:12px;background:var(--surface);box-shadow:0 4px 16px rgba(26,31,46,.04);}
.ea-report-title{display:flex;align-items:center;gap:12px;padding:11px 16px;background:#eaf0f7;border-bottom:1px solid #d9e2ef;}
.ea-report-title h2,.ea-report-title h3{flex:1;margin:0;color:var(--ink);font-size:13px;font-weight:700;}
.ea-report-title h2{font-size:14px;text-align:center;}
.ea-score-label{font-size:10px;color:var(--slate);font-weight:700;text-transform:uppercase;letter-spacing:.06em;}
.ea-score-box{min-width:76px;padding:5px 12px;border-radius:4px;color:#fff;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;text-align:center;}
.ea-report-subtitle{padding:11px 16px;border-bottom:1px solid var(--border);color:var(--slate);font-size:11px;text-align:center;}
.ea-report-global{display:grid;grid-template-columns:minmax(250px,.85fr) minmax(0,1.15fr);gap:20px;padding:16px;}
.ea-summary-table{width:100%;border-collapse:collapse;font-size:11px;}
.ea-summary-table th{padding:8px 9px;border:1px solid var(--border2);background:var(--surface2);color:var(--slate);font-weight:700;text-align:left;}
.ea-summary-table td{padding:8px 9px;border:1px solid var(--border);color:var(--ink2);}
.ea-summary-table td:last-child,.ea-summary-table th:last-child{text-align:right;}
.ea-summary-code{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:var(--accent);}
.ea-chart-wrap{min-width:0;}
.ea-chart-title{margin:0 0 8px;color:var(--ink2);font-size:11px;font-weight:700;text-align:center;}
.ea-chart{height:245px;}
.ea-chart-global{height:330px;}
.ea-domain-charts{padding:16px;}
.ea-domain-charts.with-radar{display:grid;grid-template-columns:minmax(300px,.85fr) minmax(0,1.15fr);gap:20px;}
.ea-domain-charts.single-chart .ea-chart-wrap{max-width:760px;margin:0 auto;}
.ea-chart-note{margin:3px 0 0;color:var(--muted);font-size:10px;text-align:center;}
.ea-report-empty{padding:34px 20px;color:var(--muted);font-size:12px;text-align:center;}
@media (max-width:900px){
  .ea-report-global,.ea-domain-charts.with-radar{grid-template-columns:1fr;}
  .ea-chart{height:220px;}
  .ea-chart-global{height:300px;}
}
@media (max-width:640px){
  .ea-view-tabs,.ea-report{padding-left:14px;padding-right:14px;}
  .ea-report-title{align-items:flex-start;flex-wrap:wrap;}
  .ea-report-title h2{text-align:left;}
  .ea-score-label{margin-left:auto;}
}
`;

if (typeof document !== "undefined" && !document.getElementById("ea-css")) {
    const s = document.createElement("style");
    s.id = "ea-css"; s.textContent = CSS;
    document.head.appendChild(s);
}

/* ── Note selector ── */
function NoteSelector({ value, onChange, disabled }) {
    return (
        <div className="ea-note-row">
            {NOTE_OPTS.map(o => {
                const sel = value === o.val;
                return (
                    <button key={o.val}
                        className="ea-note-btn"
                        style={{
                            background:   sel ? o.bg      : "var(--surface2)",
                            borderColor:  sel ? o.border  : "var(--border2)",
                            color:        sel ? o.color   : "var(--muted)",
                            boxShadow:    sel ? `0 0 0 2px ${o.border}` : "none",
                        }}
                        onClick={() => onChange(o.val)}
                        disabled={disabled}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{o.val}</span>
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ── SWOT panel per domain ── */
const SWOT_FIELDS = [
    { key: "forces",      label: "Forces",       dot: "#0e7c5b", bg: "#ecfaf4", border: "#c6f0df", placeholder: "Points forts, atouts du domaine…" },
    { key: "faiblesses",  label: "Faiblesses",   dot: "#c0344a", bg: "#fdf0f2", border: "#f8cdd3", placeholder: "Points faibles, lacunes identifiées…" },
    { key: "opportunites",label: "Opportunités",  dot: "#1c5fdc", bg: "#eef3fd", border: "#d6e4fb", placeholder: "Perspectives, leviers de développement…" },
    { key: "menaces",     label: "Menaces",       dot: "#b35c00", bg: "#fdf5ec", border: "#fde8cc", placeholder: "Risques, contraintes externes…" },
];

function SwotPanel({ domaine, swotState, onSwotChange, locked }) {
    const [open, setOpen] = useState(false);
    const sw = swotState[domaine] ?? { forces:"", faiblesses:"", opportunites:"", menaces:"" };
    const filled = SWOT_FIELDS.filter(f => sw[f.key]?.trim()).length;
    return (
        <div className="ea-swot">
            <div className="ea-swot-title" onClick={() => setOpen(o => !o)}>
                <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:"rgba(255,255,255,.7)", background:"rgba(255,255,255,.12)", borderRadius:4, padding:"2px 7px" }}>
                    SWOT
                </span>
                <h4>Analyse SWOT — Domaine {domaine}</h4>
                {filled > 0 && (
                    <span className="ea-swot-badge" style={{ background:"#ecfaf4", color:"#0e7c5b" }}>
                        {filled}/4 rempli{filled>1?"s":""}
                    </span>
                )}
                <svg style={{ width:14, height:14, color:"rgba(255,255,255,.5)", transform: open ? "rotate(180deg)" : "none", transition:"transform .18s", flexShrink:0 }} viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            {open && (
                <div className="ea-swot-grid">
                    {SWOT_FIELDS.map(f => (
                        <div key={f.key} className="ea-swot-cell" style={{ background: sw[f.key]?.trim() ? f.bg : undefined }}>
                            <div className="ea-swot-cell-hdr">
                                <div className="ea-swot-dot" style={{ background: f.dot }}/>
                                <span style={{ color: f.dot }}>{f.label}</span>
                            </div>
                            <textarea
                                className={`ea-swot-ta${locked ? " readonly" : ""}`}
                                placeholder={locked ? "" : f.placeholder}
                                value={sw[f.key] ?? ""}
                                readOnly={locked}
                                onChange={e => !locked && onSwotChange(domaine, f.key, e.target.value)}
                                style={sw[f.key]?.trim() ? { borderColor: f.border } : {}}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Proof row ── */
function ProofRow({ preuve, critereId, evalState, onUpdate, onConfirm, locked }) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const key = `${critereId}_${preuve.index}`;
    const ev  = evalState[key] ?? { note: null, observation: "", confirmed: false };
    const opt = noteOpt(ev.note);
    const isConfirmed = ev.confirmed;

    const accentBg = isConfirmed ? (opt?.bg ?? "var(--emerald-s)") : (ev.note !== null ? "#fffbf0" : "transparent");

    return (
        <div className="ea-proof" style={{ background: accentBg }}>
            <div className="ea-proof-accent" style={{ background: isConfirmed ? (opt?.color ?? "var(--emerald)") : (ev.note !== null ? "var(--sand)" : "transparent") }}/>
            <div className="ea-proof-main">

                {/* Header */}
                <div className="ea-proof-top" onClick={() => setOpen(o => !o)}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:8, flex:1 }}>
                        <span className="ea-proof-num" style={isConfirmed ? { background: opt?.bg, color: opt?.color, borderColor: opt?.border } : {}}>
                            {isConfirmed ? "✓" : preuve.index + 1}
                        </span>
                        <span className="ea-proof-text" style={isConfirmed ? { color:"var(--ink)", fontWeight:500 } : {}}>{preuve.label}</span>
                    </div>
                    <span className="ea-note-badge" style={opt
                        ? { background: opt.bg, color: opt.color, borderColor: opt.border }
                        : { background:"var(--surface2)", color:"var(--muted)", borderColor:"var(--border)" }}>
                        {isConfirmed ? `✓ ${opt.val} — ${opt.label}` : (opt ? `${opt.val} — ${opt.label}` : "Non évalué")}
                    </span>
                </div>

                {open && (
                    <div style={{ marginLeft:27, paddingBottom:10 }}>
                        {/* File */}
                        {preview && <PreviewModal url={preview.url} fileName={preview.fileName} onClose={() => setPreview(null)} />}
                        {preuve.soumis && preuve.fichier_nom ? (
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <span className="ea-chip">📄 {preuve.fichier_nom}</span>
                                <button
                                    title="Visualiser le fichier"
                                    onClick={() => setPreview({ url: route("etablissement.annexes.voir", { criterePreuve: preuve.fichier_id }), fileName: preuve.fichier_nom })}
                                    style={{ width:26, height:26, borderRadius:6, border:"1px solid var(--border)", background:"var(--surface2)", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--accent)", flexShrink:0, transition:"background .12s,border-color .12s" }}
                                    onMouseEnter={e=>{e.currentTarget.style.background="var(--accent-s)";e.currentTarget.style.borderColor="var(--accent-t)";}}
                                    onMouseLeave={e=>{e.currentTarget.style.background="var(--surface2)";e.currentTarget.style.borderColor="var(--border)";}}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                            </div>
                        ) : (
                            <span className="ea-no-file">Aucun fichier soumis par l'établissement</span>
                        )}

                        {/* Note */}
                        <div className="ea-field-label">Note</div>
                        <NoteSelector
                            value={ev.note}
                            onChange={note => onUpdate(critereId, preuve.index, { ...ev, note, confirmed: false })}
                            disabled={locked || isConfirmed}
                        />

                        {/* Observation */}
                        <div className="ea-field-label">Observation</div>
                        <textarea
                            className={`ea-obs${(locked || isConfirmed) ? " readonly" : ""}`}
                            rows={3}
                            placeholder={isConfirmed || locked ? "" : "Observation, commentaire…"}
                            value={ev.observation ?? ""}
                            readOnly={locked || isConfirmed}
                            onChange={e => !locked && !isConfirmed && onUpdate(critereId, preuve.index, { ...ev, observation: e.target.value })}
                        />

                        {/* Confirmed banner */}
                        {isConfirmed && (
                            <div className="ea-confirmed-banner">
                                <span>✓ Évaluation confirmée</span>
                                {!locked && (
                                    <button className="ea-btn do-modify"
                                        onClick={() => onUpdate(critereId, preuve.index, { ...ev, confirmed: false })}>
                                        ✏ Modifier
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Confirm button — appears only when note is set and not yet confirmed */}
                        {!locked && !isConfirmed && ev.note !== null && (
                            <button className="ea-btn do-confirm"
                                onClick={() => { onConfirm(critereId, preuve.index); setOpen(false); }}>
                                ✓ Confirmer cette évaluation
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function Critere({ critere, evalState, onUpdate, onConfirm, locked }) {
    const confirmed = critere.preuves.filter(p => evalState[`${critere.id}_${p.index}`]?.confirmed).length;
    return (
        <div className="ea-critere">
            <div className="ea-critere-hdr">
                <span className="ea-critere-badge">Critère {critere.critere_num}</span>
                <span className="ea-critere-label">{critere.critere_label}</span>
                <span className="ea-critere-frac" style={confirmed===critere.total&&critere.total>0?{color:"var(--emerald)",fontWeight:700}:{}}>
                    {confirmed}/{critere.total}
                </span>
            </div>
            <div className="ea-proofs">
                {critere.preuves.map(p => (
                    <ProofRow key={p.index} preuve={p} critereId={critere.id}
                        evalState={evalState} onUpdate={onUpdate} onConfirm={onConfirm} locked={locked}/>
                ))}
            </div>
        </div>
    );
}

function Reference({ reference, evalState, onUpdate, onConfirm, locked }) {
    const [open, setOpen] = useState(false);
    const tot = reference.criteres.reduce((a, c) => a + c.total, 0);
    const ev  = reference.criteres.reduce((a, c) => a + c.preuves.filter(p => evalState[`${c.id}_${p.index}`]?.confirmed).length, 0);
    const pct = tot > 0 ? Math.round((ev / tot) * 100) : 0;
    return (
        <div className="ea-ref">
            <button className="ea-ref-btn" onClick={() => setOpen(o => !o)}>
                <span className="ea-ref-code">{reference.reference}</span>
                <span className="ea-ref-label">{reference.reference_label}</span>
                <div className="ea-ref-right">
                    <div className="ea-ref-bar"><div className={`ea-ref-bar-fill${pct===100?" full":""}`} style={{ width:`${pct}%` }}/></div>
                    <span className="ea-ref-frac">{ev}/{tot}</span>
                    <svg className={`ea-chevron${open?" open":""}`} viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </button>
            {open && reference.criteres.map(c => (
                <Critere key={c.id} critere={c} evalState={evalState} onUpdate={onUpdate} onConfirm={onConfirm} locked={locked}/>
            ))}
        </div>
    );
}

function Champ({ champ, evalState, onUpdate, onConfirm, locked }) {
    const [open, setOpen] = useState(false);
    const tot  = champ.references.reduce((a, r) => a + r.criteres.reduce((b, c) => b + c.total, 0), 0);
    const conf = champ.references.reduce((a, r) => a + r.criteres.reduce((b, c) => b + c.preuves.filter(p => evalState[`${c.id}_${p.index}`]?.confirmed).length, 0), 0);
    const full = conf === tot && tot > 0;
    return (
        <div className="ea-champ">
            <button className="ea-champ-btn" onClick={() => setOpen(o => !o)}>
                <span className="ea-champ-code">{champ.champ}</span>
                <span className="ea-champ-label">{champ.champ_label}</span>
                <span className={`ea-count${full?" full":conf===0?" zero":" prog"}`}>{conf}/{tot}</span>
                <svg className={`ea-chevron${open?" open":""}`} viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {open && (
                <div className="ea-champ-content">
                    {champ.references.map(r => (
                        <Reference key={r.reference} reference={r} evalState={evalState} onUpdate={onUpdate} onConfirm={onConfirm} locked={locked}/>
                    ))}
                </div>
            )}
        </div>
    );
}

function Domaine({ domaine, evalState, onUpdate, onConfirm, swotState, onSwotChange, locked }) {
    const [open, setOpen] = useState(false);
    const tot  = domaine.champs.reduce((a, ch) => a + ch.references.reduce((b, r) => b + r.criteres.reduce((c, cr) => c + cr.total, 0), 0), 0);
    const conf = domaine.champs.reduce((a, ch) => a + ch.references.reduce((b, r) => b + r.criteres.reduce((c, cr) => c + cr.preuves.filter(p => evalState[`${cr.id}_${p.index}`]?.confirmed).length, 0), 0), 0);
    const pct  = tot > 0 ? Math.round((conf / tot) * 100) : 0;
    const sw   = swotState[domaine.domaine] ?? {};
    const swotFilled = ['forces','faiblesses','opportunites','menaces'].filter(k => sw[k]?.trim()).length;
    return (
        <div className="ea-domain">
            <button className={`ea-domain-btn${open?" open":""}`} onClick={() => setOpen(o => !o)}>
                <span className="ea-domain-letter">{domaine.domaine}</span>
                <span className="ea-domain-title">Domaine {domaine.domaine} — {domaine.domaine_label}</span>
                <div className="ea-domain-right">
                    {swotFilled > 0 && (
                        <span style={{ fontSize:9, fontWeight:700, background:"#1a1f2e", color:"#fff", borderRadius:4, padding:"2px 6px", letterSpacing:".04em" }}>
                            SWOT {swotFilled}/4
                        </span>
                    )}
                    <div className="ea-mini-bar"><div className={`ea-mini-fill${pct===100?" full":""}`} style={{ width:`${pct}%` }}/></div>
                    <span className="ea-mini-frac">{conf}/{tot}</span>
                    <svg className={`ea-chevron${open?" open":""}`} viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </button>
            {open && (
                <div className="ea-domain-content">
                    <SwotPanel
                        domaine={domaine.domaine}
                        swotState={swotState}
                        onSwotChange={onSwotChange}
                        locked={locked}
                    />
                    {domaine.champs.map(ch => (
                        <Champ key={ch.champ} champ={ch} evalState={evalState} onUpdate={onUpdate} onConfirm={onConfirm} locked={locked}/>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Graphical conformity summary ─── */
const CHART_COLORS = ["#1c5fdc", "#0e7c5b", "#b35c00", "#5046a8", "#c0344a", "#0f766e", "#7c3aed", "#475569"];
const TOOLTIP_STYLE = {
    border: "1px solid #e4e7f0",
    borderRadius: 8,
    boxShadow: "0 8px 20px rgba(26,31,46,.1)",
    fontSize: 11,
};

const scoreColor = score => score >= 67 ? "#0e7c5b" : score >= 34 ? "#b35c00" : "#c0344a";
const scoreTooltip = value => [`${value}%`, "Conformité"];

function conformityStats(notes) {
    const evaluatedNotes = notes.filter(note => note !== null && note !== undefined);
    const points = evaluatedNotes.reduce((sum, note) => sum + Number(note), 0);

    return {
        score: notes.length > 0 ? Math.round((points / (notes.length * 3)) * 100) : 0,
        evaluated: evaluatedNotes.length,
        total: notes.length,
    };
}

function referenceNotes(reference, evalState) {
    return reference.criteres.flatMap(critere =>
        critere.preuves.map(preuve => evalState[`${critere.id}_${preuve.index}`]?.note ?? null)
    );
}

function buildConformitySummary(grouped, evalState) {
    const domains = grouped.map(domaine => {
        const references = domaine.champs.flatMap(champ =>
            champ.references.map(reference => {
                const notes = referenceNotes(reference, evalState);
                return {
                    code: reference.reference,
                    label: reference.reference_label,
                    notes,
                    ...conformityStats(notes),
                };
            })
        );
        const elements = domaine.champs.map(champ => {
            const notes = champ.references.flatMap(reference => referenceNotes(reference, evalState));

            return {
                code: champ.champ,
                label: champ.champ_label,
                notes,
                ...conformityStats(notes),
            };
        });
        const notes = elements.flatMap(element => element.notes);

        return {
            code: domaine.domaine,
            label: domaine.domaine_label,
            elements,
            references,
            notes,
            ...conformityStats(notes),
        };
    });
    const notes = domains.flatMap(domaine => domaine.notes);

    return {
        domains,
        ...conformityStats(notes),
    };
}

function ScoreBox({ score }) {
    return (
        <span className="ea-score-box" style={{ background: scoreColor(score) }}>
            {score}%
        </span>
    );
}

function splitRadarLabel(label, maxLength = 24) {
    return String(label).split(" ").reduce((lines, word) => {
        const currentLine = lines[lines.length - 1];

        if (!currentLine || `${currentLine} ${word}`.length > maxLength) {
            lines.push(word);
        } else {
            lines[lines.length - 1] = `${currentLine} ${word}`;
        }

        return lines;
    }, []);
}

function RadarLabelTick({ payload, x, y, textAnchor }) {
    const lines = splitRadarLabel(payload.value);

    return (
        <text x={x} y={y} textAnchor={textAnchor} fill="#5c6480" fontSize={10} fontWeight={700}>
            {lines.map((line, index) => (
                <tspan key={`${line}_${index}`} x={x} dy={index === 0 ? -((lines.length - 1) * 6) : 12}>
                    {line}
                </tspan>
            ))}
        </text>
    );
}

function ConformityRadar({ data, angleKey = "code", detailedLabels = false }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius={detailedLabels ? "58%" : "68%"} margin={detailedLabels ? { top:25, right:85, bottom:25, left:85 } : undefined}>
                <PolarGrid stroke="#d0d5e8" />
                <PolarAngleAxis dataKey={angleKey} tick={detailedLabels ? <RadarLabelTick /> : { fill:"#5c6480", fontSize:10, fontWeight:700 }} />
                <PolarRadiusAxis angle={90} axisLine={false} domain={[0, 100]} tickCount={6} tick={{ fill:"#8891aa", fontSize:9 }} tickFormatter={value => `${value}%`} />
                <Radar name="Conformité" dataKey="score" stroke="#1c5fdc" fill="#1c5fdc" fillOpacity={0.16} strokeWidth={3} />
                <Tooltip formatter={scoreTooltip} contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
        </ResponsiveContainer>
    );
}

function ReferencesBarChart({ references }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={references} margin={{ top:10, right:8, left:-14, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e7f0" />
                <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fill:"#5c6480", fontSize:10, fontWeight:700 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill:"#8891aa", fontSize:9 }} tickFormatter={value => `${value}%`} />
                <Tooltip formatter={scoreTooltip} labelFormatter={label => `Référence ${label}`} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {references.map((reference, index) => (
                        <Cell key={reference.code} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function ConformityDashboard({ summary }) {
    return (
        <div className="ea-report">
            <section className="ea-report-card">
                <div className="ea-report-title">
                    <h2>Conformité globale</h2>
                    <span className="ea-score-label">Score</span>
                    <ScoreBox score={summary.score} />
                </div>
                <div className="ea-report-subtitle">
                    Taux de conformité calculé pour ce dossier : points obtenus / note maximale de toutes les preuves attendues.
                    {" "}{summary.evaluated}/{summary.total} preuves évaluées.
                </div>

                {summary.evaluated === 0 ? (
                    <div className="ea-report-empty">
                        Les graphiques apparaîtront dès qu'une première note sera sélectionnée.
                    </div>
                ) : (
                    <div className="ea-report-global">
                        <div>
                            <p className="ea-chart-title">Score de conformité par domaine</p>
                            <table className="ea-summary-table">
                                <thead>
                                    <tr>
                                        <th>Domaines d'évaluation</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.domains.map(domaine => (
                                        <tr key={domaine.code}>
                                            <td><span className="ea-summary-code">{domaine.code}</span> — {domaine.label}</td>
                                            <td style={{ color:scoreColor(domaine.score), fontWeight:700 }}>{domaine.score}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="ea-chart-wrap">
                            <p className="ea-chart-title">Score de conformité par domaine</p>
                            <div className="ea-chart ea-chart-global"><ConformityRadar data={summary.domains} angleKey="label" detailedLabels /></div>
                        </div>
                    </div>
                )}
            </section>

            {summary.domains.map(domaine => (
                <section className="ea-report-card" key={domaine.code}>
                    <div className="ea-report-title">
                        <h3>Domaine {domaine.code} : {domaine.label}</h3>
                        <span className="ea-score-label">Score</span>
                        <ScoreBox score={domaine.score} />
                    </div>
                    <div className="ea-report-subtitle">
                        {domaine.evaluated}/{domaine.total} preuves évaluées dans ce domaine
                    </div>

                    {domaine.evaluated === 0 ? (
                        <div className="ea-report-empty">Aucune note renseignée pour ce domaine.</div>
                    ) : (
                        <div className={`ea-domain-charts ${domaine.elements.length >= 3 ? "with-radar" : "single-chart"}`}>
                            {domaine.elements.length >= 3 && (
                                <div className="ea-chart-wrap">
                                    <p className="ea-chart-title">Taux de conformité par élément</p>
                                    <div className="ea-chart"><ConformityRadar data={domaine.elements} angleKey="label" detailedLabels /></div>
                                    <p className="ea-chart-note">Radar des champs du domaine</p>
                                </div>
                            )}
                            <div className="ea-chart-wrap">
                                <p className="ea-chart-title">Taux de conformité par référence</p>
                                <div className="ea-chart"><ReferencesBarChart references={domaine.references} /></div>
                                <p className="ea-chart-note">Histogramme détaillé par référence</p>
                            </div>
                        </div>
                    )}
                </section>
            ))}
        </div>
    );
}

/* ─── Page principale ─── */
export default function EvaluationAnnexeIndex({ dossier, grouped, totalPreuves, dejaSoumis, swot: swotProp = {} }) {

    /* ── Evaluation state ── */
    const buildInitEval = () => {
        const init = {};
        grouped.forEach(d => d.champs.forEach(ch => ch.references.forEach(r => r.criteres.forEach(c => {
            c.preuves.forEach(p => {
                init[`${c.id}_${p.index}`] = { note: p.note ?? null, observation: p.observation ?? "", confirmed: p.note !== null };
            });
        }))));
        return init;
    };

    const [evalState, setEvalState]         = useState(buildInitEval);
    const countConfirmed = s => Object.values(s).filter(e => e.confirmed && e.note !== null).length;
    const [confirmedCount, setConfirmedCount] = useState(() => countConfirmed(buildInitEval()));

    /* ── SWOT state: { A: { forces, faiblesses, opportunites, menaces }, ... } ── */
    const [swotState, setSwotState] = useState(() => {
        const init = {};
        Object.entries(swotProp).forEach(([domaine, data]) => {
            init[domaine] = { forces: data.forces ?? "", faiblesses: data.faiblesses ?? "", opportunites: data.opportunites ?? "", menaces: data.menaces ?? "" };
        });
        return init;
    });

    const [isSaving, setIsSaving]    = useState(false);
    const [publishModal, setPublish] = useState(null);
    const [isPublishing, setIsPubl]  = useState(false);
    const [activeView, setActiveView] = useState("evaluation");
    const conformitySummary = useMemo(() => buildConformitySummary(grouped, evalState), [grouped, evalState]);

    const onUpdate = useCallback((critereId, preuveIndex, ev) => {
        setEvalState(prev => {
            const next = { ...prev, [`${critereId}_${preuveIndex}`]: ev };
            setConfirmedCount(countConfirmed(next));
            return next;
        });
    }, []);

    const onConfirm = useCallback((critereId, preuveIndex) => {
        setEvalState(prev => {
            const key  = `${critereId}_${preuveIndex}`;
            const next = { ...prev, [key]: { ...prev[key], confirmed: true } };
            setConfirmedCount(countConfirmed(next));
            return next;
        });
    }, []);

    const onSwotChange = useCallback((domaine, field, value) => {
        setSwotState(prev => ({ ...prev, [domaine]: { ...(prev[domaine] ?? {}), [field]: value } }));
    }, []);

    function buildPayload() {
        const evaluations = Object.entries(evalState)
            .filter(([, ev]) => ev.note !== null)
            .map(([key, ev]) => {
                const [critereId, preuveIndex] = key.split("_").map(Number);
                return { critere_id: critereId, preuve_index: preuveIndex, note: ev.note, observation: ev.observation || null };
            });

        const swot = Object.entries(swotState).map(([domaine, sw]) => ({
            domaine,
            domaine_label: swotProp[domaine]?.domaine_label ?? null,
            forces:        sw.forces || null,
            faiblesses:    sw.faiblesses || null,
            opportunites:  sw.opportunites || null,
            menaces:       sw.menaces || null,
        }));

        return { evaluations, swot };
    }

    async function saveDraft() {
        setIsSaving(true);
        try {
            await window.axios.post(route("expert.evaluations-annexes.sauvegarder", { dossier: dossier.id }), buildPayload());
        } catch { alert("Erreur lors de la sauvegarde."); }
        finally  { setIsSaving(false); }
    }

    async function doPublish() {
        setIsPubl(true);
        try {
            await window.axios.post(route("expert.evaluations-annexes.publier", { dossier: dossier.id }), buildPayload());
            setPublish("success");
        } catch (err) {
            alert(err?.response?.data?.message ?? "Erreur lors de la publication.");
            setPublish(null);
        } finally { setIsPubl(false); }
    }

    const locked    = dejaSoumis;
    const allDone   = confirmedCount === totalPreuves;
    const pct       = totalPreuves > 0 ? Math.round((confirmedCount / totalPreuves) * 100) : 0;
    const remaining = totalPreuves - confirmedCount;

    return (
        <ExpertLayout>
            {/* Modal confirm */}
            {publishModal === "confirm" && (
                <div className="ea-backdrop" onClick={() => !isPublishing && setPublish(null)}>
                    <div className="ea-modal" onClick={e => e.stopPropagation()}>
                        <div className="ea-modal-icon" style={{ background:"#f0effc" }}>📋</div>
                        <h2>Soumettre l'évaluation au DEE ?</h2>
                        <p>
                            <b>{confirmedCount}</b> preuves confirmées sur <b>{totalPreuves}</b> seront soumises
                            pour le dossier <b>{dossier.reference}</b>.<br/>
                            Cette action est <b>irréversible</b> et notifiera le DEE.
                        </p>
                        <div className="ea-modal-actions">
                            <button className="ea-btn ghost" onClick={() => setPublish(null)} disabled={isPublishing}>Annuler</button>
                            <button className="ea-btn modal-confirm" onClick={doPublish} disabled={isPublishing}>
                                {isPublishing ? <><span className="ea-spin"/> Publication…</> : "Confirmer la soumission"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal success */}
            {publishModal === "success" && (
                <div className="ea-backdrop">
                    <div className="ea-modal" onClick={e => e.stopPropagation()}>
                        <div className="ea-modal-icon" style={{ background:"var(--emerald-s)" }}>✅</div>
                        <h2>Évaluation soumise au DEE !</h2>
                        <p>L'administrateur DEE a été notifié.<br/>L'évaluation est maintenant verrouillée en lecture seule.</p>
                        <div className="ea-modal-actions">
                            <button className="ea-btn modal-confirm" onClick={() => window.location.reload()}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="ea">
                <div className="ea-header">
                    <div className="ea-header-top">
                        <div>
                            <h1>Évaluation quantitative des annexes</h1>
                            <p>
                                Dossier <b>{dossier.reference}</b> — {dossier.nom ?? dossier.etablissement?.nom}
                                <br/>Notez chaque preuve · 0 Absent · 1 Non conforme · 2 Acceptable · 3 Conforme
                            </p>
                        </div>
                        <div className="ea-pills">
                            <span className="ea-pill confirmed">✓ {confirmedCount} confirmées</span>
                            <span className="ea-pill left">{remaining} restantes</span>
                            {locked && <span className="ea-pill lock">🔒 Soumis</span>}
                        </div>
                    </div>

                    {locked && (
                        <div className="ea-locked-bar">
                            <span>🔒</span>
                            <span>Cette évaluation a été soumise au DEE. Elle est en lecture seule.</span>
                        </div>
                    )}

                    {!locked && (
                        <div className="ea-bar">
                            <span className="ea-bar-info">
                                {confirmedCount > 0
                                    ? <><b>{confirmedCount} preuve{confirmedCount>1?"s":""} confirmée{confirmedCount>1?"s":""}</b> sur {totalPreuves}{!allDone && ` — encore ${remaining} à confirmer pour soumettre`}</>
                                    : "Cliquez sur une preuve, choisissez une note, puis cliquez « Confirmer »."}
                            </span>

                            {/* Brouillon — actif dès qu'il y a au moins 1 confirmation */}
                            <button className="ea-btn save-draft" onClick={saveDraft}
                                disabled={isSaving || confirmedCount === 0}
                                title={confirmedCount === 0 ? "Confirmez au moins une preuve d'abord" : ""}>
                                {isSaving
                                    ? <><span className="ea-spin" style={{ borderTopColor:"var(--indigo)" }}/> Sauvegarde…</>
                                    : "Enregistrer comme brouillon"}
                            </button>

                            {/* Publier — actif seulement quand TOUT est confirmé */}
                            <button className="ea-btn save-publish" onClick={() => setPublish("confirm")}
                                disabled={isSaving || !allDone}
                                title={!allDone ? `Confirmez encore ${remaining} preuves pour pouvoir soumettre` : "Submit"}>
                                Submit
                            </button>
                        </div>
                    )}

                    <div className="ea-progress">
                        <div className="ea-progress-meta">
                            <span className="ea-progress-label">Progression</span>
                            <span className="ea-progress-count">
                                <b>{confirmedCount}</b> / {totalPreuves}
                                <span className={`ea-pct${pct===100?" ok":""}`}>{pct}%</span>
                            </span>
                        </div>
                        <div className="ea-progress-track">
                            <div className="ea-progress-fill" style={{ width:`${pct}%` }}/>
                        </div>
                    </div>
                </div>

                <div className="ea-view-tabs">
                    <button className={`ea-view-tab${activeView === "evaluation" ? " active" : ""}`} onClick={() => setActiveView("evaluation")}>
                        <span>✎</span>
                        Saisie des notes
                    </button>
                    <button className={`ea-view-tab${activeView === "summary" ? " active" : ""}`} onClick={() => setActiveView("summary")}>
                        <span>▥</span>
                        Synthèse graphique
                    </button>
                </div>

                <div className="ea-body">
                    {activeView === "evaluation" ? (
                        grouped.map(d => (
                            <Domaine key={d.domaine} domaine={d}
                                evalState={evalState} onUpdate={onUpdate} onConfirm={onConfirm}
                                swotState={swotState} onSwotChange={onSwotChange}
                                locked={locked}/>
                        ))
                    ) : (
                        <ConformityDashboard summary={conformitySummary} />
                    )}
                </div>
            </div>
        </ExpertLayout>
    );
}
