// src/components/Menu.tsx

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
// Removido a importação de MenuProps para evitar conflito de tipos
import { LinkItem } from '../types/index'; 

// A interface MenuProps está definida aqui, como é a única a usá-la
interface MenuProps {
  menuData: {
    logoUrl: string;
    links: LinkItem[];
  } | null;
}

export function MenuInterno({ menuData }: MenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!menuData) {
    return null;
  }

  const { logoUrl, links } = menuData;

  return (
    <header
      className={`fixed left-0 w-full z-30 transition-all duration-300 top-0 backdrop-blur-sm py-4 shadow-lg ${isScrolled
          ? "bg-gray-800/90"
          : "bg-gray-800"
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8">
        <Link href="/">
          <img
            src={logoUrl || "/images/logo.png"}
            alt="Logomarca Curva Engenharia"
            className={`transition-all duration-300 h-auto ${isScrolled ? "w-28 md:w-40" : "w-40 md:w-48"
              }`}
          />
        </Link>

        <nav className="hidden md:flex gap-8 font-semibold">
          {links.map(({ text, url, target }) => (
            <Link
              key={url}
              href={url}
              className="text-primary-light hover:text-accent transition-colors"
              onClick={() => setMenuOpen(false)}
              target={target}
            >
              {text}
            </Link>
          ))}
          {/* {session ? (
              <>
                <Link href="/admin" className="hover:transition-colors">Minha conta</Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hover:transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                className="hover:transition-colors"
                onClick={handleSignIn}
              >
                Entrar
              </button>
            )} */}
        </nav>

        <button
          className="md:hidden flex flex-col gap-1.5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={`block h-0.5 w-6 bg-accent transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
          />
          <span
            className={`block h-0.5 w-6 bg-accent transition-opacity ${menuOpen ? "opacity-0" : "opacity-100"
              }`}
          />
          <span
            className={`block h-0.5 w-6 bg-accent transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden py-4 flex flex-col gap-4 font-semibold bg-primary/95 px-4"
        >
          {links.map(({ text, url, target }) => (
            <Link
              key={url}
              href={url}
              className="text-primary-light border-t border-primary transition-colors pt-4"
              onClick={() => setMenuOpen(false)}
              target={target}
            >
              {text}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}