import "./App.css";
import { MobileGuard } from "./components/layouts/MobileGuard";
import { QueryProvider } from "./providers/QueryProvider";
import { useSession } from "./hooks/session/useSession";
import { Route, Routes } from "react-router";
import { AuthPage } from "./pages/auth";
import { MainPage } from "./pages/main";
import { Loader2 } from "lucide-react";

function App() {
  const { session, isLoading } = useSession();

  // Show loading screen while session is loading
  if (isLoading) {
    return (
      <QueryProvider>
        <MobileGuard
          spacesFromEdges={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <div className="flex flex-col justify-center items-center min-h-[100dvh]">
            <div>
              <Loader2 className="animate-spin" />
            </div>
          </div>
        </MobileGuard>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <MobileGuard
        spacesFromEdges={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Routes>
          {session ? (
            <Route path="*" element={<MainPage />} />
          ) : (
            <Route path="*" element={<AuthPage />} />
          )}
        </Routes>
      </MobileGuard>
    </QueryProvider>
  );
}

export default App;
