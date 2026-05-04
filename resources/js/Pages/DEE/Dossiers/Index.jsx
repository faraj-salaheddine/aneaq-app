import { Head, Link, router } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import {
    CalendarDays,
    Eye,
    FileText,
    FolderKanban,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function DossiersIndex({ dossiers = [] }) {
    const [search, setSearch] = useState('');

    const getText = (value) => {
        if (value === null || value === undefined || value === '') {
            return '—';
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return String(value);
        }

        if (typeof value === 'object') {
            return (
                value.nom ??
                value.etablissement_2 ??
                value.etablissement ??
                value.name ??
                value.reference ??
                value.ville ??
                '—'
            );
        }

        return String(value);
    };

    const filteredDossiers = useMemo(() => {
        const term = search.toLowerCase().trim();

        if (!term) {
            return dossiers;
        }

        return dossiers.filter((dossier) => {
            return [
                dossier.reference,
                dossier.nom,
                dossier.statut,
                dossier.status,
                dossier.campagne,
                dossier.campagne_reference,
                dossier.etablissement_nom,
                dossier.etablissement,
                dossier.ville,
                dossier.date_visite,
            ]
                .map((item) => getText(item).toLowerCase())
                .some((item) => item.includes(term));
        });
    }, [dossiers, search]);

    const deleteDossier = (dossier) => {
        if (!confirm(`Voulez-vous vraiment supprimer le dossier ${dossier.reference ?? ''} ?`)) {
            return;
        }

        router.delete(`/dee/dossiers/${dossier.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Dossiers" />

            <div className="min-h-screen bg-[#f6f8fc] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                                Gestion des dossiers
                            </p>

                            <h1 className="mt-2 text-4xl font-black text-slate-950">
                                Liste des dossiers
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                                Consulte les dossiers créés automatiquement après confirmation des établissements.
                            </p>
                        </div>

                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                        >
                            Dashboard
                        </Link>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <FolderKanban size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-black text-slate-950">
                                        Dossiers enregistrés
                                    </h2>

                                    <p className="text-sm font-medium text-slate-500">
                                        Total : {filteredDossiers.length}
                                    </p>
                                </div>
                            </div>

                            <div className="relative w-full lg:w-[420px]">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher par dossier, établissement, statut..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {filteredDossiers.length === 0 ? (
                            <div className="p-8">
                                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <FileText size={30} />
                                    </div>

                                    <h3 className="mt-5 text-xl font-black text-slate-950">
                                        Aucun dossier trouvé
                                    </h3>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                            <th className="px-6 py-4">Référence</th>
                                            <th className="px-6 py-4">Établissement</th>
                                            <th className="px-6 py-4">Campagne</th>
                                            <th className="px-6 py-4">Statut</th>
                                            <th className="px-6 py-4">Date visite</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredDossiers.map((dossier) => (
                                            <tr
                                                key={dossier.id}
                                                className="border-b border-slate-100 transition hover:bg-blue-50/40"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-slate-950">
                                                        {getText(dossier.reference)}
                                                    </div>

                                                    <div className="mt-1 text-xs font-semibold text-slate-400">
                                                        ID : {dossier.id}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-800">
                                                        {getText(dossier.etablissement_nom ?? dossier.etablissement)}
                                                    </div>

                                                    <div className="mt-1 text-xs font-semibold text-slate-400">
                                                        {getText(dossier.ville)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                                                    {getText(dossier.campagne ?? dossier.campagne_reference)}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                                        {getText(dossier.statut ?? dossier.status)}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                                                        <CalendarDays size={16} />
                                                        {getText(dossier.date_visite)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/dee/dossiers/${dossier.id}`}
                                                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition hover:bg-blue-700"
                                                        >
                                                            <Eye size={16} />
                                                            Voir
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => deleteDossier(dossier)}
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
                    </div>
                </div>
            </div>
        </>
    );
}

DossiersIndex.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default DossiersIndex;