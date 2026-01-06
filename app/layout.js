"use client";

import { AppProvider, useAppContext } from "@/context/AppContext";
import "./globals.css";
import "@/lib/i18n"; 

/**
 * RootLayoutContent - Sub-wrapper to access Context values for HTML attributes.
 * It dynamically updates 'lang' and 'dir' based on the global state.
 */
function RootLayoutContent({ children }) {
  const { state } = useAppContext();

  return (
    <html lang={state?.language || "en"} dir={state?.isRTL ? "rtl" : "ltr"}>
      <body className="antialiased" style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

/**
 * RootLayout - The main entry point for the application UI.
 * Wrapped in AppProvider to provide global state to all children.
 */
export default function RootLayout({ children }) {
  return (
    <AppProvider>
      <RootLayoutContent>
        {children}
      </RootLayoutContent>
    </AppProvider>
  );
}