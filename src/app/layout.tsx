import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "Magister Visual Toolkit",
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
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
