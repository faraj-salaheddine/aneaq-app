import { Head, Link, router } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import {
    ArrowLeft,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    GraduationCap,
    MapPin,
    ShieldCheck,
    Star,
    Users,
} from 'lucide-react';

const statusStyles = {
    en_preparation: {
        label: 'En préparation',
        badge: 'bg-slate-50 text-slate-700 border-slate-100',
    },
    autoeval_en_cours: {
        label: 'Autoévaluation en cours',
        badge: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    autoeval_depose: {
        label: 'Autoévaluation déposée',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
    en_evaluation: {
        label: 'En évaluation',
        badge: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    visite_planifiee: {
        label: 'Date de visite planifiée',
        badge: 'bg-orange-50 text-orange-700 border-orange-100',
    },
    rapport_en_attente: {
        label: 'Rapport attendu',
        badge: 'bg-red-50 text-red-700 border-red-100',
    },
    rapport_depose: {
        label: 'Rapport déposé',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    valide: {
        label: 'Validé',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    cloture: {
        label: 'Clôturé',
        badge: 'bg-slate-50 text-slate-700 border-slate-100',
    },
    comite_confirme: {
        label: 'Comité confirmé',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    date_visite_planifiee: {
        label: 'Date de visite planifiée',
        badge: 'bg-orange-50 text-orange-700 border-orange-100',
    },
};

const steps = [
    {
        label: 'Affectation confirmée',
        done: true,
    },
    {
        label: 'Rapport d’autoévaluation',
        statuses: [
            'autoeval_depose',
            'en_evaluation',
            'visite_planifiee',
            'rapport_en_attente',
            'rapport_depose',
            'valide',
            'cloture',
            'comite_confirme',
        ],
    },
    {
        label: 'Évaluation quantitative',
        statuses: [
            'visite_planifiee',
            'rapport_en_attente',
            'rapport_depose',
            'valide',
            'cloture',
        ],
        activeStatuses: ['en_evaluation', 'comite_confirme'],
    },
    {
        label: 'Visite sur site',
        statuses: ['rapport_en_attente', 'rapport_depose', 'valide', 'cloture'],
        activeStatuses: ['visite_planifiee'],
    },
    {
        label: 'Rapport final',
        statuses: ['rapport_depose', 'valide', 'cloture'],
        activeStatuses: ['rapport_en_attente'],
    },
    {
        label: 'Validation DEE',
        statuses: ['valide', 'cloture'],
    },
];

export default function DossierShow({
    expert = {},
    dossier = {},
    comite = [],
    progression = 0,
    rapport = null,
    nbRecommandations = 0,
}) {
    const etablissement = dossier?.etablissement || {};
    const currentStatus = dossier?.statut || dossier?.status || 'en_preparation';
    const statusMeta = statusStyles[currentStatus] || {
        label: currentStatus || '—',
        badge: 'bg-slate-50 text-slate-700 border-slate-100',
    };

    const progressValue = Number(progression || 0);

    const actions = [
        {
            title: 'Évaluation quantitative',
            description: `${progressValue}% complétée`,
            icon: BarChart3,
            href: `/expert/evaluations/${dossier.id}`,
            color: 'blue',
        },
        {
            title: 'Déposer rapport final',
            description: rapport ? `Statut : ${rapport.statut || rapport.status || 'Déposé'}` : 'Aucun rapport déposé',
            icon: FileText,
            href: `/expert/rapports/${dossier.id}/deposer`,
            color: 'emerald',
        },
        {
            title: 'Matrice recommandations',
            description: `${nbRecommandations || 0} recommandation(s)`,
            icon: ClipboardCheck,
            href: `/expert/recommandations/${dossier.id}`,
            color: 'amber',
        },
    ];

    return (
        <>
            <Head title={`Dossier ${dossier.reference || ''} — Expert`} />

            <div className="min-h-screen bg-[#f6f8fc] px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-[96rem]">
                    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 text-sm font-black">
                                <Link
                                    href="/expert/dashboard"
                                    className="text-slate-400 transition hover:text-blue-600"
                                >
                                    Espace Expert
                                </Link>

                                <span className="text-slate-300">/</span>

                                <Link
                                    href="/expert/dossiers"
                                    className="text-slate-400 transition hover:text-blue-600"
                                >
                                    Dossiers affectés
                                </Link>

                                <span className="text-slate-300">/</span>

                                <span className="text-emerald-600">
                                    {dossier.reference || 'Dossier'}
                                </span>
                            </div>

                            <h1 className="mt-3 text-4xl font-black text-slate-950">
                                {dossier.reference || 'Dossier'}
                            </h1>

                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                Consultez les informations du dossier, le comité et vos actions d’évaluation.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.visit('/expert/dossiers')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={18} />
                            Retour aux dossiers
                        </button>
                    </div>

                    <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1d2b9f] via-[#2563eb] to-[#0891b2] p-8 text-white shadow-2xl shadow-blue-900/20 lg:p-10">
                        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">
                                    Fiche dossier
                                </p>

                                <h2 className="mt-4 text-4xl font-black">
                                    {dossier.reference || '—'}
                                </h2>

                                <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-blue-50">
                                    {etablissement.nom ||
                                        etablissement.etablissement_2 ||
                                        etablissement.etablissement ||
                                        'Établissement non renseigné'}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white backdrop-blur">
                                        {formatRole(expert.role_comite || expert.role_expert || 'expert')}
                                    </span>

                                    <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white backdrop-blur">
                                        {statusMeta.label}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <HeroInfo
                                    icon={MapPin}
                                    label="Ville"
                                    value={etablissement.ville}
                                />

                                <HeroInfo
                                    icon={Building2}
                                    label="Université"
                                    value={etablissement.universite}
                                />

                                <HeroInfo
                                    icon={CalendarDays}
                                    label="Date visite"
                                    value={formatDate(dossier.date_visite)}
                                />

                                <HeroInfo
                                    icon={ShieldCheck}
                                    label="Progression"
                                    value={`${progressValue}%`}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={BarChart3}
                            label="Progression"
                            value={`${progressValue}%`}
                            color="blue"
                        />

                        <StatCard
                            icon={Users}
                            label="Membres comité"
                            value={comite?.length || 0}
                            color="emerald"
                        />

                        <StatCard
                            icon={FileText}
                            label="Rapport"
                            value={rapport ? '1' : '0'}
                            color="amber"
                        />

                        <StatCard
                            icon={ClipboardCheck}
                            label="Recommandations"
                            value={nbRecommandations || 0}
                            color="red"
                        />
                    </section>

                    <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
                        <div className="space-y-8">
                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionTitle
                                    icon={Building2}
                                    title="Informations établissement"
                                    description="Données principales de l’établissement concerné."
                                />

                                <div className="grid gap-4 p-6 md:grid-cols-2">
                                    <InfoItem label="Établissement" value={etablissement.nom || etablissement.etablissement_2 || etablissement.etablissement} />
                                    <InfoItem label="Acronyme" value={etablissement.acronyme} />
                                    <InfoItem label="Ville" value={etablissement.ville} />
                                    <InfoItem label="Université" value={etablissement.universite} />
                                    <InfoItem label="Email" value={etablissement.email} />
                                    <InfoItem label="Domaine" value={etablissement.domaine_connaissances} />
                                    <InfoItem label="Vague" value={dossier.campagne || dossier.vague} />
                                    <InfoItem label="Date visite" value={formatDate(dossier.date_visite)} />
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionTitle
                                    icon={ShieldCheck}
                                    title="Progression de l’évaluation"
                                    description="Suivi du taux de saisie des critères."
                                />

                                <div className="p-6">
                                    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-black text-slate-900">
                                                    Évaluation quantitative
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-500">
                                                    {progressValue < 100
                                                        ? `${progressValue}% des critères notés`
                                                        : 'Tous les critères sont évalués'}
                                                </p>
                                            </div>

                                            <span className="text-4xl font-black text-blue-600">
                                                {progressValue}%
                                            </span>
                                        </div>

                                        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                                                style={{
                                                    width: `${Math.min(Math.max(progressValue, 0), 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionTitle
                                    icon={Users}
                                    title={`Comité (${comite?.length || 0} expert(s))`}
                                    description="Membres du comité affectés à ce dossier."
                                />

                                <div className="grid gap-4 p-6 md:grid-cols-2">
                                    {comite?.length > 0 ? (
                                        comite.map((member) => (
                                            <CommitteeCard
                                                key={member.id}
                                                member={member}
                                            />
                                        ))
                                    ) : (
                                        <div className="md:col-span-2">
                                            <EmptyState text="Aucun membre du comité trouvé." />
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionTitle
                                    icon={Star}
                                    title="Actions expert"
                                    description="Accédez aux étapes principales de votre mission."
                                />

                                <div className="grid gap-4 p-6 md:grid-cols-3">
                                    {actions.map((action) => (
                                        <ActionCard
                                            key={action.title}
                                            action={action}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-8">
                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionTitle
                                    icon={CheckCircle2}
                                    title="Avancement"
                                    description="Workflow du dossier."
                                    compact
                                />

                                <div className="space-y-4 p-6">
                                    {steps.map((step, index) => {
                                        const done =
                                            step.done ||
                                            step.statuses?.includes(currentStatus);

                                        const active = step.activeStatuses?.includes(currentStatus);

                                        return (
                                            <TimelineStep
                                                key={step.label}
                                                index={index + 1}
                                                label={step.label}
                                                done={done}
                                                active={active}
                                            />
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionTitle
                                    icon={FileText}
                                    title="Rapport final"
                                    description="État du rapport expert."
                                    compact
                                />

                                <div className="p-6">
                                    <div className="rounded-[1.5rem] bg-slate-50 p-5">
                                        <p className="text-sm font-black text-slate-900">
                                            {rapport ? 'Rapport déposé' : 'Aucun rapport déposé'}
                                        </p>

                                        <p className="mt-2 text-xs font-semibold text-slate-500">
                                            {rapport
                                                ? `Statut : ${rapport.statut || rapport.status || '—'}`
                                                : 'Vous pouvez déposer votre rapport depuis les actions.'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}

function HeroInfo({ icon: Icon, label, value }) {
    return (
        <div className="rounded-3xl bg-white/12 p-5 backdrop-blur">
            <Icon size={24} />

            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                {label}
            </p>

            <p className="mt-2 text-sm font-black text-white">
                {value || '—'}
            </p>
        </div>
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
        amber: {
            icon: 'bg-amber-50 text-amber-600',
            line: 'border-b-amber-500',
        },
        red: {
            icon: 'bg-red-50 text-red-600',
            line: 'border-b-red-500',
        },
    };

    return (
        <div className={`rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm ${colors[color].line} border-b-4`}>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color].icon}`}>
                <Icon size={26} />
            </div>

            <p className="mt-8 text-4xl font-black text-slate-950">
                {value ?? 0}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-500">
                {label}
            </p>
        </div>
    );
}

function SectionTitle({ icon: Icon, title, description, compact = false }) {
    return (
        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
            <div className={`${compact ? 'h-12 w-12' : 'h-14 w-14'} flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600`}>
                <Icon size={compact ? 22 : 26} />
            </div>

            <div>
                <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-black text-slate-950`}>
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm font-semibold text-slate-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-sm font-black text-slate-800">
                {value || '—'}
            </p>
        </div>
    );
}

function CommitteeCard({ member }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
                    {initials(member.name || `${member.prenom || ''} ${member.nom || ''}`)}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-900">
                        {member.name || `${member.prenom || ''} ${member.nom || ''}`.trim() || 'Expert'}
                    </p>

                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {member.email || 'Email non renseigné'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black text-blue-700">
                            {member.role_comite || member.role_label || 'Expert'}
                        </span>

                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-700">
                            {member.status_label || formatStatus(member.status)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionCard({ action }) {
    const Icon = action.icon;

    const colors = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-600',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600',
        amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-500',
    };

    return (
        <button
            type="button"
            onClick={() => router.visit(action.href)}
            className={`group rounded-[1.5rem] border p-5 text-left transition hover:text-white ${colors[action.color]}`}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                <Icon size={24} />
            </div>

            <p className="mt-5 font-black">
                {action.title}
            </p>

            <p className="mt-2 text-xs font-semibold opacity-80">
                {action.description}
            </p>

            <p className="mt-5 inline-flex items-center gap-2 text-sm font-black">
                Accéder
                <span className="transition group-hover:translate-x-1">→</span>
            </p>
        </button>
    );
}

function TimelineStep({ index, label, done, active }) {
    return (
        <div className="flex items-start gap-4">
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    done
                        ? 'bg-emerald-600 text-white'
                        : active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                }`}
            >
                {done ? '✓' : index}
            </div>

            <div>
                <p
                    className={`text-sm font-black ${
                        done || active ? 'text-slate-900' : 'text-slate-400'
                    }`}
                >
                    {label}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                    {done ? 'Terminé' : active ? 'En cours' : 'En attente'}
                </p>
            </div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center">
            <FileText className="mx-auto text-slate-300" size={34} />

            <p className="mt-3 text-sm font-bold text-slate-500">
                {text}
            </p>
        </div>
    );
}

function initials(name) {
    if (!name) {
        return 'EX';
    }

    const parts = String(name).trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function formatStatus(status) {
    const labels = {
        en_attente_confirmation_dee: 'En attente DEE',
        en_attente_confirmation_expert: 'À confirmer',
        acces_envoye: 'À confirmer',
        confirme_par_expert: 'Confirmé',
        refuse_par_expert: 'Refusé',
        comite_confirme: 'Comité confirmé',
    };

    return labels[status] || status || '—';
}

function formatRole(role) {
    const labels = {
        chef_comite: 'Chef de comité',
        expert: 'Expert',
    };

    return labels[role] || role || 'Expert';
}

function formatDate(value) {
    if (!value) {
        return 'Non planifiée';
    }

    try {
        return new Date(value).toLocaleDateString('fr-FR');
    } catch {
        return value;
    }
}

DossierShow.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;