import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Impara l'italiano — Italian vocabulary trainer",
  description:
    "Learn Italian vocabulary with spaced repetition, typing practice and verb drills. For Spanish and English speakers.",
};

export const viewport: Viewport = {
  themeColor: "#0f1115",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body className="min-h-screen font-sans">
        <StoreProvider>
          <Nav />
          <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:pb-10 md:pt-6">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
