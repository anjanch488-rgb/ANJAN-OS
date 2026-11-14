import type { Metadata, Viewport } from "next";
import "@fontsource/teko/500.css";
import "@fontsource/teko/700.css";
import "@fontsource/chakra-petch/400.css";
import "@fontsource/chakra-petch/500.css";
import "@fontsource/chakra-petch/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANJAN.OS — Chinthala Anjan",
  description:
    "Chinthala Anjan — software developer, cybersecurity enthusiast, AI/ML explorer, IoT engineer and multimedia creator. Develop. Create. Innovate.",
  openGraph: {
    title: "ANJAN.OS — Chinthala Anjan",
    description: "An interactive cinematic digital identity. Develop. Create. Innovate.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
