import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
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
  title: "Scout - Agregador de Vagas",
  description: "Rastreador e agregador de vagas de desenvolvimento de software.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <NuqsAdapter>
          <div className="w-full max-w-[110rem] mx-auto flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster theme="dark" richColors position="top-right" />
        </NuqsAdapter>
      </body>
    </html>
  );
}
