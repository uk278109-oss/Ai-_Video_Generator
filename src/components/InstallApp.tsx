import { useEffect, useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    setDismissed(localStorage.getItem("world-ai:install-dismissed") === "true");

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const result = await promptEvent.userChoice;
      setPromptEvent(null);
      if (result.outcome === "accepted") setInstalled(true);
      return;
    }
    if (isIOS()) {
      setShowIOS(true);
    }
  };

  const close = () => {
    setDismissed(true);
    localStorage.setItem("world-ai:install-dismissed", "true");
  };

  return (
    <>
      <div className="install-banner" role="dialog" aria-label="Install WORLD AI">
        <div className="install-banner-icon"><Download size={19} /></div>
        <div className="install-banner-copy">
          <strong>Install WORLD AI</strong>
          <span>Use WORLD AI like a real app on your device.</span>
        </div>
        <button className="install-button" onClick={() => void install()}>Install App</button>
        <button className="install-close" aria-label="Dismiss install prompt" onClick={close}><X size={17} /></button>
      </div>

      {showIOS && (
        <div className="install-ios-backdrop" onClick={() => setShowIOS(false)}>
          <div className="install-ios-card" onClick={event => event.stopPropagation()}>
            <div className="install-ios-title"><strong>Install WORLD AI</strong><button className="icon-button" onClick={() => setShowIOS(false)}><X size={18} /></button></div>
            <p>On iPhone/iPad, tap <strong>Share</strong> in Safari, then choose <strong>Add to Home Screen</strong>.</p>
            <div className="install-ios-note"><ExternalLink size={17} /> WORLD AI will open in its own app window.</div>
          </div>
        </div>
      )}
    </>
  );
}
