"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Lunch Tracker
          </h1>
          <p className="text-gray-600">
            Sign in to track your lunch preferences
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="h-5 w-5" />
          <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>One-time sign in to track your lunch preferences</p>
          <p className="mt-1">Your data is only used for lunch coordination</p>
        </div>
      </div>
    </div>
  );
}
