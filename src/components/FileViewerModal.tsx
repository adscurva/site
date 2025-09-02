import { useState, useEffect } from 'react';
import { File } from 'types/task';

interface FileViewerModalProps {
  file: File;
  onClose: () => void;
  onEdit?: (file: File) => void;
  onDelete?: (file: File) => void;
}

export default function FileViewerModal({ file, onClose, onEdit, onDelete }: FileViewerModalProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.mimetype === 'application/pdf') {
      const loadPdf = async () => {
        try {
          const response = await fetch(file.url, { mode: 'cors' });
          if (!response.ok) throw new Error('Falha ao carregar PDF');

          const blob = await response.blob();
          // Cria URL de blob com tipo PDF
          const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          console.log('PDF blob URL para visualização:', url);
          setPdfBlobUrl(url);
        } catch (err) {
          console.error(err);
        }
      };
      loadPdf();

      return () => {
        if (pdfBlobUrl) {
          window.URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
        }
      };
    }
  }, [file]);

  const handleDownload = async () => {
    try {
      let downloadFilename = file.filename;

      // Garantir extensão para PDFs e outros arquivos raw
      if (
        (file.mimetype === 'application/pdf' && !downloadFilename.endsWith('.pdf')) ||
        (file.mimetype.startsWith('video/') && !downloadFilename.includes('.')) ||
        (file.mimetype.startsWith('image/') && !downloadFilename.includes('.'))
      ) {
        const ext = file.mimetype.split('/')[1]; // pdf, jpeg, mp4, etc
        downloadFilename += `.${ext}`;
      }

      const response = await fetch(file.url, { mode: 'cors' });
      if (!response.ok) throw new Error('Falha ao baixar o arquivo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename; // <- usa o nome com extensão correta
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erro ao baixar o arquivo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-4xl h-screen flex flex-col rounded-lg overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold truncate">{file.filename}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 font-bold text-lg">&times;</button>
        </div>

        {/* Preview do arquivo */}
        <div className="flex-1 overflow-auto">
          {file.mimetype.startsWith('image/') && (
            <img src={file.url} alt={file.filename} className="w-full h-full object-contain" />
          )}
          {file.mimetype.startsWith('video/') && (
            <video src={file.url} controls className="w-full h-full" />
          )}
          {file.mimetype === 'application/pdf' && pdfBlobUrl && (
            <iframe src={pdfBlobUrl} className="w-full h-full" title={file.filename}></iframe>
          )}
          {!file.mimetype.startsWith('image/') &&
            !file.mimetype.startsWith('video/') &&
            file.mimetype !== 'application/pdf' && (
              <p className="text-gray-500 p-4">Tipo de arquivo não suportado para visualização.</p>
            )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-wrap">
          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-md transition"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
