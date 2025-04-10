"use client";

import React, { useState } from "react";
import { useLunch } from "../contexts/LunchContext";
import { useAuth } from "../contexts/AuthContext";

export default function ResponseForm() {
  const { dailyLunch, userResponse, loading, submitResponse } = useLunch();
  const [setAsDefault, setSetAsDefault] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  // Check if current time is past cutoff
  const isPastCutoff = () => {
    if (!dailyLunch) return false;
    if (isAdmin) return false; // Admins can bypass cutoff time

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

  const handleToggleDefault = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSetAsDefault(e.target.checked);
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
  if (pastCutoff && !isAdmin) {
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
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-center mb-5 sm:mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {userResponse ? "Your lunch response" : "Will you eat lunch today?"}
        </h2>
        {userResponse ? (
          <div className="mt-2 sm:mt-3">
            <span className="text-black font-medium">Current response: </span>
            <span
              className={
                userResponse.response === "yes"
                  ? "text-emerald-700 font-semibold"
                  : "text-rose-700 font-semibold"
              }
            >
              {userResponse.response === "yes" ? "Yes" : "No"}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            Please respond by {dailyLunch.cutoffTime}
          </p>
        )}
        {!isAdmin && (
          <div className="text-sm text-gray-700 font-medium mt-3 border border-gray-200 rounded-md p-3 bg-gray-50 inline-block mx-auto">
            <span className="text-black">Cutoff time:</span>{" "}
            {dailyLunch.cutoffTime}
          </div>
        )}
      </div>

      <div
        className={
          isAdmin
            ? "grid grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6 max-w-md mx-auto"
            : "grid grid-cols-1 gap-4 sm:gap-5 mb-5 sm:mb-6 max-w-xs mx-auto"
        }
      >
        <button
          onClick={() => handleResponse("yes")}
          disabled={loading}
          className={`
            relative py-4 sm:py-5 px-3 sm:px-5 rounded-lg 
            text-lg font-medium transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400
            ${
              userResponse?.response === "yes"
                ? "bg-emerald-800 text-white border-2 border-emerald-900 shadow-md"
                : "bg-emerald-700 text-white border border-emerald-800 hover:bg-emerald-800"
            }
          `}
        >
          {userResponse?.response === "yes" ? (
            <>
              <span className="flex items-center justify-center">
                Yes
                <span className="absolute right-3 flex items-center justify-center h-6 w-6 bg-white text-emerald-800 rounded-full text-xs">
                  ✓
                </span>
              </span>
            </>
          ) : (
            "Yes"
          )}
        </button>

        <button
          onClick={() => handleResponse("no")}
          disabled={loading}
          className={`
            relative py-4 sm:py-5 px-3 sm:px-5 rounded-lg 
            text-lg font-medium transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400
            ${
              userResponse?.response === "no"
                ? "bg-rose-800 text-white border-2 border-rose-900 shadow-md"
                : "bg-rose-700 text-white border border-rose-800 hover:bg-rose-800"
            }
          `}
        >
          {userResponse?.response === "no" ? (
            <>
              <span className="flex items-center justify-center">
                No
                <span className="absolute right-3 flex items-center justify-center h-6 w-6 bg-white text-rose-800 rounded-full text-xs">
                  ✓
                </span>
              </span>
            </>
          ) : (
            "No"
          )}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 max-w-md mx-auto mt-2">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center">
            <label
              htmlFor="default-toggle"
              className="text-sm font-medium text-gray-800 cursor-pointer"
            >
              Make this my default response
            </label>
          </div>

          <div className="relative">
            <input
              type="checkbox"
              id="default-toggle"
              className="sr-only peer"
              checked={setAsDefault}
              onChange={handleToggleDefault}
            />
            <div
              onClick={() => setSetAsDefault(!setAsDefault)}
              className="w-14 h-7 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:shadow-sm after:transition-all peer-checked:bg-indigo-600 cursor-pointer"
            ></div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
          <div className="flex items-center">
            <div className="relative mr-2">
              <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 w-5 h-5 text-xs font-medium cursor-pointer hover:bg-indigo-200 transition-colors">
                ?
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-44 p-2 bg-white text-xs text-gray-700 rounded-md shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-gray-200 z-10">
                  This will be your automatic response for future days.
                </span>
              </span>
            </div>
            <p>Applies your choice automatically each day.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
