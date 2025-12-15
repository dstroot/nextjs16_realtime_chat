import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { TITLE, DESCRIPTION } from "@/lib/constants";

// Styles
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// SEO and Metadata
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
