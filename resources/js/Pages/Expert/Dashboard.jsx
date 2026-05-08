import { Head, Link, router } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import {
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    FolderOpen,
    Mail,
    MapPin,
    ShieldCheck,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';

const statusStyles = {
    en_attente_confirmation_dee: 'bg-slate-50 text-slate-600 border-slate-100',
    en_attente_confirmation_expert: 'bg-amber-50 text-amber-700 border-amber-100',
    acces_envoye: 'bg-amber-50 text-amber-700 border-amber-100',
    confirme_par_expert: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    refuse_par_expert: 'bg-red-50 text-red-700 border-red-100',
    comite_confirme: 'bg-blue-50 text-blue-700 border-blue-100',
};

export default function Dashboard({
    expert = {},
    stats = {},
    affectations = [],
    notifications = [],
    notificationsNonLues = 0,
}) {
    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    const expertName = getExpertName(expert);

    const pendingAffectations = affectations.filter((item) =>
        ['en_attente_confirmation_expert', 'acces_envoye'].includes(item.status)
    );

    const confirmedAffectations = affectations.filter(
        (item) => item.status === 'confirme_par_expert'
    );

    const firstConfirmedDossier = confirmedAffectations?.[0]?.dossier || null;

    const dossierTargetUrl = firstConfirmedDossier?.id
        ? `/expert/dossiers/${firstConfirmedDossier.id}`
        : '/expert/dossiers';

    const acceptAffectation = (event, affectation) => {
        event.preventDefault();
        event.stopPropagation();

        router.post(`/expert/affectations/${affectation.id}/accept`, {}, {
            preserveScroll: true,
        });
    };

    const refuseAffectation = (event, affectation) => {
        event.preventDefault();
        event.stopPropagation();

        router.post(`/expert/affectations/${affectation.id}/refuse`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Tableau de bord — Expert" />

            <div className="min-h-screen bg-[#f6f8fc] px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-[96rem]">
                    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                                {today}
                            </p>

                            <h1 className="mt-3 text-4xl font-black text-slate-950">
                                {greeting}, {expertName} 👋
                            </h1>

                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                Bienvenue dans votre espace expert ANEAQ.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Connecté
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm">
                                <Clock3 size={16} />
                                {new Date().toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                    </div>

                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={FolderOpen}
                            label="Dossiers actifs"
                            value={metric(stats, 'dossiers_actifs', 'dossiersActifs')}
                            color="blue"
                            href="/expert/dossiers"
                        />

                        <StatCard
                            icon={ShieldCheck}
                            label="Évaluations en cours"
                            value={metric(stats, 'evaluations_en_cours', 'evaluationsEnCours')}
                            color="emerald"
                            href={dossierTargetUrl}
                        />

                        <StatCard
                            icon={Mail}
                            label="Invitations à confirmer"
                            value={metric(stats, 'invitations_en_attente', 'invitationsEnAttente')}
                            color="amber"
                            href="/expert/participations"
                        />

                        <StatCard
                            icon={FileText}
                            label="Rapports à déposer"
                            value={metric(stats, 'rapports_a_deposer', 'rapportsADeposer')}
                            color="red"
                            href={dossierTargetUrl}
                        />
                    </section>

                    <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_340px]">
                        <div className="space-y-8">
                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionHeader
                                    icon={Mail}
                                    iconColor="amber"
                                    title="Invitations à valider"
                                    description="Confirmez ou refusez votre participation."
                                    badge={`Total : ${pendingAffectations.length}`}
                                    badgeClass="bg-amber-50 text-amber-700"
                                    compact={pendingAffectations.length === 0}
                                />

                                <div className={pendingAffectations.length === 0 ? 'p-5' : 'space-y-5 p-6'}>
                                    {pendingAffectations.length > 0 ? (
                                        pendingAffectations.map((affectation) => (
                                            <AffectationCard
                                                key={affectation.id}
                                                affectation={affectation}
                                                onAccept={acceptAffectation}
                                                onRefuse={refuseAffectation}
                                            />
                                        ))
                                    ) : (
                                        <CompactEmptyState text="Aucune invitation en attente." />
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionHeader
                                    icon={FolderOpen}
                                    iconColor="blue"
                                    title="Dossiers confirmés"
                                    description="Vos dossiers validés et prêts pour l’évaluation."
                                    badge={`Total : ${confirmedAffectations.length}`}
                                    badgeClass="bg-blue-50 text-blue-700"
                                    actionLabel="Voir tous les dossiers"
                                    actionHref="/expert/dossiers"
                                />

                                <div className="p-6">
                                    {confirmedAffectations.length > 0 ? (
                                        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                                            <div className="hidden grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.5fr] bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:grid">
                                                <div>Dossier</div>
                                                <div>Établissement</div>
                                                <div>Date visite</div>
                                                <div>Comité</div>
                                                <div className="text-right">Action</div>
                                            </div>

                                            {confirmedAffectations.map((affectation) => (
                                                <ConfirmedRow
                                                    key={affectation.id}
                                                    affectation={affectation}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState text="Aucun dossier confirmé pour le moment." />
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionHeader
                                    icon={Bell}
                                    iconColor="blue"
                                    title="Notifications"
                                    description={`Non lues : ${notificationsNonLues ?? 0}`}
                                    actionLabel="Tout voir"
                                    actionHref="/expert/notifications"
                                    compact
                                />

                                <div className="space-y-3 p-6">
                                    {notifications?.length > 0 ? (
                                        notifications.slice(0, 5).map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="rounded-2xl bg-slate-50 p-4"
                                            >
                                                <p className="font-black text-slate-900">
                                                    {notification.titre || notification.title || 'Notification'}
                                                </p>

                                                <p className="mt-2 text-xs font-semibold text-slate-400">
                                                    {notification.created_at || '—'}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <CompactEmptyState text="Aucune notification." />
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionHeader
                                    icon={UserCheck}
                                    iconColor="emerald"
                                    title="Actions rapides"
                                    description="Accès rapide à vos espaces."
                                    compact
                                />

                                <div className="space-y-3 p-6">
                                    <QuickAction
                                        label="Mes invitations"
                                        href="/expert/participations"
                                        color="amber"
                                    />

                                    <QuickAction
                                        label="Mes dossiers"
                                        href="/expert/dossiers"
                                        color="blue"
                                    />

                                    <QuickAction
                                        label="Déposer rapport"
                                        href={dossierTargetUrl}
                                        color="emerald"
                                    />

                                    <QuickAction
                                        label="Mon historique"
                                        href="/expert/historique"
                                        color="slate"
                                    />
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <SectionHeader
                                    icon={CheckCircle2}
                                    iconColor="emerald"
                                    title="Workflow expert"
                                    description="Étapes principales de votre mission."
                                    compact
                                />

                                <div className="space-y-4 p-6">
                                    <WorkflowItem number="01" title="Accepter la mission" done />
                                    <WorkflowItem number="02" title="Consulter le dossier" active />
                                    <WorkflowItem number="03" title="Évaluation quantitative" />
                                    <WorkflowItem number="04" title="Visite et observations" />
                                    <WorkflowItem number="05" title="Rapport final" />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function ConfirmedRow({ affectation }) {
    const dossier = affectation.dossier || {};
    const etablissement = affectation.etablissement || {};
    const confirmedCount = affectation.comite_confirmed_count || 0;
    const totalCount = affectation.comite_total || 0;

    return (
        <div className="border-t border-slate-100 px-5 py-5 transition hover:bg-blue-50/40">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.5fr] lg:items-center">
                <div>
                    <div className="flex flex-wrap gap-2">
                        <StatusBadge
                            status={affectation.status}
                            label={affectation.status_label}
                        />

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                            {affectation.role_label || formatRole(affectation.role)}
                        </span>
                    </div>

                    <p className="mt-3 text-lg font-black text-slate-950">
                        {dossier.reference || 'Dossier'}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                        Statut : {dossier.statut || '—'}
                    </p>
                </div>

                <div>
                    <p className="font-black text-slate-800">
                        {etablissement.nom || '—'}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                        {etablissement.ville || '—'}
                    </p>
                </div>

                <div className="text-sm font-black text-slate-700">
                    {formatSimpleDate(dossier.date_visite)}
                </div>

                <div className="text-sm font-black text-slate-700">
                    {confirmedCount}/{totalCount} confirmé(s)
                </div>

                <div className="lg:text-right">
                    <Link
                        href={`/expert/dossiers/${dossier.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                        Ouvrir
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AffectationCard({ affectation, onAccept, onRefuse }) {
    const dossier = affectation.dossier || {};
    const etablissement = affectation.etablissement || {};
    const comite = affectation.comite || [];
    const confirmedCount = affectation.comite_confirmed_count || 0;
    const totalCount = affectation.comite_total || comite.length || 0;

    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-200 hover:bg-blue-50/40">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                            status={affectation.status}
                            label={affectation.status_label}
                        />

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                            {affectation.role_label || formatRole(affectation.role)}
                        </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-slate-950">
                        {dossier.reference || 'Dossier'}
                    </h3>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        {dossier.nom || '—'} • Statut : {dossier.statut || '—'}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <InfoLine
                            icon={MapPin}
                            label="Établissement"
                            value={etablissement.nom}
                        />

                        <InfoLine
                            icon={CalendarDays}
                            label="Date visite"
                            value={formatSimpleDate(dossier.date_visite)}
                        />

                        <InfoLine
                            icon={ShieldCheck}
                            label="Confidentialité"
                            value="Détails visibles après validation"
                        />

                        <InfoLine
                            icon={Users}
                            label="Comité"
                            value={`${confirmedCount}/${totalCount} confirmé(s)`}
                        />
                    </div>

                    {comite.length > 0 && (
                        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                            <h4 className="font-black text-slate-950">
                                Membres du comité
                            </h4>

                            <p className="mt-1 text-xs font-semibold text-slate-400">
                                Avant validation, seuls les noms sont affichés.
                            </p>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {comite.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">
                                            {initials(member.name)}
                                        </div>

                                        <p className="font-black text-slate-900">
                                            {member.name || 'Expert'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                    <button
                        type="button"
                        onClick={(event) => onRefuse(event, affectation)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                    >
                        <XCircle size={18} />
                        Refuser
                    </button>

                    <button
                        type="button"
                        onClick={(event) => onAccept(event, affectation)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                    >
                        <CheckCircle2 size={18} />
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, href }) {
    const colors = {
        blue: {
            icon: 'bg-blue-50 text-blue-600',
            line: 'border-b-blue-600',
            pill: 'bg-blue-50 text-blue-700',
        },
        emerald: {
            icon: 'bg-emerald-50 text-emerald-600',
            line: 'border-b-emerald-600',
            pill: 'bg-emerald-50 text-emerald-700',
        },
        amber: {
            icon: 'bg-amber-50 text-amber-600',
            line: 'border-b-amber-500',
            pill: 'bg-amber-50 text-amber-700',
        },
        red: {
            icon: 'bg-red-50 text-red-600',
            line: 'border-b-red-500',
            pill: 'bg-red-50 text-red-700',
        },
    };

    return (
        <Link
            href={href}
            className={`group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${colors[color].line} border-b-4`}
        >
            <div className="flex items-start justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color].icon}`}>
                    <Icon size={26} />
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-black ${colors[color].pill}`}>
                    Voir
                </span>
            </div>

            <p className="mt-8 text-5xl font-black text-slate-950">
                {value ?? 0}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-500">
                {label}
            </p>
        </Link>
    );
}

function SectionHeader({
    icon: Icon,
    iconColor = 'blue',
    title,
    description,
    badge,
    badgeClass = 'bg-slate-100 text-slate-600',
    actionLabel,
    actionHref,
    compact = false,
}) {
    return (
        <div className={`flex flex-col gap-4 border-b border-slate-100 ${compact ? 'p-5' : 'p-6'} sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex items-center gap-4">
                <IconBox icon={Icon} color={iconColor} small={compact} />

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

            <div className="flex items-center gap-3">
                {badge && (
                    <span className={`rounded-full px-4 py-2 text-sm font-black ${badgeClass}`}>
                        {badge}
                    </span>
                )}

                {actionLabel && actionHref && (
                    <Link
                        href={actionHref}
                        className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
                    >
                        {actionLabel}
                        <ChevronRight size={17} />
                    </Link>
                )}
            </div>
        </div>
    );
}

function InfoLine({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={18} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-sm font-black text-slate-700">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

function IconBox({ icon: Icon, color = 'blue', small = false }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        red: 'bg-red-50 text-red-600',
        slate: 'bg-slate-100 text-slate-600',
    };

    return (
        <div className={`flex items-center justify-center rounded-2xl ${colors[color]} ${small ? 'h-10 w-10' : 'h-14 w-14'}`}>
            <Icon size={small ? 20 : 26} />
        </div>
    );
}

function QuickAction({ label, href, color = 'blue' }) {
    const styles = {
        blue: 'border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-600',
        amber: 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-500',
        emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-600',
        slate: 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-800',
    };

    return (
        <Link
            href={href}
            className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-black transition hover:text-white ${styles[color]}`}
        >
            <span>{label}</span>
            <ChevronRight size={17} className="transition group-hover:translate-x-1" />
        </Link>
    );
}

function WorkflowItem({ number, title, done = false, active = false }) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
                    done
                        ? 'bg-emerald-600 text-white'
                        : active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                }`}
            >
                {done ? '✓' : number}
            </div>

            <p
                className={`text-sm font-black ${
                    done || active ? 'text-slate-900' : 'text-slate-400'
                }`}
            >
                {title}
            </p>
        </div>
    );
}

function StatusBadge({ status, label }) {
    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyles[status] || 'border-slate-100 bg-slate-50 text-slate-700'}`}>
            {label || formatStatus(status)}
        </span>
    );
}

function EmptyState({ text }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Clock3 className="mx-auto text-slate-300" size={34} />

            <p className="mt-3 text-sm font-bold text-slate-500">
                {text}
            </p>
        </div>
    );
}

function CompactEmptyState({ text }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-7 text-center">
            <Clock3 className="mx-auto text-slate-300" size={28} />

            <p className="mt-3 text-sm font-bold text-slate-500">
                {text}
            </p>
        </div>
    );
}

function metric(stats, snakeKey, camelKey) {
    return stats?.[snakeKey] ?? stats?.[camelKey] ?? 0;
}

function getExpertName(expert) {
    if (expert?.name) {
        return expert.name;
    }

    const fullName = `${expert?.prenom || ''} ${expert?.nom || ''}`.trim();

    return fullName || 'Expert';
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

function formatSimpleDate(value) {
    if (!value) {
        return 'Non planifiée';
    }

    try {
        return new Date(value).toLocaleDateString('fr-FR');
    } catch {
        return value;
    }
}

Dashboard.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;