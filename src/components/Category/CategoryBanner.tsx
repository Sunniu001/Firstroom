"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./CategoryBanner.module.css";

interface CategoryBannerProps {
  currentCategoryName: string;
  activeBanner: {
    tagline: string;
    description: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    sideImage: string;
    isFullImage?: boolean;
    titleAccent?: string;
    titleScript?: string;
    titleSuffix?: string;
  };
}

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  currentCategoryName,
  activeBanner,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const top = rect.top;
      const height = rect.height;
      const viewHeight = window.innerHeight;

      // Only track scroll if the banner is currently visible on the screen
      if (top < viewHeight && top + height > 0) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            // Calculate relative scroll position
            setScrollY(window.scrollY);
            ticking = false;
          });
          ticking = true;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on load to initialize position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Butter-smooth hardware accelerated scroll rate (0.3 factor translates image at 30% speed)
  const parallaxOffset = scrollY * 0.3;

  if (activeBanner.isFullImage) {
    return (
      <div ref={containerRef} className={styles.bannerContainer}>
        {/* Background Illustration with smooth translation and bleed scaling */}
        <img 
          src={activeBanner.sideImage} 
          alt={currentCategoryName} 
          className={styles.bannerBackgroundImage} 
          style={{
            transform: `translateY(${parallaxOffset}px) scale(1.15) translateZ(0)`,
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />
        
        {/* Overlaid Columns */}
        <div className={styles.bannerOverlayContent}>
          {/* Left Column: Overlaid Title Typography */}
          <div className={styles.bannerLeftCol}>
            <div className={styles.pageHeaderTitleWrapper}>
              {activeBanner.titleAccent && (
                <span className={styles.pageHeaderAccent}>
                  {activeBanner.titleAccent}
                </span>
              )}
              {activeBanner.titleScript ? (
                <h1 className={styles.pageHeaderScriptTitle}>
                  {activeBanner.titleScript}
                </h1>
              ) : (
                <h1 className={styles.pageHeaderTitle}>
                  {currentCategoryName}
                </h1>
              )}
              {activeBanner.titleSuffix && (
                <span className={styles.pageHeaderSuffix}>
                  {activeBanner.titleSuffix}
                </span>
              )}
            </div>
          </div>

          {/* Center Column: Spacer for Arch Art */}
          <div className={styles.bannerCenterCol}></div>

          {/* Right Column: Overlaid Description (Intentionally removed to keep banner layout minimalist & clean) */}
          <div className={styles.bannerRightCol}></div>
        </div>
      </div>
    );
  }

  // Minimal Fallback Banner Template
  return (
    <div 
      className={styles.bannerSection}
      style={{ 
        backgroundColor: activeBanner.backgroundColor,
        color: activeBanner.textColor
      }}
    >
      <div className={styles.bannerTextContent}>
        <span 
          className={styles.bannerTagline}
          style={{ color: activeBanner.accentColor }}
        >
          {activeBanner.tagline}
        </span>
        <h1 className={styles.bannerTitle}>
          {currentCategoryName}
        </h1>
        <p className={styles.bannerDescription}>
          {activeBanner.description}
        </p>
      </div>
      <div className={styles.bannerImageWrapper}>
        <img 
          src={activeBanner.sideImage} 
          alt={currentCategoryName} 
          className={styles.bannerImage} 
        />
      </div>
    </div>
  );
};
