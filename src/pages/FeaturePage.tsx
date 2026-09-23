import { ArrowLeft, CalendarClock, Code2, FolderKanban, Image, Library, Puzzle, Sparkles, Crown, Mic, Plus, Search, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { AppPage } from "../types";
import { useAuth } from "../context/AuthContext";

const meta: Record<Exclude<AppPage,"home"|"account">,{title:string;desc:string;icon:ReactNode}> = {
  images:{title:"Images",desc:"A dedicated space for image creation and generations.",icon:<Image size={25}/>},
  library:{title:"Library",desc:"Keep files, generations and saved outputs organized.",icon:<Library size={25}/>},
  projects:{title:"Projects",desc:"Workspaces for long-running builds, apps and codebases.",icon:<FolderKanban size={25}/>},
  scheduled:{title:"Scheduled",desc:"Your future AI tasks and automations will live here.",icon:<CalendarClock size={25}/>},
  plugins:{title:"Tools & Plugins",desc:"Connect tools and services without changing the core app.",icon:<Puzzle size={25}/>},
  code:{title:"Code Builder",desc:"WORLD AI's coding-first workspace for building, debugging and refactoring.",icon:<Code2 size={25}/>},
  voice:{title:"Voice AI",desc:"Voice input and output will connect to the AI engine.",icon:<Mic size={25}/>},
  pro:{title:"WORLD AI Pro",desc:"A low-cost early-access plan designed around serious coding work.",icon:<Crown size={25}/>}
};

export default function FeaturePage({page,onNavigate}:{page:AppPage;onNavigate:(p:AppPage)=>void}) {
  if(page === "account") return <AccountPage onBack={()=>onNavigate("home")}/>;
  if(page === "pro") return <ProPage onBack={()=>onNavigate("home")}/>;
  const item = meta[page as Exclude<AppPage,"home"|"account">];
  return <div className="feature-page"><header className="page-header"><button className="back-button" onClick={()=>onNavigate("home")}><ArrowLeft size={18}/> Home</button><div className="page-title">{item.icon}<div><h1>{item.title}</h1><p>{item.desc}</p></div></div></header><section className="workspace-placeholder"><div className="placeholder-mark">{item.icon}</div><h2>{item.title} workspace</h2><p>This workspace is connected to WORLD AI navigation. The live AI tools will appear here as their secure providers are connected.</p><div className="quick-grid"><button><Plus size={17}/> Create</button><button><Search size={17}/> Search</button><button><CheckCircle2 size={17}/> Manage</button></div></section></div>;
}

function AccountPage({onBack}:{onBack:()=>void}) {
  const {user}=useAuth();
  return <div className="feature-page"><header className="page-header"><button className="back-button" onClick={onBack}><ArrowLeft size={18}/> Home</button><div className="page-title"><Sparkles size={25}/><div><h1>Account</h1><p>Your WORLD AI identity and account controls.</p></div></div></header><section className="workspace-placeholder account-workspace"><div className="placeholder-mark"><Sparkles size={28}/></div><h2>{user?.displayName || "WORLD AI user"}</h2><p>{user?.email || "Your account email"}</p><div className="status-card"><ShieldCheck size={18}/><div><strong>Account secured</strong><span>Your sign-in session is protected by the connected account system.</span></div></div></section></div>;
}

function ProPage({onBack}:{onBack:()=>void}) {
  return <div className="feature-page"><header className="page-header"><button className="back-button" onClick={onBack}><ArrowLeft size={18}/> Home</button><div className="page-title"><Crown size={25}/><div><h1>WORLD AI Pro</h1><p>Affordable coding-first AI, with launch pricing planned from day one.</p></div></div></header><section className="pro-grid"><div className="plan-card"><div className="plan-label">FREE</div><h2>Starter</h2><div className="plan-price">PKR 0 <span>/ month</span></div><ul><li>Chat workspace</li><li>20 coding requests / month</li><li>Basic projects</li><li>Core WORLD AI features</li></ul><button className="plan-button secondary-button">Current plan</button></div><div className="plan-card plan-featured"><div className="offer-badge">EARLY ACCESS OFFER</div><div className="plan-label">PRO</div><h2>Builder</h2><div className="plan-price">PKR 499 <span>/ month</span></div><p className="offer-copy">Launch price target. Billing is not active yet.</p><ul><li>300 coding requests / month</li><li>Higher AI limits</li><li>Advanced coding workflows</li><li>Projects + larger context</li><li>Priority model access</li></ul><button className="plan-button primary-button">Coming soon</button></div></section></div>;
}
