import React from "react"

interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

interface AvatarFallbackProps {
  className?: string;
  children?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ className = "", children }) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  )
}

const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className = "" }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full ${className}`}
    />
  )
}

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className = "", children }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-slate-600 ${className}`}>
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback } 