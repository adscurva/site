import { Task } from "types/task";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export default function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  return (
    <div
      className="bg-white p-3 rounded-lg shadow hover:shadow-md transition cursor-grab"
      onClick={() => onEdit(task.id)}
    >
      <h3 className="font-medium text-gray-800">{task.title}</h3>
      <button
        className="text-red-500 text-sm mt-2"
        onClick={(e) => {
          e.stopPropagation(); // impede que dispare o onEdit
          onDelete(task.id);
        }}
      >
        Excluir
      </button>
    </div>
  );
}
