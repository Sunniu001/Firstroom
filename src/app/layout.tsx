import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/CartDrawer/CartDrawer";
import { LoginModal } from "@/components/LoginModal/LoginModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FirstRoom | Premium E-Commerce",
  description: "Experience luxury shopping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body>
        <main className="main-content">
          {children}
        </main>
        <CartDrawer />
        <LoginModal />
      </body>
    </html>
  );
}
