"use client";

import { Task } from "types/task";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white p-3 rounded-lg shadow hover:shadow-md transition cursor-grab">
      <h3 className="font-medium text-gray-800">{task.title}</h3>
    </div>
  );
}
