// src/components/RegistrationForm.tsx

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const RegistrationForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // 'success', 'error', 'submitting'
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        
        try {
            // Chama a função de login do NextAuth para o EmailProvider
            const result = await signIn('email', { 
                email, 
                redirect: false, // Evita o redirecionamento automático
            });

            if (result?.error) {
                setStatus('error');
                console.error('Erro no login/cadastro:', result.error);
            } else {
                setStatus('success');
                // Redireciona para a página de verificação de email
                router.push('/auth/verify-request');
            }
        } catch (error) {
            setStatus('error');
            console.error('Erro ao submeter o formulário:', error);
        }
    };

    return (
        <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-playfair-display text-gray-900 sm:text-4xl mb-4">
                    Área Exclusiva para Lojistas
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                    Se você é uma lojista parceira, acesse nosso catálogo completo e gerencie seus produtos. Insira seu e-mail para receber o link de acesso.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Seu e-mail profissional"
                        required
                        className="w-full sm:w-2/3 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-A9876D-500"
                    />
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full sm:w-auto px-6 py-3 bg-A9876D hover:bg-A9876D-dark text-white font-semibold rounded-md transition-colors duration-200"
                    >
                        {status === 'submitting' ? 'Enviando...' : 'Acessar'}
                    </button>
                </form>
                {status === 'success' && (
                    <p className="mt-4 text-primary font-medium">
                        Link de acesso enviado para o seu e-mail. Por favor, verifique sua caixa de entrada.
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-4 text-primary font-medium">
                        Ocorreu um erro. Por favor, tente novamente mais tarde.
                    </p>
                )}
            </div>
        </div>
    );
};

export default RegistrationForm;