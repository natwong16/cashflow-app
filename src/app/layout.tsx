// ============================================================
// File: src/app/layout.js
//
// Root layout — wraps the entire app with the AuthProvider
// so every page can access the current user.
// Replace the existing layout.js with this file.
// ============================================================

import { AuthProvider } from "../context/AuthContext";
import "../app/globals.css";

export const metadata = {
  title: "Cashflow App",
  description: "Personal cashflow planning and projection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
