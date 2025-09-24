import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/session/useSession";

export function HomePage() {
  const { session } = useSession();
  return (
    <div className="flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm">
              {session?.user?.user_metadata?.first_name}{" "}
              {session?.user?.user_metadata?.last_name}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
