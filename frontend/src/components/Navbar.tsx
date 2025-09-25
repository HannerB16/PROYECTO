import { Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Inicio', to: '/' },
  { name: 'Workspaces', to: '/workspaces' },
  { name: 'Analítica', to: '/analytics' }
];

export const Navbar = () => {
  return (
    <Disclosure as="nav" className="relative border-b border-white/5 bg-dark/80 backdrop-blur">
      {({ open }) => (
        <>
          <div className="mx-auto w-full max-w-7xl px-6 py-5 lg:px-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20">
                  <span className="text-2xl font-bold text-primary-500">AΩ</span>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-primary-100">AuroraOps</p>
                  <p className="text-base font-semibold text-white">Operaciones orquestadas por IA</p>
                </div>
              </div>
              <div className="hidden items-center gap-10 md:flex">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors hover:text-white ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
                <a
                  className="rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/20"
                  href="https://auroraops.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  Solicitar demo
                </a>
              </div>
              <div className="md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-white/10 focus:outline-none">
                  <span className="sr-only">Abrir menú</span>
                  {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Transition
            as={Fragment}
            enter="transition duration-150 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-100 ease-in"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="space-y-1 px-6 pb-6 md:hidden">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={NavLink}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-2 text-base font-medium transition hover:bg-white/5 ${
                      isActive ? 'bg-white/10 text-white' : 'text-slate-200'
                    }`
                  }
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <a
                className="block rounded-lg bg-primary-500/90 px-4 py-2 text-center text-base font-semibold text-white"
                href="https://auroraops.io"
                target="_blank"
                rel="noreferrer"
              >
                Solicitar demo
              </a>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};
