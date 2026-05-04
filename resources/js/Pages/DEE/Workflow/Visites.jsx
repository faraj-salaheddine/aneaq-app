import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Eye,
    FileText,
    Search,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function Visites({ visites = [], stats = {} }) {
    const [search, setSearch] = useState('');

    const safeText = (value) => {
        if (value === null || value === undefined || value === '') {
            return '—';
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return String(value);
        }

        if (typeof value === 'object') {
            return value.nom ?? value.name ?? value.reference ?? '—';
        }

        return String(value);
    };

    const formatDate = (date) => {
        if (!date) {
            return '—';
        }

        try {
            return new Date(date).toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return date;
        }
    };

    const filteredVisites = useMemo(() => {
        const term = search.toLowerCase().trim();

        if (!term) {
            return visites;
        }

        return visites.filter((visite) => {
            const etablissement = visite.etablissement || {};

            return [
                visite.reference,
                visite.nom,
                visite.campagne,
                visite.statut,
                visite.status,
                visite.date_visite,
                etablissement.nom,
                etablissement.ville,
                etablissement.universite,
                etablissement.email,
            ]
                .map((item) => safeText(item).toLowerCase())
                .some((item) => item.includes(term));
        });
    }, [visites, search]);

    const cards = [
        {
            label: 'Visites',
            value: stats.visites ?? visites.length ?? 0,
            icon: CalendarDays,
        },
        {
            label: 'À venir',
            value: stats.a_venir ?? 0,
            icon: CheckCircle2,
        },
        {
            label: 'Experts',
            value: stats.experts ?? 0,
            icon: Users,
        },
        {
            label: 'Documents',
            value: stats.documents ?? 0,
            icon: FileText,
        },
    ];

    return (
        <>
            <Head title="Visites planifiées" />

            <div className="min-h-screen bg-[#f6f8fc] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="rounded-[2rem] bg-gradient-to-br from-[#2934c8] via-[#2563eb] to-[#0891b2] p-8 text-white shadow-xl shadow-blue-900/20">
                        <h1 className="text-4xl font-black">
                            Visites planifiées
                        </h1>

                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-blue-50">
                            Cette page affiche les dossiers dont la date de visite est enregistrée
                            ou dont le statut indique une visite planifiée.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {cards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <div
                                        key={card.label}
                                        className="rounded-3xl bg-white/12 p-6 backdrop-blur"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                                            <Icon size={24} />
                                        </div>

                                        <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-blue-100">
                                            {card.label}
                                        </p>

                                        <p className="mt-2 text-4xl font-black">
                                            {card.value}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                                    Liste principale
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-slate-950">
                                    Dossiers avec date de visite planifiée
                                </h2>

                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Les dossiers sont triés par date de visite.
                                </p>
                            </div>

                            <div className="relative w-full lg:w-[480px]">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher par dossier, établissement, ville, vague..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {filteredVisites.length === 0 ? (
                            <div className="p-6">
                                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <CalendarDays size={32} />
                                    </div>

                                    <h3 className="mt-5 text-xl font-black text-slate-950">
                                        Aucun dossier avec visite planifiée
                                    </h3>

                                    <p className="mt-3 max-w-lg text-sm font-medium leading-7 text-slate-500">
                                        Pour afficher un dossier ici, ajoute une date de visite dans le détail du dossier.
                                    </p>

                                    <Link
                                        href="/dee/dossiers"
                                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                                    >
                                        <ClipboardList size={18} />
                                        Voir les dossiers
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px] text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                            <th className="px-6 py-4">Dossier</th>
                                            <th className="px-6 py-4">Établissement</th>
                                            <th className="px-6 py-4">Ville</th>
                                            <th className="px-6 py-4">Vague</th>
                                            <th className="px-6 py-4">Date visite</th>
                                            <th className="px-6 py-4">Statut</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredVisites.map((visite) => {
                                            const etablissement = visite.etablissement || {};

                                            return (
                                                <tr
                                                    key={visite.id}
                                                    className="border-b border-slate-100 transition hover:bg-blue-50/40"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="font-black text-slate-950">
                                                            {safeText(visite.reference)}
                                                        </div>

                                                        <div className="mt-1 text-xs font-semibold text-slate-400">
                                                            {safeText(visite.nom)}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-slate-800">
                                                            {safeText(etablissement.nom)}
                                                        </div>

                                                        <div className="mt-1 text-xs font-semibold text-slate-400">
                                                            {safeText(etablissement.universite)}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5 text-sm font-bold text-slate-600">
                                                        {safeText(etablissement.ville)}
                                                    </td>

                                                    <td className="px-6 py-5 text-sm font-bold text-slate-600">
                                                        {safeText(visite.campagne)}
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                                            <CalendarDays size={15} />
                                                            {formatDate(visite.date_visite)}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                                                            {safeText(visite.statut ?? visite.status)}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-end">
                                                            <Link
                                                                href={`/dee/dossiers/${visite.id}`}
                                                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition hover:bg-blue-700"
                                                            >
                                                                <Eye size={16} />
                                                                Voir dossier
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

Visites.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default Visites;