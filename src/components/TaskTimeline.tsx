import React from "react";
import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task } from "../types";
import { cn } from "../lib/utils";

interface TaskTimelineProps {
  tasks: Task[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ tasks, selectedDate, onSelectDate }) => {
  const dates = Array.from({ length: 31 }, (_, i) => addDays(subDays(new Date(), 7), i));

  const getTaskCountForDate = (date: Date) => {
    return tasks.filter(t => isSameDay(new Date(t.plannedDate), date)).length;
  };

  const getLoadColor = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count <= 2) return "bg-blue-500/10 text-blue-300";
    if (count <= 4) return "bg-[#2563EB]/20 text-[#2563EB]";
    return "bg-red-500/20 text-red-400 font-black";
  };

  return (
    <div className="bg-[#1E293B]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Daily <span className="text-[#2563EB] not-italic">Strategic</span> Roadmap</h4>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-300/40"></div> Low</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></div> Medium</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> High</div>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((date) => {
          const count = getTaskCountForDate(date);
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex flex-col items-center min-w-[55px] p-3 py-4 rounded-2xl transition-all duration-500 relative group",
                isSelected 
                  ? "bg-[#0D1220] text-white shadow-xl shadow-blue-500/10 ring-1 ring-[#2563EB]/40 scale-105" 
                  : "hover:bg-white/5"
              )}
            >
              <span className={cn(
                "text-[9px] font-black uppercase mb-1.5 opacity-40 italic tracking-widest",
                isSelected && "text-[#2563EB] opacity-100"
              )}>
                {format(date, "EEE", { locale: ptBR })}
              </span>
              <span className="text-sm font-black tracking-tighter">{format(date, "dd")}</span>
              
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]",
                  count > 0 ? (count > 4 ? "bg-red-500" : count > 2 ? "bg-[#2563EB]" : "bg-blue-300/40") : "bg-white/10"
                )} />
                {count > 0 && (
                  <span className={cn(
                    "text-[8px] font-black tracking-tighter",
                    isSelected ? "text-[#2563EB]" : "text-gray-500"
                  )}>{count} OPS</span>
                )}
              </div>

              {isTodayDate && !isSelected && (
                <div className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full mt-1 mr-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTimeline;
