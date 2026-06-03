import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import SuiviRecommandationsTab from '@/Components/DEE/SuiviRecommandationsTab';
import DashboardShell from '@/Layouts/DashboardShell';
import MessageriePanel from '@/Components/MessageriePanel';
import ConfirmModal from '@/Components/ConfirmModal';
import AnnexesConformityDashboard from '@/Components/DEE/AnnexesConformityDashboard';
import {
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    BadgeCheck,
    Building2,
    CalendarDays,
    Camera,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Download,
    Eye,
    FileText,
    FolderKanban,
    Image,
    LockKeyhole,
    ListTree,
    Mail,
    MapPin,
    Save,
    Search,
    Send,
    Trash2,
    Upload,
    UserCheck,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

/* ── Note options ── */
const NOTE_OPTS_DEE = [
    { val:0, label:'Absent',       color:'#c0344a', bg:'#fdf0f2', border:'#f8cdd3' },
    { val:1, label:'Non conforme', color:'#b35c00', bg:'#fdf5ec', border:'#fde8cc' },
    { val:2, label:'Acceptable',   color:'#5046a8', bg:'#f0effc', border:'#dddaf7' },
    { val:3, label:'Conforme',     color:'#0e7c5b', bg:'#ecfaf4', border:'#c6f0df' },
];

/* ── Preuve row (read-only) ── */
function PreuveDEE({ preuve, dossierId }) {
    const opt = NOTE_OPTS_DEE.find(o => o.val === preuve.note);
    return (
        <tr className="border-t border-slate-100 hover:bg-slate-50/50">
            <td className="px-4 py-2.5 text-center">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
                    {preuve.preuve_index + 1}
                </span>
            </td>
            <td className="max-w-sm px-4 py-2.5 text-xs text-slate-700">{preuve.preuve_label}</td>
            <td className="px-4 py-2.5">
                {preuve.fichier_nom ? (
                    <a href={route('dee.dossiers.annexes.download', { dossier: dossierId, criterePreuve: preuve.fichier_id })}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition">
                        📄 {preuve.fichier_nom.length > 20 ? preuve.fichier_nom.slice(0,20)+'…' : preuve.fichier_nom}
                    </a>
                ) : <span className="text-xs italic text-slate-400">Aucun fichier</span>}
            </td>
            <td className="px-4 py-2.5 text-center">
                {opt ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black whitespace-nowrap"
                        style={{ background: opt.bg, color: opt.color, border: `1px solid ${opt.border}` }}>
                        {opt.val} — {opt.label}
                    </span>
                ) : <span className="text-xs text-slate-300">—</span>}
            </td>
            <td className="max-w-xs px-4 py-2.5 text-xs italic text-slate-500">
                {preuve.observation || <span className="text-slate-300">—</span>}
            </td>
        </tr>
    );
}

/* ── Critere block ── */
function CritereDEE({ critere, dossierId }) {
    const [open, setOpen] = useState(false);
    const conf = critere.preuves.filter(p => p.note !== null).length;
    return (
        <div className="border-t border-slate-100">
            <button onClick={() => setOpen(o => !o)}
                className="flex w-full items-start gap-3 px-6 py-3 text-left hover:bg-slate-50/60 transition">
                <span className="mt-0.5 shrink-0 rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-black text-blue-700">
                    {critere.critere_num}
                </span>
                <span className="flex-1 text-xs font-medium text-slate-700">{critere.critere_label}</span>
                <span className={`shrink-0 text-xs font-bold ${conf === critere.preuves.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {conf}/{critere.preuves.length}
                </span>
                <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {open && (
                <div className="overflow-x-auto bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-400">
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Preuve</th>
                                <th className="px-4 py-2">Fichier</th>
                                <th className="px-4 py-2 text-center">Note</th>
                                <th className="px-4 py-2">Observation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {critere.preuves.map((p, i) => (
                                <PreuveDEE key={i} preuve={p} dossierId={dossierId} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ── Reference block ── */
function ReferenceDEE({ reference, dossierId }) {
    const [open, setOpen] = useState(false);
    const tot  = reference.criteres.reduce((a, c) => a + c.preuves.length, 0);
    const conf = reference.criteres.reduce((a, c) => a + c.preuves.filter(p => p.note !== null).length, 0);
    return (
        <div className="border-t border-slate-100">
            <button onClick={() => setOpen(o => !o)}
                className="flex w-full items-center gap-3 bg-slate-50/60 px-6 py-2.5 text-left hover:bg-slate-100/60 transition">
                <span className="shrink-0 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-black text-blue-600">
                    {reference.reference}
                </span>
                <span className="flex-1 text-xs text-slate-600 leading-snug">{reference.reference_label}</span>
                <span className="shrink-0 text-xs font-bold text-slate-400">{conf}/{tot}</span>
                <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {open && reference.criteres.map(c => (
                <CritereDEE key={c.critere_id} critere={c} dossierId={dossierId} />
            ))}
        </div>
    );
}

/* ── Champ block ── */
function ChampDEE({ champ, dossierId }) {
    const [open, setOpen] = useState(false);
    const tot  = champ.references.reduce((a, r) => a + r.criteres.reduce((b, c) => b + c.preuves.length, 0), 0);
    const conf = champ.references.reduce((a, r) => a + r.criteres.reduce((b, c) => b + c.preuves.filter(p => p.note !== null).length, 0), 0);
    const full = conf === tot && tot > 0;
    return (
        <div className="border-t border-slate-200">
            <button onClick={() => setOpen(o => !o)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50 transition">
                <span className="shrink-0 rounded bg-slate-200 px-2 py-0.5 font-mono text-xs font-black text-slate-700">
                    {champ.champ}
                </span>
                <span className="flex-1 text-sm font-semibold text-slate-800">{champ.champ_label}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black ${full ? 'bg-emerald-100 text-emerald-700' : conf === 0 ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
                    {conf}/{tot}
                </span>
                <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {open && champ.references.map(r => (
                <ReferenceDEE key={r.reference} reference={r} dossierId={dossierId} />
            ))}
        </div>
    );
}

/* ── Domaine block ── */
const SWOT_DEE = [
    { key:"forces",       label:"Forces",       color:"#0e7c5b", bg:"#ecfaf4", border:"#c6f0df" },
    { key:"faiblesses",   label:"Faiblesses",   color:"#c0344a", bg:"#fdf0f2", border:"#f8cdd3" },
    { key:"opportunites", label:"Opportunités",  color:"#1c5fdc", bg:"#eef3fd", border:"#d6e4fb" },
    { key:"menaces",      label:"Menaces",       color:"#b35c00", bg:"#fdf5ec", border:"#fde8cc" },
];

function SwotDEE({ swot }) {
    if (!swot) return (
        <div className="mx-6 mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-3 text-xs italic text-slate-400">
            Analyse SWOT non remplie par l'expert pour ce domaine.
        </div>
    );
    const filled = SWOT_DEE.filter(f => swot[f.key]?.trim()).length;
    if (filled === 0) return (
        <div className="mx-6 mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-3 text-xs italic text-slate-400">
            Analyse SWOT non remplie par l'expert pour ce domaine.
        </div>
    );
    return (
        <div className="mx-6 mb-4 overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 bg-slate-800 px-4 py-2.5">
                <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs font-black text-white/80">SWOT</span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Analyse SWOT</span>
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-black text-emerald-300">{filled}/4 rempli{filled>1?"s":""}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
                {SWOT_DEE.map(f => swot[f.key]?.trim() ? (
                    <div key={f.key} className="p-4" style={{ background: f.bg }}>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: f.color }}/>
                            <span className="text-xs font-black uppercase tracking-wide" style={{ color: f.color }}>{f.label}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{swot[f.key]}</p>
                    </div>
                ) : (
                    <div key={f.key} className="p-4 text-xs italic text-slate-400">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-300">{f.label} —</span> Non renseigné
                    </div>
                ))}
            </div>
        </div>
    );
}

function DomaineDEE({ domaine, dossierId }) {
    const [open, setOpen] = useState(false);
    const tot  = domaine.champs.reduce((a, ch) => a + ch.references.reduce((b, r) => b + r.criteres.reduce((c, cr) => c + cr.preuves.length, 0), 0), 0);
    const conf = domaine.champs.reduce((a, ch) => a + ch.references.reduce((b, r) => b + r.criteres.reduce((c, cr) => c + cr.preuves.filter(p => p.note !== null).length, 0), 0), 0);
    const pct  = tot > 0 ? Math.round(conf / tot * 100) : 0;
    const swotFilled = domaine.swot ? ['forces','faiblesses','opportunites','menaces'].filter(k => domaine.swot[k]?.trim()).length : 0;
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button onClick={() => setOpen(o => !o)}
                className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-slate-50 transition">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm font-black text-white">
                    {domaine.domaine}
                </div>
                <div className="flex-1">
                    <p className="font-black text-slate-900">Domaine {domaine.domaine} — {domaine.domaine_label}</p>
                    <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{ width:`${pct}%`, background: pct===100 ? '#0e7c5b' : '#1c5fdc' }}/>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {swotFilled > 0 && (
                        <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs font-black text-white">
                            SWOT {swotFilled}/4
                        </span>
                    )}
                    <span className="text-sm font-black text-slate-600">{conf}/{tot}</span>
                </div>
                <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {open && (
                <>
                    <SwotDEE swot={domaine.swot} />
                    {domaine.champs.map(ch => (
                        <ChampDEE key={ch.champ} champ={ch} dossierId={dossierId} />
                    ))}
                </>
            )}
        </div>
    );
}

function ExpertAnnexesEvaluationDEE({ evaluation, dossierId }) {
    const [activeView, setActiveView] = useState('summary');

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-slate-50 px-6 py-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white shadow">
                        {(evaluation.expert_nom || '?')[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-black text-slate-900">{evaluation.expert_nom}</p>
                        <p className="text-xs text-slate-500">Soumis le {evaluation.soumis_le} · {evaluation.total} preuves évaluées</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {NOTE_OPTS_DEE.map((opt) => (
                        <div key={opt.val} className="rounded-xl px-3 py-2 text-center"
                            style={{ background: opt.bg, border: `1px solid ${opt.border}` }}>
                            <p className="text-lg font-black" style={{ color: opt.color }}>{evaluation.stats[opt.val] ?? 0}</p>
                            <p className="text-xs font-bold" style={{ color: opt.color }}>{opt.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setActiveView('summary')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                        activeView === 'summary'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    <BarChart3 size={16} />
                    Synthèse graphique
                </button>
                <button type="button" onClick={() => setActiveView('details')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                        activeView === 'details'
                            ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    <ListTree size={16} />
                    Détail des notes
                </button>
            </div>

            {activeView === 'summary' ? (
                <AnnexesConformityDashboard grouped={evaluation.grouped} />
            ) : (
                <div className="space-y-3">
                    {evaluation.grouped.map((domaine) => (
                        <DomaineDEE key={domaine.domaine} domaine={domaine} dossierId={dossierId} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Main annexes tab ── */
function AnnexesEvalTab({ evaluationsAnnexes, dossierId }) {
    if (evaluationsAnnexes.length === 0) return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <ClipboardCheck className="mx-auto text-slate-300" size={44} />
            <p className="mt-4 text-lg font-black text-slate-900">Aucune évaluation soumise</p>
            <p className="mt-1 text-sm text-slate-500">Les experts n'ont pas encore soumis leurs évaluations des annexes.</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {evaluationsAnnexes.map((evaluation) => (
                <ExpertAnnexesEvaluationDEE key={evaluation.expert_id} evaluation={evaluation} dossierId={dossierId} />
            ))}
        </div>
    );
}

function Show({ dossier, experts = [], allExperts = [], dossierExperts = [], documents = [], photos = [], rapportsExperts = [], evaluationsAnnexes = [], expectedDocuments = {}, recommandations = [], recommandationsStats = {}, recommandationsRappels = [], recommandationsProchainRappel = null }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [activeTab, setActiveTab] = useState('pilotage');
    const annexesBadgeStorageKey = `dee:dossier:${dossier.id}:evaluations-annexes:seen`;
    const annexesBadgeSignature = evaluationsAnnexes
        .map((evaluation) => `${evaluation.expert_id}:${evaluation.soumis_le ?? ''}`)
        .sort()
        .join('|');
    const [seenAnnexesSignature, setSeenAnnexesSignature] = useState(() => {
        if (typeof window === 'undefined') return '';

        try {
            return window.localStorage.getItem(annexesBadgeStorageKey) || '';
        } catch {
            return '';
        }
    });
    const hasUnreadAnnexes = evaluationsAnnexes.length > 0 && seenAnnexesSignature !== annexesBadgeSignature;

    const openAnnexesTab = () => {
        setActiveTab('annexes');
        setSeenAnnexesSignature(annexesBadgeSignature);

        if (typeof window === 'undefined') return;

        try {
            window.localStorage.setItem(annexesBadgeStorageKey, annexesBadgeSignature);
        } catch {
            // The badge still disappears for the current page if storage is unavailable.
        }
    };
    const [expertSearch, setExpertSearch] = useState('');
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [expertFilterActive, setExpertFilterActive] = useState(true);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [dialog, setDialog] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, rapport: null });
    const [motifRejet, setMotifRejet] = useState('');
    const [confirmAcceptModal, setConfirmAcceptModal] = useState({ open: false, rapport: null });
    const [envoyerModal, setEnvoyerModal] = useState({ open: false, rapport: null });

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        type: null,
        item: null,
    });

    const secureDeleteForm = useForm({
        delete_password: '',
    });

    const updateForm = useForm({
        description: dossier.description || '',
        observation: dossier.observation || '',
    });

    const dateForm = useForm({
        date_visite: dossier.date_visite_value || dossier.date_visite || '',
    });

    const expertForm = useForm({
        expert_id: '',
        role_expert: 'expert',
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0] || null;
        if (!file) return;
        setPhotoPreviews([URL.createObjectURL(file)]);
        const data = new FormData();
        data.append('photo', file);
        router.post(`/dee/dossiers/${dossier.id}/photos`, data, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setPhotoPreviews([]);
                e.target.value = '';
            },
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();

        updateForm.patch(`/dee/dossiers/${dossier.id}`, {
            preserveScroll: true,
        });
    };

    const submitDate = (e) => {
        e.preventDefault();

        dateForm.patch(`/dee/dossiers/${dossier.id}`, {
            preserveScroll: true,
        });
    };

    const chooseExpert = (expert) => {
        setSelectedExpert(expert);
        expertForm.setData('expert_id', expert.id);
    };

    const submitExpert = (e) => {
        e.preventDefault();

        expertForm.post(`/dee/dossiers/${dossier.id}/experts`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedExpert(null);
                expertForm.reset();
                expertForm.setData('role_expert', 'expert');
            },
        });
    };

    const acceptExpert = (dossierExpertId) => {
        router.post(
            `/dee/dossiers/${dossier.id}/experts/${dossierExpertId}/confirm`,
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const renvoyerEmailExpert = (dossierExpertId) => {
        router.post(
            `/dee/dossiers/${dossier.id}/experts/${dossierExpertId}/renvoyer-email`,
            {},
            { preserveScroll: true }
        );
    };

    const refuseExpert = (dossierExpertId) => {
        setDialog({
            message: 'Voulez-vous vraiment refuser cet expert ?',
            onConfirm: () => {
                setDialog(null);
                router.delete(`/dee/dossiers/${dossier.id}/experts/${dossierExpertId}/refuse`, { preserveScroll: true });
            },
        });
    };

    const openSecureDeleteModal = (type, item) => {
        setDeleteModal({
            open: true,
            type,
            item,
        });

        secureDeleteForm.setData('delete_password', '');
        secureDeleteForm.clearErrors();
    };

    const closeSecureDeleteModal = () => {
        setDeleteModal({
            open: false,
            type: null,
            item: null,
        });

        secureDeleteForm.reset();
        secureDeleteForm.clearErrors();
    };

    const deleteExpert = (dossierExpert) => {
        const item =
            typeof dossierExpert === 'object' && dossierExpert !== null
                ? dossierExpert
                : dossierExperts.find((expertItem) => Number(expertItem.id) === Number(dossierExpert)) || {
                      id: dossierExpert,
                      expert: {
                          name: 'Expert',
                      },
                  };

        openSecureDeleteModal('expert', item);
    };

    const deleteDocument = (document) => {
        const item =
            typeof document === 'object' && document !== null
                ? document
                : documents.find((doc) => Number(doc.id) === Number(document)) || {
                      id: document,
                      nom: 'Document',
                  };

        openSecureDeleteModal('document', item);
    };

    const deletePhoto = (photo) => {
        openSecureDeleteModal('photo', photo);
    };

    const validerRapport = (rapport) => {
        setConfirmAcceptModal({ open: true, rapport });
    };

    const envoyerRapportAEtablissement = () => {
        router.post(
            `/dee/dossiers/${dossier.id}/rapports/${envoyerModal.rapport.id}/envoyer-etablissement`,
            {},
            { preserveScroll: true, onSuccess: () => setEnvoyerModal({ open: false, rapport: null }) }
        );
    };

    const confirmValider = () => {
        router.post(
            `/dee/dossiers/${dossier.id}/rapports/${confirmAcceptModal.rapport.id}/valider`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setConfirmAcceptModal({ open: false, rapport: null }),
            }
        );
    };

    const openRejectModal = (rapport) => {
        setRejectModal({ open: true, rapport });
        setMotifRejet('');
    };

    const closeRejectModal = () => {
        setRejectModal({ open: false, rapport: null });
        setMotifRejet('');
    };

    const submitRejet = (e) => {
        e.preventDefault();
        if (!motifRejet.trim()) return;
        router.post(
            `/dee/dossiers/${dossier.id}/rapports/${rejectModal.rapport.id}/rejeter`,
            { motif: motifRejet },
            {
                preserveScroll: true,
                onSuccess: closeRejectModal,
            }
        );
    };

    const submitSecureDelete = (e) => {
        e.preventDefault();

        secureDeleteForm.clearErrors();

        if (!deleteModal.item) {
            secureDeleteForm.setError('delete_password', 'Aucun élément sélectionné.');
            return;
        }

        if (!secureDeleteForm.data.delete_password.trim()) {
            secureDeleteForm.setError('delete_password', 'Le mot de passe est obligatoire.');
            return;
        }

        const url =
            deleteModal.type === 'document'
                ? `/dee/dossiers/${dossier.id}/documents/${deleteModal.item.id}`
                : deleteModal.type === 'photo'
                  ? `/dee/dossiers/${dossier.id}/photos/${deleteModal.item.id}`
                  : `/dee/dossiers/${dossier.id}/experts/${deleteModal.item.id}`;

        secureDeleteForm.delete(url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                closeSecureDeleteModal();
            },
            onError: (errors) => {
                secureDeleteForm.setError(
                    'delete_password',
                    errors.delete_password || 'Mot de passe incorrect.'
                );
            },
        });
    };

    const assignedExpertIds = useMemo(() => {
        return new Set(
            dossierExperts
                .map((item) => item.expert?.id || item.expert_id)
                .filter(Boolean)
        );
    }, [dossierExperts]);

    const chefComite = useMemo(() =>
        dossierExperts.find((item) => item.role_expert === 'chef_comite') ?? null,
    [dossierExperts]);

    const filteredExperts = useMemo(() => {
        const search = expertSearch.toLowerCase().trim();
        const source = expertFilterActive ? experts : allExperts;

        return source
            .filter((expert) => !assignedExpertIds.has(expert.id))
            .filter((expert) => {
                if (!search) return true;

                const text = [
                    expert.nom,
                    expert.name,
                    expert.prenom,
                    expert.email,
                    expert.ville,
                    expert.specialite,
                    expert.etablissement,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return text.includes(search);
            });
    }, [experts, allExperts, assignedExpertIds, expertSearch, expertFilterActive]);

    const etablissement = dossier.etablissement || {};

    const dateVisiteBrute =
        dossier?.date_visite_value ||
        dossier?.date_visite ||
        dossier?.date_visite_planifiee ||
        dossier?.visite?.date_visite ||
        '';

    const hasDateVisite = isValidDateVisite(dateVisiteBrute);
    const dateVisiteAffichee = hasDateVisite ? dateVisiteBrute : '—';

    return (
        <>
            <Head title={dossier.nom || dossier.reference || 'Dossier'} />
            {dialog && (
                <ConfirmModal
                    title="Refuser l'expert"
                    message={dialog.message}
                    danger
                    confirmLabel="Refuser"
                    onConfirm={dialog.onConfirm}
                    onCancel={() => setDialog(null)}
                />
            )}
            {rejectModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Refuser le rapport</h3>
                                <p className="text-sm font-medium text-slate-500">Expert : {rejectModal.rapport?.expert_nom}</p>
                            </div>
                        </div>
                        <form onSubmit={submitRejet} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Motif du refus <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={motifRejet}
                                    onChange={(e) => setMotifRejet(e.target.value)}
                                    placeholder="Expliquez pourquoi ce rapport est refusé..."
                                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeRejectModal}
                                    className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={!motifRejet.trim()}
                                    className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    Confirmer le refus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmAcceptModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                <CheckCircle2 size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Accepter le rapport</h3>
                                <p className="text-sm font-medium text-slate-500">Expert : {confirmAcceptModal.rapport?.expert_nom}</p>
                            </div>
                        </div>
                        <p className="mt-5 text-sm font-medium text-slate-600 leading-7">
                            Confirmez-vous l'acceptation de ce rapport ? L'expert sera notifié par email.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmAcceptModal({ open: false, rapport: null })}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={confirmValider}
                                className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
                            >
                                Confirmer l'acceptation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {envoyerModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                <Send size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Envoyer à l'établissement</h3>
                                <p className="text-sm font-medium text-slate-500">Expert : {envoyerModal.rapport?.expert_nom}</p>
                            </div>
                        </div>
                        <p className="mt-5 text-sm font-medium text-slate-600 leading-7">
                            Confirmez-vous l'envoi de ce rapport final à l'établissement ? Il recevra une notification.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEnvoyerModal({ open: false, rapport: null })}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={envoyerRapportAEtablissement}
                                className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                            >
                                Confirmer l'envoi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MessageriePanel dossierId={dossier.id} currentRole="admin_dee" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">
                            Détail du dossier
                        </p>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            {dossier.reference || 'Dossier'}
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/dee/dossiers"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={17} />
                            Retour aux dossiers
                        </Link>

                        {dossier.campagne_id && (
                            <Link
                                href={`/dee/campagnes/${dossier.campagne_id}`}
                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <FolderKanban size={17} />
                                Voir la vague
                            </Link>
                        )}

                        <a
                            href={`/dee/dossiers/${dossier.id}/export/matrice`}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                        >
                            <FileText size={17} />
                            Export matrice PDF
                        </a>

                        <a
                            href={`/dee/dossiers/${dossier.id}/export/rapport`}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-black text-purple-700 shadow-sm transition hover:bg-purple-100"
                        >
                            <FileText size={17} />
                            Export rapport PDF
                        </a>
                    </div>
                </div>

                {flash.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash.error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                        {flash.error}
                    </div>
                )}

                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#3730c9] via-[#2563eb] to-[#0891b2] text-white shadow-xl shadow-blue-900/10">
                    <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-100">
                                Dossier d'évaluation
                            </p>

                            <h2 className="mt-3 text-4xl font-black tracking-tight">
                                {dossier.nom || dossier.reference || 'Dossier'}
                            </h2>

                            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50/90">
                                Cette page permet de suivre le dossier, les documents, les experts affectés,
                                le statut automatique et la date de visite.
                            </p>

                            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <HeroInfo label="Référence" value={dossier.reference} />
                                <HeroInfo label="Campagne" value={dossier.campagne || dossier.campagne_reference} />
                                <HeroInfo label="Statut" value={formatDossierStatus(dossier.statut)} />
                                <HeroInfo label="Date de visite" value={dateVisiteAffichee} />
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] bg-white/12 p-6 backdrop-blur">
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
                                Établissement
                            </p>

                            <h3 className="mt-4 text-2xl font-black">
                                {etablissement.nom || dossier.etablissement_nom || '—'}
                            </h3>

                            <div className="mt-5 space-y-3 text-sm font-semibold text-blue-50">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    {etablissement.ville || dossier.ville || '—'}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Building2 size={16} />
                                    {etablissement.universite || dossier.universite || '—'}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    {etablissement.email || dossier.email || '—'}
                                </div>

                                {etablissement.telephone && (
                                    <div className="flex items-center gap-2">
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.38-.38a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                                        {etablissement.telephone}
                                    </div>
                                )}

                                {etablissement.responsable_nom && (
                                    <div className="flex items-start gap-2 pt-2 border-t border-blue-400/30">
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        <span>
                                            <span className="text-blue-200 font-semibold">Chef de comité : </span>
                                            <span className="font-bold">{etablissement.responsable_nom}</span>
                                            {etablissement.responsable_fonction && (
                                                <span className="text-blue-200"> — {etablissement.responsable_fonction}</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <WorkflowProgressBar expectedDocuments={expectedDocuments} hasDateVisite={hasDateVisite} evaluationsAnnexes={evaluationsAnnexes} />

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={Users}
                        label="Experts"
                        value={dossierExperts.length}
                        description="Experts affectés"
                        accent="bg-blue-600"
                    />

                    <StatCard
                        icon={FileText}
                        label="Documents"
                        value={documents.length}
                        description="Documents déposés"
                        accent="bg-emerald-500"
                    />

                    <StatCard
                        icon={CalendarDays}
                        label="Visite"
                        value={hasDateVisite ? 1 : 0}
                        description={hasDateVisite ? 'Date planifiée' : 'Non planifiée'}
                        accent="bg-orange-500"
                    />

                    <StatCard
                        icon={CheckCircle2}
                        label="Statut"
                        value={formatShortStatus(dossier.statut)}
                        description="Mis à jour automatiquement"
                        accent="bg-pink-500"
                        smallValue
                    />
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pilotage')}
                        className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                            activeTab === 'pilotage'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Pilotage du dossier
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('visite')}
                        className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                            activeTab === 'visite'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Date de visite
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('photos')}
                        className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                            activeTab === 'photos'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Camera size={16} />
                        Photos de visite
                    </button>

                        <button
                            type="button"
                            onClick={openAnnexesTab}
                            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                                activeTab === 'annexes'
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                        >
                            <ClipboardCheck size={16} />
                            Éval. Annexes
                            {hasUnreadAnnexes && (
                                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-black ${activeTab === 'annexes' ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {evaluationsAnnexes.length}
                                </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('recommandations')}
                        className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                            activeTab === 'recommandations'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <ClipboardCheck size={16} />
                        Suivi recommandations
                        {(recommandationsStats.soumises ?? 0) > 0 && (
                            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-black ${activeTab === 'recommandations' ? 'bg-white/30 text-white' : 'bg-violet-100 text-violet-700'}`}>
                                {recommandationsStats.soumises}
                            </span>
                        )}
                    </button>
                </div>

                <div className="mt-6 grid gap-7 xl:grid-cols-[1.35fr_0.65fr]">
                    <div className="space-y-7">
                        {activeTab === 'pilotage' && (
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                        <ClipboardCheck size={24} />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">
                                            Pilotage du dossier
                                        </h3>

                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                            Le statut se modifie automatiquement selon les documents déposés.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                        Statut automatique
                                    </p>

                                    <p className="mt-2 text-lg font-black text-slate-900">
                                        {formatDossierStatus(dossier.statut)}
                                    </p>
                                </div>

                                <form onSubmit={submitUpdate} className="mt-6 space-y-5">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Description
                                        </label>

                                        <textarea
                                            value={updateForm.data.description}
                                            onChange={(e) => updateForm.setData('description', e.target.value)}
                                            rows="5"
                                            placeholder="Description du dossier..."
                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
                                        />

                                        {updateForm.errors.description && (
                                            <p className="mt-2 text-sm font-semibold text-red-600">
                                                {updateForm.errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Observation
                                        </label>

                                        <textarea
                                            value={updateForm.data.observation}
                                            onChange={(e) => updateForm.setData('observation', e.target.value)}
                                            rows="5"
                                            placeholder="Observation du dossier..."
                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
                                        />

                                        {updateForm.errors.observation && (
                                            <p className="mt-2 text-sm font-semibold text-red-600">
                                                {updateForm.errors.observation}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={updateForm.processing}
                                            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Save size={18} />
                                            {updateForm.processing ? 'Mise à jour...' : 'Mettre à jour'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'visite' && (
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <CalendarDays size={24} />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">
                                            Date de visite
                                        </h3>

                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                            Définis ou modifie la date de visite du dossier.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={submitDate} className="mt-7 space-y-5">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Date et heure de visite
                                        </label>

                                        <input
                                            type="datetime-local"
                                            value={dateForm.data.date_visite || ''}
                                            onChange={(e) => dateForm.setData('date_visite', e.target.value)}
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500"
                                        />

                                        {dateForm.errors.date_visite && (
                                            <p className="mt-2 text-sm font-semibold text-red-600">
                                                {dateForm.errors.date_visite}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={dateForm.processing}
                                            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <CalendarDays size={18} />
                                            {dateForm.processing ? 'Enregistrement...' : 'Enregistrer la date'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'annexes' && (
                            <AnnexesEvalTab evaluationsAnnexes={evaluationsAnnexes} dossierId={dossier.id} />
                        )}

                        {activeTab === 'recommandations' && (
                            <SuiviRecommandationsTab
                                dossier={dossier}
                                recommandations={recommandations}
                                stats={recommandationsStats}
                                rappels={recommandationsRappels}
                                prochainRappel={recommandationsProchainRappel}
                                etablissement={dossier.etablissement || {}}
                            />
                        )}

                        {activeTab === 'photos' && (
                            <div className="space-y-7">
                                <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                            <Camera size={24} />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">
                                                Photos de visite
                                            </h3>

                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                Ajoutez des photos de l'établissement prises lors de la visite.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7">
                                        <label
                                            htmlFor="photo-upload"
                                            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition ${
                                                photoPreviews.length > 0
                                                    ? 'border-violet-400 bg-violet-50/60'
                                                    : 'border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/40'
                                            }`}
                                        >
                                            {photoPreviews.length > 0 ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <img
                                                        src={photoPreviews[0]}
                                                        alt="Envoi en cours..."
                                                        className="h-28 w-28 rounded-xl object-cover ring-2 ring-violet-400"
                                                    />
                                                    <p className="text-sm font-bold text-violet-600">
                                                        Envoi en cours...
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                                                        <Upload size={26} />
                                                    </div>

                                                    <div className="text-center">
                                                        <p className="font-black text-slate-900">
                                                            Cliquez pour sélectionner une photo
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                                            La photo est envoyée automatiquement · JPG, JPEG ou PNG · 10 Mo max
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </label>

                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                            <Image size={24} />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">
                                                Galerie
                                            </h3>

                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                {photos.length} photo(s) déposée(s)
                                            </p>
                                        </div>
                                    </div>

                                    {photos.length > 0 ? (
                                        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                            {photos.map((photo) => (
                                                    <div key={photo.id} className="group relative overflow-hidden rounded-2xl bg-slate-100">
                                                        <img
                                                            src={photo.url}
                                                            alt={photo.original_name || 'Photo de visite'}
                                                            className="h-40 w-full object-cover transition group-hover:scale-105"
                                                        />

                                                        <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-gradient-to-t from-slate-900/70 p-3 opacity-0 transition group-hover:opacity-100">
                                                            <a
                                                                href={photo.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-black text-white backdrop-blur-sm transition hover:bg-white/40"
                                                            >
                                                                <Eye size={13} />
                                                                Voir
                                                            </a>

                                                            <button
                                                                type="button"
                                                                onClick={() => deletePhoto(photo)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-black text-white backdrop-blur-sm transition hover:bg-red-600"
                                                            >
                                                                <Trash2 size={13} />
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="mt-7 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                                            <Camera className="mx-auto text-slate-300" size={36} />

                                            <p className="mt-3 font-black text-slate-900">
                                                Aucune photo pour l'instant
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                Ajoutez des photos prises lors de la visite de l'établissement.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 p-7">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <Users size={24} />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">
                                            Affectation des experts
                                        </h3>

                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                            Choisis un expert, donne son rôle, puis confirme ou refuse son affectation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 p-7 xl:grid-cols-[1fr_0.75fr]">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Recherche expert
                                    </label>

                                    <div className="relative">
                                        <Search
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            value={expertSearch}
                                            onChange={(e) => setExpertSearch(e.target.value)}
                                            placeholder="Nom, email, ville, spécialité, établissement..."
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
                                        />
                                    </div>


                                    {expertFilterActive ? (
                                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                                            <span>Filtre actif — établissement différent</span>
                                            <button
                                                type="button"
                                                onClick={() => setExpertFilterActive(false)}
                                                className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-200 text-violet-700 transition hover:bg-red-200 hover:text-red-600"
                                                title="Désactiver le filtre"
                                            >
                                                <X size={11} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                                            <span>Filtre désactivé — tous les experts</span>
                                            <button
                                                type="button"
                                                onClick={() => setExpertFilterActive(true)}
                                                className="ml-auto rounded-lg bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                                            >
                                                Réactiver
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-5 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                                        {filteredExperts.length > 0 ? (
                                            filteredExperts.map((expert) => (
                                                <button
                                                    key={expert.id}
                                                    type="button"
                                                    onClick={() => chooseExpert(expert)}
                                                    className={`w-full rounded-2xl border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 ${
                                                        selectedExpert?.id === expert.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-slate-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h4 className="font-black text-slate-900">
                                                                {expertFullName(expert)}
                                                            </h4>

                                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                                {expert.email || 'Email non renseigné'}
                                                            </p>

                                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                {[expert.specialite, expert.ville, expert.etablissement]
                                                                    .filter(Boolean)
                                                                    .join(' • ') || '—'}
                                                            </p>
                                                        </div>

                                                        <span className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white">
                                                            Choisir
                                                        </span>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                                <p className="font-black text-slate-900">
                                                    Aucun expert trouvé
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Aucun résultat ne correspond à votre recherche.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <form onSubmit={submitExpert} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <h4 className="text-lg font-black text-slate-900">
                                        Expert sélectionné
                                    </h4>

                                    {selectedExpert ? (
                                        <div className="mt-4">
                                            <div className="rounded-2xl bg-white p-4">
                                                <p className="font-black text-slate-900">
                                                    {expertFullName(selectedExpert)}
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-500">
                                                    {selectedExpert.email || 'Email non renseigné'}
                                                </p>
                                            </div>

                                            <div className="mt-4">
                                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                                    Rôle dans le comité
                                                </label>

                                                <select
                                                    value={expertForm.data.role_expert}
                                                    onChange={(e) => expertForm.setData('role_expert', e.target.value)}
                                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                                                >
                                                    <option value="expert">Expert</option>
                                                    <option value="chef_comite">Chef de comité</option>
                                                </select>

                                                {expertForm.errors.role_expert && (
                                                    <p className="mt-2 text-sm font-semibold text-red-600">
                                                        {expertForm.errors.role_expert}
                                                    </p>
                                                )}
                                            </div>

                                            {expertForm.errors.expert_id && (
                                                <p className="mt-3 text-sm font-semibold text-red-600">
                                                    {expertForm.errors.expert_id}
                                                </p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={expertForm.processing}
                                                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
                                            >
                                                <UserCheck size={18} />
                                                {expertForm.processing ? 'Ajout...' : 'Ajouter en attente DEE'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                                            <Users className="mx-auto text-slate-300" size={32} />

                                            <p className="mt-3 text-sm font-semibold text-slate-500">
                                                Choisis un expert dans la liste.
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </div>

                            <div className="border-t border-slate-100 p-7">
                                <h4 className="text-xl font-black text-slate-900">
                                    Experts affectés
                                </h4>

                                <div className="mt-5 space-y-4">
                                    {dossierExperts.length > 0 ? (
                                        dossierExperts.map((item) => (
                                            <ExpertAssignedCard
                                                key={item.id}
                                                item={item}
                                                onAccept={() => acceptExpert(item.id)}
                                                onRefuse={() => refuseExpert(item.id)}
                                                onDelete={() => deleteExpert(item)}
                                                onRenvoyerEmail={() => renvoyerEmailExpert(item.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                            <p className="font-black text-slate-900">
                                                Aucun expert affecté
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Ajoute un expert pour commencer l'affectation.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <FileText size={24} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        Documents déposés
                                    </h3>

                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Le statut du dossier évolue automatiquement selon les documents ajoutés.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 space-y-3">
                                {documents.length > 0 ? (
                                    documents.map((document) => (
                                        <div
                                            key={document.id}
                                            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-black text-slate-900">
                                                    {document.original_name || document.nom || document.name || 'Document'}
                                                </p>
                                                <p className="mt-0.5 text-sm font-medium text-slate-500">
                                                    {document.type || document.document_type || 'Type non défini'}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="text-xs font-semibold text-slate-500">
                                                        Déposé par : <span className="font-black text-slate-700">{document.uploader_nom || '—'}</span>
                                                    </span>
                                                    <CategorieBadge categorie={document.uploader_categorie} />
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 gap-2">
                                                {(() => {
                                                    const ext = (document.original_name ?? document.nom ?? '').split('.').pop().toLowerCase();
                                                    const viewable = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                                                    return viewable ? (
                                                        <a
                                                            href={document.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                                                        >
                                                            <Eye size={15} />
                                                            Ouvrir
                                                        </a>
                                                    ) : null;
                                                })()}
                                                <a
                                                    href={document.download_url}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
                                                >
                                                    <Download size={15} />
                                                    Télécharger
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteDocument(document)}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
                                                >
                                                    <Trash2 size={15} />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                        <FileText className="mx-auto text-slate-300" size={34} />
                                        <p className="mt-3 font-black text-slate-900">
                                            Aucun document n'a encore été déposé.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rapports experts déposés */}
                        {rapportsExperts.length > 0 && (
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                        <UserCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Rapports experts</h3>
                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                            Rapports déposés par les experts — validation requise.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-7 space-y-4">
                                    {rapportsExperts.map((rapport) => (
                                        <RapportExpertCard
                                            key={rapport.id}
                                            rapport={rapport}
                                            onValider={() => validerRapport(rapport)}
                                            onRejeter={() => openRejectModal(rapport)}
                                            onEnvoyer={() => setEnvoyerModal({ open: true, rapport })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-7">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Building2 size={24} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        Établissement
                                    </h3>

                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Informations générales de l'établissement concerné.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 space-y-4">
                                {/* ── Identité ── */}
                                <InfoBox label="Nom" value={etablissement.nom || dossier.etablissement_nom} />
                                {etablissement.acronyme && <InfoBox label="Acronyme" value={etablissement.acronyme} />}
                                <InfoBox label="Ville" value={etablissement.ville || dossier.ville} />
                                <InfoBox label="Université" value={etablissement.universite || dossier.universite} />
                                {etablissement.domaine_connaissances && <InfoBox label="Domaine" value={etablissement.domaine_connaissances} />}
                                <InfoBox label="Email" value={etablissement.email || dossier.email} />

                                {/* ── Profil complété par l'établissement ── */}
                                {etablissement.profil_complete && (
                                    <>
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="h-px flex-1 bg-slate-200" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                                                Profil complété
                                            </span>
                                            <div className="h-px flex-1 bg-slate-200" />
                                        </div>
                                        {etablissement.adresse && <InfoBox label="Adresse" value={etablissement.adresse} />}
                                        {etablissement.telephone && <InfoBox label="Téléphone" value={etablissement.telephone} />}
                                        {etablissement.site_web && (
                                            <div className="rounded-2xl bg-slate-50 p-5">
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Site web</p>
                                                <a href={etablissement.site_web} target="_blank" rel="noreferrer"
                                                    className="mt-3 block break-words text-sm font-bold leading-7 text-blue-600 hover:underline">
                                                    {etablissement.site_web}
                                                </a>
                                            </div>
                                        )}
                                        {(etablissement.responsable_nom || etablissement.responsable_fonction) && (
                                            <div className="rounded-2xl bg-emerald-50 p-5 space-y-1">
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Responsable</p>
                                                {etablissement.responsable_nom && (
                                                    <p className="mt-2 text-sm font-bold text-slate-800">{etablissement.responsable_nom}</p>
                                                )}
                                                {etablissement.responsable_fonction && (
                                                    <p className="text-xs text-slate-500">{etablissement.responsable_fonction}</p>
                                                )}
                                                {etablissement.responsable_email && (
                                                    <p className="text-xs text-blue-600">{etablissement.responsable_email}</p>
                                                )}
                                                {etablissement.responsable_telephone && (
                                                    <p className="text-xs text-slate-500">{etablissement.responsable_telephone}</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <InfoBox label="Créé par" value={dossier.created_by || dossier.created_by_name} />
                                <InfoBox label="Mise à jour" value={dossier.updated_at} />
                            </div>
                        </div>

                        {/* ── Chef de comité ── */}
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                                        <path d="M16 3.5l1.5 1.5L20 2" strokeWidth="2"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Chef de comité</h3>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Expert désigné comme chef du comité d'évaluation.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7">
                                {chefComite ? (
                                    <div className="space-y-4">
                                        <div className="rounded-2xl bg-purple-50 p-5">
                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Nom complet</p>
                                            <p className="mt-2 text-sm font-bold text-slate-800">
                                                {chefComite.expert?.name || '—'}
                                            </p>
                                        </div>
                                        {chefComite.expert?.email && (
                                            <div className="rounded-2xl bg-slate-50 p-5">
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Email</p>
                                                <p className="mt-2 text-sm font-bold text-slate-800 break-words">
                                                    {chefComite.expert.email}
                                                </p>
                                            </div>
                                        )}
                                        {chefComite.expert?.specialite && (
                                            <div className="rounded-2xl bg-slate-50 p-5">
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Spécialité</p>
                                                <p className="mt-2 text-sm font-bold text-slate-800">
                                                    {chefComite.expert.specialite}
                                                </p>
                                            </div>
                                        )}
                                        {chefComite.expert?.etablissement && (
                                            <div className="rounded-2xl bg-slate-50 p-5">
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Établissement</p>
                                                <p className="mt-2 text-sm font-bold text-slate-800">
                                                    {chefComite.expert.etablissement}
                                                </p>
                                            </div>
                                        )}
                                        {chefComite.expert?.ville && (
                                            <div className="rounded-2xl bg-slate-50 p-5">
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Ville</p>
                                                <p className="mt-2 text-sm font-bold text-slate-800">
                                                    {chefComite.expert.ville}
                                                </p>
                                            </div>
                                        )}
                                        <div className="rounded-2xl bg-slate-50 p-5">
                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Statut participation</p>
                                            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black ${
                                                chefComite.status === 'confirme' || chefComite.status === 'confirmed'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : chefComite.status === 'en_attente' || chefComite.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {formatExpertStatus(chefComite.status)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                                        <svg className="mx-auto mb-3 text-slate-300" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                                        <p className="text-sm font-semibold text-slate-400">Aucun chef de comité désigné</p>
                                        <p className="mt-1 text-xs text-slate-400">Modifiez le rôle d'un expert pour le désigner.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <Clock3 size={24} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        Documents attendus
                                    </h3>

                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Suivi rapide des pièces du dossier.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 space-y-3">
                                <ExpectedDocument label="Formulaire ajouté" item={expectedDocuments.formulaire} />
                                <ExpectedDocument label="Rapport d'autoévaluation" item={expectedDocuments.rapport_autoevaluation} />
                                <ExpectedDocument label="Annexes" item={expectedDocuments.annexes} />
                                <ExpectedDocument label="Rapport expert" item={expectedDocuments.rapport_expert} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {deleteModal.open && deleteModal.item && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-[2rem] bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-100 p-6">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
                                    Suppression sécurisée
                                </p>

                                <h3 className="mt-2 text-2xl font-black text-slate-950">
                                    {deleteModal.type === 'document'
                                        ? 'Confirmer la suppression du document'
                                        : deleteModal.type === 'photo'
                                          ? 'Confirmer la suppression de la photo'
                                          : "Confirmer la suppression de l'expert"}
                                </h3>

                                <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                                    Pour supprimer{' '}
                                    {deleteModal.type === 'document'
                                        ? 'le document'
                                        : deleteModal.type === 'photo'
                                          ? 'la photo'
                                          : "l'expert"}{' '}
                                    <strong>
                                        {deleteModal.type === 'document'
                                            ? deleteModal.item.nom ||
                                              deleteModal.item.name ||
                                              deleteModal.item.filename ||
                                              'Document'
                                            : deleteModal.type === 'photo'
                                              ? deleteModal.item.original_name || 'Photo'
                                              : expertFullName(deleteModal.item.expert || deleteModal.item)}
                                    </strong>
                                    , saisissez le mot de passe unique administrateur DEE.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeSecureDeleteModal}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submitSecureDelete} className="p-6">
                            <label className="mb-2 block text-sm font-black text-slate-700">
                                Mot de passe DEE
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                                />

                                <input
                                    type="password"
                                    value={secureDeleteForm.data.delete_password}
                                    onChange={(e) => {
                                        secureDeleteForm.setData('delete_password', e.target.value);
                                        secureDeleteForm.clearErrors('delete_password');
                                    }}
                                    placeholder="Mot de passe de confirmation"
                                    className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:bg-white focus:ring-4 ${
                                        secureDeleteForm.errors.delete_password
                                            ? 'border-red-500 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                                    }`}
                                />
                            </div>

                            {secureDeleteForm.errors.delete_password && (
                                <p className="mt-2 text-sm font-bold text-red-600">
                                    {secureDeleteForm.errors.delete_password}
                                </p>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeSecureDeleteModal}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={secureDeleteForm.processing}
                                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Trash2 size={18} />
                                    {secureDeleteForm.processing
                                        ? 'Suppression...'
                                        : 'Supprimer définitivement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function HeroInfo({ label, value }) {
    return (
        <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
                {label}
            </p>

            <p className="mt-2 text-sm font-black text-white">
                {value || '—'}
            </p>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, description, accent, smallValue = false }) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`h-1.5 w-16 rounded-full ${accent}`} />

            <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-blue-600">
                <Icon size={25} />
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                {label}
            </p>

            <p className={`mt-2 font-black text-slate-900 ${smallValue ? 'text-xl' : 'text-4xl'}`}>
                {value ?? 0}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
                {description}
            </p>
        </div>
    );
}

function InfoBox({ label, value }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>

            <p className="mt-3 break-words text-sm font-bold leading-7 text-slate-800">
                {value || '—'}
            </p>
        </div>
    );
}

function ExpertAssignedCard({ item, onAccept, onRefuse, onDelete, onRenvoyerEmail }) {
    const expert = item.expert || {};
    const isPending = item.status === 'en_attente_confirmation_dee';
    const isSent = item.status === 'acces_envoye' || item.status === 'en_attente_confirmation_expert';
    const isConfirmed = item.status === 'confirme_par_expert';
    const isRefused = item.status === 'refuse_par_expert';

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                    <h4 className="font-black text-slate-900">
                        {expertFullName(expert)}
                    </h4>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                        {expert.email || 'Email non renseigné'}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                        {[expert.specialite, expert.ville, expert.etablissement]
                            .filter(Boolean)
                            .join(' • ') || '—'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                            {formatExpertRole(item.role_expert)}
                        </span>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                                isPending
                                    ? 'bg-amber-100 text-amber-700'
                                    : isConfirmed
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : isSent
                                        ? 'bg-cyan-100 text-cyan-700'
                                        : isRefused
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                            {formatExpertStatus(item.status)}
                        </span>
                    </div>

                    {isRefused && item.motif_refus && (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-xs font-black text-red-600 uppercase tracking-wide mb-1">Motif de refus</p>
                            <p className="text-sm text-red-800">{item.motif_refus}</p>
                            {item.expert_refused_at && (
                                <p className="mt-1 text-xs text-red-400">Le {item.expert_refused_at}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {isPending && (
                        <>
                            <button
                                type="button"
                                onClick={onRefuse}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
                            >
                                <XCircle size={16} />
                                Refuser
                            </button>

                            <button
                                type="button"
                                onClick={onAccept}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
                            >
                                <Send size={16} />
                                Accepter
                            </button>
                        </>
                    )}

                    {isSent && (
                        <button
                            type="button"
                            onClick={onRenvoyerEmail}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                        >
                            <Send size={16} />
                            Renvoyer email
                        </button>
                    )}

                    {!isPending && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
                        >
                            <Trash2 size={16} />
                            Supprimer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ExpectedDocument({ label, item = {} }) {
    const status = item?.statut || 'waiting';
    const styles = {
        valid: {
            label: 'Validé',
            badge: 'bg-emerald-100 text-emerald-700',
        },
        progress: {
            label: 'En cours',
            badge: 'bg-blue-100 text-blue-700',
        },
        waiting: {
            label: 'En attente',
            badge: 'bg-amber-100 text-amber-700',
        },
    };
    const meta = styles[status] || styles.waiting;

    return (
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
                <p className="font-black text-slate-900">
                    {label}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                    {item?.detail || 'En attente'}
                </p>
            </div>

            <span
                className={`rounded-full px-3 py-1 text-xs font-black ${meta.badge}`}
            >
                {meta.label}
            </span>
        </div>
    );
}

function WorkflowProgressBar({ expectedDocuments, hasDateVisite, evaluationsAnnexes }) {
    const steps = [
        { label: 'Formulaire',     done: expectedDocuments?.formulaire?.statut === 'valid' },
        { label: 'Autoévaluation', done: expectedDocuments?.rapport_autoevaluation?.statut === 'valid' },
        { label: 'Annexes',        done: expectedDocuments?.annexes?.statut === 'valid' },
        { label: 'Date de visite', done: !!hasDateVisite },
        { label: 'Éval. Annexes',  done: (evaluationsAnnexes?.length ?? 0) > 0 && evaluationsAnnexes.some(e => e.soumis_le) },
        { label: 'Rapport expert', done: expectedDocuments?.rapport_expert?.statut === 'valid' },
    ];

    const doneCount = steps.filter(s => s.done).length;
    const pct = Math.round((doneCount / steps.length) * 100);

    return (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* top progress bar */}
            <div className="h-1.5 w-full bg-slate-100">
                <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>

            <div className="px-6 py-3">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Progression du dossier</p>
                    <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-black text-emerald-600">
                        {doneCount}/{steps.length} étapes
                    </span>
                </div>

                <div className="flex items-center">
                    {steps.map((step, i) => (
                        <div key={step.label} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : 'flex-shrink-0'}`}>
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
                                    step.done
                                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}>
                                    {step.done
                                        ? <CheckCircle2 size={20} strokeWidth={2.5} />
                                        : <span className="text-xs font-black">{i + 1}</span>
                                    }
                                </div>
                                <span className={`text-[11px] font-bold text-center leading-tight w-[72px] ${
                                    step.done ? 'text-emerald-600' : 'text-slate-400'
                                }`}>{step.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="flex-1 mx-1 mb-5">
                                    <div className="h-0.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${
                                            step.done ? 'bg-emerald-400 w-full' : 'w-0'
                                        }`} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


function CategorieBadge({ categorie }) {
    const styles = {
        Expert: 'bg-violet-100 text-violet-700',
        'Établissement': 'bg-blue-100 text-blue-700',
        DEE: 'bg-emerald-100 text-emerald-700',
    };
    if (!categorie || categorie === '—') return null;
    const cls = styles[categorie] || 'bg-slate-100 text-slate-600';
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${cls}`}>
            {categorie}
        </span>
    );
}

function RapportExpertCard({ rapport, onValider, onRejeter, onEnvoyer }) {
    const statutStyles = {
        depose: { bg: 'bg-amber-100 text-amber-700', label: 'En attente' },
        valide: { bg: 'bg-emerald-100 text-emerald-700', label: 'Validé' },
        rejete: { bg: 'bg-red-100 text-red-700', label: 'Refusé' },
    };
    const s = statutStyles[rapport.statut] || statutStyles.depose;

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-slate-900">
                            {rapport.original_name || rapport.titre || 'Rapport expert'}
                        </p>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-black ${s.bg}`}>
                            {s.label}
                        </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                        Expert : <span className="font-black text-slate-700">{rapport.expert_nom}</span>
                        {rapport.expert_email && rapport.expert_email !== '—' && (
                            <span className="ml-2 text-slate-400">— {rapport.expert_email}</span>
                        )}
                    </p>
                    {rapport.commentaire && (
                        <p className="mt-2 text-sm text-slate-600 italic">« {rapport.commentaire} »</p>
                    )}
                    {rapport.statut === 'rejete' && rapport.motif_rejet && (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-xs font-black uppercase tracking-wider text-red-500">Motif du refus</p>
                            <p className="mt-1 text-sm font-medium text-red-700">{rapport.motif_rejet}</p>
                        </div>
                    )}
                    {rapport.statut === 'valide' && rapport.valide_le && (
                        <p className="mt-2 text-xs font-semibold text-emerald-600">
                            Validé le {rapport.valide_le}{rapport.valide_par ? ` par ${rapport.valide_par}` : ''}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">Déposé le {rapport.created_at}</p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    {rapport.url && (
                        <a
                            href={rapport.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                        >
                            <Eye size={15} />
                            Ouvrir
                        </a>
                    )}
                    {rapport.statut === 'valide' && (
                        <button
                            type="button"
                            onClick={onEnvoyer}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                        >
                            <Send size={15} />
                            Envoyer à l'établissement
                        </button>
                    )}
                    {rapport.statut === 'depose' && (
                        <>
                            <button
                                type="button"
                                onClick={onValider}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
                            >
                                <CheckCircle2 size={15} />
                                Accepter
                            </button>
                            <button
                                type="button"
                                onClick={onRejeter}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
                            >
                                <XCircle size={15} />
                                Refuser
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function expertFullName(expert) {
    const fullName = [expert.prenom, expert.nom].filter(Boolean).join(' ').trim();

    return fullName || expert.name || expert.nom || 'Expert';
}

function formatExpertRole(role) {
    const labels = {
        expert: 'Expert',
        chef_comite: 'Chef de comité',
    };

    return labels[role] || 'Expert';
}

function formatExpertStatus(status) {
    const labels = {
        en_attente_confirmation_dee: 'En attente confirmation DEE',
        en_attente_confirmation_expert: 'Accès envoyé',
        acces_envoye: 'Accès envoyé',
        confirme_par_expert: 'Confirmé',
        refuse_par_expert: 'Refusé par expert',
        pending_confirmation: 'En attente confirmation DEE',
        confirme_par_dee: 'Confirmé par DEE',
    };

    return labels[status] || status || 'En attente confirmation DEE';
}

function formatDossierStatus(status) {
    const labels = {
        etablissement_selectionne: 'Établissement sélectionné',
        compte_etablissement_cree: 'Compte établissement créé',
        en_attente_formulaire: 'En attente formulaire',
        formulaire_rempli: 'Formulaire rempli',
        rapport_autoevaluation_ajoute: "Rapport d'autoévaluation ajouté",
        annexe_ajoutee: 'Annexe ajoutée',
        rapport_expert_ajoute: 'Rapport expert ajouté',
        date_visite_planifiee: 'Date de visite planifiée',
        'Établissement sélectionné': 'Établissement sélectionné',
        'Compte établissement créé': 'Compte établissement créé',
        'Formulaire rempli': 'Formulaire rempli',
        "Rapport d'autoévaluation ajouté": "Rapport d'autoévaluation ajouté",
        'Annexe ajoutée': 'Annexe ajoutée',
        'Rapport expert ajouté': 'Rapport expert ajouté',
        'Date de visite planifiée': 'Date de visite planifiée',
    };

    return labels[status] || status || 'Établissement sélectionné';
}

function formatShortStatus(status) {
    const value = formatDossierStatus(status);

    if (value.length > 18) {
        return value.slice(0, 18) + '...';
    }

    return value;
}

function isValidDateVisite(value) {
    if (value === null || value === undefined) {
        return false;
    }

    const text = String(value).trim();

    if (!text) {
        return false;
    }

    const invalidValues = [
        '—',
        '-',
        'null',
        'undefined',
        'non définie',
        'non definie',
        'non planifiée',
        'non planifiee',
    ];

    return !invalidValues.includes(text.toLowerCase());
}

Show.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default Show;
