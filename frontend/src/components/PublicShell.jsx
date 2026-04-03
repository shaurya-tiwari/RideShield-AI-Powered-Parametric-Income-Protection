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
      <Navbar session={session?.session} />
      {children}
    </div>
  );
}
