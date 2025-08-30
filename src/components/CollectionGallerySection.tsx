import React, { useCallback, useRef, useState, useEffect } from "react";
import { GallerySection } from "./GallerySection";
// O useGalleryNavigation não é mais necessário aqui, pois a lógica de navegação
// de rolagem será transferida para o GallerySection.
// import { useGalleryNavigation } from "./useGalleryNavigation"; 
// A importação abaixo está correta, não precisa ser alterada.
import { ColecaoProps } from "types";

// Interface corrigida para usar ColecaoProps
interface CollectionGallerySectionProps {
    collection: ColecaoProps;
    openModal: (collectionSlug: string, itemSlug: string) => void;
}

function CollectionGallerySection({ collection, openModal }: CollectionGallerySectionProps) {
    if (!collection || collection.items.length === 0) {
        return null;
    }

    const handleOpenModal = useCallback(
        (collectionSlug: string, itemSlug: string) => {
            openModal(collectionSlug, itemSlug);
        },
        [openModal]
    );

    return (
        <GallerySection
            key={collection.slug}
            collection={collection}
            buttonHref={collection.buttonUrl || `https://wa.me/5591985810208?text=Olá! Gostaria do Catálogo de ${collection.title}.`}
            onOpenModal={handleOpenModal}
        />
    );
}

export default React.memo(CollectionGallerySection);