import React from "react";
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { cn } from "../lib/utils";
import { Project, Activity } from "../types";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportPageProps {
  projects: Project[];
  activities: Activity[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ 
  projects, 
  activities, 
  selectedProject,
  onSelectProject 
}) => {
  const safeFormat = (dateStr: string | undefined, formatStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (!isValid(date)) return "Data inválida";
    return format(date, formatStr, { locale: ptBR });
  };

  return (
    <div className="space-y-8">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide sidebar, header and selection elements */
          .no-print, 
          header, 
          aside, 
          nav,
          .bg-indigo-50, 
          .lg\\:col-span-1,
          .bg-white.p-6.rounded-2xl.border,
          .flex.items-center.gap-3 { 
            display: none !important; 
          }
          
          /* Full width for report */
          .lg\\:col-span-3 { 
            width: 100% !important;
            grid-column: span 4 / span 4 !important;
          }
          
          /* Remove shadows and borders for clean print */
          .bg-white.rounded-[2.5rem].border { 
            border: none !important;
            shadow: none !important;
            box-shadow: none !important;
          }

          /* Reset margins */
          body, .space-y-8 {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .p-12, .p-8 {
            padding: 20px !important;
          }
        }
      `}} />

      <div className="mb-10">
        <h2 className="text-4xl font-black text-[#F5F7FA] tracking-tighter font-display uppercase italic">
          Relatórios <span className="text-[#3B82F6] not-italic">Estratégicos</span>
        </h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">Geração de documentos técnicos e inteligência corporativa</p>
      </div>

      <div className="bg-[#1E293B]/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 no-print">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center text-[#3B82F6] shadow-lg shadow-blue-500/10">
            <FileText size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#F5F7FA] tracking-tighter uppercase italic">Centro de <span className="text-[#3B82F6] not-italic">Inteligência</span></h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Selecione um projeto para auditoria detalhada</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Project Selection */}
        <div className="lg:col-span-1 space-y-4 no-print">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 italic">Selecionar Projeto</h4>
          <div className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-lg shadow-black/20 overflow-hidden divide-y divide-white/5">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={cn(
                  "w-full p-5 text-left hover:bg-white/5 transition-all flex flex-col gap-1.5",
                  selectedProject?.id === project.id ? "bg-[#3B82F6]/10 border-l-[6px] border-[#3B82F6]" : "border-l-[6px] border-transparent"
                )}
              >
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{project.category}</span>
                <span className="text-sm font-black text-[#F5F7FA] truncate uppercase tracking-tight italic">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main: Report Preview */}
        <div className="lg:col-span-3">
          {selectedProject ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/40 overflow-hidden flex flex-col min-h-[800px]">
              {/* Report Header */}
              <div className="p-12 border-b border-gray-100 flex items-start justify-between">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-blue-500/30">M</div>
                    <div>
                      <h1 className="text-xl font-black text-[#0D1220] tracking-tighter uppercase italic">MONSTRACK <span className="text-[#3B82F6] not-italic">STRATEGIC</span></h1>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic">RELATÓRIO DE STATUS DE PROJETO</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black text-[#0D1220] tracking-tighter uppercase italic">{selectedProject.name}</h2>
                    <p className="text-sm text-slate-400 font-black uppercase tracking-widest italic">{selectedProject.client || "PROJETO INTERNO"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 no-print">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm italic"
                  >
                    <Printer size={16} className="text-[#3B82F6]" />
                    IMPRIMIR
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#0D1220] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-gray-200 italic">
                    <Download size={16} className="text-[#3B82F6]" />
                    BAIXAR PDF
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-12 space-y-16">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-12">
                  <ReportInfoItem label="STATUS ATUAL" value={selectedProject.status.toUpperCase()} />
                  <ReportInfoItem label="PRIORIDADE" value={selectedProject.priority.toUpperCase()} />
                  <ReportInfoItem label="RESPONSÁVEL" value={selectedProject.owner.toUpperCase()} />
                  <ReportInfoItem label="PRAZO FINAL" value={safeFormat(selectedProject.deadline, "dd/MM/yyyy")} />
                  <ReportInfoItem label="PROGRESSO" value={`${selectedProject.progress}%`} />
                  <ReportInfoItem label="CATEGORIA" value={selectedProject.category.toUpperCase()} />
                  <ReportInfoItem label="PRÓXIMA AÇÃO" value={selectedProject.nextAction.toUpperCase()} />
                  <ReportInfoItem label="IMPEDIMENTOS" value={(selectedProject.blockers || "NENHUM").toUpperCase()} />
                </div>

                {/* Objective & Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b-2 border-[#3B82F6]/20 pb-3 italic">OBJETIVO DO PROJETO</h4>
                    <p className="text-sm font-black text-[#0D1220] leading-relaxed uppercase tracking-tight italic">{selectedProject.objective}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b-2 border-[#3B82F6]/20 pb-3 italic">RESULTADO ESPERADO</h4>
                    <p className="text-sm font-black text-[#0D1220] leading-relaxed uppercase tracking-tight italic">{selectedProject.expectedResult}</p>
                  </div>
                </div>

                {/* Timeline Table */}
                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b-2 border-[#3B82F6]/20 pb-3 italic">LINHA DO TEMPO DE ATIVIDADES</h4>
                  <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">DATA</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">TIPO</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">DESCRIÇÃO</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">RESPONSÁVEL</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">PRÓXIMA AÇÃO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {activities.length > 0 ? (
                          activities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase italic">{safeFormat(activity.date, "dd/MM/yy")}</td>
                              <td className="px-8 py-5">
                                <span className="px-3 py-1 bg-[#3B82F6]/10 text-[9px] font-black text-[#3B82F6] uppercase tracking-widest rounded-lg italic">{activity.type}</span>
                              </td>
                              <td className="px-8 py-5 text-xs font-black text-[#0D1220] leading-relaxed uppercase tracking-tight italic">{activity.description}</td>
                              <td className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase italic">{activity.responsible}</td>
                              <td className="px-8 py-5 text-[10px] font-black text-[#3B82F6] uppercase italic">{activity.nextAction}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-8 py-16 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhuma atividade registrada no momento.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Report Footer */}
              <div className="mt-auto p-12 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Gerado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Documento Interno - MonsTrack Strategic Group</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1E293B]/60 backdrop-blur-md rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center p-24 text-center min-h-[800px]">
              <div className="w-24 h-24 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mb-8 text-[#3B82F6]">
                <FileText size={48} />
              </div>
              <h3 className="text-2xl font-black text-[#F5F7FA] tracking-tight uppercase italic">Selecione um ativo</h3>
              <p className="text-slate-500 mt-4 max-w-xs mx-auto text-[11px] font-black uppercase tracking-widest leading-relaxed italic">Escolha um projeto na lista ao lado para visualizar e gerar o relatório detalhado de auditoria técnica.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportInfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-3">
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic border-l-2 border-[#3B82F6] pl-2">{label}</p>
    <p className="text-sm font-black text-[#0D1220] uppercase tracking-tighter italic">{value}</p>
  </div>
);

export default ReportPage;
