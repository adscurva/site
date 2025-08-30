import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";
import PromotionsForm from "./PromotionsForm";

interface LinkItem {
    id: string;
    text: string;
    url: string;
    target?: string;
}

interface MenuProps {
    menuData: {
        logoUrl: string;
        links: LinkItem[];
    } | null;
}

const Footer = ({ menuData }: MenuProps) => {
    // Garantir que menuData não é nulo antes de desestruturar
    const logoUrl = menuData?.logoUrl;
    const links = menuData?.links || [];

    return (
        <footer className="bg-gray-800 text-gray-300 py-12 md:py-16 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Coluna 1: Logo e Slogan */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link href="/" className="mb-4">
                            <Image
                                src={logoUrl || "/images/logo.png"}
                                alt="Curva Engenharia e Arquitetura"
                                width={150}
                                height={50}
                            />
                        </Link>
                        <p className="text-sm text-white">
                            Construindo o futuro com engenharia, arquitetura e paixão.
                        </p>
                    </div>

                    {/* Coluna 2: Links de Navegação */}
                    <div className="flex flex-col">
                        <h4 className="font-bold text-white text-lg mb-4 text-center md:text-left">Navegue</h4>
                        <ul className="space-y-2 text-center md:text-left list-none">
                            {links.map((link: LinkItem) => (
                                <li>
                                    <Link
                                        key={link.url}
                                        href={link.url}
                                        className="text-primary-light hover:text-accent transition-colors"
                                        target={link.target}
                                    >
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Coluna 3: Contato e Mídias Sociais */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="font-bold text-white text-lg mb-4">Contato</h4>
                        <div className="space-y-2">
                            <p>
                                <a href="tel:+5591985810208" className="hover:text-orange-500 transition-colors">
                                    +55 (91) 98581-0208
                                </a>
                            </p>
                            <p>
                                <a href="mailto:contato@curvaengenharia.com.br" className="hover:text-orange-500 transition-colors">
                                    contato@curvaengenharia.com.br
                                </a>
                            </p>
                            <address className="not-italic">
                                Passagem Tapajós, 46 - Marco, Belém - PA
                            </address>
                        </div>
                        <h4 className="font-bold text-white text-lg mt-6 mb-2">Siga-nos</h4>
                        <div className="flex space-x-4">
                            <a href="https://wa.me//5591982016888?text=Gostaria de solicitar um orçamento." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-2xl hover:text-green-500 transition-colors">
                                <FaWhatsapp />
                            </a>
                            <a href="https://www.instagram.com/curvaengenhariaearquitetura" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-2xl hover:text-pink-500 transition-colors">
                                <FaInstagram />
                            </a>
                            {/* <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-2xl hover:text-blue-500 transition-colors">
                                <FaLinkedin />
                            </a> */}
                        </div>
                    </div>

                    {/* Coluna 4: Mapa de Localização */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <h4 className="font-bold text-white text-lg mb-4 text-center md:text-left">Localização</h4>
                        <div className="w-full h-48 rounded-lg overflow-hidden shadow-lg">
                            <iframe
                                title="Curva Engenharia e Arquitetura"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.524428735484!2d-48.484449999999995!3d-1.4592233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92a48f5a32883995%3A0x2e74e5082cec22bd!2sCurva%20Engenharia%20%26%20Arquitetura!5e0!3m2!1spt-PT!2sbr!4v1756190533689!5m2!1spt-PT!2sbr"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>

                {/* Direitos Autorais e Créditos */}
                <div className="text-center md:text-left border-t border-gray-700 mt-8 pt-6">
                    <p className="text-sm text-white">
                        © 2025 Curva Engenharia e Arquitetura. Todos os direitos reservados.
                    </p>
                </div>
            </div>
            <PromotionsForm />
        </footer>
    );
};

export default Footer;