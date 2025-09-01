import React from 'react';
import { File } from 'types/task';

interface FileViewerModalProps {
  file: File;
  onClose: () => void;
}

export default function FileViewerModal({ file, onClose }: FileViewerModalProps) {
  const isImage = file.mimetype.startsWith('image/');
  const isPDF = file.mimetype === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-lg"
        >
          ✕
        </button>

        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">{file.filename}</h2>
          <p className="text-sm text-gray-500 mb-4">
            Projeto: {file.projeto?.title || 'N/A'} | Enviado por: {file.uploadedBy?.name || 'N/A'} | Tipo: {file.mimetype}
          </p>

          <div className="flex justify-center items-center mb-4">
            {isImage && (
              <img src={file.url} alt={file.filename} className="max-h-[60vh] object-contain rounded" />
            )}
            {isPDF && (
              <iframe
                src={file.url}
                className="w-full h-[60vh] border rounded"
                title={file.filename}
              />
            )}
            {!isImage && !isPDF && (
              <p className="text-gray-500">Visualização não disponível para este tipo de arquivo.</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Abrir/Download
            </a>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
