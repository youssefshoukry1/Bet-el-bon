import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartSidebar } from "@/components/features/CartSidebar";
import { LanguageProvider } from "@/context/LanguageContext";
import QueryProvider from "@/providers/QueryProvider";

// Configure Inter (Main UI Font)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

// Configure Amiri (Arabic/Decorative Font)
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ['400', '700'],
  variable: "--font-amiri",
  display: 'swap',
});

export const metadata = {
  title: "Bayt Al-Bunn | Coffee House",
  description: "Authentic Coffee Experience since 1919",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <QueryProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <CartSidebar />
              <Footer />
            </CartProvider>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
