import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESSENTIAL MASTERY",
  description: "Learn English with Essential and Navigate: vocabulary, listening, speaking and teacher-guided lessons.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
