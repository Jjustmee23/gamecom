import React from "react"

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className = "" }) => {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-700 ${className}`}>
      <div 
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

export { Progress } 