import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, ArrowLeft, ChevronRight } from "lucide-react";
import { Project } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProject?: Project | null;
  onBackToProjects?: () => void;
  onAddTask: () => void;
  userEmail?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  selectedProject,
  onBackToProjects,
  onAddTask,
  userEmail
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D1220] text-[#F5F7FA] font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onAddTask={onAddTask}
        userEmail={userEmail}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 px-4 py-4 lg:px-8 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} className="text-white" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
