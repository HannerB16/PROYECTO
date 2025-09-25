import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
}

export const StatCard = ({ label, value, trend }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-inner shadow-white/10"
    >
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {trend && <p className="mt-2 text-xs text-emerald-400">{trend}</p>}
    </motion.div>
  );
};
