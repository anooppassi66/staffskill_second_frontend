import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/table.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import Script from "next/script";
import { Providers } from "@/redux/Providers";
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LMS Employee Learning",
  description: "LMS Employee Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} app-body`}>
        <Providers>
          <main className="app-main">
            <ToastContainer
              position="top-center"
              autoClose={6000}
              hideProgressBar
              newestOnTop
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              transition={Zoom}
              toastClassName="custom-toast"
              className="custom-body"
            />
            {children}
          </main>
        </Providers>
        <footer className="app-footer">
          <p>
            Made with ❤ By{' '}
            <a href="http://www.kkeydos.com" target="_blank" rel="noopener noreferrer">
              KKEYDOS
            </a>
          </p>
        </footer>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
