import React from 'react';
import Image from 'next/image';
import styles from './ProductFeatures.module.css';


export const ProductFeatures = () => {
  return (
    <div className={styles.container}>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
          <Image src="/images/local-two.png" alt="Made In India" width={32} height={32} />
        </div>
        <span>Made In India</span>
      </div>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
          <Image src="/images/truck.png" alt="Shipping" width={32} height={32} />
        </div>
        <span>Shipping</span>
      </div>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
          <Image src="/images/ruler.png" alt="Tailor Made" width={32} height={32} />
        </div>
        <span>Tailor Made</span>
      </div>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
          <Image src="/images/recycling-1.png" alt="Low Emission Printing" width={32} height={32} />
        </div>
        <span>Low Emission Printing</span>
      </div>
    </div>
  );
};

