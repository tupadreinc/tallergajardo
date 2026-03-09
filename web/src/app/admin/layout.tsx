import { Sidebar } from "@/components/ui/Sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <main className="main-content w-full">
        {children}
      </main>
    </div>
  )
}
