import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import { Activity, ArrowRight, CheckCircle2, Crown, Users } from 'lucide-react';

export default function Affectations({ dossiers = [] }) {
    const totalExperts  = dossiers.reduce((s, d) => s + (d.experts_count || 0), 0);
    const confirmedCount = dossiers.filter(d =>
        d.experts?.some(e => e.status === 'confirme_par_expert')
    ).length;

    return (
        <>
            <Head title="Affectation des dossiers" />
            <DashboardShell>
                <div className="mx-auto max-w-6xl px-6 py-10">

                    {/* ── Page header ── */}
                    <div className="mb-8">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">
                            Workflow DEE
                        </p>
                        <h1 className="mt-1.5 text-3xl font-black tracking-tight text-slate-900">
                            Affectation des dossiers
                        </h1>
                    </div>

                    {/* ── Stats ── */}
                    <div className="mb-8 grid grid-cols-3 gap-5">
                        <StatCard
                            icon={Activity}
                            title={dossiers.length}
                            sub="Dossiers affectés"
                            bar="bg-cyan-500"
                        />
                        <StatCard
                            icon={Users}
                            title={totalExperts}
                            sub="Experts confirmés"
                            bar="bg-blue-500"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            title={confirmedCount}
                            sub="Confirmés par expert"
                            bar="bg-emerald-500"
                        />
                    </div>

                    {/* ── Table ── */}
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        {dossiers.length === 0 ? (
                            <EmptyRow />
                        ) : (
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        {['Référence', 'Établissement', 'Comité d\'experts', 'Statut', ''].map(h => (
                                            <th
                                                key={h}
                                                className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {dossiers.map(dossier => (
                                        <DossierRow key={dossier.id} dossier={dossier} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </DashboardShell>
        </>
    );
}

/* ── Table row ───────────────────────────────────────────────────────── */
function DossierRow({ dossier }) {
    const chef    = dossier.experts?.find(e => e.role === 'chef_comite');
    const experts = dossier.experts?.filter(e => e.role === 'expert') ?? [];

    return (
        <tr className="group transition-colors hover:bg-slate-50/60">

            {/* Reference */}
            <td className="px-6 py-5">
                <p className="font-black text-slate-900">{dossier.reference}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                    {dossier.experts_count} expert{dossier.experts_count !== 1 ? 's' : ''}
                </p>
            </td>

            {/* School */}
            <td className="px-6 py-5">
                <p className="max-w-[200px] font-semibold text-slate-700 leading-snug">
                    {dossier.etablissement || '—'}
                </p>
            </td>

            {/* Experts */}
            <td className="px-6 py-5">
                <div className="flex flex-col gap-2">
                    {/* Chef first */}
                    {chef && (
                        <ExpertLine
                            name={chef.name}
                            role="Chef de comité"
                            status={chef.status}
                            isChef
                        />
                    )}
                    {/* Experts */}
                    {experts.map((e, i) => (
                        <ExpertLine
                            key={e.id}
                            name={e.name}
                            role={`Expert ${i + 1}`}
                            status={e.status}
                        />
                    ))}
                </div>
            </td>

            {/* Dossier status */}
            <td className="px-6 py-5">
                <StatusBadge statut={dossier.statut} />
            </td>

            {/* Action */}
            <td className="px-6 py-5 text-right">
                <Link
                    href={dossier.url}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-cyan-600 group-hover:bg-cyan-600"
                >
                    Gérer
                    <ArrowRight size={13} />
                </Link>
            </td>
        </tr>
    );
}

/* ── Expert line inside cell ─────────────────────────────────────────── */
function ExpertLine({ name, role, status, isChef = false }) {
    const STATUS = {
        acces_envoye:                { label: 'Accès envoyé',  cls: 'bg-cyan-100 text-cyan-700' },
        confirme_par_expert:         { label: 'Confirmé',       cls: 'bg-emerald-100 text-emerald-700' },
        en_attente_confirmation_dee: { label: 'En attente',    cls: 'bg-amber-100 text-amber-700' },
    };
    const s = STATUS[status] ?? { label: status ?? '—', cls: 'bg-slate-100 text-slate-500' };
    const initial = (name || '?').charAt(0).toUpperCase();

    return (
        <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white text-[10px] font-black ${isChef ? 'bg-violet-600' : 'bg-blue-500'}`}>
                {isChef ? <Crown size={12} /> : initial}
            </div>

            {/* Info */}
            <div className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-800 leading-tight">
                    {name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">{role}</span>
            </div>

            {/* Status */}
            <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${s.cls}`}>
                {s.label}
            </span>
        </div>
    );
}

/* ── Status badge ────────────────────────────────────────────────────── */
function StatusBadge({ statut }) {
    if (!statut || statut === '—') return <span className="text-slate-300">—</span>;

    const short = statut.length > 22 ? statut.slice(0, 22) + '…' : statut;
    return (
        <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {short}
        </span>
    );
}

/* ── Stat card ───────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, title, sub, bar }) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`h-1 w-12 rounded-full ${bar}`} />
            <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
                <Icon size={20} />
            </div>
            <p className="mt-5 text-4xl font-black text-slate-900">{title}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{sub}</p>
        </div>
    );
}

/* ── Empty ───────────────────────────────────────────────────────────── */
function EmptyRow() {
    return (
        <div className="flex flex-col items-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Activity size={26} />
            </div>
            <p className="mt-4 font-black text-slate-800">Aucun dossier affecté</p>
            <p className="mt-1 text-sm text-slate-400">
                Les dossiers apparaissent ici dès qu'un expert est confirmé.
            </p>
            <Link
                href="/dee/dossiers"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-black text-white hover:bg-cyan-700"
            >
                Voir les dossiers <ArrowRight size={14} />
            </Link>
        </div>
    );
}
