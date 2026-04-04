import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import { siteConfig } from "./siteConfig";
import { Navigation } from "@/components/containers/Navbar";
import Footer from "@/components/containers/Footer";
import { MailerLiteScript } from "@/public/scripts/ml";
import { Toaster } from "sonner";

const matter = localFont({
  src: [
    {
      path: "../public/fonts/matter/Matter-Heavy.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/matter/Matter-HeavyItalic.ttf",
      weight: "900",
      style: "italic",
    },
    {
      path: "../public/fonts/matter/Matter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/matter/Matter-BoldItalic.ttf", // This is your BoldItalic file name from your list
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/matter/Matter-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/matter/Matter-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/matter/Matter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/matter/Matter-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/matter/Matter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/matter/Matter-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/matter/Matter-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-matter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://troott.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["sermons", "preachers", "teachings", "troott", "messages", "bible", "faith", "christianity", "fellowship", "prayer", "worship"],
  authors: [
    {
      name: "troott technologies",
      url: "https://www.troott.com",
    },
  ],
  creator: "troott technologies",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.image,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@thetroott",
    images: [siteConfig.image],
  },
  icons: {
    icon: siteConfig.image,
    shortcut: siteConfig.image,
    apple: siteConfig.image,
  },
  robots: {
      index: true,
      follow: true,
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <MailerLiteScript />
      </head>
      <body
        className={`${matter.className} min-h-screen p-4 scroll-auto antialiased selection:bg-cyan-400 selection:text-cyan-700 dark:bg-neutral-950`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          {/* <ErrorBoundary> */}
          <Navigation />

          {children}
          <Toaster richColors position="top-center" />
          <Footer />

          {/* </ErrorBoundary> */}
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
