import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies (pode usar localStorage)
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
    if (!hasAcceptedCookies) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  const handleDeclineCookies = () => {
    // Lógica para recusar cookies (opcional, dependendo da sua política)
    // Geralmente, apenas informar e permitir fechar é suficiente se não houver recusa funcional.
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 text-white z-50">
      <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        <div className="text-sm">
          Nós utilizamos cookies para melhorar sua experiência em nosso site. Ao continuar, você concorda com a nossa <a href="/politica-de-cookies" className="text-ORANGE-500 hover:underline">Política de Cookies</a>.
        </div>
        <div className="space-x-2">
          <button
            onClick={handleDeclineCookies}
            className="bg-transparent border border-gray-500 text-gray-400 hover:text-white hover:border-white py-2 px-4 rounded-md text-sm focus:outline-none"
          >
            Recusar
          </button>
          <button
            onClick={handleAcceptCookies}
            className="bg-primary hover:bg-orange-500 text-white py-2 px-4 rounded-md text-sm focus:outline-none"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;