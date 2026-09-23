import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import Settings from "./components/Settings";
import InstallApp from "./components/InstallApp";
import FeaturePage from "./pages/FeaturePage";
import { AppPage } from "./types";

function Splash() {
  return <main className="splash"><div className="splash-world"><span>W</span></div><div className="splash-name">WORLD AI</div><div className="splash-line" /></main>;
}

function AppShell() {
  const { user, loading, firebaseConfigured } = useAuth();
  const [splash, setSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [page, setPage] = useState<AppPage>("home");

  useEffect(() => { const timer = window.setTimeout(() => setSplash(false), 1800); return () => window.clearTimeout(timer); }, []);
  if (splash) return <Splash />;
  if (loading) return <div className="loading-screen"><div className="loading-mark">W</div><span>Loading WORLD AI…</span></div>;
  if (!firebaseConfigured || !user) return <Auth />;

  const navigate = (next: AppPage) => { setPage(next); setSidebarOpen(false); };
  return <AppProvider>
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSettings={() => setSettingsOpen(true)} page={page} onNavigate={navigate} />
      <main className="main-content">
        {page === "home" ? <Home onOpenMenu={() => setSidebarOpen(true)} onNavigate={navigate} onOpenAccount={() => navigate("account")} /> : <FeaturePage page={page} onNavigate={navigate} />}
      </main>
      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} onNavigate={navigate} />
      <InstallApp />
    </div>
  </AppProvider>;
}

export default function App() { return <AuthProvider><AppShell /></AuthProvider>; }
