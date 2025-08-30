// src/components/Breadcrumb.tsx

import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Breadcrumb() {
  const router = useRouter();
  const pathnames = router.asPath.split('/').filter(x => x);

  // Função para formatar o nome do link
  const formatName = (name: string) => {
    // Substitui hifens por espaços e capitaliza a primeira letra de cada palavra
    return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <nav className="max-w-7xl mx-auto mt-20 text-sm font-sans mb-2" aria-label="Breadcrumb">
      <ol className="mx-4 md:mx-8 list-none p-0 inline-flex">
        {/* Link para a Home */}
        <li className="flex items-center">
          <Link href="/">
            <span className="text-gray-500 hover:text-accent">Home</span>
          </Link>
          {pathnames.length > 0 && (
            <span className="text-gray-500 mx-2">/</span>
          )}
        </li>

        {/* Mapeia os caminhos dinamicamente */}
        {pathnames.map((pathname, index) => {
          const href = '/' + pathnames.slice(0, index + 1).join('/');
          const isLast = index === pathnames.length - 1;

          return (
            <li key={href} className="flex items-center">
              {isLast ? (
                <span className="text-gray-700 font-medium">{formatName(pathname)}</span>
              ) : (
                <Link href={href}>
                  <span className="text-gray-500 hover:text-accent">
                    {formatName(pathname)}
                  </span>
                </Link>
              )}
              {!isLast && (
                <span className="text-gray-500 mx-2">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}