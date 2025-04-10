"use client";

import React, { useState } from "react";
import { useLunch } from "../contexts/LunchContext";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export default function AdminPanel() {
  const { user } = useAuth();
  const { dailyLunch, responses, userCount, toggleLunchAvailability } =
    useLunch();
  const [reason, setReason] = useState("");

  // If user is not an admin, don't show this component
  if (!user?.isAdmin) return null;

  // If no lunch data is available
  if (!dailyLunch) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center text-gray-500">
          No lunch data available for today.
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    await toggleLunchAvailability(
      !dailyLunch.available,
      !dailyLunch.available ? reason : undefined
    );
    if (!dailyLunch.available) {
      setReason("");
    }
  };

  // Sort responses by updated time (most recent first)
  const sortedResponses = [...responses].sort((a, b) => {
    const getTime = (timestamp: Date | Timestamp) => {
      if (timestamp instanceof Date) return timestamp.getTime();
      return timestamp.toDate().getTime();
    };

    return getTime(b.updatedAt) - getTime(a.updatedAt);
  });

  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center text-gray-500">
          Admin panel is only available on weekdays.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Panel</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Lunch Today:
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={dailyLunch.available}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {dailyLunch.available ? "Available" : "Not Available"}
            </span>
          </label>
        </div>

        {!dailyLunch.available && (
          <div className="mt-2">
            <input
              type="text"
              value={reason || dailyLunch.unavailableReason || ""}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for unavailability (optional)"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Today&apos;s Count:
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-md text-center">
            <span className="block text-2xl font-bold text-green-600">
              {userCount.yes}
            </span>
            <span className="text-xs text-green-800">Yes</span>
          </div>
          <div className="bg-red-50 p-3 rounded-md text-center">
            <span className="block text-2xl font-bold text-red-600">
              {userCount.no}
            </span>
            <span className="text-xs text-red-800">No</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <span className="block text-2xl font-bold text-gray-600">
              {userCount.unanswered}
            </span>
            <span className="text-xs text-gray-800">Unanswered</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Responses:</h3>
        {sortedResponses.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {sortedResponses.map((response) => (
                  <tr key={response.userId}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {response.userName || response.userId}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={
                          response.response === "yes"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {response.response === "yes" ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                      {format(
                        response.updatedAt instanceof Date
                          ? response.updatedAt
                          : (
                              response.updatedAt as unknown as Timestamp
                            )?.toDate?.() || new Date(),
                        "h:mm a"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">
            No responses yet.
          </div>
        )}
      </div>
    </div>
  );
}
