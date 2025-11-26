import type { Metadata } from "next";
import { Nunito, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hangeul Garden - Learn Korean",
  description: "A beginner-friendly Korean language learning platform with interactive lessons, quizzes, and vocabulary building.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${notoSansKR.variable}`}>
      <body className="antialiased min-h-screen">
        <ToastProvider>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
