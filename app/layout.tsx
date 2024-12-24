import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="bg-gray-900">
          <hgroup className="sticky top-0 p-2">
            <h1 className="text-white text-4xl font-bold uppercase text-center">
              Messages Wrapped
            </h1>
            <p className="text-white text-center">2024</p>
          </hgroup>
          <div
            className="min-h-[calc(100vh-80px)] p-2 flex justify-center"
            style={{ transform: "translateY(-40px)" }}
          >
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
