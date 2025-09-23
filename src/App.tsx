import "./App.css";
import { MobileGuard } from "./components/layouts/MobileGuard";
import { QueryProvider } from "./providers/QueryProvider";
import { useSession } from "./hooks/session/useSession";
import { Route, Routes } from "react-router";
import { AuthPage } from "./pages/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HomePage } from "./pages/home";
function App() {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session]);
  return (
    <QueryProvider>
      <MobileGuard
        spacesFromEdges={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Routes>
          {session ? (
            <Route path="*" element={<HomePage />} />
          ) : (
            <Route path="*" element={<AuthPage />} />
          )}
        </Routes>
      </MobileGuard>
    </QueryProvider>
  );
}

export default App;
