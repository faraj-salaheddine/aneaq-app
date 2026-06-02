import { useState, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const PURPLE = '#7c3aed';
const GREEN  = '#15803d';
const BLUE   = '#0C447C';

const STATUT = {
    envoyee_etablissement: { label: 'À traiter', bg: '#faf5ff', color: PURPLE,   border: '#e9d5ff' },
    en_cours:              { label: 'En cours',  bg: '#fefce8', color: '#a16207', border: '#fef08a' },
    cloturee:              { label: 'Clôturée',  bg: '#f0fdf4', color: '#166534', border: '#86efac' },
};

function Badge({ statut }) {
    const cfg = STATUT[statut] || { label: statut, bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
    return (
        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 700 }}>
            {cfg.label}
        </span>
    );
}

function FileIcon({ ext }) {
    const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', jpg: '🖼', jpeg: '🖼', png: '🖼', ppt: '📋', pptx: '📋', zip: '🗜', rar: '🗜' };
    return <span>{icons[ext?.toLowerCase()] || '📎'}</span>;
}

function RecCard({ r, preuves, dossierId }) {
    const [open, setOpen]           = useState(false);
    const [files, setFiles]         = useState([]);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending]     = useState(false);
    const [dragOver, setDragOver]   = useState(false);
    const inputRef = useRef(null);

    const base        = `/etablissement/recommandations/${dossierId}`;
    const isActive    = ['envoyee_etablissement', 'en_cours'].includes(r.statut);
    const isCloturee  = r.statut === 'cloturee';
    const isDEE       = r.statut === 'en_cours';

    const addFiles = (newFiles) => {
        setFiles(prev => {
            const existing = new Set(prev.map(f => f.name + f.size));
            return [...prev, ...Array.from(newFiles).filter(f => !existing.has(f.name + f.size))];
        });
    };

    const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    function enregistrerBrouillon() {
        if (files.length === 0) return;
        setUploading(true);
        const form = new FormData();
        files.forEach(f => form.append('fichiers[]', f));
        router.post(`${base}/${r.id}/preuves`, form, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setFiles([]); setUploading(false); },
            onError: () => setUploading(false),
        });
    }

    function envoyerAuDEE() {
        if (files.length > 0) {
            // Upload files first, then send
            setSending(true);
            const form = new FormData();
            files.forEach(f => form.append('fichiers[]', f));
            router.post(`${base}/${r.id}/preuves`, form, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    router.post(`${base}/${r.id}/envoyer-dee`, {}, {
                        preserveScroll: true,
                        onFinish: () => { setFiles([]); setSending(false); },
                    });
                },
                onError: () => setSending(false),
            });
        } else {
            setSending(true);
            router.post(`${base}/${r.id}/envoyer-dee`, {}, {
                preserveScroll: true,
                onFinish: () => setSending(false),
            });
        }
    }

    const ext = (nom) => (nom || '').split('.').pop();

    return (
        <div style={{ background: '#fff', border: `1px solid ${isActive && !isDEE ? '#e9d5ff' : isDEE ? '#fef08a' : '#e2e8f0'}`, borderLeft: `4px solid ${STATUT[r.statut]?.color || '#e2e8f0'}`, borderRadius: 14, overflow: 'hidden' }}>

            {/* Card header */}
            <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                            <Badge statut={r.statut} />
                            {r.domaine_code && (
                                <span style={{ background: BLUE + '12', color: BLUE, border: `1px solid ${BLUE}22`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                                    {r.domaine_code}
                                </span>
                            )}
                            {preuves.length > 0 && (
                                <span style={{ background: '#f0fdf4', color: GREEN, border: '1px solid #86efac', borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 800 }}>
                                    📎 {preuves.length} fichier(s)
                                </span>
                            )}
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: '#1e293b', lineHeight: 1.65, fontWeight: 500 }}>{r.recommandation}</p>
                    </div>
                    {isActive && (
                        <button
                            onClick={() => setOpen(o => !o)}
                            style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 9, border: `1.5px solid ${open ? PURPLE : '#e2e8f0'}`, background: open ? PURPLE : '#fff', color: open ? '#fff' : '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .12s' }}>
                            {open ? '× Fermer' : (isDEE ? '✏️ Ajouter des preuves' : '📎 Ajouter des preuves')}
                        </button>
                    )}
                </div>

                {/* DEE comment */}
                {r.commentaire_dee && (
                    <div style={{ marginTop: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '3px solid #64748b', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#374151' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginRight: 8 }}>Note DEE :</span>
                        {r.commentaire_dee}
                    </div>
                )}
            </div>

            {/* Preuves déjà déposées */}
            {preuves.length > 0 && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 20px', background: '#fafeff' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Fichiers déposés</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {preuves.map(p => (
                            <div key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#374151' }}>
                                <FileIcon ext={ext(p.fichier_nom)} />
                                <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.fichier_nom}</span>
                                {!isCloturee && (
                                    <button
                                        onClick={() => { if (confirm('Supprimer ce fichier ?')) router.delete(`${base}/preuves/${p.id}`, { preserveScroll: true }); }}
                                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: 0, marginLeft: 2 }}>
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload zone (expanded) */}
            {isActive && open && (
                <div style={{ borderTop: '2px solid #e9d5ff', padding: '18px 20px', background: '#faf5ff' }}>
                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        style={{
                            border: `2px dashed ${dragOver ? PURPLE : '#c4b5fd'}`,
                            borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer',
                            background: dragOver ? '#ede9fe' : '#fff', transition: 'all .15s', marginBottom: 14,
                        }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>📂</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: PURPLE }}>Cliquez ou glissez des fichiers ici</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Tous types acceptés · Max 20 Mo par fichier · Plusieurs fichiers autorisés</div>
                        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
                    </div>

                    {/* Selected files (not yet uploaded) */}
                    {files.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                                {files.length} fichier(s) sélectionné(s)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {files.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '7px 12px', fontSize: 12 }}>
                                        <FileIcon ext={ext(f.name)} />
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>{f.name}</span>
                                        <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} Ko</span>
                                        <button onClick={() => removeFile(i)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: 0 }}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                            disabled={files.length === 0 || uploading}
                            onClick={enregistrerBrouillon}
                            style={{ padding: '9px 20px', borderRadius: 9, border: `1.5px solid ${PURPLE}`, background: '#fff', color: PURPLE, fontSize: 13, fontWeight: 700, cursor: files.length === 0 || uploading ? 'not-allowed' : 'pointer', opacity: files.length === 0 ? .45 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {uploading ? '⏳ Enregistrement…' : '💾 Enregistrer brouillon'}
                        </button>
                        <button
                            disabled={sending || (preuves.length === 0 && files.length === 0)}
                            onClick={envoyerAuDEE}
                            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: sending ? '#e2e8f0' : GREEN, color: sending ? '#94a3b8' : '#fff', fontSize: 13, fontWeight: 700, cursor: sending || (preuves.length === 0 && files.length === 0) ? 'not-allowed' : 'pointer', opacity: (preuves.length === 0 && files.length === 0) ? .45 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: sending ? 'none' : '0 2px 8px #15803d44' }}>
                            {sending ? '⏳ Envoi…' : '📤 Envoyer à la DEE'}
                        </button>
                        {(preuves.length === 0 && files.length === 0) && (
                            <span style={{ fontSize: 11, color: '#f59e0b', alignSelf: 'center' }}>⚠ Ajoutez au moins un fichier</span>
                        )}
                    </div>
                </div>
            )}

            {/* Clôturée notice */}
            {isCloturee && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '8px 20px', background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>✓ Recommandation clôturée</span>
                </div>
            )}
        </div>
    );
}

export default function Index({ dossier, recommandations = [], preuves = [] }) {
    const { flash = {} } = usePage().props;

    const preuvesByReco = preuves.reduce((acc, p) => {
        if (!acc[p.recommandation_id]) acc[p.recommandation_id] = [];
        acc[p.recommandation_id].push(p);
        return acc;
    }, {});

    const aTraiter  = recommandations.filter(r => r.statut === 'envoyee_etablissement').length;
    const enCours   = recommandations.filter(r => r.statut === 'en_cours').length;
    const cloturees = recommandations.filter(r => r.statut === 'cloturee').length;

    return (
        <>
            <Head title={`Recommandations — ${dossier.reference}`} />
            <EtablissementLayout>
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                            Recommandations — {dossier.reference}
                        </h1>
                        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
                            Déposez vos preuves de mise en œuvre pour chaque recommandation et envoyez-les à la DEE.
                        </p>
                    </div>

                    {/* Flash */}
                    {flash.success && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #15803d', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#166534', fontSize: 14, fontWeight: 600 }}>
                            ✓ {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#991b1b', fontSize: 14, fontWeight: 600 }}>
                            ✕ {flash.error}
                        </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                        {[
                            { label: 'À traiter', val: aTraiter,  color: PURPLE },
                            { label: 'En cours',  val: enCours,   color: '#a16207' },
                            { label: 'Clôturées', val: cloturees, color: GREEN },
                        ].map(s => (
                            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Cards */}
                    {recommandations.length === 0 ? (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                            Aucune recommandation reçue pour le moment.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {recommandations.map(r => (
                                <RecCard
                                    key={r.id}
                                    r={r}
                                    preuves={preuvesByReco[r.id] || []}
                                    dossierId={dossier.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </EtablissementLayout>
        </>
    );
}
