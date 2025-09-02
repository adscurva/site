import { useSession } from 'next-auth/react';
import AdminLayout from '../../components/admin/AdminLayout';
import MenuForm from '../../components/admin/MenuForm';
import Link from 'next/link';

export default function AdminMenuPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <AdminLayout><p>Verificando autenticação...</p></AdminLayout>;
  if ((status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <p className="text-red-500 text-center mt-8">Acesso negado. Apenas administradores podem visualizar os arquivos.</p>
        <Link href="/api/auth/signin" className="text-center block mt-4 text-orange-500 font-bold">Fazer Login</Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4  ">Gerenciar Menu</h1>
        <MenuForm />
      </div>
    </AdminLayout>
  );
}