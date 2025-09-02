import React, { FormEvent } from 'react';

type Props = {
  fileInputRef: React.RefObject<HTMLInputElement>;
  filesToUpload: File[];
  setFilesToUpload: (files: File[]) => void;
  handleFileUpload: (e: FormEvent) => Promise<void>;
  isFileUploading: boolean;
  isFileSavingMetadata: boolean;
  fileUploadError: string | null;
};

export default function FileUploadForm({ fileInputRef, filesToUpload, setFilesToUpload, handleFileUpload, isFileUploading, isFileSavingMetadata, fileUploadError }: Props) {
  return (
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
  );
}
