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
import { DailyLunch, LunchContextData, Response, User } from "../types";

// Create lunch context
const LunchContext = createContext<LunchContextData>({
  dailyLunch: null,
  userResponse: null,
  responses: [],
  loading: true,
  userCount: { yes: 0, no: 0, unanswered: 0 },
  submitResponse: async () => {},
  toggleLunchAvailability: async () => {},
  toggleLateResponses: async () => {},
  submitBulkResponses: async () => {},
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
          // Check previous day's lunch status to handle holidays
          const yesterday = formatDate(
            new Date(new Date().setDate(new Date().getDate() - 1))
          );
          const yesterdayRef = doc(db, "dailyLunch", yesterday);
          const yesterdaySnap = await getDoc(yesterdayRef);

          // Default values
          let available = true;
          let unavailableReason = null;

          // If previous day exists and was marked unavailable with a reason,
          // carry over the unavailable state for holidays
          if (yesterdaySnap.exists()) {
            const yesterdayData = yesterdaySnap.data();
            if (
              !yesterdayData.available &&
              yesterdayData.unavailableReason &&
              yesterdayData.unavailableReason.toLowerCase().includes("holiday")
            ) {
              available = false;
              unavailableReason = yesterdayData.unavailableReason;
            }
          }

          const newLunch: DailyLunch = {
            date: today,
            available: available,
            unavailableReason: unavailableReason,
            cutoffTime: "12:30",
            allowLateResponses: false, // By default, don't allow late responses
            createdAt: new Date(),
          };

          await setDoc(lunchRef, {
            ...newLunch,
            createdAt: serverTimestamp(),
          });

          setDailyLunch(newLunch);
        } else if (lunchSnap.exists()) {
          const lunchData = lunchSnap.data();
          // Ensure allowLateResponses is initialized if it doesn't exist
          if (lunchData.allowLateResponses === undefined) {
            await updateDoc(lunchRef, { allowLateResponses: false });
            lunchData.allowLateResponses = false;
          }
          setDailyLunch(lunchData as DailyLunch);
        }

        // Get all users for later reference
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(usersRef);
        const totalUsers = usersSnap.size;
        const userMap = new Map();

        usersSnap.forEach((doc) => {
          const userData = doc.data();
          if (userData.userId) {
            userMap.set(userData.userId, userData.name || "Unknown User");
          }
        });

        // Get user's response for today
        if (user.userId) {
          const responseRef = doc(db, "responses", `${user.userId}_${today}`);
          const responseSnap = await getDoc(responseRef);

          if (responseSnap.exists()) {
            setUserResponse(responseSnap.data() as Response);
          } else if (dayOfWeek > 0 && dayOfWeek < 6) {
            // If user hasn't responded yet, use default or "no"
            const defaultResponse: Response = {
              userId: user.userId,
              userName: user.name,
              date: today,
              response: user.defaultResponse || "no", // Use default or "no" if no default
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

      // Update in the database, using null to clear fields in Firestore
      const updateData: {
        available: boolean;
        unavailableReason?: string | null;
      } = {
        available,
      };

      // Only set the reason field if it's provided or explicitly set to undefined
      if (reason !== undefined) {
        updateData.unavailableReason = reason || null;
      }

      await updateDoc(lunchRef, updateData);

      // Update local state
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

  // Toggle allowing late responses (admin only)
  const toggleLateResponses = async (allowLate: boolean) => {
    if (!user?.isAdmin || !dailyLunch) return;

    setLoading(true);
    try {
      const today = formatDate(new Date());
      const lunchRef = doc(db, "dailyLunch", today);

      await updateDoc(lunchRef, {
        allowLateResponses: allowLate,
      });

      setDailyLunch({
        ...dailyLunch,
        allowLateResponses: allowLate,
      });
    } catch (error) {
      console.error("Error toggling late responses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert all unanswered users to a specific response by setting their default
  const submitBulkResponses = async (response: "yes" | "no") => {
    if (!user?.isAdmin || !dailyLunch) return;

    setLoading(true);
    try {
      const today = formatDate(new Date());

      // Get all users
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const users: User[] = [];

      usersSnap.forEach((doc) => {
        const userData = doc.data();
        if (userData.userId) {
          users.push(userData as User);
        }
      });

      // Get current responses
      const currentResponsesMap = new Map();
      responses.forEach((resp) => {
        currentResponsesMap.set(resp.userId, resp);
      });

      // Find users who haven't responded
      const unansweredUsers = users.filter(
        (user) => !currentResponsesMap.has(user.userId)
      );

      // Update default responses for all unanswered users
      const batch = [];

      for (const unansweredUser of unansweredUsers) {
        // Update user default
        const userRef = doc(db, "users", unansweredUser.userId);
        batch.push(
          updateDoc(userRef, {
            defaultResponse: response,
          })
        );

        // Create response for today
        const responseRef = doc(
          db,
          "responses",
          `${unansweredUser.userId}_${today}`
        );

        const responseData: Response = {
          userId: unansweredUser.userId,
          userName: unansweredUser.name,
          date: today,
          response,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        batch.push(
          setDoc(responseRef, {
            ...responseData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      // Execute all database operations
      await Promise.all(batch);

      // Refresh data to update counts and responses
      const fetchLunchData = async () => {
        // Reuse the logic from the useEffect but simplified
        // Get all responses for today
        const responsesQuery = query(
          collection(db, "responses"),
          where("date", "==", today)
        );
        const responseQuerySnap = await getDocs(responsesQuery);
        const responsesList: Response[] = [];

        responseQuerySnap.forEach((doc) => {
          responsesList.push(doc.data() as Response);
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
          unanswered: users.length - yesCount - noCount,
        });
      };

      await fetchLunchData();
    } catch (error) {
      console.error("Error submitting bulk responses:", error);
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
        toggleLateResponses,
        submitBulkResponses,
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
