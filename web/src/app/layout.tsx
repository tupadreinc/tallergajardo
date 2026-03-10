import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./shell.css";

const poppinsSans = Poppins({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const poppinsDisplay = Poppins({
  variable: "--font-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taller Mecánico App",
  description: "Portal de agendamiento y administración automotriz",
  manifest: "/manifest.json",
  icons: {
    icon: "/taller.jpeg",
    apple: "/taller.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${poppinsSans.variable} ${poppinsDisplay.variable}`}>
        <div className="min-h-screen app-layout relative overflow-hidden">
          {/* Fondo de pantalla global con la imagen de herramientas */}
          <div
            className="fixed inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: "url('/bg.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: -2,
            }}
          />

          {/* Fondo decorativo tipo luz borrosa */}
          <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" style={{ zIndex: -1 }} />
          <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" style={{ zIndex: -1 }} />

          {/* Overlay claro para asegurar legibilidad */}
          <div className="fixed inset-0 bg-white/75 pointer-events-none" style={{ zIndex: -1 }} />

          {children}
        </div>
      </body>
    </html>
  );
}
