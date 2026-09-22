import {
  X, Search, Images, Library, FolderKanban, Clock3, Puzzle, Square
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const recentItems = [
  { title: "Logo draft v3", time: "2h ago" },
  { title: "Python script refactor", time: "Yesterday" },
  { title: "Voice note - Idea 01", time: "2 days ago" }
];

function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-top">
        <div className="brand">WORLD AI</div>
        <button className="close-sidebar" onClick={onClose} aria-label="Close menu">
          <X size={22} />
        </button>
      </div>

      <button className="search-button" aria-label="Search">
        <Search size={21} />
      </button>

      <nav className="navigation">
        <button><Images size={22} /><span>Images</span></button>
        <button><Library size={22} /><span>Library</span></button>
        <button><FolderKanban size={22} /><span>Projects</span></button>
        <button><Clock3 size={22} /><span>Scheduled</span></button>
        <button><Puzzle size={22} /><span>Plugins</span></button>
      </nav>

      <div className="sidebar-divider" />
      <div className="recents-title">Recents</div>

      <div className="recent-list">
        {recentItems.map((item) => (
          <button className="recent-item" key={item.title}>
            <Square size={21} />
            <div>
              <strong>{item.title}</strong>
              <small>{item.time}</small>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;