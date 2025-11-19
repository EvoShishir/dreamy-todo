"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // If no user after loading, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
