'use client';

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function ContactUs() {
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

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.value = input.value.replace(/[^0-9]/g, '');
  };

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
              Contact Us
            </h1>
          </div>
        </section>

        {/* Content Section */}
        <section className={styles.contentSection}>
          <div className={styles.contentContainer}>
            {/* Left Column */}
            <div className={styles.infoColumn}>
              <div className={styles.infoBlock}>
                <h2 className={styles.sectionTitle}>Customer Care</h2>
                
                <div className={styles.contactItem}>
                  <h3 className={styles.contactLabel}>WHATSAPP</h3>
                  <a href="https://wa.me/+919650706644" className={styles.contactValue}>
                    +91 96507 06644
                  </a>
                </div>
                
                <div className={styles.contactItem}>
                  <h3 className={styles.contactLabel}>EMAIL</h3>
                  <a href="mailto:support@firstroom.in" className={styles.contactValue}>
                    support@firstroom.in
                  </a>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <h2 className={styles.sectionTitle}>Work With Us:</h2>
                <p className={styles.text}>
                  We’re open to exciting collaborations and passionate individuals to join our journey. If you’re reaching out, ensure your application includes your CV, portfolio (preferably a link), and a dose of genuine enthusiasm.
                </p>
                <p className={styles.text}>
                  Due to the high volume of applications, we’re only able to respond to candidates shortlisted for an interview.
                </p>
                <p className={styles.text}>
                  Send in your CV + updated portfolio (preferably a link) to:<br/>
                  <a href="mailto:firstroom2019@gmail.com" className={styles.linkText}>firstroom2019@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Right Column (Form) */}
            <div className={styles.formColumn}>
              <h2 className={styles.sectionTitle}>Get In Touch</h2>
              <p className={styles.text}>We’d be happy to connect with you.</p>

              <form className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <div className={styles.formRow}>
                    <input type="text" placeholder="First name" className={styles.formInput} required />
                    <input type="text" placeholder="Last name" className={styles.formInput} required />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email *</label>
                  <div className={styles.formRow}>
                    <div className={styles.inputWrapper}>
                      <input 
                        type="email" 
                        placeholder="you@company.com" 
                        className={styles.formInput} 
                        pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                        title="Please enter a valid email address (e.g., xyz@xyz.com)"
                        required 
                      />
                      <span className={styles.subLabel}>Email</span>
                    </div>
                    <div className={styles.inputWrapper}>
                      <input 
                        type="email" 
                        className={styles.formInput} 
                        pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                        title="Please enter a valid email address (e.g., xyz@xyz.com)"
                        required 
                      />
                      <span className={styles.subLabel}>Confirm Email</span>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone number</label>
                  <div className={styles.phoneGroup}>
                    <div className={styles.countryPicker}>
                      <img 
                        src="https://flagcdn.com/w20/in.png" 
                        alt="India Flag" 
                        className={styles.flagIcon} 
                      />
                      <span className={styles.countryCode}>+91</span>
                      <span className={styles.dropdownArrow}>▼</span>
                      <select 
                        className={styles.hiddenSelect}
                        onChange={(e) => {
                          const val = e.target.value;
                          const codeSpan = e.target.parentElement?.querySelector(`.${styles.countryCode}`);
                          const flagImg = e.target.parentElement?.querySelector(`.${styles.flagIcon}`) as HTMLImageElement;
                          if (codeSpan) codeSpan.textContent = val;
                          if (flagImg) {
                            const country = e.target.options[e.target.selectedIndex].getAttribute('data-country');
                            flagImg.src = `https://flagcdn.com/w20/${country}.png`;
                          }
                        }}
                      >
                        <option value="+91" data-country="in">+91 (India)</option>
                        <option value="+1" data-country="us">+1 (US)</option>
                        <option value="+44" data-country="gb">+44 (UK)</option>
                        <option value="+971" data-country="ae">+971 (UAE)</option>
                        <option value="+61" data-country="au">+61 (Australia)</option>
                        <option value="+65" data-country="sg">+65 (Singapore)</option>
                        <option value="+1" data-country="ca">+1 (Canada)</option>
                        <option value="+49" data-country="de">+49 (Germany)</option>
                        <option value="+33" data-country="fr">+33 (France)</option>
                        <option value="+81" data-country="jp">+81 (Japan)</option>
                      </select>
                    </div>
                    <input 
                      type="tel" 
                      placeholder="Phone" 
                      className={styles.phoneInput} 
                      pattern="[0-9]{10}"
                      maxLength={10}
                      onInput={handlePhoneInput}
                      title="Please enter a 10-digit phone number"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <textarea placeholder="Message" className={styles.formTextarea} rows={6}></textarea>
                </div>

                <button type="submit" className={styles.submitButton}>
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
