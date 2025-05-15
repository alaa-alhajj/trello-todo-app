'use client';

import { useState, useEffect } from "react";
import TaskCard from "./components/TaskCard";
import AddTaskPopup from "./components/AddTaskPopup";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Task } from "./components/types";
import type { DropResult } from "@hello-pangea/dnd";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [tasksLoaded, setTasksLoaded] = useState(false);

  const statuses = ["To Do", "In Progress", "Done"];


  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tasks");
      if (saved) {
        setTasks(JSON.parse(saved));
      }
      setTasksLoaded(true);
    }
  }, []);


  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleSaveTask = (taskData: Task) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === taskData.id);
      if (exists) {
        return prev.map((t) => (t.id === taskData.id ? taskData : t));
      }
      return [...prev, taskData];
    });
  };

  const openEditPopup = (task: Task) => {
    setEditingTask(task);
    setShowPopup(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this task?");
    if (confirm) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };
const onDragEnd = (result: DropResult) => {
  const { destination, source, draggableId } = result;
  if (!destination) return;

  // If dropped in the same position, no changes
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) return;

  setTasks((prevTasks) => {
    // Copy tasks 
    let tasksCopy = [...prevTasks];

    // Find dragged task index in tasksCopy
    const draggedTaskIndex = tasksCopy.findIndex((t) => t.id === draggableId);
    if (draggedTaskIndex === -1) return prevTasks;

    const draggedTask = tasksCopy[draggedTaskIndex];

    // If dragging inside the same column
    if (destination.droppableId === source.droppableId) {
      // Filter tasks in that column and sort by displayOrder
      const columnTasks = tasksCopy
        .filter(t => t.status === source.droppableId)
        .sort((a,b) => a.displayOrder - b.displayOrder);

      // Remove dragged task from columnTasks by filtering its id
      const filteredColumnTasks = columnTasks.filter(t => t.id !== draggableId);

      // Insert draggedTask into new position
      filteredColumnTasks.splice(destination.index, 0, draggedTask);

      // Update displayOrder for all tasks in that column
      const updatedColumnTasks = filteredColumnTasks.map((task, index) => ({
        ...task,
        displayOrder: index,
      }));

      // Remove old column tasks from tasksCopy
      tasksCopy = tasksCopy.filter(t => t.status !== source.droppableId);

      // Add updated tasks back to tasksCopy
      tasksCopy = [...tasksCopy, ...updatedColumnTasks];

      return tasksCopy;
    } else {
      // Moving to a different column

      // Remove dragged task from tasksCopy
      tasksCopy = tasksCopy.filter(t => t.id !== draggableId);

      // Filter tasks in source and destination columns
      const sourceTasks = tasksCopy
        .filter(t => t.status === source.droppableId)
        .sort((a,b) => a.displayOrder - b.displayOrder);

      const destinationTasks = tasksCopy
        .filter(t => t.status === destination.droppableId)
        .sort((a,b) => a.displayOrder - b.displayOrder);

      // Update dragged task's status
      const updatedDraggedTask = {
        ...draggedTask,
        status: destination.droppableId,
      };

      // Insert dragged task into destinationTasks at destination.index
      destinationTasks.splice(destination.index, 0, updatedDraggedTask);

      // Update displayOrder for source and destination columns
      const updatedSourceTasks = sourceTasks.map((task, idx) => ({
        ...task,
        displayOrder: idx,
      }));

      const updatedDestinationTasks = destinationTasks.map((task, idx) => ({
        ...task,
        displayOrder: idx,
      }));

      // Remove old source and destination column tasks from tasksCopy
      tasksCopy = tasksCopy.filter(
        t => t.status !== source.droppableId && t.status !== destination.droppableId
      );

      // Add updated source and destination tasks back
      tasksCopy = [...tasksCopy, ...updatedSourceTasks, ...updatedDestinationTasks];

      return tasksCopy;
    }
  });
};


  const filteredTasks = tasks.filter((task) => {
    const title = task.title || "";
    const description = task.description || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;

    return matchesSearch && matchesPriority;
  });

  const exportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const countTasksByStatus = (status: string) =>
    filteredTasks.filter((task) => task.status === status).length;

  const isOverdue = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
        My Tasks Board
      </h1>

      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-64"
        />

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {(searchQuery || priorityFilter) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setPriorityFilter("");
            }}
            className="text-red-500 hover:underline text-sm"
          >
            Clear Filters
          </button>
        )}

        <button
          onClick={() => {
            setEditingTask(null);
            setShowPopup(true);
          }}
          className="bg-[#6c63ff] text-white px-5 py-2 rounded-xl shadow hover:bg-[#5a54e6] transition">
          + Add Task
        </button>

        <button
          onClick={exportTasks}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Export JSON
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white rounded-2xl shadow-md p-4 flex flex-col border border-gray-200 min-h-[300px]">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
                    <span>{status} {tasksLoaded ? `(${countTasksByStatus(status)})` : ""}</span>
                  </h2>
                  <div className="space-y-4 flex-1">
                    {filteredTasks
                      .filter((task) => task.status === status)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}>
                              <TaskCard
                                task={{ ...task, isOverdue: isOverdue(task.deadline) }}
                                onEdit={openEditPopup}
                                onDelete={handleDeleteTask} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {showPopup && (
        <AddTaskPopup
          task={editingTask}
          onClose={() => setShowPopup(false)}
          onSave={handleSaveTask}
          allTasks={tasks}
        />
      )}
    </main>
  );
}
