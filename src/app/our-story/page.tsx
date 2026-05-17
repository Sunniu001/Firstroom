"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { StoryAccordion } from "./StoryAccordion";

export default function OurStory() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBg} />
          <div className={styles.heroOverlay}>
            <h1 
              className={styles.heroTitle}
              style={{
                transform: `translateY(${scrollY * 0.35}px)`,
                opacity: Math.max(0, 1 - scrollY / 300),
                transition: "transform 0.1s ease-out, opacity 0.1s ease-out"
              }}
            >
              About Us
            </h1>
          </div>
        </section>

        {/* Intro Section */}
        <section className={styles.introSection}>
          <h2 className={styles.introTitle}>Nature-Inspired Designs, Handcrafted With Care</h2>
          <p className={styles.introText}>
            At <strong>First Room Collective</strong>, every creation begins with intention. Inspired by the quiet beauty of nature and the poetry of everyday moments, our designs celebrate the richness of Indian craftsmanship while embracing contemporary elegance. From hand-painted wallpapers to bespoke frames, each piece is thoughtfully crafted to feel personal, timeless, and deeply connected to your story.
          </p>
        </section>

        {/* Founders Section */}
        <section className={styles.foundersSection}>
          <div className={styles.foundersContainer}>
            <div className={styles.foundersImageWrapper}>
              <Image
                src="/images/About-the-founders-e1774381222621.webp"
                alt="About the founders"
                fill
                className={styles.imageFitTop}
              />
            </div>
            <div className={styles.foundersContent}>
              <h2 className={styles.sectionTitleLeft}>About The Founders</h2>
              <p className={styles.text}>
                <strong>First Room Collective</strong> was co-founded by <strong>Dharya Gambhir and Ranjana Gambhir</strong>, two creative minds whose backgrounds span design, interiors, architecture, fashion, and brand strategy. United by a shared vision, they set out to create spaces that feel soulful, personal, and deeply connected to culture.
              </p>
              <p className={styles.text}>
                For them, a home is more than a space—it is a sanctuary and a reflection of identity. Drawing inspiration from India’s rich artistic heritage and collaborating with master artisans across the country, their work celebrates handcrafted techniques, intricate motifs, and the timeless art of storytelling through design.
              </p>
              <p className={styles.text}>
                What began as a response to the absence of emotionally resonant décor has grown into a pursuit of <strong>mindful, slow design</strong>—where every creation is thoughtfully crafted to honour tradition while bringing meaning, beauty, and individuality to the spaces we live in.
              </p>
            </div>
          </div>
        </section>

        {/* Tradition Section */}
        <section className={styles.traditionSection}>
          <h2 className={styles.sectionTitleCenter}>Tradition In Every Thread</h2>
          <div className={styles.traditionImageWrapper}>
            <Image
              src="/images/Tradition-in-every-thread-Moodboard-1-1024x779.webp"
              alt="Tradition In Every Thread Moodboard"
              fill
              className={styles.imageFitContain}
            />
          </div>
        </section>

        {/* Philosophy Section */}
        <section className={styles.philosophySection}>
          <h2 className={styles.sectionTitleCenter}>Our Brand Philosophy</h2>
          <p className={styles.philosophyIntroText}>
            At <strong>First Room Collective</strong>, we believe every design carries a story—and every story begins with you. The way you live, dream, and express yourself becomes the starting point of our creative process. Through thoughtful craftsmanship and meaningful detail, we translate these emotions into pieces that feel personal, timeless, and deeply connected to the spaces you call home.
          </p>
          <div className={styles.philosophyImages}>
            <div className={styles.philosophyImageWrapper}>
              <Image
                src="/images/Our-Brand-Philosophy1.webp"
                alt="Our Brand Philosophy - Hand painted motifs"
                fill
                className={styles.imageFit}
              />
            </div>
            <div className={styles.philosophyImageWrapper}>
              <Image
                src="/images/Our-Brand-Philosophy-2.webp"
                alt="Our Brand Philosophy - Color selection"
                fill
                className={styles.imageFit}
              />
            </div>
          </div>
          
          <StoryAccordion />
        </section>
      </main>
    </div>
  );
}
