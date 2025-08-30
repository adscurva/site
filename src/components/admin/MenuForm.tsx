import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { FaTrash, FaEdit } from "react-icons/fa"; // Importar FaEdit
import { useSession } from "next-auth/react";

interface MenuLink {
  id: string;
  text: string;
  url: string;
  target?: "_blank" | "_self"; // Target pode ser opcional, mas explicitamos os valores permitidos
}

export default function MenuForm() {
  const { data: session, status } = useSession();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [links, setLinks] = useState<MenuLink[]>([]);
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTarget, setNewLinkTarget] = useState(false);
  const [editingLink, setEditingLink] = useState<MenuLink | null>(null); // Novo estado para edição
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      if (session?.user?.role !== "ADMIN") return;

      try {
        const response = await fetch("/api/crud/menu");
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setLogoUrl(data.logoUrl || "");
            // Garantir que os links tenham um target padrão se ausente
            const formattedLinks: MenuLink[] = (data.links || []).map((link: any) => ({
              id: link.id,
              text: link.text,
              url: link.url,
              target: link.target === "_blank" ? "_blank" : "_self",
            }));
            setLinks(formattedLinks);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do menu:", error);
      }
    };
    fetchMenu();
  }, [session, status]);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleLinkSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newLinkText.trim() && newLinkUrl.trim()) { // Usar .trim() para evitar links vazios
      const newTarget = newLinkTarget ? "_blank" : "_self";

      if (editingLink) {
        // Editar link existente
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.id === editingLink.id
              ? {
                  ...link,
                  text: newLinkText.trim(),
                  url: newLinkUrl.trim(),
                  target: newTarget,
                }
              : link
          )
        );
        setEditingLink(null); // Limpar estado de edição após a atualização
      } else {
        // Adicionar novo link
        setLinks((prevLinks) => [
          ...prevLinks,
          {
            id: String(Date.now()), // ID único para novo link
            text: newLinkText.trim(),
            url: newLinkUrl.trim(),
            target: newTarget,
          },
        ]);
      }
      // Limpar campos do formulário
      setNewLinkText("");
      setNewLinkUrl("");
      setNewLinkTarget(false);
    }
  };

  const handleLinkRemove = (idToRemove: string) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== idToRemove));
    if (editingLink?.id === idToRemove) { // Se remover o link que está sendo editado
      setEditingLink(null);
      setNewLinkText("");
      setNewLinkUrl("");
      setNewLinkTarget(false);
    }
  };

  const handleEditClick = (linkToEdit: MenuLink) => {
    setEditingLink(linkToEdit);
    setNewLinkText(linkToEdit.text);
    setNewLinkUrl(linkToEdit.url);
    setNewLinkTarget(linkToEdit.target === "_blank");
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setNewLinkText("");
    setNewLinkUrl("");
    setNewLinkTarget(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!session || session.user?.role !== 'ADMIN') {
      setMessage("Acesso não autorizado.");
      setLoading(false);
      return;
    }

    let uploadedLogoUrl = logoUrl;
    if (logoFile) {
      const formData = new FormData();
      formData.append("file", logoFile);
      // Removendo 'upload_preset' se não for cloudinary ou se já estiver configurado na API de upload
      // formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""); 

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro no upload da logomarca.");
        }

        const data = await response.json();
        uploadedLogoUrl = data.url;
      } catch (error) {
        console.error(error);
        setMessage("Erro ao fazer upload da logomarca.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/crud/menu", {
        method: "POST", // A API deve lidar com POST para criação/atualização de todo o menu
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoUrl: uploadedLogoUrl, links }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o menu.");
      }

      setMessage("Menu salvo com sucesso!");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar o menu.");
    } finally {
      setLoading(false);
    }
  };
  
  const isButtonDisabled = !session || session.user?.role !== "ADMIN" || loading;
  if (status === 'loading') return <p>Carregando...</p>;
  if (session?.user?.role !== 'ADMIN') return <p>Acesso não autorizado.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gerenciar Menu</h2>
      {message && (
        <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {/* Seção da Logomarca */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Logomarca</h3>
        <label className="block text-gray-700 font-bold mb-2">
          Imagem da Logomarca
        </label>
        <input
          type="file"
          onChange={handleLogoChange}
          className="w-full text-gray-700 bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-orange-500"
        />
        {logoUrl && (
          <div className="mt-4">
            <p className="text-gray-600">Logomarca atual:</p>
            <img src={logoUrl} alt="Logomarca atual" className="h-16 w-auto mt-2" />
          </div>
        )}
      </div>

      {/* Seção de Links do Menu */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Links do Menu</h3>
        <div className="space-y-4 mb-4">
          <form onSubmit={handleLinkSubmit} className="p-4 border rounded-md">
            <div className="mb-2">
              <label htmlFor="link-text" className="block text-gray-700 font-bold mb-1">
                Texto do Link
              </label>
              <input
                id="link-text"
                type="text"
                value={newLinkText}
                onChange={(e) => setNewLinkText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: Sobre Nós"
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="link-url" className="block text-gray-700 font-bold mb-1">
                URL do Link
              </label>
              <input
                id="link-url"
                type="text"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: /#sobre"
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center text-gray-700 font-bold">
                <input
                  type="checkbox"
                  checked={newLinkTarget}
                  onChange={(e) => setNewLinkTarget(e.target.checked)}
                  className="mr-2"
                />
                Abrir em nova aba?
              </label>
            </div>
            <div className="flex space-x-2">
                <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                    {editingLink ? "Salvar Edição" : "Adicionar Link"}
                </button>
                {editingLink && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Cancelar Edição
                    </button>
                )}
            </div>
          </form>
        </div>

        {links.length > 0 && (
          <ul className="space-y-2">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{link.text}</p>
                  <p className="text-sm text-gray-500">{link.url}</p>
                  <p className="text-sm text-gray-500">Abre em: {link.target === "_blank" ? "Nova aba" : "Mesma aba"}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(link)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                    aria-label={`Editar link ${link.text}`}
                  >
                    <FaEdit />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLinkRemove(link.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    aria-label={`Remover link ${link.text}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={`w-full p-3 text-white font-bold rounded-md mt-6 ${isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
        disabled={isButtonDisabled}
      >
        {loading ? "Salvando..." : "Salvar Menu Completo"}
      </button>
    </div>
  );
}