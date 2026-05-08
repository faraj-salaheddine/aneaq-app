import { Head, Link, useForm } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import {
    ArrowLeft,
    FileText,
    UploadCloud,
    CheckCircle2,
} from 'lucide-react';

export default function Deposer({ dossier = {}, rapport = null }) {
    const form = useForm({
        titre: rapport?.titre || 'Rapport expert',
        commentaire: rapport?.commentaire || '',
        rapport: null,
    });

    const submit = (e) => {
        e.preventDefault();

        form.post(`/expert/rapports/${dossier.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Déposer rapport — Expert" />

            <div className="min-h-screen bg-[#f6f8fc] px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                                Rapport expert
                            </p>

                            <h1 className="mt-3 text-4xl font-black text-slate-950">
                                Déposer un rapport
                            </h1>

                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                Dossier : {dossier.reference || '—'}
                            </p>
                        </div>

                        <Link
                            href={`/expert/dossiers/${dossier.id}`}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={18} />
                            Retour au dossier
                        </Link>
                    </div>

                    {rapport && (
                        <div className="mb-6 rounded-[2rem] border border-emerald-100 bg-emerald-50 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                    <CheckCircle2 size={24} />
                                </div>

                                <div>
                                    <p className="font-black text-emerald-800">
                                        Un rapport existe déjà pour ce dossier.
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-emerald-600">
                                        Tu peux déposer un nouveau fichier pour le remplacer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <FileText size={26} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-slate-950">
                                    Fichier du rapport
                                </h2>

                                <p className="mt-1 text-sm font-semibold text-slate-400">
                                    Formats acceptés : PDF, DOC, DOCX.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Titre
                                </label>

                                <input
                                    value={form.data.titre}
                                    onChange={(e) => form.setData('titre', e.target.value)}
                                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    placeholder="Titre du rapport"
                                />

                                {form.errors.titre && (
                                    <p className="mt-2 text-sm font-bold text-red-600">
                                        {form.errors.titre}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Commentaire
                                </label>

                                <textarea
                                    value={form.data.commentaire}
                                    onChange={(e) => form.setData('commentaire', e.target.value)}
                                    rows={5}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    placeholder="Commentaire optionnel..."
                                />

                                {form.errors.commentaire && (
                                    <p className="mt-2 text-sm font-bold text-red-600">
                                        {form.errors.commentaire}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Rapport
                                </label>

                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
                                    <UploadCloud size={42} className="text-blue-600" />

                                    <p className="mt-4 text-sm font-black text-slate-800">
                                        Cliquez pour choisir un fichier
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                        PDF, DOC, DOCX — max 10 Mo
                                    </p>

                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={(e) => form.setData('rapport', e.target.files[0])}
                                    />
                                </label>

                                {form.data.rapport && (
                                    <p className="mt-3 text-sm font-black text-emerald-600">
                                        Fichier choisi : {form.data.rapport.name}
                                    </p>
                                )}

                                {form.errors.rapport && (
                                    <p className="mt-2 text-sm font-bold text-red-600">
                                        {form.errors.rapport}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-14 items-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                                >
                                    <UploadCloud size={18} />
                                    {form.processing ? 'Dépôt...' : 'Déposer le rapport'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}

Deposer.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;