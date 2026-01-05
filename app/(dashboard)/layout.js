import { AppProvider } from "@/context/AppContext";
import QueryProvider from "@/context/QueryProvider";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Xeetrix - Business Control Room",
};

/**
 * Dashboard Layout
 * Provides a persistent sidebar, global query caching, and scrollable main content area.
 */
export default function DashboardLayout({ children }) {
  return (
    <QueryProvider>
      <AppProvider>
        <div className="flex h-screen w-full bg-[#090E14] overflow-hidden">
          
          {/* Navigation Sidebar Component */}
          <Sidebar />
          
          {/* Main Content Viewport Area */}
          <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 md:p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>

        </div>
      </AppProvider>
    </QueryProvider>
  );
}