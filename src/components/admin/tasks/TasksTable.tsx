import { Task, TaskStatusEnum } from "types/task";


type TasksTableProps = {
  tasks: Task[];
  onOpenDetail: (task: Task) => void;
  onOpenEdit: (task: Task) => void;
};

export default function TasksTable({ tasks, onOpenDetail, onOpenEdit }: TasksTableProps) {
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case TaskStatusEnum.PENDENTE:
        return "bg-red-100 text-red-800";
      case TaskStatusEnum.EM_ANDAMENTO:
        return "bg-yellow-100 text-yellow-800";
      case TaskStatusEnum.CONCLUIDA:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2:
        return "bg-red-500 text-white";
      case 1:
        return "bg-yellow-500 text-white";
      case 0:
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 2:
        return "Alta";
      case 1:
        return "Normal";
      case 0:
        return "Baixa";
      default:
        return "N/A";
    }
  };

  if (tasks.length === 0) {
    return <p className="p-6 text-gray-500 text-center">Nenhuma tarefa encontrada.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Título
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Projeto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Prioridade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Responsável
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Vencimento
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-100 transition">
              <td className="px-6 py-4">{task.title}</td>
              <td className="px-6 py-4">{task.projeto?.title || "N/A"}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 inline-flex text-xs font-semibold rounded-full ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {getPriorityText(task.priority)}
                </span>
              </td>
              <td className="px-6 py-4">{task.assignedTo?.name || "N/A"}</td>
              <td className="px-6 py-4">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onOpenDetail(task)}
                  className="text-orange-600 hover:text-orange-900 mr-4"
                >
                  Ver
                </button>
                <button
                  onClick={() => onOpenEdit(task)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
