import { Head, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import {
    canUploadFinalReport,
    finalReportAvailabilityText,
} from '@/utils/finalReportAvailability';

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#e03131";

export default function Deposer({ dossier = {}, rapport = null }) {
    const canDepose = canUploadFinalReport(dossier);
    const availabilityText = finalReportAvailabilityText(dossier);
    const form = useForm({
        titre:       rapport?.titre || 'Rapport expert',
        commentaire: rapport?.commentaire || '',
        rapport:     null,
    });

    const fileRef   = useRef();
    const [dragOver, setDragOver] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        form.post(`/expert/rapports/${dossier.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        if (!canDepose) return;
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) form.setData('rapport', file);
    };

    const etab = dossier.etablissement || dossier;

    return (
        <>
            <Head title="Déposer rapport — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@500&display=swap');
                .exp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fu { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
                .field-input:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,.1) !important; }
                .drop-zone { transition: border-color .2s, background .2s; }
                .drop-zone:hover { border-color: ${BLUE} !important; background: rgba(12,68,124,.03) !important; }
                .btn-primary { transition: opacity .15s, box-shadow .15s; }
                .btn-primary:hover:not(:disabled) { opacity: .9; box-shadow: 0 8px 24px rgba(29,158,117,.35) !important; }
                .btn-secondary { transition: background .15s; }
                .btn-secondary:hover { background: #f1f5f9 !important; }
            `}</style>

            <div className="exp-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Breadcrumb + Header */}
                <div className="fu" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                        <a href="/expert/dashboard" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textDecoration: "none" }}>Espace Expert</a>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <a href="/expert/rapports" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textDecoration: "none" }}>Mes rapports</a>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Déposer</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${GREEN}30`, flexShrink: 0 }}>
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <polyline points="16 16 12 12 8 16"/>
                                    <line x1="12" y1="12" x2="12" y2="21"/>
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                </svg>
                            </div>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Déposer un rapport</h1>
                                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                                    {etab.acronyme || etab.nom || 'Dossier'} — {etab.ville || ''}
                                    {dossier.reference && <span style={{ fontFamily: "'DM Mono', monospace", color: "#94a3b8", marginLeft: 8 }}>{dossier.reference}</span>}
                                </p>
                            </div>
                        </div>

                        <a href={`/expert/dossiers/${dossier.id}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flexShrink: 0 }}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                            Retour au dossier
                        </a>
                    </div>
                </div>

                {/* Visit date blocking banner */}
                {!canDepose && (
                    <div className="fu" style={{ marginBottom: 20, border: `1px solid ${ORANGE}50`, borderRadius: 14, padding: "14px 20px", background: "#fffbeb", display: "flex", alignItems: "center", gap: 12, animationDelay: "0.05s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${ORANGE}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e", margin: 0 }}>Dépôt non disponible</p>
                            <p style={{ fontSize: 12, color: "#b45309", margin: "2px 0 0" }}>
                                {dossier.date_visite
                                    ? `${availabilityText} Le dépôt est possible minimum 1 jour après la visite sur site.`
                                    : "Aucune date de visite n'a été planifiée pour ce dossier."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Existing rapport banner */}
                {rapport && (
                    <div className="fu" style={{ marginBottom: 20, border: `1px solid ${GREEN}30`, borderRadius: 14, padding: "14px 20px", background: "#f0fdf4", display: "flex", alignItems: "center", gap: 12, animationDelay: "0.05s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${GREEN}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#065f46", margin: 0 }}>Un rapport a déjà été déposé pour ce dossier.</p>
                            <p style={{ fontSize: 12, color: "#16a34a", margin: "2px 0 0" }}>Vous pouvez déposer un nouveau fichier pour le remplacer.</p>
                        </div>
                    </div>
                )}

                {/* Form card */}
                <div className="fu" style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 18, boxShadow: "0 2px 16px rgba(12,68,124,.06)", overflow: "hidden", animationDelay: "0.1s" }}>

                    {/* Card header */}
                    <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Fichier du rapport</h2>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>Formats acceptés : PDF, DOC, DOCX — max 10 Mo</p>
                        </div>
                    </div>

                    <form onSubmit={submit} style={{ padding: "1.75rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                            {/* Titre */}
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                                    Titre du rapport
                                </label>
                                <input
                                    className="field-input"
                                    value={form.data.titre}
                                    onChange={e => form.setData('titre', e.target.value)}
                                    placeholder="Titre du rapport"
                                    style={{ width: "100%", padding: "11px 14px", border: form.errors.titre ? `1.5px solid ${RED}` : "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#0f172a", background: "#fafbfc", outline: "none" }}
                                />
                                {form.errors.titre && (
                                    <p style={{ fontSize: 11, color: RED, margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        {form.errors.titre}
                                    </p>
                                )}
                            </div>

                            {/* Commentaire */}
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                                    Commentaire
                                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>(optionnel)</span>
                                </label>
                                <textarea
                                    className="field-input"
                                    value={form.data.commentaire}
                                    onChange={e => form.setData('commentaire', e.target.value)}
                                    rows={4}
                                    placeholder="Commentaire ou observations complémentaires..."
                                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#0f172a", background: "#fafbfc", outline: "none", resize: "vertical", lineHeight: 1.6 }}
                                />
                                {form.errors.commentaire && (
                                    <p style={{ fontSize: 11, color: RED, margin: "5px 0 0" }}>{form.errors.commentaire}</p>
                                )}
                            </div>

                            {/* File upload */}
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                                    Fichier du rapport
                                    <span style={{ fontSize: 11, color: RED, marginLeft: 3 }}>*</span>
                                </label>

                                <div
                                    className="drop-zone"
                                    onClick={() => canDepose && fileRef.current.click()}
                                    onDragOver={e => { e.preventDefault(); if (canDepose) setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                    style={{
                                        border: `2px dashed ${form.data.rapport ? GREEN : dragOver ? BLUE : "#e2e8f0"}`,
                                        borderRadius: 14,
                                        padding: "2.5rem 1.5rem",
                                        textAlign: "center",
                                        cursor: canDepose ? "pointer" : "not-allowed",
                                        background: !canDepose ? "#f8fafc" : form.data.rapport ? `${GREEN}04` : dragOver ? `${BLUE}04` : "#fafbfc",
                                        opacity: canDepose ? 1 : 0.65,
                                        transition: "all .2s",
                                    }}
                                >
                                    {form.data.rapport ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: GREEN, margin: 0 }}>{form.data.rapport.name}</p>
                                                <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                                                    {(form.data.rapport.size / 1024).toFixed(1)} Ko — Cliquer pour changer
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${BLUE}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.75">
                                                    <polyline points="16 16 12 12 8 16"/>
                                                    <line x1="12" y1="12" x2="12" y2="21"/>
                                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: 0 }}>Glissez votre fichier ici ou cliquez pour parcourir</p>
                                                <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>PDF, DOC, DOCX — max 10 Mo</p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        style={{ display: "none" }}
                                        onChange={e => form.setData('rapport', e.target.files[0])}
                                    />
                                </div>

                                {form.errors.rapport && (
                                    <p style={{ fontSize: 11, color: RED, margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        {form.errors.rapport}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
                            <a href="/expert/rapports"
                                className="btn-secondary"
                                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                                Annuler
                            </a>
                            <button
                                type="submit"
                                disabled={form.processing || !canDepose}
                                className="btn-primary"
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 10, border: "none", background: (form.processing || !canDepose) ? "#94a3b8" : `linear-gradient(135deg, ${GREEN}, #178a63)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: (form.processing || !canDepose) ? "not-allowed" : "pointer", boxShadow: `0 4px 14px rgba(29,158,117,.4)` }}>
                                {form.processing ? (
                                    <>
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                        Dépôt en cours...
                                    </>
                                ) : (
                                    <>
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="16 16 12 12 8 16"/>
                                            <line x1="12" y1="12" x2="12" y2="21"/>
                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                        </svg>
                                        Déposer le rapport
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

Deposer.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;
