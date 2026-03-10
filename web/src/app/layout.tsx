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
          <div className="absolute inset-0 z-[-2] bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat opacity-20" />

          {/* Fondo decorativo tipo luz borrosa */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-[-1]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none z-[-1]" />

          {/* Overlay claro para asegurar legibilidad */}
          <div className="absolute inset-0 z-[-1] bg-slate-50/80 pointer-events-none" />

          {children}
        </div>
      </body>
    </html>
  );
}
