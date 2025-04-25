import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';

// Dynamically import the ClientLayout to avoid issues with SSR
const ClientLayout = dynamic(() => import('./ClientLayout'), { ssr: false });

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "NAAZ - Dubai Property Market Analysis",
  description: "Comprehensive tool for analyzing Dubai real estate market trends, property prices, and investment opportunities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
