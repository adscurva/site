// components/FileViewerModal.tsx
import { useState } from 'react';
import { File } from 'types/task';

interface FileViewerModalProps {
  file: File;
  onClose: () => void;
  onEdit?: (file: File) => void;
  onDelete?: (file: File) => void;
}

export default function FileViewerModal({ file, onClose, onEdit, onDelete }: FileViewerModalProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    if (confirmingDelete) {
      onDelete?.(file);
    } else {
      setConfirmingDelete(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold truncate">{file.filename}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 font-bold text-lg">&times;</button>
        </div>

        {/* Preview do arquivo */}
        <div className="mb-4">
          {file.mimetype.startsWith('image/') && (
            <img src={file.url} alt={file.filename} className="w-full max-h-[60vh] object-contain rounded" />
          )}
          {file.mimetype.startsWith('video/') && (
            <video src={file.url} controls className="w-full max-h-[60vh] rounded" />
          )}
          {file.mimetype === 'application/pdf' && (
            <iframe src={file.url} className="w-full h-[60vh]" title={file.filename}></iframe>
          )}
          {!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/') && file.mimetype !== 'application/pdf' && (
            <p className="text-gray-500">Tipo de arquivo não suportado para visualização.</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-md transition"
          >
            Download
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(file)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-md transition"
            >
              Editar
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className={`font-bold px-4 py-2 rounded-md transition ${
                confirmingDelete ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {confirmingDelete ? 'Confirmar Exclusão' : 'Excluir'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
