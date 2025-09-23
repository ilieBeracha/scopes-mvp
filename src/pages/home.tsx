import { useSession } from "@/hooks/session/useSession";
import { Navigate } from "react-router";

export function HomePage() {
  const session = useSession();

  if (!session) {
    return <Navigate to="/auth" />;
  }
  return <div>HomePage</div>;
}
