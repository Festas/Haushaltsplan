import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haushaltsplan",
  description: "Familienausgaben-Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className="antialiased min-h-screen bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  );
}
