import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  User, 
  Calendar, 
  Briefcase 
} from "lucide-react";
import { Task } from "../types";
import { cn } from "../lib/utils";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = isPast(new Date(task.plannedDate)) && !isToday(new Date(task.plannedDate)) && !task.completed;
  const isPlannedToday = isToday(new Date(task.plannedDate)) && !task.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onEdit}
      className={cn(
        "bg-[#1E293B]/60 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex flex-col gap-3 group cursor-pointer hover:border-[#3B82F6]/40 transition-all shadow-xl shadow-black/20",
        isOverdue && "border-rose-500/30 bg-rose-500/5",
        isPlannedToday && "border-[#3B82F6]/30 bg-[#3B82F6]/5",
        isDragging && "cursor-grabbing opacity-50 transition-none"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {task.category && (
              <span className="text-[8px] font-black text-[#3B82F6] uppercase tracking-[0.2em] bg-[#3B82F6]/10 px-2 py-1 rounded-md border border-[#3B82F6]/20 italic">
                {task.category}
              </span>
            )}
            {task.client && (
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-500/10 px-2 py-1 rounded-md border border-white/5 italic">
                {task.client}
              </span>
            )}
          </div>
          <h5 className={cn(
            "text-sm font-black text-[#F5F7FA] tracking-tighter uppercase italic group-hover:text-[#3B82F6] transition-colors leading-tight",
            task.completed && "line-through text-slate-600 italic"
          )}>
            {task.title}
          </h5>
          {task.description && (
            <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 italic font-black uppercase tracking-tight opacity-70 leading-relaxed">{task.description}</p>
          )}
        </div>
        <button className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-500 opacity-0 group-hover:opacity-100">
          <MoreVertical size={14} />
        </button>
      </div>

      {task.projectName && (
        <div className="flex items-center gap-2 text-[9px] font-black text-[#3B82F6] uppercase tracking-widest opacity-80 mt-1 italic">
          <Briefcase size={12} className="shrink-0" />
          <span className="truncate">{task.projectName}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest italic",
            isOverdue ? "text-rose-400" : isPlannedToday ? "text-[#3B82F6]" : "text-slate-500"
          )}>
            <Calendar size={13} className={cn(isOverdue ? "text-rose-400" : "text-[#3B82F6]")} />
            {format(new Date(task.plannedDate), "dd MMM", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic group-hover:text-slate-300 transition-colors">
            <User size={13} className="text-[#3B82F6]/60" />
            {task.responsible.split(" ")[0]}
          </div>
        </div>
        
        <div className={cn(
          "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border italic shadow-lg",
          task.priority === "Alta" ? "bg-rose-500 text-white border-rose-600" :
          task.priority === "Média" ? "bg-amber-500 text-white border-amber-600" :
          "bg-[#3B82F6] text-white border-blue-600"
        )}>
          {task.priority}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
