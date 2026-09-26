import { useEffect, useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }> };
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    if (isStandalone()) { setInstalled(true); return; }
    const ready = (event: Event) => { event.preventDefault(); setPromptEvent(event as BeforeInstallPromptEvent); };
    const done = () => { setInstalled(true); setPromptEvent(null); };
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", ready); window.removeEventListener("appinstalled", done); };
  }, []);
  if (installed) return null;
  const install = async () => {
    if (promptEvent) { await promptEvent.prompt(); const choice = await promptEvent.userChoice; setPromptEvent(null); if (choice.outcome === "accepted") setInstalled(true); return; }
    setShowHelp(true);
  };
  return <>
    <div className="install-banner">
      <div className="install-banner-icon"><Download size={19}/></div>
      <div className="install-banner-copy"><strong>Install DOG</strong><span>{promptEvent ? "DOG is ready to install." : isIOS() ? "Safari Share → Add to Home Screen." : "Browser menu → Install app / Add to Home screen."}</span></div>
      <button className="install-button" onClick={() => void install()}>Install App</button>
      <button className="install-close" onClick={() => setInstalled(true)} aria-label="Close"><X size={17}/></button>
    </div>
    {showHelp && <div className="install-ios-backdrop" onClick={() => setShowHelp(false)}><div className="install-ios-card" onClick={e => e.stopPropagation()}><div className="install-ios-title"><strong>Install DOG</strong><button className="icon-button" onClick={() => setShowHelp(false)}><X size={18}/></button></div><p>{isIOS() ? <>In Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.</> : <>Your browser has not exposed the automatic install prompt yet. Open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</>}</p><div className="install-ios-note"><ExternalLink size={17}/> DOG will open as an app.</div></div></div>}
  </>;
}
