"use client";

import { useState } from "react";
import Modal from "./Modal";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    priority: string[];
    is_completed: boolean | null;
    todo_date: string;
  };
  onApplyFilters: (filters: {
    priority: string[];
    is_completed: boolean | null;
    todo_date: string;
  }) => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const togglePriority = (priority: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const handleCompletedChange = (value: boolean | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      is_completed: prev.is_completed === value ? null : value,
    }));
  };

  const handleDateChange = (date: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      todo_date: date,
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      priority: [],
      is_completed: null,
      todo_date: "",
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter By" size="sm">
      {/* Filter Content */}
      <div className="p-6 space-y-6">
          {/* Priority Filter */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Priority</h4>
            <div className="space-y-2">
              {["extreme", "moderate", "low"].map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.priority.includes(priority)}
                    onChange={() => togglePriority(priority)}
                    className="w-4 h-4 text-[#5272FF] border-gray-300 rounded focus:ring-[#5272FF] cursor-pointer"
                  />
                  <span className="text-gray-700 capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Status</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.is_completed === true}
                  onChange={() => handleCompletedChange(true)}
                  className="w-4 h-4 text-[#5272FF] border-gray-300 rounded focus:ring-[#5272FF] cursor-pointer"
                />
                <span className="text-gray-700">Completed</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.is_completed === false}
                  onChange={() => handleCompletedChange(false)}
                  className="w-4 h-4 text-[#5272FF] border-gray-300 rounded focus:ring-[#5272FF] cursor-pointer"
                />
                <span className="text-gray-700">Not Completed</span>
              </label>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Due Date</h4>
            <input
              type="date"
              value={localFilters.todo_date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5272FF] focus:border-transparent"
            />
          </div>
        </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-[#5272FF] text-white rounded-md hover:bg-[#3D5AE6] transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </Modal>
  );
}
