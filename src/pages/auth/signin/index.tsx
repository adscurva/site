"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("email", {
      email,
      redirect: false, // Evita redirecionamento automático
      callbackUrl: '/', // Redireciona para a home após o login bem-sucedido
    });

    setLoading(false);

    if (result?.error) {
      console.error(result.error);
      alert("Ocorreu um erro. Por favor, tente novamente.");
    } else {
      setSuccess(true);
      // O NextAuth.js irá redirecionar para a página de verificação de e-mail
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Entrar</h1>
        <p className="text-center text-sm text-gray-600">
          {success
            ? "Verifique seu e-mail para o link de login."
            : "Insira seu e-mail para receber um link de login."}
        </p>

        {!success && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar link de login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}