// src/components/sections/DynamicSection.tsx

import React from "react";
import Link from "next/link";

interface DynamicSectionProps {
  content: {
    title?: string;
    text?: string;
    type?: string;
    style?: { [key: string]: string };
    // Adicione aqui outros campos que você vai usar nas seções
    buttonText?: string;
    buttonUrl?: string;
  };
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({ content }) => {
  const contentType = content.type || "default";

  // Estilos padrão do contêiner
  const defaultStyles = {
    paddingTop: '4rem', // Equivalente a py-16
    paddingBottom: '4rem', // Equivalente a py-16
    textAlign: 'center', // Equivalente a text-center
    width: '100%',
    maxWidth: '1280px', // Equivalente a md:max-w-7xl
    margin: 'auto',
  };

  // Combina os estilos padrão com os estilos personalizados do usuário
  const sectionStyle = {
    ...defaultStyles,
    ...content.style,
  };

  // Define a classe CSS padrão da div de conteúdo
  const defaultClassName = "max-w-xs md:max-w-7xl mx-auto";

  // Renderiza o conteúdo com base no tipo
  switch (contentType) {
    case "inicio":
      return (
        <section className="py-16 md:py-24 bg-gray-50" id="inicio">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold   mb-4">
              {content.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              {content.text}
            </p>
            {content.buttonUrl && content.buttonText && (
              <Link href={content.buttonUrl} legacyBehavior>
                <a className="inline-block bg-primary-500 text-white font-bold py-3 px-8 rounded-full hover:bg-primary-600 transition-colors">
                  {content.buttonText}
                </a>
              </Link>
            )}
          </div>
        </section>
      );
    case "custom":
      return (
        <section className="my-16" style={content.style}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold   mb-4">
              {content.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 whitespace-pre-line">
              {content.text}
            </p>
          </div>
        </section>
      );
    default:
      return null;
  }
};