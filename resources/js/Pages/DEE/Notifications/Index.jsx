import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, ClipboardCheck, ExternalLink, FileText, FolderOpen, HelpCircle, Info, Paperclip, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import DashboardShell from '@/Layouts/DashboardShell';

const TYPE_META = {
    document: { label: 'Document', icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    annexe:   { label: 'Annexe', icon: Paperclip, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    question: { label: 'Question', icon: HelpCircle, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    info:     { label: 'Information', icon: Info, color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    evaluation_annexe: { label: 'Évaluation', icon: ClipboardCheck, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    general:  { label: 'Dossier', icon: FolderOpen, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
};

const fallbackMeta = TYPE_META.general;

export default function Index({ notifications, nonLues = 0 }) {
    const { flash } = usePage().props;
    const [filter, setFilter] = useState('all');
    const items = notifications?.data ?? [];

    const filteredItems = useMemo(() => items.filter((notification) => {
        if (filter === 'unread') return !notification.lu;
        if (filter === 'read') return notification.lu;
        return true;
    }), [filter, items]);

    const markAsRead = (notification) => {
        router.patch(`/dee/notifications/${notification.id}/lire`, {}, {
            preserveScroll: true,
        });
    };

    const openDossier = (notification) => {
        if (!notification.dossier_url) return;

        if (notification.lu) {
            router.visit(notification.dossier_url);
            return;
        }

        router.patch(`/dee/notifications/${notification.id}/lire`, {}, {
            preserveScroll: true,
            onSuccess: () => router.visit(notification.dossier_url),
        });
    };

    const markAllAsRead = () => {
        router.patch('/dee/notifications/tout-lire', {}, {
            preserveScroll: true,
        });
    };

    const clearNotifications = () => {
        if (!window.confirm('Supprimer définitivement toutes les notifications ?')) return;

        router.delete('/dee/notifications/vider', {
            preserveScroll: true,
        });
    };

    const filters = [
        { key: 'all', label: 'Toutes', count: items.length },
        { key: 'unread', label: 'Non lues', count: nonLues },
        { key: 'read', label: 'Lues', count: items.filter((item) => item.lu).length },
    ];

    return (
        <>
            <Head title="Notifications DEE" />

            <div className="min-h-screen bg-slate-100 px-6 py-7 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Espace DEE</p>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
                                    <Bell size={22} />
                                    {nonLues > 0 && (
                                        <span className="absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border-2 border-slate-100 bg-red-600 px-1 text-[10px] font-black text-white">
                                            {nonLues > 99 ? '99+' : nonLues}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Ajouts et mises à jour reçus dans les dossiers des établissements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {nonLues > 0 && (
                                <button type="button" onClick={markAllAsRead}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100">
                                    <CheckCheck size={17} />
                                    Tout marquer comme lu
                                </button>
                            )}
                            {notifications?.total > 0 && (
                                <button type="button" onClick={clearNotifications}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100">
                                    <Trash2 size={17} />
                                    Vider les notifications
                                </button>
                            )}
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                        <StatCard label="Notifications affichées" value={items.length} color="text-blue-700" bg="bg-blue-50" />
                        <StatCard label="Non lues" value={nonLues} color="text-red-700" bg="bg-red-50" />
                        <StatCard label="Lues sur cette page" value={items.filter((item) => item.lu).length} color="text-emerald-700" bg="bg-emerald-50" />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
                            {filters.map((item) => (
                                <button key={item.key} type="button" onClick={() => setFilter(item.key)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                                        filter === item.key
                                            ? 'bg-blue-700 text-white'
                                            : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                                    }`}>
                                    {item.label} · {item.count}
                                </button>
                            ))}
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <Bell className="mx-auto text-slate-300" size={36} />
                                <p className="mt-3 text-sm font-black text-slate-600">Aucune notification dans cette catégorie.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredItems.map((notification) => {
                                    const meta = TYPE_META[notification.type] ?? fallbackMeta;
                                    const Icon = meta.icon;

                                    return (
                                        <article key={notification.id}
                                            className={`flex flex-col gap-4 px-5 py-4 transition sm:flex-row sm:items-start ${notification.lu ? 'bg-white' : 'bg-blue-50/40'}`}>
                                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${meta.bg} ${meta.border} ${meta.color}`}>
                                                <Icon size={19} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${meta.bg} ${meta.border} ${meta.color}`}>
                                                        {meta.label}
                                                    </span>
                                                    {!notification.lu && (
                                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-700">
                                                            Nouveau
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-medium text-slate-400">{notification.created_at}</span>
                                                </div>

                                                <h2 className="mt-2 text-sm font-black text-slate-900">{notification.titre}</h2>
                                                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                                            </div>

                                            <div className="flex shrink-0 flex-wrap gap-2">
                                                {!notification.lu && (
                                                    <button type="button" onClick={() => markAsRead(notification)}
                                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100">
                                                        Marquer lu
                                                    </button>
                                                )}
                                                {notification.dossier_url && (
                                                    <button type="button" onClick={() => openDossier(notification)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-800">
                                                        Voir dossier
                                                        <ExternalLink size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {notifications?.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-center gap-3">
                            {notifications.prev_page_url && (
                                <Link href={notifications.prev_page_url} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
                                    Précédent
                                </Link>
                            )}
                            <span className="text-xs font-bold text-slate-500">
                                Page {notifications.current_page} / {notifications.last_page}
                            </span>
                            {notifications.next_page_url && (
                                <Link href={notifications.next_page_url} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
                                    Suivant
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({ label, value, color, bg }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`inline-flex min-w-10 items-center justify-center rounded-xl px-3 py-2 text-xl font-black ${color} ${bg}`}>
                {value}
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
        </div>
    );
}

Index.layout = (page) => <DashboardShell>{page}</DashboardShell>;
