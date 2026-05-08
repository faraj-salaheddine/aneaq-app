import { Head, Link } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import {
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Download,
    FileText,
    FolderOpen,
    History,
    ShieldCheck,
    XCircle,
} from 'lucide-react';

export default function HistoriqueIndex({ expert = {}, participations = [] }) {
    const total = participations.length;
    const confirmed = participations.filter((p) => p.is_confirmed).length;
    const refused = participations.filter((p) => p.is_refused).length;
    const closed = participations.filter((p) => p.is_closed).length;
    const rapports = participations.filter((p) => p.rapport_id).length;

    return (
        <>
            <Head title="Historique des participations — Expert" />

            <div className="min-h-screen bg-[#f6f8fc] px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-[96rem]">
                    <div className="mb-8">
                        <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                            Historique expert
                        </p>

                        <h1 className="mt-3 text-4xl font-black text-slate-950">
                            Historique des participations
                        </h1>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Toutes vos missions d’évaluation ANEAQ.
                        </p>
                    </div>

                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard
                            icon={FolderOpen}
                            label="Total missions"
                            value={total}
                            color="blue"
                        />

                        <StatCard
                            icon={CheckCircle2}
                            label="Confirmées"
                            value={confirmed}
                            color="emerald"
                        />

                        <StatCard
                            icon={XCircle}
                            label="Refusées"
                            value={refused}
                            color="red"
                        />

                        <StatCard
                            icon={ShieldCheck}
                            label="Clôturées"
                            value={closed}
                            color="slate"
                        />

                        <StatCard
                            icon={FileText}
                            label="Rapports déposés"
                            value={rapports}
                            color="amber"
                        />
                    </section>

                    <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <History size={26} />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-slate-950">
                                        Toutes les missions
                                    </h2>

                                    <p className="mt-1 text-sm font-semibold text-slate-400">
                                        Total : {total}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {total === 0 ? (
                            <div className="p-6">
                                <EmptyState text="Aucune participation enregistrée." />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-left">
                                            <Th>Dossier</Th>
                                            <Th>Établissement</Th>
                                            <Th>Campagne</Th>
                                            <Th>Statut mission</Th>
                                            <Th>Date réponse</Th>
                                            <Th>Rapport final</Th>
                                            <Th>Actions</Th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {participations.map((p) => (
                                            <tr
                                                key={`${p.assignment_id || p.dossier_id}-${p.dossier_id}`}
                                                className="border-t border-slate-100 transition hover:bg-blue-50/40"
                                            >
                                                <Td>
                                                    <div>
                                                        <p className="font-black text-slate-950">
                                                            {p.reference || '—'}
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-slate-400">
                                                            Dossier #{p.dossier_id}
                                                        </p>
                                                    </div>
                                                </Td>

                                                <Td>
                                                    <div>
                                                        <p className="font-black text-slate-800">
                                                            {p.etablissement || '—'}
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-slate-400">
                                                            {p.ville || '—'} • {p.universite || '—'}
                                                        </p>
                                                    </div>
                                                </Td>

                                                <Td>
                                                    <p className="font-bold text-slate-700">
                                                        {p.campagne || '—'}
                                                    </p>
                                                </Td>

                                                <Td>
                                                    <div className="space-y-2">
                                                        <MissionBadge status={p.status} label={p.status_label} />

                                                        <p className="text-xs font-semibold text-slate-400">
                                                            Rôle : {p.role_comite || 'Expert'}
                                                        </p>
                                                    </div>
                                                </Td>

                                                <Td>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                        <CalendarClock size={16} className="text-slate-400" />
                                                        {p.date_reponse || p.date_invitation || '—'}
                                                    </div>
                                                </Td>

                                                <Td>
                                                    {p.rapport_id ? (
                                                        <div className="space-y-2">
                                                            <RapportBadge status={p.rapport_statut} label={p.rapport_statut_label} />

                                                            <p className="text-xs font-semibold text-slate-400">
                                                                {p.date_depot_rapport || 'Date non renseignée'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
                                                            Non déposé
                                                        </span>
                                                    )}
                                                </Td>

                                                <Td>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Link
                                                            href={`/expert/dossiers/${p.dossier_id}`}
                                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-blue-700"
                                                        >
                                                            Voir
                                                            <ChevronRight size={14} />
                                                        </Link>

                                                        {p.rapport_id && (
                                                            <Link
                                                                href={`/expert/rapports/${p.rapport_id}/telecharger`}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                                                            >
                                                                <Download size={14} />
                                                                Rapport
                                                            </Link>
                                                        )}
                                                    </div>
                                                </Td>
                                            </tr>
                                        ))}
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

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue: {
            icon: 'bg-blue-50 text-blue-600',
            line: 'border-b-blue-600',
        },
        emerald: {
            icon: 'bg-emerald-50 text-emerald-600',
            line: 'border-b-emerald-600',
        },
        red: {
            icon: 'bg-red-50 text-red-600',
            line: 'border-b-red-500',
        },
        slate: {
            icon: 'bg-slate-100 text-slate-600',
            line: 'border-b-slate-500',
        },
        amber: {
            icon: 'bg-amber-50 text-amber-600',
            line: 'border-b-amber-500',
        },
    };

    return (
        <div className={`rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm ${colors[color].line} border-b-4`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color].icon}`}>
                <Icon size={24} />
            </div>

            <p className="mt-6 text-4xl font-black text-slate-950">
                {value ?? 0}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-500">
                {label}
            </p>
        </div>
    );
}

function MissionBadge({ status, label }) {
    const styles = {
        en_attente_confirmation_expert: 'bg-amber-50 text-amber-700',
        acces_envoye: 'bg-amber-50 text-amber-700',
        confirme_par_expert: 'bg-emerald-50 text-emerald-700',
        comite_confirme: 'bg-blue-50 text-blue-700',
        refuse_par_expert: 'bg-red-50 text-red-700',
        confirme: 'bg-emerald-50 text-emerald-700',
        refuse: 'bg-red-50 text-red-700',
    };

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
            {label || status || '—'}
        </span>
    );
}

function RapportBadge({ status, label }) {
    const styles = {
        brouillon: 'bg-slate-50 text-slate-600',
        depose: 'bg-amber-50 text-amber-700',
        transmis_dee: 'bg-blue-50 text-blue-700',
        valide_dee: 'bg-emerald-50 text-emerald-700',
        retourne_correction: 'bg-red-50 text-red-700',
        valide: 'bg-emerald-50 text-emerald-700',
        rejete: 'bg-red-50 text-red-700',
    };

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
            {label || 'Non déposé'}
        </span>
    );
}

function Th({ children }) {
    return (
        <th className="whitespace-nowrap px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {children}
        </th>
    );
}

function Td({ children }) {
    return (
        <td className="whitespace-nowrap px-5 py-5 align-middle text-sm">
            {children}
        </td>
    );
}

function EmptyState({ text }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Clock3 className="mx-auto text-slate-300" size={36} />

            <p className="mt-3 text-sm font-bold text-slate-500">
                {text}
            </p>
        </div>
    );
}

HistoriqueIndex.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;