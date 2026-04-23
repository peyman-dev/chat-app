import type { Metadata } from "next";
import "@/public/css/globals.css";

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
    <html
      lang="fa-IR"
      dir="rtl"
      suppressHydrationWarning
    >
      <body className="min-h-screen  antialiased">
          {children}
      </body>
    </html>
  );
}
