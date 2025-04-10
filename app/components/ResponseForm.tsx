"use client";

import React, { useState } from "react";
import { useLunch } from "../contexts/LunchContext";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export default function ResponseForm() {
  const { dailyLunch, userResponse, loading, submitResponse } = useLunch();
  const [setAsDefault, setSetAsDefault] = useState(false);

  // Check if current time is past cutoff
  const isPastCutoff = () => {
    if (!dailyLunch) return false;

    const now = new Date();
    const [hours, minutes] = dailyLunch.cutoffTime.split(":").map(Number);
    const cutoffTime = new Date();
    cutoffTime.setHours(hours, minutes, 0, 0);

    return now > cutoffTime;
  };

  const handleResponse = async (response: "yes" | "no") => {
    await submitResponse(response, setAsDefault);
    setSetAsDefault(false);
  };

  if (!dailyLunch) {
    return (
      <div className="p-6 text-center text-gray-500">
        No lunch scheduled for today.
      </div>
    );
  }

  if (!dailyLunch.available) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <div className="text-center text-yellow-800">
          <h3 className="text-lg font-medium">No lunch available today</h3>
          {dailyLunch.unavailableReason && (
            <p className="mt-2">{dailyLunch.unavailableReason}</p>
          )}
        </div>
      </div>
    );
  }

  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) {
    return (
      <div className="p-6 text-center text-gray-500">
        Lunch tracking is only available on weekdays.
      </div>
    );
  }

  const pastCutoff = isPastCutoff();
  if (pastCutoff) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="text-center text-gray-600">
          <h3 className="text-lg font-medium">Cutoff time has passed</h3>
          <p className="mt-2">
            Responses were due by {dailyLunch.cutoffTime}.
            {userResponse ? (
              <span className="block mt-2 font-medium">
                Your response:{" "}
                <span
                  className={
                    userResponse.response === "yes"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {userResponse.response === "yes" ? "Yes" : "No"}
                </span>
              </span>
            ) : (
              <span className="block mt-2">You did not respond today.</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          {userResponse ? "Your lunch response" : "Will you eat lunch today?"}
        </h2>
        {userResponse ? (
          <p className="mt-2 text-sm">
            <span className="font-medium">Current response: </span>
            <span
              className={
                userResponse.response === "yes"
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {userResponse.response === "yes" ? "Yes" : "No"}
            </span>
            <span className="block text-xs text-gray-500 mt-1">
              You can change your response until {dailyLunch.cutoffTime}
            </span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Please respond by {dailyLunch.cutoffTime}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => handleResponse("yes")}
          disabled={loading}
          className={`py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            userResponse?.response === "yes"
              ? "bg-green-600 hover:bg-green-700 ring-2 ring-green-500 ring-offset-2"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {userResponse?.response === "yes" ? "Yes ✓" : "Yes"}
        </button>

        <button
          onClick={() => handleResponse("no")}
          disabled={loading}
          className={`py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            userResponse?.response === "no"
              ? "bg-red-600 hover:bg-red-700 ring-2 ring-red-500 ring-offset-2"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {userResponse?.response === "no" ? "No ✓" : "No"}
        </button>
      </div>

      <div className="flex items-center justify-center">
        <input
          id="default-checkbox"
          type="checkbox"
          checked={setAsDefault}
          onChange={(e) => setSetAsDefault(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="default-checkbox"
          className="ml-2 text-sm text-gray-600"
        >
          Make this my default response
        </label>
      </div>

      {userResponse && (
        <div className="mt-4 text-center text-xs text-gray-500">
          Last updated:{" "}
          {format(
            userResponse.updatedAt instanceof Date
              ? userResponse.updatedAt
              : (userResponse.updatedAt as unknown as Timestamp)?.toDate?.() ||
                  new Date(),
            "h:mm a"
          )}
        </div>
      )}
    </div>
  );
}
