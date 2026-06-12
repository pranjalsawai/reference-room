import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Reference Room",
  description: "A personal visual archive for designers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-google-sans">{children}</body>
    </html>
  );
}
