import { AppProvider } from "@/context/AppContext";
import Sidebar from "@/components/sidebar"; // এখানে 'S' ছোট হাতের 's' করে দেওয়া হয়েছে

export const metadata = {
  title: "Xeetrix - Business Control Room",
};

export default function DashboardLayout({ children }) {
  return (
    <html lang="bn">
      <body className="bg-[#090E14] text-white">
        <AppProvider>
          <div className="flex min-h-screen">
            {/* Sidebar Component */}
            <Sidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-10 overflow-y-auto">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}