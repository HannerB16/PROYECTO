import { ReactNode } from 'react';

import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-dark text-slate-100">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary-500/30 blur-3xl" />
        </div>
        <Navbar />
        <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-16 lg:px-12">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};
