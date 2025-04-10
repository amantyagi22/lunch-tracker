"use client";

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";

export default function Header() {
  const { user, signOut } = useAuth();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Lunch Tracker</h1>
            </div>
            <div className="ml-6 flex items-center text-gray-500">{today}</div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <button
                  onClick={signOut}
                  className="ml-3 text-sm px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
