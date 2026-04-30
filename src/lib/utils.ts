import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isPast, isToday } from "date-fns";
import { Project } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProjectHealth(project: Project) {
  const isOverdue = isPast(new Date(project.deadline)) && !isToday(new Date(project.deadline)) && project.status !== "Concluído";
  const isBlocked = project.blockers && project.blockers.trim().length > 0;

  if (isOverdue || isBlocked) return "Em risco";
  if (!project.owner || !project.deadline || !project.nextAction) return "Atenção";
  return "Saudável";
}

export function cleanFirestoreData<T extends object>(data: T): T {
  const clean: any = { ...data };
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined) {
      delete clean[key];
    }
  });
  return clean;
}

export function sortProjects(projects: Project[]): Project[] {
  const priorityOrder: Record<string, number> = {
    "Alta": 0,
    "Média": 1,
    "Baixa": 2
  };

  return [...projects].sort((a, b) => {
    // Sort by priority first
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then sort by deadline
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
