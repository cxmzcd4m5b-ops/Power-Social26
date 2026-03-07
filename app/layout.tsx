import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Power Social - AI Content Generator",
  description: "Transform your log cabin construction content into viral social media posts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
