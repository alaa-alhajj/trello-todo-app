'use client';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from "uuid";



interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: string;
  project: string;
  status: string;
  displayOrder: number;
}


interface AddTaskPopupProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  allTasks: Task[];
}


type ErrorFields = {
  title?: string;
  description?: string;
  deadline?: string;
  priority?: string;
  status?: string;
  project?: string;
};

export default function AddTaskPopup({ task, onClose, onSave, allTasks }: AddTaskPopupProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('To Do');
  const [project, setProject] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [errors, setErrors] = useState<ErrorFields>({});

  console.log(displayOrder);
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDeadline(task.deadline || '');
      setPriority(task.priority || '');
      setStatus(task.status || 'To Do');
      setProject(task.project || '');
      setDisplayOrder(task.displayOrder?.toString() || '');
    }
  }, [task]);

  const validate = () => {
    const newErrors: ErrorFields = {};
    if (!title.trim()) newErrors.title = 'Task title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!deadline) newErrors.deadline = 'Deadline is required';
    if (!priority.trim()) newErrors.priority = 'Priority is required';
    if (!status) newErrors.status = 'Status is required';
    if (!project.trim()) newErrors.project = 'Project name is required';


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newTask: Task = {
      id: task?.id || uuidv4(),
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      priority: priority,
      project,
      status,
      displayOrder:
        task?.displayOrder ??
        Math.max(0, ...allTasks.map((t) => t.displayOrder || 0)) + 1,
    };


    onSave(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {task ? 'Edit Task' : 'Add New Task'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700">Deadline</label>
            <DatePicker
              selected={deadline ? new Date(deadline) : null}
              onChange={(date) => setDeadline(date ? date.toISOString() : "")}
              minDate={new Date()}
              className="w-full p-2 border rounded-md"
              placeholderText="Select deadline"
              dateFormat="yyyy-MM-dd"
            />
            {errors.deadline && <p className="text-red-500 text-sm">{errors.deadline}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select Priority --</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {errors.priority && <p className="text-red-500 text-sm">{errors.priority}</p>}
          </div>


          <div>
            <label className="block font-medium text-gray-700">Project</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            {errors.project && <p className="text-red-500 text-sm">{errors.project}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>
        </div>

        <div className="text-right mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#6c63ff] text-white px-5 py-2 rounded-xl hover:bg-[#5a54e6] transition"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
