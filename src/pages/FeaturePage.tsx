import { ArrowLeft, CalendarClock, Code2, FolderKanban, Image, Library, Puzzle, Sparkles, Crown, Mic, Plus, Search, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import type { AppPage } from "../types";
const meta: Record<Exclude<AppPage,"home"|"account">,{title:string;desc:string;icon:ReactNode}> = {
  images:{title:"Images",desc:"A dedicated space for image creation and generations.",icon:<Image size={25}/>},
  library:{title:"Library",desc:"Keep your files, generations and saved outputs organized.",icon:<Library size={25}/>},
  projects:{title:"Projects",desc:"Workspaces for long-running builds, apps and codebases.",icon:<FolderKanban size={25}/>},
  scheduled:{title:"Scheduled",desc:"Your future AI tasks and automations will live here.",icon:<CalendarClock size={25}/>},
  plugins:{title:"Tools & Plugins",desc:"Connect future tools and services without changing the core app.",icon:<Puzzle size={25}/>},
  code:{title:"Code Builder",desc:"WORLD AI's coding-first workspace is being prepared for the AI engine.",icon:<Code2 size={25}/>},
  voice:{title:"Voice AI",desc:"Voice input and output will connect here in the AI phase.",icon:<Mic size={25}/>},
  pro:{title:"WORLD AI Pro",desc:"The Pro architecture is reserved now; billing and payments are not active yet.",icon:<Crown size={25}/>}
};
export default function FeaturePage({page,onNavigate}:{page:AppPage;onNavigate:(p:AppPage)=>void}) {
  if(page === "account") return <AccountPage onBack={()=>onNavigate("home")}/>;
  const item = meta[page as Exclude<AppPage,"home"|"account">];
  return <div className="feature-page"><header className="page-header"><button className="back-button" onClick={()=>onNavigate("home")}><ArrowLeft size={18}/> Home</button><div className="page-title">{item.icon}<div><h1>{item.title}</h1><p>{item.desc}</p></div></div></header><section className="workspace-placeholder"><div className="placeholder-mark">{item.icon}</div><h2>{item.title} workspace</h2><p>This area is connected and ready for the next WORLD AI engine phase. It is intentionally a real page, not a dead sidebar button.</p>{page === "pro" ? <div className="status-card"><Crown size={18}/><div><strong>Pro plan placeholder</strong><span>Plans, limits and billing will be connected later. No payment is being charged.</span></div></div> : <div className="quick-grid"><button><Plus size={17}/> Create</button><button><Search size={17}/> Search</button><button><CheckCircle2 size={17}/> Manage</button></div>}</section></div>;
}
function AccountPage({onBack}:{onBack:()=>void}) { return <div className="feature-page"><header className="page-header"><button className="back-button" onClick={onBack}><ArrowLeft size={18}/> Home</button><div className="page-title"><Sparkles size={25}/><div><h1>Account</h1><p>Your WORLD AI identity and account controls.</p></div></div></header><section className="workspace-placeholder"><div className="placeholder-mark"><Sparkles size={28}/></div><h2>Account center</h2><p>Profile, sign-in providers, security and future plan controls belong here.</p><div className="status-card"><CheckCircle2 size={18}/><div><strong>Account connected</strong><span>Firebase Authentication is handling your sign-in session.</span></div></div></section></div>; }
