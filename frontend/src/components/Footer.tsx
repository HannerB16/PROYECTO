export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p>&copy; {new Date().getFullYear()} AuroraOps Labs. Innovación operativa sin límites.</p>
        <div className="flex items-center gap-4">
          <a href="https://github.com" className="transition hover:text-white" target="_blank" rel="noreferrer">
            Github
          </a>
          <a href="https://x.com" className="transition hover:text-white" target="_blank" rel="noreferrer">
            X / Twitter
          </a>
          <a href="mailto:hola@auroraops.io" className="transition hover:text-white">
            hola@auroraops.io
          </a>
        </div>
      </div>
    </footer>
  );
};
