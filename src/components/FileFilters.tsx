import React from 'react';
import { Projeto, Task } from 'types/task';

type Props = {
  projetos: Projeto[];
  tasks: Task[];
  selectedProjetoId: string;
  selectedTaskId: string;
  onProjetoChange: (id: string) => void;
  onTaskChange: (id: string) => void;
  projetosLoading: boolean;
  tasksLoading: boolean;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
};

export default function FileFilters({ projetos, tasks, selectedProjetoId, selectedTaskId, onProjetoChange, onTaskChange, projetosLoading, tasksLoading, viewMode, setViewMode }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <select
        className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
        value={selectedProjetoId}
        onChange={e => onProjetoChange(e.target.value)}
        disabled={projetosLoading}
      >
        <option value="">Todos os Projetos</option>
        {projetos.map(proj => <option key={proj.id} value={proj.id}>{proj.title}</option>)}
      </select>

      {selectedProjetoId && (
        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
          value={selectedTaskId}
          onChange={e => onTaskChange(e.target.value)}
          disabled={tasksLoading}
        >
          <option value="">Todas as Tarefas</option>
          {tasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
        </select>
      )}

      <button className={`px-6 py-2 rounded-md font-bold ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setViewMode('table')}>Tabela</button>
      <button className={`px-6 py-2 rounded-md font-bold ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setViewMode('grid')}>Grid</button>
    </div>
  );
}
