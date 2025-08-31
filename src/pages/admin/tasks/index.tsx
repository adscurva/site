import TasksKanban from "components/admin/tasks/TasksKanban";
import { useEffect, useState } from "react";
import { DropResult } from "@hello-pangea/dnd";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    // atualiza no frontend
    const updatedTasks = tasks.map((t) =>
      t.id === draggableId
        ? { ...t, status: destination.droppableId as Task["status"] }
        : t
    );
    setTasks(updatedTasks);

    // atualiza no backend
    await fetch(`/api/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: destination.droppableId }),
    });
  };

  const handleEdit = (id: string) => {
    alert(`Abrir modal de edição para a tarefa ${id}`);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Tarefas</h1>
      <TasksKanban
        tasks={tasks}
        onDragEnd={handleDragEnd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
