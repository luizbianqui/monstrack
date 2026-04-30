import React, { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Users, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  History, 
  FileText, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Loader2,
  Edit2,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { Project, Activity, ActionType } from "../types";
import { ACTION_TYPES } from "../constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { isValid } from "date-fns";
import ReactMarkdown from "react-markdown";

import ActivityForm from "./ActivityForm";

interface ProjectDetailProps {
  project: Project;
  activities: Activity[];
  onBack: () => void;
  onAddActivity: (activity: Omit<Activity, "id">) => void;
  onUpdateActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onUpdateProject: (project: Project) => void;
  onGoToReport: () => void;
  onGenerateSummary: (project: Project, activities: Activity[]) => Promise<string>;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  activities, 
  onBack, 
  onAddActivity, 
  onUpdateActivity,
  onDeleteActivity,
  onUpdateProject,
  onGoToReport,
  onGenerateSummary
}) => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>(undefined);

  const safeFormat = (dateStr: string | undefined, formatStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (!isValid(date)) return "Data inválida";
    return format(date, formatStr, { locale: ptBR });
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const summary = await onGenerateSummary(project, activities);
      setAiSummary(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 hover:border-white/10 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-[#F5F7FA] tracking-tighter font-display uppercase italic">
              {project.name.split(' ')[0]} <span className="text-[#3B82F6] not-italic">{project.name.split(' ').slice(1).join(' ') || "Project"}</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{project.category}</span>
              <span className="w-1 h-1 bg-[#3B82F6] rounded-full"></span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                project.priority === "Alta" ? "text-rose-400" :
                project.priority === "Média" ? "text-amber-400" :
                "text-[#3B82F6]"
              )}>{project.priority}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{project.client || "MonsTrack Strategic"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onUpdateProject(project)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-white/5 rounded-lg text-sm font-bold text-[#F5F7FA] hover:bg-[#2D3748] transition-colors"
          >
            <Edit2 size={18} />
            Editar Projeto
          </button>
          <button 
            onClick={onGoToReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-white/5 rounded-lg text-sm font-bold text-[#F5F7FA] hover:bg-[#2D3748] transition-colors"
          >
            <FileText size={18} />
            Gerar Relatório
          </button>
          <button 
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-xl italic",
              isCopilotOpen ? "bg-[#F5F7FA] text-[#0D1220] shadow-white/10" : "bg-[#3B82F6] text-white hover:bg-blue-500 shadow-blue-500/20"
            )}
          >
            <Sparkles size={18} />
            Tactical Copilot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section */}
          <section className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/5">
            <h3 className="text-lg font-black text-[#F5F7FA] tracking-tighter uppercase italic">Dados <span className="text-[#3B82F6] not-italic">Técnicos</span></h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Inteligência Operacional e Status</p>
          </div>
            
            <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8">
              <InfoItem icon={<User size={14} className="text-[#3B82F6]" />} label="Diretor Responsável" value={project.owner} />
              <InfoItem icon={<Calendar size={14} className="text-[#3B82F6]" />} label="Kick-off" value={safeFormat(project.startDate, "dd/MM/yyyy")} />
              <InfoItem icon={<Clock size={14} className="text-[#3B82F6]" />} label="Deadline Final" value={safeFormat(project.deadline, "dd/MM/yyyy")} />
              <InfoItem icon={<Users size={14} className="text-[#3B82F6]" />} label="Asset Team" value={`${project.team.length} Integrantes`} />
              <InfoItem icon={<CheckCircle2 size={14} className="text-[#3B82F6]" />} label="Progresso" value={`${project.progress}%`} />
              <InfoItem 
                icon={<Target size={14} className="text-[#3B82F6]" />} 
                label="Governança" 
                value={project.status} 
              />
            </div>

            <div className="p-8 bg-black/20 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Immediate Action</label>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#3B82F6]">
                    <ArrowLeft className="rotate-180" size={14} />
                  </div>
                  <p className="text-sm font-black text-[#F5F7FA] uppercase italic opacity-90">{project.nextAction}</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Blockers and Risks</label>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center",
                    project.blockers ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  )}>
                    <AlertCircle size={14} />
                  </div>
                  <p className={cn(
                    "text-sm font-black uppercase italic",
                    project.blockers ? "text-rose-400" : "text-emerald-400"
                  )}>
                    {project.blockers || "Nenhum risco detectado"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#F5F7FA] tracking-tighter uppercase italic">Linha do <span className="text-[#3B82F6] not-italic">Tempo</span></h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Audit Log e Movimentações</p>
              </div>
              <button 
                onClick={() => setIsActivityFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#F5F7FA] hover:bg-[#2D3748] shadow-lg shadow-black/20 transition-all"
              >
                <Plus size={16} />
                Nova Ação
              </button>
            </div>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <ActivityItem 
                    key={activity.id} 
                    activity={activity} 
                    isLast={idx === activities.length - 1} 
                    onEdit={() => {
                      setEditingActivity(activity);
                      setIsActivityFormOpen(true);
                    }}
                    onDelete={() => onDeleteActivity(activity.id)}
                  />
                ))
              ) : (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center ml-8">
                  <p className="text-sm text-gray-400 font-medium">Nenhuma atividade registrada ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Copilot */}
        <div className="space-y-6">
          <div className={cn(
            "bg-[#1E293B] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300",
            isCopilotOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none hidden"
          )}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#2563EB]/10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] flex items-center gap-2 italic">
                <Sparkles size={16} />
                Tactical Insights
              </h4>
              <button 
                onClick={() => setIsCopilotOpen(false)}
                className="p-1 hover:bg-white/5 rounded-md transition-colors text-white"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] text-gray-400 leading-relaxed font-bold uppercase tracking-widest">
                  Use a inteligência estratégica para analisar o status e acelerar resultados.
                </p>
                <button 
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#2563EB] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Auditoria Digital em Curso...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      AUDITORIA ESTRATÉGICA
                    </>
                  )
                }
                </button>
              </div>

              {aiSummary && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/5 shadow-inner">
                  <div className="prose prose-sm prose-invert max-w-none text-xs font-medium text-gray-300 leading-relaxed">
                    <ReactMarkdown>{aiSummary}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="COMANDO DE VOZ OU TEXTO..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 placeholder:text-gray-600"
                  />
                  <button className="p-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!isCopilotOpen && (
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0D1220] rounded-[2rem] p-8 text-white shadow-2xl shadow-black/40 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                  <Sparkles size={24} className="text-[#2563EB]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black tracking-tight leading-tight uppercase italic">Auditoria <span className="text-[#2563EB]">Externa</span></h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    Ative o Tactical Copilot para auditoria estratégica e geração de insights imediatos sobre o Asset.
                  </p>
                </div>
                <button 
                  onClick={() => setIsCopilotOpen(true)}
                  className="w-full py-4 bg-[#2563EB] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  ATIVAR TACTICAL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isActivityFormOpen && (
        <ActivityForm 
          activity={editingActivity}
          onSave={(data) => {
            if (editingActivity) {
              onUpdateActivity({ ...editingActivity, ...data });
            } else {
              onAddActivity(data);
            }
            setIsActivityFormOpen(false);
            setEditingActivity(undefined);
          }}
          onClose={() => {
            setIsActivityFormOpen(false);
            setEditingActivity(undefined);
          }}
        />
      )}
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
      {icon}
      {label}
    </label>
    <p className="text-sm font-black text-[#F5F7FA] uppercase tracking-tight">{value}</p>
  </div>
);

const ActivityItem: React.FC<{ 
  activity: Activity; 
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ activity, isLast, onEdit, onDelete }) => {
  const safeFormat = (dateStr: string | undefined, formatStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (!isValid(date)) return "Data inválida";
    return format(date, formatStr, { locale: ptBR });
  };

  return (
    <div className="relative pl-12 group">
      <div className="absolute left-2.5 top-2 w-3 h-3 bg-[#0D1220] border-2 border-[#2563EB] rounded-full z-10 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
      <div className="bg-[#1E293B]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-lg space-y-4 hover:border-[#2563EB]/30 transition-all hover:shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-[#2563EB]/10 text-[9px] font-black text-[#2563EB] uppercase tracking-[0.15em] rounded-md">{activity.type}</span>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{safeFormat(activity.date, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <User size={12} />
              {activity.responsible}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={onEdit}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-[#2563EB] transition-colors"
                title="Editar atividade"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={onDelete}
                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                title="Excluir atividade"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
        <p className="text-sm font-bold text-[#F5F7FA] leading-relaxed uppercase tracking-tight">{activity.description}</p>
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em]">Strategic Next Step:</span>
          <span className="text-[10px] font-black text-[#F5F7FA] uppercase tracking-tight italic">{activity.nextAction}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
