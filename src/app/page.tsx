import React from "react";
import styles from "./page.module.css";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import Link from "next/link";

export default async function Home() {

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <img 
            src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=2000" 
            alt="Red luxury room with green sofas" 
            className={styles.heroBackground}
          />
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Luxury Walls. Personal Stories.<br />Timeless Design.</h1>
            <p className={styles.heroSubtitle}>
              Crafted for refined interiors, our bespoke wallpapers transform blank walls into evocative expressions of identity.
            </p>
            <Link href="/products" passHref>
              <button className={styles.heroButton}>SHOP NOW</button>
            </Link>
          </div>
        </section>

        {/* Feature Split Block 1: Text Left, Image Right */}
        <section className={styles.section}>
          <div className={styles.featureBlock}>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Cultural Motifs, Modern Aesthetic</h2>
              <p className={styles.featureText}>
                Our collections blend timeless Indian art with contemporary design sensibilities ideal for today's sophisticated spaces. From concept to execution, we tailor each pattern to your vision, turning your walls into curated storytelling surfaces. We offer decor for every corner of your home, adding personality, depth, and meaning to every detail.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=200" 
                alt="Plant illustration" 
                className={styles.featureIllustration}
              />
            </div>
            <div className={`${styles.featureImageWrapper} ${styles.featureImageRight}`}>
              <img 
                src="https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&q=80&w=1200" 
                alt="Floral wallpaper interior" 
                className={styles.featureImage} 
              />
            </div>
          </div>
        </section>

        {/* Category Grid Section */}
        <section className={styles.categorySection}>
          <h2 className={styles.categorySectionTitle}>Artful Accents For Homes Of Distinctive Taste</h2>
          
          <div className={styles.categoryGrid}>
            <Link href="/category/wallpaper" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800" alt="Wallpaper" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>WALLPAPER</span>
            </Link>
            <Link href="/category/nameplate" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800" alt="Nameplate" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>NAMEPLATE</span>
            </Link>
            <Link href="/category/desk-decor" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="https://images.unsplash.com/photo-1497942304796-b8bc2cc898f3?auto=format&fit=crop&q=80&w=800" alt="Desk Decor" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>DESK DECOR</span>
            </Link>
          </div>
          
          <div className={styles.categoryGrid} style={{ marginTop: '40px' }}>
            <Link href="/category/decals" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800" alt="Decals" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>DECALS</span>
            </Link>
            <Link href="/category/frames" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800" alt="Frames" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>FRAMES</span>
            </Link>
            <Link href="/category/kids-wallpaper" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800" alt="Kids Wallpaper" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>KIDS WALLPAPER</span>
            </Link>
          </div>
        </section>

        {/* Feature Split Block 2: Image Left, Text Right */}
        <section className={styles.section}>
          <div className={styles.featureBlock}>
            <div className={`${styles.featureImageWrapper} ${styles.featureImageLeft}`}>
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200" 
                alt="Heritage themed wallpaper" 
                className={styles.featureImage} 
              />
            </div>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Themes Rooted In Heritage</h2>
              <p className={styles.featureText}>
                Inspired by royal courts, sacred temples, and Mughal gardens, our themed wallpapers are deeply evocative. Designed exclusively for you, each piece reflects personal meaning crafted with a level of customisation rarely found elsewhere. Every element, from colour palette to scale and layout is tailored to harmonise with your space. Whether it's a statement wall or a full room narrative, we bring your vision to life with artistic precision.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1484406560908-6f62b70f0653?auto=format&fit=crop&q=80&w=200" 
                alt="Deer illustration" 
                className={styles.featureIllustration}
              />
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
