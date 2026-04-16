import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react'; // Icône pour le retour à l'accueil

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false, // Gestion du "Se souvenir de moi"
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans relative">
            <Head title="Connexion - ANEAQ" />

            {/* Bouton Retour à l'accueil */}
            <div className="absolute top-6 left-6">
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors"
                >
                    <ArrowLeft size={16} /> Retour à l'accueil
                </Link>
            </div>

            {/* En-tête avec Vrai Logo et Titre */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <img 
                        src="/images/logo-aneaq.png" 
                        alt="Logo ANEAQ" 
                        className="h-20 bg-white p-2 rounded-2xl shadow-md"
                        onError={(e) => e.target.style.display='none'} // Sécurité si l'image manque
                    />
                </div>
                <h1 className="text-3xl font-black text-blue-950 tracking-tight">ANEAQ</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Portail de l'Évaluation Institutionnelle
                </p>
            </div>

            {/* Carte de Connexion */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                    SE CONNECTER
                </h2>

                {/* Message de statut (ex: mot de passe réinitialisé avec succès) */}
                {status && <div className="mb-6 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg text-center">{status}</div>}

                <form onSubmit={submit} className="space-y-6">
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
                            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} focus:ring transition-all bg-slate-50 focus:bg-white`}
                            placeholder="nom@exemple.com"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-xs font-semibold mt-2">{errors.email}</p>}
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
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
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
                            className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} focus:ring transition-all bg-slate-50 focus:bg-white`}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <p className="text-red-500 text-xs font-semibold mt-2">{errors.password}</p>}
                    </div>

                    {/* Se souvenir de moi + CAPTCHA Visuel */}
                    <div className="flex flex-col gap-4">
                        {/* Checkbox "Se souvenir de moi" (Fonctionnel pour Laravel) */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm font-medium text-slate-600">Se souvenir de moi</span>
                        </label>

                        {/* Zone CAPTCHA (Simulée pour le design, comme tu l'as demandé) */}
                        <div className="border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center gap-4 shadow-sm w-full">
                            <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            <span className="text-sm font-medium text-slate-700 flex-grow">Je ne suis pas un robot</span>
                            <div className="flex flex-col items-center">
                                <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-7" />
                                <span className="text-[9px] text-slate-400 mt-1 font-semibold">reCAPTCHA</span>
                            </div>
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 ${processing && 'opacity-75 cursor-not-allowed'}`}
                    >
                        {processing ? (
                            <span className="animate-pulse">Connexion en cours...</span>
                        ) : (
                            "Se connecter"
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                © {new Date().getFullYear()} ANEAQ - Division de l'Évaluation des Établissements
            </div>
        </div>
    );
}