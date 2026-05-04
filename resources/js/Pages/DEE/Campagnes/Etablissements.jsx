import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Eye,
    Mail,
    MapPin,
    Plus,
    Search,
    Send,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function CampagneEtablissements({
    campagne,
    etablissements = [],
    selectedEtablissements = [],
}) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [emailModalItem, setEmailModalItem] = useState(null);
    const [emailValue, setEmailValue] = useState('');
    const [refuseModalItem, setRefuseModalItem] = useState(null);
    const [processing, setProcessing] = useState(false);

    const selected = useMemo(() => {
        return (selectedEtablissements || [])
            .filter((item) => item?.etablissement_id || item?.etablissement?.id)
            .map((item) => normalizeSelectedItem(item));
    }, [selectedEtablissements]);

    const selectedIds = useMemo(() => {
        return selected.map((item) => Number(item.etablissement_id));
    }, [selected]);

    const catalog = useMemo(() => {
        return (etablissements || [])
            .map((item) => normalizeEtablissement(item))
            .filter((item) => !selectedIds.includes(Number(item.id)));
    }, [etablissements, selectedIds]);

    const filteredCatalog = useMemo(() => {
        const term = search.trim().toLowerCase();

        return catalog.filter((item) => {
            if (!term) return true;

            return [
                item.nom,
                item.type,
                item.ville,
                item.universite,
                item.email,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term));
        });
    }, [catalog, search]);

    const attachEtablissement = (etablissement) => {
        setProcessing(true);

        router.post(
            `/dee/campagnes/${campagne.id}/etablissements/sync`,
            {
                items: [
                    {
                        etablissement_id: etablissement.id,
                        email: '',
                        statut: 'en_attente_confirmation_admin',
                    },
                ],
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddModalOpen(false);
                    setSearch('');

                    router.reload({
                        only: ['etablissements', 'selectedEtablissements'],
                        preserveScroll: true,
                    });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const openEmailModal = (item) => {
        setEmailModalItem(item);
        setEmailValue(item.email || item.etablissement?.email || '');
    };

    const confirmAndCreateAccount = () => {
        const email = String(emailValue || '').trim();

        if (!emailModalItem) return;

        if (!email) {
            alert("Veuillez saisir l'email de l'établissement.");
            return;
        }

        setProcessing(true);

        router.post(
            `/dee/campagnes/${campagne.id}/etablissements/${emailModalItem.etablissement_id}/confirm`,
            { email },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEmailModalItem(null);
                    setEmailValue('');

                    router.reload({
                        only: ['etablissements', 'selectedEtablissements'],
                        preserveScroll: true,
                    });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const confirmRefuse = () => {
        if (!refuseModalItem?.id) return;

        setProcessing(true);

        router.delete(
            `/dee/campagnes/${campagne.id}/etablissements/${refuseModalItem.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRefuseModalItem(null);

                    router.reload({
                        only: ['etablissements', 'selectedEtablissements'],
                        preserveScroll: true,
                    });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <>
            <Head title={`Établissements - ${campagne.reference}`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {flash.success && (
                    <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash.error && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                        {flash.error}
                    </div>
                )}

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={`/dee/campagnes/${campagne.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={17} />
                        Retour à la vague
                    </Link>

                    <button
                        type="button"
                        onClick={() => setAddModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={17} />
                        Ajouter un établissement
                    </button>
                </div>

                <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#3730c9] via-[#2563eb] to-[#0891b2] p-8 text-white shadow-xl shadow-blue-900/10">
                    <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-100">
                        Sélection des établissements
                    </p>

                    <h1 className="mt-3 text-4xl font-black tracking-tight">
                        {campagne.reference}
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50/90">
                        Ajoutez les établissements concernés par cette vague. Chaque établissement
                        reste en attente de confirmation par l’administrateur DEE avant l’envoi
                        du compte et la création du dossier.
                    </p>

                    <div className="mt-7 grid gap-4 sm:grid-cols-3">
                        <HeroMini label="Établissements rattachés" value={selected.length} />
                        <HeroMini
                            label="En attente DEE"
                            value={selected.filter((item) => isPending(item)).length}
                        />
                        <HeroMini
                            label="Comptes créés"
                            value={selected.filter((item) => isConfirmed(item)).length}
                        />
                    </div>
                </section>

                <section className="mt-7 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-7 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                                Établissements de la vague
                            </p>

                            <h2 className="mt-2 text-2xl font-black text-slate-900">
                                Liste des établissements rattachés
                            </h2>

                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Acceptez ou refusez les établissements ajoutés à cette vague.
                            </p>
                        </div>

                        <span className="inline-flex h-12 min-w-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-black text-white">
                            {selected.length}
                        </span>
                    </div>

                    {selected.length > 0 ? (
                        <div className="grid gap-4 p-7 lg:grid-cols-2">
                            {selected.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">
                                                {item.etablissement?.nom || '—'}
                                            </h3>

                                            <p className="mt-1 text-sm font-medium text-slate-600">
                                                {item.etablissement?.universite || 'Université non renseignée'}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <InfoPill>
                                                    <MapPin size={13} />
                                                    {item.etablissement?.ville || '—'}
                                                </InfoPill>

                                                <StatusPill value={item.statut} />
                                            </div>
                                        </div>

                                        {isConfirmed(item) ? (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 size={18} />
                                            </div>
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                                <Building2 size={18} />
                                            </div>
                                        )}
                                    </div>

                                    {item.email && (
                                        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700">
                                            <Mail size={16} className="text-blue-500" />
                                            {item.email}
                                        </div>
                                    )}

                                    {item.access_sent_at && (
                                        <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                                            Accès envoyé le {item.access_sent_at}
                                        </div>
                                    )}

                                    {item.dossier && (
                                        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                                                        Dossier créé
                                                    </p>

                                                    <p className="mt-2 text-sm font-black text-slate-900">
                                                        {item.dossier.reference}
                                                    </p>

                                                    <p className="mt-1 text-xs font-bold text-slate-500">
                                                        Statut : {item.dossier.statut || '—'}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/dee/dossiers/${item.dossier.id}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
                                                >
                                                    <Eye size={15} />
                                                    Voir le dossier
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {!isConfirmed(item) && (
                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() => setRefuseModalItem(item)}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
                                            >
                                                <Trash2 size={17} />
                                                Refuser
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openEmailModal(item)}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
                                            >
                                                <Send size={17} />
                                                Accepter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Building2 size={28} />}
                            title="Aucun établissement rattaché"
                            description="Cliquez sur Ajouter un établissement pour rattacher un établissement à cette vague."
                        />
                    )}
                </section>
            </div>

            {addModalOpen && (
                <Modal title="Ajouter un établissement" onClose={() => setAddModalOpen(false)}>
                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, ville, université..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    <div className="mt-5 max-h-[28rem] space-y-3 overflow-y-auto">
                        {filteredCatalog.length > 0 ? (
                            filteredCatalog.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-[1.4rem] border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                <Building2 size={21} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="text-base font-black text-slate-900">
                                                    {item.nom || '—'}
                                                </h3>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <InfoPill>{item.type || '—'}</InfoPill>

                                                    <InfoPill>
                                                        <MapPin size={13} />
                                                        {item.ville || '—'}
                                                    </InfoPill>
                                                </div>

                                                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                                                    {item.universite || 'Université non renseignée'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => attachEtablissement(item)}
                                            disabled={processing}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Plus size={15} />
                                            Ajouter
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                icon={<Search size={28} />}
                                title="Aucun établissement trouvé"
                                description="Aucun établissement disponible ne correspond à votre recherche."
                            />
                        )}
                    </div>
                </Modal>
            )}

            {emailModalItem && (
                <Modal title="Confirmer l’établissement" onClose={() => setEmailModalItem(null)}>
                    <p className="text-sm leading-7 text-slate-500">
                        Saisissez l’adresse email de l’établissement. Le compte sera créé,
                        l’email sera envoyé et le dossier sera généré automatiquement.
                    </p>

                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Email de l’établissement
                        </label>

                        <div className="relative">
                            <Mail
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="email"
                                value={emailValue}
                                onChange={(e) => setEmailValue(e.target.value)}
                                placeholder="email@exemple.com"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setEmailModalItem(null)}
                            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            Annuler
                        </button>

                        <button
                            type="button"
                            onClick={confirmAndCreateAccount}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send size={17} />
                            {processing ? 'Envoi en cours...' : 'Envoyer et créer le compte'}
                        </button>
                    </div>
                </Modal>
            )}

            {refuseModalItem && (
                <Modal title="Refuser l’établissement" onClose={() => setRefuseModalItem(null)}>
                    <p className="text-sm leading-7 text-slate-500">
                        Voulez-vous vraiment supprimer cet établissement de la vague ?
                        Le dossier lié sera aussi supprimé.
                    </p>

                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setRefuseModalItem(null)}
                            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            Annuler
                        </button>

                        <button
                            type="button"
                            onClick={confirmRefuse}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Trash2 size={17} />
                            {processing ? 'Suppression...' : 'Confirmer la suppression'}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}

function HeroMini({ label, value }) {
    return (
        <div className="rounded-2xl bg-white/12 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">
                {label}
            </p>

            <p className="mt-2 text-3xl font-black text-white">
                {value}
            </p>
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                    <h3 className="text-2xl font-black text-slate-900">
                        {title}
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-6rem)] overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function normalizeEtablissement(item) {
    return {
        id: item.id,
        nom:
            item.nom ??
            item.etablissement_2 ??
            item.etablissement ??
            item.name ??
            '—',
        type:
            item.type ??
            item.type_etablissement ??
            item.etablissement ??
            '—',
        ville: item.ville ?? item.city ?? '—',
        universite:
            item.universite ??
            item.universite_nom ??
            item.university ??
            '—',
        email: item.email ?? '',
    };
}

function normalizeSelectedItem(item) {
    const etablissement = item.etablissement || {};

    return {
        id: item.id ?? null,
        etablissement_id: item.etablissement_id ?? etablissement.id,
        email: item.email ?? etablissement.email ?? '',
        statut: item.statut ?? 'en_attente_confirmation_admin',
        access_sent_at: item.access_sent_at ?? null,
        dossier: item.dossier ?? null,
        etablissement: normalizeEtablissement(etablissement),
    };
}

function isPending(item) {
    const status = String(item.statut || '').toLowerCase();

    return (
        status.includes('attente') ||
        status.includes('confirmation') ||
        status.includes('pending') ||
        status.includes('selection')
    ) && !isConfirmed(item);
}

function isConfirmed(item) {
    const status = String(item.statut || '').toLowerCase();

    return Boolean(
        item.access_sent_at ||
            item.dossier ||
            status.includes('accès') ||
            status.includes('acces') ||
            status.includes('envoy') ||
            status.includes('compte') ||
            status.includes('cree') ||
            status.includes('créé')
    );
}

function InfoPill({ children }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            {children}
        </span>
    );
}

function StatusPill({ value }) {
    const label = formatStatus(value);
    const lower = String(value || '').toLowerCase();

    let classes = 'bg-amber-100 text-amber-700';

    if (
        lower.includes('accès') ||
        lower.includes('acces') ||
        lower.includes('envoy') ||
        lower.includes('compte') ||
        lower.includes('cree') ||
        lower.includes('créé')
    ) {
        classes = 'bg-emerald-100 text-emerald-700';
    }

    if (lower.includes('refus') || lower.includes('supprim')) {
        classes = 'bg-red-100 text-red-700';
    }

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classes}`}>
            {label}
        </span>
    );
}

function formatStatus(value) {
    const labels = {
        en_attente_confirmation_admin: 'En attente confirmation DEE',
        attente_confirmation_admin: 'En attente confirmation DEE',
        pending_confirmation: 'En attente confirmation DEE',
        selectionne: 'En attente confirmation DEE',
        acces_envoye: 'Accès envoyé',
        compte_etablissement_cree: 'Compte établissement créé',
        refuse: 'Refusé',
    };

    return labels[value] || value || 'En attente confirmation DEE';
}

function EmptyState({ icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                {icon}
            </div>

            <h3 className="mt-4 text-lg font-black text-slate-900">
                {title}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                {description}
            </p>
        </div>
    );
}

CampagneEtablissements.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default CampagneEtablissements;