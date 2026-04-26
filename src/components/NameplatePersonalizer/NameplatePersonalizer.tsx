import React, { useState } from 'react';
import styles from './NameplatePersonalizer.module.css';

export interface NameplateData {
  name: string;
  font: string;
}

interface NameplatePersonalizerProps {
  productImage: string;
  nameplateMeta?: {
    box: { x: number; y: number; w: number; h: number };
    bg: string;
    textColor: 'dark' | 'light';
  };
  data: NameplateData;
  onChange: (data: NameplateData) => void;
}

const FONTS = [
  { label: 'Apricot', value: "'Dancing Script', cursive" },
  { label: 'Dreambig', value: "'Pacifico', cursive" },
  { label: 'Vintage Lander', value: "'Playball', cursive" },
  { label: 'Ballerina', value: "'Alex Brush', cursive" },
  { label: 'Sweet Chocolate', value: "'Caveat', cursive" },
  { label: 'Hello', value: "'Satisfy', cursive" },
  { label: 'Riviera', value: "'Sacramento', cursive" },
  { label: 'Signatra', value: "'Yellowtail', cursive" },
];

export const NameplatePersonalizer: React.FC<NameplatePersonalizerProps> = ({
  productImage,
  nameplateMeta,
  data,
  onChange,
}) => {
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, 20); // enforce max 20 chars
    onChange({ ...data, name: newName });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...data, font: e.target.value });
  };

  const displayName = data.name.trim() || 'Your Name';

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Personalize Your Nameplate</h2>
      
      <div className={styles.controlsRow}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Enter Name</span>
            <span className={styles.charCount}>({data.name.length}/20)</span>
          </div>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Type name here..." 
            value={data.name} 
            onChange={handleNameChange}
            maxLength={20}
          />
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Choose Font</span>
          </div>
          <select 
            className={styles.select} 
            value={data.font} 
            onChange={handleFontChange}
          >
            {FONTS.map(font => (
              <option key={font.label} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.mockupContainer}>
        <img 
          src={productImage} 
          alt="Nameplate Preview" 
          className={styles.mockupImage} 
          onLoad={(e) => {
            setNaturalDims({ 
              w: e.currentTarget.naturalWidth, 
              h: e.currentTarget.naturalHeight 
            });
          }}
        />
        <div 
          className={styles.mockupTextOverlay} 
          style={{ 
            fontFamily: data.font,
            // If we have meta coordinates and the image has loaded, position absolutely based on percentages.
            ...(nameplateMeta && naturalDims ? {
              top: `${(nameplateMeta.box.y / naturalDims.h) * 100}%`,
              left: `${(nameplateMeta.box.x / naturalDims.w) * 100}%`,
              width: `${(nameplateMeta.box.w / naturalDims.w) * 100}%`,
              height: `${(nameplateMeta.box.h / naturalDims.h) * 100}%`,
              color: nameplateMeta.textColor === 'light' ? '#ffffff' : '#1a1a1a',
              textShadow: nameplateMeta.textColor === 'light' 
                ? '1px 1px 0 #ccc, 2px 2px 0 #bbb, 3px 3px 4px rgba(0,0,0,0.3)'
                : '1px 1px 0 #555, 2px 2px 0 #444, 3px 3px 4px rgba(0,0,0,0.4)',
              transform: 'none', // Reset default perspective if we have real coordinates
            } : {})
          }}
        >
          {displayName}
        </div>
      </div>
      <p className={styles.disclaimer}>Preview is approximate. Final result may vary.</p>
    </div>
  );
};
