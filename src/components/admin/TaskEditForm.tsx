import React, { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { Projeto, Task, TaskStatusEnum, User } from 'types/task';

interface TaskEditFormProps {
    taskId: string;
    onClose: () => void;
    onTaskUpdated: (updatedTask: Task) => void;
}

interface TaskFormData {
    title: string;
    description: string | null;
    status: TaskStatusEnum;
    priority: number;
    dueDate: string | null;
    assignedToId: string;
    projetoId: string | null;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({ taskId, onClose, onTaskUpdated }) => {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: null,
        status: TaskStatusEnum.PENDENTE,
        priority: 0,
        dueDate: null,
        assignedToId: '',
        projetoId: null,
    });
    const [users, setUsers] = useState<User[]>([]);
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [projetosError, setProjetosError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            setError(null);
            setUsersError(null);
            setProjetosError(null);

            // Fetch Task Data
            try {
                console.log(`[TaskEditForm] Buscando dados da tarefa com ID: ${taskId}`);
                const taskResponse = await fetch(`/api/tasks/${taskId}`);
                if (!taskResponse.ok) {
                    const errorDetails = await taskResponse.json().catch(() => ({ message: 'Erro desconhecido ao parsear resposta da tarefa.' }));
                    throw new Error(errorDetails.message || `Falha ao carregar os dados da tarefa. Status: ${taskResponse.status}`);
                }
                const taskData: Task = await taskResponse.json();
                console.log('[TaskEditForm] Dados da tarefa carregados:', taskData);

                setFormData({
                    title: taskData.title,
                    description: taskData.description || null,
                    status: taskData.status,
                    priority: taskData.priority,
                    dueDate: taskData.dueDate
                        ? new Date(taskData.dueDate).toISOString().split('T')[0]
                        : null,
                    assignedToId: taskData.assignedToId,
                    projetoId: taskData.projetoId || null,
                });
            } catch (err) {
                console.error('[TaskEditForm] Erro ao buscar tarefa:', err);
                setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar tarefa.');
            }

            // Fetch Users
            try {
                console.log('[TaskEditForm] Buscando lista de usuários...');
                const usersResponse = await fetch('/api/users');
                if (!usersResponse.ok) {
                    const errorDetails = await usersResponse.json().catch(() => ({ message: 'Erro desconhecido ao parsear resposta de usuários.' }));
                    throw new Error(errorDetails.message || `Falha ao carregar a lista de usuários. Status: ${usersResponse.status}`);
                }
                const usersData = await usersResponse.json(); // Pode ser { users: [...] }
                console.log('[TaskEditForm] Usuários carregados:', usersData);
                // CORREÇÃO AQUI: Acessar a propriedade 'users' do objeto retornado
                setUsers(usersData.users || []); 
            } catch (err) {
                console.error('[TaskEditForm] Erro ao buscar usuários:', err);
                setUsersError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar usuários.');
            }

            // Fetch Projetos
            try {
                console.log('[TaskEditForm] Buscando lista de projetos...');
                const projetosResponse = await fetch('/api/crud/projetos');
                if (!projetosResponse.ok) {
                    const errorDetails = await projetosResponse.json().catch(() => ({ message: 'Erro desconhecido ao parsear resposta de projetos.' }));
                    throw new Error(errorDetails.message || `Falha ao carregar a lista de projetos. Status: ${projetosResponse.status}`);
                }
                const projetosData = await projetosResponse.json();
                console.log('[TaskEditForm] Projetos carregados:', projetosData);
                setProjetos(projetosData.projetos || []);
            } catch (err) {
                console.error('[TaskEditForm] Erro ao buscar projetos:', err);
                setProjetosError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar projetos.');
            }

            setDataLoading(false);
        };

        fetchData();
    }, [taskId]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (value === "" && (name === "description" || name === "dueDate" || name === "projetoId"))
                ? null
                : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (status !== 'authenticated' || (session?.user as any)?.role !== 'ADMIN') {
            setError('Acesso não autorizado para atualizar a tarefa.');
            setLoading(false);
            return;
        }

        try {
            console.log('[TaskEditForm] Enviando dados para atualização da tarefa:', formData);
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar a tarefa.');
            }

            const updatedTask: Task = await response.json();
            console.log('[TaskEditForm] Tarefa atualizada com sucesso:', updatedTask);
            onTaskUpdated(updatedTask);
            onClose();
        } catch (err) {
            console.error('[TaskEditForm] Erro ao atualizar a tarefa:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido ao atualizar a tarefa.');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                    <p className="text-center">Carregando dados da tarefa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Tarefa</h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {usersError && <p className="text-red-500 text-center mb-4">{usersError}</p>}
                {projetosError && <p className="text-red-500 text-center mb-4">{projetosError}</p>}


                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea
                                name="description"
                                id="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                id="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                            >
                                {Object.values(TaskStatusEnum).map(statusOpt => (
                                    <option key={statusOpt} value={statusOpt}>{statusOpt.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridade</label>
                            <select
                                name="priority"
                                id="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                            >
                                <option value={2}>Alta</option>
                                <option value={1}>Normal</option>
                                <option value={0}>Baixa</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                            <input
                                type="date"
                                name="dueDate"
                                id="dueDate"
                                value={formData.dueDate || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">Responsável</label>
                            {users.length === 0 && !usersError ? (
                                <p>Carregando usuários...</p>
                            ) : (
                                <select
                                    name="assignedToId"
                                    id="assignedToId"
                                    value={formData.assignedToId}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                                >
                                    <option value="">Selecione um usuário...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Campo para selecionar o Projeto */}
                        <div>
                            <label htmlFor="projetoId" className="block text-sm font-medium text-gray-700">Projeto</label>
                            {projetos.length === 0 && !projetosError ? (
                                <p>Carregando projetos...</p>
                            ) : (
                                <select
                                    name="projetoId"
                                    id="projetoId"
                                    value={formData.projetoId || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                                >
                                    <option value="">Nenhum Projeto</option>
                                    {projetos.map(projeto => (
                                        <option key={projeto.id} value={projeto.id}>{projeto.title}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || dataLoading || status !== 'authenticated' || (session && (session.user as any)?.role !== 'ADMIN')}
                            className={`py-2 px-4 rounded-md font-bold transition duration-300 ${loading || dataLoading || status !== 'authenticated' || (session && (session.user as any)?.role !== 'ADMIN') ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
                        >
                            {loading ? 'Atualizando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskEditForm;
