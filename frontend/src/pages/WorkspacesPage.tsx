import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BuildingOffice2Icon, UserGroupIcon } from '@heroicons/react/24/outline';

import { GlowCard } from '../components/GlowCard';
import { StatCard } from '../components/StatCard';
import { Timeline } from '../components/Timeline';
import { fetchWorkspaces, Workspace } from '../lib/api';

const placeholderWorkspaces: Workspace[] = [
  {
    id: 1,
    name: 'Quantum Logistics HQ',
    description: 'Visibilidad end-to-end de inventarios, rutas y cumplimiento normativo.',
    industry: 'Logística',
    created_at: new Date().toISOString(),
    owner_id: 1
  },
  {
    id: 2,
    name: 'NeuraBank Digital',
    description: 'Gobierno de riesgos, KYC dinámico y respuesta ante fraude con IA explicable.',
    industry: 'Fintech',
    created_at: new Date().toISOString(),
    owner_id: 2
  }
];

const WorkspacesPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
    retry: false
  });

  const workspaces = useMemo(() => {
    if (error) {
      return placeholderWorkspaces;
    }
    return data && data.length > 0 ? data : placeholderWorkspaces;
  }, [data, error]);

  return (
    <div className="space-y-24">
      <section className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Centraliza tus workspaces críticos</h1>
            <p className="mt-3 max-w-3xl text-base text-slate-300">
              Diseña espacios que conectan equipos multidisciplinarios con controles de seguridad adaptativos y
              automatizaciones contextuales.
            </p>
          </div>
          <p className="text-xs uppercase tracking-widest text-primary-100">
            Datos simulados cuando no existe sesión activa
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <GlowCard
              key={workspace.id}
              title={workspace.name}
              description={workspace.description ?? 'Espacio operativo sin descripción.'}
              icon={<BuildingOffice2Icon className="h-6 w-6" />}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.7fr,1.3fr] lg:items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">Workflows con guardrails inteligentes</h2>
          <p className="text-base text-slate-300">
            Define políticas, roles dinámicos y automatizaciones multicloud. Los copilotos de AuroraOps recomiendan
            acciones y ejecutan playbooks de forma segura.
          </p>
        </div>
        <Timeline
          steps={[
            {
              title: 'Diseño colaborativo',
              description: 'Configura roles, políticas y fuentes de datos con un diseñador visual enriquecido por IA.',
              accent: 'Blueprinting IA'
            },
            {
              title: 'Orquestación unificada',
              description: 'Conecta pipelines de eventos, workflows low-code y sistemas legados en minutos.',
              accent: 'Orchestrator Mesh'
            },
            {
              title: 'Observabilidad total',
              description: 'KPIs, costos y riesgos consolidados con telemetría zero-copy y cumplimiento normativo.',
              accent: 'Governance Hub'
            }
          ]}
        />
      </section>

      <section>
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard label="Provisionamiento" value={isLoading ? 'Sync...' : '<5 min por workspace'} trend="Automático" />
          <StatCard label="Integraciones" value="+80" trend="Conectores listos" />
          <StatCard label="Usuarios activos" value="23k" trend="↑ 26% YoY" />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <GlowCard
            title="Cumplimiento dinámico"
            description="Motor de políticas que adapta normativas sectoriales en segundos."
            icon={<UserGroupIcon className="h-6 w-6" />}
          />
          <GlowCard
            title="Copilotos especializados"
            description="Asistentes autónomos para operaciones, finanzas, retail y energía con conocimiento contextual."
            icon={<BuildingOffice2Icon className="h-6 w-6" />}
          />
        </div>
      </section>
    </div>
  );
};

export default WorkspacesPage;
