import { useEffect, useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const ready = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const done = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", done);

    return () => {
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", done);
    };
  }, []);

  if (installed) return null;

  // On Android/desktop, do not show a fake install button before the browser
  // says that the app is actually installable. On iOS, show the real manual path.
  const canShow = Boolean(promptEvent) || isIOS();
  if (!canShow) return null;

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }
    if (isIOS()) setShowIOS(true);
  };

  return (
    <>
      <div className="install-banner">
        <div className="install-banner-icon"><Download size={19} /></div>
        <div className="install-banner-copy">
          <strong>Install WORLD AI</strong>
          <span>{promptEvent ? "WORLD AI is ready to install." : "Add WORLD AI from Safari's Share menu."}</span>
        </div>
        <button className="install-button" onClick={() => void install()}>Install App</button>
        <button className="install-close" onClick={() => setPromptEvent(null)} aria-label="Close">
          <X size={17} />
        </button>
      </div>

      {showIOS && (
        <div className="install-ios-backdrop" onClick={() => setShowIOS(false)}>
          <div className="install-ios-card" onClick={(event) => event.stopPropagation()}>
            <div className="install-ios-title">
              <strong>Install WORLD AI</strong>
              <button className="icon-button" onClick={() => setShowIOS(false)}><X size={18} /></button>
            </div>
            <p>In Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.</p>
            <div className="install-ios-note"><ExternalLink size={17} /> WORLD AI will open like an app.</div>
          </div>
        </div>
      )}
    </>
  );
}
