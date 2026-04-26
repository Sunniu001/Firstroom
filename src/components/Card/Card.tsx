import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  image?: string;
  title: string;
  subtitle?: string;
  price?: string;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  image,
  title,
  subtitle,
  price,
  className = '',
  onClick
}) => {
  return (
    <div className={`${styles.card} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {image && (
        <div className={styles.imageContainer}>
          <img src={image} alt={title} className={styles.image} loading="lazy" />
          <div className={styles.overlay}></div>
        </div>
      )}
      <div className={styles.content}>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <h3 className={styles.title}>{title}</h3>
        {price && <span className={styles.price}>{price}</span>}
      </div>
    </div>
  );
};
