import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import { ArrowUpRight, BarChart2, Crown, GraduationCap, Shield, Users } from 'lucide-react';

const BORDER_COLORS = [
    'border-l-blue-500',
    'border-l-violet-500',
    'border-l-emerald-500',
    'border-l-orange-500',
    'border-l-pink-500',
    'border-l-cyan-500',
];

const CHEF_BG   = 'bg-violet-600';
const EXPERT_BG = ['bg-blue-500','bg-sky-500','bg-indigo-500','bg-teal-500','bg-cyan-500'];

export default function Comites({ comites = [] }) {
    const totalExperts = comites.reduce((s, c) => s + (c.experts_count || 0), 0);

    return (
        <>
            <Head title="Constitution du comité" />
            <DashboardShell>
                <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

                    {/* ── Header ── */}
                    <div className="mb-8 flex flex-col gap-1">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">
                            Workflow DEE
                        </p>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            Constitution des comités
                        </h1>
                    </div>

                    {/* ── Counters ── */}
                    <div className="mb-8 flex flex-wrap gap-3">
                        <Counter icon={BarChart2} value={comites.length}  label="Comités"       color="orange" />
                        <Counter icon={Users}     value={totalExperts}    label="Membres"        color="blue"   />
                        <Counter icon={Crown}     value={comites.filter(c=>c.chef).length} label="Chefs" color="violet" />
                    </div>

                    {/* ── List ── */}
                    {comites.length === 0 ? <EmptyState /> : (
                        <div className="space-y-3">
                            {comites.map((comite, idx) => (
                                <ComiteItem key={comite.dossier_id} comite={comite} idx={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </DashboardShell>
        </>
    );
}

/* ── One comité item ─────────────────────────────────────────────────── */
function ComiteItem({ comite, idx }) {
    const chef    = comite.experts?.find(e => e.role === 'chef_comite');
    const experts = comite.experts?.filter(e => e.role === 'expert') ?? [];
    const border  = BORDER_COLORS[idx % BORDER_COLORS.length];

    return (
        <div className={`group flex flex-col gap-4 rounded-2xl border border-slate-200 border-l-4 ${border} bg-white px-6 py-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center`}>

            {/* School info */}
            <div className="min-w-0 sm:w-64 sm:shrink-0">
                <p className="mb-1 inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black tracking-widest text-slate-500">
                    {comite.reference}
                </p>
                <h2 className="truncate text-base font-black text-slate-900">
                    {comite.etablissement}
                </h2>
                {comite.universite && comite.universite !== '—' && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-slate-400">
                        <GraduationCap size={11} />
                        {comite.universite}
                    </p>
                )}
            </div>

            {/* Members row */}
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* Chef chip */}
                {chef && (
                    <MemberChip
                        name={chef.name}
                        role="Chef"
                        status={chef.status}
                        bg={CHEF_BG}
                        icon={<Crown size={10} />}
                    />
                )}

                {/* Experts chips */}
                {experts.map((expert, i) => (
                    <MemberChip
                        key={expert.id}
                        name={expert.name}
                        role={`E${i + 1}`}
                        status={expert.status}
                        bg={EXPERT_BG[i % EXPERT_BG.length]}
                    />
                ))}
            </div>

            {/* Member count + action */}
            <div className="flex shrink-0 items-center gap-3">
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                    <p className="text-xl font-black text-slate-800">{comite.experts_count}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        membres
                    </p>
                </div>

                <Link
                    href={comite.url}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 active:scale-95"
                >
                    <ArrowUpRight size={18} />
                </Link>
            </div>
        </div>
    );
}

/* ── Member chip ─────────────────────────────────────────────────────── */
function MemberChip({ name, role, status, bg, icon }) {
    const initial = (name || '?').charAt(0).toUpperCase();
    const statusLabel = {
        acces_envoye:                '✓',
        confirme_par_expert:         '✓✓',
        en_attente_confirmation_dee: '…',
    }[status] ?? '';

    return (
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 py-1.5 pl-1.5 pr-3">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg} text-white`}>
                {icon
                    ? <span className="flex items-center gap-0.5 text-[9px] font-black">{icon}</span>
                    : <span className="text-xs font-black">{initial}</span>
                }
            </div>
            <div>
                <p className="max-w-[90px] truncate text-xs font-black text-slate-800 leading-tight">
                    {name}
                </p>
                <p className="text-[9px] font-bold leading-tight text-slate-400">
                    {role} {statusLabel}
                </p>
            </div>
        </div>
    );
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function Counter({ icon: Icon, value, label, color }) {
    const styles = {
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        blue:   'bg-blue-50   text-blue-600   border-blue-200',
        violet: 'bg-violet-50 text-violet-600 border-violet-200',
    };
    return (
        <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${styles[color]}`}>
            <Icon size={18} />
            <span className="text-2xl font-black">{value}</span>
            <span className="text-sm font-semibold opacity-70">{label}</span>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-400">
                <Shield size={30} />
            </div>
            <p className="mt-5 text-xl font-black text-slate-900">Aucun comité constitué</p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
                Un comité apparaît ici dès qu'un dossier a 1 chef de comité + 2 experts confirmés.
            </p>
            <Link
                href="/dee/dossiers"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-orange-600"
            >
                Gérer les dossiers
            </Link>
        </div>
    );
}
