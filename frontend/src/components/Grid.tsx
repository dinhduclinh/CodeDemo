import React from 'react';

type GridProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Grid({ children, className = '' }: GridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      {children}
    </div>
  );
}


