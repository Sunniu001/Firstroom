import React from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default async function Home() {

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground} />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Luxury Walls. Personal Stories.<br />Timeless Design.</h1>
            <p className={styles.heroSubtitle}>
              Crafted for refined interiors, our bespoke wallpapers transform blank walls into evocative expressions of identity.
            </p>
            <Link href="/category/wallpapers" passHref>
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
                src="/images/placeholder-new2-1-e1774865047238.webp"
                alt="Plant illustration"
                className={styles.featureIllustration}
              />
            </div>
            <div className={`${styles.featureImageWrapper} ${styles.featureImageRight}`}>
              <img
                src="/images/cultural-motifs-detail-1536x864.webp"
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
            <Link href="/category/wallpapers" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="/images/wallpaper-1536x1536.webp" alt="Wallpaper" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>WALLPAPER</span>
            </Link>
            <Link href="/category/nameplate" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="/images/Name-plate-1536x1536.webp" alt="Nameplate" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>NAMEPLATE</span>
            </Link>
            <Link href="/category/desk-quote" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="/images/Desk-deco-1536x1536.webp" alt="Desk Decor" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>DESK DECOR</span>
            </Link>
          </div>

          <div className={styles.categoryGrid} style={{ marginTop: '40px' }}>
            <Link href="/category/decals" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="/images/Decals-1536x1536.webp" alt="Decals" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>DECALS</span>
            </Link>
            <Link href="/category/frame" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="/images/Frame-1536x1536.webp" alt="Frames" className={styles.categoryImage} />
              </div>
              <span className={styles.categoryLabel}>FRAMES</span>
            </Link>
            <Link href="/category/kids-wallpaper" className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src="/images/kids-wallpaper-1536x1536.webp" alt="Kids Wallpaper" className={styles.categoryImage} />
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
                src="/images/themes-rooted-1536x864.webp"
                alt="Heritage themed wallpaper"
                className={styles.featureImage}
              />
            </div>
            <div className={`${styles.featureContent} ${styles.featureContentRight}`}>
              <h2 className={styles.featureTitle}>Themes Rooted In Heritage</h2>
              <p className={styles.featureText}>
                Inspired by royal courts, sacred temples, and Mughal gardens, our themed wallpapers are deeply evocative. Designed exclusively for you, each piece reflects personal meaning crafted with a level of customisation rarely found elsewhere. Every element, from colour palette to scale and layout is tailored to harmonise with your space. Whether it's a statement wall or a full room narrative, we bring your vision to life with artistic precision.
              </p>
              <img
                src="/images/placeholder2.webp"
                alt="Deer illustration"
                className={styles.featureIllustration}
              />
            </div>
          </div>
        </section>

        {/* Section 5: Video Section */}
        <section className={styles.videoSection}>
          <h2 className={styles.videoTitle}>When Your Vision Become Your Space</h2>
          <div className={styles.videoWrapper}>
            <iframe
              className={styles.videoIframe}
              src="https://www.youtube.com/embed/hGp2mkVjb7U?autoplay=1&mute=1&loop=1&playlist=hGp2mkVjb7U&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
              title="First Room Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </section>

      </main>
    </div>
  );
}
