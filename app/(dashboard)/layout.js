import { AppProvider } from "@/context/AppContext";
import Sidebar from "@/components/sidebar";

export const metadata = {
  title: "Xeetrix - Business Control Room",
};

export default function DashboardLayout({ children }) {
  return (
    <html lang="bn">
      <body className="bg-[#090E14] text-white overflow-hidden"> {/* পুরো বডির স্ক্রল বন্ধ থাকবে */}
        <AppProvider>
          <div className="flex h-screen w-screen overflow-hidden"> {/* স্ক্রিন হাইট ফিক্সড */}
            
            {/* Sidebar - এটি ফিক্সড থাকবে */}
            <div className="flex-shrink-0 border-r border-white/5 h-full overflow-y-auto">
                <Sidebar />
            </div>
            
            {/* Main Content Area - এটি শুধু নিজে স্ক্রল হবে */}
            <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
              <div className="max-w-7xl mx-auto"> {/* কন্টেন্টকে মাঝামাঝি রাখার জন্য */}
                {children}
              </div>
            </main>

          </div>
        </AppProvider>
      </body>
    </html>
  );
}