import React from 'react';
import { File } from 'types/task';

type Props = {
  files: File[];
  handleFileClick: (file: File) => void;
  getFileIcon: (mimetype: string) => React.ReactNode;
};

export default function FileGrid({ files, handleFileClick, getFileIcon }: Props) {
  return (
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
            <div className="w-16 h-16 flex items-center justify-center mb-1">{getFileIcon(file.mimetype)}</div>
          )}
          <span className="text-xs font-medium text-gray-700 group-hover:text-orange-600 truncate max-w-[90px]">{file.filename}</span>
        </button>
      ))}
    </div>
  );
}
