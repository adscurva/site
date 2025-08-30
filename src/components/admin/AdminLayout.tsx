import { useState, ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  MdDashboard,
  MdMenu,
  MdPhotoLibrary,
  MdViewCarousel,
  MdReviews,
  MdHelpOutline,
  MdLogout,
  MdPalette,
  MdAssignment, 
  MdAddCircle, 
  MdClose, 
} from 'react-icons/md';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Botão para abrir/fechar a barra lateral em telas pequenas */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <MdClose className="text-2xl" />
          ) : (
            <MdMenu className="text-2xl" />
          )}
        </button>
      </div>

      {/* Camada de sobreposição para o modo mobile quando a barra lateral está aberta */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar de Navegação */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 z-30 shadow-lg p-6 bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:w-64`}
      >
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Painel Admin</h2>
        
        <nav className="space-y-6">
          {/* Grupo 1: Conteúdo da Landing Page */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Conteúdo da LP
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <Link href="/admin" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdDashboard className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/menu" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdMenu className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Menu</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/banner" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdViewCarousel className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Banner</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/homepage" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdPhotoLibrary className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Homepage</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/testimonials" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdReviews className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Depoimentos</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/faq" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdHelpOutline className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">FAQ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Grupo 2: Catálogo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Catálogo
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <Link href="/admin/projetos" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdPalette className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Projetos</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Grupo 3: Gerenciamento de Tarefas - NOVO */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Gerenciamento de Tarefas
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <Link href="/admin/tasks" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdAssignment className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Gerenciar Tarefas</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/tasks/new" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdAddCircle className="mr-3 text-xl text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Nova Tarefa</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Grupo 4: Autenticação */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Conta
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left flex items-center p-3 rounded-lg text-primary hover:bg-primary dark:hover:bg-primary transition-colors duration-200"
                >
                  <MdLogout className="mr-3 text-xl" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-900 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
