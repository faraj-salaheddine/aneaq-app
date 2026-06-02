import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const CHART_COLORS = ['#1c5fdc', '#0e7c5b', '#b35c00', '#5046a8', '#c0344a', '#0f766e', '#7c3aed', '#475569'];
const TOOLTIP_STYLE = {
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    boxShadow: '0 10px 24px rgba(15, 23, 42, .1)',
    fontSize: 12,
};

const scoreColor = (score) => score >= 67 ? '#0e7c5b' : score >= 34 ? '#b35c00' : '#c0344a';
const scoreTooltip = (value) => [`${value}%`, 'Conformité'];

function conformityStats(notes) {
    const evaluatedNotes = notes.filter((note) => note !== null && note !== undefined);
    const points = evaluatedNotes.reduce((sum, note) => sum + Number(note), 0);

    return {
        score: notes.length > 0 ? Math.round((points / (notes.length * 3)) * 100) : 0,
        evaluated: evaluatedNotes.length,
        total: notes.length,
    };
}

function referenceNotes(reference) {
    return reference.criteres.flatMap((critere) =>
        critere.preuves.map((preuve) => preuve.note ?? null)
    );
}

function buildConformitySummary(grouped) {
    const domains = grouped.map((domaine) => {
        const references = domaine.champs.flatMap((champ) =>
            champ.references.map((reference) => {
                const notes = referenceNotes(reference);

                return {
                    code: reference.reference,
                    label: reference.reference_label,
                    notes,
                    ...conformityStats(notes),
                };
            })
        );
        const elements = domaine.champs.map((champ) => {
            const notes = champ.references.flatMap(referenceNotes);

            return {
                code: champ.champ,
                label: champ.champ_label,
                notes,
                ...conformityStats(notes),
            };
        });
        const notes = elements.flatMap((element) => element.notes);

        return {
            code: domaine.domaine,
            label: domaine.domaine_label,
            elements,
            references,
            notes,
            ...conformityStats(notes),
        };
    });
    const notes = domains.flatMap((domaine) => domaine.notes);

    return {
        domains,
        ...conformityStats(notes),
    };
}

function splitRadarLabel(label, maxLength = 24) {
    return String(label).split(' ').reduce((lines, word) => {
        const currentLine = lines[lines.length - 1];

        if (!currentLine || `${currentLine} ${word}`.length > maxLength) {
            lines.push(word);
        } else {
            lines[lines.length - 1] = `${currentLine} ${word}`;
        }

        return lines;
    }, []);
}

function RadarLabelTick({ payload, x, y, textAnchor }) {
    const lines = splitRadarLabel(payload.value);

    return (
        <text x={x} y={y} textAnchor={textAnchor} fill="#64748b" fontSize={10} fontWeight={700}>
            {lines.map((line, index) => (
                <tspan key={`${line}_${index}`} x={x} dy={index === 0 ? -((lines.length - 1) * 6) : 12}>
                    {line}
                </tspan>
            ))}
        </text>
    );
}

function ScoreBox({ score }) {
    return (
        <span className="min-w-20 rounded-md px-3 py-1.5 text-center font-mono text-sm font-black text-white"
            style={{ background: scoreColor(score) }}>
            {score}%
        </span>
    );
}

function ConformityRadar({ data, angleKey = 'code', detailedLabels = false }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart
                data={data}
                outerRadius={detailedLabels ? '56%' : '68%'}
                margin={detailedLabels ? { top: 28, right: 78, bottom: 28, left: 78 } : undefined}
            >
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis
                    dataKey={angleKey}
                    tick={detailedLabels ? <RadarLabelTick /> : { fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                    angle={90}
                    axisLine={false}
                    domain={[0, 100]}
                    tickCount={6}
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    tickFormatter={(value) => `${value}%`}
                />
                <Radar name="Conformité" dataKey="score" stroke="#1c5fdc" fill="#1c5fdc" fillOpacity={0.16} strokeWidth={3} />
                <Tooltip formatter={scoreTooltip} contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
        </ResponsiveContainer>
    );
}

function ReferencesBarChart({ references }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={references} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={scoreTooltip} labelFormatter={(label) => `Référence ${label}`} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {references.map((reference, index) => (
                        <Cell key={reference.code} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function ChartTitle({ children }) {
    return <p className="mb-2 text-center text-xs font-black text-slate-700">{children}</p>;
}

export default function AnnexesConformityDashboard({ grouped }) {
    const summary = buildConformitySummary(grouped);

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100 px-5 py-3">
                    <h3 className="flex-1 text-center text-sm font-black text-slate-900">Conformité globale</h3>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Score</span>
                    <ScoreBox score={summary.score} />
                </div>
                <p className="border-b border-slate-100 px-5 py-3 text-center text-xs text-slate-500">
                    Points obtenus / note maximale de toutes les preuves du dossier. {summary.evaluated}/{summary.total} preuves évaluées.
                </p>

                <div className="grid gap-5 p-5 xl:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <ChartTitle>Score de conformité par domaine</ChartTitle>
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-left text-slate-500">
                                    <th className="border border-slate-200 px-3 py-2 font-black">Domaines d'évaluation</th>
                                    <th className="border border-slate-200 px-3 py-2 text-right font-black">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.domains.map((domaine) => (
                                    <tr key={domaine.code}>
                                        <td className="border border-slate-200 px-3 py-2 text-slate-700">
                                            <span className="font-mono font-black text-blue-600">{domaine.code}</span> — {domaine.label}
                                        </td>
                                        <td className="border border-slate-200 px-3 py-2 text-right font-black" style={{ color: scoreColor(domaine.score) }}>
                                            {domaine.score}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="min-w-0">
                        <ChartTitle>Score de conformité par domaine</ChartTitle>
                        <div className="h-[350px]">
                            <ConformityRadar data={summary.domains} angleKey="label" detailedLabels />
                        </div>
                    </div>
                </div>
            </section>

            {summary.domains.map((domaine) => (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={domaine.code}>
                    <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100 px-5 py-3">
                        <h3 className="flex-1 text-sm font-black text-slate-900">Domaine {domaine.code} : {domaine.label}</h3>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Score</span>
                        <ScoreBox score={domaine.score} />
                    </div>
                    <p className="border-b border-slate-100 px-5 py-3 text-center text-xs text-slate-500">
                        {domaine.evaluated}/{domaine.total} preuves évaluées dans ce domaine
                    </p>

                    <div className={`grid gap-5 p-5 ${domaine.elements.length >= 3 ? 'xl:grid-cols-[0.85fr_1.15fr]' : ''}`}>
                        {domaine.elements.length >= 3 && (
                            <div className="min-w-0">
                                <ChartTitle>Taux de conformité par élément</ChartTitle>
                                <div className="h-[290px]">
                                    <ConformityRadar data={domaine.elements} angleKey="label" detailedLabels />
                                </div>
                            </div>
                        )}
                        <div className={`min-w-0 ${domaine.elements.length < 3 ? 'mx-auto w-full max-w-3xl' : ''}`}>
                            <ChartTitle>Taux de conformité par référence</ChartTitle>
                            <div className="h-[290px]">
                                <ReferencesBarChart references={domaine.references} />
                            </div>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}
