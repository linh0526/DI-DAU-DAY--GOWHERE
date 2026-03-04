import type { Metadata } from "next";
import "./globals.css";

// Use Be Vietnam Pro for full Vietnamese support
const vietnam = {
  className: "font-vietnam",
};

export const metadata: Metadata = {
  title: "Đi đâu đây ta? - Gợi ý địa điểm cực chất",
  description: "Trang gợi ý địa điểm ăn uống, cafe, bún bò, bún chả và xôi uy tín.",
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-vietnam antialiased">
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
