import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react'; // Assure-toi d'avoir installé lucide-react

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        // Ici, tu pourras ajouter la logique de validation du CAPTCHA plus tard
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
            <Head title="Connexion - ANEAQ" />

            {/* En-tête avec Logo et Titre */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    {/* Remplace ceci par ta balise img avec le vrai logo si tu l'as */}
                    <div className="bg-blue-900 p-3 rounded-xl shadow-lg">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-blue-950 tracking-tight">ANEAQ</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Système de Gestion de l'Évaluation Institutionnelle
                </p>
            </div>

            {/* Carte de Connexion */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                    SE CONNECTER
                </h2>

                {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                <form onSubmit={submit} className="space-y-5">
                    {/* Champ Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                            Adresse Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all bg-slate-50 focus:bg-white"
                            placeholder="nom@exemple.com"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
                    </div>

                    {/* Champ Mot de passe */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                Mot de passe
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all bg-slate-50 focus:bg-white"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password}</p>}
                    </div>

                    {/* Zone CAPTCHA (Simulée pour le design) */}
                    <div className="flex justify-center py-2">
                        <div className="border border-slate-200 bg-slate-50 rounded-lg p-3 flex items-center gap-4 shadow-sm w-full max-w-[300px]">
                            <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            <span className="text-sm font-medium text-slate-700 flex-grow">Je ne suis pas un robot</span>
                            <div className="flex flex-col items-center">
                                {/* Icône simulant le logo reCAPTCHA */}
                                <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8" />
                                <span className="text-[10px] text-slate-400 mt-1">reCAPTCHA</span>
                            </div>
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 transition-all transform active:scale-[0.98] ${processing && 'opacity-75 cursor-not-allowed'}`}
                    >
                        Se connecter
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                © {new Date().getFullYear()} ANEAQ - Division de l'Évaluation des Établissements (DEE)
            </div>
        </div>
    );
}