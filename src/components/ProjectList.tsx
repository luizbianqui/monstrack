import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Calendar, 
  Briefcase, 
  ChevronRight, 
  MoreVertical 
} from "lucide-react";
import { cn, getProjectHealth } from "../lib/utils";
import { Project, ProjectStatus, Priority, Category } from "../types";
import { CATEGORIES, STATUSES, PRIORITIES } from "../constants";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onAddProject: () => void;
  onSelectProject: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onAddProject, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "Todos">("Todos");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "Todos">("Todos");
  const [filterPriority, setFilterPriority] = useState<Priority | "Todos">("Todos");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesCategory = filterCategory === "Todos" || project.category === filterCategory;
    const matchesStatus = filterStatus === "Todos" || project.status === filterStatus;
    const matchesPriority = filterPriority === "Todos" || project.priority === filterPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#F5F7FA] tracking-tighter font-display uppercase italic">
            Gestão de <span className="text-[#2563EB] not-italic">Projetos</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Visão geral e controle de portfólio estratégico</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou cliente..." 
              className="w-full pl-10 pr-4 py-3 bg-[#1E293B] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] shadow-sm transition-all text-sm text-[#F5F7FA]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={onAddProject}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect 
          label="Categoria" 
          value={filterCategory} 
          options={["Todos", ...CATEGORIES]} 
          onChange={(val) => setFilterCategory(val as any)} 
        />
        <FilterSelect 
          label="Status" 
          value={filterStatus} 
          options={["Todos", ...STATUSES]} 
          onChange={(val) => setFilterStatus(val as any)} 
        />
        <FilterSelect 
          label="Prioridade" 
          value={filterPriority} 
          options={["Todos", ...PRIORITIES]} 
          onChange={(val) => setFilterPriority(val as any)} 
        />
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onClick={() => onSelectProject(project)} 
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">Nenhum projeto encontrado</h3>
          <p className="text-gray-500 mt-1">Tente ajustar seus filtros ou busca.</p>
        </div>
      )}
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, options, onChange }) => (
  <div className="flex items-center gap-2 bg-[#1E293B] border border-white/5 px-3 py-1.5 rounded-lg shadow-sm">
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}:</span>
    <select 
      className="text-xs font-bold text-[#F5F7FA] bg-transparent focus:outline-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#1E293B]">{opt}</option>
      ))}
    </select>
  </div>
);

export default ProjectList;
