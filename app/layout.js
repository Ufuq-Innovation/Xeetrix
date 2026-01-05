import { AppProvider } from "@/context/AppContext";
import "./globals.css";

export const metadata = {
  title: "Xeetrix - Business Control Room",
  description: "Global E-commerce SaaS Solution",
};

export default function RootLayout({ children }) {
  return (
    // Language and direction are now managed within the AppProvider's wrapper div
    <html>
      <body style={{ margin: 0, padding: 0 }}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}