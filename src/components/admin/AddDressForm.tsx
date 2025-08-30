import { useState, FormEvent } from 'react';

export default function AddDressForm() {
  const [file, setFile] = useState<File | null>(null);
  const [productMark, setProductMark] = useState('');
  const [productModel, setProductModel] = useState('');
  const [cor, setCor] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, selecione uma imagem.');
      return;
    }

    setLoading(true);
    setMessage('Enviando...');

    try {
      // Passo 1: Upload da imagem para o Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Erro desconhecido no upload.');
      }

      const imgUrl = uploadData.url;

      // Passo 2: Enviar os dados do vestido para o endpoint de criação
      const dressResponse = await fetch('/api/dresses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ img: imgUrl, productMark, productModel, cor }),
      });

      if (!dressResponse.ok) {
        const dressErrorData = await dressResponse.json();
        throw new Error(dressErrorData.message || 'Erro desconhecido ao adicionar vestido.');
      }

      setMessage('Vestido adicionado com sucesso!');
      setFile(null);
      setProductMark('');
      setProductModel('');
      setCor('');

    } catch (error: any) {
      console.error(error);
      setMessage(`Ocorreu um erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Adicionar Novo Vestido</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">Imagem</label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            required
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary file:text-primary
                       hover:file:bg-primary"
          />
        </div>
        <div>
          <label htmlFor="productMark" className="block text-sm font-medium text-gray-700">Marca/Material</label>
          <input
            type="text"
            id="productMark"
            value={productMark}
            onChange={(e) => setProductMark(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="productModel" className="block text-sm font-medium text-gray-700">Modelo</label>
          <input
            type="text"
            id="productModel"
            value={productModel}
            onChange={(e) => setProductModel(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="cor" className="block text-sm font-medium text-gray-700">Cor (Nome da Coleção)</label>
          <input
            type="text"
            id="cor"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Adicionando...' : 'Adicionar Vestido'}
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center text-sm font-medium">{message}</p>}
    </div>
  );
}