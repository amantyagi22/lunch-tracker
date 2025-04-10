"use client";

import React from "react";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Header from "./components/Header";
import ResponseForm from "./components/ResponseForm";
import AdminPanel from "./components/AdminPanel";

export default function Home() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if user is not authenticated
  if (!user) {
    return <Login />;
  }

  // Show main app if user is authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="w-full max-w-xl mx-auto pt-4 pb-8 px-4">
        <div className="space-y-4">
          <ResponseForm />

          {/* Admin panel is conditionally rendered based on user.isAdmin */}
          <AdminPanel />
        </div>
      </main>
    </div>
  );
}
