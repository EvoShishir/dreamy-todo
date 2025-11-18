import { LuPencil, LuTrash2, LuGripVertical } from "react-icons/lu";

interface TodoCardProps {
  id: number;
  title: string;
  description: string;
  priority: "extreme" | "moderate" | "low";
  todo_date: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
}

const priorityConfig = {
  extreme: { label: "Extreme", color: "bg-red-100 text-red-600" },
  moderate: { label: "Moderate", color: "bg-green-100 text-green-600" },
  low: { label: "Low", color: "bg-yellow-100 text-yellow-600" },
};

export default function TodoCard({
  id,
  title,
  description,
  priority,
  todo_date,
  onEdit,
  onDelete,
  isDragging,
}: TodoCardProps) {
  const priorityStyle = priorityConfig[priority];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-5 shadow-sm hover:shadow-md transition-all ${
        isDragging
          ? "border-[#5272FF] shadow-lg ring-2 ring-[#5272FF] ring-opacity-50"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1">
          <button className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-gray-600 transition-colors">
            <LuGripVertical size={20} />
          </button>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded text-xs font-medium ${priorityStyle.color}`}
        >
          {priorityStyle.label}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 ml-7">{description}</p>

      <div className="flex items-center justify-between ml-7">
        <div className="text-sm text-gray-600">
          Due <span className="font-medium">{formatDate(todo_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(id)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <LuPencil size={16} />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <LuTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
