import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {default:"Lingora",template:"%s | Lingora"},
  description: "Learn English with Essential and Navigate: vocabulary, listening, speaking and teacher-guided lessons.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/lingora-logo.png",
    shortcut: "/lingora-logo.png",
    apple: "/lingora-logo.png",
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
