// src/types/task.ts

export enum TaskStatusEnum {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
}

export interface User {
  id: string;
  name: string | null;
  role?: string | null;
}

// NOVO: Interface para Projeto
export interface Projeto {
  id: string;
  title: string;
  // Adicione outras propriedades do Projeto se forem relevantes para o frontend
  // Por exemplo: subtitle?: string; description?: string;
}

// NOVO: Interface para Comentários
export interface Comment {
  id: string;
  message: string;
  createdAt: string; // Ou Date, dependendo de como você formata a data no frontend
  updatedAt?: string; // Ou Date
  authorId: string;
  author?: User; // Opcional, para incluir os dados do autor
  taskId: string;
  viewedBy: string[]; // Array de IDs de usuários
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusEnum;
  priority: number;
  dueDate: string | null;

  authorId: string;
  assignedToId: string;

  author?: User;
  assignedTo?: User;
  comments?: Comment[]; // NOVO: Comentários associados à tarefa

  // NOVO: Propriedades de Projeto
  projetoId?: string | null; // ID do projeto associado, pode ser nulo
  projeto?: Projeto; // Objeto do projeto associado, opcional

  createdAt: string;
  updatedAt?: string;
}

export interface File {
  id: string;
  url: string;          // URL do arquivo na Cloudinary ou outro storage
  filename: string;     // Nome original do arquivo
  mimetype: string;     // Tipo MIME (ex: 'application/pdf', 'image/png')

  uploadedBy?: {
    id: string;
    name: string;
  };
  uploadedById: string;

  taskId?: string;
  task?: {
    id: string;
    title: string;
  }; // <-- adicionado

  projeto?: {
    id: string;
    title: string;
  };
  projetoId?: string;

  createdAt: string;
  updatedAt?: string;
}
