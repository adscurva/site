import React, { useEffect, useState, FormEvent, useCallback, useRef } from 'react';
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
        <p>Pré-visualização não disponível</p>
        <a href={file.url} download={file.filename} className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg">
          Baixar Arquivo
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-[60]">
      <div className="relative p-4 bg-white rounded-lg shadow-2xl max-w-4xl w-full">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 text-3xl">&times;</button>
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

  const [comments, setComments] = useState(task.comments || []);
  const [newCommentMessage, setNewCommentMessage] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const formatDate = (dateString: string | Date) =>
    new Date(dateString).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const fetchFiles = useCallback(async () => {
    if (!task?.id) return;
    try {
      const response = await fetch(`/api/files?taskId=${task.id}`);
      if (response.ok) {
        const data: File[] = await response.json();
        setUploadedFiles(data);
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
    }
  }, [task?.id]);

  useEffect(() => {
    if (task?.id) fetchFiles();
  }, [task?.id, fetchFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFileToUpload(e.target.files[0]);
    else setFileToUpload(null);
    setFileUploadError(null);
  };

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!fileToUpload || !task?.id) return;

    setIsFileUploading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error('Falha ao enviar arquivo');
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

      if (!saveMetadataResponse.ok) throw new Error('Falha ao salvar metadados');

      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchFiles();
    } catch (error) {
      console.error(error);
      setFileUploadError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsFileUploading(false);
      setIsFileSavingMetadata(false);
    }
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentMessage.trim() || !task?.id) return;

    setCommentLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newCommentMessage }),
      });
      if (response.ok) {
        setNewCommentMessage('');
        const updatedComments = await response.json();
        setComments(updatedComments);
      }
    } catch (error) {
      console.error(error);
      setCommentError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCommentLoading(false);
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-orange-600 border-b pb-2">Detalhes da Tarefa</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm space-y-2">
              <p className="text-gray-900">{task.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Status:</p>
                <span className={`mt-1 px-3 py-1 rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p>Prioridade:</p>
                <span className={`mt-1 px-3 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                  {getPriorityText(task.priority)}
                </span>
              </div>
            </div>
          </div>

          {/* Arquivos e Comentários */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Arquivos ({uploadedFiles.length})</h3>
            {(session?.user as any)?.role === 'ADMIN' && (
              <form onSubmit={handleFileUpload} className="mb-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={isFileUploading || isFileSavingMetadata} />
                <button type="submit" disabled={isFileUploading || isFileSavingMetadata || !fileToUpload}>Enviar</button>
                {fileUploadError && <p>{fileUploadError}</p>}
              </form>
            )}
            <div className="flex flex-wrap gap-3">
              {uploadedFiles.map(file => (
                <button key={file.id} onClick={() => handleFileClick(file)}>
                  {file.filename}
                </button>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Comentários ({comments.length})</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>{comment.author?.name || 'Usuário Desconhecido'}</span>
                    <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.message}</p>
                </div>
              ))}
            </div>
            {(session?.user as any)?.role === 'ADMIN' && (
              <form onSubmit={handleAddComment} className="border-t pt-4 mt-4">
                <textarea value={newCommentMessage} onChange={(e) => setNewCommentMessage(e.target.value)} rows={3}></textarea>
                <button type="submit" disabled={commentLoading || !newCommentMessage.trim()}>Comentar</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {showFileModal && selectedFile && <FileViewerModal file={selectedFile} onClose={() => setShowFileModal(false)} />}
    </div>
  );
};

export default TaskDetailModal;

// Mantém as funções de cores
function getStatusColor(status: TaskStatusEnum) {
  switch (status) {
    case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
    case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
    case 'CONCLUIDA': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: number) {
  if (priority >= 3) return 'bg-red-100 text-red-800';
  if (priority === 2) return 'bg-orange-100 text-orange-800';
  return 'bg-green-100 text-green-800';
}

function getPriorityText(priority: number) {
  if (priority >= 3) return 'Alta';
  if (priority === 2) return 'Média';
  return 'Baixa';
}
