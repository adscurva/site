import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from 'types/task';

interface TaskCardProps {
    task: Task;
    onOpenDetail: (task: Task) => void;
    onOpenEdit: (task: Task) => void;
    getPriorityColor: (priority: number) => string;
    getPriorityText: (priority: number) => string;
    onDragEnd?: (taskId: string) => Promise<void>; // ✅ NOVO: prop opcional para lidar com drag end
}

export function TaskCard({
    task,
    onOpenDetail,
    onOpenEdit,
    getPriorityColor,
    getPriorityText,
    onDragEnd, // ✅ recebe a prop
}: TaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    // Função interna para disparar onDragEnd
    const handleDragEndInternal = async () => {
        if (onDragEnd) {
            await onDragEnd(task.id);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onDragEnd={handleDragEndInternal} // ✅ dispara a função passada de fora
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-grab"
        >
            <h3 className="text-base font-semibold text-gray-900 truncate">{task.title}</h3>
            {task.projeto?.title && (
                <p className="text-sm text-gray-600 mt-1">Projeto: {task.projeto.title}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Responsável: {task.assignedTo?.name || 'N/A'}</p>
            {task.dueDate && (
                <p className="text-xs text-gray-400 mt-1">Vencimento: {new Date(task.dueDate).toLocaleDateString()}</p>
            )}
            <div className="flex flex-wrap items-center mt-2 space-x-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    {getPriorityText(task.priority)}
                </span>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={() => onOpenDetail(task)} className="text-sm text-orange-600 hover:text-orange-900">
                    Detalhes
                </button>
                <button onClick={() => onOpenEdit(task)} className="text-sm text-blue-600 hover:text-blue-900">
                    Editar
                </button>
            </div>
        </div>
    );
}
