import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function TaskCard({ task, onEdit, onDelete }) {
  const priorityColors = {
    High: "text-red-600 bg-red-100",
    Medium: "text-yellow-600 bg-yellow-100",
    Low: "text-green-600 bg-green-100",
  };

  const borderTopColors = {
    High: "border-t-4 border-red-500",
    Medium: "border-t-4 border-yellow-400",
    Low: "border-t-4 border-green-500",
  };

  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-sm border ${borderTopColors[task.priority] || ""} flex flex-col gap-2`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600">{task.description}</p>

      <div className="text-xs text-gray-500">
        <p><strong>Project:</strong> {task.project}</p>
        <p><strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleDateString("en-GB") : "N/A"}</p>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => onEdit(task)}
          className="text-blue-600 hover:underline text-sm"
        >
           <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:underline text-sm"
        >
            <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
