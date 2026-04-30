export type ProjectStatus = "Não iniciado" | "Em andamento" | "Aguardando" | "Concluído" | "Cancelado";
export type Priority = "Alta" | "Média" | "Baixa";
export type Category = "Institucional" | "Certificação" | "Clientes" | "Inovação" | "Digital";
export type ActionType = 
  | "Reunião" 
  | "Visita técnica" 
  | "Solicitação a fornecedor" 
  | "Envio de amostra" 
  | "Ensaio/Laudo" 
  | "E-mail" 
  | "Ligação" 
  | "Homologação" 
  | "Auditoria" 
  | "Desenvolvimento interno"
  | "Atualização"
  | "Criação"
  | "Exclusão"
  | "Vínculo";

export type ProjectHealth = "Saudável" | "Atenção" | "Em risco";

export interface Activity {
  id: string;
  projectId: string;
  date: string;
  type: ActionType;
  description: string;
  nextAction: string;
  responsible: string;
  completed?: boolean;
}

export interface Project {
  id: string;
  name: string;
  client?: string;
  category: Category;
  priority: Priority;
  status: ProjectStatus;
  progress: number;
  objective: string;
  expectedResult: string;
  owner: string;
  team: string[];
  deadline: string;
  startDate: string;
  nextAction: string;
  blockers: string;
  createdAt: string;
  updatedAt: string;
  weeklyStatus?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  client?: string;
  category?: Category;
  priority: Priority;
  plannedDate: string;
  responsible: string;
  status: string; // Column name
  objective?: string;
  expectedResult?: string;
  team?: string[];
  nextAction?: string;
  blockers?: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardKPIs {
  totalProjects: number;
  inProgress: number;
  highPriority: number;
  withBlockers: number;
  overdue: number;
  updatesToday: number;
}
