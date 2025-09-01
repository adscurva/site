import { useEffect, useState, useCallback, useRef, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AdminLayout from 'components/admin/AdminLayout';
import { File, Projeto, Task } from 'types/task';
import FileViewerModal from 'components/FileViewerModal';

export default function FilesPage() {
  const { data: session, status } = useSession();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projetosLoading, setProjetosLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [selectedProjetoId, setSelectedProjetoId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Upload de arquivos ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileToUpload, setFileToUpload] = useState<globalThis.File | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isFileSavingMetadata, setIsFileSavingMetadata] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // --- Fetch Projetos ---
  useEffect(() => {
    const fetchProjetos = async () => {
      setProjetosLoading(true);
      try {
        const res = await fetch('/api/crud/projetos');
        if (!res.ok) throw new Error('Falha ao carregar projetos.');
        const data = await res.json();
        setProjetos(data.projetos);
      } catch (err) {
        console.error(err);
      } finally {
        setProjetosLoading(false);
      }
    };
    fetchProjetos();
  }, []);

  // --- Fetch Tasks do projeto selecionado ---
  useEffect(() => {
    if (!selectedProjetoId) {
      setTasks([]);
      return;
    }
    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const res = await fetch(`/api/tasks?projetoId=${selectedProjetoId}`);
        if (!res.ok) throw new Error('Falha ao carregar tarefas.');
        const data: Task[] = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, [selectedProjetoId]);

  // --- Fetch Files ---
  const fetchFiles = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      setLoading(true);
      let url = '/api/files';
      const params = [];
      if (selectedProjetoId) params.push(`projetoId=${selectedProjetoId}`);
      if (selectedTaskId) params.push(`taskId=${selectedTaskId}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao buscar arquivos.');
      const data: File[] = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [selectedProjetoId, selectedTaskId, status]);

  useEffect(() => {
    if (status === 'authenticated') fetchFiles();
  }, [status, selectedProjetoId, selectedTaskId, fetchFiles]);

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
      setFileUploadError(null);
    } else {
      setFileToUpload(null);
    }
  };

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setFileUploadError('Selecione um arquivo.');
      return;
    }

    setIsFileUploading(true);
    setFileUploadError(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    let uploadedFileDetails: { url: string; filename: string; mimetype: string };

    try {
      // Upload físico
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error('Falha ao enviar arquivo.');
      uploadedFileDetails = await uploadResponse.json();

      // Salvar metadados
      setIsFileUploading(false);
      setIsFileSavingMetadata(true);

      const saveResponse = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadedFileDetails.url,
          filename: uploadedFileDetails.filename,
          mimetype: uploadedFileDetails.mimetype,
          projetoId: selectedProjetoId || null,
          taskId: selectedTaskId || null,
        }),
      });
      if (!saveResponse.ok) throw new Error('Falha ao salvar metadados.');

      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchFiles();
    } catch (err) {
      console.error(err);
      setFileUploadError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setIsFileUploading(false);
      setIsFileSavingMetadata(false);
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <span className="text-blue-500">🖼️</span>;
    if (mimetype === 'application/pdf') return <span className="text-red-500">📄</span>;
    return <span className="text-gray-500">📁</span>;
  };

  if (status === 'loading') return <AdminLayout><p>Verificando autenticação...</p></AdminLayout>;
  if (status === 'unauthenticated' || (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <p className="text-red-500 text-center mt-8">Acesso negado. Apenas administradores podem visualizar os arquivos.</p>
        <Link href="/api/auth/signin" className="text-center block mt-4 text-orange-500 font-bold">Fazer Login</Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head><title>Arquivos</title></Head>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Arquivos</h1>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
            value={selectedProjetoId}
            onChange={e => {
              setSelectedProjetoId(e.target.value);
              setSelectedTaskId('');
            }}
            disabled={projetosLoading}
          >
            <option value="">Todos os Projetos</option>
            {projetos.map(proj => <option key={proj.id} value={proj.id}>{proj.title}</option>)}
          </select>

          {selectedProjetoId && (
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              disabled={tasksLoading}
            >
              <option value="">Todas as Tarefas</option>
              {tasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
          )}

          <button
            className={`px-6 py-2 rounded-md font-bold ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('table')}
          >Tabela</button>
          <button
            className={`px-6 py-2 rounded-md font-bold ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('grid')}
          >Grid</button>
        </div>

        {/* Formulário de Upload */}
        <form onSubmit={handleFileUpload} className="mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <button
              type="submit"
              disabled={!fileToUpload || isFileUploading || isFileSavingMetadata}
              className={`py-2 px-4 rounded-md font-bold transition duration-300 ${!fileToUpload || isFileUploading || isFileSavingMetadata ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
            >
              {isFileUploading ? 'Enviando...' : isFileSavingMetadata ? 'Salvando...' : 'Enviar'}
            </button>
          </div>
          {fileUploadError && <p className="text-red-600 mt-2">{fileUploadError}</p>}
        </form>

        {/* Conteúdo */}
        {loading || projetosLoading ? (
          <p>Carregando arquivos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : viewMode === 'table' ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {files.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">Nenhum arquivo encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarefa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 relative"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map(file => (
                      <tr key={file.id} className="hover:bg-gray-100 transition duration-150">
                        <td className="px-6 py-4 text-sm text-gray-900 truncate flex items-center gap-2">
                          {file.mimetype.startsWith('image/') ? (
                            <img src={file.url} className="w-8 h-8 object-cover rounded" />
                          ) : (
                            getFileIcon(file.mimetype)
                          )}
                          {file.filename}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{file.projeto?.title || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{file.task?.title || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{file.mimetype}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button onClick={() => handleFileClick(file)} className="text-orange-600 hover:text-orange-900">Visualizar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">Nenhum arquivo encontrado.</p>
            ) : files.map(file => (
              <button
                key={file.id}
                onClick={() => handleFileClick(file)}
                className="flex flex-col items-center p-2 border rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 bg-white group hover:bg-gray-50"
              >
                {file.mimetype.startsWith('image/') ? (
                  <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-200 mb-1 transition-all group-hover:scale-105">
                    <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center mb-1">
                    {getFileIcon(file.mimetype)}
                  </div>
                )}
                <span className="text-xs font-medium text-gray-700 group-hover:text-orange-600 truncate max-w-[90px]">{file.filename}</span>
              </button>
            ))}
          </div>
        )}

        {showFileModal && selectedFile && (
          <FileViewerModal
            file={selectedFile}
            onClose={() => setShowFileModal(false)}
            onEdit={(file) => {
              // Aqui você abre um modal de edição para alterar projeto e tarefa
              console.log('Editar arquivo', file);
            }}
            onDelete={async (file) => {
              // Confirmação já é tratada dentro do modal
              try {
                const res = await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Falha ao excluir arquivo');
                setFiles(prev => prev.filter(f => f.id !== file.id));
                setShowFileModal(false);
              } catch (err) {
                console.error(err);
                alert('Erro ao excluir arquivo');
              }
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
