import React from "react";
import styles from "./page.module.css";

export default function ContactUs() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Get in touch</h1>
          <p className={styles.text}>
            We’d be happy to connect with you.
          </p>
        </section>

        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.featureBlock}>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Customer Care</h2>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', marginBottom: '8px' }}>WhatsApp</h3>
                <a href="https://wa.me/+919650706644" className={styles.text} style={{ textDecoration: 'none', color: 'var(--accent-color)' }}>
                  +91 96507 06644
                </a>
              </div>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', marginBottom: '8px' }}>Email</h3>
                <a href="mailto:support@firstroom.in" className={styles.text} style={{ textDecoration: 'none', color: 'var(--accent-color)' }}>
                  support@firstroom.in
                </a>
              </div>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', marginBottom: '8px' }}>Studio</h3>
                <p className={styles.text}>
                  A10, Greenwood City, Sector 45, Gurugram, Haryana 122003
                </p>
              </div>
            </div>
            
            <div className={`${styles.featureImageWrapper} ${styles.featureImageRight}`}>
              <img 
                src="https://images.unsplash.com/photo-1593642532744-d377ab507dc8?auto=format&fit=crop&q=80&w=1200" 
                alt="Contact us" 
                className={styles.featureImage} 
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.featureBlock}>
            <div className={styles.featureImageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200" 
                alt="Work with us" 
                className={styles.featureImage} 
              />
            </div>
            <div className={styles.featureContent}>
              <h2 className={styles.featureTitle}>Work with us</h2>
              <p className={styles.text}>
                We’re open to exciting collaborations and passionate individuals to join our journey. If you’re reaching out, ensure your application includes your CV, portfolio (preferably a link), and a dose of genuine enthusiasm.
              </p>
              <p className={styles.text}>
                Due to the high volume of applications, we’re only able to respond to candidates shortlisted for an interview.
              </p>
              <p className={styles.text}>
                Send in your CV + updated portfolio (preferably a link) to:
              </p>
              <a href="mailto:firstroom2019@gmail.com" className={styles.button}>
                EMAIL US
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
