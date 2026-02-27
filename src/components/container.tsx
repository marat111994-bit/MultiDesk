import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20 ${className}`}
    >
      {children}
    </div>
  );
}
