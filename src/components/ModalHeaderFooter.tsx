// ModalHeaderFooter.tsx
import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaShareAlt, FaHeart } from "react-icons/fa";

interface ModalHeaderFooterProps {
    productMark: string | null | undefined;
    productModel: string | null | undefined;
    size: string | null | undefined;
    shareUrl: string;
    likes: number | null | undefined;
    views: number | null | undefined;
    onLike: () => void;
}

export const ModalHeaderFooter = ({
    productMark,
    productModel,
    size,
    shareUrl,
    likes,
    views,
    onLike,
}: ModalHeaderFooterProps) => {
    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'share' in navigator) {
            setCanShare(true);
        }
    }, []);

    const handleShare = async () => {
        if (isSharing || !canShare) return;

        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Vestido ${productModel || ''}`,
                    text: `Confira este modelo incrível: ${productModel || ''} - ${productMark || ''}!`,
                    url: shareUrl,
                });
            } else {
                alert("O compartilhamento não é suportado neste navegador.");
            }
        } catch (error) {
            console.error('Falha ao compartilhar:', error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="w-full flex-shrink-0 flex items-start justify-between bg-primary gap-4 text-white p-4 z-30">
            <div className="flex flex-col text-left">
                <h3 className="font-semibold text-lg">Tecido: {productMark || 'Sem Marca'}</h3>
                <p className="text-sm mt-1">Modelo: {productModel || 'Sem Modelo'}</p>
                {size && <p className="text-sm">Tamanho: {size}</p>}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onLike}
                    className="inline-flex items-center justify-center bg-primary hover:bg-primary text-white rounded-full shadow-lg p-3 font-semibold text-sm transition-colors duration-300"
                    aria-label="Curtir"
                >
                    <FaHeart className="w-6 h-6 text-white" />
                    {likes !== null && likes !== undefined && likes > 0 && <span className="ml-1">{likes}</span>}
                </button>

                <a
                    href={`https://wa.me/5591985810208?text=Olá! Gostaria de reservar o modelo ${encodeURIComponent(productModel || '')} - ${encodeURIComponent(productMark || '')}. Link para a foto: ${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-primary hover:bg-primary text-white rounded-full shadow-lg p-3 font-bold text-sm transition-colors duration-300"
                    aria-label="Reservar via WhatsApp"
                >
                    <FaWhatsapp className="w-6 h-6 text-white" />
                </a>

                {canShare && (
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center justify-center bg-primary hover:bg-primary text-white rounded-full shadow-lg p-3 font-semibold text-sm transition-colors duration-300"
                        aria-label="Compartilhar"
                        disabled={isSharing}
                    >
                        <FaShareAlt className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>
        </div>
    );
};