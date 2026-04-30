import React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Briefcase } from "lucide-react";
import { Task, Project } from "../types";
import { cn } from "../lib/utils";

interface TaskCalendarProps {
  tasks: Task[];
  projects: Project[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks, projects, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(t => isSameDay(new Date(t.plannedDate), date));
  };

  const getDeadlinesForDate = (date: Date) => {
    return projects.filter(p => isSameDay(new Date(p.deadline), date));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const weekDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-[#1E293B]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-[#F5F7FA] tracking-tighter flex items-center gap-2 uppercase italic">
            <CalendarIcon size={20} className="text-[#2563EB]" />
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">Strategic Operations Roadmap</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/5 mb-4">
        {weekDayNames.map((day) => (
          <div key={day} className="py-3 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] text-center italic">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-50 border border-gray-50 rounded-xl overflow-hidden shadow-sm">
        {days.map((day, idx) => {
          const dateTasks = getTasksForDate(day);
          const dateDeadlines = getDeadlinesForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[110px] p-4 flex flex-col items-start transition-all duration-500 relative group border-white/[0.02]",
                !isCurrentMonth ? "opacity-20" : "bg-[#0D1220]/40",
                isSelected ? "bg-[#2563EB]/10 ring-1 ring-[#2563EB]/40 z-10" : "hover:bg-white/[0.02]",
                isTodayDate && "bg-[#2563EB]/5"
              )}
            >
              <span className={cn(
                "text-xs font-black transition-all uppercase tracking-widest",
                !isCurrentMonth ? "text-gray-600" : "text-[#F5F7FA]",
                isTodayDate && "w-7 h-7 bg-[#2563EB] text-white rounded-lg flex items-center justify-center -mt-1 -ml-1 shadow-lg shadow-blue-500/40",
                isSelected && "text-[#2563EB]"
              )}>
                {format(day, "d")}
              </span>

              <div className="mt-2 space-y-1 w-full text-left">
                {dateDeadlines.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20 mb-1">
                    <Briefcase size={8} />
                    <span className="text-[7px] font-black tracking-[0.1em] uppercase">DEADLINE</span>
                  </div>
                )}
                {dateTasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.05] text-gray-400 rounded-md border border-white/[0.05] group-hover:border-white/10 transition-colors"
                  >
                    <div className={cn(
                      "w-1 h-1 rounded-full shrink-0",
                      task.priority === "Alta" ? "bg-red-400" : task.priority === "Média" ? "bg-[#2563EB]" : "bg-blue-300"
                    )} />
                    <span className="text-[7px] font-black truncate uppercase tracking-widest">{task.title}</span>
                  </div>
                ))}
                {dateTasks.length > 3 && (
                  <div className="text-[7px] font-black text-gray-600 pl-2 uppercase tracking-widest mt-1">
                    + {dateTasks.length - 3} insights
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCalendar;
