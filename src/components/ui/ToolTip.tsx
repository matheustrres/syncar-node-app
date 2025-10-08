"use client";

import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      {/* O tooltip em si */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs
          bg-gray-800 text-white text-center text-xs rounded-md p-2
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          pointer-events-none z-10"
      >
        {text}
        {/* Flecha do tooltip */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
            border-x-4 border-x-transparent 
            border-t-4 border-t-gray-800"
        ></div>
      </div>
    </div>
  );
};

export default Tooltip;
