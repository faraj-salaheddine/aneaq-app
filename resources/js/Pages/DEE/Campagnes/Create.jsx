import { Head, Link, useForm } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import {
    ArrowLeft,
    Check,
    ChevronDown,
    Layers3,
    Save,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

function Create({ vocations = [], defaultYear = null, annee = null }) {
    const [openVocationBox, setOpenVocationBox] = useState(false);
    const boxRef = useRef(null);

    const normalizedVocations = useMemo(() => {
        return vocations.map((item, index) => {
            const value = item.value ?? item.name ?? item.label ?? item.domaine_connaissances ?? String(index);
            const label = item.label ?? item.name ?? item.value ?? item.domaine_connaissances ?? 'Type inconnu';
            const count = item.count ?? item.etablissements_count ?? item.total ?? 0;

            return {
                value,
                label,
                count,
            };
        });
    }, [vocations]);

    const { data, setData, post, processing, errors } = useForm({
        annee: defaultYear ?? annee ?? new Date().getFullYear(),
        vocations: [],
        observation: '',
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (boxRef.current && !boxRef.current.contains(event.target)) {
                setOpenVocationBox(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedVocations = useMemo(() => {
        return normalizedVocations.filter((item) => data.vocations.includes(item.value));
    }, [normalizedVocations, data.vocations]);

    const selectedEtablissementsCount = selectedVocations.reduce((total, item) => {
        return total + Number(item.count ?? 0);
    }, 0);

    const toggleVocation = (value) => {
        if (data.vocations.includes(value)) {
            setData(
                'vocations',
                data.vocations.filter((item) => item !== value)
            );
        } else {
            setData('vocations', [...data.vocations, value]);
        }
    };

    const removeVocation = (value) => {
        setData(
            'vocations',
            data.vocations.filter((item) => item !== value)
        );
    };

    const submit = (e) => {
        e.preventDefault();

        post('/dee/campagnes', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Créer une vague" />

            <div className="min-h-screen bg-[#f6f8fc] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2934c8] via-[#2563eb] to-[#0891b2] p-8 text-white shadow-xl shadow-blue-900/20">
                        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-100">
                                    Nouvelle vague
                                </p>

                                <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-5xl">
                                    Créer une nouvelle vague
                                </h1>

                                <p className="mt-5 max-w-3xl text-sm font-medium leading-7 text-blue-50">
                                    Sélectionnez les types des établissements concernés. Après la création,
                                    les établissements correspondants seront ajoutés automatiquement à la vague.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        href="/dee/campagnes"
                                        className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-900 transition hover:bg-blue-50"
                                    >
                                        <ArrowLeft size={18} />
                                        Retour aux vagues
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={processing}
                                        className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white ring-1 ring-white/30 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Save size={18} />
                                        {processing ? 'Création...' : 'Créer la vague'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                        Année
                                    </p>

                                    <p className="mt-3 text-2xl font-black">
                                        {data.annee || '—'}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                        Types choisis
                                    </p>

                                    <p className="mt-3 text-2xl font-black">
                                        {selectedVocations.length}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-white/12 p-6 backdrop-blur">
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                        Établissements
                                    </p>

                                    <p className="mt-3 text-2xl font-black">
                                        {selectedEtablissementsCount}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {selectedVocations.length > 0 && (
                            <div className="mt-8 rounded-3xl bg-white/10 p-5 ring-1 ring-white/20">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                                    Vocations sélectionnées
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedVocations.map((item) => (
                                        <span
                                            key={item.value}
                                            className="rounded-full bg-white px-4 py-2 text-xs font-black text-blue-700"
                                        >
                                            {item.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <form onSubmit={submit} className="mt-8">
                        <div className="overflow-visible rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 p-7">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <Layers3 size={28} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                                            Formulaire principal
                                        </p>

                                        <h2 className="mt-2 text-2xl font-black text-slate-950">
                                            Informations de la vague
                                        </h2>

                                        <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                                            Choisissez les types d’établissements concernés par cette vague.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 p-7 lg:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-black text-slate-700">
                                        Année
                                    </label>

                                    <input
                                        type="number"
                                        value={data.annee}
                                        onChange={(e) => setData('annee', e.target.value)}
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    {errors.annee && (
                                        <p className="mt-2 text-sm font-bold text-red-600">
                                            {errors.annee}
                                        </p>
                                    )}
                                </div>

                                <div className="relative" ref={boxRef}>
                                    <label className="mb-2 block text-sm font-black text-slate-700">
                                        Vocation des établissements
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setOpenVocationBox((prev) => !prev)}
                                        className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-bold text-slate-700 outline-none transition hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    >
                                        <span>
                                            {selectedVocations.length === 0
                                                ? 'Choisir les types des établissements'
                                                : `${selectedVocations.length} type(s) sélectionné(s)`}
                                        </span>

                                        <ChevronDown size={20} className="text-slate-400" />
                                    </button>

                                    {errors.vocations && (
                                        <p className="mt-2 text-sm font-bold text-red-600">
                                            {errors.vocations}
                                        </p>
                                    )}

                                    {openVocationBox && (
                                        <div className="absolute left-0 right-0 top-[86px] z-50 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
                                            <div className="max-h-[320px] overflow-y-auto p-3">
                                                {normalizedVocations.length > 0 ? (
                                                    normalizedVocations.map((item) => {
                                                        const checked = data.vocations.includes(item.value);

                                                        return (
                                                            <button
                                                                key={item.value}
                                                                type="button"
                                                                onClick={() => toggleVocation(item.value)}
                                                                className={`mb-2 flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition ${
                                                                    checked
                                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                                                        : 'bg-slate-50 text-slate-700 hover:bg-blue-50'
                                                                }`}
                                                            >
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-black">
                                                                            {item.label}
                                                                        </p>

                                                                        {checked && (
                                                                            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                                                                                Sélectionné
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p
                                                                        className={`mt-1 text-xs font-bold ${
                                                                            checked
                                                                                ? 'text-blue-100'
                                                                                : 'text-slate-400'
                                                                        }`}
                                                                    >
                                                                        {item.count} établissement(s)
                                                                    </p>
                                                                </div>

                                                                <div
                                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                                                        checked
                                                                            ? 'border-white bg-white text-blue-600'
                                                                            : 'border-slate-300 bg-white text-transparent'
                                                                    }`}
                                                                >
                                                                    <Check size={18} strokeWidth={4} />
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                            <Layers3 size={28} />
                                                        </div>

                                                        <p className="mt-3 text-sm font-black text-slate-950">
                                                            Aucun type trouvé
                                                        </p>

                                                        <p className="mt-1 text-xs font-medium text-slate-500">
                                                            Vérifiez les types dans la table établissements.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('vocations', [])}
                                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    Effacer
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setOpenVocationBox(false)}
                                                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-700"
                                                >
                                                    Valider
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedVocations.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {selectedVocations.map((item) => (
                                                <button
                                                    key={item.value}
                                                    type="button"
                                                    onClick={() => removeVocation(item.value)}
                                                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    {item.label}
                                                    <X size={13} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 p-7">
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Observation
                                </label>

                                <textarea
                                    value={data.observation}
                                    onChange={(e) => setData('observation', e.target.value)}
                                    rows="6"
                                    placeholder="Contexte de la vague, objectifs, consignes DEE, remarques générales..."
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />

                                {errors.observation && (
                                    <p className="mt-2 text-sm font-bold text-red-600">
                                        {errors.observation}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col justify-end gap-3 border-t border-slate-100 p-7 sm:flex-row">
                                <Link
                                    href="/dee/campagnes"
                                    className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                                >
                                    Retour aux vagues
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#223270] px-8 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={18} />
                                    {processing ? 'Création...' : 'Créer la vague'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardShell>{page}</DashboardShell>;

export default Create;