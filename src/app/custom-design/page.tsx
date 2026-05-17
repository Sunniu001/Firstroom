"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function CustomDesign() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSlide2, setCurrentSlide2] = useState(0);
  const [currentSlide3, setCurrentSlide3] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const PROCESS_STEPS = [
    {
      image: "/images/Personal-Consultation-scaled.webp",
      title: "Personal Consultation",
      desc: "A collaborative session where we explore your story, aesthetic preferences, and vision to establish a profound design direction."
    },
    {
      image: "/images/Thoughtful-Ideation-Visual-Detailing-scaled.webp",
      title: "Thoughtful Ideation & Detailing",
      desc: "Transforming insights into highly curated mood boards, hand sketches, and elaborate space concepts crafted specifically for your walls."
    },
    {
      image: "/images/Hand-Painted-Motiffs-copy-scaled.webp",
      title: "Hand-Painted Originals",
      desc: "Our master artists create bespoke murals and motifs by hand, capturing details and textures that standard digital designs cannot replicate."
    },
    {
      image: "/images/Customized-Design-Concepts-scaled.webp",
      title: "Customised Design Concepts",
      desc: "Refining select designs to fit your exact wall dimensions, color schemas, and architectural boundaries with digital precision."
    },
    {
      image: "/images/Collaborated-Installations-scaled.webp",
      title: "Collaborated Installation",
      desc: "Working hand-in-hand with professional installers to guarantee that the final execution fits seamlessly, effortlessly, and beautifully."
    }
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const track = scrollRef.current;
    const scrollPosition = track.scrollLeft;
    const firstChild = track.firstElementChild as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.clientWidth + 24; // Card width + gap (1.5rem = 24px)
    const index = Math.round(scrollPosition / cardWidth);
    if (index >= 0 && index < PROCESS_STEPS.length) {
      setActiveStep(index);
    }
  };

  const scrollToStep = (index: number) => {
    if (!scrollRef.current) return;
    const track = scrollRef.current;
    const firstChild = track.firstElementChild as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.clientWidth + 24;
    track.scrollTo({
      left: index * cardWidth,
      behavior: "smooth"
    });
    setActiveStep(index);
  };
  
  const slides = [
    "/images/sd.webp",
    "/images/Untitled-1.webp"
  ];

  const slides2 = [
    "/images/1.-1-scaled.webp",
    "/images/2-1-1-scaled.webp",
    "/images/3.-1-scaled.webp"
  ];

  const slides3 = [
    "/images/detail-in-every-dimension-1.webp"
  ];

  useEffect(() => {
    const handleScrollEvent = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScrollEvent, { passive: true });

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    const timer2 = setInterval(() => {
      setCurrentSlide2((prev) => (prev + 1) % slides2.length);
    }, 4500);
    const timer3 = setInterval(() => {
      setCurrentSlide3((prev) => (prev + 1) % slides3.length);
    }, 5000);
    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
      clearInterval(timer);
      clearInterval(timer2);
      clearInterval(timer3);
    };
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Video Hero Section */}
        <section className={styles.videoHero}>
          <video 
            className={styles.heroVideo}
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/images/Custom%20Page%20Hero%20Video.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroOverlay}>
            <h1 
              className={styles.heroTitle}
              style={{
                transform: `translateY(${scrollY * 0.35}px)`,
                opacity: Math.max(0, 1 - scrollY / 400),
                transition: "transform 0.1s ease-out, opacity 0.1s ease-out"
              }}
            >
              Designing The First Room Of Your Story.
            </h1>
          </div>
        </section>

        <section className={styles.headerSection}>
          <h2 className={styles.title}>The First Chapter of Your Space</h2>
          <p className={styles.text}>
            At First Room Collective, we believe design is more than a visual, it’s a deeply personal journey. Every custom piece we create is rooted in your story, your space, and your dreams. Just like new beginnings deserve something special, your space with us becomes a canvas of personal expression. Whether it’s a wallpaper that mirrors your mood, a frame that holds your memory, or a nameplate that truly belongs —each design is uniquely yours. Together, we shape spaces with meaning, weaving identity, emotion, and imagination into corners you’ll cherish every day.
          </p>
          <div className={styles.headerActions}>
            <Link href="/about-us" className={styles.outlineButton}>
              KNOW ABOUT US
            </Link>
          </div>

          <div className={styles.processRow} ref={scrollRef} onScroll={handleScroll}>
            <div className={styles.processItem}>
              <div className={styles.processImageWrapper}>
                <img src="/images/Personal-Consultation-scaled.webp" alt="Personal Consultation" />
              </div>
              <span className={styles.processLabel}>Personal Consultation</span>
            </div>
            <div className={styles.processItem}>
              <div className={styles.processImageWrapper}>
                <img src="/images/Thoughtful-Ideation-Visual-Detailing-scaled.webp" alt="Thoughtful Ideation" />
              </div>
              <span className={styles.processLabel}>Thoughtful Ideation & Visual Detailing</span>
            </div>
            <div className={styles.processItem}>
              <div className={styles.processImageWrapper}>
                <img src="/images/Hand-Painted-Motiffs-copy-scaled.webp" alt="Hand-Painted Originals" />
              </div>
              <span className={styles.processLabel}>Hand-Painted Originals</span>
            </div>
            <div className={styles.processItem}>
              <div className={styles.processImageWrapper}>
                <img src="/images/Customized-Design-Concepts-scaled.webp" alt="Customised Design Concepts" />
              </div>
              <span className={styles.processLabel}>Customised Design Concepts</span>
            </div>
            <div className={styles.processItem}>
              <div className={styles.processImageWrapper}>
                <img src="/images/Collaborated-Installations-scaled.webp" alt="Collaborated Installation" />
              </div>
              <span className={styles.processLabel}>Collaborated Installation</span>
            </div>
          </div>

          {/* Responsive slider dots for mobile viewports */}
          <div className={styles.dotsWrapper}>
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                className={`${styles.sliderDot} ${activeStep === idx ? styles.activeDot : ""}`}
                onClick={() => scrollToStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.featureBlock}>
            <div className={styles.sliderContainer}>
              {slides.map((slide, index) => (
                <div 
                  key={index} 
                  className={`${styles.slide} ${currentSlide === index ? styles.slideActive : ""}`}
                >
                  <img src={slide} alt={`Motifs and Mediums ${index + 1}`} className={styles.featureImage} />
                </div>
              ))}
              <div className={styles.sliderDots}>
                {slides.map((_, index) => (
                  <button 
                    key={index} 
                    className={`${styles.dot} ${currentSlide === index ? styles.dotActive : ""}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Motifs <i>&</i> Mediums</h2>
              <p className={styles.text}>
                We bring stories to life using Indian art-inspired hand-painted and printed motifs. From wallpaper to frames to nameplates, every design draws from timeless craft techniques, reimagined for modern homes. We explore forms like block printing, tribal art, and miniature styles to add richness and variety. Each detail is a tribute to heritage, storytelling, and the visual poetry of our culture.
              </p>
              <div className={styles.decorativeIllustration}>
                <img src="/images/placeholder-new1-e1774856594602.webp" alt="Landscape Decoration" />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.featureBlock}>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Crafted Just For You</h2>
              <p className={styles.text}>
                No two stories are the same and neither are our designs. Our team takes time to understand your vision, quirks, and desires. With brushstrokes tailored to your world, we craft pieces that are truly one-of-a-kind. Whether it’s a nameplate, mural, or quote frame, your essence guides every stroke. A personalised design experience made just for you, from the heart.
              </p>
              <div className={styles.decorativeIllustration}>
                <img src="/images/placeholder-new2-e1774857051773.webp" alt="Landscape Decoration" />
              </div>
            </div>
            <div className={styles.sliderContainer}>
              {slides2.map((slide, index) => (
                <div 
                  key={index} 
                  className={`${styles.slide} ${currentSlide2 === index ? styles.slideActive : ""}`}
                >
                  <img src={slide} alt={`Crafted Just For You ${index + 1}`} className={styles.featureImage} />
                </div>
              ))}
              <div className={styles.sliderDots}>
                {slides2.map((_, index) => (
                  <button 
                    key={index} 
                    className={`${styles.dot} ${currentSlide2 === index ? styles.dotActive : ""}`}
                    onClick={() => setCurrentSlide2(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.featureBlock}>
            <div className={styles.sliderContainer}>
              {slides3.map((slide, index) => (
                <div 
                  key={index} 
                  className={`${styles.slide} ${currentSlide3 === index ? styles.slideActive : ""}`}
                >
                  <img src={slide} alt={`Detail in Every Dimension ${index + 1}`} className={styles.featureImage} />
                </div>
              ))}
              {slides3.length > 1 && (
                <div className={styles.sliderDots}>
                  {slides3.map((_, index) => (
                    <button 
                      key={index} 
                      className={`${styles.dot} ${currentSlide3 === index ? styles.dotActive : ""}`}
                      onClick={() => setCurrentSlide3(index)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Detail In Every Dimension</h2>
              <p className={styles.text}>
                We offer a rich blend of materials, finishes, and artistic styles to bring your vision to life. Choose from feather-textured, leather-finished wallpapers, or hand-painted wooden frames and quotes. Our process spans mediums like watercolour, acrylic, charcoal, micron, and textured painting. Many of our frames feature hand-beadwork, zari accents, and fine thread embroidery—each element carefully chosen to elevate your space with depth, character, and craft. Sustainability meets beauty as we blend traditional techniques with new textures for a finish that feels both thoughtful and timeless.
              </p>
              <div className={`${styles.decorativeIllustration} ${styles.decorativeIllustrationNegative}`}>
                <img src="/images/placeholder-4-e1774857320896.webp" alt="Landscape Decoration" />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.imageGridSection}>
          <div className={styles.imageGrid}>
            <div className={styles.gridItem}>
              <img src="/images/1-1.webp" alt="Design Process 1" />
            </div>
            <div className={styles.gridItem}>
              <img src="/images/2-2.webp" alt="Design Process 2" />
            </div>
            <div className={styles.gridItem}>
              <img src="/images/3-1.webp" alt="Design Process 3" />
            </div>
          </div>
        </section>

        <section className={styles.finalCtaSection}>
          <h2 className={styles.finalCtaTitle}>Let Our Design Narrate Your Story.</h2>
          <a href="https://api.whatsapp.com/send/?phone=%2B919650706644&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className={styles.outlineButton}>
            CONNECT TO US
          </a>
        </section>
      </main>
    </div>
  );
}
