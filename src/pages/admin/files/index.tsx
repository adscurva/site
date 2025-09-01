import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AdminLayout from 'components/admin/AdminLayout';
import { File, User, Projeto } from '../../../types/task'; // Ajuste conforme seus types
import FileViewerModal from 'components/FileViewerModal';

export default function FilesPage() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetosLoading, setProjetosLoading] = useState(true);
  const [selectedProjetoId, setSelectedProjetoId] = useState<string>('');

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // --- Fetch Files ---
  const fetchFiles = useCallback(async (projetoId?: string) => {
    if (status !== 'authenticated' || !(session?.user as any)?.id) {
      setError('Você precisa estar autenticado.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let url = '/api/files';
      if (projetoId) url += `?projetoId=${projetoId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao buscar arquivos.');
      const data: File[] = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [status, session?.user?.id]);

  useEffect(() => {
    if (status === 'authenticated') fetchFiles(selectedProjetoId);
  }, [status, selectedProjetoId, fetchFiles]);

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    setShowFileModal(true);
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

        {/* Filtro de Projeto */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
            value={selectedProjetoId}
            onChange={e => setSelectedProjetoId(e.target.value)}
            disabled={projetosLoading}
          >
            <option value="">Todos os Projetos</option>
            {projetos.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.title}</option>
            ))}
          </select>

          <button
            className={`px-6 py-2 rounded-md font-bold ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('table')}
          >Tabela</button>
          <button
            className={`px-6 py-2 rounded-md font-bold ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('grid')}
          >Grid</button>
        </div>

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado por</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 relative"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map(file => (
                      <tr key={file.id} className="hover:bg-gray-100 transition duration-150">
                        <td className="px-6 py-4 text-sm text-gray-900 truncate">{file.filename}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{file.projeto?.title || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{file.mimetype}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{file.uploadedBy?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right text-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {files.map(file => (
              <div key={file.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition cursor-pointer" onClick={() => handleFileClick(file)}>
                <p className="font-semibold truncate">{file.filename}</p>
                <p className="text-sm text-gray-500">{file.projeto?.title || 'N/A'}</p>
                <p className="text-xs text-gray-400">{file.mimetype}</p>
                <p className="text-xs text-gray-400">{new Date(file.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {showFileModal && selectedFile && (
          <FileViewerModal file={selectedFile} onClose={() => setShowFileModal(false)} />
        )}
      </div>
    </AdminLayout>
  );
}
