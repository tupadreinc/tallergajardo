import { Sidebar } from "@/components/ui/Sidebar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-layout">
      <Sidebar role="cliente" />
      <main className="main-content w-full">
        <div className="w-full flex justify-center pt-6 md:pt-8 mb-2">
          <img src="/taller.jpeg" alt="Mecánica Gajardo" className="h-20 md:h-16 w-auto object-contain rounded border border-white/5 shadow-sm" />
        </div>
        {children}
      </main>
    </div>
  )
}
