import { Route, Routes, useNavigate } from "react-router";
import { MenuDock } from "@/components/ui/shadcn-io/menu-dock";
import { TrainingPage } from "./training";
import { HomePage } from "./home";
import { SettingsPage } from "./settings";
import { Home, Calendar, Settings } from "lucide-react";
import { useUserHasOrganization } from "@/hooks/organization/useUserHasOrganization";
import { OrgCreationForm } from "@/components/auth/org-creation-form";
import { useSession } from "@/hooks/session/useSession";

useUserHasOrganization;
const items = [
  { label: "home", icon: Home },
  { label: "training", icon: Calendar },
  { label: "settings", icon: Settings },
];
export function MainPage() {
  const { session, isLoading: sessionLoading } = useSession();
  const userHasOrganization = useUserHasOrganization();
  const navigate = useNavigate();

  // Always show loading while session is loading or org check is loading
  if (
    sessionLoading ||
    !session ||
    userHasOrganization.isLoading ||
    userHasOrganization.data === undefined
  ) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[100dvh]">
        <div>Loading...</div>
      </div>
    );
  }

  // Show organization creation form if user explicitly doesn't have an organization
  if (userHasOrganization.data === false) {
    const handleOrgCreationComplete = () => {
      // Refetch the organization status and navigate to home
      userHasOrganization.refetch();
      navigate("/");
    };

    return <OrgCreationForm onComplete={handleOrgCreationComplete} />;
  }

  return (
    <div className="flex flex-col justify-center items-center max-h-[100dvh]">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <MenuDock
        items={items}
        variant="compact"
        showLabels={true}
        animated={false}
        className="left-1/2 transform -translate-x-1/2"
      />
    </div>
  );
}
