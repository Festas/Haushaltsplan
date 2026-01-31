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
      <body className="antialiased min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
        {/* Gradient overlay for depth */}
        <div className="fixed inset-0 bg-gradient-to-tr from-primary-950/20 via-transparent to-accent-950/20 pointer-events-none" />
        
        {/* Subtle pattern overlay */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none" 
             style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}
