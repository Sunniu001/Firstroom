import type { Metadata } from "next";
import { Playfair_Display, Lato, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/CartDrawer/CartDrawer";
import { LoginModal } from "@/components/LoginModal/LoginModal";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { SessionProvider } from "next-auth/react";
import { SocialAuthSync } from "@/components/SocialAuthSync/SocialAuthSync";
import { FloatingContact } from "@/components/FloatingContact/FloatingContact";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "First Room Collective | Premium Wall Decor",
  description: "Luxury wallpaper and home decor. Transform your space into a story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lato.variable} ${pinyon.variable}`}
    >
      <body>
        <SessionProvider>
          <SocialAuthSync />
          <Header />
          <main className="main-content">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <LoginModal />
          <FloatingContact />
        </SessionProvider>
      </body>
    </html>
  );
}
