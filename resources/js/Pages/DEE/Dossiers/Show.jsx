import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import MessageriePanel from '@/Components/MessageriePanel';
import ConfirmModal from '@/Components/ConfirmModal';
import {
    ArrowLeft,
    BadgeCheck,
    Building2,
    CalendarDays,
    Camera,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Eye,
    FileText,
    FolderKanban,
    Image,
    LockKeyhole,
    Mail,
    MapPin,
    Save,
    Search,
    Send,
    ShieldCheck,
    Trash2,
    Upload,
    UserCheck,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function Show({ dossier, experts = [], allExperts = [], dossierExperts = [], documents = [], photos = [] }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [activeTab, setActiveTab] = useState('pilotage');
    const [expertSearch, setExpertSearch] = useState('');
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [expertFilterActive, setExpertFilterActive] = useState(true);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [dialog, setDialog] = useState(null);

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
            <MessageriePanel dossierId={dossier.id} currentRole="admin_dee" />

            <div className="mx-auto max-w-[98rem] px-4 py-10 sm:px-6 lg:px-8">
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
                            </div>
                        </div>
                    </div>
                </div>

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

                                    {etablissement.domaine_connaissances && (
                                        expertFilterActive ? (
                                            <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                                                <span className="shrink-0">Filtre actif :</span>
                                                <span className="font-black">{etablissement.domaine_connaissances}</span>
                                                <span className="text-violet-400">— même spécialité, établissement différent</span>
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
                                                <span className="shrink-0">Filtre désactivé</span>
                                                <span className="text-slate-400">— tous les experts</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpertFilterActive(true)}
                                                    className="ml-auto rounded-lg bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                                                >
                                                    Réactiver
                                                </button>
                                            </div>
                                        )
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
                                            <div>
                                                <p className="font-black text-slate-900">
                                                    {document.nom || document.name || document.filename || 'Document'}
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-500">
                                                    {document.type || document.document_type || 'Type non défini'}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                {document.url && (
                                                    <a
                                                        href={document.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                                                    >
                                                        <Eye size={15} />
                                                        Ouvrir
                                                    </a>
                                                )}

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
                                <InfoBox label="Nom" value={etablissement.nom || dossier.etablissement_nom} />
                                <InfoBox label="Ville" value={etablissement.ville || dossier.ville} />
                                <InfoBox label="Université" value={etablissement.universite || dossier.universite} />
                                <InfoBox label="Email" value={etablissement.email || dossier.email} />
                                <InfoBox label="Créé par" value={dossier.created_by || dossier.created_by_name} />
                                <InfoBox label="Mise à jour" value={dossier.updated_at} />
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
                                <ExpectedDocument label="Formulaire ajouté" documents={documents} keywords={['formulaire']} />
                                <ExpectedDocument label="Rapport d'autoévaluation" documents={documents} keywords={['auto', 'autoevaluation', 'autoévaluation']} />
                                <ExpectedDocument label="Annexes" documents={documents} keywords={['annexe']} />
                                <ExpectedDocument label="Rapport expert" documents={documents} keywords={['rapport expert']} />
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-gradient-to-br from-[#13255c] to-[#223983] p-7 text-white shadow-xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <ShieldCheck size={24} />
                            </div>

                            <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-blue-100">
                                Workflow
                            </p>

                            <h3 className="mt-3 text-2xl font-black">
                                Statut automatique
                            </h3>

                            <p className="mt-4 text-sm leading-7 text-blue-50/80">
                                Le statut change selon les documents déposés par l'établissement ou les experts,
                                et selon la date de visite planifiée.
                            </p>

                            <div className="mt-6 space-y-3">
                                <WorkflowItem text="Formulaire rempli" />
                                <WorkflowItem text="Rapport d'autoévaluation ajouté" />
                                <WorkflowItem text="Annexes ajoutées" />
                                <WorkflowItem text="Rapport expert ajouté" />
                                <WorkflowItem text="Date de visite planifiée" />
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

function ExpertAssignedCard({ item, onAccept, onRefuse, onDelete }) {
    const expert = item.expert || {};
    const isPending = item.status === 'en_attente_confirmation_dee';
    const isSent = item.status === 'acces_envoye';
    const isConfirmed = item.status === 'confirme_par_expert';

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
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
                                        : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                            {formatExpertStatus(item.status)}
                        </span>
                    </div>
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

function ExpectedDocument({ label, documents, keywords }) {
    const exists = documents.some((document) => {
        const text = [
            document.type,
            document.document_type,
            document.categorie,
            document.nom,
            document.name,
            document.filename,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    });

    return (
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
                <p className="font-black text-slate-900">
                    {label}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                    {exists ? 'Document déposé' : 'En attente'}
                </p>
            </div>

            <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                    exists ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
            >
                {exists ? 'Validé' : 'En attente'}
            </span>
        </div>
    );
}

function WorkflowItem({ text }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <BadgeCheck size={18} className="text-blue-200" />

            <span className="text-sm font-semibold text-blue-50">
                {text}
            </span>
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