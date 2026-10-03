import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {default:"Zamon",template:"%s | Zamon"},
  description: "Learn English with Essential and Navigate: vocabulary, listening, speaking and teacher-guided lessons.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/zamon-logo.png",
    shortcut: "/zamon-logo.png",
    apple: "/zamon-logo.png",
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
