import React, { useState } from "react";
import { X, Save, AlertCircle, Trash2 } from "lucide-react";
import { Project, Category, Priority, ProjectStatus } from "../types";
import { CATEGORIES, STATUSES, PRIORITIES } from "../constants";
import { cn } from "../lib/utils";

interface ProjectFormProps {
  project?: Project;
  onSave: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    client: project?.client || "",
    category: project?.category || "Institucional" as Category,
    priority: project?.priority || "Média" as Priority,
    status: project?.status || "Não iniciado" as ProjectStatus,
    progress: project?.progress || 0,
    objective: project?.objective || "",
    expectedResult: project?.expectedResult || "",
    owner: project?.owner || "",
    team: project?.team.join(", ") || "",
    deadline: project?.deadline || new Date().toISOString().split("T")[0],
    startDate: project?.startDate || new Date().toISOString().split("T")[0],
    nextAction: project?.nextAction || "",
    blockers: project?.blockers || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.owner) newErrors.owner = "Responsável é obrigatório";
    if (!formData.category) newErrors.category = "Categoria é obrigatória";
    if (!formData.status) newErrors.status = "Status é obrigatório";
    if (!formData.nextAction) newErrors.nextAction = "Próxima ação é obrigatória";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        team: formData.team.split(",").map(t => t.trim()).filter(t => t !== "")
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
            {project ? "Strategic" : "New"} <span className="text-[#3B82F6] not-italic">Project</span>
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Nome do Projeto *</label>
              <input 
                id="project-name-input"
                type="text" 
                placeholder="Ex: Expansão Unidade Industrial"
                className={cn(
                  "w-full px-4 py-3 bg-[#0D1220] border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700",
                  errors.name ? "border-rose-500/50 bg-rose-500/5" : "border-white/5"
                )}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Cliente / Org (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ex: MonsTrack Corp"
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Responsável *</label>
              <input 
                id="project-owner-input"
                type="text" 
                placeholder="Nome do gestor do projeto"
                className={cn(
                  "w-full px-4 py-3 bg-[#0D1220] border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700",
                  errors.owner ? "border-rose-500/50 bg-rose-500/5" : "border-white/5"
                )}
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              />
              {errors.owner && <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{errors.owner}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Data de Início</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Prazo Final</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Categoria *</label>
              <select 
                className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Status *</label>
              <select 
                className={cn(
                  "w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                )}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Prioridade</label>
              <select 
                className={cn(
                  "w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                )}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Progresso (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                className={cn(
                  "w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA]"
                )}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              />
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
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Objetivo Estratégico</label>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700 resize-none"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Próxima Ação *</label>
            <input 
              type="text" 
              className={cn(
                "w-full px-4 py-3 bg-[#0D1220] border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-700",
                errors.nextAction ? "border-rose-500/50 bg-rose-500/5" : "border-white/5"
              )}
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
            />
            {errors.nextAction && <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{errors.nextAction}</p>}
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

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {project && onDelete && (
                <button 
                  type="button"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir este projeto estratégico? Esta ação não pode ser desfeita.")) {
                      onDelete(project.id);
                    }
                  }}
                  className="px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic"
                >
                  <Trash2 size={18} />
                  Excluir
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="w-full sm:w-auto px-10 py-4 bg-[#3B82F6] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 italic"
              >
                <Save size={18} />
                Confirmar Asset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
