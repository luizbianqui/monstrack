import React from "react";
import { 
  CalendarCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  User, 
  Calendar 
} from "lucide-react";
import { cn } from "../lib/utils";
import { Project } from "../types";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeeklyReviewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

const WeeklyReview: React.FC<WeeklyReviewProps> = ({ projects, onSelectProject }) => {
  const now = new Date();

  const overdueProjects = projects.filter(p => isPast(new Date(p.deadline)) && !isToday(new Date(p.deadline)) && p.status !== "Concluído");
  const blockedProjects = projects.filter(p => p.blockers.length > 0);
  const projectsWithoutNextAction = projects.filter(p => !p.nextAction || p.nextAction.trim() === "");
  const staleProjects = projects.filter(p => {
    const lastUpdate = new Date(p.updatedAt);
    return differenceInDays(now, lastUpdate) > 7 && p.status !== "Concluído";
  });

  return (
    <div className="space-y-8">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-[#F5F7FA] tracking-tighter font-display uppercase italic text-center md:text-left">
          Weekly <span className="text-[#3B82F6] not-italic">Audit</span>
        </h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 text-center md:text-left italic">Análise Estratégica e Controle de Assets</p>
      </div>

      <div className="bg-[#1E293B]/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center text-[#3B82F6] shadow-lg shadow-blue-500/10">
            <CalendarCheck size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#F5F7FA] tracking-tighter uppercase italic">Status <span className="text-[#3B82F6] not-italic">Governança</span></h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Visão consolidada do portfólio</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center px-4">
            <p className="text-3xl font-black text-rose-400 tracking-tighter">{overdueProjects.length + blockedProjects.length + staleProjects.length}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 italic">Gaps Críticos</p>
          </div>
          <div className="w-px h-12 bg-white/5"></div>
          <div className="text-center px-4">
            <p className="text-3xl font-black text-[#F5F7FA] tracking-tighter">{projects.length}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 italic">Assets Monitorados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReviewSection 
          title="Atrasados ou Bloqueados" 
          icon={<AlertCircle size={18} className="text-rose-500" />}
          projects={[...new Set([...overdueProjects, ...blockedProjects])]}
          onSelect={onSelectProject}
          emptyMessage="Nenhum projeto atrasado ou bloqueado. Bom trabalho!"
        />
        
        <ReviewSection 
          title="Sem Atualizações (+7 dias)" 
          icon={<Clock size={18} className="text-amber-400" />}
          projects={staleProjects}
          onSelect={onSelectProject}
          emptyMessage="Todos os projetos foram atualizados recentemente."
        />

        <ReviewSection 
          title="Sem Próxima Ação Definida" 
          icon={<ArrowRight size={18} className="text-[#3B82F6]" />}
          projects={projectsWithoutNextAction}
          onSelect={onSelectProject}
          emptyMessage="Todos os projetos possuem uma próxima ação definida."
        />

        <ReviewSection 
          title="Concluídos Recentemente" 
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
          projects={projects.filter(p => p.status === "Concluído").slice(0, 5)}
          onSelect={onSelectProject}
          emptyMessage="Nenhum projeto concluído recentemente."
        />
      </div>
    </div>
  );
};

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  projects: Project[];
  onSelect: (project: Project) => void;
  emptyMessage: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, icon, projects, onSelect, emptyMessage }) => (
  <div className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F5F7FA] flex items-center gap-2 italic">
        {icon}
        {title}
      </h4>
      <span className="bg-[#3B82F6] text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-blue-500/20">
        {projects.length}
      </span>
    </div>
    
    <div className="flex-1">
      {projects.length > 0 ? (
        <div className="divide-y divide-white/5">
          {projects.map((project) => (
            <button 
              key={project.id}
              onClick={() => onSelect(project)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all group text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-[#3B82F6] uppercase tracking-widest">{project.category}</span>
                  <span className="w-1.5 h-1.5 bg-[#3B82F6]/40 rounded-full"></span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{project.status}</span>
                </div>
                <h5 className="text-sm font-black text-[#F5F7FA] tracking-tight uppercase italic mt-1 group-hover:text-[#3B82F6] transition-colors">{project.name}</h5>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                    <User size={12} className="text-[#3B82F6]" />
                    {project.owner.split(" ")[0]}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                    <Calendar size={12} className="text-[#3B82F6]" />
                    {format(new Date(project.deadline), "dd/MM/yy")}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] italic">{emptyMessage}</p>
        </div>
      )}
    </div>
  </div>
);

const ChevronRight: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default WeeklyReview;
