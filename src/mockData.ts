import { Project, Activity, Task, DashboardKPIs } from "./types";
import { addDays, subDays, format, startOfWeek, endOfWeek } from "date-fns";

const now = new Date();

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Certificação ISO 9001:2025",
    client: "Viposa S.A.",
    category: "Certificação",
    priority: "Alta",
    status: "Em andamento",
    progress: 65,
    objective: "Renovação da certificação de qualidade para todas as unidades produtivas.",
    expectedResult: "Certificado renovado sem não-conformidades críticas.",
    owner: "Carlos Oliveira",
    team: ["Ana Souza", "Pedro Lima", "Julia Costa"],
    deadline: format(addDays(now, 45), "yyyy-MM-dd"),
    startDate: format(subDays(now, 60), "yyyy-MM-dd"),
    nextAction: "Revisão dos processos de auditoria interna no setor de curtume.",
    blockers: "",
    createdAt: format(subDays(now, 60), "yyyy-MM-dd"),
    updatedAt: format(subDays(now, 2), "yyyy-MM-dd")
  },
  {
    id: "p2",
    name: "Desenvolvimento Linha Eco-Footwear",
    client: "Clientes Europa",
    category: "Inovação",
    priority: "Alta",
    status: "Em andamento",
    progress: 40,
    objective: "Criar uma linha de calçados 100% sustentáveis com couro vegetal.",
    expectedResult: "Lançamento de 5 modelos na feira de Milão.",
    owner: "Mariana Silva",
    team: ["Roberto Dias", "Fernanda Lima"],
    deadline: format(addDays(now, 90), "yyyy-MM-dd"),
    startDate: format(subDays(now, 30), "yyyy-MM-dd"),
    nextAction: "Teste de resistência das amostras de couro de cacto.",
    blockers: "Atraso na entrega das amostras pelo fornecedor mexicano.",
    createdAt: format(subDays(now, 30), "yyyy-MM-dd"),
    updatedAt: format(now, "yyyy-MM-dd")
  },
  {
    id: "p3",
    name: "Implementação ERP SAP S/4HANA",
    category: "Digital",
    priority: "Alta",
    status: "Aguardando",
    progress: 15,
    objective: "Migração do sistema legado para SAP para melhor integração de dados.",
    expectedResult: "Sistema operando em todas as unidades com 100% de integridade.",
    owner: "Ricardo Santos",
    team: ["Equipe TI", "Consultoria Externa"],
    deadline: format(addDays(now, 180), "yyyy-MM-dd"),
    startDate: format(subDays(now, 15), "yyyy-MM-dd"),
    nextAction: "Mapeamento de processos do setor financeiro.",
    blockers: "Aguardando aprovação final do orçamento da consultoria.",
    createdAt: format(subDays(now, 15), "yyyy-MM-dd"),
    updatedAt: format(subDays(now, 5), "yyyy-MM-dd")
  },
  {
    id: "p4",
    name: "Expansão Unidade Nordeste",
    category: "Institucional",
    priority: "Média",
    status: "Não iniciado",
    progress: 0,
    objective: "Instalação de novo centro de distribuição em Pernambuco.",
    expectedResult: "CD operando com capacidade de 50k pares/mês.",
    owner: "Fernando Costa",
    team: ["Logística", "Engenharia"],
    deadline: format(addDays(now, 120), "yyyy-MM-dd"),
    startDate: format(subDays(now, 5), "yyyy-MM-dd"),
    nextAction: "Visita técnica ao galpão pré-selecionado em Recife.",
    blockers: "",
    createdAt: format(subDays(now, 5), "yyyy-MM-dd"),
    updatedAt: format(subDays(now, 5), "yyyy-MM-dd")
  },
  {
    id: "p5",
    name: "Campanha Marketing Digital 2026",
    category: "Digital",
    priority: "Média",
    status: "Em andamento",
    progress: 80,
    objective: "Aumentar a presença da marca nas redes sociais e Google Ads.",
    expectedResult: "Crescimento de 25% no tráfego orgânico.",
    owner: "Beatriz Nunes",
    team: ["Agência X", "Design Interno"],
    deadline: format(addDays(now, 15), "yyyy-MM-dd"),
    startDate: format(subDays(now, 45), "yyyy-MM-dd"),
    nextAction: "Aprovação dos criativos para a campanha de inverno.",
    blockers: "",
    createdAt: format(subDays(now, 45), "yyyy-MM-dd"),
    updatedAt: format(now, "yyyy-MM-dd")
  },
  {
    id: "p6",
    name: "Homologação Fornecedor Solados",
    client: "Fornecedor TechSole",
    category: "Clientes",
    priority: "Baixa",
    status: "Concluído",
    progress: 100,
    objective: "Validar novo fornecedor de solados de alta performance.",
    expectedResult: "Fornecedor aprovado e cadastrado no sistema.",
    owner: "João Pereira",
    team: ["Compras", "Qualidade"],
    deadline: format(subDays(now, 10), "yyyy-MM-dd"),
    startDate: format(subDays(now, 40), "yyyy-MM-dd"),
    nextAction: "Projeto finalizado.",
    blockers: "",
    createdAt: format(subDays(now, 40), "yyyy-MM-dd"),
    updatedAt: format(subDays(now, 10), "yyyy-MM-dd")
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    projectId: "p1",
    date: format(subDays(now, 5), "yyyy-MM-dd"),
    type: "Reunião",
    description: "Reunião de alinhamento com os gestores de produção sobre as novas normas ISO.",
    nextAction: "Distribuir manuais atualizados.",
    responsible: "Carlos Oliveira",
    completed: true
  },
  {
    id: "a2",
    projectId: "p1",
    date: format(subDays(now, 2), "yyyy-MM-dd"),
    type: "Auditoria",
    description: "Pré-auditoria interna no setor de acabamento.",
    nextAction: "Corrigir falha no registro de temperatura.",
    responsible: "Ana Souza",
    completed: true
  },
  {
    id: "a3",
    projectId: "p2",
    date: format(subDays(now, 1), "yyyy-MM-dd"),
    type: "Desenvolvimento interno",
    description: "Modelagem do protótipo 01 da linha Eco.",
    nextAction: "Enviar para montagem experimental.",
    responsible: "Mariana Silva",
    completed: true
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Revisar cronograma SAP",
    description: "Ajustar datas com a consultoria.",
    projectId: "p3",
    projectName: "Implementação ERP SAP",
    priority: "Alta",
    plannedDate: format(now, "yyyy-MM-dd"),
    responsible: "Ricardo Santos",
    status: "Segunda",
    completed: false,
    createdAt: format(subDays(now, 2), "yyyy-MM-dd")
  },
  {
    id: "t2",
    title: "Ligar para fornecedor de couro",
    description: "Cobrar amostras atrasadas.",
    projectId: "p2",
    projectName: "Linha Eco-Footwear",
    priority: "Alta",
    plannedDate: format(now, "yyyy-MM-dd"),
    responsible: "Mariana Silva",
    status: "Segunda",
    completed: false,
    createdAt: format(subDays(now, 1), "yyyy-MM-dd")
  },
  {
    id: "t3",
    title: "Preparar relatório mensal",
    priority: "Média",
    plannedDate: format(addDays(now, 1), "yyyy-MM-dd"),
    responsible: "Carlos Oliveira",
    status: "Terça",
    completed: false,
    createdAt: format(subDays(now, 3), "yyyy-MM-dd")
  },
  {
    id: "t4",
    title: "Visita técnica Recife",
    projectId: "p4",
    projectName: "Expansão Nordeste",
    priority: "Alta",
    plannedDate: format(addDays(now, 2), "yyyy-MM-dd"),
    responsible: "Fernando Costa",
    status: "Quarta",
    completed: false,
    createdAt: format(subDays(now, 1), "yyyy-MM-dd")
  }
];

export const MOCK_KPIS: DashboardKPIs = {
  totalProjects: 15,
  inProgress: 8,
  highPriority: 4,
  withBlockers: 3,
  overdue: 2,
  updatesToday: 5
};
