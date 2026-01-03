import { AppProvider } from "@/context/AppContext";
import "./globals.css";

export const metadata = {
  title: "Xeetrix - Business Control Room",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, padding: 0 }}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}