import React from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function CustomDesign() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>The First Chapter of Your Space</h1>
          <p className={styles.text}>
            At First Room Collective, we believe design is more than a visual, it’s a deeply personal journey. Every custom piece we create is rooted in your story, your space, and your dreams. Just like new beginnings deserve something special, your space with us becomes a canvas of personal expression.
          </p>
          <p className={styles.text}>
            Whether it’s a wallpaper that mirrors your mood, a frame that holds your memory, or a nameplate that truly belongs —each design is uniquely yours. Together, we shape spaces with meaning, weaving identity, emotion, and imagination into corners you’ll cherish every day.
          </p>
          <Link href="/about-us" className={styles.button}>
            KNOW ABOUT US
          </Link>
        </section>

        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.featureBlock}>
            <div className={`${styles.featureImageWrapper} ${styles.featureImageRight}`}>
              <img 
                src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1200" 
                alt="Custom Motif Design" 
                className={styles.featureImage} 
              />
            </div>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Motifs & Mediums</h2>
              <p className={styles.text}>
                We bring stories to life using Indian art-inspired hand-painted and printed motifs. From wallpaper to frames to nameplates, every design draws from timeless craft techniques, reimagined for modern homes. We explore forms like block printing, tribal art, and miniature styles to add richness and variety. Each detail is a tribute to heritage, storytelling, and the visual poetry of our culture.
              </p>
              <p className={styles.text}>
                No two stories are the same and neither are our designs. Our team takes time to understand your vision, quirks, and desires. With brushstrokes tailored to your world, we craft pieces that are truly one-of-a-kind. Whether it’s a nameplate, mural, or quote frame, your essence guides every stroke. A personalised design experience made just for you, from the heart.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.featureBlock}>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Detail in Every Dimension</h2>
              <p className={styles.text}>
                We offer a rich blend of materials, finishes, and artistic styles to bring your vision to life. Choose from feather-textured, leather-finished wallpapers, or hand-painted wooden frames and quotes. Our process spans mediums like watercolour, acrylic, charcoal, micron, and textured painting. 
              </p>
              <p className={styles.text}>
                Many of our frames feature hand-beadwork, zari accents, and fine thread embroidery—each element carefully chosen to elevate your space with depth, character, and craft. Sustainability meets beauty as we blend traditional techniques with new textures for a finish that feels both thoughtful and timeless.
              </p>
              <a href="https://wa.me/+919650706644" target="_blank" rel="noopener noreferrer" className={styles.button}>
                CONNECT TO US
              </a>
            </div>
            <div className={styles.featureImageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" 
                alt="Detail in Dimension" 
                className={styles.featureImage} 
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
