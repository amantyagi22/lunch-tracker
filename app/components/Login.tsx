"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Lunch Tracker
          </h1>
          <p className="text-gray-600">Simplify daily lunch coordination</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <h2 className="text-sm font-medium text-blue-800 mb-2">
            How it works:
          </h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Sign in once with your Google account</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                Respond &quot;Yes&quot; or &quot;No&quot; to daily lunch with a
                single tap
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Set default preferences to minimize daily input</span>
            </li>
          </ul>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="h-5 w-5" />
          <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
        </button>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Your data is only used for lunch coordination</p>
        </div>
      </div>
    </div>
  );
}
