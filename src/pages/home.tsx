import { useSession, useUserMetadata } from "@/hooks/session/useSession";
import { Navigate, useNavigate } from "react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function HomePage() {
  const session = useSession();
  const userMetadata = useUserMetadata();
  const navigate = useNavigate();
  if (!session) {
    return <Navigate to="/auth" />;
  }
  return (
    <div>
      <Card>
        <CardHeader>
          <CardDescription> {userMetadata?.email}</CardDescription>
          <CardContent> {userMetadata?.organization?.name}</CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                supabase.auth.signOut();
                navigate("/auth");
              }}
            >
              Logout
            </Button>
          </CardFooter>
        </CardHeader>
      </Card>
    </div>
  );
}
