import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

export default function Recommandations({ dossiers = [] }) {
    return (
        <>
            <Head title="Suivi des recommandations" />

            <DashboardShell
                title="Suivi des recommandations"
                subtitle="Workflow DEE"
            >
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Cette vue centralise les dossiers les plus avancés pour le suivi des recommandations.
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm text-slate-600">
                                    <th className="px-6 py-4">Référence</th>
                                    <th className="px-6 py-4">Établissement</th>
                                    <th className="px-6 py-4">Vague</th>
                                    <th className="px-6 py-4">Experts</th>
                                    <th className="px-6 py-4">Documents</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dossiers.map((dossier) => (
                                    <tr key={dossier.id} className="border-t border-slate-100 text-sm">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{dossier.reference}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.etablissement || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.campagne || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.experts_count}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.documents_count}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.statut}</td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dee/dossiers/${dossier.id}`}
                                                className="font-semibold text-blue-700 hover:text-blue-900"
                                            >
                                                Suivre le dossier
                                            </Link>
                                        </td>
                                    </tr>
                                ))}

                                {dossiers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-sm text-slate-500">
                                            Aucun dossier concerné pour le suivi des recommandations.
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
