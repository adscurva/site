import React, { useEffect, useState, FormEvent, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Task, TaskStatusEnum } from 'types/task';

export interface File {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  uploadedById: string;
  taskId?: string | null;
  projetoId?: string | null;
  createdAt: string;
  uploadedBy?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
  projeto?: { id: string; title: string } | null;
}

interface ExtendedTask extends Task {
  files?: File[];
  projetoId?: string | null;
}

interface TaskDetailModalProps {
  task: ExtendedTask;
  onClose: () => void;
}

interface FileViewerModalProps {
  file: File;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose }) => {
  const isImage = file.mimetype.startsWith('image/');
  const isPdf = file.mimetype === 'application/pdf';

  const renderContent = () => {
    if (isImage) {
      return <img src={file.url} alt={file.filename} className="max-h-[80vh] w-auto mx-auto rounded-lg shadow-xl" />;
    }
    if (isPdf) {
      return (
        <iframe
          src={file.url}
          className="w-full h-[80vh] border-0 rounded-lg shadow-xl"
          title={file.filename}
        ></iframe>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <p className="text-xl font-semibold mb-2">Pré-visualização não disponível</p>
        <a
          href={file.url}
          download={file.filename}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md"
        >
          Baixar Arquivo
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-[60]">
      <div className="relative p-4 bg-white rounded-lg shadow-2xl max-w-4xl w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl"
        >
          &times;
        </button>
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{file.filename}</h3>
        {renderContent()}
      </div>
    </div>
  );
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { data: session } = useSession();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileToUpload, setFileToUpload] = useState<globalThis.File | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isFileSavingMetadata, setIsFileSavingMetadata] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const fetchFiles = useCallback(async () => {
    if (!task?.id) return;
    try {
      const response = await fetch(`/api/files?taskId=${task.id}`);
      if (response.ok) {
        const data: File[] = await response.json();
        setUploadedFiles(data);
      }
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
    }
  }, [task?.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

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
    if (!fileToUpload || !task?.id) {
      setFileUploadError('Nenhum arquivo selecionado ou ID da tarefa ausente.');
      return;
    }

    setIsFileUploading(true);
    setFileUploadError(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error('Falha ao fazer upload físico do arquivo.');
      const uploadedFileDetails = await uploadResponse.json();

      setIsFileUploading(false);
      setIsFileSavingMetadata(true);

      const saveMetadataResponse = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadedFileDetails.url,
          filename: uploadedFileDetails.filename,
          mimetype: uploadedFileDetails.mimetype,
          taskId: task.id,
          projetoId: task.projetoId || null,
        }),
      });

      if (!saveMetadataResponse.ok) throw new Error('Falha ao salvar metadados do arquivo.');

      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchFiles();
    } catch (error) {
      console.error("Erro no upload/salvamento do arquivo:", error);
      setFileUploadError(error instanceof Error ? error.message : 'Erro ao processar o arquivo.');
    } finally {
      setIsFileUploading(false);
      setIsFileSavingMetadata(false);
    }
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isProcessingFile = isFileUploading || isFileSavingMetadata;

  if (!task) return null;

  const getStatusColor = (status: TaskStatusEnum) => {
    switch (status) {
      case TaskStatusEnum.PENDENTE: return 'bg-yellow-100 text-yellow-800';
      case TaskStatusEnum.EM_ANDAMENTO: return 'bg-blue-100 text-blue-800';
      case TaskStatusEnum.CONCLUIDA: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'bg-red-100 text-red-800';
    if (priority === 2) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityText = (priority: number) => {
    if (priority >= 3) return 'Alta';
    if (priority === 2) return 'Média';
    return 'Baixa';
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <span>🖼️</span>;
    if (mimetype === 'application/pdf') return <span>📄</span>;
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return <span>📊</span>;
    if (mimetype.includes('document') || mimetype.includes('word')) return <span>📝</span>;
    return <span>📁</span>;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-orange-600 border-b pb-2">Detalhes da Tarefa</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Detalhes da Tarefa */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm space-y-2">
              <p className="text-sm font-medium text-gray-500">Descrição:</p>
              <p className="text-gray-900">{task.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status:</p>
                <span className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Prioridade:</p>
                <span className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                  {getPriorityText(task.priority)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Criada em:</p>
                <p className="mt-1 text-gray-900">{formatDate(task.createdAt)}</p>
              </div>
              {task.updatedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Última atualização:</p>
                  <p className="mt-1 text-gray-900">{formatDate(task.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Arquivos */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Arquivos ({uploadedFiles.length})</h3>
            {(session?.user as any)?.role === 'ADMIN' && (
              <form onSubmit={handleFileUpload} className="mb-4">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    disabled={isProcessingFile}
                  />
                  <button
                    type="submit"
                    disabled={isProcessingFile || !fileToUpload}
                    className={`py-2 px-4 rounded-md font-bold transition duration-300 w-full sm:w-auto ${
                      isProcessingFile || !fileToUpload ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                    } text-white`}
                  >
                    {isFileUploading ? 'Enviando...' : isFileSavingMetadata ? 'Salvando...' : 'Enviar'}
                  </button>
                </div>
                {fileUploadError && <p className="text-red-600 text-sm mt-2">{fileUploadError}</p>}
              </form>
            )}

            <div className="flex flex-wrap gap-3">
              {uploadedFiles.length === 0 ? (
                <p className="text-gray-600">Nenhum arquivo anexado ainda.</p>
              ) : (
                uploadedFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="flex flex-col items-center p-2 border rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 bg-white group hover:bg-gray-50"
                  >
                    {file.mimetype.startsWith('image/') ? (
                      <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 mb-1 transition-all group-hover:scale-105">
                        <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center mb-1">
                        {getFileIcon(file.mimetype)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 group-hover:text-orange-600 truncate max-w-[80px]">
                      {file.filename}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showFileModal && selectedFile && (
        <FileViewerModal file={selectedFile} onClose={() => setShowFileModal(false)} />
      )}
    </div>
  );
};

export default TaskDetailModal;
