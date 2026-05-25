import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { requireClientSession } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const session = requireClientSession();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
