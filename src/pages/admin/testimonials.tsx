import { PrismaClient } from '@prisma/client';
import AdminLayout from 'components/admin/AdminLayout';
import { GetServerSideProps } from 'next';
import { useState, FormEvent, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  type: 'texto' | 'foto' | 'video';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps<TestimonialsPageProps> = async () => {
  const testimonials = await prisma.testimonial.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const formattedTestimonials: Testimonial[] = testimonials.map((t) => ({
    ...t,
    type: t.type as 'texto' | 'foto' | 'video',
  }));

  return {
    props: {
      testimonials: formattedTestimonials,
    },
  };
};

// Adapte esta função para a forma como seu sistema gerencia o token
const getToken = () => {
  // Exemplo: pegando o token do localStorage
  return localStorage.getItem('authToken');
};

export default function Testimonials({ testimonials }: TestimonialsPageProps) {
  const [testimonialList, setTestimonialList] = useState(testimonials);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: '', type: 'texto', content: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        type: editing.type,
        content: editing.content,
      });
      setFile(null);
    } else {
      setForm({ name: '', type: 'texto', content: '' });
      setFile(null);
    }
  }, [editing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (fileToUpload: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Falha ao fazer upload do arquivo.');
    }
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = getToken();

    let finalContent = form.content;

    try {
      if (form.type === 'foto' || form.type === 'video') {
        if (!file && !editing?.content) {
          setError('Por favor, selecione um arquivo para foto/vídeo.');
          setLoading(false);
          return;
        }
        if (file) {
          finalContent = await uploadFile(file);
        } else if (editing) {
          finalContent = editing.content;
        }
      }
    } catch (uploadError: unknown) {
      const message = uploadError instanceof Error ? uploadError.message : 'Erro desconhecido ao fazer upload.';
      setError('Erro ao fazer upload do arquivo: ' + message);
      setLoading(false);
      return;
    }

    const url = '/api/crud/testimonials';
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, content: finalContent, id: editing.id } : { ...form, content: finalContent };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(body),
      });
  
      if (res.ok) {
        const updatedList = await res.json();
        setTestimonialList(updatedList);
        setEditing(null);
        setForm({ name: '', type: 'texto', content: '' });
        setFile(null);
      } else {
        const data = await res.json();
        setError('Erro ao salvar depoimento: ' + data.message);
      }
    } catch (apiError) {
      setError('Erro ao conectar com a API de depoimentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este depoimento?')) {
      setLoading(true);
      setError(null);
      const token = getToken();
      try {
        const res = await fetch('/api/crud/testimonials', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ id }),
        });
  
        if (res.ok) {
          const updatedList = await res.json();
          setTestimonialList(updatedList);
        } else {
          const data = await res.json();
          setError('Erro ao excluir depoimento: ' + data.message);
        }
      } catch (e) {
        setError('Erro ao conectar com a API.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (testimonial: Testimonial) => {
    setEditing(testimonial);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Depoimentos</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? 'Editar Depoimento' : 'Adicionar Novo Depoimento'}
          </h2>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Depoimento</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => {
                  setForm({ ...form, type: e.target.value as 'texto' | 'foto' | 'video', content: '' });
                  setFile(null);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="texto">Texto</option>
                <option value="foto">Foto</option>
                <option value="video">Vídeo</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                {form.type === 'texto' ? 'Conteúdo do Depoimento' : 'Arquivo'}
              </label>
              {form.type === 'texto' ? (
                <textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                ></textarea>
              ) : (
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full"
                  required={!editing}
                />
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                disabled={loading}
                className={`py-2 px-4 rounded-md transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
              >
                {loading ? 'Salvando...' : (editing ? 'Salvar Alterações' : 'Adicionar Depoimento')}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setFile(null); }}
                  className="bg-gray-400 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Depoimentos Existentes</h2>
          
          {(testimonialList && testimonialList.length > 0) ? (
            <ul className="space-y-4">
              {testimonialList.map((testimonial: Testimonial) => (
                <li key={testimonial.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{testimonial.name}</h3>
                      <p className="text-gray-600 text-sm italic">{testimonial.type}</p>
                      {testimonial.type === 'texto' ? (
                        <p className="mt-2">{testimonial.content}</p>
                      ) : (
                        <a href={testimonial.content} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                          Visualizar {testimonial.type}
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(testimonial)}
                        className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">
              <p>Nenhum depoimento encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}