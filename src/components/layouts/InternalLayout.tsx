import Head from 'next/head';
import { ReactNode } from 'react';
import { Menu as MenuComponent } from 'components/Menu';
import Footer from './Footer';

// Define as propriedades que o layout irá receber
interface InternalLayoutProps {
  children: ReactNode;
  title: string;
  // O menu precisa de dados. O ideal é que a página que usa este layout
  // busque esses dados e os passe como prop.
  menuData?: any; 
}

const InternalLayout = ({ children, title, menuData }: InternalLayoutProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      
      {/* O componente de menu precisa receber os dados do menu */}
      <MenuComponent menuData={menuData || []} />

      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      <Footer />
    </>
  );
};

export default InternalLayout;