import { Category, ProjectStatus, Priority, ActionType } from "./types";

export const CATEGORIES: Category[] = [
  "Institucional",
  "Certificação",
  "Clientes",
  "Inovação",
  "Digital"
];

export const STATUSES: ProjectStatus[] = [
  "Não iniciado",
  "Em andamento",
  "Aguardando",
  "Concluído",
  "Cancelado"
];

export const PRIORITIES: Priority[] = [
  "Alta",
  "Média",
  "Baixa"
];

export const ACTION_TYPES: ActionType[] = [
  "Reunião",
  "Visita técnica",
  "Solicitação a fornecedor",
  "Envio de amostra",
  "Ensaio/Laudo",
  "E-mail",
  "Ligação",
  "Homologação",
  "Auditoria",
  "Desenvolvimento interno"
];

export const BOARD_COLUMNS = [
  "Backlog da Semana",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
  "Concluído"
];
