import React from 'react';
import { File } from 'types/task';

type Props = {
  files: File[];
  handleFileClick: (file: File) => void;
  handleEditFile: (file: File) => void;
  handleDelete: (file: File) => void;
  confirmingDeleteId: string | null;
  setConfirmingDeleteId: (id: string | null) => void;
  getFileIcon: (mimetype: string) => React.ReactNode;
};

export default function FileTable({ files, handleFileClick, handleEditFile, handleDelete, confirmingDeleteId, setConfirmingDeleteId, getFileIcon }: Props) {
  return (
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
                  <td className="px-6 py-4 text-right text-sm font-medium flex gap-2 justify-end">
                    <button onClick={() => handleFileClick(file)} className="text-orange-600 hover:text-orange-900">Visualizar</button>
                    <button onClick={() => handleEditFile(file)} className="text-orange-600 hover:text-green-900">Editar</button>

                    {confirmingDeleteId === file.id ? (
                      <>
                        <button onClick={() => handleDelete(file)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md">Confirmar</button>
                        <button onClick={() => setConfirmingDeleteId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md">Cancelar</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmingDeleteId(file.id)} className="text-orange-600 hover:text-green-900 px-3 py-1 rounded-md">Excluir</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
