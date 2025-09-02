// components/EditFileModal.tsx
import { useState, useEffect } from 'react';
import { File, Projeto, Task } from 'types/task';

interface EditFileModalProps {
    file: File;
    projetos: Projeto[];
    tasks: Task[]; // Todas as tarefas, mas vamos filtrar aqui
    onClose: () => void;
    onSave: (fileId: string, projetoId: string | null, taskId: string | null) => void;
}

export default function EditFileModal({ file, projetos, onClose, onSave }: EditFileModalProps) {
    const [selectedProjetoId, setSelectedProjetoId] = useState(file.projeto?.id || '');
    const [selectedTaskId, setSelectedTaskId] = useState(file.task?.id || '');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Carrega tarefas ao abrir o modal e ao trocar de projeto
    useEffect(() => {
        if (!selectedProjetoId) {
            setTasks([]);
            setSelectedTaskId('');
            return;
        }

        const fetchTasks = async () => {
            setLoadingTasks(true);
            try {
                const res = await fetch(`/api/tasks?projetoId=${selectedProjetoId}`);
                if (!res.ok) throw new Error('Falha ao carregar tarefas.');
                const data: Task[] = await res.json();
                setTasks(data);

                // Se a tarefa atual não pertence ao novo projeto, reset
                if (!data.find(t => t.id === selectedTaskId)) {
                    setSelectedTaskId('');
                }
            } catch (err) {
                console.error(err);
                setTasks([]);
                setSelectedTaskId('');
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
    }, [selectedProjetoId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Editar Arquivo</h2>

                <div className="flex flex-col gap-4">
                    {/* Select de Projetos */}
                    <select
                        value={selectedProjetoId}
                        onChange={(e) => setSelectedProjetoId(e.target.value)}
                        className="border rounded-md p-2"
                    >
                        <option value="">Selecione um Projeto</option>
                        {projetos.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>

                    {/* Select de Tarefas */}
                    <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="border rounded-md p-2"
                        disabled={!selectedProjetoId || loadingTasks}
                    >
                        <option value="">Selecione uma Tarefa</option>
                        {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>

                    {/* Botões */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                        <button
                            onClick={() => onSave(file.id, selectedProjetoId || null, selectedTaskId || null)}
                            className="px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-bold"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
