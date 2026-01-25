"use client";

import { useEffect, useState } from "react";
import AuthScreen from "../components/AuthScreen";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
    setLoading(false);
  }, []);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
     </div>
  }

  if (!token) {
    return <AuthScreen onSuccess={setToken} />;
  }

  return (
    <Dashboard
      token={token}
      onLogout={() => {
        localStorage.removeItem("token");
        setToken(null);
      }}
    />
  );
}