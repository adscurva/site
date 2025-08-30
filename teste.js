import { useState } from "react";

const collections = {
    blueDresses: [
        { img: "/images/dresses/azul1.jpg", alt: "Vestido Longo Azul 1" },
        { img: "/images/dresses/azul2.jpg", alt: "Vestido Longo Azul 2" },
        { img: "/images/dresses/azul3.jpg", alt: "Vestido Longo Azul 3" },
    ],
    blackDresses: [
        { img: "/images/dresses/preto1.jpg", alt: "Vestido Longo Preto 1" },
        { img: "/images/dresses/preto2.jpg", alt: "Vestido Longo Preto 2" },
        { img: "/images/dresses/preto3.jpg", alt: "Vestido Longo Preto 3" },
    ],
    pinkDresses: [
        { img: "/images/dresses/rosa1.jpg", alt: "Vestido Longo Rosa 1" },
        { img: "/images/dresses/rosa2.jpg", alt: "Vestido Longo Rosa 2" },
        { img: "/images/dresses/rosa3.jpg", alt: "Vestido Longo Rosa 3" },
        { img: "/images/dresses/rosa4.jpg", alt: "Vestido Longo Rosa 4" },
        { img: "/images/dresses/rosa5.jpg", alt: "Vestido Longo Rosa 5" },
        { img: "/images/dresses/rosa6.jpg", alt: "Vestido Longo Rosa 6" },
        { img: "/images/dresses/rosa7.jpg", alt: "Vestido Longo Rosa 7" },
        { img: "/images/dresses/rosa8.jpg", alt: "Vestido Longo Rosa 8" },
        { img: "/images/dresses/rosa9.jpg", alt: "Vestido Longo Rosa 9" },
        { img: "/images/dresses/rosa10.jpg", alt: "Vestido Longo Rosa 10" }
    ],
    greenDresses: [
        { img: "/images/dresses/verde1.jpg", alt: "Vestido Longo Verde 1" },
        { img: "/images/dresses/verde2.jpg", alt: "Vestido Longo Verde 2" },
        { img: "/images/dresses/verde3.jpg", alt: "Vestido Longo Verde 3" },
        { img: "/images/dresses/verde4.jpg", alt: "Vestido Longo Verde 4" },
        { img: "/images/dresses/verde5.jpg", alt: "Vestido Longo Verde 5" }
    ],
    redDresses: [
        { img: "/images/dresses/vermelho1.jpg", alt: "Vestido Longo Vermelho 1" },
        { img: "/images/dresses/vermelho2.jpg", alt: "Vestido Longo Vermelho 2" },
        { img: "/images/dresses/vermelho3.jpg", alt: "Vestido Longo Vermelho 3" },
        { img: "/images/dresses/vermelho4.jpg", alt: "Vestido Longo Vermelho 4" },
        { img: "/images/dresses/vermelho5.jpg", alt: "Vestido Longo Vermelho 5" }
    ],
    clutches: [
        { img: "/images/clutches/amarelo1.jpg", alt: "Vestido Longo Azul" },
        { img: "/images/clutches/azul1.jpg", alt: "Vestido Longo Azul" },
        { img: "/images/clutches/dourado1.jpg", alt: "Vestido Longo Azul" },
        { img: "/images/clutches/marmore1.jpg", alt: "Vestido Longo Azul" },
        { img: "/images/clutches/rosa1.jpg", alt: "Vestido Longo Azul" },
        { img: "/images/clutches/verde1.jpg", alt: "Vestido Longo Azul" },
    ],
    midisBrancos: [
        { img: "/images/midis-brancos/01.jpg", alt: "Midis Brancos" },
        { img: "/images/midis-brancos/02.jpg", alt: "Midis Brancos" },
        { img: "/images/midis-brancos/03.jpg", alt: "Midis Brancos" },
    ],
    articles: [
        { img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Verde" },
        { img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Rosa" },
        { img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Azul" },
        { img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Vermelho" },
        { img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Lilás" },
        { img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Branco" },
        { img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Preto" },
        { img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80", alt: "Vestido Longo Dourado" },
    ],
};

function useGalleryNavigation(length) {
    const [index, setIndex] = useState(0);

    const prev = () => setIndex((i) => (i === 0 ? length - 1 : i - 1));
    const next = () => setIndex((i) => (i === length - 1 ? 0 : i + 1));

    const getVisibleItems = (items) => {
        const prevIdx = index === 0 ? items.length - 1 : index - 1;
        const nextIdx = index === items.length - 1 ? 0 : index + 1;
        return [items[prevIdx], items[index], items[nextIdx]];
    };

    return { index, setIndex, prev, next, getVisibleItems };
}

export default function DressesGallery() {
    const [showModal, setShowModal] = useState(false);
    const [modalIdx, setModalIdx] = useState(0);
    const [modalType, setModalType] = useState(null);

    const galleries = Object.keys(collections).reduce((acc, key) => {
        acc[key] = useGalleryNavigation(collections[key].length);
        return acc;
    }, {});

    const handleModalNav = (dir) => {
        if (!modalType) return;
        const items = collections[modalType];
        setModalIdx((idx) =>
            dir === "prev"
                ? idx === 0 ? items.length - 1 : idx - 1
                : idx === items.length - 1 ? 0 : idx + 1
        );
    };

    const GallerySection = ({ title, description, name }) => {
        const gallery = galleries[name];
        const items = collections[name];
        const visibleItems = gallery.getVisibleItems(items);

        return (
            <section className="my-16">
                <h2 className="text-2xl font-bold">{title}</h2>
                <p>{description}</p>

                <div className="relative flex items-center justify-center">
                    <div className="flex gap-4">
                        {visibleItems.map((item, idx) => (
                            <div key={idx} className="relative w-80 h-100 rounded-xl overflow-hidden shadow-lg">
                                <img src={item.img} alt={item.alt} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => {
                                        setShowModal(true);
                                        setModalIdx((gallery.index + idx - 1 + items.length) % items.length);
                                        setModalType(name);
                                    }}
                                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                                >
                                    🔍
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={gallery.prev} className="absolute left-0">←</button>
                    <button onClick={gallery.next} className="absolute right-0">→</button>
                </div>
            </section>
        );
    };

    const modalItems = modalType ? collections[modalType] : [];
    const modalImg = modalItems[modalIdx]?.img;
    const modalAlt = modalItems[modalIdx]?.alt;

    return (
        <div>
            <GallerySection
                name="blueDresses"
                title="Vestidos Azuis"
                description="Tons que transmitem elegância e serenidade"
            />

            {showModal && modalType && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
                    onClick={() => {
                        setShowModal(false);
                        setModalType(null);
                    }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(false);
                            setModalType(null);
                        }}
                        className="absolute top-8 right-8 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
                    >
                        ✕
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModalNav("prev");
                        }}
                        className="absolute bottom-8 right-[51%] bg-white/80 rounded-full p-2"
                    >
                        ←
                    </button>

                    <img
                        src={modalImg}
                        alt={modalAlt}
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModalNav("next");
                        }}
                        className="absolute bottom-8 left-[51%] bg-white/80 rounded-full p-2"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}
