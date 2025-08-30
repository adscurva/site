// src/pages/admin/index.tsx

import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-4  ">Dashboard</h1>
                <p className="text-lg  ">Bem-vindo ao painel de administração!</p>
                <div className="mt-8 p-6 bg-white rounded shadow-md">
                  <p>Use o menu lateral para navegar e gerenciar o conteúdo do site.</p>
                </div>
            </div>
        </AdminLayout>
    );
}