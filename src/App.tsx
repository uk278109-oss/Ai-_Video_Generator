import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import Settings from "./components/Settings";
import InstallApp from "./components/InstallApp";

function AppShell() {
  const { user, loading, firebaseConfigured } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading) return <div className="loading-screen"><div className="loading-mark">W</div><span>Loading WORLD AI…</span></div>;
  if (!firebaseConfigured) return <Auth />;
  if (!user) return <Auth />;

  return (
    <AppProvider>
      <div className="app">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSettings={() => setSettingsOpen(true)} />
        <main className="main-content">
          <Home onOpenMenu={() => setSidebarOpen(true)} />
        </main>
        {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
        <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <InstallApp />
      </div>
    </AppProvider>
  );
}

export default function App() {
  return <AuthProvider><AppShell /></AuthProvider>;
}
