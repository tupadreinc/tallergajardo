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
        {children}
      </main>
    </div>
  )
}
