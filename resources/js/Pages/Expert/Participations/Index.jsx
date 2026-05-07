import { Head, Link, router } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import {
    CheckCircle2,
    ChevronRight,
    Clock3,
    Mail,
    XCircle,
} from 'lucide-react';

export default function ParticipationsIndex({
    expert = {},
    participations = [],
    stats = {},
}) {
    const pending = participations.filter((item) => item.is_pending);
    const confirmed = participations.filter((item) => item.is_confirmed);
    const refused = participations.filter((item) => item.is_refused);

    const acceptParticipation = (participation) => {
        router.post(`/expert/affectations/${participation.assignment_id}/accept`, {}, {
            preserveScroll: true,
        });
    };

    const refuseParticipation = (participation) => {
        const motif = window.prompt('Motif du refus :');
        if (motif === null) return;
        if (!motif.trim()) {
            alert('Le motif du refus est obligatoire.');
            return;
        }
        router.post(`/expert/affectations/${participation.assignment_id}/refuse`, {
            motif_refus: motif,
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Mes invitations — Expert" />

            <div className="min-h-screen bg-[#f6f8fc] px-4 py-8 lg:px-10">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                            <Link href="/expert/dashboard" className="transition hover:text-blue-600">
                                Espace Expert
                            </Link>
                            <span>/</span>
                            <span className="text-emerald-600">Mes invitations</span>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25">
                                <Mail size={22} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Demandes de participation
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    {stats.en_attente || 0} en attente · {stats.total || 0} au total
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <StatCard label="Total" value={stats.total || 0} color="blue" />
                        <StatCard label="En attente" value={stats.en_attente || 0} color="amber" />
                        <StatCard label="Confirmées" value={stats.confirmees || 0} color="emerald" />
                        <StatCard label="Refusées" value={stats.refusees || 0} color="red" />
                    </div>

                    {/* Sections */}
                    <div className="space-y-6">

                        {/* Pending */}
                        <Section
                            title="Invitations en attente"
                            subtitle="Acceptez ou refusez ces missions."
                            icon={Clock3}
                            color="amber"
                            count={pending.length}
                        >
                            {pending.length > 0 ? (
                                <Table
                                    columns={['Dossier', 'Établissement', 'Campagne', 'Date invitation', 'Actions']}
                                    lastRight
                                >
                                    {pending.map((p) => (
                                        <PendingRow
                                            key={p.assignment_id}
                                            participation={p}
                                            onAccept={() => acceptParticipation(p)}
                                            onRefuse={() => refuseParticipation(p)}
                                        />
                                    ))}
                                </Table>
                            ) : (
                                <EmptyState text="Aucune invitation en attente." />
                            )}
                        </Section>

                        {/* Confirmed */}
                        <Section
                            title="Demandes confirmées"
                            subtitle="Les missions que vous avez acceptées."
                            icon={CheckCircle2}
                            color="emerald"
                            count={confirmed.length}
                        >
                            {confirmed.length > 0 ? (
                                <Table
                                    columns={['Dossier', 'Établissement', 'Campagne', 'Date réponse', 'Action']}
                                    lastRight
                                >
                                    {confirmed.map((p) => (
                                        <ConfirmedRow key={p.assignment_id} participation={p} />
                                    ))}
                                </Table>
                            ) : (
                                <EmptyState text="Aucune demande confirmée." />
                            )}
                        </Section>

                        {/* Refused */}
                        <Section
                            title="Demandes refusées"
                            subtitle="Les missions que vous avez refusées."
                            icon={XCircle}
                            color="red"
                            count={refused.length}
                        >
                            {refused.length > 0 ? (
                                <Table
                                    columns={['Dossier', 'Établissement', 'Campagne', 'Date refus', 'Motif']}
                                >
                                    {refused.map((p) => (
                                        <RefusedRow key={p.assignment_id} participation={p} />
                                    ))}
                                </Table>
                            ) : (
                                <EmptyState text="Aucune demande refusée." />
                            )}
                        </Section>

                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Table wrapper ────────────────────────────────────────────── */
function Table({ columns, children, lastRight = false }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
                <thead>
                    <tr className="border-b border-slate-100">
                        {columns.map((col, i) => (
                            <th
                                key={col}
                                className={`px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 ${
                                    lastRight && i === columns.length - 1 ? 'text-right' : 'text-left'
                                }`}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">{children}</tbody>
            </table>
        </div>
    );
}

/* ─── Row: pending ──────────────────────────────────────────────── */
function PendingRow({ participation, onAccept, onRefuse }) {
    const dossier = participation.dossier || {};
    const etablissement = participation.etablissement || {};

    return (
        <tr className="group transition hover:bg-amber-50/40">
            <td className="px-4 py-4">
                <StatusBadge status={participation.status} label={participation.status_label} />
                <p className="mt-1.5 font-black text-slate-900">{dossier.reference || '—'}</p>
                <p className="text-xs text-slate-400">{participation.role_label || 'Expert'}</p>
            </td>
            <td className="px-4 py-4">
                <p className="font-semibold text-slate-800">{etablissement.nom || '—'}</p>
                <p className="text-xs text-slate-400">{etablissement.ville || '—'}</p>
            </td>
            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                {participation.campagne || '—'}
            </td>
            <td className="px-4 py-4 text-sm text-slate-500">
                {participation.date_invitation || '—'}
            </td>
            <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onRefuse}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                        <XCircle size={14} />
                        Refuser
                    </button>
                    <button
                        type="button"
                        onClick={onAccept}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
                    >
                        <CheckCircle2 size={14} />
                        Accepter
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ─── Row: confirmed ────────────────────────────────────────────── */
function ConfirmedRow({ participation }) {
    const dossier = participation.dossier || {};
    const etablissement = participation.etablissement || {};

    return (
        <tr className="group transition hover:bg-emerald-50/30">
            <td className="px-4 py-4">
                <StatusBadge status={participation.status} label={participation.status_label} />
                <p className="mt-1.5 font-black text-slate-900">{dossier.reference || '—'}</p>
                <p className="text-xs text-slate-400">{participation.role_label || 'Expert'}</p>
            </td>
            <td className="px-4 py-4">
                <p className="font-semibold text-slate-800">{etablissement.nom || '—'}</p>
                <p className="text-xs text-slate-400">{etablissement.ville || '—'}</p>
            </td>
            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                {participation.campagne || '—'}
            </td>
            <td className="px-4 py-4 text-sm text-slate-500">
                {participation.date_reponse || participation.date_invitation || '—'}
            </td>
            <td className="px-4 py-4 text-right">
                <Link
                    href={`/expert/dossiers/${dossier.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                >
                    Ouvrir
                    <ChevronRight size={14} />
                </Link>
            </td>
        </tr>
    );
}

/* ─── Row: refused ──────────────────────────────────────────────── */
function RefusedRow({ participation }) {
    const dossier = participation.dossier || {};
    const etablissement = participation.etablissement || {};

    return (
        <tr className="group transition hover:bg-red-50/30">
            <td className="px-4 py-4">
                <StatusBadge status={participation.status} label={participation.status_label} />
                <p className="mt-1.5 font-black text-slate-900">{dossier.reference || '—'}</p>
                <p className="text-xs text-slate-400">{participation.role_label || 'Expert'}</p>
            </td>
            <td className="px-4 py-4">
                <p className="font-semibold text-slate-800">{etablissement.nom || '—'}</p>
                <p className="text-xs text-slate-400">{etablissement.ville || '—'}</p>
            </td>
            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                {participation.campagne || '—'}
            </td>
            <td className="px-4 py-4 text-sm text-slate-500">
                {participation.date_reponse || '—'}
            </td>
            <td className="px-4 py-4">
                {participation.motif_refus ? (
                    <span className="inline-block max-w-[220px] rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                        {participation.motif_refus}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                )}
            </td>
        </tr>
    );
}

/* ─── Section wrapper ───────────────────────────────────────────── */
function Section({ title, subtitle, icon: Icon, color, count, children }) {
    const colorMap = {
        amber:   { wrap: 'bg-amber-50 text-amber-600',   badge: 'bg-amber-100 text-amber-700' },
        emerald: { wrap: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
        red:     { wrap: 'bg-red-50 text-red-600',       badge: 'bg-red-100 text-red-700' },
        blue:    { wrap: 'bg-blue-50 text-blue-600',     badge: 'bg-blue-100 text-blue-700' },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.wrap}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-slate-900">{title}</h2>
                        <p className="text-xs text-slate-400">{subtitle}</p>
                    </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${c.badge}`}>
                    {count} résultat{count !== 1 ? 's' : ''}
                </span>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

/* ─── Stat card ─────────────────────────────────────────────────── */
function StatCard({ label, value, color }) {
    const map = {
        blue:    'border-blue-500   text-blue-700   bg-blue-50',
        amber:   'border-amber-500  text-amber-700  bg-amber-50',
        emerald: 'border-emerald-500 text-emerald-700 bg-emerald-50',
        red:     'border-red-500    text-red-700    bg-red-50',
    };

    return (
        <div className={`rounded-2xl border-l-4 bg-white p-4 shadow-sm ${map[color]}`}>
            <p className={`text-3xl font-black ${map[color].split(' ')[1]}`}>{value}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-500">{label}</p>
        </div>
    );
}

/* ─── Status badge ──────────────────────────────────────────────── */
function StatusBadge({ status, label }) {
    const styles = {
        en_attente_confirmation_expert: 'bg-amber-50 text-amber-700',
        acces_envoye:                   'bg-amber-50 text-amber-700',
        confirme_par_expert:            'bg-emerald-50 text-emerald-700',
        comite_confirme:                'bg-blue-50 text-blue-700',
        refuse_par_expert:              'bg-red-50 text-red-700',
        confirme:                       'bg-emerald-50 text-emerald-700',
        refuse:                         'bg-red-50 text-red-700',
    };

    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
            {label || status || '—'}
        </span>
    );
}

/* ─── Empty state ───────────────────────────────────────────────── */
function EmptyState({ text }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
            <Clock3 className="mx-auto text-slate-300" size={28} />
            <p className="mt-2 text-sm font-semibold text-slate-400">{text}</p>
        </div>
    );
}

ParticipationsIndex.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;
