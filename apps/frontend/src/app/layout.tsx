import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toast } from "@/components/ui/toast/toast";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
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
  metadataBase: new URL("https://scout.guibus.dev"),
  title: {
    default: "Scout — Agregador e Rastreador Inteligente de Vagas de TI",
    template: "%s | Scout",
  },
  description: "Rastreador e agregador inteligente de vagas de desenvolvimento de software e tecnologia em tempo real com extração rica de metadados.",
  keywords: [
    "vagas de ti",
    "vagas de tecnologia",
    "desenvolvedor",
    "frontend",
    "backend",
    "react",
    "next.js",
    "vagas remoto",
    "vagas clt",
    "vagas pj",
    "scout",
    "agregador de vagas",
  ],
  authors: [{ name: "gui-bus" }],
  creator: "gui-bus",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://scout.guibus.dev",
    title: "Scout — Agregador e Rastreador Inteligente de Vagas de TI",
    description: "Encontre as melhores vagas de desenvolvimento de TI consolidadas em um único painel inteligente com filtros avançados e triagem automática.",
    siteName: "Scout",
    images: [
      {
        url: "/utils/seo/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Scout — Agregador de Vagas de TI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scout — Agregador e Rastreador Inteligente de Vagas de TI",
    description: "Painel inteligente de agregação e rastreamento de vagas de TI.",
    images: ["/utils/seo/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NuqsAdapter>
          <Providers>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="w-full max-w-[110rem] mx-auto flex flex-col min-h-screen">
                  {children}
                </div>
              </ThemeProvider>
            </AuthProvider>
            <Toast position="top-right" />
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
