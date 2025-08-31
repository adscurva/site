import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

// O tipo 'Task' foi atualizado para incluir as propriedades que o 'TaskCard' espera.
type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  description: string;
  priority: string;
  dueDate: string;
  authorId: string;
  assignedToId: string;
  createdAt: string;
  updatedAtts: string;
};

type TasksKanbanProps = {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
};

export default function TasksKanban({ tasks, onDragEnd, onEdit, onDelete }: TasksKanbanProps) {
  const columns: Task["status"][] = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-6">
        {columns.map((col) => (
          <Droppable key={col} droppableId={col}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-100 p-4 rounded-lg min-h-[300px]"
              >
                <h2 className="text-lg font-semibold mb-4">{col}</h2>
                {tasks
                  .filter((t) => t.status === col)
                  .map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
