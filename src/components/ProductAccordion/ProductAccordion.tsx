'use client';
import React, { useState } from 'react';
import styles from './ProductAccordion.module.css';

interface ProductAccordionProps {
  description: string;
  categories: string[];
}

const CATEGORY_DATA = {
  wallpaper: {
    details: `Material:
Non-woven wallpaper (non-self-adhesive)
Panels:
Printed in multiple parts; number of panels varies as per wall size
Print:
Digitally printed using eco-conscious, child-safe inks
Installation:
Requires professional installation
We do not provide installation services at all locations
Contact customer care for recommended independent installers
Seamless joints after proper installation
Best Surface Application:
Smooth indoor walls, MDF panels, or wooden surfaces
Oil-based paint or primer must be applied at least 5 days before installation
Not suitable for outdoor areas or direct sunlight
Manufactured & Marketed by:
First Room Collectives
A10, Block A, Greenwood City, Sector 45, Gurugram – 122003, Haryana, India
firstroom2019@gmail.com
+91 96507 06644`,
    shipping: `Shipping Timeline:
Dispatched within 3-5 Days
Shipping 7 - 10 working days (domestic)
Refer to Shipping Policy

Care Instructions:
Wipe gently using a damp cloth or sponge
No detergents or harsh chemicals
Do not scrub or over-clean
Environmental factors may affect durability

Packaging:
Packed safely with minimal or recyclable plastic to protect the product during delivery`,
    zeroWaste: `- All wallpapers are made to order
- Production waste is responsibly managed to avoid landfill
- Returns are not accepted
- Please refer to our Terms & Conditions

Note: Slight color variations from display images may occur`
  },
  decal: {
    details: `Size:
Refer to product image for approximate dimensions in inches
Material:
High-quality vinyl
Print:
Digitally printed using non-toxic, child-safe inks
Quantity:
Each set contains one decal
Installation:
Comes with adhesive backing for easy DIY application
Installation guide available via link
Manufactured & Marketed by:
First Room Collectives
A10, Block A, Greenwood City, Sector 45, Gurugram – 122003, Haryana, India
firstroom2019@gmail.com
+91 96507 06644`,
    shipping: `Shipping Timeline:
Dispatched within 3-5 Days
Shipping 7 - 10 working days (domestic)
Refer to Shipping Policy

Care Instructions:
Wipe gently with a damp cloth
Avoid chemical-based cleaning
Do not scrub

Packaging:
Securely packed with minimal, recyclable plastic`,
    zeroWaste: `- Made to order with zero landfill waste
- Decals are not returnable
- Please refer to Terms & Conditions

Note: Slight design or color differences may appear due to screen or printing variation`
  },
  frame: {
    details: `Size:
Refer to second product image for approximate dimensions
Material:
Cotton canvas
Design:
Original hand-drawn motifs, digitally printed using eco-safe inks
Installation:
Ready-to-hang with wall hooks
Self-installation
Best Use:
For indoor areas protected from direct sunlight or weather
Manufactured & Marketed by:
First Room Collectives
A10, Block A, Greenwood City, Sector 45, Gurugram – 122003, Haryana, India
firstroom2019@gmail.com
+91 96507 06644`,
    shipping: `Shipping Timeline:
Dispatched within 3-5 Days
Shipping 7 - 10 working days (domestic)
Refer to Shipping Policy

Care Instructions:
Wipe gently with a soft, damp cloth
Do not use soap, chemical cleaners, or scrub the surface

Packaging:
Lovingly packed with minimal, recyclable plastic for safe transit`,
    zeroWaste: `- Every frame is made to order
- We ensure waste is managed responsibly
- Returns are not accepted
- Please refer to Terms & Conditions

Note: Minor visual variations from sample images may occur`
  },
  nameplate: {
    details: `Material:
Pine wood frame, solid acrylic base, vinyl print, raised acrylic letters
Size Options:
17 x 8 inches
12 x 5 inches (as selected during order)
Finish:
Digitally printed using long-lasting, eco-safe inks
Installation:
Comes with mounting hardware
Ready for easy self-installation
Best Use:
Suitable for indoor or semi-covered outdoor spaces, away from harsh weather
Manufactured & Marketed by:
First Room Collectives
A10, Block A, Greenwood City, Sector 45, Gurugram – 122003, Haryana, India
firstroom2019@gmail.com
+91 96507 06644`,
    shipping: `Shipping Timeline:
Dispatched within 3-5 Days
Shipping 7 - 10 working days (domestic)
Refer to Shipping Policy

Care Instructions:
Wipe gently with a soft, damp cloth
Do not use soap, harsh cleaners, or scrub
Avoid exposure to direct sunlight or water

Packaging:
Carefully packed using minimal or recyclable plastic to ensure safe delivery`,
    zeroWaste: `- Name plates are made to order
- All waste is disposed of responsibly, contributing zero to landfills
- Returns not accepted
- Refer to our Terms & Conditions

Note: Handcrafted nature may lead to slight variations in finish`
  },
  deskquote: {
    details: `Material:
Crafted from high-density, moisture-resistant MDF with a hand-deco painted finish.
Laser-cut acrylic letters are used for a clean, modern aesthetic with a tactile dimension.

Finish:
Smooth matte surface with precise, layered lettering in premium acrylic.

Installation:
Free-standing design — no installation required.
Ideal for desks, shelves, or display units in indoor environments.

Best Use:
For indoor spaces such as workstations, study tables, or decorative shelves, away from direct sunlight or moisture exposure.

Manufactured & Marketed by:
First Room Collective
A10, Block A, Greenwood City, Sector 45, Gurugram – 122003, Haryana, India
firstroom2019@gmail.com
+91 96507 06644`,
    shipping: `Shipping Timeline:
Dispatched within 3-5 Days
Shipping 7 - 10 working days (domestic)
Refer to our detailed Shipping Policy for more information.

Care Instructions:
Wipe gently with a soft, dry or slightly damp cloth
Do not use soap, cleaning chemicals, or abrasive materials
Avoid prolonged exposure to direct sunlight or moisture

Packaging:
Each Desk Quote is securely packed with care using minimal or recyclable plastic to ensure it reaches you safely and in perfect condition.`,
    zeroWaste: `- All Desk Quotes are made to order, ensuring minimal overproduction.
- We responsibly manage and dispose of production waste to ensure nothing reaches landfills.
- This product is not eligible for returns — please refer to our Terms & Conditions for more.

Note: Each product is handcrafted and may show slight variations in finish — these are natural and part of its unique charm.`
  }
};

const renderFormattedText = (text: string) => {
  return (
    <div className={styles.formattedText}>
      {text.split('\n').map((line, idx) => {
        const isHeader = line.endsWith(':') || line === 'Zero Waste Initiative';
        return (
          <span 
            key={idx} 
            className={isHeader ? styles.textHeader : styles.textLine}
          >
            {line}
          </span>
        );
      })}
    </div>
  );
};

export const ProductAccordion: React.FC<ProductAccordionProps> = ({ description, categories }) => {
  const [openTab, setOpenTab] = useState<string>('Details');

  const cats = categories.join(' ').toLowerCase();
  let productType = 'default';
  if (cats.includes('wallpaper')) productType = 'wallpaper';
  else if (cats.includes('decal')) productType = 'decal';
  else if (cats.includes('frame')) productType = 'frame';
  else if (cats.includes('nameplate') || cats.includes('name plate')) productType = 'nameplate';
  else if (cats.includes('desk quote')) productType = 'deskquote';

  const data = productType !== 'default' ? CATEGORY_DATA[productType as keyof typeof CATEGORY_DATA] : null;

  const toggle = (tab: string) => {
    setOpenTab(openTab === tab ? '' : tab);
  };

  return (
    <div className={styles.accordionContainer}>
      <div className={styles.tab}>
        <button className={styles.tabHeader} onClick={() => toggle('Details')}>
          Product Details <span>{openTab === 'Details' ? '−' : '+'}</span>
        </button>
        {openTab === 'Details' && (
          <div className={styles.tabContent}>
            {data ? renderFormattedText(data.details) : <div dangerouslySetInnerHTML={{ __html: description }} />}
          </div>
        )}
      </div>

      <div className={styles.tab}>
        <button className={styles.tabHeader} onClick={() => toggle('Shipping')}>
          Shipping & Care <span>{openTab === 'Shipping' ? '−' : '+'}</span>
        </button>
        {openTab === 'Shipping' && (
          <div className={styles.tabContent}>
            {data ? renderFormattedText(data.shipping) : <p>All orders are processed within 2-3 business days. Care instructions vary by material.</p>}
          </div>
        )}
      </div>

      <div className={styles.tab}>
        <button className={styles.tabHeader} onClick={() => toggle('ZeroWaste')}>
          Zero Waste Initiative <span>{openTab === 'ZeroWaste' ? '−' : '+'}</span>
        </button>
        {openTab === 'ZeroWaste' && (
          <div className={styles.tabContent}>
            {data ? renderFormattedText(data.zeroWaste) : <p>We are committed to sustainability. All our products are made to order to ensure zero waste.</p>}
          </div>
        )}
      </div>

      <div className={styles.tab}>
        <button className={styles.tabHeader} onClick={() => toggle('Info')}>
          Information <span>{openTab === 'Info' ? '−' : '+'}</span>
        </button>
        {openTab === 'Info' && (
          <div className={styles.tabContent}>
            <p>For custom sizes or commercial orders, please contact our support team at firstroom2019@gmail.com.</p>
          </div>
        )}
      </div>
    </div>
  );
};
