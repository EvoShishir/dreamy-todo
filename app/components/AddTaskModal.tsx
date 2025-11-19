"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { LuX } from "react-icons/lu";
import Modal from "./Modal";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  initialValues?: TaskFormValues;
  isEdit?: boolean;
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: "extreme" | "moderate" | "low";
  todo_date: string;
}

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  priority: Yup.string()
    .oneOf(["extreme", "moderate", "low"])
    .required("Priority is required"),
  todo_date: Yup.string().required("Date is required"),
});

export default function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
}: AddTaskModalProps) {
  const formik = useFormik<TaskFormValues>({
    initialValues: initialValues || {
      title: "",
      description: "",
      priority: "moderate",
      todo_date: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
        formik.resetForm();
        onClose();
      } catch (error) {
        console.error("Error submitting task:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Task" : "Add New Task"}
      size="md"
      showCloseButton={false}
    >
      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5272FF] focus:border-transparent"
              placeholder="Enter task title"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="todo_date"
              value={formik.values.todo_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5272FF] focus:border-transparent"
            />
            {formik.touched.todo_date && formik.errors.todo_date && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.todo_date}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="extreme"
                  checked={formik.values.priority === "extreme"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="flex items-center gap-1 text-sm">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Extreme
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="moderate"
                  checked={formik.values.priority === "moderate"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="flex items-center gap-1 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  Moderate
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={formik.values.priority === "low"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="flex items-center gap-1 text-sm">
                  <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                  Low
                </span>
              </label>
            </div>
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5272FF] focus:border-transparent resize-none"
              placeholder="Start writing here....."
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-2.5 bg-[#5272FF] text-white rounded-md font-medium hover:bg-[#3D5AE6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formik.isSubmitting ? "Saving..." : "Done"}
            </button>
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                onClose();
              }}
              className="p-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <LuX size={20} />
            </button>
          </div>
        </form>
    </Modal>
  );
}
