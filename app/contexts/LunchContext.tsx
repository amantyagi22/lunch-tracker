"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { DailyLunch, LunchContextData, Response } from "../types";

// Create lunch context
const LunchContext = createContext<LunchContextData>({
  dailyLunch: null,
  userResponse: null,
  responses: [],
  loading: true,
  userCount: { yes: 0, no: 0, unanswered: 0 },
  submitResponse: async () => {},
  toggleLunchAvailability: async () => {},
});

// Format date to YYYY-MM-DD
const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

// Lunch provider component
export function LunchProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [dailyLunch, setDailyLunch] = useState<DailyLunch | null>(null);
  const [userResponse, setUserResponse] = useState<Response | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState({ yes: 0, no: 0, unanswered: 0 });

  // Fetch today's lunch data and responses
  useEffect(() => {
    const fetchLunchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const today = formatDate(new Date());

        // Check if today's lunch document exists
        const lunchRef = doc(db, "dailyLunch", today);
        const lunchSnap = await getDoc(lunchRef);

        // If lunch doesn't exist for today, create it (Mon-Fri only)
        const dayOfWeek = new Date().getDay();
        if (!lunchSnap.exists() && dayOfWeek > 0 && dayOfWeek < 6) {
          const newLunch: DailyLunch = {
            date: today,
            available: true,
            cutoffTime: "12:30",
            createdAt: new Date(),
          };

          await setDoc(lunchRef, {
            ...newLunch,
            createdAt: serverTimestamp(),
          });

          setDailyLunch(newLunch);
        } else if (lunchSnap.exists()) {
          setDailyLunch(lunchSnap.data() as DailyLunch);
        }

        // Get all users for later reference
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(usersRef);
        const totalUsers = usersSnap.size;
        const userMap = new Map();

        usersSnap.forEach((doc) => {
          const userData = doc.data();
          if (userData.userId) {
            userMap.set(userData.userId, userData.name);
          }
        });

        // Get user's response for today
        if (user.userId) {
          const responseRef = doc(db, "responses", `${user.userId}_${today}`);
          const responseSnap = await getDoc(responseRef);

          if (responseSnap.exists()) {
            setUserResponse(responseSnap.data() as Response);
          } else if (user.defaultResponse && dayOfWeek > 0 && dayOfWeek < 6) {
            // If user has a default preference and hasn't responded yet
            const defaultResponse: Response = {
              userId: user.userId,
              userName: user.name,
              date: today,
              response: user.defaultResponse,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await setDoc(responseRef, {
              ...defaultResponse,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            setUserResponse(defaultResponse);
          } else {
            setUserResponse(null);
          }
        }

        // Get all responses for today
        const responsesQuery = query(
          collection(db, "responses"),
          where("date", "==", today)
        );
        const responseQuerySnap = await getDocs(responsesQuery);
        const responsesList: Response[] = [];

        responseQuerySnap.forEach((doc) => {
          const response = doc.data() as Response;
          // Add user name if missing
          if (!response.userName) {
            response.userName = userMap.get(response.userId) || "Unknown User";
          }
          responsesList.push(response);
        });

        setResponses(responsesList);

        // Calculate counts
        const yesCount = responsesList.filter(
          (r) => r.response === "yes"
        ).length;
        const noCount = responsesList.filter((r) => r.response === "no").length;

        setUserCount({
          yes: yesCount,
          no: noCount,
          unanswered: totalUsers - yesCount - noCount,
        });
      } catch (error) {
        console.error("Error fetching lunch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLunchData();

    // Set up interval to refresh data every minute
    const interval = setInterval(fetchLunchData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Submit user response
  const submitResponse = async (
    response: "yes" | "no",
    setAsDefault: boolean
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const today = formatDate(new Date());
      const responseRef = doc(db, "responses", `${user.userId}_${today}`);

      const responseData: Response = {
        userId: user.userId,
        userName: user.name,
        date: today,
        response,
        createdAt: userResponse?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (userResponse) {
        // Update existing response
        await updateDoc(responseRef, {
          response,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new response
        await setDoc(responseRef, {
          ...responseData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setUserResponse(responseData);

      // Update default preference if requested
      if (setAsDefault) {
        const userRef = doc(db, "users", user.userId);
        await updateDoc(userRef, {
          defaultResponse: response,
        });
      }

      // Update local responses state
      const updatedResponses = [...responses];
      const existingIndex = updatedResponses.findIndex(
        (r) => r.userId === user.userId
      );

      if (existingIndex !== -1) {
        updatedResponses[existingIndex] = responseData;
      } else {
        updatedResponses.push(responseData);
      }

      setResponses(updatedResponses);

      // Update counts
      const yesCount = updatedResponses.filter(
        (r) => r.response === "yes"
      ).length;
      const noCount = updatedResponses.filter(
        (r) => r.response === "no"
      ).length;

      // Get total user count
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const totalUsers = usersSnap.size;

      setUserCount({
        yes: yesCount,
        no: noCount,
        unanswered: totalUsers - yesCount - noCount,
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle lunch availability (admin only)
  const toggleLunchAvailability = async (
    available: boolean,
    reason?: string
  ) => {
    if (!user?.isAdmin) return;

    setLoading(true);
    try {
      const today = formatDate(new Date());
      const lunchRef = doc(db, "dailyLunch", today);

      await updateDoc(lunchRef, {
        available,
        unavailableReason: reason || null,
      });

      setDailyLunch((prev) =>
        prev
          ? {
              ...prev,
              available,
              unavailableReason: reason,
            }
          : null
      );
    } catch (error) {
      console.error("Error toggling lunch availability:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LunchContext.Provider
      value={{
        dailyLunch,
        userResponse,
        responses,
        loading,
        userCount,
        submitResponse,
        toggleLunchAvailability,
      }}
    >
      {children}
    </LunchContext.Provider>
  );
}

// Hook to use lunch context
export function useLunch() {
  return useContext(LunchContext);
}
