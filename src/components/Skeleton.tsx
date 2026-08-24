import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente base de Skeleton con efecto shimmer en oro y verde noble.
 */
export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
  style,
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton}${className ? ` ${className}` : ''}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
