// src/pages/admin/banner.tsx

import AdminLayout from '../../components/admin/AdminLayout';
import BannerForm from '../../components/admin/BannerForm';

export default function AdminBannerPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4  ">Gerenciar Banner</h1>
        <BannerForm />
      </div>
    </AdminLayout>
  );
}