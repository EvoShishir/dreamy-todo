"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import TodoCard from "./components/TodoCard";
import AddTaskModal, { TaskFormValues } from "./components/AddTaskModal";
import FilterModal from "./components/FilterModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { LuPlus, LuSearch, LuFilter } from "react-icons/lu";
import toast from "react-hot-toast";
import { baseUrl } from "./constants";
import { getAuthHeaders } from "./utils/auth";
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
  rectSortingStrategy,
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
    opacity: isDragging ? 0 : 1,
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    priority: string[];
    is_completed: boolean | null;
    todo_date: string;
  }>({
    priority: [],
    is_completed: null,
    todo_date: "",
  });

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

  // Fetch todos
  const fetchTodos = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (filters.priority.length > 0) {
        filters.priority.forEach((p) => params.append("priority", p));
      }

      if (filters.is_completed !== null) {
        params.append("is_completed", String(filters.is_completed));
      }

      if (filters.todo_date) {
        params.append("todo_date", filters.todo_date);
      }

      const url = `${baseUrl}/todos/${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url, {
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
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to load todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [searchQuery, filters]);

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
        // Dragged item takes target position
        return { ...todo, position: targetPosition };
      } else if (draggedPosition < targetPosition) {
        // Moving down: shift items between source and target backward
        if (
          todo.position > draggedPosition &&
          todo.position <= targetPosition
        ) {
          return { ...todo, position: todo.position - 1 };
        }
      } else if (draggedPosition > targetPosition) {
        // Moving up: shift items between target and source forward
        if (
          todo.position >= targetPosition &&
          todo.position < draggedPosition
        ) {
          return { ...todo, position: todo.position + 1 };
        }
      }
      return todo;
    });

    // Sort by position for correct display order
    const sortedTodos = newTodos.sort((a, b) => a.position - b.position);

    // Update local state immediately for smooth UX
    setTodos(sortedTodos);

    // Update positions on server
    try {
      // Collect all todos that need position updates
      const updatesToSend = newTodos
        .filter((newTodo) => {
          const oldTodo = todos.find((t) => t.id === newTodo.id);
          return oldTodo && oldTodo.position !== newTodo.position;
        })
        .map((todo) => ({
          id: todo.id,
          position: todo.position,
        }));

      // Send all updates in parallel
      const updatePromises = updatesToSend.map((update) =>
        fetch(`${baseUrl}/todos/${update.id}/`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ position: update.position }),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(
              `Failed to update position for todo ${update.id}:`,
              errorData
            );
          }
          return response;
        })
      );

      const responses = await Promise.all(updatePromises);

      // Check if all updates succeeded
      const allSucceeded = responses.every((response) => response.ok);

      if (!allSucceeded) {
        throw new Error("Failed to update some positions");
      }
    } catch (error) {
      console.error("Error updating position:", error);
      // Revert on error
      fetchTodos();
      return;
    }

    // Refresh to get the updated data from server (separate from update error handling)
    fetchTodos();
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

  const handleApplyFilters = (newFilters: {
    priority: string[];
    is_completed: boolean | null;
    todo_date: string;
  }) => {
    setFilters(newFilters);
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
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg text-gray-600">Loading todos...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Filter By
            <LuFilter size={16} />
          </button>
        </div>

        {/* Task Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Tasks
          </h2>

          {todos.length === 0 ? (
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
                items={todos.map((todo) => todo.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todos.map((todo) => (
                    <div key={todo.id} className="cursor-pointer">
                      <SortableTodoCard
                        key={todo.id}
                        todo={todo}
                        onEdit={handleEdit}
                        onDelete={handleDeleteTodo}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeTodo ? (
                  <div className="scale-105 cursor-grabbing shadow-2xl">
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </DashboardLayout>
    </ProtectedRoute>
  );
}
