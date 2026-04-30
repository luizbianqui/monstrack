import React, { useState, useRef } from "react";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent, 
  DragOverEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  LayoutGrid, 
  MoreVertical, 
  Filter, 
  Search, 
  Calendar, 
  User,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Trash2,
  CalendarDays,
  RefreshCw
} from "lucide-react";
import { cn } from "../lib/utils";
import { DashboardKPIs, Task, Priority, Project } from "../types";
import { BOARD_COLUMNS, PRIORITIES } from "../constants";
import ProjectColumn from "./ProjectColumn";
import TaskTimeline from "./TaskTimeline";
import TaskCalendar from "./TaskCalendar";
import { 
  format, 
  startOfWeek, 
  addDays, 
  isToday as isDateToday,
  startOfDay,
  isPast,
  isSameDay as areDatesSameDay
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardProps {
  kpis: DashboardKPIs;
  tasks: Task[];
  projects: Project[];
  onAddTask: (column: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (task: Task) => void;
  onMoveProject: (projectId: string, newStatus: string) => void;
  onMoveTask: (taskId: string, newStatus: string) => void;
  onSelectProject: (project: Project) => void;
}

type FilterType = 'all' | 'in-progress' | 'high-priority' | 'blockers' | 'overdue' | 'today';

const Dashboard: React.FC<DashboardProps> = ({ 
  kpis, 
  tasks, 
  projects, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onToggleTask,
  onMoveProject,
  onMoveTask,
  onSelectProject
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'boards' | 'timeline' | 'calendar'>('boards');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToColumn = (columnId: string) => {
    const element = document.getElementById(`column-${columnId}`);
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const scrollLeft = element.offsetLeft - container.offsetLeft;
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const now = new Date();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedProjects({});
    } else {
      const allExpanded = projects.reduce((acc, p) => ({ ...acc, [p.id]: true }), {});
      setExpandedProjects(allExpanded);
    }
    setIsAllExpanded(!isAllExpanded);
  };

  const isProjectMatch = (project: Project) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in-progress') return project.status === "Em andamento";
    if (activeFilter === 'high-priority') return project.priority === "Alta";
    if (activeFilter === 'blockers') return project.blockers && project.blockers.trim() !== "" && project.blockers.toUpperCase() !== "NENHUM";
    if (activeFilter === 'overdue') {
      const deadline = new Date(project.deadline);
      return deadline < now && project.status !== "Concluído";
    }
    if (activeFilter === 'today') {
      const updated = new Date(project.updatedAt);
      return updated.toDateString() === now.toDateString();
    }
    return true;
  };

  const isTaskMatch = (task: Task) => {
    if (viewMode === 'timeline' || viewMode === 'calendar') {
      if (!areDatesSameDay(new Date(task.plannedDate), selectedDate)) return false;
    }

    if (activeFilter === 'all') return true;
    if (activeFilter === 'high-priority') return task.priority === "Alta";
    if (activeFilter === 'overdue') {
      const plannedDate = new Date(task.plannedDate);
      return plannedDate < now && !task.completed;
    }
    if (activeFilter === 'today') {
      const updated = new Date(task.updatedAt || task.createdAt);
      return updated.toDateString() === now.toDateString();
    }
    // For other filters, we might show tasks if the project matches, 
    // or keep them if they don't have a specific KPI category
    return true; 
  };

  const filteredProjects = projects.filter(isProjectMatch);
  
  // If a project matches, show its matching tasks. 
  // If a project doesn't match but has a matching task, should we show it? 
  // Rule: only show tasks that match the filter if a filter is active
  const getTasksByProject = (projectId: string) => {
    return tasks.filter(t => t.projectId === projectId && isTaskMatch(t));
  };

  const unlinkedTasks = tasks.filter(t => (!t.projectId || t.projectId === "") && isTaskMatch(t));

  const handleFilterToggle = (filter: FilterType) => {
    setActiveFilter(prev => prev === filter ? 'all' : filter);
  };

  const weeklyColumns = [
    { id: "Backlog da Semana", title: "BACKLOG DA SEMANA" },
    { id: "Segunda", title: "SEGUNDA-FEIRA" },
    { id: "Terça", title: "TERÇA-FEIRA" },
    { id: "Quarta", title: "QUARTA-FEIRA" },
    { id: "Quinta", title: "QUINTA-FEIRA" },
    { id: "Sexta", title: "SEXTA-FEIRA" },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a column
    if (weeklyColumns.some(col => col.id === overId)) {
      const project = projects.find(p => p.id === activeId);
      if (project) {
        onMoveProject(activeId, overId);
      } else {
        const task = tasks.find(t => t.id === activeId);
        if (task) {
          onMoveTask(activeId, overId);
        }
      }
    }
  };

  const getWeeklyItems = (day: string) => {
    const dayProjects = projects.filter(p => p.weeklyStatus === day);
    const dayTasks = tasks.filter(t => t.status === day);
    
    return [
      ...dayProjects.map(p => ({ id: p.id, type: 'project' as const, data: p })),
      ...dayTasks.map(t => ({ id: t.id, type: 'task' as const, data: t }))
    ];
  };

  return (
    <div className="space-y-8 pb-20 animate-executive">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#F5F7FA] tracking-tighter font-display uppercase italic">
            Strategic <span className="text-[#2563EB] not-italic">Dashboard</span>
          </h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-70">ACOMPANHE. CONTROLE. EVOLUA.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Status do Sistema</span>
            <span className="text-xs font-bold text-green-500 flex items-center gap-1.5 mt-1 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Operacional
            </span>
          </div>
          <button 
            onClick={() => setActiveFilter('all')}
            className="p-3 bg-[#1E293B] border border-white/5 rounded-2xl text-gray-400 hover:text-[#2563EB] hover:border-[#2563EB]/30 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={activeFilter === 'all' ? "animate-spin-slow text-[#2563EB]" : ""} />
          </button>
        </div>
      </header>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard 
          label="Total Projetos" 
          value={kpis.totalProjects} 
          icon={<BarChart3 size={24} />} 
          color="blue" 
          isActive={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        />
        <KPICard 
          label="Em Andamento" 
          value={kpis.inProgress} 
          icon={<Clock size={24} />} 
          color="orange" 
          isActive={activeFilter === 'in-progress'}
          onClick={() => handleFilterToggle('in-progress')}
        />
        <KPICard 
          label="Alta Prioridade" 
          value={kpis.highPriority} 
          icon={<AlertCircle size={24} />} 
          color="red" 
          isActive={activeFilter === 'high-priority'}
          onClick={() => handleFilterToggle('high-priority')}
        />
        <KPICard 
          label="Com Impedimentos" 
          value={kpis.withBlockers} 
          icon={<AlertCircle size={24} />} 
          color="purple" 
          isActive={activeFilter === 'blockers'}
          onClick={() => handleFilterToggle('blockers')}
        />
        <KPICard 
          label="Atrasados" 
          value={kpis.overdue} 
          icon={<Clock size={24} />} 
          color="rose" 
          isActive={activeFilter === 'overdue'}
          onClick={() => handleFilterToggle('overdue')}
        />
        <KPICard 
          label="Atualizações Hoje" 
          value={kpis.updatesToday} 
          icon={<CheckCircle2 size={24} />} 
          color="green" 
          isActive={activeFilter === 'today'}
          onClick={() => handleFilterToggle('today')}
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between bg-[#1E293B]/60 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-sm max-w-fit mx-auto sm:mx-0">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setViewMode('boards')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'boards' ? "bg-[#151619] text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
            )}
          >
            Modo Quadros
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'timeline' ? "bg-[#151619] text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
            )}
          >
            Cronograma
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'calendar' ? "bg-[#151619] text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
            )}
          >
            Calendário
          </button>
        </div>
      </div>

      {/* Content based on View Mode */}
      {viewMode === 'boards' && (
        <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-[#F5F7FA] uppercase flex items-center gap-2">
            <CalendarDays size={18} className="text-[#2563EB]" />
            Planejamento Semanal (Projetos)
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <LayoutGrid size={14} />
              <span>Arraste os projetos para organizar a semana</span>
            </div>
          </div>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {weeklyColumns.map((column) => {
                const dayItems = getWeeklyItems(column.id).filter(item => {
                  if (item.type === 'project') return isProjectMatch(item.data as Project);
                  return isTaskMatch(item.data as Task);
                });

                return (
                  <div key={column.id} id={`column-${column.id}`}>
                    <ProjectColumn 
                      id={column.id}
                      title={column.title}
                      items={dayItems}
                      onSelectProject={onSelectProject}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                    />
                  </div>
                );
              })}
          </div>
        </DndContext>

        <div className="mt-8 mb-12 flex justify-center w-full">
          <div className="bg-[#141414]/90 backdrop-blur-sm px-8 py-5 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/40 flex items-center justify-between w-full max-w-5xl overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3 px-4 border-r border-white/10 mr-4 shrink-0">
              <LayoutGrid size={16} className="text-[#3B82F6]" />
              <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] whitespace-nowrap italic">MonsTrack Board</span>
            </div>
            <div className="flex items-center justify-around flex-1 gap-2 min-w-max">
              {weeklyColumns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => scrollToColumn(col.id)}
                  className="flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all hover:bg-white/5 group border border-transparent hover:border-white/5"
                >
                  <span className="text-[10px] font-black text-white/40 group-hover:text-[#3B82F6] uppercase tracking-[0.2em] transition-colors italic leading-none">
                    {col.id === "Backlog da Semana" ? "BKLOG" : col.id.substring(0, 3).toUpperCase()}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-[#3B82F6] transition-all duration-300 shadow-[0_0_8px_transparent] group-hover:shadow-blue-500/50" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {viewMode === 'timeline' && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TaskTimeline 
            tasks={tasks} 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </section>
      )}

      {viewMode === 'calendar' && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TaskCalendar 
            tasks={tasks} 
            projects={projects}
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </section>
      )}

      {/* Lista de Projetos e Tarefas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Briefcase size={20} className="text-[#2563EB]" />
              Projetos & Tarefas
            </h3>
            <button 
              onClick={() => onAddTask("Backlog")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus size={14} />
              Nova Tarefa
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleAll}
              className="text-[10px] font-bold text-gray-500 hover:text-[#F27D26] uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              {isAllExpanded ? "Recolher Tudo" : "Expandir Tudo"}
            </button>
            {activeFilter !== 'all' && (
              <button 
                onClick={() => setActiveFilter('all')}
                className="text-[10px] font-black text-white bg-[#F27D26] px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm animate-pulse"
              >
                Limpar Filtro
              </button>
            )}
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {filteredProjects.length} Projetos
            </span>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {tasks.filter(isTaskMatch).length} Tarefas
            </span>
          </div>
        </div>

        <div className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Projeto / Tarefa</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Planejamento</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Prioridade</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progresso / Data</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects
                  .sort((a, b) => {
                    const priorityOrder = { "Alta": 0, "Média": 1, "Baixa": 2 };
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    }
                    return a.name.localeCompare(b.name);
                  })
                  .map((project) => {
                    const projectTasks = getTasksByProject(project.id);
                    const isExpanded = expandedProjects[project.id];
                    
                    return (
                      <React.Fragment key={project.id}>
                        <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => toggleProject(project.id)}>
                          <td className="px-4 py-4 text-center">
                            {projectTasks.length > 0 && (
                              <div className="flex items-center justify-center">
                                {isExpanded ? <ChevronDown size={14} className="text-gray-300" /> : <ChevronRight size={14} className="text-gray-300" />}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div 
                              className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProject(project);
                              }}
                            >
                              <span className="text-sm font-black text-[#F5F7FA] group-hover:text-[#2563EB] transition-colors uppercase tracking-tight">
                                {project.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {project.client || "MonsTrack Strategic"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                              project.status === "Em andamento" ? "bg-blue-500/10 text-blue-400" :
                              project.status === "Concluído" ? "bg-green-500/10 text-green-400" :
                              project.status === "Aguardando" ? "bg-orange-500/10 text-orange-400" :
                              project.status === "Não iniciado" ? "bg-gray-500/10 text-gray-400" :
                              "bg-red-500/10 text-red-400"
                            )}>
                              {project.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveProject(project.id, project.weeklyStatus ? "" : "Backlog da Semana");
                            }}
                            className={cn(
                              "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all text-[9px] font-black uppercase tracking-[0.1em] border min-w-[90px]",
                              project.weeklyStatus 
                                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20" 
                                : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10"
                            )}
                          >
                            {project.weeklyStatus ? (
                              project.weeklyStatus.split('-')[0].toUpperCase()
                            ) : (
                              <>
                                <Plus size={10} />
                                ATIVAR
                              </>
                            )}
                          </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              project.priority === "Alta" ? "text-red-400" :
                              project.priority === "Média" ? "text-orange-400" :
                              "text-blue-400"
                            )}>
                              {project.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[70px]">
                                <div 
                                  className="h-full bg-[#2563EB]" 
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-[#F5F7FA]">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black text-gray-400 uppercase">
                                {project.owner.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{project.owner.toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">{projectTasks.length} TAREFAS</span>
                              <ChevronRight size={14} className="text-gray-300" />
                            </div>
                          </td>
                        </tr>
                                      {isExpanded && projectTasks.length > 0 && (
                          projectTasks.map((task) => (
                            <tr 
                              key={task.id} 
                              className="bg-white/5 hover:bg-white/10 transition-colors group/task border-b border-white/5 cursor-pointer"
                              onClick={() => onEditTask(task)}
                            >
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center ml-4">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onToggleTask(task); }}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  >
                                    <CheckSquare size={16} className={cn(
                                      task.completed ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                                    )} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className={cn(
                                    "text-sm font-bold text-gray-600 tracking-tight",
                                    task.completed && "line-through text-gray-400 font-medium"
                                  )}>
                                    {task.title}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                    {task.description || "Sem descrição"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                                  task.status === "Concluído" ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                                )}>
                                  {task.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveTask(task.id, (task.status === "Backlog" || task.status === "Concluído") ? "Backlog da Semana" : "Backlog");
                                  }}
                                  className={cn(
                                    "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all text-[9px] font-black uppercase tracking-[0.1em] border min-w-[90px]",
                                    (task.status !== "Backlog" && task.status !== "Concluído")
                                      ? "bg-[#F27D26] text-white border-[#F27D26] shadow-sm" 
                                      : "bg-[#F5F5F5] text-gray-400 border-transparent hover:bg-gray-200"
                                  )}
                                >
                                  {(task.status !== "Backlog" && task.status !== "Concluído") ? (
                                    task.status.split(' ')[0].toUpperCase()
                                  ) : (
                                    <>
                                      <Plus size={10} />
                                      ATIVAR
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  task.priority === "Alta" ? "text-red-500" :
                                  task.priority === "Média" ? "text-orange-500" :
                                  "text-blue-500"
                                )}>
                                  {task.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-black text-gray-400 tracking-tight">
                                  {format(new Date(task.plannedDate), "dd/MM/yyyy")}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400 uppercase">
                                    {task.responsible.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{task.responsible}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                                  >
                                    <ExternalLink size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </React.Fragment>
                    );
                  })}

                {unlinkedTasks.length > 0 && (
                  <React.Fragment>
                    <tr className="bg-[#F5F5F5]/50">
                      <td colSpan={8} className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-t border-gray-100">
                        Tarefas Sem Projeto Vinculado
                      </td>
                    </tr>
                    {unlinkedTasks.map((task) => (
                      <tr 
                        key={task.id} 
                        className="hover:bg-gray-100/50 transition-colors group/task cursor-pointer border-b border-gray-50"
                        onClick={() => onEditTask(task)}
                      >
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleTask(task); }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <CheckSquare size={18} className={cn(
                              task.completed ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                            )} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-sm font-black text-[#141414] tracking-tight group-hover/task:text-[#F27D26] transition-colors",
                              task.completed && "line-through text-gray-400 font-medium"
                            )}>
                              {task.title}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                              {task.description || "Sem descrição"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                            task.status === "Concluído" ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                          )}>
                            {task.status}
                          </span>
                               <td className="px-6 py-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveTask(task.id, (task.status === "Backlog" || task.status === "Concluído") ? "Backlog da Semana" : "Backlog");
                            }}
                            className={cn(
                              "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all text-[9px] font-black uppercase tracking-[0.1em] border min-w-[90px]",
                              (task.status !== "Backlog" && task.status !== "Concluído")
                                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20" 
                                : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10"
                            )}
                          >
                            {(task.status !== "Backlog" && task.status !== "Concluído") ? (
                              task.status.split(' ')[0].toUpperCase()
                            ) : (
                              <>
                                <Plus size={10} />
                                ATIVAR
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            task.priority === "Alta" ? "text-red-400" :
                            task.priority === "Média" ? "text-orange-400" :
                            "text-blue-400"
                          )}>
                            {task.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-gray-400 tracking-tight">
                            {format(new Date(task.plannedDate), "dd/MM/yyyy")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-gray-400 uppercase">
                              {task.responsible.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{task.responsible.toUpperCase()}</span>
                          </div>
                        </td>                      </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                              className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                            >
                              <ExternalLink size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                              className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <div className="h-20" />
    </div>
  );
};

interface KPICardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, color, isActive, onClick }) => {
  const colorMap: Record<string, string> = {
    blue: "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/10",
    orange: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    red: "text-rose-500 border-rose-500/20 bg-rose-500/10",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    green: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
  };

  const activeGlow: Record<string, string> = {
    blue: "border-[#3B82F6]/50 shadow-blue-500/30",
    orange: "border-amber-500/50 shadow-amber-500/30",
    red: "border-rose-500/50 shadow-rose-500/30",
    purple: "border-purple-500/50 shadow-purple-500/30",
    rose: "border-rose-500/50 shadow-rose-500/30",
    green: "border-emerald-500/50 shadow-emerald-500/30"
  };

  const activeIcon: Record<string, string> = {
    blue: "bg-[#3B82F6] shadow-blue-500/40",
    orange: "bg-amber-500 shadow-amber-500/40",
    red: "bg-rose-500 shadow-rose-500/40",
    purple: "bg-purple-500 shadow-purple-500/40",
    rose: "bg-rose-500 shadow-rose-500/40",
    green: "bg-emerald-500 shadow-emerald-500/40"
  };

  const currentColor = colorMap[color] || colorMap.blue;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-7 rounded-[2.5rem] border transition-all flex flex-col gap-6 cursor-pointer group relative overflow-hidden",
        isActive 
          ? `bg-[#1E293B] ${activeGlow[color]} shadow-2xl ring-1 ring-white/20 scale-[1.02]` 
          : "bg-[#1E293B] border-white/5 shadow-lg hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 hover:bg-[#263345]"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500", 
        isActive 
          ? `${activeIcon[color]} text-white border-transparent shadow-lg rotate-3` 
          : `bg-white/10 ${currentColor.split(' ')[0]} border-white/10 group-hover:rotate-6 group-hover:scale-110`
      )}>
        {icon}
      </div>
      <div>
        <p className={cn(
          "text-[10px] font-black uppercase tracking-[0.25em] transition-colors italic",
          isActive ? "text-white" : "text-white/90 group-hover:text-white"
        )}>{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
          <div className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-500",
            isActive ? "bg-white shadow-[0_0_15px_white] animate-pulse" : `${currentColor.replace('text', 'bg').split(' ')[0]} opacity-60 group-hover:opacity-100`
          )} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
