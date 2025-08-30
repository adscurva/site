// src/components/admin/BannerForm.tsx

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { v4 as uuidv4 } from 'uuid'; // Importa a função uuid para IDs únicos

interface BannerItem {
  id: string;
  url: string;
  title?: string;
  subtitle?: string;
  link?: string;
  target?: string;
  buttonText?: string;
  buttonColor?: string;
}

export default function BannerForm() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newTarget, setNewTarget] = useState(false);
  const [newButtonText, setNewButtonText] = useState("");
  const [newButtonColor, setNewButtonColor] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/crud/banner");
        if (response.ok) {
          const data = await response.json();
          if (data && data.banners) {
            setBanners(data.banners);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do banner:", error);
      }
    };
    fetchBanners();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleRemoveBanner = (idToRemove: string) => {
    const updatedBanners = banners.filter((banner) => banner.id !== idToRemove);
    setBanners(updatedBanners);
    saveBannersToDatabase(updatedBanners, "Banner removido com sucesso!");
    if (editingBannerId === idToRemove) {
      clearForm();
    }
  };

  const clearForm = () => {
    setNewFile(null);
    setNewTitle("");
    setNewSubtitle("");
    setNewLink("");
    setNewTarget(false);
    setNewButtonText("");
    setNewButtonColor("");
    setEditingBannerId(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditBanner = (banner: BannerItem) => {
    setEditingBannerId(banner.id);
    setNewTitle(banner.title || "");
    setNewSubtitle(banner.subtitle || "");
    setNewLink(banner.link || "");
    setNewTarget(banner.target === '_blank');
    setNewButtonText(banner.buttonText || "");
    setNewButtonColor(banner.buttonColor || "");
    setMessage("");
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const saveBannersToDatabase = async (updatedBanners: BannerItem[], successMessage: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/crud/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banners: updatedBanners }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar os banners.");
      }

      const data = await response.json();
      setBanners(data.banners);
      setMessage(successMessage);
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar os banners.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let uploadedUrl: string | null = null;
    if (newFile) {
      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Erro no upload do banner.");
        }

        const data = await uploadResponse.json();
        uploadedUrl = data.url;
      } catch (error) {
        console.error(error);
        setMessage("Erro ao fazer upload da imagem.");
        setLoading(false);
        return;
      }
    }

    let updatedBanners: BannerItem[];

    if (editingBannerId) {
      updatedBanners = banners.map((banner) =>
        banner.id === editingBannerId
          ? {
              ...banner,
              url: uploadedUrl || banner.url,
              title: newTitle,
              subtitle: newSubtitle,
              link: newLink,
              target: newTarget ? '_blank' : '_self',
              buttonText: newButtonText,
              buttonColor: newButtonColor,
            }
          : banner
      );
    } else {
      if (!uploadedUrl) {
        setMessage("Por favor, selecione uma imagem para o novo banner.");
        setLoading(false);
        return;
      }
      const newBannerItem: BannerItem = {
        id: uuidv4(),
        url: uploadedUrl,
        title: newTitle,
        subtitle: newSubtitle,
        link: newLink,
        target: newTarget ? '_blank' : '_self',
        buttonText: newButtonText,
        buttonColor: newButtonColor,
      };
      updatedBanners = [...banners, newBannerItem];
    }
    
    await saveBannersToDatabase(updatedBanners, editingBannerId ? "Banner atualizado com sucesso!" : "Banner adicionado com sucesso!");
    clearForm();
  };

  return (
    <form onSubmit={handleUploadAndSave} className="bg-neutral-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      {message && (
        <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-accent" : "text-accent"}`}>
          {message}
        </p>
      )}

      {/* Seção para Adicionar/Editar Banner */}
      <div className="mb-4 space-y-4 border border-neutral-medium p-4 rounded-md">
        <h3 className="text-xl font-bold text-primary">
          {editingBannerId ? "Editar Banner Existente" : "Adicionar Novo Banner"}
        </h3>
        <div>
          <label className="block text-neutral-dark font-bold mb-2">Imagem {editingBannerId && "(Deixe em branco para manter a atual)"}</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full text-neutral-dark bg-neutral-white border border-neutral-medium rounded-md py-2 px-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-neutral-dark font-bold mb-2">Título (Opcional)</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 border border-neutral-medium rounded-md text-neutral-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="Título do Banner"
          />
        </div>
        <div>
          <label className="block text-neutral-dark font-bold mb-2">Subtítulo (Opcional)</label>
          <input
            type="text"
            value={newSubtitle}
            onChange={(e) => setNewSubtitle(e.target.value)}
            className="w-full p-2 border border-neutral-medium rounded-md text-neutral-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="Subtítulo do Banner"
          />
        </div>
        <div>
          <label className="block text-neutral-dark font-bold mb-2">Link do Botão (Opcional)</label>
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            className="w-full p-2 border border-neutral-medium rounded-md text-neutral-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-neutral-dark font-bold mb-2">Texto do Botão (Opcional)</label>
          <input
            type="text"
            value={newButtonText}
            onChange={(e) => setNewButtonText(e.target.value)}
            className="w-full p-2 border border-neutral-medium rounded-md text-neutral-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="Ex: Saiba Mais"
          />
        </div>
        <div>
          <label className="block text-neutral-dark font-bold mb-2">Cor do Botão (Classe Tailwind. Ex: bg-primary)</label>
          <input
            type="text"
            value={newButtonColor}
            onChange={(e) => setNewButtonColor(e.target.value)}
            className="w-full p-2 border border-neutral-medium rounded-md text-neutral-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="Ex: bg-primary ou bg-accent"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={newTarget}
            onChange={(e) => setNewTarget(e.target.checked)}
            className="mr-2 h-4 w-4 text-accent border-neutral-medium rounded focus:ring-accent"
          />
          <label className="text-neutral-dark">Abrir em nova aba?</label>
        </div>
        {editingBannerId && (
          <button
            type="button"
            onClick={clearForm}
            className="w-full p-3 mt-4 bg-neutral-medium text-neutral-dark font-bold rounded-md hover:bg-neutral-dark hover:text-white transition-colors"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      {/* Seção de Banners Atuais */}
      <div className="mb-4">
        <label className="block text-neutral-dark font-bold mb-2">Banners Atuais</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="relative group overflow-hidden rounded-md shadow-md">
              <img src={banner.url} alt={banner.title || "Banner"} className="w-full h-auto" />
              {/* REMOVIDO: opacity-0 group-hover:opacity-100 */}
              <div className="absolute top-2 right-2 flex gap-2 z-10"> {/* NOVO POSICIONAMENTO */}
                <button
                  type="button"
                  onClick={() => handleEditBanner(banner)}
                  className="bg-primary text-white rounded-full p-1 hover:bg-primary-dark transition-colors"
                  title="Editar Banner"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveBanner(banner.id)}
                  className="bg-accent text-white rounded-full p-1 hover:bg-accent-dark transition-colors"
                  title="Remover Banner"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {/* Informações do banner (visíveis sempre) */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 text-white text-xs text-left">
                {banner.title && <p className="font-bold">{banner.title}</p>}
                {banner.subtitle && <p>{banner.subtitle}</p>}
                {banner.buttonText && <p>Botão: {banner.buttonText}</p>}
                {banner.buttonColor && <p>Cor: {banner.buttonColor}</p>}
                {banner.link && <p className="truncate">Link: {banner.link}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className={`w-full p-3 text-white font-bold rounded-md ${loading ? "bg-neutral-medium cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
          }`}
        disabled={loading}
      >
        {loading ? "Salvando..." : editingBannerId ? "Atualizar Banner" : "Adicionar Banner"}
      </button>
    </form>
  );
}