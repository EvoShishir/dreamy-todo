"use client";

import { LuX } from "react-icons/lu";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {/* {showCloseButton && ( */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <LuX size={20} />
          </button>
          {/* // )} */}
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
