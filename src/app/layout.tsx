import type { Metadata } from "next";
import "./globals.css";
import { DevModeLayout } from "@/components/DevModeLayout";

export const metadata: Metadata = {
  title: "The LogicSnap Café",
  description: "Specialty coffee powered by intelligent dynamic pricing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <DevModeLayout>{children}</DevModeLayout>
      </body>
    </html>
  );
}

