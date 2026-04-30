import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { Plus, MoreVertical } from "lucide-react";
import { Project, Task } from "../types";
import ProjectCard from "./ProjectCard";
import TaskCard from "./TaskCard";
import { cn } from "../lib/utils";

interface WeeklyItem {
  id: string;
  type: 'project' | 'task';
  data: Project | Task;
}

interface ProjectColumnProps {
  id: string;
  title: string;
  items: WeeklyItem[];
  isToday?: boolean;
  onSelectProject: (project: Project) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({ 
  id, 
  title, 
  items, 
  isToday = false,
  onSelectProject,
  onEditTask,
  onDeleteTask
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div 
      id={`column-${id}`}
      className={cn(
        "flex-shrink-0 w-80 rounded-[2.5rem] p-6 flex flex-col gap-6 min-h-[600px] transition-all duration-500",
        isToday 
          ? "bg-[#1E293B] border-2 border-[#3B82F6]/40 shadow-2xl shadow-blue-900/10 ring-4 ring-blue-500/10" 
          : "bg-[#1E293B]/40 border border-white/5 shadow-lg shadow-black/10 backdrop-blur-sm"
      )}
    >
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isToday ? "bg-[#3B82F6] animate-pulse" : "bg-slate-700"
          )} />
          <h4 className={cn(
            "text-[10px] font-black uppercase tracking-[0.3em] font-display italic",
            isToday ? "text-[#3B82F6]" : "text-slate-500"
          )}>{title}</h4>
          <span className="bg-white/5 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black">
            {items.length}
          </span>
        </div>
        <button className="p-2 text-slate-500 hover:text-[#3B82F6] hover:bg-white/5 rounded-xl transition-all">
          <MoreVertical size={18} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-4">
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            item.type === 'project' ? (
              <ProjectCard 
                key={item.id} 
                project={item.data as Project} 
                onClick={() => onSelectProject(item.data as Project)}
              />
            ) : (
              <TaskCard 
                key={item.id} 
                task={item.data as Task}
                onEdit={() => onEditTask(item.data as Task)}
                onDelete={() => onDeleteTask(item.id)}
              />
            )
          ))}
        </SortableContext>
      </div>

      {items.length === 0 && (
        <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center bg-[#0D1220]/20 gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shadow-lg border border-white/5">
            <Plus size={20} className="text-slate-700" />
          </div>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic">Mobilização Lógica<br/>Disponível</p>
        </div>
      )}
    </div>
  );
};

export default ProjectColumn;
