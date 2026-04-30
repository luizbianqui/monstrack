import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { Plus, MoreVertical } from "lucide-react";
import { Task } from "../types";
import TaskCard from "./TaskCard";
import { cn } from "../lib/utils";

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  isToday?: boolean;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ 
  id, 
  title, 
  tasks, 
  isToday = false,
  onAddTask, 
  onEditTask, 
  onDeleteTask 
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className={cn(
      "flex-shrink-0 w-[24rem] rounded-[2.5rem] p-6 flex flex-col gap-6 min-h-[700px] border transition-all duration-500",
      isToday 
        ? "bg-[#1E293B]/90 border-[#3B82F6]/40 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-[1.02] z-10" 
        : "bg-[#1E293B]/40 border-white/5"
    )}>
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-4">
          <h4 className={cn(
            "text-[10px] font-black uppercase tracking-[0.4em] italic",
            isToday ? "text-[#3B82F6]" : "text-slate-500"
          )}>{title}</h4>
          <span className="bg-white/5 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-white/5 shadow-inner">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onAddTask}
            className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-[#3B82F6]"
          >
            <Plus size={20} />
          </button>
          <button className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-4">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>
      </div>

      {tasks.length === 0 && (
        <div className="flex-1 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center bg-[#0D1220]/20 gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
             <Plus size={24} />
          </div>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] leading-relaxed italic">Strategic backlog empty<br/>awaiting mobilization</p>
        </div>
      )}
    </div>
  );
};

export default Column;
