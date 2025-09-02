import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Task, User, Projeto, TaskStatusEnum } from '../../../types/task'; // Importe todas as interfaces relevantes
import { useSession } from 'next-auth/react';
import AdminLayout from 'components/admin/AdminLayout';
import TaskDetailModal from 'components/admin/TaskDetailModal';
import TaskEditForm from 'components/admin/TaskEditForm';
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from 'components/TaskCard';

// As interfaces Task, User e Projeto agora são importadas de '../../../types/task'
// Removidas as declarações de interface locais duplicadas.

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban'); // Mudei para iniciar em kanban
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null); // Estado para a tarefa arrastada

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // NOVO: Estados para o filtro de projeto
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetosLoading, setProjetosLoading] = useState(true);
  const [selectedProjetoId, setSelectedProjetoId] = useState<string>(''); // "" para "Todos os Projetos"

  // LOG PARA DEPURAR A SESSAO NO NAVEGADOR (CLIENT-SIDE)
  useEffect(() => {
    console.log("[TasksPage CLIENT] Sessão:", JSON.stringify(session, null, 2));
    console.log("[TasksPage CLIENT] Status:", status);
    if (session) {
      console.log("[TasksPage CLIENT] User ID:", session.user?.id);
      console.log("[TasksPage CLIENT] User Role:", (session.user as any)?.role);
    }
  }, [session, status]);

  // NOVO: Busca a lista de projetos da sua API /api/crud/projetos
  useEffect(() => {
    const fetchProjetos = async () => {
      setProjetosLoading(true);
      try {
        const response = await fetch('/api/crud/projetos'); // Verifique o caminho correto da sua API de projetos
        if (!response.ok) {
          throw new Error('Falha ao carregar projetos.');
        }
        const data = await response.json();
        setProjetos(data.projetos);
      } catch (err) {
        console.error('Falha ao buscar projetos:', err);
        // Não setamos erro globalmente aqui para não bloquear a renderização das tarefas
      } finally {
        setProjetosLoading(false);
      }
    };
    fetchProjetos();
  }, []);


  const fetchTasks = useCallback(async (projetoIdToFilter?: string) => {
    // Verificação de autenticação e role antes de fazer a requisição API
    if (status !== 'authenticated' || !session?.user?.id) {
      setLoading(false);
      setError('Você precisa estar autenticado para visualizar as tarefas.');
      return;
    }

    try {
      setLoading(true);
      let url = '/api/tasks';
      if (projetoIdToFilter) {
        url += `?projetoId=${projetoIdToFilter}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao buscar as tarefas: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro inesperado ocorreu.');
    } finally {
      setLoading(false);
    }
  }, [status, session?.user?.id]);


  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks(selectedProjetoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjetoId]); // Adiciona selectedProjetoId como dependência

  const openDetailModal = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === updatedTask.id ? { ...updatedTask, assignedTo: updatedTask.assignedTo, author: updatedTask.author, projeto: updatedTask.projeto, description: updatedTask.description, dueDate: updatedTask.dueDate } : task
    ));
    closeEditModal();
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case TaskStatusEnum.PENDENTE:
        return 'bg-red-100 text-red-800';
      case TaskStatusEnum.EM_ANDAMENTO:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatusEnum.CONCLUIDA:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2:
        return 'bg-red-500 text-white'; // Alta
      case 1:
        return 'bg-yellow-500 text-white'; // Normal
      case 0:
        return 'bg-blue-500 text-white'; // Baixa
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 2:
        return 'Alta';
      case 1:
        return 'Normal';
      case 0:
        return 'Baixa';
      default:
        return 'N/A';
    }
  };

  // Objeto de colunas Kanban usando o TaskStatusEnum
  // As tarefas já estarão filtradas pelo fetchTasks se um projeto for selecionado
  const kanbanColumns = {
    [TaskStatusEnum.PENDENTE]: tasks.filter(task => task.status === TaskStatusEnum.PENDENTE),
    [TaskStatusEnum.EM_ANDAMENTO]: tasks.filter(task => task.status === TaskStatusEnum.EM_ANDAMENTO),
    [TaskStatusEnum.CONCLUIDA]: tasks.filter(task => task.status === TaskStatusEnum.CONCLUIDA),
  };

  // --- Funções de Drag and Drop ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId); // Armazena o ID da tarefa no evento de drag
    console.log("handleDragStart: Setting taskId in dataTransfer:", taskId);
    console.log("handleDragStart: dataTransfer types:", e.dataTransfer.types);
    e.currentTarget.classList.add('opacity-50', 'border-dashed', 'border-2', 'border-orange-500'); // Estilo para a tarefa arrastada
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'border-dashed', 'border-2', 'border-orange-500'); // Remove o estilo ao finalizar o drag
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessário para permitir o drop
    e.currentTarget.classList.add('bg-orange-100', 'border-orange-500'); // Feedback visual na coluna
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-orange-100', 'border-orange-500'); // Remove feedback visual
  };

  const handleDragEndDndKit = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskToMove = tasks.find((t) => t.id === active.id);
    if (!taskToMove) return;

    const newStatus = over.id as TaskStatusEnum; // ✅ pega o id da coluna
    if (taskToMove.status === newStatus) return;

    // Atualiza localmente
    setTasks((prev) =>
      prev.map((t) => (t.id === taskToMove.id ? { ...t, status: newStatus } : t))
    );

    // Atualiza no backend
    try {
      const res = await fetch(`/api/tasks/${taskToMove.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskToMove.title,
          description: taskToMove.description,
          status: newStatus, // ✅ envia o status correto
          priority: taskToMove.priority,
          dueDate: taskToMove.dueDate,
          assignedToId: taskToMove.assignedToId,
          authorId: taskToMove.authorId,
          projetoId: taskToMove.projetoId,
        }),
      });

      if (!res.ok) throw new Error("Falha ao atualizar status da tarefa.");
    } catch (err) {
      console.error(err);
      // Reverte status em caso de erro
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskToMove.id ? { ...t, status: taskToMove.status } : t
        )
      );
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">Erro: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  if (loading || projetosLoading) { // Adicionado projetosLoading aqui
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Carregando tarefas e projetos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Head>
          <title>Gerenciador de Tarefas</title>
        </Head>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Minhas Tarefas</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
            {/* NOVO: Filtro de Projeto */}
            <div className="w-full md:w-auto">
              <label htmlFor="project-filter" className="sr-only">Filtrar por Projeto</label>
              <select
                id="project-filter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                value={selectedProjetoId}
                onChange={(e) => setSelectedProjetoId(e.target.value)}
                disabled={projetosLoading}
              >
                <option value="">Todos os Projetos</option>
                {projetos.map(projeto => (
                  <option key={projeto.id} value={projeto.id}>{projeto.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setViewMode('table')}
              className={`px-6 py-2 rounded-md font-bold transition duration-300 shadow-md ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Tabela
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-6 py-2 rounded-md font-bold transition duration-300 shadow-md ${viewMode === 'kanban' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Kanban
            </button>
            <Link href="/admin/tasks/new" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md">
              + Nova Tarefa
            </Link>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {tasks.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">Nenhuma tarefa encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projeto
                      </th> {/* NOVO: Coluna Projeto na tabela */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsável
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-100 transition duration-150 ease-in-out">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {task.title}
                            </div>
                          </div>
                        </td>
                        {/* NOVO: Dados do Projeto na tabela */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.projeto?.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.assignedTo?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => openDetailModal(task)} className="text-orange-600 hover:text-orange-900 mr-4">
                            Ver Detalhes
                          </button>
                          <button onClick={() => openEditModal(task)} className="text-blue-600 hover:text-blue-900">
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndDndKit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(TaskStatusEnum).map((statusColumn) => (
                <div
                  key={statusColumn}
                  id={statusColumn} // ✅ necessário para dnd-kit reconhecer a coluna
                  className="bg-gray-100 p-4 rounded-lg shadow-md min-h-[300px]"
                >
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    {statusColumn.replace(/_/g, " ")} ({kanbanColumns[statusColumn].length})
                  </h2>

                  <SortableContext
                    items={kanbanColumns[statusColumn].map((t) => t.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="space-y-4">
                      {kanbanColumns[statusColumn].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onOpenDetail={openDetailModal}
                          onOpenEdit={openEditModal}
                          getPriorityColor={getPriorityColor}
                          getPriorityText={getPriorityText}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
          </DndContext>
        )}
      </div>

      {/* Modal de Detalhes da Tarefa */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={closeDetailModal}
        />
      )}

      {/* Modal de Edição da Tarefa */}
      {showEditModal && selectedTask && (
        <TaskEditForm
          taskId={selectedTask.id}
          onClose={closeEditModal}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </AdminLayout>
  );
}
