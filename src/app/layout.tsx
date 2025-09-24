import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQLA Visitor Management",
  description: "Visitor registration system for Squeak E. Clean Studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
