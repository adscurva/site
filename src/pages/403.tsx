import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-primary mb-4">403 - Acesso Negado</h1>
        <p className="text-gray-700 mb-6">Você não tem permissão para visualizar esta página.</p>
        <Link href="/">
          <p className="text-primary hover:underline">Voltar para a página inicial</p>
        </Link>
      </div>
    </div>
  );
}