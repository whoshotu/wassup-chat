import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/ui/toaster";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DecoderPage from "./pages/DecoderPage";

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="wassup-theme">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/decoder" element={<DecoderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
