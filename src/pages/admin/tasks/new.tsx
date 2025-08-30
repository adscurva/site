import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Task, User } from '../../../types/task';
import AdminLayout from 'components/admin/AdminLayout';

// Defina as interfaces para o formulário
interface TaskFormData {
  title: string;
  description: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  priority: number;
  dueDate: string;
  assignedToId: string;
  projetoId?: string; // NOVO: campo opcional para o ID do projeto
}

// Interface para o Projeto, baseada no seu schema.prisma
interface Projeto {
  id: string;
  title: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'PENDENTE',
    priority: 1,
    dueDate: '',
    assignedToId: '',
    projetoId: '', // Inicializa como string vazia para o select
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]); // NOVO: Estado para armazenar projetos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [projetosLoading, setProjetosLoading] = useState(true); // NOVO: Estado para carregamento de projetos

  // LOG PARA DEPURAR A SESSAO NO NAVEGADOR (CLIENT-SIDE)
  useEffect(() => {
    console.log("[NewTaskPage CLIENT] Sessão:", JSON.stringify(session, null, 2));
    console.log("[NewTaskPage CLIENT] Status:", status);
    if (session) {
      console.log("[NewTaskPage CLIENT] User ID:", session.user?.id);
      console.log("[NewTaskPage CLIENT] User Role:", (session.user as any)?.role);
    }
  }, [session, status]);

  // Busca a lista de usuários da sua API /api/users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Falha ao carregar usuários.');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error('Falha ao buscar usuários:', err);
        setError('Falha ao carregar a lista de usuários.');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
        setError('Falha ao carregar a lista de projetos.');
      } finally {
        setProjetosLoading(false);
      }
    };
    fetchProjetos();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedValue = name === 'priority' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.assignedToId || !formData.dueDate) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Obter o autorId da sessão
    const authorId = session?.user?.id;
    // Verificação de autenticação e role antes de enviar a requisição POST
    if (status !== 'authenticated' || !authorId) {
      setError('Você precisa estar logado para criar tarefas.');
      return;
    }
    if ((session.user as any)?.role !== 'ADMIN') {
      setError('Acesso negado. Apenas administradores podem criar tarefas.');
      setLoading(false);
      return;
    }


    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData, authorId };
      // Se projetoId for uma string vazia, remova-o do payload para enviar null ou undefined ao backend
      if (payload.projetoId === '') {
        delete payload.projetoId;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar a tarefa.');
      }

      const newTask = await response.json();
      console.log('Tarefa criada com sucesso:', newTask);

      router.push('/admin/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro inesperado ocorreu.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="container mx-auto p-4 md:p-8 text-center text-gray-500">
          <p>Carregando...</p>
        </div>
      </AdminLayout>
    );
  }

  // Se o usuário não estiver autenticado OU não for ADMIN, mostra mensagem de acesso negado
  if (status === 'unauthenticated' || (session && (session.user as any)?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center text-red-500 p-4">
          <p className="text-2xl font-bold mb-4">Acesso Não Autorizado!</p>
          <p className="text-lg">Você não tem permissão para criar novas tarefas.</p>
          <p className="text-gray-600 mt-4">
            Por favor, verifique suas credenciais ou entre em contato com o administrador.
          </p>
          <Link href="/admin/tasks" className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md">
            Voltar para a lista de tarefas
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Head>
          <title>Nova Tarefa</title>
        </Head>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Criar Nova Tarefa</h1>
          <p className="text-gray-500">
            <Link href="/admin/tasks" className="text-orange-500 hover:underline">Voltar para a lista de tarefas</Link>
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 text-sm">{error}</div>}

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
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDA">Concluída</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select
                  name="priority"
                  id="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                >
                  <option value={0}>Baixa</option>
                  <option value={1}>Normal</option>
                  <option value={2}>Alta</option>
                </select>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block text-gray-700 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                {usersLoading ? (
                  <p className="mt-1 text-gray-500">Carregando usuários...</p>
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

              {/* NOVO: Campo de seleção de projeto */}
              <div>
                <label htmlFor="projetoId" className="block text-sm font-medium text-gray-700 mb-1">Projeto (Opcional)</label>
                {projetosLoading ? (
                  <p className="mt-1 text-gray-500">Carregando projetos...</p>
                ) : (
                  <select
                    name="projetoId"
                    id="projetoId"
                    value={formData.projetoId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
                  >
                    <option value="">Nenhum projeto</option> {/* Opção para não selecionar projeto */}
                    {projetos.map(projeto => (
                      <option key={projeto.id} value={projeto.id}>{projeto.title}</option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || usersLoading || projetosLoading || status !== 'authenticated' || (session && (session.user as any)?.role !== 'ADMIN')}
                className={`py-2 px-4 rounded-md font-bold transition duration-300 ${loading || usersLoading || projetosLoading || status !== 'authenticated' || (session && (session.user as any)?.role !== 'ADMIN') ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
              >
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
