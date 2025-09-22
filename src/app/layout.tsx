
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";
import Script from "next/script";

export const metadata: Metadata = {
  title: "ResumAI",
  description: "Generate professional resumes with the power of AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof Promise.withResolvers === 'undefined') {
                Promise.withResolvers = function () {
                  let resolve, reject;
                  const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                  });
                  return { promise, resolve, reject };
                };
              }
              window.pdfjsLibReady = Promise.withResolvers();
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
              window.pdfjsLib.ready.then(window.pdfjsLibReady.resolve);
            `,
          }}
        ></script>
      </head>
      <body className={cn("font-body antialiased", "min-h-screen flex flex-col")}>
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
