import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { format } from "date-fns";

admin.initializeApp();

// Format date to YYYY-MM-DD
const formatDate = (date) => format(date, "yyyy-MM-dd");

/**
 * Cloud Function to process lunch responses at cutoff time
 * Can be called via HTTPS or triggered by Cloud Scheduler
 */
export const processCutoff = functions.https.onRequest(async (req, res) => {
  try {
    // Skip on weekends
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res
        .status(200)
        .json({ message: "Weekend - no processing needed" });
    }

    const today = formatDate(new Date());
    const db = admin.firestore();

    // 1. Retrieve today's lunch document
    const lunchRef = db.collection("dailyLunch").doc(today);
    const lunchSnap = await lunchRef.get();

    if (!lunchSnap.exists) {
      return res.status(404).json({ message: "No lunch today" });
    }

    const lunchData = lunchSnap.data();

    // If lunch isn't available today, no need to process
    if (!lunchData.available) {
      return res.status(200).json({ message: "Lunch not available today" });
    }

    // Update to disallow late responses
    await lunchRef.update({ allowLateResponses: false });

    // 2. Get all users
    const usersSnap = await db.collection("users").get();
    const users = [];
    const userMap = new Map();

    usersSnap.forEach((doc) => {
      const userData = doc.data();
      if (userData.userId) {
        users.push(userData);
        userMap.set(userData.userId, userData);
      }
    });

    // 3. Get existing responses for today
    const responseQuerySnap = await db
      .collection("responses")
      .where("date", "==", today)
      .get();

    const responseMap = new Map();

    responseQuerySnap.forEach((doc) => {
      const response = doc.data();
      responseMap.set(response.userId, response);
    });

    // 4. Process users who haven't responded
    const batch = db.batch();
    let processedCount = 0;

    for (const user of users) {
      // Skip if user already responded
      if (responseMap.has(user.userId)) continue;

      // No response - use default or "no"
      const finalResponse = user.defaultResponse || "no";
      const responseRef = db
        .collection("responses")
        .doc(`${user.userId}_${today}`);

      const responseData = {
        userId: user.userId,
        userName: user.name,
        date: today,
        response: finalResponse,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(responseRef, responseData);
      processedCount++;
    }

    // Execute all response creations
    if (processedCount > 0) {
      await batch.commit();
    }

    return res.status(200).json({
      message: "Cutoff processed successfully",
      processed: processedCount,
      total: users.length,
    });
  } catch (error) {
    console.error("Error in cutoff processing:", error);
    return res.status(500).json({
      message: "Error processing cutoff",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
