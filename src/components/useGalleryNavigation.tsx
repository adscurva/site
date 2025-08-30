import { useState } from "react";

export function useGalleryNavigation<T>(length: number) {
    const [index, setIndex] = useState<number>(0);

    const prev = () => setIndex((i) => (i === 0 ? length - 1 : i - 1));
    const next = () => setIndex((i) => (i === length - 1 ? 0 : i + 1));

    const getVisibleItems = (items: T[]): T[] => {
        const prevIdx = index === 0 ? items.length - 1 : index - 1;
        const nextIdx = index === items.length - 1 ? 0 : index + 1;
        return [items[prevIdx], items[index], items[nextIdx]];
    };

    return { index, setIndex, prev, next, getVisibleItems };
}
