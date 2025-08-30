// src/components/DressesGallery.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import ModalPhotos from "./ModalPhotos";
import CollectionGallerySection from "./CollectionGallerySection";
// Certifique-se de que as tipagens estão importadas corretamente
import { ColecaoProps, ColecaoItem } from "../types";
import FloatingButtons from "./FloatingButtons";

interface DressesGalleryProps {
    colecoes: ColecaoProps[];
}

export default function DressesGallery({ colecoes }: DressesGalleryProps) {
    const [modalType, setModalType] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalIdx, setModalIdx] = useState(0);

    const router = useRouter();
    const { collectionSlug, itemSlug } = router.query;

    const openModal = useCallback((collectionSlug: string, itemSlug: string) => {
        if (collectionSlug && itemSlug) {
            router.push({
                pathname: router.pathname,
                query: { collectionSlug, itemSlug }
            }, undefined, { shallow: true, scroll: false });
        } else {
            console.error("Erro: slugs da coleção ou do item são nulos/undefined. Verifique seus dados.");
        }
    }, [router]);

    const closeModal = useCallback(() => {
        setModalType(null);
        setModalIdx(0);
        setShowModal(false);
        router.replace(router.pathname, undefined, { shallow: true, scroll: false });
    }, [router]);

    useEffect(() => {
        if (router.isReady && colecoes.length > 0) {
            if (typeof collectionSlug === "string" && typeof itemSlug === "string") {
                const col = colecoes.find(c => c.slug === collectionSlug);
                const idx = col?.items.findIndex(item => item.slug === itemSlug);

                if (col && idx !== -1 && idx !== undefined) {
                    setModalType(col.slug);
                    setModalIdx(idx);
                    setShowModal(true);
                } else if (showModal) {
                    closeModal();
                }
            } else if (showModal) {
                closeModal();
            }
        }
    }, [router.isReady, collectionSlug, itemSlug, colecoes, showModal, closeModal]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [closeModal]);

    if (!colecoes || colecoes.length === 0) {
        return <p className="text-center py-8">Falha ao carregar a galeria.</p>;
    }

    return (
        <>
            <div id="colecao" className='my-16'>&nbsp;</div>
            <section>
                <div className="text-center md:max-w-7xl mx-auto mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                        Conheça nossa Coleção
                    </h2>
                    <p className="border-t-2 border-primary text-primary px-4 pt-6 w-fit m-auto">
                        <strong>
                            Vestidos modernos, elegantes, acessíveis e sempre atualizados com as últimas tendências.
                        </strong>
                    </p>
                </div>
                <FloatingButtons colecoes={colecoes} />

                {colecoes.map((colecao: ColecaoProps) => (
                    <div key={colecao.slug} id={colecao.slug}>
                        <CollectionGallerySection
                            collection={colecao}
                            openModal={openModal}
                        />
                    </div>
                ))}

                {showModal && modalType && (
                    <ModalPhotos
                        colecoes={colecoes}
                        modalType={modalType}
                        setModalIdx={setModalIdx}
                        setShowModal={setShowModal}
                        modalIdx={modalIdx}
                        onClose={closeModal}
                    />
                )}
            </section>
        </>
    );
}