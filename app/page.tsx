"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import TodoCard from "./components/TodoCard";
import AddTaskModal, { TaskFormValues } from "./components/AddTaskModal";
import { LuPlus, LuSearch, LuFilter } from "react-icons/lu";
import toast from "react-hot-toast";
import { baseUrl } from "./constants";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Todo {
  id: number;
  title: string;
  description: string;
  priority: "extreme" | "moderate" | "low";
  todo_date: string;
  is_completed: boolean;
  position: number;
}

function SortableTodoCard({
  todo,
  onEdit,
  onDelete,
}: {
  todo: Todo;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TodoCard
        id={todo.id}
        title={todo.title}
        description={todo.description}
        priority={todo.priority}
        todo_date={todo.todo_date}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Fetch todos
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${baseUrl}/todos/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      console.log(data);
      // Handle paginated response - todos are in results array
      const todosData = data.results || [];
      const sortedData = todosData.sort(
        (a: Todo, b: Todo) => a.position - b.position
      );
      setTodos(sortedData);
      setFilteredTodos(sortedData);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to load todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTodos(todos);
    } else {
      const filtered = todos.filter((todo) =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTodos(filtered);
    }
  }, [searchQuery, todos]);

  // Create todo
  const handleCreateTodo = async (values: TaskFormValues) => {
    try {
      const response = await fetch(`${baseUrl}/todos/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to create todo");

      toast.success("Task created successfully!");
      fetchTodos();
    } catch (error) {
      console.error("Error creating todo:", error);
      toast.error("Failed to create task");
      throw error;
    }
  };

  // Update todo
  const handleUpdateTodo = async (values: TaskFormValues) => {
    if (!editingTodo) return;

    try {
      const response = await fetch(`${baseUrl}/todos/${editingTodo.id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      toast.success("Task updated successfully!");
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Failed to update task");
      throw error;
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${baseUrl}/todos/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      toast.success("Task deleted successfully!");
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete task");
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = todos.find((t) => t.id === active.id);
    if (todo) {
      setActiveTodo(todo);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTodo(null);

    if (!over || active.id === over.id) return;

    // Don't allow reordering when search is active
    if (searchQuery.trim() !== "") {
      toast.error("Please clear search to reorder tasks");
      return;
    }

    const draggedTodo = todos.find((todo) => todo.id === active.id);
    const targetTodo = todos.find((todo) => todo.id === over.id);

    if (!draggedTodo || !targetTodo) return;

    const draggedPosition = draggedTodo.position;
    const targetPosition = targetTodo.position;

    // Create updated todos array for optimistic UI update
    const newTodos = todos.map((todo) => {
      if (todo.id === draggedTodo.id) {
        return { ...todo, position: targetPosition };
      }
      if (todo.id === targetTodo.id) {
        return { ...todo, position: draggedPosition };
      }
      return todo;
    });

    // Sort by position for correct display order
    const sortedTodos = newTodos.sort((a, b) => a.position - b.position);

    // Update local state immediately for smooth UX
    setTodos(sortedTodos);
    setFilteredTodos(sortedTodos);

    // Update positions on server - swap the two items
    try {
      // Update dragged item's position
      const response1 = await fetch(`${baseUrl}/todos/${draggedTodo.id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ position: targetPosition }),
      });

      if (!response1.ok) {
        throw new Error(`Failed to update position for dragged todo`);
      }

      // Update target item's position
      const response2 = await fetch(`${baseUrl}/todos/${targetTodo.id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ position: draggedPosition }),
      });

      if (!response2.ok) {
        throw new Error(`Failed to update position for target todo`);
      }

      toast.success("Task positions swapped successfully!");

      // Refresh to get the updated data from server
      await fetchTodos();
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error("Failed to swap task positions");
      fetchTodos(); // Revert on error
    }
  };

  const handleEdit = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      setEditingTodo(todo);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  // Drop animation configuration
  const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-gray-600">Loading todos...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Todos</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5272FF] text-white rounded-md font-medium hover:bg-[#3D5AE6] transition-colors"
          >
            <LuPlus size={20} />
            New Task
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <LuSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search your task here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5272FF] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Sort by
            <LuFilter size={16} />
          </button>
        </div>

        {/* Task Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Tasks
          </h2>

          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">
                {searchQuery
                  ? "No tasks found matching your search"
                  : "No tasks yet. Create your first task!"}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTodos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTodos.map((todo) => (
                    <SortableTodoCard
                      key={todo.id}
                      todo={todo}
                      onEdit={handleEdit}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeTodo ? (
                  <div className="rotate-2 scale-105 cursor-grabbing shadow-2xl">
                    <TodoCard
                      id={activeTodo.id}
                      title={activeTodo.title}
                      description={activeTodo.description}
                      priority={activeTodo.priority}
                      todo_date={activeTodo.todo_date}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      isDragging={true}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
        initialValues={
          editingTodo
            ? {
                title: editingTodo.title,
                description: editingTodo.description,
                priority: editingTodo.priority,
                todo_date: editingTodo.todo_date,
              }
            : undefined
        }
        isEdit={!!editingTodo}
      />
    </DashboardLayout>
  );
}
