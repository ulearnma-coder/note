
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`p-2 rounded-full transition-colors duration-200
        ${className || 'text-gray-400 hover:bg-gray-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
    >
      {children}
    </button>
  );
};

export default IconButton;
