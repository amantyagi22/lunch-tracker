"use client";

import { useTheme } from "../contexts/ThemeProvider";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg shadow-sm">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md ${
          theme === "light" ? "bg-gray-200 dark:bg-gray-700" : ""
        }`}
        title="Light mode"
      >
        <SunIcon className="h-5 w-5 text-yellow-500" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md ${
          theme === "dark" ? "bg-gray-200 dark:bg-gray-700" : ""
        }`}
        title="Dark mode"
      >
        <MoonIcon className="h-5 w-5 text-blue-500" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md ${
          theme === "system" ? "bg-gray-200 dark:bg-gray-700" : ""
        }`}
        title="System preference"
      >
        <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
}
