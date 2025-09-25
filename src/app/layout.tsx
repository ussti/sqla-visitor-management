import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./providers/i18n-provider";

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
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
