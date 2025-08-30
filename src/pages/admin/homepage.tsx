// src/pages/admin/homepage.tsx

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaEdit } from "react-icons/fa";
import { DynamicSection } from "../../components/sections/DynamicSection";
import AdminLayout from '../../components/admin/AdminLayout';

// Tipos de dados para as sessões
interface HomepageSection {
  id: string;
  type: string;
  order: number;
  content: { [key: string]: any };
}

// Interfaces de tipos para os formulários de edição
interface GenericSectionContent {
  title?: string;
  text?: string;
  style?: { [key: string]: string };
}

interface GenericSectionFormProps {
  content: GenericSectionContent;
  onUpdate: (content: GenericSectionContent) => void;
  onCancel: () => void;
}

const GenericSectionForm: React.FC<GenericSectionFormProps> = ({ content, onUpdate, onCancel }) => {
  const [data, setData] = useState<GenericSectionContent>(content);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [name]: value,
      },
    }));
  };

  return (
    <div className="bg-white p-4 rounded-md mt-2 shadow-inner">
      <h4 className="text-lg font-semibold mb-2">Editar Sessão Personalizada</h4>
      <div className="bg-gray-200 p-4 rounded-md mb-4">
        <h5 className="text-sm font-bold mb-2">Pré-visualização</h5>
        <div className="bg-white p-4 rounded-md border-2 border-dashed border-gray-400">
          <DynamicSection content={{ ...data, type: 'custom' }} />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input type="text" name="title" value={data.title || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Texto</label>
        <textarea name="text" value={data.text || ''} onChange={handleChange} className="w-full p-2 border rounded-md h-24"></textarea>
      </div>
      <h5 className="text-sm font-bold mt-6 mb-2">Estilos do Contêiner</h5>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cor de Fundo</label>
          <input type="text" name="backgroundColor" value={data.style?.backgroundColor || ''} onChange={handleStyleChange} className="w-full p-2 border rounded-md" placeholder="Ex: #f0f0f0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Margem (Ex: 16px)</label>
          <input type="text" name="margin" value={data.style?.margin || ''} onChange={handleStyleChange} className="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preenchimento (Ex: 16px)</label>
          <input type="text" name="padding" value={data.style?.padding || ''} onChange={handleStyleChange} className="w-full p-2 border rounded-md" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => onUpdate(data)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary">Salvar</button>
        <button onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancelar</button>
      </div>
    </div>
  );
};

export default function HomepageAdmin() {
  const { data: session } = useSession();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/crud/homepage", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // O header de autorização não precisa mais do accessToken
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSections(data);
        setMessage("");
      } else {
        throw new Error("Erro ao buscar as sessões.");
      }
    } catch (error) {
      setMessage("Erro ao carregar as sessões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Agora o useEffect só verifica se o usuário é um ADMIN
    if (session?.user?.role === "ADMIN") {
        fetchSections();
    }
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (!session || session.user?.role !== "ADMIN") {
        setMessage("Acesso não autorizado.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/crud/homepage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // O header de autorização não precisa mais do accessToken
        },
        body: JSON.stringify({ sections }),
      });

      if (response.ok) {
        setMessage("Sessões salvas com sucesso!");
        fetchSections();
      } else {
        throw new Error("Erro ao salvar as sessões.");
      }
    } catch (error) {
      setMessage("Erro ao salvar as sessões.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta sessão?")) return;
    setLoading(true);
    setMessage("");
    try {
      if (!session || session.user?.role !== "ADMIN") {
        setMessage("Acesso não autorizado.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/crud/homepage?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // O header de autorização não precisa mais do accessToken
        },
      });
      if (response.ok) {
        setMessage("Sessão removida com sucesso!");
        fetchSections();
      } else {
        throw new Error("Erro ao remover a sessão.");
      }
    } catch (error) {
      setMessage("Erro ao remover a sessão.");
    } finally {
      setLoading(false);
    }
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const newSections = [...sections];
    const index = newSections.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === "down" && index < newSections.length - 1) {
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    }

    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const handleUpdateContent = (newContent: any) => {
    const newSections = sections.map(s => s.id === editingId ? { ...s, content: newContent } : s);
    setSections(newSections);
    setEditingId(null);
  };

  const getFormForType = (section: HomepageSection) => {
    switch (section.type) {
      case 'inicio':
        return <p>Este formulário será criado futuramente.</p>;
      case 'colecao':
        return <p>Este formulário será criado futuramente.</p>;
      case 'custom':
        return <GenericSectionForm
          content={section.content}
          onUpdate={handleUpdateContent}
          onCancel={() => setEditingId(null)}
        />;
      default:
        return null;
    }
  };

  const isButtonDisabled = !session || session.user?.role !== "ADMIN" || loading;

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6  ">Gerenciar Homepage</h1>
        {message && <p className={`mb-4 text-center ${message.startsWith('Erro') || message.startsWith('Acesso') ? 'text-primary' : 'text-primary'}`}>{message}</p>}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Adicionar Nova Sessão</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSections([...sections, { id: `new-${Date.now()}`, type: 'custom', order: sections.length, content: { title: "Nova Sessão Personalizada", text: "Este é o conteúdo.", style: {} } }])}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary"
            >
              <FaPlus /> Sessão Personalizada
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Sessões Atuais</h2>
          {sections.length === 0 && !loading && <p>Nenhuma sessão adicionada ainda.</p>}
          {loading && <p>Carregando sessões...</p>}
          <ul className="space-y-4">
            {sections.map((section, index) => (
              <li key={section.id} className="border p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{index + 1}. {section.type.charAt(0).toUpperCase() + section.type.slice(1)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleMove(section.id, "up")} className="text-gray-500 hover:text-primary disabled:opacity-50" disabled={index === 0}>
                      <FaArrowUp />
                    </button>
                    <button onClick={() => handleMove(section.id, "down")} className="text-gray-500 hover:text-primary disabled:opacity-50" disabled={index === sections.length - 1}>
                      <FaArrowDown />
                    </button>
                    <button onClick={() => setEditingId(section.id)} className="text-gray-500 hover:text-primary">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(section.id)} className="text-primary hover:text-primary">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {editingId === section.id ? (
                  getFormForType(section)
                ) : (
                  <div className="text-sm text-gray-500 mt-2">
                    <p>ID: {section.id}</p>
                    <p>Tipo: {section.type}</p>
                    <p>Conteúdo: {JSON.stringify(section.content)}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={handleSave}
            disabled={isButtonDisabled}
            className={`mt-6 w-full p-3 text-white font-bold rounded-md ${isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary"}`}
          >
            {loading ? "Salvando..." : "Salvar Ordem e Conteúdo"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}