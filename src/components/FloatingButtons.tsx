import React, { useState } from 'react';
import { ColecaoProps } from '../types';
import { FaCompressArrowsAlt, FaExpandArrowsAlt } from 'react-icons/fa';

type FloatingButtonsProps = {
    colecoes: ColecaoProps[];
};

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ colecoes }) => {
    const [showButtons, setShowButtons] = useState(true);

    const toggleButtons = () => {
        setShowButtons(!showButtons);
    };

    return (
        <div className="block sticky top-24 md:top-32 transform -translate-y-1/2 z-20">
            {/* Botão para ocultar/visualizar */}
            <div className={`flex justify-center items-center space-x-2 transition-all duration-300 ease-in-out`}>
                <button
                    onClick={toggleButtons}
                    className="flex items-center justify-center w-8 h-8 bg-white text-gray-500 opacity-80 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
                    aria-label={showButtons ? "Ocultar botões" : "Mostrar botões"}
                >
                    {/* Ícone de menu (três pontos) */}
                    {!showButtons ? <FaExpandArrowsAlt className="w-4 h-4 text-primary" />
                    : <FaCompressArrowsAlt className="w-4 h-4 text-primary" />}
                </button>
                {showButtons && colecoes.map((colecao) => (
                    <a
                        key={colecao.id}
                        href={`#${colecao.slug}`}
                        className={`${showButtons ? 'opacity-100 visible' : 'opacity-0 invisible'} flex items-center ${colecao.bgcolor} justify-center w-8 h-8 rounded-full shadow-lg hover:opacity-80 transition-opacity duration-300`}
                        title={colecao.title}
                    >
                        <span className="font-bold text-sm text-white">{colecao.title.charAt(0)}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default FloatingButtons;