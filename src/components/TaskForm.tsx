import React, { useState } from "react";
import { X, Save, AlertCircle, ArrowUpRight } from "lucide-react";
import { Task, Priority, Project, Category } from "../types";
import { PRIORITIES, BOARD_COLUMNS, CATEGORIES } from "../constants";
import { cn } from "../lib/utils";

interface TaskFormProps {
  task?: Task;
  projects: Project[];
  defaultStatus?: string;
  onSave: (task: Omit<Task, "id" | "createdAt">) => void;
  onClose: () => void;
  onTransformToProject?: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, projects, defaultStatus, onSave, onClose, onTransformToProject }) => {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    projectId: task?.projectId || "",
    client: task?.client || "",
    category: task?.category || "" as Category,
    priority: task?.priority || "Média" as Priority,
    plannedDate: task?.plannedDate || new Date().toISOString().split("T")[0],
    responsible: task?.responsible || "Account Strategist",
    status: task?.status || defaultStatus || "Backlog da Semana",
    objective: task?.objective || "",
    expectedResult: task?.expectedResult || "",
    team: task?.team?.join(", ") || "",
    nextAction: task?.nextAction || "",
    blockers: task?.blockers || "",
    completed: task?.completed || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Título é obrigatório";
    if (!formData.responsible) newErrors.responsible = "Responsável é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const selectedProject = projects.find(p => p.id === formData.projectId);
      onSave({
        ...formData,
        projectName: selectedProject?.name,
        team: formData.team.split(",").map(t => t.trim()).filter(t => t !== ""),
        completed: formData.status === "Concluído"
      });
    } else {
      alert("Por favor, preencha todos os campos obrigatórios marcados com *");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0D1220]/80 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto pt-8">
      <div className="bg-[#1E293B] rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/5 overflow-hidden mb-8">
        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#F5F7FA] tracking-tighter uppercase italic">
            {task ? "Strategic" : "New"} <span className="text-[#3B82F6] not-italic">Task</span>
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Título da Tarefa *</label>
              <input 
                id="task-title-input"
                type="text" 
                placeholder="Ex: Revisar cronograma de produção"
                className={cn(
                  "w-full px-4 py-3 bg-[#0D1220] border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700",
                  errors.title ? "border-rose-500/50 bg-rose-500/5" : "border-white/5"
                )}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Cliente / Org (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ex: MonsTrack Strategic"
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Responsável *</label>
              <input 
                id="task-responsible-input"
                type="text" 
                placeholder="Nome do responsável"
                className={cn(
                  "w-full px-4 py-3 bg-[#0D1220] border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700",
                  errors.responsible ? "border-rose-500/50 bg-rose-500/5" : "border-white/5"
                )}
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              />
              {errors.responsible && <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{errors.responsible}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Data Planejada</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.plannedDate}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Projeto Vinculado</label>
              <select 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="">Nenhum</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Categoria</label>
              <select 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              >
                <option value="">Nenhuma</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Prioridade</label>
              <select 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Coluna / Status</label>
              <select 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {BOARD_COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Equipe (Nomes separados por vírgula)</label>
            <input 
              type="text" 
              placeholder="Ex: Ana Souza, Pedro Lima, Julia Costa"
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Objetivo da Tarefa</label>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700 resize-none"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Resultado Esperado</label>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700 resize-none"
              value={formData.expectedResult}
              onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Próxima Ação</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700"
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Impedimentos / Riscos</label>
            <input 
              type="text" 
              placeholder="Descreva se houver algo impedindo o progresso"
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700"
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            />
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            {task ? (
              <button
                type="button"
                onClick={() => onTransformToProject?.(task)}
                className="px-4 py-3 text-slate-400 hover:text-[#3B82F6] transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <ArrowUpRight size={14} />
                Transformar em Projeto
              </button>
            ) : <div />}
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-10 py-4 bg-[#3B82F6] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 italic"
              >
                <Save size={18} />
                Confirmar Entrega
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
