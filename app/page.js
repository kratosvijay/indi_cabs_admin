"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && isAdmin) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, isAdmin, router]);

  return (
    <div className="flex items-center justify-center min-height-screen bg-midnight">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mb-4 mx-auto" size={48} />
        <h2 className="text-xl font-semibold">Initializing Admin Environment...</h2>
      </div>
      <style jsx>{`
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .min-height-screen { min-height: 100vh; }
        .bg-midnight { background: #0f1117; }
        .text-center { text-align: center; }
        .text-primary { color: #2563eb; }
        .mb-4 { margin-bottom: 1rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-xl { font-size: 1.25rem; }
        .font-semibold { font-weight: 600; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        :global(.animate-spin) { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
