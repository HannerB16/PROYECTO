import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowTrendingUpIcon, BoltIcon, CpuChipIcon } from '@heroicons/react/24/outline';

import { GlowCard } from '../components/GlowCard';
import { StatCard } from '../components/StatCard';
import { fetchAnalytics } from '../lib/api';

const AnalyticsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: fetchAnalytics,
    retry: false
  });

  const overview = useMemo(
    () =>
      data ?? {
        health_index: 0.86,
        velocity_index: 1.24,
        automation_rate: 0.71,
        ai_recommendations: [
          'Habilita copilotos de resiliencia en tu workspace financiero',
          'Activa escenarios what-if para la cadena de suministro europea',
          'Sincroniza datos de clima para anticipar disrupciones logísticas'
        ],
        highlights: [
          { label: 'Salud de proyectos', value: 0.86, trend: 0.12 },
          { label: 'Velocidad de entrega', value: 1.24, trend: 0.08 },
          { label: 'Automatización', value: 0.71, trend: 0.21 }
        ]
      },
    [data]
  );

  return (
    <div className="space-y-20">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold text-white">Inteligencia operativa aumentada</h1>
        <p className="max-w-3xl text-base text-slate-300">
          Observa métricas críticas, identifica riesgos emergentes y recibe recomendaciones accionables generadas por
          modelos híbridos de AuroraOps (LLMs, grafos de conocimiento y analítica en streaming).
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Aurora Health Index"
          value={`${Math.round(overview.health_index * 100)}%`}
          trend={`Δ ${Math.round((overview.highlights[0]?.trend ?? 0) * 100)} puntos`}
        />
        <StatCard
          label="Velocity Pulse"
          value={`${overview.velocity_index.toFixed(2)}x`}
          trend={`Forecast ${(overview.highlights[1]?.trend ?? 0).toFixed(2)}x`}
        />
        <StatCard
          label="Automation Boost"
          value={`${Math.round(overview.automation_rate * 100)}%`}
          trend={`Bots activos ${(overview.highlights[2]?.trend ?? 0).toFixed(2)}x`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6 rounded-3xl border border-primary-500/30 bg-black/40 p-8">
          <h2 className="text-2xl font-semibold text-white">Recomendaciones prioritarias</h2>
          <ul className="space-y-4 text-sm text-slate-200">
            {overview.ai_recommendations.map((item) => (
              <li key={item} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                {item}
              </li>
            ))}
          </ul>
          {error && (
            <p className="text-xs text-amber-300">
              No se detectó token activo. Mostrando simulación de IA.
            </p>
          )}
        </div>
        <div className="grid gap-6">
          <GlowCard
            title="Gemelo operacional"
            description="Visualiza escenarios hipotéticos con modelos que se recalibran minuto a minuto."
            icon={<CpuChipIcon className="h-6 w-6" />}
          />
          <GlowCard
            title="Predicción de demanda"
            description="Fusiones de datos en streaming y grafos contextuales para anticipar demanda y supply shocks."
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
          />
          <GlowCard
            title="Automatización cognitiva"
            description="Copilotos que ejecutan playbooks end-to-end respetando compliance y objetivos de negocio."
            icon={<BoltIcon className="h-6 w-6" />}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold text-white">Data Stories en streaming</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {overview.highlights.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400">{metric.label}</p>
              <p className="mt-3 text-4xl font-semibold text-white">{metric.value.toFixed(2)}</p>
              {metric.trend !== undefined && (
                <p className="mt-2 text-xs text-emerald-400">Tendencia {metric.trend.toFixed(2)}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {isLoading && <p className="text-sm text-slate-400">Sincronizando datos en vivo...</p>}
    </div>
  );
};

export default AnalyticsPage;
