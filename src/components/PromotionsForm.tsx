import React, { useState, ChangeEvent, useEffect } from 'react';

// Função para aplicar a máscara no número de telefone
const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength <= 2) {
        return phoneNumber;
    }

    if (phoneNumberLength <= 7) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }

    if (phoneNumberLength <= 11) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
    }

    // Retorna o formato completo de 11 dígitos para o Brasil
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

const PromotionsForm: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState(''); // 'success', 'error', 'submitting'

    // UseEffect para adicionar o event listener de "exit intent"
    useEffect(() => {
        const modalShown = localStorage.getItem('modalShown');
        
        // Se o modal já foi exibido, não configuramos o listener e o modal não será mostrado.
        if (modalShown) {
            return;
        }

        const handleMouseOut = (e: MouseEvent) => {
            // Verifica se o cursor está saindo da área superior da janela
            if (e.clientY <= 0) {
                setShowModal(true);
                // Registra a exibição no localStorage para que não apareça novamente
                localStorage.setItem('modalShown', 'true');
                // Remove o event listener após a primeira exibição
                document.removeEventListener('mouseout', handleMouseOut);
            }
        };

        // Adiciona o event listener ao documento para detectar a saída do mouse
        document.addEventListener('mouseout', handleMouseOut);

        // Função de limpeza para remover o listener quando o componente for desmontado
        return () => {
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, []); // O array de dependências vazio garante que o useEffect rode apenas uma vez na montagem

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/promotions-subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    // Renderiza o modal APENAS se showModal for verdadeiro.
    // Isso impede que o div do modal vazio seja renderizado no DOM.
    if (!showModal) {
        return null;
    }

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
