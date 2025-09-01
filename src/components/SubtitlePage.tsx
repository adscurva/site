import React, { ReactNode } from "react";

interface Props {
    style?: String;
    text: String;
}

export default function SubtitlePage({ style, text }: Props) {
    return (
        <div className={`bg-gray-50 w-full text-center mx-auto py-16 ${style}`}>
            <h2 className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed">
                {text}
            </h2>
        </div>
    );
}
