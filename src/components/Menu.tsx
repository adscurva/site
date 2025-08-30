import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LinkItem } from '../types/index';
import { MdMenu, MdClose, MdAccountCircle } from 'react-icons/md'; // Importa ícones de menu, fechar e conta

// A interface MenuProps está definida aqui, como é a única a usá-la
interface MenuProps {
  menuData: {
    logoUrl: string;
    links: LinkItem[];
  } | null;
}

export function Menu({ menuData }: MenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession(); // Inclua o status para saber se a sessão está carregando
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Mudei para 50px para um efeito mais rápido
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!menuData) {
    return null;
  }

  const { logoUrl, links } = menuData;

  // Lógica para o botão de autenticação
  const authButton = status === 'loading' ? (
    <span className="text-gray-400">Carregando...</span>
  ) : session ? (
    <Link
      href="/admin"
      className="relative text-gray-100 hover:text-orange-500 transition-colors duration-300 group flex items-center gap-1"
      onClick={() => setMenuOpen(false)}
    >
      <MdAccountCircle className="w-5 h-5" /> Minha Conta
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  ) : (
    <button
      onClick={handleSignIn}
      className="relative text-gray-100 hover:text-orange-500 transition-colors duration-300 group flex items-center gap-1 bg-orange-500 px-3 py-1 rounded-md hover:bg-orange-600"
    >
      Entrar
    </button>
  );

  const authButtonMobile = status === 'loading' ? (
    <li className="block py-2 text-gray-400 border-b border-gray-700">Carregando...</li>
  ) : session ? (
    <li>
      <Link
        href="/admin"
        className="block py-2 hover:text-orange-500 transition-colors border-b border-gray-700 flex items-center gap-2"
        onClick={() => setMenuOpen(false)}
      >
        <MdAccountCircle className="w-5 h-5" /> Minha Conta
      </Link>
    </li>
  ) : (
    <li>
      <button
        onClick={() => { handleSignIn(); setMenuOpen(false); }}
        className="w-full text-left py-2 hover:text-orange-500 transition-colors border-b border-gray-700 flex items-center gap-2 bg-orange-500 px-3 rounded-md hover:bg-orange-600 text-white"
      >
        Entrar
      </button>
    </li>
  );


  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/95 backdrop-blur-sm py-3 shadow-lg" // Fundo mais escuro e sólido, py um pouco menor
          : "bg-gray-900/10 backdrop-blur-sm py-4" // Fundo mais transparente, sem shadow no topo
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8">
        <Link href="/">
          <img
            src={logoUrl || "/images/logo.png"}
            alt="Logomarca Curva Engenharia"
            className={`transition-all duration-300 h-auto ${
              isScrolled ? "w-28 md:w-36" : "w-36 md:w-44" // Ajusta tamanhos para um logo mais compacto ao rolar
            }`}
          />
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex gap-8 font-semibold items-center"> {/* Adicionado items-center para alinhar o botão */}
          {links.map(({ text, url, target }) => (
            <Link
              key={url}
              href={url}
              className="relative text-gray-100 hover:text-orange-500 transition-colors duration-300 group"
              onClick={() => setMenuOpen(false)}
              target={target}
            >
              {text}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          {authButton} {/* Botão de autenticação para desktop */}
        </nav>

        {/* Botão Hamburger para Mobile */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-md bg-gray-800/70 text-orange-500 hover:bg-gray-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            <MdClose className="w-6 h-6" />
          ) : (
            <MdMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Overlay para mobile quando o menu está aberto */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Menu Mobile */}
      <nav
        id="mobile-menu"
        className={`fixed inset-y-0 right-0 w-64 bg-gray-900 z-40 md:hidden flex flex-col p-6 shadow-xl transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-md text-gray-100 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Fechar menu"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>
        <ul className="flex flex-col gap-4 font-semibold text-gray-100">
          {links.map(({ text, url, target }) => (
            <li key={url}>
              <Link
                href={url}
                className="block py-2 hover:text-orange-500 transition-colors border-b border-gray-700 last:border-b-0"
                onClick={() => setMenuOpen(false)}
                target={target}
              >
                {text}
              </Link>
            </li>
          ))}
          {authButtonMobile} {/* Botão de autenticação para mobile */}
        </ul>
      </nav>
    </header>
  );
}
