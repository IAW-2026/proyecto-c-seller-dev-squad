import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClerkThemeProvider from "./components/ClerkThemeProvider";
import "./globals.css";


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
  description: "Panel de vendedores",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (      
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const saved = localStorage.getItem('theme');
                  const preferred = saved ||
                    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                  document.documentElement.setAttribute('data-theme', preferred);
                })();
              `,
            }}
          />
        </head>
                <body className="min-h-full flex flex-col" suppressHydrationWarning>

                  <ClerkThemeProvider>
                     {children}
                  </ClerkThemeProvider>
                </body>
        </html>
  );
}