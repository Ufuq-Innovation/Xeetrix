import { AppProvider } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Xeetrix - Business Control Room",
};

/**
 * Dashboard Layout
 * Provides a persistent sidebar and scrollable main content area.
 */
export default function DashboardLayout({ children }) {
  return (
    <AppProvider>
      <div className="flex h-screen w-full bg-[#090E14] overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar />
        
        {/* Main Content Viewport */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

      </div>
    </AppProvider>
  );
}