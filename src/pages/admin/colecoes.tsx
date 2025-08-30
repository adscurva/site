import { useState, useEffect } from "react";
import Head from "next/head";
import { MdAddPhotoAlternate, MdDelete, MdEdit } from 'react-icons/md';
import AdminLayout from "components/admin/AdminLayout";

// Definições de tipo
interface ColecaoItem {
  id?: string;
  productMark: string;
  productModel: string;
  cor: string;
  img: string | File;
  slug?: string;
  // Campos do banco de dados (também estão no `types/index.ts` e `schema.prisma`)
  size?: string | null;
  price?: number | null;
  price_card?: number | null;
  like?: number | null;
  view?: number | null;
  // Campo de relacionamento adicionado para correção do erro de compilação anterior
  colecaoId?: string;
}

interface Colecao {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  bgcolor: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  order: number;
  items: ColecaoItem[];
}

interface FormState {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  bgcolor: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  items: ColecaoItem[];
}

export default function AdminColecoes() {
  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [form, setForm] = useState<FormState>({
    title: "",
    subtitle: "",
    description: "",
    bgcolor: "",
    buttonText: "",
    buttonUrl: "",
    order: 0,
    items: [{ 
      productMark: "", 
      productModel: "", 
      cor: "", 
      img: "", 
      size: "", 
      price: 0, 
      price_card: 0 
    }],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchColecoes();
  }, []);

  const fetchColecoes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crud/colecoes", { method: "GET" });
      const data = await res.json();
      if (res.ok && data.success) {
        // Ordena as coleções pelo campo 'order'
        const sortedColecoes = data.colecoes.sort((a: Colecao, b: Colecao) => a.order - b.order);
        setColecoes(sortedColecoes);
      } else {
        setError(data.message || "Erro ao carregar coleções.");
      }
    } catch (e) {
      setError("Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      description: "",
      bgcolor: "",
      buttonText: "",
      buttonUrl: "",
      order: 0,
      items: [{ 
        productMark: "", 
        productModel: "", 
        cor: "", 
        img: "", 
        size: "", 
        price: 0, 
        price_card: 0 
      }],
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "order") {
        setForm({ ...form, [name]: parseInt(value, 10) || 0 });
    } else {
        setForm({ ...form, [name]: value });
    }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value, files } = e.target;
    const newItems = [...form.items];
  
    if (name === "img" && files) {
      newItems[index] = { ...newItems[index], [name]: files[0] };
    } else if (name === "price" || name === "price_card") {
      newItems[index] = { ...newItems[index], [name]: parseFloat(value) || 0 };
    } else {
      newItems[index] = { ...newItems[index], [name]: value };
    }
  
    setForm({ ...form, items: newItems });
  };
  
  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productMark: "", productModel: "", cor: "", img: "", size: "", price: 0, price_card: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleEdit = (colecao: Colecao) => {
    setForm({
      id: colecao.id,
      title: colecao.title,
      subtitle: colecao.subtitle || "",
      description: colecao.description || "",
      bgcolor: colecao.bgcolor || "",
      buttonText: colecao.buttonText || "",
      buttonUrl: colecao.buttonUrl || "",
      order: colecao.order || 0,
      items: colecao.items.map(item => ({
        ...item, 
        img: item.img as string, 
        size: item.size || '', 
        price: item.price || 0, 
        price_card: item.price_card || 0 
      }))
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const itemsWithUrls = await Promise.all(
        form.items.map(async (item) => {
          if (item.img instanceof File) {
            const formData = new FormData();
            formData.append("file", item.img);
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) {
              throw new Error(uploadData.message || "Erro no upload da imagem via API.");
            }
            return { ...item, img: uploadData.url };
          }
          return item;
        })
      );
  
      const method = form.id ? "PUT" : "POST";
      const body = { 
        ...form, 
        // Filtra o campo 'colecaoId' de cada item antes de enviar
        items: itemsWithUrls.map(({ colecaoId, ...rest }) => rest)
      };
      
      const res = await fetch("/api/crud/colecoes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Coleção ${form.id ? 'atualizada' : 'criada'} com sucesso!`);
        resetForm();
        fetchColecoes();
      } else {
        setError(data.message || `Erro ao ${form.id ? 'atualizar' : 'criar'} coleção.`);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao conectar com a API ou no upload da imagem.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string, isItem = false) => {
    if (!confirm(`Tem certeza que deseja excluir ${isItem ? "este item" : "esta coleção"}?`)) return;

    try {
      const res = await fetch("/api/crud/colecoes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isItem }),
      });
      if (res.ok) {
        alert(`${isItem ? "Item" : "Coleção"} excluído com sucesso!`);
        fetchColecoes();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao excluir.");
      }
    } catch (e) {
      setError("Erro ao conectar com a API.");
    }
  };

  return (
    <>
      <Head>
        <title>Admin - Coleções</title>
      </Head>
      <AdminLayout>
        <main className="container mx-auto p-6 lg:p-12 mt-20">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Gerenciar Coleções</h1>
          
          {/* Formulário de Criação/Edição */}
          <section className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">{form.id ? "Editar Coleção" : "Adicionar Nova Coleção"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
              <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
              <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Descrição" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
              <input type="text" name="bgcolor" value={form.bgcolor} onChange={handleFormChange} placeholder="Cor de Fundo (Ex: #F4F1DE)" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
              <input type="text" name="buttonText" value={form.buttonText} onChange={handleFormChange} placeholder="Texto do Botão" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
              <input type="url" name="buttonUrl" value={form.buttonUrl} onChange={handleFormChange} placeholder="URL do Botão" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
              <input type="number" name="order" value={form.order} onChange={handleFormChange} placeholder="Ordem" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
              
              <h3 className="text-xl font-bold mt-6 text-gray-700">Itens da Coleção</h3>
              {form.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-dashed border-gray-300 rounded-lg relative">
                  <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-primary hover:text-primary transition duration-200">
                    <MdDelete size={24} />
                  </button>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="productMark" value={item.productMark} onChange={(e) => handleItemChange(e, index)} placeholder="Marca" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
                    <input type="text" name="productModel" value={item.productModel} onChange={(e) => handleItemChange(e, index)} placeholder="Modelo" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
                    <input type="text" name="cor" value={item.cor} onChange={(e) => handleItemChange(e, index)} placeholder="Cor" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
                    <input type="text" name="size" value={item.size || ''} onChange={(e) => handleItemChange(e, index)} placeholder="Tamanho" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
                    <input type="number" name="price" value={item.price || ''} onChange={(e) => handleItemChange(e, index)} placeholder="Preço" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
                    <input type="number" name="price_card" value={item.price_card || ''} onChange={(e) => handleItemChange(e, index)} placeholder="Preço a prazo" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 text-gray-900" />
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-3">
                    {typeof item.img === 'string' && item.img && (
                      <div className="w-full flex justify-center mb-2">
                        <img src={item.img} alt="Visualização do item" className="w-24 h-24 object-cover rounded-lg" />
                      </div>
                    )}
                    <label htmlFor={`img-${index}`} className="w-full flex-1 text-gray-500 cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition duration-200 p-2 rounded-lg">
                      <MdAddPhotoAlternate size={24} />
                      {item.img instanceof File ? item.img.name : "Escolher arquivo..."}
                    </label>
                    <input 
                      type="file" 
                      name="img" 
                      id={`img-${index}`} 
                      onChange={(e) => handleItemChange(e, index)} 
                      required={!item.img || item.img instanceof File}
                      className="hidden" 
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition duration-200">
                <MdAddPhotoAlternate size={24} /> Adicionar Novo Item
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button type="submit" disabled={loading} className="bg-primary text-white p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-primary transition duration-200 disabled:bg-gray-400">
                  {loading ? (form.id ? "Atualizando..." : "Salvando...") : (form.id ? "Atualizar Coleção" : "Salvar Coleção")}
                </button>
                {form.id && (
                  <button type="button" onClick={resetForm} className="bg-primary text-white p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-primary transition duration-200">
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>
            {error && <p className="text-primary mt-4 font-medium">{error}</p>}
          </section>

          {/* Lista de Coleções */}
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Coleções Existentes</h2>
            {loading ? (
              <p className="text-gray-600">Carregando...</p>
            ) : colecoes.length === 0 ? (
              <p className="text-gray-600">Nenhuma coleção encontrada.</p>
            ) : (
              colecoes.map((colecao) => (
                <div key={colecao.id} className="bg-gray-50 p-6 rounded-xl shadow-sm mb-4 border border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{colecao.title}</h3>
                      <p className="text-sm text-gray-500">{colecao.subtitle}</p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button onClick={() => handleEdit(colecao)} className="bg-primary text-white p-2 rounded-lg hover:bg-primary transition duration-200">
                        <MdEdit size={20} />
                      </button>
                      <button onClick={() => handleDelete(colecao.id)} className="bg-primary text-white p-2 rounded-lg hover:bg-primary transition duration-200">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {colecao.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <img src={item.img as string} alt={item.productModel} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.productMark} - {item.productModel} ({item.cor})</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Tamanho: {item.size || 'N/A'} | Preço: R${item.price || 'N/A'} | A prazo: R${item.price_card || 'N/A'}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(item.id as string, true)} className="bg-primary text-white p-2 rounded-lg text-sm hover:bg-primary transition duration-200">Excluir</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </AdminLayout>
    </>
  );
}