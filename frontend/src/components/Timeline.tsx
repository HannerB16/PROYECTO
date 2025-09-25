interface TimelineStep {
  title: string;
  description: string;
  accent: string;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export const Timeline = ({ steps }: TimelineProps) => {
  return (
    <div className="relative ml-4 border-l border-white/10 pl-6">
      {steps.map((step, index) => (
        <div key={step.title} className="mb-10 last:mb-0">
          <div className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border border-white/30 bg-dark" />
          <p className="text-xs uppercase tracking-widest text-primary-200">Paso {index + 1}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{step.description}</p>
          <p className="mt-3 inline-block rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1 text-xs text-primary-100">
            {step.accent}
          </p>
        </div>
      ))}
    </div>
  );
};
