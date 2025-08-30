import React from "react";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";
import { MdPhone, MdEmail, MdLocationOn } from 'react-icons/md'; // Novos ícones de Material Design

const ContactSection: React.FC = () => {
    return (
        <div className="max-w-full mx-auto"> {/* Removido o grid aqui para aplicar no container externo da página */}
            {/* Título da seção de contato */}
            <div className="text-center md:text-left mb-8 md:mb-10">
                <h2 className="text-gray-800 text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                    Nossos Contatos Diretos
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-lg md:max-w-full mx-auto md:mx-0">
                    Estamos sempre disponíveis para conversar sobre o seu próximo projeto. Escolha a forma de contato que melhor se adapta a você.
                </p>
            </div>

            {/* Grid para os cards de contato e mapa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Ajustado para 2 colunas em md, e o mapa ocupará 2 */}
                {/* Informações de Contato */}
                <div className="flex flex-1 flex-col items-center p-8 bg-gray-800 rounded-xl shadow-xl text-white">
                    <h4 className="font-bold text-white text-2xl mb-6">Fale Conosco</h4>
                    <div className="space-y-5 text-gray-200">
                        <p className="flex flex-col items-center justify-center space-x-3 text-xl">
                            <MdPhone className="text-orange-500 text-3xl" />
                            <a href="tel:+5591982016888" className="font-semibold hover:text-orange-500 transition-colors">
                                +55 (91) 98201-6888
                            </a>
                        </p>
                        <p className="flex flex-col items-center justify-center space-x-3 text-xl overflow-hidden">
                            <MdEmail className="text-orange-500 text-3xl" />
                            <small className="md:text-sm">
                                <a href="mailto:contato@curvaengenharia.com.br" className="font-semibold hover:text-orange-500 transition-colors">
                                    contato@curvaengenharia.com.br
                                </a>
                            </small>
                        </p>
                    </div>
                </div>

                {/* Mídias Sociais */}
                <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-xl text-white">
                    <h4 className="font-bold text-white text-2xl mb-6">Siga-nos</h4>
                    <div className="flex space-x-8 text-gray-200">
                        <a href="https://wa.me//5591982016888?text=Gostaria de solicitar um orçamento." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-4xl hover:text-green-500 transition-colors">
                            <FaWhatsapp />
                        </a>
                        <a href="https://www.instagram.com/curvaengenhariaearquitetura" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-4xl hover:text-pink-500 transition-colors">
                            <FaInstagram />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-4xl hover:text-blue-500 transition-colors">
                            <FaLinkedin />
                        </a>
                    </div>
                </div>

                {/* Endereço e Mapa */}
                <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-xl md:col-span-2"> {/* Ocupa 2 colunas em telas médias */}
                    <h4 className="font-bold text-white text-2xl mb-6">Nossa Localização</h4>
                    <address className="text-orange-500 font-semibold not-italic text-center text-xl mb-6">
                        <MdLocationOn className="inline text-3xl mr-2 align-middle" />
                        Passagem Tapajós, 46 - Marco, Belém - PA
                    </address>
                    <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700">
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
        </div>
    );
};

export default ContactSection;
