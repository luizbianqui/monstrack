import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User, CheckSquare } from "lucide-react";
import { cn } from "../lib/utils";
import { Project, Task } from "../types";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getProjectHealth } from "../lib/utils";

interface ProjectCardProps {
  project: Project;
  tasks?: Task[];
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, tasks = [], onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = isPast(new Date(project.deadline)) && !isToday(new Date(project.deadline)) && project.status !== "Concluído";
  const health = getProjectHealth(project);
  
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const completedTasks = projectTasks.filter(t => t.completed).length;
  const totalTasks = projectTasks.length;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#1E293B]/80 backdrop-blur-sm rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 transition-all flex flex-col overflow-hidden group p-7 gap-6",
        onClick && "cursor-pointer hover:border-[#3B82F6]/40 hover:shadow-blue-500/10 hover:bg-[#1E293B]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className="text-[9px] font-black text-[#3B82F6] uppercase tracking-[0.2em] leading-none italic">{project.category}</span>
        <span className={cn(
          "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest italic",
          project.priority === "Alta" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
          project.priority === "Média" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
          "bg-[#3B82F6]/10 text-[#3B82F6] border border-blue-500/20"
        )}>
          {project.priority}
        </span>
      </div>

      <h4 className="text-xl font-black text-[#F5F7FA] leading-tight group-hover:text-[#3B82F6] transition-colors uppercase italic tracking-tighter">{project.name}</h4>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
          <span>Evolução Estratégica</span>
          <span className="text-[#F5F7FA] not-italic">{project.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              project.progress === 100 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            )} 
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Next Action Box */}
      <div className="bg-[#0D1220]/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden group/action">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6] opacity-0 group-hover/action:opacity-100 transition-opacity" />
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Próxima Ação Auditada</p>
        <p className="text-xs font-black text-[#F5F7FA] leading-relaxed line-clamp-2 uppercase tracking-tight italic opacity-90">{project.nextAction}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-1 border-t border-white/5 pt-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">
            <Calendar size={13} className="text-[#3B82F6]" />
            {format(new Date(project.deadline), "dd MMM", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">
            <User size={13} className="text-[#3B82F6]" />
            {project.owner.split(" ")[0]}
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl border text-[8px] font-black uppercase tracking-[0.1em] italic shadow-lg",
          health === "Saudável" ? "bg-emerald-500 text-white border-emerald-600" :
          health === "Atenção" ? "bg-amber-500 text-white border-amber-600" :
          "bg-rose-500 text-white border-rose-600"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_white] bg-white",
          )}></span>
          {health === "Atenção" ? "STRATEGIC ALERT" : health === "Saudável" ? "ON TRACK" : "CRITICAL RISK"}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
