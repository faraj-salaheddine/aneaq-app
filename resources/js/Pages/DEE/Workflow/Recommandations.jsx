import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2, CheckCircle2, ClipboardCheck, Clock3, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import DashboardShell from '@/Layouts/DashboardShell';

const STATUS_META = {
    'À réviser par la DEE':       { badge: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    'Validées, prêtes à envoyer': { badge: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    'Suivi établissement en cours': { badge: 'border-violet-200 bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
    'En révision chez l’expert':  { badge: 'border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
    'Toutes clôturées':           { badge: 'border-green-200 bg-green-50 text-green-700', dot: 'bg-green-500' },
    'Brouillons expert':          { badge: 'border-slate-200 bg-slate-50 text-slate-600', dot: 'bg-slate-400' },
    'Aucune recommandation':      { badge: 'border-slate-200 bg-white text-slate-400', dot: 'bg-slate-300' },
};

export default function Recommandations({ dossiers = [] }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const stats = useMemo(() => ({
        dossiers: dossiers.filter((dossier) => dossier.recommandations_count > 0).length,
        aReviser: dossiers.reduce((total, dossier) => total + dossier.soumises_count, 0),
        enSuivi: dossiers.reduce((total, dossier) => total + dossier.suivi_count, 0),
        realisees: dossiers.reduce((total, dossier) => total + dossier.realisees_count, 0),
    }), [dossiers]);

    const filtered = useMemo(() => dossiers.filter((dossier) => {
        const text = `${dossier.reference} ${dossier.etablissement} ${dossier.campagne}`.toLowerCase();
        if (search && !text.includes(search.toLowerCase())) return false;
        if (filter === 'review') return dossier.soumises_count > 0;
        if (filter === 'tracking') return dossier.suivi_count > 0;
        if (filter === 'done') return dossier.recommandations_count > 0 && dossier.cloturees_count === dossier.recommandations_count;
        return true;
    }), [dossiers, filter, search]);

    return (
        <>
            <Head title="Suivi des recommandations" />

            <DashboardShell>
                <div className="min-h-screen bg-slate-100 px-6 py-7 lg:px-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Workflow DEE</p>
                            <h1 className="mt-2 text-3xl font-black text-slate-900">Suivi des recommandations</h1>
                            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                                Consultez les matrices soumises par les experts, validez les recommandations et suivez leur mise en œuvre par établissement.
                            </p>
                        </div>

                        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard icon={Building2} label="Dossiers avec recommandations" value={stats.dossiers} color="text-blue-700" bg="bg-blue-50" />
                            <StatCard icon={ClipboardCheck} label="À réviser par la DEE" value={stats.aReviser} color="text-orange-700" bg="bg-orange-50" />
                            <StatCard icon={Clock3} label="En suivi établissement" value={stats.enSuivi} color="text-violet-700" bg="bg-violet-50" />
                            <StatCard icon={CheckCircle2} label="Réalisées" value={stats.realisees} color="text-emerald-700" bg="bg-emerald-50" />
                        </div>

                        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Rechercher un dossier ou un établissement..."
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {[
                                        ['all', 'Tous'],
                                        ['review', 'À réviser'],
                                        ['tracking', 'En suivi'],
                                        ['done', 'Clôturés'],
                                    ].map(([key, label]) => (
                                        <button key={key} type="button" onClick={() => setFilter(key)}
                                            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                                                filter === key ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                                            }`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-white">
                                        <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-400">
                                            <th className="px-5 py-4">Dossier</th>
                                            <th className="px-5 py-4">Établissement</th>
                                            <th className="px-5 py-4">Matrice</th>
                                            <th className="px-5 py-4">À réviser</th>
                                            <th className="px-5 py-4">Suivi</th>
                                            <th className="px-5 py-4">Statut</th>
                                            <th className="px-5 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map((dossier) => {
                                            const meta = STATUS_META[dossier.statut_recommandations] ?? STATUS_META['Aucune recommandation'];

                                            return (
                                                <tr key={dossier.id} className="text-sm transition hover:bg-slate-50">
                                                    <td className="px-5 py-4">
                                                        <p className="font-black text-slate-900">{dossier.reference}</p>
                                                        <p className="mt-1 text-xs font-semibold text-slate-400">Vague {dossier.campagne || '—'}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="max-w-xs font-bold text-slate-700">{dossier.etablissement || '—'}</p>
                                                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                                                            <Users size={13} /> {dossier.experts_count} expert(s)
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-4 font-black text-slate-700">{dossier.recommandations_count}</td>
                                                    <td className="px-5 py-4 font-black text-blue-700">{dossier.soumises_count}</td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-black text-violet-700">{dossier.suivi_count}</p>
                                                        {dossier.realisees_count > 0 && (
                                                            <p className="mt-1 text-xs font-bold text-emerald-600">{dossier.realisees_count} réalisée(s)</p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${meta.badge}`}>
                                                            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                                                            {dossier.statut_recommandations}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <Link href={dossier.url}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-800">
                                                            Ouvrir le suivi
                                                            <ArrowRight size={14} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-14 text-center text-sm font-bold text-slate-400">
                                                    Aucun dossier ne correspond à ce filtre.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardShell>
        </>
    );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} ${bg}`}>
                <Icon size={19} />
            </div>
            <p className={`mt-3 text-2xl font-black ${color}`}>{value}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
        </div>
    );
}
