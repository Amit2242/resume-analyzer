import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume Shapeshifter — JD-to-Resume Tailoring Engine",
  description:
    "Transform your resume to match any job description — truthful, targeted, exportable.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <div className="min-h-screen">
          {children}
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

