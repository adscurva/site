// pages/admin/files.tsx
import { useEffect, useState, useCallback, useRef, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AdminLayout from 'components/admin/AdminLayout';
import { File, Projeto, Task } from 'types/task';
import FileViewerModal from 'components/FileViewerModal';
import EditFileModal from 'components/EditFileModal';

type FilesTableProps = {
  files: File[];
  selectedFilesIds: string[];
  toggleFileSelection: (fileId: string) => void;
  handleFileClick: (file: File) => void;
  handleEditFile: (file: File) => void;
  handleDelete: (file: File) => void;
};

const FilesTable = ({ files, selectedFilesIds, toggleFileSelection, handleFileClick, handleEditFile, handleDelete }: FilesTableProps) => {
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <span className="text-blue-500">🖼️</span>;
    if (mimetype === 'application/pdf') return <span className="text-red-500">📄</span>;
    return <span className="text-gray-500">📁</span>;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {files.length === 0 ? (
        <p className="p-6 text-gray-500 text-center">Nenhum arquivo encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3"><span className="sr-only">Selecionar</span></th>
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
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFilesIds.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 truncate flex items-center gap-2">
                    {file.mimetype.startsWith('image/') ? (
                      <img src={file.url} className="w-8 h-8 object-cover rounded" />
                    ) : getFileIcon(file.mimetype)}
                    {file.filename}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{file.projeto?.title || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{file.task?.title || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{file.mimetype}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium flex gap-2 justify-end">
                    <button onClick={() => handleFileClick(file)} className="text-orange-600 hover:text-orange-900">Visualizar</button>
                    <button onClick={() => handleEditFile(file)} className="text-orange-600 hover:text-green-900">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

type FilesGridProps = {
  files: File[];
  selectedFilesIds: string[];
  toggleFileSelection: (fileId: string) => void;
  handleFileClick: (file: File) => void;
};

const FilesGrid = ({ files, selectedFilesIds, toggleFileSelection, handleFileClick }: FilesGridProps) => {
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <span className="text-blue-500">🖼️</span>;
    if (mimetype === 'application/pdf') return <span className="text-red-500">📄</span>;
    return <span className="text-gray-500">📁</span>;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {files.length === 0 ? (
        <p className="text-gray-500 col-span-full text-center">Nenhum arquivo encontrado.</p>
      ) : files.map(file => (
        <div key={file.id} className="relative">
          <input
            type="checkbox"
            checked={selectedFilesIds.includes(file.id)}
            onChange={() => toggleFileSelection(file.id)}
            className="absolute top-2 left-2 w-4 h-4 z-10"
          />
          <button
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
        </div>
      ))}
    </div>
  );
};

export default function FilesPage() {
  const { status } = useSession();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projetosLoading, setProjetosLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [editingFile, setEditingFile] = useState<File | null>(null);

  const [selectedProjetoId, setSelectedProjetoId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isFileSavingMetadata, setIsFileSavingMetadata] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const [selectedFilesIds, setSelectedFilesIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- Fetch Tasks ---
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

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (filesToUpload.length === 0) {
      setFileUploadError('Selecione ao menos um arquivo.');
      return;
    }

    setIsFileUploading(true);
    setFileUploadError(null);

    try {
      for (const fileToUpload of filesToUpload) {
        const formData = new FormData();
        formData.append('file', fileToUpload);

        // Upload físico
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error(`Falha ao enviar arquivo: ${fileToUpload.name}`);
        const uploadedFileDetails: { url: string; filename: string; mimetype: string } = await uploadResponse.json();

        // Salvar metadados
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
        if (!saveResponse.ok) throw new Error(`Falha ao salvar metadados: ${fileToUpload.name}`);
        setIsFileSavingMetadata(false);
      }

      setFilesToUpload([]);
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

  const handleEditFile = async (file: File) => {
    setEditingFile(file);

    if (file.projeto?.id) {
      try {
        setTasksLoading(true);
        const res = await fetch(`/api/tasks?projetoId=${file.projeto.id}`);
        if (!res.ok) throw new Error('Falha ao carregar tarefas do projeto.');
        const data: Task[] = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    } else {
      setTasks([]);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFilesIds(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedFilesIds.length === 0) return;
    if (!confirm('Deseja realmente excluir os arquivos selecionados?')) return;

    try {
      for (const fileId of selectedFilesIds) {
        const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao excluir arquivo');
      }
      setFiles(prev => prev.filter(f => !selectedFilesIds.includes(f.id)));
      setSelectedFilesIds([]);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir arquivos selecionados');
    }
  };

  const handleShareSelected = () => {
    if (selectedFilesIds.length === 0) return;

    const selectedFiles = files.filter(f => selectedFilesIds.includes(f.id));

    const urlsWithCorrectNames = selectedFiles.map(f => {
      let filename = f.filename;

      // Garante extensão correta
      if (
        (f.mimetype === 'application/pdf' && !filename.endsWith('.pdf')) ||
        (f.mimetype.startsWith('video/') && !filename.includes('.')) ||
        (f.mimetype.startsWith('image/') && !filename.includes('.'))
      ) {
        const ext = f.mimetype.split('/')[1]; // pdf, jpeg, mp4, etc
        filename += `.${ext}`;
      }

      // Link absoluto com query param ?dl= para forçar nome correto ao baixar
      return `${window.location.origin}/api/files/download/${f.id}?dl=${encodeURIComponent(filename)}`;
    }).join('\n');

    navigator.clipboard.writeText(urlsWithCorrectNames)
      .then(() => alert('Links copiados para a área de transferência!'))
      .catch(err => {
        console.error(err);
        alert('Falha ao copiar links');
      });
  };

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

        {/* Ações em massa */}
        {selectedFilesIds.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleShareSelected}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Compartilhar ({selectedFilesIds.length})
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Excluir ({selectedFilesIds.length})
            </button>
          </div>
        )}

        {/* Upload */}
        <form onSubmit={handleFileUpload} className="mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFilesToUpload(e.target.files ? Array.from(e.target.files) : [])}
              multiple
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <button
              type="submit"
              disabled={filesToUpload.length === 0 || isFileUploading || isFileSavingMetadata}
              className={`py-2 px-4 rounded-md font-bold transition duration-300 ${filesToUpload.length === 0 || isFileUploading || isFileSavingMetadata ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
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
          <FilesTable
            files={files}
            selectedFilesIds={selectedFilesIds}
            toggleFileSelection={toggleFileSelection}
            handleFileClick={handleFileClick}
            handleEditFile={handleEditFile}
            handleDelete={file => handleDeleteSelected()}
          />
        ) : (
          <FilesGrid
            files={files}
            selectedFilesIds={selectedFilesIds}
            toggleFileSelection={toggleFileSelection}
            handleFileClick={handleFileClick}
          />
        )}

        {showFileModal && selectedFile && (
          <FileViewerModal
            file={selectedFile}
            onClose={() => setShowFileModal(false)}
            onEdit={handleEditFile}
            onDelete={handleDeleteSelected}
          />
        )}

        {editingFile && (
          <EditFileModal
            file={editingFile}
            projetos={projetos}
            tasks={tasks}
            onClose={() => setEditingFile(null)}
            onSave={async (fileId, projetoId, taskId) => {
              try {
                const res = await fetch(`/api/files/${fileId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projetoId, taskId }),
                });
                if (!res.ok) throw new Error('Falha ao atualizar arquivo');
                setFiles(prev => prev.map(f =>
                  f.id === fileId
                    ? {
                      ...f,
                      projeto: projetoId ? projetos.find(p => p.id === projetoId) : undefined,
                      task: taskId ? tasks.find(t => t.id === taskId) : undefined,
                    }
                    : f
                ));
                setEditingFile(null);
              } catch (err) {
                console.error(err);
                alert('Erro ao atualizar arquivo');
              }
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
