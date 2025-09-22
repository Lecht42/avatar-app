import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avatar Generator Toolkit",
  description: "Offline-friendly studio for academic avatar synthesis and embeddings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
         {children}
      </body>
    </html>
  );
}
