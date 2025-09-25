import { ChartBarIcon, CloudIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import { GlowCard } from '../components/GlowCard';
import { StatCard } from '../components/StatCard';
import { Timeline } from '../components/Timeline';

const HomePage = () => {
  return (
    <div className="space-y-24">
      <section className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-100">
            AuroraOps AI Fabric
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Orquesta tus operaciones con decisiones impulsadas por IA en tiempo real
          </h1>
          <p className="text-lg text-slate-300">
            Conecta equipos, automatiza procesos y descubre insights accionables con una plataforma
            enterprise preparada para escalar en la nube, edge y on-premise.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/workspaces"
              className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30"
            >
              Explorar workspaces
            </Link>
            <Link to="/analytics" className="text-sm font-semibold text-slate-200 hover:text-white">
              Ver analítica avanzada →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Equipos conectados" value="+120" trend="↑ 18% este trimestre" />
            <StatCard label="Automatización" value="67%" trend="+12% eficiencia" />
            <StatCard label="Tiempo de respuesta" value="-42%" trend="vs. benchmark" />
          </div>
        </div>
        <div className="rounded-3xl border border-primary-500/40 bg-gradient-to-br from-primary-500/10 via-black/40 to-black/80 p-8 shadow-xl shadow-primary-500/20">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-widest text-primary-100">Streaming de operaciones</p>
            <div className="rounded-2xl bg-black/60 p-6 text-sm text-slate-200 shadow-inner shadow-primary-500/20">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400">
                <span>Live feed</span>
                <span>Latencia &lt; 40ms</span>
              </div>
              <ul className="mt-4 space-y-4">
                {[
                  'IA detectó una anomalía en la cadena de suministro',
                  'Workflow de DevSecOps completado sin incidentes',
                  'Nuevo workspace habilitado en la región de Frankfurt'
                ].map((item) => (
                  <li key={item} className="rounded-xl border border-white/5 bg-white/5 p-4">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-slate-400">
              Integraciones nativas con Kubernetes, ServiceNow, Jira, Snowflake y tu stack favorito.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div>
          <h2 className="text-3xl font-semibold text-white">Arquitectura compuesta</h2>
          <p className="mt-3 max-w-3xl text-base text-slate-300">
            AuroraOps combina un data lake en streaming, un motor de analítica cognitiva y un panel operativo
            colaborativo para que puedas anticipar cualquier escenario.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <GlowCard
            title="Gemelos digitales"
            description="Simula tus operaciones en tiempo real con modelos predictivos que aprenden de cada evento."
            icon={<SparklesIcon className="h-6 w-6" />}
          />
          <GlowCard
            title="Infraestructura híbrida"
            description="Despliega workloads en la nube, edge o entornos soberanos sin perder observabilidad."
            icon={<CloudIcon className="h-6 w-6" />}
          />
          <GlowCard
            title="Analítica cognitiva"
            description="Recibe insights accionables combinando LLMs propietarios con tu conocimiento organizacional."
            icon={<ChartBarIcon className="h-6 w-6" />}
          />
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.8fr,1.2fr] lg:items-start">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">Cómo activamos tu próximo nivel</h2>
          <p className="text-base text-slate-300">
            Un playbook consultivo que combina tecnología y estrategia para habilitar operaciones autónomas en semanas.
          </p>
        </div>
        <Timeline
          steps={[
            {
              title: 'Mapeo inteligente de procesos',
              description: 'Auditamos flujos críticos y modelamos riesgos con IA generativa especializada en operaciones.',
              accent: 'Discovery 360°'
            },
            {
              title: 'Automatización contextual',
              description: 'Construimos pipelines sin fricción con políticas zero-trust y guardrails multi-región.',
              accent: 'Secure by design'
            },
            {
              title: 'Operaciones predictivas',
              description: 'Orquestamos decisiones con insights en tiempo real, copilotos y dashboards inmersivos.',
              accent: 'Always-on intelligence'
            }
          ]}
        />
      </section>
    </div>
  );
};

export default HomePage;
