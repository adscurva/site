import { Projeto } from "types/task";


type ProjectFilterProps = {
  projetos: Projeto[];
  selectedProjetoId: string;
  setSelectedProjetoId: (id: string) => void;
  loading: boolean;
};

export default function ProjectFilter({
  projetos,
  selectedProjetoId,
  setSelectedProjetoId,
  loading,
}: ProjectFilterProps) {
  return (
    <div className="w-full md:w-auto">
      <label htmlFor="project-filter" className="sr-only">
        Filtrar por Projeto
      </label>
      <select
        id="project-filter"
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
        value={selectedProjetoId}
        onChange={(e) => setSelectedProjetoId(e.target.value)}
        disabled={loading}
      >
        <option value="">Todos os Projetos</option>
        {projetos.map((projeto) => (
          <option key={projeto.id} value={projeto.id}>
            {projeto.title}
          </option>
        ))}
      </select>
    </div>
  );
}
