import { Head, router, useForm, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import {
    Briefcase,
    GraduationCap,
    Mail,
    MapPin,
    Pencil,
    Search,
    Trash2,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function ExpertsIndex({ experts = [] }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const {
        data,
        setData,
        patch,
        reset,
        processing,
        errors,
        clearErrors,
    } = useForm({
        nom: '',
        prenom: '',
        email: '',
        ville: '',
        pays: '',
        telephone: '',
        specialite: '',
        fonction_actuelle: '',
        universite_ou_departement_ministeriel: '',
        type_etablissement: '',
        etablissement: '',
        grade: '',
        diplomes_obtenus: '',
    });

    const filteredExperts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return experts;

        return experts.filter((item) =>
            [
                item.nom,
                item.prenom,
                item.full_name,
                item.email,
                item.ville,
                item.pays,
                item.specialite,
                item.fonction_actuelle,
                item.universite_ou_departement_ministeriel,
                item.etablissement,
                item.grade,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(query)
        );
    }, [search, experts]);

    const totalAffectations = useMemo(
        () => experts.reduce((sum, item) => sum + (item.dossiers_count || 0), 0),
        [experts]
    );

    const totalAvecEmail = useMemo(
        () => experts.filter((item) => item.email && item.email.trim() !== '').length,
        [experts]
    );

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            nom: item.nom || '',
            prenom: item.prenom || '',
            email: item.email || '',
            ville: item.ville || '',
            pays: item.pays || '',
            telephone: item.telephone || '',
            specialite: item.specialite || '',
            fonction_actuelle: item.fonction_actuelle || '',
            universite_ou_departement_ministeriel:
                item.universite_ou_departement_ministeriel || '',
            type_etablissement: item.type_etablissement || '',
            etablissement: item.etablissement || '',
            grade: item.grade || '',
            diplomes_obtenus: item.diplomes_obtenus || '',
        });
        clearErrors();
    };

    const closeEditModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();

        if (!editingItem) return;

        patch(`/experts/${editingItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const submitDelete = () => {
        if (!deleteItem) return;

        router.delete(`/experts/${deleteItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteItem(null);
            },
        });
    };

    return (
        <>
            <Head title="Experts" />

            <div className="mx-auto max-w-[96rem] px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-[2rem] bg-gradient-to-r from-[#243cbe] via-[#2f61e7] to-[#0ea5c6] px-8 py-10 text-white shadow-xl shadow-blue-900/10">
                    <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-100">
                        Évaluateurs mobilisés
                    </p>

                    <h1 className="mt-3 text-4xl font-black tracking-tight">
                        Gestion des experts
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50/90">
                        Consulte, recherche, modifie et supprime les experts directement depuis la base
                        de données avec une interface plus claire, plus moderne et plus professionnelle.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <StatCard
                            icon={Users}
                            label="Experts"
                            value={experts.length}
                        />
                        <StatCard
                            icon={Mail}
                            label="Experts avec email"
                            value={totalAvecEmail}
                        />
                        <StatCard
                            icon={Briefcase}
                            label="Affectations"
                            value={totalAffectations}
                        />
                    </div>
                </div>

                <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                                Liste principale
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-slate-900">
                                Tous les experts
                            </h2>
                        </div>

                        <div className="relative w-full lg:max-w-xl">
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher par nom, email, ville, spécialité, fonction..."
                                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                            />
                        </div>
                    </div>

                    {flash.success && (
                        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {flash.error && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {flash.error}
                        </div>
                    )}

                    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1450px] w-full table-auto">
                                <thead className="bg-slate-50">
                                    <tr className="text-left text-sm font-bold text-slate-500">
                                        <th className="sticky left-0 z-20 min-w-[290px] bg-slate-50 px-6 py-4 shadow-[8px_0_12px_-10px_rgba(15,23,42,0.15)]">
                                            Expert
                                        </th>
                                        <th className="min-w-[220px] px-6 py-4">Email</th>
                                        <th className="min-w-[150px] px-6 py-4">Ville</th>
                                        <th className="min-w-[280px] px-6 py-4">Spécialité</th>
                                        <th className="min-w-[280px] px-6 py-4">Fonction</th>
                                        <th className="min-w-[240px] px-6 py-4">Université / Département</th>
                                        <th className="min-w-[120px] px-6 py-4 text-center">Dossiers</th>
                                        <th className="sticky right-0 z-20 min-w-[250px] bg-slate-50 px-6 py-4 text-right shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.15)]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredExperts.length > 0 ? (
                                        filteredExperts.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="align-top transition hover:bg-slate-50/70"
                                            >
                                                <td className="sticky left-0 z-10 bg-white px-6 py-5 shadow-[8px_0_12px_-10px_rgba(15,23,42,0.10)]">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                            <UserRound size={18} />
                                                        </div>

                                                        <div>
                                                            <div className="font-bold leading-7 text-slate-900">
                                                                {item.full_name || '—'}
                                                            </div>
                                                            <div className="mt-1 text-sm text-slate-500">
                                                                {item.grade || 'Grade non défini'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                                    <span className="inline-flex items-center gap-2">
                                                        <Mail size={15} className="shrink-0 text-blue-500" />
                                                        <span>{item.email || '—'}</span>
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                                    <span className="inline-flex items-center gap-2">
                                                        <MapPin size={15} className="shrink-0 text-blue-500" />
                                                        {item.ville || '—'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-medium leading-6 text-slate-700">
                                                    {item.specialite || '—'}
                                                </td>

                                                <td className="px-6 py-5 text-sm font-medium leading-6 text-slate-700">
                                                    {item.fonction_actuelle || '—'}
                                                </td>

                                                <td className="px-6 py-5 text-sm font-medium leading-6 text-slate-700">
                                                    {item.universite_ou_departement_ministeriel || '—'}
                                                </td>

                                                <td className="px-6 py-5 text-center text-sm font-bold text-slate-700">
                                                    {item.dossiers_count}
                                                </td>

                                                <td className="sticky right-0 z-10 bg-white px-6 py-5 shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.10)]">
                                                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600"
                                                        >
                                                            <Pencil size={16} />
                                                            Modifier
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteItem(item)}
                                                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                                                        >
                                                            <Trash2 size={16} />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="px-6 py-14 text-center text-sm font-semibold text-slate-500"
                                            >
                                                Aucun expert trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p className="mt-4 text-xs font-medium text-slate-400">
                        Astuce : la première colonne et la colonne actions restent visibles pendant le défilement horizontal.
                    </p>
                </div>

                {editingItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                                        Modification
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black text-slate-900">
                                        Modifier l’expert
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={submitEdit} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Nom"
                                        value={data.nom}
                                        onChange={(value) => setData('nom', value)}
                                        error={errors.nom}
                                    />

                                    <InputField
                                        label="Prénom"
                                        value={data.prenom}
                                        onChange={(value) => setData('prenom', value)}
                                        error={errors.prenom}
                                    />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Email"
                                        type="email"
                                        value={data.email}
                                        onChange={(value) => setData('email', value)}
                                        error={errors.email}
                                    />

                                    <InputField
                                        label="Téléphone"
                                        value={data.telephone}
                                        onChange={(value) => setData('telephone', value)}
                                        error={errors.telephone}
                                    />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Ville"
                                        value={data.ville}
                                        onChange={(value) => setData('ville', value)}
                                        error={errors.ville}
                                    />

                                    <InputField
                                        label="Pays"
                                        value={data.pays}
                                        onChange={(value) => setData('pays', value)}
                                        error={errors.pays}
                                    />
                                </div>

                                <InputField
                                    label="Spécialité"
                                    value={data.specialite}
                                    onChange={(value) => setData('specialite', value)}
                                    error={errors.specialite}
                                />

                                <InputField
                                    label="Fonction actuelle"
                                    value={data.fonction_actuelle}
                                    onChange={(value) => setData('fonction_actuelle', value)}
                                    error={errors.fonction_actuelle}
                                />

                                <InputField
                                    label="Université / Département ministériel"
                                    value={data.universite_ou_departement_ministeriel}
                                    onChange={(value) =>
                                        setData('universite_ou_departement_ministeriel', value)
                                    }
                                    error={errors.universite_ou_departement_ministeriel}
                                />

                                <div className="grid gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Type d’établissement"
                                        value={data.type_etablissement}
                                        onChange={(value) => setData('type_etablissement', value)}
                                        error={errors.type_etablissement}
                                    />

                                    <InputField
                                        label="Établissement"
                                        value={data.etablissement}
                                        onChange={(value) => setData('etablissement', value)}
                                        error={errors.etablissement}
                                    />
                                </div>

                                <InputField
                                    label="Grade"
                                    value={data.grade}
                                    onChange={(value) => setData('grade', value)}
                                    error={errors.grade}
                                />

                                <TextAreaField
                                    label="Diplômes obtenus"
                                    value={data.diplomes_obtenus}
                                    onChange={(value) => setData('diplomes_obtenus', value)}
                                    error={errors.diplomes_obtenus}
                                />

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {deleteItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-[2rem] bg-white p-7 shadow-2xl">
                            <div className="mb-5 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-600">
                                        Suppression
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black text-slate-900">
                                        Confirmer la suppression
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setDeleteItem(null)}
                                    className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-sm leading-7 text-slate-600">
                                Tu vas supprimer définitivement l’expert :
                                <span className="font-bold text-slate-900">
                                    {' '}
                                    {deleteItem.full_name}
                                </span>
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-500">
                                La suppression sera refusée si l’expert est encore affecté à un ou plusieurs dossiers.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteItem(null)}
                                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="button"
                                    onClick={submitDelete}
                                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                                >
                                    Supprimer définitivement
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function StatCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Icon size={24} />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-blue-100">
                {label}
            </p>
            <p className="mt-2 text-4xl font-black">{value}</p>
        </div>
    );
}

function InputField({ label, value, onChange, error, type = 'text' }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            />
            {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        </div>
    );
}

function TextAreaField({ label, value, onChange, error }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            />
            {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        </div>
    );
}

ExpertsIndex.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default ExpertsIndex;