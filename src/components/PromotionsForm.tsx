import React, { useState, ChangeEvent, useEffect } from 'react';
import { formatPhoneNumber } from 'utils/formatPhoneNumber';

const PromotionsForm: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState(''); // 'success', 'error', 'submitting'

    // Checa localStorage ao montar o componente
    useEffect(() => {
        const modalShown = localStorage.getItem('modalShown');
        if (modalShown) {
            setShowModal(false);
            return; // Não adiciona listener nem abre o modal
        }

        const handleMouseOut = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                setShowModal(true);
                localStorage.setItem('modalShown', 'true');
                document.removeEventListener('mouseout', handleMouseOut);
            }
        };

        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/promotions-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setName('');
                setEmail('');
                setPhone('');
            } else {
                setStatus('error');
                console.error('Erro na resposta da API:', data.message);
            }
        } catch (error) {
            setStatus('error');
            console.error('Erro ao submeter o formulário:', error);
        }
    };

    // Não renderiza modal se showModal for false
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 transition-opacity duration-300 opacity-100">
            <div id="fique-por-dentro" className="m-4 relative p-8 max-w-lg bg-primary rounded-lg shadow-xl text-white">
                <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 text-white text-2xl font-bold leading-none hover:text-gray-300"
                    aria-label="Close"
                >
                    &times;
                </button>
                <div className="text-center">
                    <h3 className="text-white text-2xl md:text-3xl font-bold mb-6">
                        Receba Nossas Novidades
                    </h3>
                    <p className="text-white text-lg mb-8">
                        Cadastre-se para receber conteúdos exclusivos sobre projetos, tendências em engenharia e arquitetura, e cases de sucesso da Curva.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-4">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu Nome"
                            required
                            className="w-full px-4 py-3 border border-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900 placeholder-gray-500"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Seu Melhor E-mail"
                            required
                            className="w-full px-4 py-3 border border-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900 placeholder-gray-500"
                        />
                        <input
                            type="text"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Seu WhatsApp (Opcional)"
                            className="w-full px-4 py-3 border border-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900 placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="mt-4 w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? 'Cadastrando...' : 'Cadastrar na Newsletter'}
                        </button>
                    </form>
                    {status === 'success' && (
                        <p className="mt-4 text-white font-medium">
                            Cadastro realizado com sucesso! Em breve você receberá nossas novidades.
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="mt-4 text-white font-medium">
                            Ocorreu um erro no cadastro. Por favor, tente novamente.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromotionsForm;
