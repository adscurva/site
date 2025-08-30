import React from 'react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          {/* Informações de contato */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">My Dress Belém</h3>
            <p className="text-sm text-gray-400">
              Passagem Tapajós 6, Tv. da Estrela, 46, Marco
              <br />
              Belém - PA, 66093-065
            </p>
          </div>

          {/* Links e redes sociais */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="https://www.instagram.com/mydressbelem/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="h-6 w-6 text-gray-400 hover:text-white transition-colors" />
            </a>
            <a href="https://wa.me/5591985810208" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp className="h-6 w-6 text-gray-400 hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Direitos autorais */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {currentYear} My Dress Belém. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;