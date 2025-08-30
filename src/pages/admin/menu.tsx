import AdminLayout from '../../components/admin/AdminLayout';
import MenuForm from '../../components/admin/MenuForm';

export default function AdminMenuPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4  ">Gerenciar Menu</h1>
        <MenuForm />
      </div>
    </AdminLayout>
  );
}