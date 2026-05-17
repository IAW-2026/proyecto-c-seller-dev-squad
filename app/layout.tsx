import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClerkThemeProvider from "./components/ClerkThemeProvider";
import "./globals.css";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seller App — Marketplace de Zapatillas",
  description: "Panel de  sellers",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (      
       <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
      >
        <Script
          id="theme-script"
          strategy="beforeInteractive"
        >
          {`
            (function () {
              try {
                const saved = localStorage.getItem("theme");

                const preferred =
                  saved ||
                  (window.matchMedia("(prefers-color-scheme: light)").matches
                    ? "light"
                    : "dark");

                document.documentElement.setAttribute(
                  "data-theme",
                  preferred
                );
              } catch (e) {}
            })();
          `}
        </Script>

        <ClerkThemeProvider>
          {children}
        </ClerkThemeProvider>
      </body>
    </html>
  );
}