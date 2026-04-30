import React from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  CalendarCheck, 
  FileBarChart, 
  Menu, 
  X, 
  LogOut, 
  User,
  Plus,
  TrendingUp
} from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddTask: () => void;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen, 
  onAddTask,
  userEmail
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projetos", icon: Briefcase },
    { id: "weekly-review", label: "Revisão Semanal", icon: CalendarCheck },
    { id: "produtividade", label: "Produtividade", icon: TrendingUp },
    { id: "reports", label: "Relatórios", icon: FileBarChart },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-[#0D1220] text-white w-72 z-50 transition-all duration-500 transform lg:translate-x-0 border-r border-white/5",
        isOpen ? "translate-x-0" : "-translate-x-full shadow-none"
      )}>
        <div className="p-8 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <div className="absolute w-6 h-6 border-2 border-[#3B82F6] rotate-45 -translate-x-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                <div className="absolute w-6 h-6 border-2 border-[#3B82F6] rotate-45 translate-x-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              </div>
              <h1 className="text-2xl font-black tracking-tighter font-display uppercase italic">Mons<span className="text-[#3B82F6] not-italic">Track</span></h1>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
              <X size={20} className="text-slate-500" />
            </button>
          </div>
  
          {/* Main Navigation */}
          <nav className="flex-1 space-y-2">
            <p className="px-5 text-[9px] font-black text-white uppercase tracking-[0.4em] mb-6 italic opacity-80">Corporate Modules</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  activeTab === item.id 
                    ? "bg-white/10 text-white shadow-xl" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#3B82F6] rounded-r-full shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
                )}
                <item.icon size={22} className={cn(
                  "transition-all duration-300",
                  activeTab === item.id ? "text-[#3B82F6] scale-110" : "text-white/50 group-hover:text-white"
                )} />
                <span className={cn(
                  "tracking-[0.1em] uppercase text-[10px] font-black italic",
                  activeTab === item.id ? "text-white" : "text-white opacity-70 group-hover:opacity-100"
                )}>{item.label}</span>
              </button>
            ))}
          </nav>
  
          {/* Actions & Profile */}
          <div className="mt-auto pt-8 space-y-6">
            <button 
              onClick={() => {
                onAddTask();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-3 py-5 bg-[#3B82F6] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98] italic"
            >
              <Plus size={20} />
              Nova Tarefa
            </button>
  
            <div className="bg-[#1E293B]/80 rounded-[2.5rem] p-6 border border-white/5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-gradient-to-tr from-[#3B82F6]/20 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-white/5">
                  <User size={22} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white uppercase tracking-tighter italic leading-none">Gestor Strategic</p>
                  <p className="text-[9px] text-white/40 font-black truncate uppercase tracking-widest italic mt-1.5">{userEmail || "gestor@monstrack.com.br"}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-white/50 hover:text-rose-400 transition-all uppercase tracking-widest italic"
              >
                <LogOut size={16} />
                Encerrar Sessão
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
