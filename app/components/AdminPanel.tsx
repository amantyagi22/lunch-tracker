"use client";

import React, { useState, useEffect } from "react";
import { useLunch } from "../contexts/LunchContext";
import { useAuth } from "../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";

export default function AdminPanel() {
  const { user } = useAuth();
  const {
    dailyLunch,
    responses,
    userCount,
    toggleLunchAvailability,
    toggleLateResponses,
  } = useLunch();
  const [reason, setReason] = useState("");
  const [allowLate, setAllowLate] = useState(false);

  useEffect(() => {
    if (dailyLunch) {
      if (dailyLunch.unavailableReason) {
        setReason(dailyLunch.unavailableReason);
      }

      setAllowLate(Boolean(dailyLunch.allowLateResponses));
    }
  }, [dailyLunch]);

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

  const handleLateResponsesToggle = async () => {
    const newValue = !allowLate;
    setAllowLate(newValue);
    await toggleLateResponses(newValue);
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

  // Check if current time is past cutoff
  const isPastCutoff = () => {
    if (!dailyLunch) return false;

    const now = new Date();
    const [hours, minutes] = dailyLunch.cutoffTime.split(":").map(Number);
    const cutoffTime = new Date();
    cutoffTime.setHours(hours, minutes, 0, 0);

    return now > cutoffTime;
  };

  const pastCutoff = isPastCutoff();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">
        Admin Panel
      </h2>

      <div className="mb-4 sm:mb-6">
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
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
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors"
            />
          </div>
        )}
      </div>

      {pastCutoff && (
        <div className="mb-4 sm:mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex-shrink min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-medium text-indigo-800 whitespace-nowrap">
                  Late Responses
                </h3>
                <p className="text-xs text-indigo-600 whitespace-nowrap">
                  ({dailyLunch.cutoffTime})
                </p>
              </div>
            </div>
            <div className="flex items-center flex-shrink-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLate}
                  onChange={handleLateResponsesToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300/30 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                <span className="ml-2 text-xs font-medium text-indigo-700 whitespace-nowrap">
                  {allowLate ? "Allowed" : "Closed"}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Today&apos;s Count:
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center shadow-sm">
            <span className="block text-xl sm:text-2xl font-bold text-emerald-600">
              {userCount.yes}
            </span>
            <span className="text-xs text-emerald-700">Yes</span>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-center shadow-sm">
            <span className="block text-xl sm:text-2xl font-bold text-rose-600">
              {userCount.no}
            </span>
            <span className="text-xs text-rose-700">No</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center shadow-sm">
            <span className="block text-xl sm:text-2xl font-bold text-gray-600">
              {userCount.unanswered}
            </span>
            <span className="text-xs text-gray-700">Unanswered</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Responses:</h3>
        {sortedResponses.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {sortedResponses.map((response) => (
                  <tr
                    key={response.userId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm font-medium text-black">
                      {response.userName ? response.userName : "Unknown User"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
                      <span
                        className={
                          response.response === "yes"
                            ? "px-2 py-1 bg-emerald-50 text-black rounded-full text-xs font-bold"
                            : "px-2 py-1 bg-rose-50 text-black rounded-full text-xs font-bold"
                        }
                      >
                        {response.response === "yes" ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 py-6 bg-gray-50 rounded-lg border border-gray-200">
            No responses yet.
          </div>
        )}
      </div>
    </div>
  );
}
