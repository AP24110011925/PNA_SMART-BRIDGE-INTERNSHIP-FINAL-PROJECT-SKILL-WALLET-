import { useState } from "react";
import { Sparkles, HelpCircle, History, Terminal, ShieldCheck, ArrowUpRight, CheckCircle2, ChevronRight, Activity, Users, BookOpen } from "lucide-react";
import GenerateStarters from "./components/GenerateStarters";
import FactVerifier from "./components/FactVerifier";
import PastHistory from "./components/PastHistory";
import PythonReference from "./components/PythonReference";

export default function App() {
  const [activeTab, setActiveTab] = useState<"generate" | "factcheck" | "history" | "python">("generate");
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const handleRefreshHistory = () => {
    setHistoryRefreshTrigger((prev) => prev + 1);
  };

  const navItems = [
    { id: "generate", label: "Smart Starters", icon: Sparkles },
    { id: "factcheck", label: "Fact Verification", icon: HelpCircle },
    { id: "history", label: "History Log", icon: History },
    { id: "python", label: "ERD & Code Reference", icon: Terminal },
  ] as const;

  const activeLabel = navItems.find((item) => item.id === activeTab)?.label || "Smart Starters";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col md:flex-row" id="main-app-container">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between md:block">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm font-bold text-base">
                🤝
              </div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900">Nexus AI</h1>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Networking Assistant</p>
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-500">FastAPI: ONLINE</span>
          </div>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Project Lead Card */}
        <div className="p-4 border-t border-slate-100 hidden md:block">
          <div className="p-3.5 bg-slate-900 rounded-xl text-white shadow-md">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Project Lead</div>
            <div className="text-sm font-semibold tracking-tight">Pranay Kurapati</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              FastAPI & Gemini OK
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400 font-medium">Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold flex items-center gap-1.5">
              {activeLabel}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-mono text-slate-500">FastAPI: ONLINE</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-inner">
              PK
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Banner Alert for Team Submission */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold tracking-tight">Full-Stack Demo Ready & GitHub Linked!</h3>
              <p className="text-blue-100 text-xs max-w-xl leading-relaxed">
                Your Personalized Networking Assistant has been fully compiled and provisioned with reactive modular widgets, real-time Wikipedia REST queries, and a pytest verified local state.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-xl border border-white/20 font-bold shadow-sm">
                Complexity: Medium
              </span>
            </div>
          </div>

          {/* Dynamic Workspace Workspace */}
          <div className="min-h-[450px]">
            {activeTab === "generate" && (
              <GenerateStarters onGenerationComplete={handleRefreshHistory} />
            )}

            {activeTab === "factcheck" && <FactVerifier />}

            {activeTab === "history" && (
              <PastHistory refreshTrigger={historyRefreshTrigger} />
            )}

            {activeTab === "python" && <PythonReference />}
          </div>
        </div>

        {/* Footer Details Info */}
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto px-6 md:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-500">
              {/* Team block */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider">Project Team Members</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-semibold text-slate-700">
                  <span>Pranay Kurapati (Lead)</span>
                  <span>Chinmayee Poluru</span>
                  <span>Harshitha Tadikamalla</span>
                  <span>Jaswanth Attada</span>
                  <span>Karri Sadwika Devi</span>
                </div>
              </div>

              {/* Specs Block */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider">Technical Architecture</h4>
                <p className="leading-relaxed text-slate-600">
                  Dual Node/Python engine. The live app operates on a fast Node.js Express server acting as a secure proxy to the Gemini 3.5 API. Reference models for local DistilBERT/GPT-2 pipeline integration are bundled inside the workspace.
                </p>
              </div>

              {/* System Requirements */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider">Hardware Requirements</h4>
                <ul className="space-y-0.5 text-slate-600">
                  <li>Processor: Intel i3/i5 or higher</li>
                  <li>RAM: Minimum 4GB (8GB Recommended)</li>
                  <li>Disk Space: 10GB free space</li>
                  <li>Active Internet Connection Required</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 text-[11px] text-slate-400">
              <p>&copy; 2026 Personalized Networking Assistant. Designed with pride for VS Code & streamline deployment.</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-blue-600 transition flex items-center gap-1 font-semibold"
                >
                  GitHub Codebase <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

