import React from "react";
import styles from "./page.module.css";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";

export default function OurStory() {
  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Nature-Inspired Designs, Handcrafted with Care</h1>
          <p className={styles.text}>
            At First Room Collective, every creation begins with intention. Inspired by the quiet beauty of nature and the poetry of everyday moments, our designs celebrate the richness of Indian craftsmanship while embracing contemporary elegance. From hand-painted wallpapers to bespoke frames, each piece is thoughtfully crafted to feel personal, timeless, and deeply connected to your story.
          </p>
        </section>

        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.featureBlock}>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>About the Founders</h2>
              <p className={styles.text}>
                First Room Collective was co-founded by Dharya Gambhir and Ranjana Gambhir, two creative minds whose backgrounds span design, interiors, architecture, fashion, and brand strategy. United by a shared vision, they set out to create spaces that feel soulful, personal, and deeply connected to culture.
              </p>
              <p className={styles.text}>
                For them, a home is more than a space—it is a sanctuary and a reflection of identity. Drawing inspiration from India’s rich artistic heritage and collaborating with master artisans across the country, their work celebrates handcrafted techniques, intricate motifs, and the timeless art of storytelling through design.
              </p>
              <p className={styles.text}>
                What began as a response to the absence of emotionally resonant décor has grown into a pursuit of mindful, slow design—where every creation is thoughtfully crafted to honour tradition while bringing meaning, beauty, and individuality to the spaces we live in.
              </p>
            </div>
            <div className={`${styles.featureImageWrapper} ${styles.featureImageRight}`}>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200" 
                alt="About the founders" 
                className={styles.featureImage} 
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.headerSection} style={{ padding: '0 0 60px 0' }}>
            <h2 className={styles.title}>Our Brand Philosophy</h2>
          </div>
          
          <div className={styles.featureBlock} style={{ marginBottom: '80px' }}>
            <div className={styles.featureImageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=1200" 
                alt="Personal designs" 
                className={styles.featureImage} 
              />
            </div>
            <div className={styles.featureContent}>
              <p className={styles.text}>
                At First Room Collective, we believe every design carries a story—and every story begins with you. The way you live, dream, and express yourself becomes the starting point of our creative process. Through thoughtful craftsmanship and meaningful detail, we translate these emotions into pieces that feel personal, timeless, and deeply connected to the spaces you call home.
              </p>
              <p className={styles.text}>
                Every design begins with listening. We approach each project with care and empathy, ensuring that every interaction—whether online or in conversation—feels personal, thoughtful, and reassuring.
              </p>
            </div>
          </div>

          <div className={styles.featureBlock}>
            <div className={styles.featureContent}>
              <p className={styles.text}>
                Our work draws from India’s rich artistic traditions—Pichwai, Mughal, Gond, temple architecture, and more—reimagined through a contemporary lens to create designs that feel layered, timeless, and culturally rooted.
              </p>
              <p className={styles.text}>
                Every home carries its own story. Through close collaboration with our artists, your ideas and inspirations are transformed into bespoke designs that feel deeply personal and uniquely yours.
              </p>
              <p className={styles.text}>
                True comfort lies in how a space makes you feel. Through gentle colours, thoughtful materials, and balanced compositions, we create pieces that bring warmth, calm, and a quiet sense of belonging.
              </p>
            </div>
            <div className={`${styles.featureImageWrapper} ${styles.featureImageRight}`}>
              <img 
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200" 
                alt="Artistic traditions" 
                className={styles.featureImage} 
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
