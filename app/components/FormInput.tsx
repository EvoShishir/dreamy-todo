import React from "react";

interface FormInputProps {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  ariaLabel: string;
  className?: string;
}

export default function FormInput({
  name,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  ariaLabel,
  className = "w-full",
}: FormInputProps) {
  return (
    <div className={className}>
      <input
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-4 py-2"
        required={required}
        aria-label={ariaLabel}
      />
      {touched && error && (
        <div className="text-red-600 text-xs mt-1">{error}</div>
      )}
    </div>
  );
}
