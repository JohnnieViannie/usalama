import { ReactNode, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getSession, requireClientSession } from "@/lib/auth";

function CorporateGate({ children }: { children: ReactNode }) {
  const session = requireClientSession();
  const allowed = session?.corporateSecurityEnabled === true;
  const warned = useRef(false);

  useEffect(() => {
    if (session && !allowed && !warned.current) {
      warned.current = true;
      toast.error("Corporate security features are not enabled for your account.");
    }
  }, [session, allowed]);

  if (!session) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function CorporateProtectedRoute({ children }: { children: ReactNode }) {
  if (!getSession()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <ProtectedRoute>
      <CorporateGate>{children}</CorporateGate>
    </ProtectedRoute>
  );
}
