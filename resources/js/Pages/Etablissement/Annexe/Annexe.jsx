import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { router } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

/* ── localStorage helpers ── */
const DK = "aneaq_ax";
const ld  = () => { try { return JSON.parse(localStorage.getItem(DK)||"{}"); } catch { return {}; } };
const sd  = (c,i,v) => { const d=ld(); d[`${c}_${i}`]={...v,t:Date.now()}; localStorage.setItem(DK,JSON.stringify(d)); };
const rd  = (c,i)   => { const d=ld(); delete d[`${c}_${i}`]; localStorage.setItem(DK,JSON.stringify(d)); };
const gd  = (c,i)   => ld()[`${c}_${i}`]||null;

/* note-specific helpers — keys like "note_123_2" */
const sdNote        = (cId,idx,val) => sd(`note_${cId}`, idx, { critere_id:cId, preuve_index:idx, note:val });
const rdNote        = (cId,idx)     => rd(`note_${cId}`, idx);
const gdNote        = (cId,idx)     => gd(`note_${cId}`, idx);
const getAllDirtyNotes = ()          => Object.entries(ld()).filter(([k])=>k.startsWith("note_")).map(([,v])=>v);

/* Context shared by all child components */
const AnnexeCtx = createContext({
    saveTrigger:    0,
    registerDraft:   () => {},
    unregisterDraft: () => {},
});

/* ─────────────────────────── CSS ─────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

:root {
  --ink:#1a1f2e;--ink2:#2d3348;--ink3:#3d4461;--slate:#5c6480;--muted:#8891aa;
  --border:#e4e7f0;--border2:#d0d5e8;--bg:#f5f6fa;--surface:#ffffff;--surface2:#f9fafc;
  --accent:#1c5fdc;--accent-h:#1550c2;--accent-s:#eef3fd;--accent-t:#d6e4fb;
  --emerald:#0e7c5b;--emerald-h:#0b6449;--emerald-s:#ecfaf4;--emerald-t:#c6f0df;
  --sand:#b35c00;--sand-s:#fdf5ec;--sand-t:#fde8cc;
  --rose:#c0344a;--rose-s:#fdf0f2;--rose-t:#f8cdd3;
  --indigo:#5046a8;--indigo-s:#f0effc;--indigo-t:#dddaf7;
}
.ax{font-family:'Inter',sans-serif;background:var(--bg);min-height:100vh;color:var(--ink);}
.ax *,.ax *::before,.ax *::after{box-sizing:border-box;}

/* header */
.ax-header{background:var(--surface);border-bottom:1px solid var(--border);}
.ax-header-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 28px 14px;}
.ax-header h1{font-size:18px;font-weight:700;color:var(--ink);margin:0 0 3px;letter-spacing:-.02em;}
.ax-header p{font-size:12px;color:var(--muted);margin:0;line-height:1.5;}
.ax-stat-pills{display:flex;gap:6px;flex-shrink:0;margin-top:2px;}
.ax-stat-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;white-space:nowrap;border:1px solid;}
.ax-stat-pill.done{background:var(--emerald-s);color:var(--emerald);border-color:var(--emerald-t);}
.ax-stat-pill.left{background:var(--surface2);color:var(--slate);border-color:var(--border);}

/* save bar */
.ax-save-bar{display:flex;align-items:center;gap:8px;padding:9px 28px 11px;border-top:1px solid var(--border);flex-wrap:wrap;}
.ax-save-info{font-size:11px;color:var(--muted);flex:1;min-width:180px;}
.ax-save-info b{color:var(--sand);}
.ax-save-info.ok b{color:var(--emerald);}

/* progress */
.ax-progress{padding:10px 28px 14px;}
.ax-progress-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.ax-progress-label{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;}
.ax-progress-count{font-size:11px;color:var(--muted);}
.ax-progress-count b{color:var(--ink);font-weight:700;}
.ax-progress-track{height:4px;background:var(--border);border-radius:999px;overflow:hidden;}
.ax-progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--accent) 0%,var(--emerald) 100%);transition:width .5s cubic-bezier(.4,0,.2,1);}
.ax-pct-pill{display:inline-block;padding:1px 6px;border-radius:999px;font-size:10px;font-weight:700;margin-left:7px;background:var(--accent-s);color:var(--accent);}
.ax-pct-pill.complete{background:var(--emerald-s);color:var(--emerald);}

/* domain */
.ax-body{padding:0;}
.ax-domain{border-bottom:1px solid var(--border);}
.ax-domain:last-child{border-bottom:none;}
.ax-domain-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:13px 28px;background:var(--surface);border:none;cursor:pointer;text-align:left;transition:background .1s;gap:12px;}
.ax-domain-btn:hover,.ax-domain-btn.open{background:var(--surface2);}
.ax-domain-letter{width:32px;height:32px;border-radius:7px;flex-shrink:0;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.ax-domain-title{font-size:13.5px;font-weight:600;color:var(--ink);flex:1;text-align:left;}
.ax-domain-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.ax-mini-bar{width:72px;height:3px;background:var(--border2);border-radius:999px;overflow:hidden;}
.ax-mini-bar-fill{height:100%;border-radius:999px;background:var(--accent);transition:width .4s;}
.ax-mini-bar-fill.done{background:var(--emerald);}
.ax-mini-frac{font-size:11px;font-weight:600;color:var(--muted);min-width:36px;text-align:right;}
.ax-chevron{width:15px;height:15px;color:var(--muted);transition:transform .18s ease;flex-shrink:0;}
.ax-chevron.open{transform:rotate(180deg);}
.ax-domain-content{border-top:2px solid var(--accent);background:var(--surface2);}

/* champ */
.ax-champ{border-bottom:1px solid var(--border);}
.ax-champ:last-child{border-bottom:none;}
.ax-champ-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 28px;background:transparent;border:none;cursor:pointer;text-align:left;transition:background .1s;gap:10px;}
.ax-champ-btn:hover{background:var(--surface);}
.ax-champ-code{font-size:9.5px;font-weight:700;color:var(--ink);background:var(--border);padding:2px 7px;border-radius:4px;font-family:'JetBrains Mono',monospace;flex-shrink:0;letter-spacing:.04em;}
.ax-champ-label{font-size:13px;font-weight:600;color:var(--ink2);flex:1;text-align:left;}
.ax-count-pill{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;flex-shrink:0;border:1px solid;}
.ax-count-pill.done{background:var(--emerald-s);color:var(--emerald);border-color:var(--emerald-t);}
.ax-count-pill.prog{background:var(--accent-s);color:var(--accent);border-color:var(--accent-t);}
.ax-count-pill.zero{background:var(--surface2);color:var(--muted);border-color:var(--border);}
.ax-champ-content{padding:0 0 6px 50px;}

/* reference */
.ax-ref{border-bottom:1px solid var(--border);}
.ax-ref:last-child{border-bottom:none;}
.ax-ref-btn{width:100%;display:flex;align-items:flex-start;justify-content:space-between;padding:9px 28px 9px 0;background:transparent;border:none;cursor:pointer;text-align:left;transition:background .1s;gap:10px;}
.ax-ref-btn:hover{background:rgba(28,95,220,.025);}
.ax-ref-code{font-size:9px;font-weight:700;color:var(--accent);background:var(--accent-s);padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;flex-shrink:0;margin-top:1px;white-space:nowrap;border:1px solid var(--accent-t);}
.ax-ref-label{font-size:12px;color:var(--slate);line-height:1.55;flex:1;}
.ax-ref-right{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-top:1px;}
.ax-ref-bar{width:32px;height:2px;background:var(--border2);border-radius:999px;overflow:hidden;}
.ax-ref-bar-fill{height:100%;border-radius:999px;background:var(--accent);}
.ax-ref-bar-fill.done{background:var(--emerald);}
.ax-ref-frac{font-size:10px;color:var(--muted);font-weight:600;min-width:24px;}

/* critere */
.ax-critere{border-bottom:1px solid var(--border);}
.ax-critere:last-child{border-bottom:none;}
.ax-critere-header{display:flex;align-items:flex-start;justify-content:space-between;padding:8px 28px 8px 0;gap:8px;background:var(--surface);}
.ax-critere-badge{font-size:8.5px;font-weight:700;color:var(--accent);background:var(--accent-s);padding:2px 6px;border-radius:4px;flex-shrink:0;margin-top:2px;text-transform:uppercase;letter-spacing:.05em;border:1px solid var(--accent-t);}
.ax-critere-label{font-size:12.5px;font-weight:500;color:var(--ink2);line-height:1.55;flex:1;}
.ax-critere-frac{font-size:10px;font-weight:600;color:var(--muted);flex-shrink:0;margin-top:2px;white-space:nowrap;}

/* proof row */
.ax-proofs{background:var(--surface);}
.ax-proof{display:flex;align-items:flex-start;border-top:1px solid var(--border);cursor:pointer;position:relative;transition:background .08s;}
.ax-proof:hover{background:var(--surface2);}
.ax-proof-accent{width:3px;flex-shrink:0;align-self:stretch;background:transparent;transition:background .12s;}
.ax-proof.done{background:#fdfffe;}
.ax-proof.unavail{background:#fdfcf8;}
.ax-proof.draft{background:#fdfcff;}
.ax-proof.done .ax-proof-accent{background:var(--emerald);}
.ax-proof.unavail .ax-proof-accent{background:var(--sand);}
.ax-proof.draft .ax-proof-accent{background:var(--indigo);}
.ax-proof-main{flex:1;padding:9px 28px 9px 12px;min-width:0;}
.ax-proof-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.ax-proof-num{width:19px;height:19px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;margin-top:1px;background:var(--bg);color:var(--muted);border:1px solid var(--border);}
.ax-proof.done .ax-proof-num{background:var(--emerald-s);color:var(--emerald);border-color:var(--emerald-t);}
.ax-proof-text{font-size:12.5px;color:var(--ink2);line-height:1.6;flex:1;}
.ax-status{display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;font-size:9.5px;font-weight:600;flex-shrink:0;white-space:nowrap;border:1px solid;text-transform:uppercase;letter-spacing:.03em;}
.ax-status.done{background:var(--emerald-s);color:var(--emerald);border-color:var(--emerald-t);}
.ax-status.unavail{background:var(--sand-s);color:var(--sand);border-color:var(--sand-t);}
.ax-status.draft{background:var(--indigo-s);color:var(--indigo);border-color:var(--indigo-t);}
.ax-status.pending{background:var(--surface2);color:var(--muted);border-color:var(--border);}

/* actions / chips */
.ax-chip{display:inline-flex;align-items:center;gap:4px;background:var(--accent-s);border:1px solid var(--accent-t);border-radius:5px;padding:3px 8px;font-size:11px;color:var(--accent);font-family:'JetBrains Mono',monospace;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:5px 0;}
.ax-chip.dchip{background:var(--indigo-s);border-color:var(--indigo-t);color:var(--indigo);}
.ax-actions{display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:6px 0 9px;}

.ax-btn{display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer;border:1px solid;transition:all .1s;font-family:'Inter',sans-serif;white-space:nowrap;line-height:1;}
.ax-btn:disabled{opacity:.35;pointer-events:none;}
.ax-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
.ax-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent);}
.ax-btn.primary:hover{background:var(--accent-h);border-color:var(--accent-h);}
.ax-btn.ghost{background:transparent;color:var(--slate);border-color:var(--border2);}
.ax-btn.ghost:hover{background:var(--surface2);color:var(--ink2);}
.ax-btn.danger{background:transparent;color:var(--rose);border-color:var(--rose-t);}
.ax-btn.danger:hover{background:var(--rose-s);}
.ax-btn.confirm{background:var(--emerald);color:#fff;border-color:var(--emerald);}
.ax-btn.confirm:hover{background:var(--emerald-h);border-color:var(--emerald-h);}
.ax-btn.notebn{background:var(--surface2);color:var(--slate);border-color:var(--border2);}
.ax-btn.notebn:hover{background:var(--border);color:var(--ink2);}
.ax-btn.notebn.on{background:var(--emerald-s);color:var(--emerald);border-color:var(--emerald-t);}
.ax-btn.save-draft{background:var(--indigo-s);color:var(--indigo);border-color:var(--indigo-t);font-size:12px;padding:6px 14px;}
.ax-btn.save-draft:hover{background:var(--indigo-t);}
.ax-btn.save-publish{background:var(--emerald);color:#fff;border-color:var(--emerald);font-size:12px;padding:6px 14px;}
.ax-btn.save-publish:hover{background:var(--emerald-h);border-color:var(--emerald-h);}
.ax-btn.save-publish:disabled{opacity:.35;pointer-events:none;}

/* ── Publish modal ── */
.ax-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;animation:bdin .15s ease;}
@keyframes bdin{from{opacity:0}to{opacity:1}}
.ax-modal{background:var(--surface);border-radius:12px;padding:32px 28px 24px;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.18);animation:mdin .15s ease;}
@keyframes mdin{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
.ax-modal-icon{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;}
.ax-modal-icon.warn{background:var(--indigo-s);}
.ax-modal-icon.ok{background:var(--emerald-s);}
.ax-modal h2{font-size:17px;font-weight:700;color:var(--ink);text-align:center;margin:0 0 8px;}
.ax-modal p{font-size:13px;color:var(--slate);text-align:center;line-height:1.6;margin:0 0 24px;}
.ax-modal-actions{display:flex;gap:10px;justify-content:center;}
.ax-modal-actions .ax-btn{font-size:13px;padding:8px 20px;}

.ax-draft-banner{display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--indigo-s);border:1px solid var(--indigo-t);border-radius:6px;padding:8px 10px;margin:5px 0;}
.ax-draft-lbl{font-size:9px;font-weight:700;color:var(--indigo);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;}
.ax-sub-panel{padding:9px 11px;border-radius:6px;border:1px solid;margin:5px 0;}
.ax-sub-panel.sand-panel{background:var(--sand-s);border-color:var(--sand-t);}
.ax-sub-panel-title{font-size:9.5px;font-weight:700;color:var(--sand);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;}

.ax-note-panel{padding:9px 10px;border-radius:6px;background:var(--emerald-s);border:1px solid var(--emerald-t);margin:5px 0;animation:fadeup .12s ease;}
@keyframes fadeup{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
.ax-note-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;}
.ax-note-ttl{font-size:9px;font-weight:700;color:var(--emerald);text-transform:uppercase;letter-spacing:.06em;}
.ax-ta{width:100%;resize:vertical;border:1px solid var(--border2);border-radius:6px;padding:7px 10px;font-size:12.5px;font-family:'Inter',sans-serif;color:var(--ink2);background:var(--surface);outline:none;line-height:1.6;transition:border-color .12s,box-shadow .12s;}
.ax-ta:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(28,95,220,.07);}
.ax-ta.sand{border-color:var(--sand-t);background:var(--sand-s);}
.ax-ta.sand:focus{border-color:var(--sand);box-shadow:0 0 0 3px rgba(179,92,0,.07);}
.ax-ta.emerald{border-color:var(--emerald-t);background:var(--emerald-s);}
.ax-ta.emerald:focus{border-color:var(--emerald);box-shadow:0 0 0 3px rgba(14,124,91,.07);}
.ax-spin{display:inline-block;width:11px;height:11px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:axspin .5s linear infinite;}
@keyframes axspin{to{transform:rotate(360deg)}}
`;

function Inject() {
    useEffect(() => {
        if (!document.getElementById("ax5-css")) {
            const s = document.createElement("style");
            s.id = "ax5-css"; s.textContent = CSS;
            document.head.appendChild(s);
        }
    }, []);
    return null;
}

/* ─── NoteZone — pas d'auto-save, sauvegarde manuelle ou via trigger global ─── */
function NoteZone({ critereId, preuveIndex, initialNote }) {
    const { saveTrigger } = useContext(AnnexeCtx);
    const prevTrigger = useRef(saveTrigger);

    const [note, setNote]     = useState(() => gdNote(critereId, preuveIndex)?.note ?? initialNote ?? "");
    const [dirty, setDirty]   = useState(() => !!gdNote(critereId, preuveIndex));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved]   = useState(!gdNote(critereId, preuveIndex) && !!initialNote);

    /* Sync with fresh server data when not dirty */
    useEffect(() => {
        if (!dirty) { setNote(initialNote ?? ""); setSaved(!!initialNote); }
    }, [initialNote]);

    /* Global save trigger — Annexe already cleared localStorage, just update UI */
    useEffect(() => {
        if (saveTrigger === prevTrigger.current) return;
        prevTrigger.current = saveTrigger;
        if (dirty) { setDirty(false); setSaved(true); }
    }, [saveTrigger]);

    function onChange(v) {
        setNote(v);
        const changed = v !== (initialNote ?? "");
        setDirty(changed);
        setSaved(false);
        if (changed) sdNote(critereId, preuveIndex, v);
        else         rdNote(critereId, preuveIndex);
    }

    function saveManual() {
        setSaving(true);
        router.post(
            route("etablissement.annexes.note"),
            { critere_id: critereId, preuve_index: preuveIndex, note },
            {
                preserveScroll: true, preserveState: true,
                onSuccess: () => { setSaving(false); setSaved(true); setDirty(false); rdNote(critereId, preuveIndex); },
                onError:   () => setSaving(false),
            }
        );
    }

    return (
        <div className="ax-note-panel">
            <div className="ax-note-hdr">
                <span className="ax-note-ttl">Note interne</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {saving && <span style={{fontSize:10,color:"var(--muted)"}}>Sauvegarde…</span>}
                    {!saving && dirty  && <span style={{fontSize:10,color:"var(--sand)"}}>● Non sauvegardé</span>}
                    {!saving && !dirty && saved && <span style={{fontSize:10,fontWeight:600,color:"var(--emerald)"}}>✓ Sauvegardé</span>}
                    {dirty && !saving && (
                        <button className="ax-btn confirm" style={{padding:"2px 8px",fontSize:10}} onClick={saveManual}>
                            Sauvegarder
                        </button>
                    )}
                </div>
            </div>
            <textarea className="ax-ta emerald" rows={3}
                placeholder="Observations, remarques, contexte…"
                value={note} onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}

/* ─── ProofRow ─── */
function ProofRow({ preuve, critereId, onSaved }) {
    const { saveTrigger, registerDraft, unregisterDraft } = useContext(AnnexeCtx);
    const prevTrigger = useRef(saveTrigger);

    const init = gd(critereId, preuve.index);
    const [open, setOpen]         = useState(false);
    const [loading, setL]         = useState(false);
    const [mode, setMode]         = useState(preuve.existe === false ? "nd" : "");
    const [comm, setComm]         = useState(preuve.commentaire ?? "");
    const [draftFile, setDF]      = useState(null);
    const [draftName, setDN]      = useState(init?.fileName ?? null);
    const [hasDraft, setHD]       = useState(!!init);
    const [showNote, setShowNote] = useState(!!(preuve.note));

    /* When global save fires, clear local draft state */
    useEffect(() => {
        if (saveTrigger === prevTrigger.current) return;
        prevTrigger.current = saveTrigger;
        if (hasDraft) {
            setDF(null); setDN(null); setHD(false);
            rd(critereId, preuve.index);
        }
    }, [saveTrigger]);

    let cls = "ax-proof";
    if (hasDraft)                cls += " draft";
    else if (preuve.existe===true)   cls += " done";
    else if (preuve.existe===false)  cls += " unavail";

    const stCls = hasDraft ? "draft" : preuve.existe===true ? "done" : preuve.existe===false ? "unavail" : "pending";
    const stLbl = hasDraft ? "Brouillon" : preuve.existe===true ? "Soumis" : preuve.existe===false ? "Non disponible" : "En attente";

    const draftKey = `${critereId}_${preuve.index}`;

    function clr() {
        setDF(null); setDN(null); setHD(false);
        rd(critereId, preuve.index);
        unregisterDraft(draftKey);
    }

    /* "Joindre un fichier" → brouillon local seulement (pas de soumission immédiate) */
    function onDraft(e) {
        const f = e.target.files[0]; if (!f) return;
        setDF(f); setDN(f.name);
        sd(critereId, preuve.index, { fileName: f.name });
        setHD(true); e.target.value = "";
        registerDraft(draftKey, { critereId, preuveIndex: preuve.index, file: f });
    }

    /* Individual submit via "Soumettre" button in draft banner */
    function submitFile(f) {
        if (!f) return; setL(true);
        const fd = new FormData();
        fd.append("critere_id", critereId);
        fd.append("preuve_index", preuve.index);
        fd.append("existe", "1");
        fd.append("fichier", f);
        router.post(route("etablissement.annexes.store"), fd, {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => {
                setL(false);
                setDF(null); setDN(null); setHD(false);
                rd(critereId, preuve.index);
                unregisterDraft(draftKey);
                setOpen(false); onSaved?.();
            },
            onError: (e) => { setL(false); alert(Object.values(e)[0]); },
        });
    }

    function submitND() {
        setL(true);
        router.post(route("etablissement.annexes.store"),
            { critere_id: critereId, preuve_index: preuve.index, existe: false, commentaire: comm },
            { preserveScroll: true,
              onSuccess: () => { setL(false); clr(); setOpen(false); onSaved?.(); },
              onError:   () => setL(false) }
        );
    }

    return (
        <div className={cls}>
            <div className="ax-proof-accent"/>
            <div className="ax-proof-main">
                <div className="ax-proof-top" onClick={() => setOpen(o => !o)} style={{cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8,flex:1}}>
                        <span className="ax-proof-num">{preuve.index + 1}</span>
                        <span className="ax-proof-text">{preuve.label}</span>
                    </div>
                    <span className={`ax-status ${stCls}`}>{stLbl}</span>
                </div>

                {open && (
                    <div style={{marginLeft:27}}>
                        {preuve.fichier_nom && !hasDraft && (
                            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                                <span className="ax-chip">📄 {preuve.fichier_nom}</span>
                                <a href={route("etablissement.annexes.download",{criterePreuve:preuve.id})}
                                    style={{fontSize:11,color:"var(--accent)",textDecoration:"underline"}} target="_blank">
                                    Télécharger
                                </a>
                            </div>
                        )}

                        {hasDraft && (
                            <div className="ax-draft-banner">
                                <div>
                                    <div className="ax-draft-lbl">● Brouillon non soumis</div>
                                    {draftName && <span className="ax-chip dchip">📄 {draftName}</span>}
                                    {!draftFile && <span style={{fontSize:10,color:"var(--muted)"}}>Rechargez la page ou re-sélectionnez le fichier pour soumettre.</span>}
                                </div>
                                <div style={{display:"flex",gap:5,flexShrink:0}}>
                                    {draftFile && (
                                        <button className="ax-btn confirm" onClick={()=>submitFile(draftFile)} disabled={loading}>
                                            {loading ? <span className="ax-spin"/> : "↑ Soumettre"}
                                        </button>
                                    )}
                                    <button className="ax-btn ghost" onClick={clr}>Supprimer</button>
                                </div>
                            </div>
                        )}

                        <div className="ax-actions">
                            {/* Joindre → brouillon local, pas de soumission directe */}
                            <label className="ax-btn primary" style={{cursor:"pointer"}}>
                                {preuve.fichier_nom ? "↻ Remplacer" : "Joindre un fichier"}
                                <input type="file" style={{display:"none"}}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                    onChange={onDraft}/>
                            </label>

                            {mode !== "nd" ? (
                                <button className="ax-btn danger" onClick={()=>setMode("nd")} disabled={loading}>
                                    Non disponible
                                </button>
                            ) : (
                                <button className="ax-btn ghost" onClick={()=>setMode("")}>Annuler</button>
                            )}

                            <button className={`ax-btn notebn ${showNote?"on":""}`} onClick={()=>setShowNote(v=>!v)}>
                                {showNote ? "Masquer note" : "Ajouter note"}
                            </button>
                        </div>

                        {mode === "nd" && (
                            <div className="ax-sub-panel sand-panel">
                                <div className="ax-sub-panel-title">Déclarer non disponible</div>
                                <textarea className="ax-ta sand" rows={2}
                                    placeholder="Commentaire optionnel…"
                                    value={comm} onChange={e=>setComm(e.target.value)}/>
                                <div style={{marginTop:7}}>
                                    <button className="ax-btn confirm" onClick={submitND} disabled={loading}>
                                        {loading ? <><span className="ax-spin"/> Enregistrement…</> : "✓ Confirmer"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showNote && (
                            <NoteZone critereId={critereId} preuveIndex={preuve.index} initialNote={preuve.note}/>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function Critere({ critere, onSaved }) {
    const tot = critere.preuves.length;
    const rem = critere.preuves.filter(p => p.existe !== null).length;
    return (
        <div className="ax-critere">
            <div className="ax-critere-header">
                <span className="ax-critere-badge">Critère {critere.critere_num}</span>
                <span className="ax-critere-label">{critere.critere_label}</span>
                <span className="ax-critere-frac">{rem}/{tot}</span>
            </div>
            <div className="ax-proofs">
                {critere.preuves.map(p => (
                    <ProofRow key={p.index} preuve={p} critereId={critere.id} onSaved={onSaved}/>
                ))}
            </div>
        </div>
    );
}

function Reference({ reference, onSaved }) {
    const [open, setOpen] = useState(false);
    const tot = reference.criteres.reduce((a, c) => a + c.preuves.length, 0);
    const rem = reference.criteres.reduce((a, c) => a + c.preuves.filter(p => p.existe !== null).length, 0);
    const pct = tot > 0 ? Math.round((rem / tot) * 100) : 0;
    return (
        <div className="ax-ref">
            <button className="ax-ref-btn" onClick={() => setOpen(o => !o)}>
                <span className="ax-ref-code">{reference.reference}</span>
                <span className="ax-ref-label">{reference.reference_label}</span>
                <div className="ax-ref-right">
                    <div className="ax-ref-bar">
                        <div className={`ax-ref-bar-fill ${pct===100?"done":""}`} style={{width:`${pct}%`}}/>
                    </div>
                    <span className="ax-ref-frac">{rem}/{tot}</span>
                    <svg className={`ax-chevron ${open?"open":""}`} viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </button>
            {open && (
                <div>
                    {reference.criteres.map(c => (
                        <Critere key={c.id} critere={c} onSaved={onSaved}/>
                    ))}
                </div>
            )}
        </div>
    );
}

function Champ({ champ, onSaved }) {
    const [open, setOpen] = useState(false);
    const tot  = champ.references.reduce((a,r)=>a+r.criteres.reduce((b,c)=>b+c.preuves.length,0),0);
    const rem  = champ.references.reduce((a,r)=>a+r.criteres.reduce((b,c)=>b+c.preuves.filter(p=>p.existe!==null).length,0),0);
    const done = rem===tot && tot>0;
    const zero = rem===0;
    return (
        <div className="ax-champ">
            <button className="ax-champ-btn" onClick={() => setOpen(o => !o)}>
                <span className="ax-champ-code">{champ.champ}</span>
                <span className="ax-champ-label">{champ.champ_label}</span>
                <span className={`ax-count-pill ${done?"done":zero?"zero":"prog"}`}>{rem}/{tot}</span>
                <svg className={`ax-chevron ${open?"open":""}`} viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {open && (
                <div className="ax-champ-content">
                    {champ.references.map(r => (
                        <Reference key={r.reference} reference={r} onSaved={onSaved}/>
                    ))}
                </div>
            )}
        </div>
    );
}

function Domaine({ domaine, onSaved }) {
    const [open, setOpen] = useState(false);
    const tot = domaine.champs.reduce((a,ch)=>a+ch.references.reduce((b,r)=>b+r.criteres.reduce((c,cr)=>c+cr.preuves.length,0),0),0);
    const rem = domaine.champs.reduce((a,ch)=>a+ch.references.reduce((b,r)=>b+r.criteres.reduce((c,cr)=>c+cr.preuves.filter(p=>p.existe!==null).length,0),0),0);
    const pct = tot > 0 ? Math.round((rem / tot) * 100) : 0;
    return (
        <div className="ax-domain">
            <button className={`ax-domain-btn ${open?"open":""}`} onClick={() => setOpen(o => !o)}>
                <span className="ax-domain-letter">{domaine.domaine}</span>
                <span className="ax-domain-title">Domaine {domaine.domaine} — {domaine.domaine_label}</span>
                <div className="ax-domain-right">
                    <div className="ax-mini-bar">
                        <div className={`ax-mini-bar-fill ${pct===100?"done":""}`} style={{width:`${pct}%`}}/>
                    </div>
                    <span className="ax-mini-frac">{rem}/{tot}</span>
                    <svg className={`ax-chevron ${open?"open":""}`} viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </button>
            {open && (
                <div className="ax-domain-content">
                    {domaine.champs.map(ch => (
                        <Champ key={ch.champ} champ={ch} onSaved={onSaved}/>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Page principale ─── */
export default function Annexe({ grouped, totalPreuves, preuvesRemplies, annexesPubliees = false }) {
    const pct = totalPreuves > 0 ? Math.round((preuvesRemplies / totalPreuves) * 100) : 0;

    const [saveTrigger, setSaveTrigger] = useState(0);
    const [isSaving, setIsSaving]       = useState(false);
    const [dirtyNoteCount, setDNC]      = useState(() => getAllDirtyNotes().length);
    const [fileDraftCount, setFDC]      = useState(0);
    /* publish modal: null | 'confirm' | 'success' */
    const [publishModal, setPublishModal] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const fileDraftsRef = useRef({});

    const registerDraft = useCallback((key, data) => {
        fileDraftsRef.current[key] = data;
        setFDC(Object.keys(fileDraftsRef.current).length);
    }, []);

    const unregisterDraft = useCallback((key) => {
        delete fileDraftsRef.current[key];
        setFDC(Object.keys(fileDraftsRef.current).length);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setDNC(getAllDirtyNotes().length), 1500);
        return () => clearInterval(t);
    }, []);

    const totalDirty   = dirtyNoteCount + fileDraftCount;
    const allSubmitted = preuvesRemplies === totalPreuves && totalPreuves > 0;

    /* Save brouillon (notes + file drafts) */
    async function saveAll() {
        setIsSaving(true);
        try {
            const drafts = Object.values(fileDraftsRef.current);
            for (const { critereId, preuveIndex, file } of drafts) {
                const fd = new FormData();
                fd.append("critere_id", critereId);
                fd.append("preuve_index", preuveIndex);
                fd.append("existe", "1");
                fd.append("fichier", file);
                await window.axios.post(route("etablissement.annexes.store"), fd);
            }
            drafts.forEach(({ critereId, preuveIndex }) => rd(critereId, preuveIndex));
            fileDraftsRef.current = {};
            setFDC(0);

            const dirty = getAllDirtyNotes();
            if (dirty.length > 0) {
                await window.axios.post(route("etablissement.annexes.notes.batch"), { notes: dirty });
                const store = ld();
                Object.keys(store).filter(k => k.startsWith("note_")).forEach(k => delete store[k]);
                localStorage.setItem(DK, JSON.stringify(store));
                setDNC(0);
            }

            setSaveTrigger(t => t + 1);
            router.reload({ only: ["grouped", "preuvesRemplies"] });
        } catch {
            alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
        } finally {
            setIsSaving(false);
        }
    }

    /* Publish = save everything then call the publish endpoint */
    async function doPublish() {
        setIsPublishing(true);
        try {
            /* Save any remaining dirty items first */
            const drafts = Object.values(fileDraftsRef.current);
            for (const { critereId, preuveIndex, file } of drafts) {
                const fd = new FormData();
                fd.append("critere_id", critereId);
                fd.append("preuve_index", preuveIndex);
                fd.append("existe", "1");
                fd.append("fichier", file);
                await window.axios.post(route("etablissement.annexes.store"), fd);
            }
            drafts.forEach(({ critereId, preuveIndex }) => rd(critereId, preuveIndex));
            fileDraftsRef.current = {};
            setFDC(0);

            const dirty = getAllDirtyNotes();
            if (dirty.length > 0) {
                await window.axios.post(route("etablissement.annexes.notes.batch"), { notes: dirty });
                const store = ld();
                Object.keys(store).filter(k => k.startsWith("note_")).forEach(k => delete store[k]);
                localStorage.setItem(DK, JSON.stringify(store));
                setDNC(0);
            }

            /* Official publish action */
            await window.axios.post(route("etablissement.annexes.publier"));

            setSaveTrigger(t => t + 1);
            setPublishModal("success");
        } catch (err) {
            const msg = err?.response?.data?.message ?? "Erreur lors de la publication. Veuillez réessayer.";
            alert(msg);
            setPublishModal(null);
        } finally {
            setIsPublishing(false);
        }
    }

    function closeSuccess() {
        setPublishModal(null);
        router.reload({ only: ["grouped", "preuvesRemplies", "annexesPubliees"] });
    }

    function infoLabel() {
        if (fileDraftCount > 0 && dirtyNoteCount > 0)
            return <><b>{fileDraftCount} fichier{fileDraftCount>1?"s":""} + {dirtyNoteCount} note{dirtyNoteCount>1?"s":""} en attente</b></>;
        if (fileDraftCount > 0)
            return <><b>{fileDraftCount} fichier{fileDraftCount>1?"s":""} en attente de soumission</b></>;
        if (dirtyNoteCount > 0)
            return <><b>{dirtyNoteCount} note{dirtyNoteCount>1?"s":""} non sauvegardée{dirtyNoteCount>1?"s":""}</b></>;
        if (allSubmitted)
            return <b style={{color:"var(--emerald)"}}>✓ Toutes les preuves sont soumises — vous pouvez publier.</b>;
        return "Toutes les notes sont sauvegardées.";
    }

    return (
        <AnnexeCtx.Provider value={{ saveTrigger, registerDraft, unregisterDraft }}>
            <EtablissementLayout active="annexes">
                <Inject/>

                {/* ── Modal de confirmation / succès publication ── */}
                {publishModal === "confirm" && (
                    <div className="ax-modal-backdrop" onClick={() => !isPublishing && setPublishModal(null)}>
                        <div className="ax-modal" onClick={e => e.stopPropagation()}>
                            <div className="ax-modal-icon warn">📋</div>
                            <h2>Publier les annexes ?</h2>
                            <p>
                                Vous êtes sur le point de publier officiellement vos <b>{preuvesRemplies} annexes</b>.
                                <br/>Cette action notifiera l'équipe ANEAQ.
                            </p>
                            <div className="ax-modal-actions">
                                <button className="ax-btn ghost" onClick={() => setPublishModal(null)} disabled={isPublishing}>
                                    Annuler
                                </button>
                                <button className="ax-btn save-publish" onClick={doPublish} disabled={isPublishing}>
                                    {isPublishing
                                        ? <><span className="ax-spin"/> Publication…</>
                                        : "Confirmer la publication"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {publishModal === "success" && (
                    <div className="ax-modal-backdrop" onClick={closeSuccess}>
                        <div className="ax-modal" onClick={e => e.stopPropagation()}>
                            <div className="ax-modal-icon ok">✅</div>
                            <h2>Annexes publiées avec succès !</h2>
                            <p>
                                Vos <b>{preuvesRemplies} annexes</b> ont été soumises officiellement.
                                <br/>L'équipe ANEAQ a été notifiée.
                            </p>
                            <div className="ax-modal-actions">
                                <button className="ax-btn confirm" onClick={closeSuccess}>
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="ax">
                    <div className="ax-header">
                        <div className="ax-header-top">
                            <div>
                                <h1>Annexes par critère</h1>
                                <p>Cliquez sur une preuve pour la remplir — joignez un fichier, déclarez-la non disponible, ou ajoutez une note interne.</p>
                            </div>
                            <div className="ax-stat-pills">
                                <span className="ax-stat-pill done">✓ {preuvesRemplies} soumises</span>
                                <span className="ax-stat-pill left">{totalPreuves - preuvesRemplies} restantes</span>
                            </div>
                        </div>

                        <div className="ax-save-bar">
                            <span className="ax-save-info">{infoLabel()}</span>

                            <button
                                className="ax-btn save-draft"
                                onClick={saveAll}
                                disabled={isSaving || totalDirty === 0}>
                                {isSaving
                                    ? <><span className="ax-spin" style={{borderTopColor:"var(--indigo)"}}/> Sauvegarde…</>
                                    : "Enregistrer comme brouillon"}
                            </button>

                            {annexesPubliees ? (
                                <button
                                    className="ax-btn save-publish"
                                    disabled
                                    style={{ background: "var(--emerald)", opacity: 1, cursor: "default", display: "flex", alignItems: "center", gap: 6 }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    Annexes déjà publiées
                                </button>
                            ) : (
                                <button
                                    className="ax-btn save-publish"
                                    onClick={() => setPublishModal("confirm")}
                                    disabled={isSaving || isPublishing || !allSubmitted}
                                    title={!allSubmitted
                                        ? `Il reste ${totalPreuves - preuvesRemplies} preuves à soumettre avant de pouvoir publier.`
                                        : "Publier toutes les annexes"}>
                                    Publier
                                </button>
                            )}
                        </div>

                        <div className="ax-progress">
                            <div className="ax-progress-meta">
                                <span className="ax-progress-label">Progression globale</span>
                                <span className="ax-progress-count">
                                    <b>{preuvesRemplies}</b> / {totalPreuves}
                                    <span className={`ax-pct-pill ${pct===100?"complete":""}`}>{pct}%</span>
                                </span>
                            </div>
                            <div className="ax-progress-track">
                                <div className="ax-progress-fill" style={{width:`${pct}%`}}/>
                            </div>
                        </div>
                    </div>

                    <div className="ax-body">
                        {grouped.map(d => (
                            <Domaine
                                key={d.domaine}
                                domaine={d}
                                onSaved={() => router.reload({ only: ["preuvesRemplies", "grouped"] })}
                            />
                        ))}
                    </div>
                </div>
            </EtablissementLayout>
        </AnnexeCtx.Provider>
    );
}
