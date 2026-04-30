import React, { useState } from "react";
import { X, Send, Calendar, FileText, User, Target } from "lucide-react";
import { Activity, ActionType } from "../types";
import { ACTION_TYPES } from "../constants";

interface ActivityFormProps {
  activity?: Activity;
  onSave: (activity: Omit<Activity, "id">) => void;
  onClose: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ activity, onSave, onClose }) => {
  const [type, setType] = useState<ActionType>(activity?.type || "Reunião");
  const [description, setDescription] = useState(activity?.description || "");
  const [nextAction, setNextAction] = useState(activity?.nextAction || "");
  const [date, setDate] = useState(
    activity?.date 
      ? new Date(activity.date).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      projectId: activity?.projectId || "", // Will be filled by App.tsx if new
      date: new Date(date).toISOString(),
      type,
      description,
      nextAction,
      responsible: activity?.responsible || "", // Will be filled by App.tsx if new
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0D1220]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1E293B] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-300">
        <div className="p-8 bg-[#0D1220] flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3B82F6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tighter uppercase italic">
                {activity ? "Strategic" : "New"} <span className="text-[#3B82F6] not-italic">Action</span>
              </h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5 italic">
                {activity ? "Atualizar Log do Asset" : "Registrar Auditoria Digital"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                <Target size={14} className="text-[#3B82F6]" />
                Tipo de Ação
              </label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as ActionType)}
                className="w-full px-4 py-3.5 bg-[#0D1220] border border-white/5 rounded-xl text-sm text-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all font-black uppercase italic tracking-tighter"
                required
              >
                {ACTION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                <Calendar size={14} className="text-[#3B82F6]" />
                Data
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#0D1220] border border-white/5 rounded-xl text-sm text-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all font-black uppercase tracking-tighter"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
              <FileText size={14} className="text-[#3B82F6]" />
              Descrição da Atividade
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que foi feito nesta etapa?"
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-xl text-sm font-black text-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all min-h-[100px] placeholder:text-slate-700 resize-none italic"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
              <Send size={14} className="text-[#3B82F6]" />
              Próxima Ação
            </label>
            <input 
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Qual o próximo passo?"
              className="w-full px-4 py-3 bg-[#0D1220] border border-white/5 rounded-xl text-sm font-black text-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all placeholder:text-slate-700 italic"
              required
            />
          </div>

          <div className="pt-6 flex items-center gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all italic"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-[#3B82F6] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 italic"
            >
              <Send size={18} />
              Confirmar Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;
