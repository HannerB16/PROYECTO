import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export const GlowCard = ({ title, description, icon }: GlowCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="absolute -top-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl transition group-hover:bg-primary-500/30" />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-100">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};
