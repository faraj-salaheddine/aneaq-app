import { Head, Link, useForm } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import {
    CalendarDays,
    Eye,
    FileText,
    Layers3,
    LockKeyhole,
    Plus,
    ShieldCheck,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function Index({ campagnes = [] }) {
    const [selectedCampagne, setSelectedCampagne] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const deleteForm = useForm({
        delete_password: '',
    });

    const stats = useMemo(() => {
        return {
            total: campagnes.length,
            etablissements: campagnes.reduce(
                (total, item) => total + Number(item.etablissements_count ?? 0),
                0
            ),
            dossiers: campagnes.reduce(
                (total, item) => total + Number(item.dossiers_count ?? 0),
                0
            ),
            actives: campagnes.filter((item) =>
                String(item.statut ?? item.status ?? '')
                    .toLowerCase()
                    .includes('active')
            ).length,
        };
    }, [campagnes]);

    const openDeleteModal = (campagne) => {
        setSelectedCampagne(campagne);
        deleteForm.setData('delete_password', '');
        deleteForm.clearErrors();
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedCampagne(null);
        setShowDeleteModal(false);
        deleteForm.reset();
        deleteForm.clearErrors();
    };

    const submitDelete = (e) => {
        e.preventDefault();

        deleteForm.clearErrors();

        if (!selectedCampagne) {
            deleteForm.setError('delete_password', 'Aucune vague sélectionnée.');
            return;
        }

        if (!deleteForm.data.delete_password.trim()) {
            deleteForm.setError('delete_password', 'Le mot de passe est obligatoire.');
            return;
        }

        deleteForm.delete(`/dee/campagnes/${selectedCampagne.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                closeDeleteModal();
            },
            onError: (errors) => {
                deleteForm.setError(
                    'delete_password',
                    errors.delete_password || 'Mot de passe incorrect.'
                );
            },
        });
    };

    return (
        <>
            <Head title="Gestion des vagues" />

            <div className="min-h-screen bg-[#f6f8fc] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="rounded-[2rem] bg-gradient-to-br from-[#2934c8] via-[#2563eb] to-[#0891b2] p-8 text-white shadow-xl shadow-blue-900/20">
                        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-100">
                                    Vagues d’évaluation
                                </p>

                                <h1 className="mt-4 text-4xl font-black">
                                    Gestion des vagues
                                </h1>

                                <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-blue-50">
                                    Créez, consultez et pilotez les vagues d’évaluation des établissements.
                                </p>
                            </div>

                            <Link
                                href="/dee/campagnes/create"
                                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-900 transition hover:bg-blue-50"
                            >
                                <Plus size={18} />
                                Créer une vague
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
                                <Layers3 size={26} />
                                <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                    Vagues
                                </p>
                                <p className="mt-2 text-4xl font-black">
                                    {stats.total}
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
                                <ShieldCheck size={26} />
                                <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                    Actives
                                </p>
                                <p className="mt-2 text-4xl font-black">
                                    {stats.actives}
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
                                <CalendarDays size={26} />
                                <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                    Établissements
                                </p>
                                <p className="mt-2 text-4xl font-black">
                                    {stats.etablissements}
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
                                <FileText size={26} />
                                <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                    Dossiers
                                </p>
                                <p className="mt-2 text-4xl font-black">
                                    {stats.dossiers}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                                    Liste principale
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-slate-950">
                                    Toutes les vagues
                                </h2>

                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Consultez les vagues et supprimez-les uniquement avec le mot de passe DEE.
                                </p>
                            </div>

                            <Link
                                href="/dee/campagnes/create"
                                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
                            >
                                <Plus size={18} />
                                Nouvelle vague
                            </Link>
                        </div>

                        {campagnes.length === 0 ? (
                            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                                <Layers3 size={42} className="text-blue-600" />
                                <h3 className="mt-4 text-xl font-black text-slate-950">
                                    Aucune vague trouvée
                                </h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                            <th className="px-6 py-4">Référence</th>
                                            <th className="px-6 py-4">Année</th>
                                            <th className="px-6 py-4">Vocation</th>
                                            <th className="px-6 py-4">Statut</th>
                                            <th className="px-6 py-4">Établissements</th>
                                            <th className="px-6 py-4">Dossiers</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {campagnes.map((campagne) => (
                                            <tr
                                                key={campagne.id}
                                                className="border-b border-slate-100 transition hover:bg-blue-50/40"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-slate-950">
                                                        {campagne.reference || '—'}
                                                    </div>
                                                    <div className="mt-1 text-xs font-semibold text-slate-400">
                                                        Créée le {campagne.created_at || '—'}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-bold text-slate-600">
                                                    {campagne.annee || '—'}
                                                </td>

                                                <td className="px-6 py-5 text-sm font-bold text-slate-600">
                                                    {campagne.vocation || '—'}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                                                        {campagne.statut || campagne.status || '—'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-black text-slate-700">
                                                    {campagne.etablissements_count ?? 0}
                                                </td>

                                                <td className="px-6 py-5 text-sm font-black text-slate-700">
                                                    {campagne.dossiers_count ?? 0}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/dee/campagnes/${campagne.id}`}
                                                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition hover:bg-blue-700"
                                                        >
                                                            <Eye size={16} />
                                                            Voir
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteModal(campagne)}
                                                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-50 px-4 text-xs font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                                                        >
                                                            <Trash2 size={16} />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {showDeleteModal && selectedCampagne && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-[2rem] bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-100 p-6">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
                                    Suppression sécurisée
                                </p>

                                <h3 className="mt-2 text-2xl font-black text-slate-950">
                                    Confirmer la suppression
                                </h3>

                                <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                                    Pour supprimer la vague{' '}
                                    <strong>
                                        {selectedCampagne.reference || `#${selectedCampagne.id}`}
                                    </strong>
                                    , saisissez le mot de passe unique administrateur DEE.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submitDelete} className="p-6">
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
                                    value={deleteForm.data.delete_password}
                                    onChange={(e) => {
                                        deleteForm.setData('delete_password', e.target.value);
                                        deleteForm.clearErrors('delete_password');
                                    }}
                                    placeholder="Mot de passe de confirmation"
                                    className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:bg-white focus:ring-4 ${
                                        deleteForm.errors.delete_password
                                            ? 'border-red-500 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                                    }`}
                                />
                            </div>

                            {deleteForm.errors.delete_password && (
                                <p className="mt-2 text-sm font-bold text-red-600">
                                    {deleteForm.errors.delete_password}
                                </p>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={deleteForm.processing}
                                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Trash2 size={18} />
                                    {deleteForm.processing ? 'Suppression...' : 'Supprimer définitivement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default Index;