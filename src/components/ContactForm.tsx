import React, { useState, ChangeEvent } from 'react';
import { FaPaperPlane } from 'react-icons/fa'; // Ícone para o botão de envio

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

const ContactForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [serviceOfInterest, setServiceOfInterest] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(''); // 'success', 'error', 'submitting'

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/contact', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone, serviceOfInterest, message }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setName('');
                setEmail('');
                setPhone('');
                setServiceOfInterest('');
                setMessage('');
            } else {
                setStatus('error');
                console.error('Erro na resposta da API:', data.message);
            }
        } catch (error) {
            setStatus('error');
            console.error('Erro ao submeter o formulário:', error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 max-w-full mx-auto"> 
            <div className="text-center mb-8 md:mb-10">
                <p className="text-orange-500 font-bold text-lg mb-2">Solicite um Orçamento</p> 
                <h2 className="text-gray-800 text-3xl md:text-4xl font-extrabold leading-tight"> 
                    Transforme seu Projeto em Realidade
                </h2>
                <p className="text-lg text-gray-700 mt-4 leading-relaxed"> 
                    Compartilhe suas ideias e necessidades. Nossa equipe está pronta para oferecer as melhores soluções em engenharia, arquitetura e design.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grid responsivo */}
                    {/* Input para o Nome */}
                    <div className="md:col-span-1"> {/* Ocupa 1 coluna em desktop */}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu Nome Completo" 
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 placeholder-gray-500" 
                        />
                    </div>
                    {/* Input para o Email */}
                    <div className="md:col-span-1"> {/* Ocupa 1 coluna em desktop */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Seu Melhor E-mail" 
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    {/* Input para o Telefone */}
                    <div className="md:col-span-2"> {/* Ocupa 2 colunas em desktop */}
                        <input
                            type="text"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Seu Telefone/WhatsApp (Opcional)" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 placeholder-gray-500"
                        />
                    </div>
                </div>
                {/* Select e Textarea com cores e estilo consistentes */}
                <select
                    value={serviceOfInterest}
                    onChange={(e) => setServiceOfInterest(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 placeholder-gray-500"
                >
                    <option value="">Selecione um Serviço de Interesse (Opcional)</option>
                    <option value="Construção">Construção</option>
                    <option value="Projetos">Projetos (Arquitetônicos, Engenharia, Interiores)</option>
                    <option value="Reformas e Manutenção">Reformas e Manutenção</option>
                    <option value="Consultoria e Gestão">Consultoria e Gestão</option>
                    <option value="Outro">Outro</option>
                </select>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva seu projeto ou sua necessidade em detalhes..." 
                    rows={6} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 placeholder-gray-500"
                ></textarea>
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1" 
                >
                    {status === 'submitting' ? 'Enviando...' : 'Enviar Mensagem'}
                    <FaPaperPlane className="ml-2" />
                </button>
                {status === 'success' && (
                    <p className="mt-4 text-green-600 font-medium text-center text-lg">
                        Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-4 text-red-600 font-medium text-center text-lg">
                        Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.
                    </p>
                )}
            </form>
        </div>
    );
};

export default ContactForm;
