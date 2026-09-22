import { Menu, Image as ImageIcon, List, Mic } from "lucide-react";
import FeatureCard from "../components/FeatureCard";
import ChatInput from "../components/ChatInput";

interface HomeProps {
  onOpenMenu: () => void;
}

function Home({ onOpenMenu }: HomeProps) {
  const handleSend = (message: string) => {
    console.log("User message:", message);
  };

  return (
    <div className="home">
      <header className="mobile-header">
        <button className="menu-button" onClick={onOpenMenu} aria-label="Open menu">
          <Menu size={25} />
        </button>
      </header>

      <section className="feature-section">
        <FeatureCard
          icon={<ImageIcon size={30} />}
          title="Image Creation"
          description="Generate images from text"
          onClick={() => console.log("Image Creation")}
        />
        <FeatureCard
          icon={<List size={30} />}
          title="Code Builder"
          description="Write & debug code"
          onClick={() => console.log("Code Builder")}
        />
        <FeatureCard
          icon={<Mic size={31} />}
          title="Voice AI"
          description="Transcribe & speak"
          onClick={() => console.log("Voice AI")}
        />
      </section>

      <section className="hero-section">
        <h1>Ask WORLD AI<br />Anything</h1>
        <p>Fast generation • high-quality code</p>
        <button
          className="try-button"
          onClick={() => document.querySelector<HTMLInputElement>(".chat-input-wrapper input")?.focus()}
        >
          Try WORLD AI
        </button>
      </section>

      <section className="chat-section">
        <ChatInput onSend={handleSend} />
        <div className="bottom-placeholder" />
      </section>
    </div>
  );
}

export default Home;