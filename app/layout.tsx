import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/theme-provider";
import SessionBootstrapper from "@/components/providers/session-bootstrapper";
import { getThemeInitScript } from "@/lib/theme";
import "@/public/css/globals.css";
import { configDotenv } from 'dotenv'
import { ToastContainer } from "react-toastify";
import QueryProvider from "@/components/providers/query-provider";

configDotenv()

export const metadata: Metadata = {
  title: "Chat App",
  description: "رابط کاربری مدرن چت با پشتیبانی از تم روشن و تاریک",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {getThemeInitScript()}
        </Script>
      </head>
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <ToastContainer className={"font-yekanbakh! **:font-yekanbakh!"} />
          <ThemeProvider>
            <SessionBootstrapper />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
