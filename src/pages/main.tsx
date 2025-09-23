import { useSession } from "@/hooks/session/useSession";
import { Navigate, Route, Routes } from "react-router";
import { MenuDock } from "@/components/ui/shadcn-io/menu-dock";
import { TrainingPage } from "./training";
import { HomePage } from "./home";
import { SettingsPage } from "./settings";

export function MainPage() {
  const session = useSession();
  if (!session) {
    return <Navigate to="/auth" />;
  }
  return (
    <div>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <MenuDock
        variant="compact"
        showLabels={true}
        animated={false}
        className="left-1/2 transform -translate-x-1/2"
      />
    </div>
  );
}
