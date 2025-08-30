export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
        <p className="mt-4 text-sm text-gray-600">
          Um link de login foi enviado para o seu endereço de e-mail. Por favor, verifique sua caixa de entrada e spam.
        </p>
      </div>
    </div>
  );
}