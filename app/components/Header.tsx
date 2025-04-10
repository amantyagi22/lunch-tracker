"use client";

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";

export default function Header() {
  const { user, signOut } = useAuth();

  // Use different date formats based on screen size (applied via CSS classes)
  const fullDate = format(new Date(), "EEEE, MMMM d, yyyy");
  const shortDate = format(new Date(), "MMM d, yyyy");

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-2 sm:py-0 items-center">
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch w-full sm:w-auto">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Lunch Tracker</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center text-gray-500">
              {fullDate}
            </div>
            <div className="sm:hidden mt-1 text-sm text-gray-500">
              {shortDate}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
            {user && (
              <>
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
