import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  defaultOpenGraphImage,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
} from "@/lib/site";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'Polyfoam Suvarnabhumi',
    'PFS Portal',
    'ระบบภายใน',
    'SSO',
    'Single Sign-On',
    'โพลีโฟม สุวรรณภูมิ',
    'ศูนย์รวมระบบ',
    'internal portal',
  ],
  authors: [{ name: 'Polyfoam Suvarnabhumi' }],
  creator: 'Polyfoam Suvarnabhumi',
  publisher: 'Polyfoam Suvarnabhumi',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: 'th_TH',
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: "/",
    images: [defaultOpenGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [defaultOpenGraphImage.url],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`scroll-smooth antialiased ${notoSansThai.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AuthProvider>
          <Navbar />
          <main id="main-content" className="flex-grow" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
