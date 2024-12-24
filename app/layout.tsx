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
      <body className="antialiased bg-gray-900">
        <nav className="max-w-96 m-auto box-content p-2">
          <hgroup className="sticky top-0 text-white">
            <h1 className="text-4xl font-bold uppercase text-start">
              Messages Wrapped
            </h1>
            <p className="text-start">2024</p>
          </hgroup>
        </nav>
        <main>
          <div
            className="min-h-[calc(100vh-120px)] p-2 flex justify-center"
            style={{ transform: "translateY(-40px)" }}
          >
            {children}
          </div>
        </main>
        <footer className="p-2 text-white max-w-96 m-auto flex justify-between">
          <small>
            Made by{" "}
            <a className="underline" href="https://erxclau.me">
              Eric Lau
            </a>
          </small>
          <small>
            <a className="underline" href="https://github.com/erxclau/mw">
              View source
            </a>
          </small>
        </footer>
      </body>
    </html>
  );
}
