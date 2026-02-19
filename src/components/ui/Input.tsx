'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3 bg-white border border-pink-200 rounded-xl text-gray-800
            placeholder-gray-400 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent
            hover:border-pink-300
            ${error ? 'border-red-300 focus:ring-red-300' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
