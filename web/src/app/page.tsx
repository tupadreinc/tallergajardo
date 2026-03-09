import { FileArchive, Plus } from "lucide-react";

export default function Home() {
  return (
    <main className="main-content">
      <header className="page-header">
        <div>
          <h1 className="page-title">Project Overview</h1>
          <p className="page-subtitle">Welcome to your new Antigravity workspace.</p>
        </div>
        <button className="cta-button">
          <Plus size={18} />
          <span>New Action</span>
        </button>
      </header>

      {/* Bento Grid layout demonstration */}
      <section className="bento-grid" style={{ marginBottom: "32px" }}>
        <div className="glass-panel bento-item grid-col-8 flex-col h-full">
          <h3 style={{ marginBottom: "1rem" }}>Current Trajectory</h3>
          <div className="skeleton flex-1" style={{ width: "100%" }}></div>
        </div>
        <div className="glass-panel bento-item grid-col-4 flex-col h-full">
          <h3 style={{ marginBottom: "1rem" }}>Quick Stats</h3>
          <div className="flex-col gap-4 flex-1">
            <div className="skeleton" style={{ height: "60px", width: "100%" }}></div>
            <div className="skeleton" style={{ height: "60px", width: "100%" }}></div>
            <div className="skeleton" style={{ height: "60px", width: "100%" }}></div>
          </div>
        </div>
      </section>

      {/* Empty State demonstration */}
      <section>
        <div className="empty-state">
          <FileArchive className="empty-state-icon" />
          <h3>No data available yet</h3>
          <p>Get started by setting up your first feature modular block in the builder.</p>
          <button className="cta-button" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}>
             Configure Data Source
          </button>
        </div>
      </section>
    </main>
  );
}
