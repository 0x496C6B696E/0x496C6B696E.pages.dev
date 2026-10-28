import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { ExperienceProvider } from "@/components/experience/ExperienceProvider";
import { Backdrop } from "@/components/experience/Backdrop";
import { Taskbar } from "@/components/hud/Taskbar";
import { Terminal } from "@/components/terminal/Terminal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const title = `${site.name} · ${site.identity}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.shortName,
  authors: [{ name: site.developer.handle, url: site.developer.github }],
  creator: site.developer.handle,
  keywords: ["backend engineer", "systems engineer", "automation", "portfolio", "Python", "Linux", "Docker", site.developer.handle],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} ${site.system}: ${site.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.developer.handle,
  alternateName: site.developer.handle,
  url: site.url,
  jobTitle: site.developer.title,
  email: `mailto:${site.developer.email}`,
  sameAs: [site.developer.github],
  knowsAbout: ["Backend engineering", "Systems programming", "Automation", "Linux", "Infrastructure", "Security"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={site.locale} className={`${inter.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ExperienceProvider>
          <Backdrop />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Taskbar />
          <Terminal />
        </ExperienceProvider>
        <div className="crt" aria-hidden="true" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </body>
    </html>
  );
}
