import "./globals.css"; // Optional if you are using Tailwind
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Talking Avatar Studio",
  description: "Generate talking avatar videos from static images and text.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
