import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-56 h-full" onClick={e => e.stopPropagation()}>
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-40 h-14 flex items-center px-4 bg-background/95 backdrop-blur-xl border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-sm font-semibold text-foreground">BJ7 Gestão</span>
        </div>
        {children}
      </main>
    </div>
  );
}
