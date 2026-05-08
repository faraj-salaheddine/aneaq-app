import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import {
    ArrowLeft,
    ArrowUpRight,
    Building2,
    CalendarDays,
    ClipboardList,
    FileText,
    FolderKanban,
    Mail,
    MapPin,
    ShieldCheck,
    Sparkles,
    UserCheck,
} from 'lucide-react';

function Show({
    etablissement,
    stats = {},
    campagnes = [],
    dossiers = [],
    documents = [],
    experts = [],
    timeline = [],
}) {
    return (
        <>
            <Head title={`Historique - ${etablissement.nom}`} />

            <div className="min-h-screen bg-[#f6f8fc] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[95rem]">
                    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">
                                Historique établissement
                            </p>

                            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                                {etablissement.nom}
                            </h1>

                            <p className="mt-3 max-w-4xl text-sm font-medium leading-7 text-slate-500">
                                Vue complète des activités liées à cet établissement : vagues, dossiers,
                                documents déposés, experts affectés et événements récents.
                            </p>
                        </div>

                        <Link
                            href="/dee/etablissements"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={18} />
                            Retour aux établissements
                        </Link>
                    </div>

                    <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1d2b9f] via-[#2563eb] to-[#0891b2] text-white shadow-2xl shadow-blue-900/20">
                        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.95fr] lg:p-10">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                    <Sparkles size={15} />
                                    Fiche établissement
                                </div>

                                <h2 className="mt-6 text-5xl font-black tracking-tight">
                                    {etablissement.nom}
                                </h2>

                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    <InfoGlass icon={MapPin} label="Ville" value={etablissement.ville} />
                                    <InfoGlass icon={Building2} label="Université" value={etablissement.universite} />
                                    <InfoGlass icon={Mail} label="Email" value={etablissement.email} />
                                    <InfoGlass icon={ShieldCheck} label="Type" value={etablissement.type} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <StatGlass label="Activités" value={stats.activites} />
                                <StatGlass label="Vagues" value={stats.campagnes} />
                                <StatGlass label="Dossiers" value={stats.dossiers} />
                                <StatGlass label="Documents" value={stats.documents} />
                                <StatGlass label="Experts" value={stats.experts} wide />
                            </div>
                        </div>
                    </section>

                    <div className="mt-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionTitle
                                icon={ClipboardList}
                                kicker="Timeline"
                                title="Toutes les activités"
                                total={timeline.length}
                            />

                            <div className="mt-8 space-y-5">
                                {timeline.length > 0 ? (
                                    timeline.map((item, index) => (
                                        <TimelineItem key={index} item={item} />
                                    ))
                                ) : (
                                    <EmptyState text="Aucune activité trouvée pour cet établissement." />
                                )}
                            </div>
                        </section>

                        <div className="space-y-8">
                            <HistoryCard
                                title="Vagues liées"
                                icon={CalendarDays}
                                items={campagnes}
                                renderItem={(item) => (
                                    <HistoryLine
                                        title={item.reference}
                                        description={`Année : ${item.annee} • Statut : ${item.statut}`}
                                        date={item.created_at}
                                        url={item.campagne_id ? `/dee/campagnes/${item.campagne_id}` : null}
                                    />
                                )}
                            />

                            <HistoryCard
                                title="Dossiers créés"
                                icon={FolderKanban}
                                items={dossiers}
                                renderItem={(item) => (
                                    <HistoryLine
                                        title={item.reference}
                                        description={`Statut : ${item.statut} • Date visite : ${item.date_visite || '—'}`}
                                        date={item.created_at}
                                        url={`/dee/dossiers/${item.id}`}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="mt-8 grid gap-8 xl:grid-cols-2">
                        <HistoryCard
                            title="Documents déposés"
                            icon={FileText}
                            items={documents}
                            renderItem={(item) => (
                                <HistoryLine
                                    title={item.nom}
                                    description={`Type : ${item.type} • Dossier : ${item.dossier_reference}`}
                                    date={item.created_at}
                                    url={item.dossier_id ? `/dee/dossiers/${item.dossier_id}` : null}
                                />
                            )}
                        />

                        <HistoryCard
                            title="Experts affectés"
                            icon={UserCheck}
                            items={experts}
                            renderItem={(item) => (
                                <HistoryLine
                                    title={item.expert_name}
                                    description={`Rôle : ${formatRole(item.role)} • Statut : ${formatStatus(item.status)} • Dossier : ${item.dossier_reference}`}
                                    date={item.created_at}
                                    url={item.dossier_id ? `/dee/dossiers/${item.dossier_id}` : null}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoGlass({ icon: Icon, label, value }) {
    return (
        <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
            <Icon size={24} />

            <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                {label}
            </p>

            <p className="mt-2 break-words text-base font-black text-white">
                {value || '—'}
            </p>
        </div>
    );
}

function StatGlass({ label, value, wide = false }) {
    return (
        <div className={`rounded-3xl bg-white/12 p-6 backdrop-blur ${wide ? 'sm:col-span-2' : ''}`}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                {label}
            </p>

            <p className="mt-3 text-5xl font-black text-white">
                {value ?? 0}
            </p>
        </div>
    );
}

function SectionTitle({ icon: Icon, kicker, title, total }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon size={26} />
                </div>

                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">
                        {kicker}
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                        {title}
                    </h2>
                </div>
            </div>

            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500">
                Total : {total ?? 0}
            </span>
        </div>
    );
}

function TimelineItem({ item }) {
    const content = (
        <div className="relative rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-200 hover:bg-blue-50/60">
            <div className="flex items-start gap-5">
                <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                    {iconLetter(item.type)}
                </div>

                <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-black text-slate-950">
                            {item.title}
                        </h3>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-400">
                            {item.date || 'Date non définie'}
                        </span>
                    </div>

                    <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                        {item.description}
                    </p>
                </div>

                {item.url && (
                    <ArrowUpRight size={18} className="mt-2 text-blue-500" />
                )}
            </div>
        </div>
    );

    if (item.url) {
        return <Link href={item.url}>{content}</Link>;
    }

    return content;
}

function HistoryCard({ title, icon: Icon, items, renderItem }) {
    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Icon size={26} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-slate-950">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-slate-400">
                            Total : {items.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-7 space-y-4">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={`${title}-${item.id}`}>
                            {renderItem(item)}
                        </div>
                    ))
                ) : (
                    <EmptyState text="Aucun élément trouvé." />
                )}
            </div>
        </section>
    );
}

function HistoryLine({ title, description, date, url }) {
    const content = (
        <div className="rounded-3xl bg-slate-50 p-5 transition hover:bg-blue-50">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-black text-slate-950">
                        {title || '—'}
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        {description}
                    </p>

                    <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        {date || 'Date non définie'}
                    </p>
                </div>

                {url && <ArrowUpRight size={18} className="text-blue-500" />}
            </div>
        </div>
    );

    if (url) {
        return <Link href={url}>{content}</Link>;
    }

    return content;
}

function EmptyState({ text }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm font-bold text-slate-500">
                {text}
            </p>
        </div>
    );
}

function iconLetter(type) {
    const values = {
        campagne: 'V',
        dossier: 'D',
        document: 'F',
        expert: 'E',
    };

    return values[type] || 'A';
}

function formatRole(role) {
    const labels = {
        expert: 'Expert',
        chef_comite: 'Chef de comité',
    };

    return labels[role] || role || '—';
}

function formatStatus(status) {
    const labels = {
        en_attente_confirmation_dee: 'En attente confirmation DEE',
        acces_envoye: 'Accès envoyé',
        confirme_par_expert: 'Confirmé par expert',
    };

    return labels[status] || status || '—';
}

Show.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default Show;