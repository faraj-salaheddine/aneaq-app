import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

export default function SelectionEtablissements({ campagnes = [] }) {
    return (
        <>
            <Head title="Sélection des établissements" />

            <DashboardShell
                title="Sélection des établissements"
                subtitle="Workflow DEE"
                action={
                    <Link
                        href="/dee/campagnes/create"
                        className="rounded-xl bg-[#223270] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1b285a]"
                    >
                        Nouvelle vague
                    </Link>
                }
            >
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm text-slate-600">
                                    <th className="px-6 py-4">Référence</th>
                                    <th className="px-6 py-4">Année</th>
                                    <th className="px-6 py-4">Vocation</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Établissements</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campagnes.map((campagne) => (
                                    <tr key={campagne.id} className="border-t border-slate-100 text-sm">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{campagne.reference}</td>
                                        <td className="px-6 py-4 text-slate-700">{campagne.annee}</td>
                                        <td className="px-6 py-4 text-slate-700">{campagne.vocation}</td>
                                        <td className="px-6 py-4 text-slate-700">{campagne.statut}</td>
                                        <td className="px-6 py-4 text-slate-700">{campagne.etablissements_count}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    href={`/dee/campagnes/${campagne.id}/etablissements`}
                                                    className="font-semibold text-blue-700 hover:text-blue-900"
                                                >
                                                    Gérer la sélection
                                                </Link>
                                                <Link
                                                    href={`/dee/campagnes/${campagne.id}`}
                                                    className="font-semibold text-slate-700 hover:text-slate-900"
                                                >
                                                    Voir la vague
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {campagnes.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                                            Aucune vague disponible.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardShell>
        </>
    );
}
