// src/components/ModalPhotos.tsx

import React, { useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { FaHeart } from "react-icons/fa";
import { useRouter } from "next/router";
import Head from "next/head";
import ZoomableImage from "./ZoomableImage";
import { ModalHeaderFooter } from "./ModalHeaderFooter";
import { ColecaoItem, ColecaoProps } from "types";

interface ModalPhotosProps {
    colecoes: ColecaoProps[];
    modalType: string;
    modalIdx: number;
    setModalIdx: (idx: number | ((prevIdx: number) => number)) => void;
    setShowModal: (show: boolean) => void;
    onClose: () => void;
}

export default function ModalPhotos({
    colecoes,
    modalType,
    modalIdx,
    setModalIdx,
    setShowModal,
    onClose
}: ModalPhotosProps) {
    const router = useRouter();
    const [isSharing, setIsSharing] = useState(false);
    const [currentItemStats, setCurrentItemStats] = useState<{ like: number | null | undefined; view: number | null | undefined }>({ like: null, view: null });

    const colecaoAtual = colecoes.find(c => c.slug === modalType);
    const totalItens = colecaoAtual?.items.length || 0;

    const nextItem = () => {
        setModalIdx((prevIdx: number) => (prevIdx + 1) % totalItens);
    };

    const prevItem = () => {
        setModalIdx((prevIdx: number) => (prevIdx - 1 + totalItens) % totalItens);
    };

    const itemAtual = colecaoAtual?.items[modalIdx];

    useEffect(() => {
        const fetchStatsAndHandleView = async (itemId: string) => {
            try {
                const response = await fetch('/api/stats/item-view', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setCurrentItemStats({ like: data.item.like, view: data.item.view });
                    }
                } else {
                    console.error('Falha ao registrar visualização:', response.status);
                }
            } catch (error) {
                console.error('Erro na API de visualização:', error);
            }
        };

        if (itemAtual) {
            setCurrentItemStats({ like: itemAtual.like, view: itemAtual.view });
            fetchStatsAndHandleView(itemAtual.id);
        }
    }, [itemAtual?.id]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleLike = async (itemId: string) => {
        try {
            const response = await fetch('/api/stats/item-like', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCurrentItemStats({ like: data.item.like, view: data.item.view });
                }
            } else {
                console.error('Falha ao curtir item:', response.status);
            }
        } catch (error) {
            console.error('Erro na API de curtida:', error);
        }
    };

    if (!itemAtual) {
        return null;
    }

    const shareUrl = `${window.location.origin}/share/${colecaoAtual?.slug}/${itemAtual.slug}`;

    return (
        <>
            <Head>
                <title>{`Foto ${modalIdx + 1} - ${colecaoAtual?.title}`}</title>
                <meta
                    name="description"
                    content={`Confira este modelo da coleção ${colecaoAtual?.title}.`}
                />
                <meta property="og:title" content={`Foto ${modalIdx + 1} - ${colecaoAtual?.title}`} />
                <meta
                    property="og:description"
                    content={`Confira este modelo da coleção ${colecaoAtual?.title}.`}
                />
                <meta property="og:image" content={itemAtual.img} />
                <meta property="og:url" content={shareUrl} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`Foto ${modalIdx + 1} - ${colecaoAtual?.title}`} />
                <meta
                    name="twitter:description"
                    content={`Confira este modelo da coleção ${colecaoAtual?.title}.`}
                />
                <meta name="twitter:image" content={itemAtual.img} />
            </Head>

            {/* Container do modal: remove o padding no mobile e o aplica em telas maiores */}
            <div
                className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-0 md:p-4"
                onClick={onClose}
            >
                {/* Container do conteúdo: agora ocupa 100% da largura em mobile */}
                <div
                    className="relative w-fit h-full flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Botão de fechar: reduz a margem para ficar mais próximo da borda em mobile */}
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-primary z-50 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                    >
                        <AiOutlineClose size={24} className="text-primary" />
                    </button>

                    {/* Container da imagem: remove a margem vertical para maximizar o espaço */}
                    <div className="flex-grow flex items-center justify-center w-full overflow-hidden">
                        <ZoomableImage
                            src={itemAtual.img}
                            alt={`${itemAtual.productMark} - ${itemAtual.productModel}`}
                        />
                    </div>

                    {/* Controles de navegação (setas): reduz o padding para ficar mais próximo da borda em mobile */}
                    <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 w-full p-2">
                        <button
                            onClick={prevItem}
                            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                        >
                            <SlArrowLeft size={24} className="text-primary" />
                        </button>
                        <button
                            onClick={nextItem}
                            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                        >
                            <SlArrowRight size={24} className="text-primary" />
                        </button>
                    </div>

                    {/* Informações e Botões */}
                    <div className="flex flex-col items-center text-primary text-center w-full">
                        <ModalHeaderFooter
                            productMark={itemAtual.productMark}
                            productModel={itemAtual.productModel}
                            size={itemAtual.size}
                            shareUrl={shareUrl}
                            likes={currentItemStats.like}
                            views={currentItemStats.view}
                            onLike={() => handleLike(itemAtual.id)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}