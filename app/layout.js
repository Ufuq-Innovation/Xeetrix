"use client";

import { AppProvider, useApp } from "@/context/AppContext";
import { Toaster } from "sonner";
import "./globals.css";
import "@/lib/i18n";

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body style={{ margin: 0, padding: 0 }}>
        <AppProvider>
          <ClientWrapper>
            {children}
          </ClientWrapper>
          <Toaster position="top-right" richColors />
        </AppProvider>
      </body>
    </html>
  );
}

// ClientWrapper ensures dynamic lang/dir from context is applied safely
function ClientWrapper({ children }) {
  const { state } = useApp();
  return (
    <div lang={state?.lang || "en"} dir={state?.dir || "ltr"}>
      {children}
    </div>
  );
}
