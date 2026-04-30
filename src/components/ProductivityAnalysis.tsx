import React, { useMemo } from "react";
import { 
  TrendingUp, 
  CheckCircle2, 
  Activity as ActivityIcon, 
  ArrowUpRight, 
  Clock, 
  Calendar,
  Briefcase,
  Layers,
  Zap,
  BarChart2
} from "lucide-react";
import { cn } from "../lib/utils";
import { Project, Task, Activity } from "../types";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  subDays, 
  isSameDay 
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductivityAnalysisProps {
  projects: Project[];
  tasks: Task[];
  activities: Activity[];
}

const ProductivityAnalysis: React.FC<ProductivityAnalysisProps> = ({ 
  projects, 
  tasks, 
  activities 
}) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { locale: ptBR });
  const weekEnd = endOfWeek(now, { locale: ptBR });

  const stats = useMemo(() => {
    const weeklyActivities = activities.filter(a => 
      isWithinInterval(new Date(a.date), { start: weekStart, end: weekEnd })
    );

    const completedTasksThisWeek = tasks.filter(t => 
      t.completed && 
      t.updatedAt && 
      isWithinInterval(new Date(t.updatedAt), { start: weekStart, end: weekEnd })
    ).length;

    const projectMovements = weeklyActivities.filter(a => 
      a.description.includes("movido") || a.description.includes("organizado")
    ).length;

    const newProjects = projects.filter(p => 
      isWithinInterval(new Date(p.createdAt), { start: weekStart, end: weekEnd })
    ).length;

    // Productivity Score (0-100)
    // Formula: (tasks * 10 + activities * 5 + movements * 2) / targets
    const score = Math.min(100, Math.round((completedTasksThisWeek * 15 + weeklyActivities.length * 5 + projectMovements * 10) / 1.5));

    return {
      weeklyActivities: weeklyActivities.length,
      completedTasksThisWeek,
      projectMovements,
      newProjects,
      score
    };
  }, [activities, tasks, projects, weekStart, weekEnd]);

  const activityByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
    return days.map(day => {
      const dayActivities = activities.filter(a => isSameDay(new Date(a.date), day)).length;
      return {
        label: format(day, "EEE", { locale: ptBR }),
        count: dayActivities,
        fullDate: format(day, "dd/MM")
      };
    });
  }, [activities]);

  const maxActivity = Math.max(...activityByDay.map(d => d.count), 1);

  return (
    <div className="space-y-8 pb-20 animate-executive">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#F5F7FA] tracking-tighter font-display uppercase italic">
            Productivity <span className="text-[#3B82F6] not-italic">Analysis</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic opacity-80">ACOMPANHAMENTO DE MOVIMENTAÇÕES E RESULTADOS SEMANAIS</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none text-right italic">Período de Análise</span>
             <span className="text-xs font-black text-[#3B82F6] flex items-center gap-1.5 mt-1 justify-end uppercase tracking-tight italic">
               <Calendar size={14} />
               {format(weekStart, "dd MMM")} - {format(weekEnd, "dd MMM")}
             </span>
          </div>
          <div className="p-3 bg-[#1E293B] border border-white/5 rounded-2xl text-[#3B82F6] shadow-lg shadow-blue-500/10">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Main Score & High Level Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden flex flex-col md:flex-row">
          <div className="p-10 flex-1 border-r border-white/5">
            <div className="mb-8">
              <h3 className="text-lg font-black text-[#F5F7FA] tracking-tighter uppercase italic">Desempenho <span className="text-[#3B82F6] not-italic">Semanal</span></h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Sua performance nos últimos 7 dias</p>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-6xl font-black text-[#F5F7FA] tracking-tighter leading-none">{stats.score}</span>
              <div className="mb-1">
                <span className="text-sm font-black text-emerald-500 flex items-center gap-1 italic">
                  <TrendingUp size={14} />
                  +12%
                </span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight italic">vs semana anterior</span>
              </div>
            </div>
            <div className="mt-10 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] italic">
                  <span className="text-slate-500">Meta de Entregas</span>
                  <span className="text-[#3B82F6]">{Math.min(100, Math.round((stats.completedTasksThisWeek / 10) * 100))}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#3B82F6] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                    style={{ width: `${Math.min(100, (stats.completedTasksThisWeek / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-10 bg-white/5 w-full md:w-80 grid grid-cols-1 gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Tarefas Concluídas</span>
              <span className="text-3xl font-black text-[#F5F7FA] tracking-tight">{stats.completedTasksThisWeek}</span>
              <span className="text-[9px] font-black text-emerald-500 uppercase mt-1 italic tracking-widest">Ritmo Elevado</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Movimentações</span>
              <span className="text-3xl font-black text-[#F5F7FA] tracking-tight">{stats.projectMovements}</span>
              <span className="text-[9px] font-black text-[#3B82F6] uppercase mt-1 italic tracking-widest">Foco em Fluxo</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1E293B] to-[#0D1220] rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          <div className="space-y-6 relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/5">
              <Zap size={28} className="text-[#3B82F6]" />
            </div>
            <h4 className="text-2xl font-black tracking-tighter leading-tight uppercase italic">Agilidade <span className="text-[#3B82F6] not-italic">Estratégica</span></h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed mt-2 italic opacity-80">
              Sua velocidade de entrega aumentou 15% em relação ao baseline mensal.
            </p>
          </div>
          <button className="mt-10 w-full py-4 bg-[#3B82F6] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all relative z-10 italic">
            DETALHAR MÉTRICAS
          </button>
        </div>
      </div>

      {/* Charts & Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 p-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-lg font-black text-[#F5F7FA] tracking-tighter uppercase italic">Volume de <span className="text-[#3B82F6] not-italic">Atividades</span></h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Métrica histórica de 7 dias</p>
              </div>
               <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Ações</span>
                </div>
              </div>
            </div>

            <div className="h-56 flex items-end justify-between gap-4">
              {activityByDay.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full flex justify-center items-end h-40">
                    <div 
                      className="w-full max-w-[44px] bg-white/5 rounded-t-xl group-hover:bg-[#3B82F6]/5 transition-colors absolute bottom-0 h-full border-x border-t border-transparent group-hover:border-white/5"
                    />
                    <div 
                      className={cn(
                        "w-full max-w-[44px] bg-[#3B82F6] rounded-t-xl transition-all duration-700 relative z-10",
                        i === activityByDay.length - 1 ? "shadow-lg shadow-blue-500/30" : ""
                      )}
                      style={{ height: `${(day.count / maxActivity) * 100}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0D1220] text-white text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-2xl italic tracking-widest">
                        {day.count} AÇÕES
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-[#F5F7FA] uppercase italic tracking-tighter">{day.label}</span>
                    <span className="text-[9px] font-black text-slate-500 tracking-widest">{day.fullDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-2xl shadow-black/20 p-8 hover:shadow-blue-500/10 transition-all group">
               <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-[#3B82F6]">
                  <Briefcase size={22} />
                </div>
                <ArrowUpRight size={18} className="text-slate-600 group-hover:text-[#3B82F6] transition-colors" />
              </div>
              <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Ativações Semanais</h5>
              <p className="text-3xl font-black text-[#F5F7FA] mt-1 tracking-tighter">{stats.newProjects}</p>
              <p className="text-[9px] text-slate-500 font-black mt-2 uppercase italic tracking-widest opacity-80">Projetos inseridos na semana</p>
            </div>

            <div className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-2xl shadow-black/20 p-8 hover:shadow-emerald-500/10 transition-all group">
               <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={22} />
                </div>
                <ArrowUpRight size={18} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Taxa de Conclusão</h5>
              <p className="text-3xl font-black text-[#F5F7FA] mt-1 tracking-tighter">{Math.round((stats.completedTasksThisWeek / Math.max(stats.weeklyActivities, 1)) * 100)}%</p>
              <p className="text-[9px] text-emerald-500/80 font-black mt-2 uppercase italic tracking-widest">Eficiência de entregas</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 h-full">
          <section className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-white/5 bg-white/5">
              <h3 className="text-lg font-black text-[#F5F7FA] tracking-tighter uppercase italic">Movimentações <span className="text-[#3B82F6] not-italic">Recentes</span></h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Histórico de ações em tempo real</p>
            </div>
            <div className="divide-y divide-white/5 bg-[#0D1220]/20 flex-1 overflow-y-auto">
              {activities
                .filter(a => a.description.includes("movido") || a.description.includes("concluída") || a.description.includes("criada"))
                .slice(0, 10)
                .map((activity) => (
                <div key={activity.id} className="p-5 hover:bg-white/5 transition-all group border-l-2 border-transparent hover:border-[#3B82F6]">
                  <div className="flex gap-4">
                    <div className={cn(
                      "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                      activity.description.includes("concluída") ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                      activity.description.includes("movido") ? "bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-blue-400"
                    )} />
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-xs font-black text-[#F5F7FA] leading-tight break-words uppercase tracking-tight italic group-hover:text-white transition-colors">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                          {format(new Date(activity.date), "EEE, HH:mm", { locale: ptBR })}
                        </span>
                        <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                        <span className="text-[9px] font-black text-[#3B82F6] uppercase truncate max-w-[120px] italic tracking-widest">
                          {projects.find(p => p.id === activity.projectId)?.name || "M-STRATEGIC"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="p-16 text-center">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] italic">Sem registros no log</p>
                </div>
              )}
            </div>
          </section>

          <div className="bg-[#3B82F6]/5 rounded-[2rem] p-8 border border-[#3B82F6]/10 shadow-lg shadow-blue-500/5">
            <h5 className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
              <TrendingUp size={16} />
              Inteligência de Fluxo
            </h5>
            <p className="text-[11px] font-black text-slate-400 leading-relaxed uppercase tracking-widest italic opacity-90">
              Projetos com alta taxa de movimentação e baixas entregas indicam gargalos de decisão. Priorize auditorias estratégicas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityAnalysis;
