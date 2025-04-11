import { Timestamp } from "firebase/firestore";

// User model
export interface User {
  userId: string; // Google OAuth ID
  name: string; // Display name
  email: string; // Email address
  isAdmin: boolean; // True for Jakir, false for others
  defaultResponse: "yes" | "no" | null; // Default lunch preference
  notificationPreference: "webpush" | "email" | "none"; // Notification type
  createdAt: Date | Timestamp;
}

// Daily lunch model
export interface DailyLunch {
  date: string; // YYYY-MM-DD format
  available: boolean; // Set by admin (Jakir)
  unavailableReason?: string; // Optional explanation if lunch is unavailable
  cutoffTime: string; // Usually "12:30" but configurable
  allowLateResponses: boolean; // Allow responses after cutoff time
  createdAt: Date | Timestamp;
}

// User response model
export interface Response {
  userId: string;
  userName?: string; // Add user name field
  date: string; // YYYY-MM-DD format
  response: "yes" | "no";
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Context data for Auth context
export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

// Context data for Lunch context
export interface LunchContextData {
  dailyLunch: DailyLunch | null;
  userResponse: Response | null;
  responses: Response[];
  loading: boolean;
  userCount: {
    yes: number;
    no: number;
    unanswered: number;
  };
  submitResponse: (
    response: "yes" | "no",
    setAsDefault: boolean
  ) => Promise<void>;
  toggleLunchAvailability: (
    available: boolean,
    reason?: string
  ) => Promise<void>;
  toggleLateResponses: (allowLate: boolean) => Promise<void>;
  submitBulkResponses: (response: "yes" | "no") => Promise<void>;
}
