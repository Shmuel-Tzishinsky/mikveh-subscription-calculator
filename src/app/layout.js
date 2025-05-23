import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "מחשבון מנוי מקווה",
  icons: {
    icon: "/iconApp.ico",
  },
  description:
    "אפליקציה לחישוב מנוי חודשי למקווה, כולל מעקב לפי לוח שנה עברי וחישוב תאריכים בצורה פשוטה וברורה.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
