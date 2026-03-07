import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from "./context/AuthContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s / OutLook",
    default: "Welcome to OutLook"
  },
  description: "OutLook is a social media platform where you can find and meet with your friends virtually, far and wide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-white`}>
        <NextTopLoader
          color="#ffffff"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #ffffff,0 0 5px #ffffff"
        />
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
