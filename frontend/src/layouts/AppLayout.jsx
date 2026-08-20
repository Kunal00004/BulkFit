import React from "react";
import Navbar from "../components/Navbar.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-base">
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
