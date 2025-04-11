import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { format } from "date-fns";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { User, Response } from "../../../types";

// Format date to YYYY-MM-DD
const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

export async function GET() {
  try {
    // Skip on weekends
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({ message: "Weekend - no processing needed" });
    }

    const today = formatDate(new Date());

    // 1. Retrieve today's lunch document
    const lunchRef = doc(db, "dailyLunch", today);
    const lunchSnap = await getDoc(lunchRef);

    if (!lunchSnap.exists()) {
      return NextResponse.json({ message: "No lunch today" }, { status: 404 });
    }

    const lunchData = lunchSnap.data();

    // If lunch isn't available today, no need to process
    if (!lunchData.available) {
      return NextResponse.json({ message: "Lunch not available today" });
    }

    // Update to disallow late responses
    await updateDoc(lunchRef, { allowLateResponses: false });

    // 2. Get all users
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const users: User[] = [];
    const userMap = new Map<string, User>();

    usersSnap.forEach((doc) => {
      const userData = doc.data() as User;
      if (userData.userId) {
        users.push(userData);
        userMap.set(userData.userId, userData);
      }
    });

    // 3. Get existing responses for today
    const responsesQuery = query(
      collection(db, "responses"),
      where("date", "==", today)
    );
    const responseQuerySnap = await getDocs(responsesQuery);
    const responseMap = new Map<string, Response>();

    responseQuerySnap.forEach((doc) => {
      const response = doc.data() as Response;
      responseMap.set(response.userId, response);
    });

    // 4. Process users who haven't responded
    const batch = [];
    let processedCount = 0;

    for (const user of users) {
      // Skip if user already responded
      if (responseMap.has(user.userId)) continue;

      // No response - use default or "no"
      const finalResponse = user.defaultResponse || "no";
      const responseRef = doc(db, "responses", `${user.userId}_${today}`);

      const responseData = {
        userId: user.userId,
        userName: user.name,
        date: today,
        response: finalResponse,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.push(setDoc(responseRef, responseData));
      processedCount++;
    }

    // Execute all response creations
    if (batch.length > 0) {
      await Promise.all(batch);
    }

    return NextResponse.json({
      message: "Cutoff processed successfully",
      processed: processedCount,
      total: users.length,
    });
  } catch (error: unknown) {
    console.error("Error in cutoff cron:", error);
    return NextResponse.json(
      {
        message: "Error processing cutoff",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Export config for cron handling if needed
export const dynamic = "force-dynamic";
