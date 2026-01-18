import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/App.css";

export const metadata: Metadata = {
  title: "Screen Recording & Video Trimmer",
  description: "Record your screen, trim videos, and upload to cloud storage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
