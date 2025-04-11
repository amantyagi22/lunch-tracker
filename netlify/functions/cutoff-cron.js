import fetch from "node-fetch";

// This runs on a schedule via Netlify's scheduled functions
// It simply calls your app's cutoff API endpoint
export const handler = async function () {
  try {
    // Get the app URL from environment variables or use localhost for testing
    const appUrl = process.env.URL || "http://localhost:3000";

    // Call the cutoff API endpoint
    const response = await fetch(`${appUrl}/api/cron/cutoff`);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Cutoff cron job executed successfully",
        result: data,
      }),
    };
  } catch (error) {
    console.error("Error in cutoff cron function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to execute cutoff cron job" }),
    };
  }
};
