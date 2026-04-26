import React from 'react';
import styles from './Grid.module.css';

interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 4,
  gap = 'lg',
  className = ''
}) => {
  const gridClasses = `${styles.grid} ${styles[`cols-${columns}`]} ${styles[`gap-${gap}`]} ${className}`;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};
