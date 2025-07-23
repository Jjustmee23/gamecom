import React from "react"

interface TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
}

const Textarea: React.FC<TextareaProps> = ({ 
  value, 
  onChange, 
  className = "", 
  rows = 3,
  placeholder 
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
    />
  )
}

export { Textarea } 