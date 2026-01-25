"use client";

interface NavBarProps {
  approvedUve: number;
  totalUve: number;
  completion: number;
  onLogout: () => void;
  onMenuToggle: () => void;
}

export default function NavBar({
  approvedUve,
  totalUve,
  completion,
  onLogout,
  onMenuToggle,
}: NavBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur transition-all">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-heading)] md:text-xl">
              Malla 2026
            </h1>
            <p className="hidden text-xs text-[var(--color-muted)] md:block">
              Ingeniería de Sistemas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs md:block">
            <span className="text-[var(--color-muted)]">Avance: </span>
            <span className="font-semibold text-[var(--color-heading)]">
              {completion}% ({approvedUve}/{totalUve} UVE)
            </span>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:bg-slate-50 hover:text-[var(--color-heading)]"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
