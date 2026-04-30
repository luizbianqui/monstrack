import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProjectList from "./components/ProjectList";
import ProjectDetail from "./components/ProjectDetail";
import WeeklyReview from "./components/WeeklyReview";
import ReportPage from "./components/ReportPage";
import ProjectForm from "./components/ProjectForm";
import TaskForm from "./components/TaskForm";
import ProductivityAnalysis from "./components/ProductivityAnalysis";
import { 
  Project, 
  Activity, 
  Task, 
  DashboardKPIs,
  ActionType
} from "./types";
import { 
  MOCK_PROJECTS, 
  MOCK_ACTIVITIES, 
  MOCK_TASKS, 
  MOCK_KPIS 
} from "./mockData";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import { LogIn, Sparkles, Loader2 } from "lucide-react";
import { sortProjects } from "./lib/utils";
import { Session } from "@supabase/supabase-js";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Modal states
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<string | undefined>(undefined);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase Fetchers
  useEffect(() => {
    if (!isAuthReady || !session?.user) return;

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setProjects(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          client: p.client,
          objective: p.objective,
          expectedResult: p.expected_result,
          status: p.status,
          priority: p.priority,
          category: p.category,
          progress: p.progress,
          deadline: p.deadline,
          startDate: p.start_date,
          nextAction: p.next_action,
          blockers: p.blockers,
          owner: p.owner,
          team: p.team || [],
          weeklyStatus: p.weekly_status,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        })) as Project[]);
      }
    };

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setTasks(data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          projectId: t.project_id,
          projectName: t.project_name,
          client: t.client,
          category: t.category,
          priority: t.priority,
          plannedDate: t.planned_date,
          responsible: t.responsible,
          status: t.status,
          objective: t.objective,
          expectedResult: t.expected_result,
          team: t.team || [],
          nextAction: t.next_action,
          blockers: t.blockers,
          completed: t.completed,
          createdAt: t.created_at,
          updatedAt: t.updated_at
        })) as Task[]);
      }
    };

    const fetchAllActivities = async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("date", { ascending: false });
      
      if (!error && data) {
        setAllActivities(data as Activity[]);
      }
    };

    fetchProjects();
    fetchTasks();
    fetchAllActivities();

    // Set up Realtime subscriptions
    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    const allActivitiesChannel = supabase
      .channel('all-activities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, fetchAllActivities)
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(allActivitiesChannel);
    };
  }, [isAuthReady, session]);

  // Activity Fetcher for selected project
  useEffect(() => {
    if (!isAuthReady || !session?.user || !selectedProject) {
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("project_id", selectedProject.id)
        .order("date", { ascending: false });
      
      if (!error && data) {
        setActivities(data as Activity[]);
      }
    };

    fetchActivities();

    const activitiesChannel = supabase
      .channel(`activities-${selectedProject.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'activities',
        filter: `project_id=eq.${selectedProject.id}`
      }, fetchActivities)
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
    };
  }, [isAuthReady, session, selectedProject]);

  // AI Copilot logic
  const generateAiSummary = async (project: Project, projectActivities: Activity[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    
    const prompt = `
      Você é um assistente estratégico de gestão de projetos (Copilot) da MonsTrack, uma consultoria de alta performance.
      Analise o seguinte projeto e suas atividades recentes para gerar um resumo executivo de alto impacto em Português Brasileiro.
      
      PROJETO:
      Nome: ${project.name}
      Objetivo: ${project.objective}
      Status: ${project.status}
      Prioridade: ${project.priority}
      Progresso: ${project.progress}%
      Próxima Ação: ${project.nextAction}
      Impedimentos: ${project.blockers || "Nenhum"}
      
      ATIVIDADES RECENTES:
      ${projectActivities.map(a => `- ${a.date}: ${a.type} - ${a.description} (Próxima: ${a.nextAction})`).join("\n")}
      
      REQUISITOS DO RESUMO:
      1. Resuma o status atual de forma clara.
      2. Identifique riscos ou gargalos (se houver).
      3. Sugira a melhor próxima ação para acelerar o projeto.
      4. Aponte se falta alguma informação crítica.
      5. Use um tom profissional e direto ao ponto.
      6. Use Markdown para formatação.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "Não foi possível gerar a análise no momento.";
    } catch (error) {
      console.error("AI Error:", error);
      return "Erro ao conectar com o assistente de IA.";
    }
  };

  const logActivity = async (projectId: string, description: string, type: ActionType = "Atualização") => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newActivity: Activity = {
      id: tempId,
      projectId,
      date: new Date().toISOString(),
      type,
      description,
      nextAction: "Verificar progresso",
      responsible: session?.user?.email || "Sistema"
    };

    // Optimistic state update
    setActivities(prev => [newActivity, ...prev]);

    try {
      const { data, error } = await supabase.from("activities").insert({
        project_id: projectId,
        date: newActivity.date,
        type,
        description,
        next_action: newActivity.nextAction,
        responsible: newActivity.responsible,
        user_id: session?.user?.id
      }).select().single();

      if (error) throw error;
      if (data) {
        setActivities(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
      }
    } catch (error) {
      console.error("Error logging activity:", error);
      setActivities(prev => prev.filter(a => a.id !== tempId));
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    const previousTasks = [...tasks];
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus, completed: newStatus === "Concluído" } : t
      ));

      const task = tasks.find(t => t.id === taskId);
      const { error } = await supabase
        .from("tasks")
        .update({ 
          status: newStatus, 
          completed: newStatus === "Concluído" 
        })
        .eq("id", taskId);
      
      if (error) throw error;

      if (task?.projectId) {
        logActivity(task.projectId, `Tarefa "${task.title}" movida para ${newStatus}`);
      }
    } catch (error) {
      console.error("Error moving task:", error);
      setTasks(previousTasks); // Rollback
      alert("Erro ao mover tarefa. Revertendo alteração.");
    }
  };

  const handleMoveProject = async (projectId: string, newStatus: string) => {
    const previousProjects = [...projects];
    try {
      // Optimistic update
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, weeklyStatus: newStatus === "" ? undefined : newStatus } : p
      ));

      const project = projects.find(p => p.id === projectId);
      const { error } = await supabase
        .from("projects")
        .update({ 
          weekly_status: newStatus === "" ? null : newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);
      
      if (error) throw error;

      if (project) {
        const statusText = newStatus === "" ? "removido do planejamento" : `movido para ${newStatus}`;
        logActivity(projectId, `Projeto ${statusText}`);
      }
    } catch (error) {
      console.error("Error moving project:", error);
      setProjects(previousProjects); // Rollback
      alert("Erro ao organizar projeto. Revertendo alteração.");
    }
  };

  const handleSaveProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const previousProjects = [...projects];
    const tempId = Math.random().toString(36).substr(2, 9);

    try {
      const projectToSave = {
        name: projectData.name,
        client: projectData.client,
        objective: projectData.objective,
        expected_result: projectData.expectedResult, // Map camelCase to snake_case
        status: projectData.status,
        priority: projectData.priority,
        category: projectData.category,
        progress: projectData.progress,
        deadline: projectData.deadline,
        start_date: projectData.startDate, // Map camelCase to snake_case
        next_action: projectData.nextAction, // Map camelCase to snake_case
        blockers: projectData.blockers,
        owner: projectData.owner,
        team: projectData.team,
        weekly_status: projectData.weeklyStatus, // Map camelCase to snake_case
        updated_at: new Date().toISOString()
      };

      if (editingProject) {
        // Optimistic update
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } as Project : p));

        const { error } = await supabase
          .from("projects")
          .update({
            ...projectToSave
          })
          .eq("id", editingProject.id);
        
        if (error) throw error;
      } else {
        // Optimistic insert
        const newProject: Project = { 
          ...projectData, 
          id: tempId, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProjects(prev => [newProject, ...prev]);

        const { data, error } = await supabase
          .from("projects")
          .insert({
            ...projectToSave,
            user_id: session?.user?.id
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Sync real ID
        if (data) {
          setProjects(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p));
        }

        if (data) {
          logActivity(data.id, "Projeto criado");
        }
      }
      setIsProjectFormOpen(false);
      setEditingProject(undefined);
    } catch (error) {
      console.error("Error saving project:", error);
      setProjects(previousProjects); // Rollback
      alert("Erro ao salvar projeto. Verifique sua conexão.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const previousProjects = [...projects];
    try {
      // Optimistic update
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) throw error;

      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      
      setIsProjectFormOpen(false);
      setEditingProject(undefined);
    } catch (error) {
      console.error("Error deleting project:", error);
      setProjects(previousProjects); // Rollback
      alert("Erro ao excluir projeto. Verifique sua conexão.");
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    const previousTasks = [...tasks];
    const tempId = Math.random().toString(36).substr(2, 9);
    
    try {
      const taskToSave = {
        title: taskData.title,
        description: taskData.description,
        project_id: taskData.projectId || null, // Map camelCase to snake_case
        project_name: taskData.projectName,
        client: taskData.client,
        category: taskData.category,
        priority: taskData.priority,
        planned_date: taskData.plannedDate,
        responsible: taskData.responsible,
        status: taskData.status,
        objective: taskData.objective,
        expected_result: taskData.expectedResult,
        team: taskData.team,
        next_action: taskData.nextAction,
        blockers: taskData.blockers,
        completed: taskData.completed,
        updated_at: new Date().toISOString()
      };

      if (editingTask) {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData, updatedAt: new Date().toISOString() } as Task : t));
        
        const { error } = await supabase
          .from("tasks")
          .update({
            ...taskToSave
          })
          .eq("id", editingTask.id);
        
        if (error) throw error;
        
        if (taskData.projectId) {
          const actionLabel = editingTask.projectId !== taskData.projectId ? "vinculada ao projeto" : "atualizada";
          logActivity(taskData.projectId, `Tarefa "${taskData.title}" ${actionLabel}`, "Vínculo");
        }
      } else {
        // Optimistic insert
        const newTask: Task = { ...taskData, id: tempId, createdAt: new Date().toISOString() };
        setTasks(prev => [newTask, ...prev]);

        const { data, error } = await supabase
          .from("tasks")
          .insert({
            ...taskToSave,
            user_id: session?.user?.id
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Sync real ID
        if (data) {
          setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id } : t));
        }

        if (data && taskData.projectId) {
          logActivity(taskData.projectId, `Tarefa "${taskData.title}" criada`, "Criação");
        }
      }
      setIsTaskFormOpen(false);
      setEditingTask(undefined);
      setDefaultTaskStatus(undefined);
    } catch (error) {
      console.error("Error saving task:", error);
      setTasks(previousTasks); // Rollback
      alert("Erro ao salvar tarefa. Verifique sua conexão.");
    }
  };

  const handleTransformTaskToProject = async (task: Task) => {
    if (!window.confirm(`Tem certeza que deseja transformar a tarefa "${task.title}" em um projeto? A tarefa será removida.`)) {
      return;
    }
    
    setIsTaskFormOpen(false);
    setEditingTask(undefined);

    const previousTasks = [...tasks];
    const previousProjects = [...projects];
    const tempId = Math.random().toString(36).substr(2, 9);
    
    const newProjectData = {
        name: task.title,
        client: task.client || "MonsTrack Strategic",
        objective: task.objective || task.description || "Projeto transformado a partir de tarefa",
        expected_result: task.expectedResult || "",
        status: "Não iniciado",
        priority: task.priority,
        category: task.category || "Estratégico",
        progress: 0,
        deadline: task.plannedDate,
        start_date: new Date().toISOString().split('T')[0],
        next_action: task.nextAction || "",
        blockers: task.blockers || "",
        owner: task.responsible,
        team: task.team || [],
        weekly_status: task.status === "Backlog" || task.status === "Concluído" ? null : "Backlog da Semana"
    };

    try {
      // Optimistic updates
      setTasks(prev => prev.filter(t => t.id !== task.id));
      const newProject: Project = { 
        ...newProjectData, 
        expectedResult: newProjectData.expected_result,
        startDate: newProjectData.start_date,
        nextAction: newProjectData.next_action,
        weeklyStatus: newProjectData.weekly_status as string | undefined,
        id: tempId, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as Project;
      setProjects(prev => [newProject, ...prev]);

      // Delete task from DB
      await supabase.from("tasks").delete().eq("id", task.id);

      // Create Project in DB
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...newProjectData,
          user_id: session?.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProjects(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p));
        logActivity(data.id, "Projeto criado a partir de uma tarefa", "Criação");
      }
      
    } catch (error) {
      console.error("Error transforming task:", error);
      setTasks(previousTasks);
      setProjects(previousProjects);
      alert("Erro ao transformar tarefa. Verifique sua conexão.");
    }
  };

  const handleAddActivity = async (activityData: Omit<Activity, "id">) => {
    if (!selectedProject) return;
    const tempId = Math.random().toString(36).substr(2, 9);
    const newActivity: Activity = { ...activityData, id: tempId, projectId: selectedProject.id };
    const previousActivities = [...activities];

    try {
      // Optimistic update
      setActivities(prev => [newActivity, ...prev]);

      const { data, error } = await supabase.from("activities").insert({
        ...activityData,
        project_id: selectedProject.id,
        user_id: session?.user?.id,
        responsible: session?.user?.email || "Usuário"
      }).select().single();

      if (error) throw error;
      // Replace tempId with realId
      if (data) {
        setActivities(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      setActivities(previousActivities);
    }
  };

  const handleUpdateActivity = async (activity: Activity) => {
    if (!selectedProject) return;
    const previousActivities = [...activities];
    try {
      // Optimistic update
      setActivities(prev => prev.map(a => a.id === activity.id ? activity : a));

      const { id, ...data } = activity;
      const { error } = await supabase
        .from("activities")
        .update({ ...data })
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating activity:", error);
      setActivities(previousActivities);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!selectedProject) return;
    const previousActivities = [...activities];
    try {
      // Optimistic update
      setActivities(prev => prev.filter(a => a.id !== activityId));

      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting activity:", error);
      setActivities(previousActivities);
    }
  };

  const onToggleTask = async (task: Task) => {
    const previousTasks = [...tasks];
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed, status: !t.completed ? "Concluído" : t.status } : t
      ));

      const { error } = await supabase
        .from("tasks")
        .update({ 
          completed: !task.completed,
          status: !task.completed ? "Concluído" : task.status
        })
        .eq("id", task.id);
      
      if (error) throw error;
      
      if (task.projectId) {
        logActivity(task.projectId, `Tarefa "${task.title}" ${!task.completed ? "concluída" : "reaberta"}`, "Atualização");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      setTasks(previousTasks);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const getKPIs = (): DashboardKPIs => {
    const now = new Date();
    return {
      totalProjects: projects.length,
      inProgress: projects.filter(p => p.status === "Em andamento").length,
      highPriority: projects.filter(p => p.priority === "Alta").length,
      withBlockers: projects.filter(p => p.blockers && p.blockers.trim() !== "").length,
      overdue: projects.filter(p => {
        const deadline = new Date(p.deadline);
        return deadline < now && p.status !== "Concluído";
      }).length,
      updatesToday: projects.filter(p => {
        const updated = new Date(p.updatedAt);
        return updated.toDateString() === now.toDateString();
      }).length
    };
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0D1220] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#2563EB] rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 size={40} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.5em] animate-pulse">Carregando MonsTrack Strategic</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const handleTabChange = (tab: string) => {
    if (tab === "projects") {
      setSelectedProject(null);
    }
    setActiveTab(tab);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleTabChange}
      selectedProject={selectedProject}
      onBackToProjects={() => setSelectedProject(null)}
      onAddTask={() => {
        setEditingTask(undefined);
        setDefaultTaskStatus("Backlog");
        setIsTaskFormOpen(true);
      }}
      userEmail={session.user.email}
    >
      {activeTab === "dashboard" && (
        <Dashboard 
          kpis={getKPIs()} 
          tasks={tasks} 
          projects={projects}
          onAddTask={(column) => {
            setDefaultTaskStatus(column);
            setIsTaskFormOpen(true);
          }}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskFormOpen(true);
          }}
          onDeleteTask={async (taskId) => {
            try {
              const task = tasks.find(t => t.id === taskId);
              await supabase.from("tasks").delete().eq("id", taskId);
              if (task?.projectId) {
                logActivity(task.projectId, `Tarefa "${task.title}" excluída`, "Exclusão");
              }
            } catch (error) {
              console.error("Error deleting task:", error);
            }
          }}
          onToggleTask={async (task) => {
            try {
              const newCompleted = !task.completed;
              await supabase
                .from("tasks")
                .update({
                  completed: newCompleted,
                  status: newCompleted ? "Concluído" : "Backlog"
                })
                .eq("id", task.id);
              
              if (task.projectId) {
                logActivity(task.projectId, `Tarefa "${task.title}" ${newCompleted ? "concluída" : "reaberta"}`);
              }
            } catch (error) {
              console.error("Error toggling task:", error);
            }
          }}
          onMoveProject={handleMoveProject}
          onMoveTask={handleMoveTask}
          onSelectProject={(p) => {
            setSelectedProject(p);
            setActiveTab("projects");
          }}
        />
      )}

      {activeTab === "projects" && !selectedProject && (
        <ProjectList 
          projects={projects} 
          onAddProject={() => {
            setEditingProject(undefined);
            setIsProjectFormOpen(true);
          }}
          onSelectProject={setSelectedProject}
        />
      )}

      {activeTab === "projects" && selectedProject && (
        <ProjectDetail 
          project={selectedProject}
          activities={activities}
          onBack={() => setSelectedProject(null)}
          onAddActivity={handleAddActivity}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
          onUpdateProject={(p) => {
            setEditingProject(p);
            setIsProjectFormOpen(true);
          }}
          onGoToReport={() => setActiveTab("reports")}
          onGenerateSummary={generateAiSummary}
        />
      )}

      {activeTab === "weekly-review" && (
        <WeeklyReview 
          projects={projects} 
          onSelectProject={(p) => {
            setSelectedProject(p);
            setActiveTab("projects");
          }} 
        />
      )}

      {activeTab === "produtividade" && (
        <ProductivityAnalysis 
          projects={projects}
          tasks={tasks}
          activities={allActivities}
        />
      )}

      {activeTab === "reports" && (
        <ReportPage 
          projects={projects} 
          activities={activities} 
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
      )}

      {/* Modals */}
      {isProjectFormOpen && (
        <ProjectForm 
          project={editingProject}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          onClose={() => {
            setIsProjectFormOpen(false);
            setEditingProject(undefined);
          }}
        />
      )}

      {isTaskFormOpen && (
        <TaskForm 
          task={editingTask}
          projects={projects}
          defaultStatus={defaultTaskStatus}
          onSave={handleSaveTask}
          onTransformToProject={handleTransformTaskToProject}
          onClose={() => {
            setIsTaskFormOpen(false);
            setEditingTask(undefined);
            setDefaultTaskStatus(undefined);
          }}
        />
      )}
    </Layout>
  );
};

export default App;
