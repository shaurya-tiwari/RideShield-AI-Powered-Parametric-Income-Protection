import { useAuth } from "../auth/AuthContext";
import Navbar from "./Navbar";

/**
 * Shared layout wrapper for all public (unauthenticated) routes.
 * Eliminates the 4× duplicated wrapper pattern in App.jsx.
 */
export default function PublicShell({ children }) {
  const { session } = useAuth();

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar session={session?.session} />
      <main id="main" className="scrollbar-slim">
        {children}
      </main>
      <footer className="mt-16 pb-6 text-sm text-on-surface-variant">
        <div className="panel-muted flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-on-surface">RideShield</p>
          <p className="leading-relaxed">
            Parametric AI insurance demo surface for gig delivery workers.
          </p>
        </div>
      </footer>
    </div>
  );
}
