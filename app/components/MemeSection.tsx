"use client";

import { useState, useEffect } from "react";

// Default subreddits if the environment variable is not set
const DEFAULT_SUBREDDITS = ["aww", "wholesomememes", "foodmemes"];

// Get subreddits from environment variable or use defaults
const getMemeSubreddits = (): string[] => {
  const envSubreddits = process.env.NEXT_PUBLIC_MEME_SUBREDDITS;

  if (!envSubreddits) return DEFAULT_SUBREDDITS;

  // Split by commas and trim whitespace
  return envSubreddits
    .split(",")
    .map((sub) => sub.trim())
    .filter((sub) => sub.length > 0);
};

// Get a random subreddit from the list
const getRandomSubreddit = (): string => {
  const subreddits = getMemeSubreddits();
  const randomIndex = Math.floor(Math.random() * subreddits.length);
  return subreddits[randomIndex];
};

interface Meme {
  postLink: string;
  title: string;
  url: string;
  nsfw: boolean;
  spoiler: boolean;
  subreddit?: string;
}

// Fallback meme in case API fails
const fallbackMeme = {
  title: "Lunch Time!",
  url: "https://i.imgur.com/QohGX1D.jpg", // A safe, food-related image
  postLink: "https://imgur.com/QohGX1D",
  subreddit: "food",
};

// Simple profanity filter for meme titles
const containsProfanity = (text: string): boolean => {
  // Common profanity
  const profanityList = [
    "fuck",
    "shit",
    "ass",
    "bitch",
    "damn",
    "cunt",
    "dick",
    "pussy",
    "cock",
    "bastard",
    "whore",
    "slut",
    "sex",
    "asshole",
    "motherfucker",
    "wtf",
    "porn",
    "xxx",
  ];

  // Religious/cultural sensitive terms that could lead to offensive content
  const sensitiveTerms = [
    "hindu",
    "muslim",
    "islam",
    "christian",
    "jew",
    "sikh",
    "buddhist",
    "religion",
    "religious",
    "church",
    "mosque",
    "temple",
    "prayer",
    "allah",
    "jesus",
    "god",
    "christ",
    "ram",
    "krishna",
    "mohammed",
    "prophet",
    "bible",
    "quran",
    "gita",
    "racial",
    "stereotype",
    "caste",
    "brahmin",
    "dalit",
    "racist",
  ];

  const lowerText = text.toLowerCase();

  // Check for profanity
  const hasProfanity = profanityList.some(
    (word) =>
      lowerText.includes(word) ||
      lowerText.replace(/[^\w\s]/g, "").includes(word)
  );

  // Check for sensitive religious/cultural terms
  const hasSensitiveTerms = sensitiveTerms.some((term) =>
    lowerText.includes(term)
  );

  return hasProfanity || hasSensitiveTerms;
};

export default function MemeSection() {
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [currentSubreddit, setCurrentSubreddit] = useState<string>(
    getRandomSubreddit()
  );

  const fetchMeme = async () => {
    setLoading(true);
    setError(null);
    setUseFallback(false);

    // Get a new random subreddit each time
    const subreddit = getRandomSubreddit();
    setCurrentSubreddit(subreddit);

    try {
      // Try up to 5 times to get a safe meme
      let attempts = 0;
      let foundSafeMeme = false;

      while (attempts < 5 && !foundSafeMeme) {
        attempts++;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(
            `https://meme-api.com/gimme/${subreddit}`,
            {
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error("Failed to fetch meme");
          }

          const data: Meme = await response.json();
          data.subreddit = subreddit; // Store which subreddit it came from

          // Skip NSFW memes or those with profanity in title
          if (data.nsfw || containsProfanity(data.title)) {
            console.log("Skipping inappropriate meme, trying again...");
            continue;
          }

          setMeme(data);
          foundSafeMeme = true;
        } catch (err) {
          if (attempts >= 5) throw err;
          console.log(`Attempt ${attempts} failed, trying again...`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between attempts
        }
      }

      if (!foundSafeMeme) {
        console.log("Using fallback meme");
        setMeme(fallbackMeme as Meme);
        setUseFallback(true);
      }
    } catch (err) {
      console.error("Error fetching meme:", err);
      setError("Failed to load meme from API.");
      setMeme(fallbackMeme as Meme);
      setUseFallback(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a meme when the component mounts
  useEffect(() => {
    fetchMeme();

    // Add error boundary for the entire component
    const handleError = (event: ErrorEvent) => {
      console.error("MemeSection error caught:", event.error);
      setMeme(fallbackMeme as Meme);
      setUseFallback(true);
      setLoading(false);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Don't show anything at all if there's truly a catastrophic error
  if (!meme && !loading && error && useFallback) {
    return null;
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-indigo-800">
            Daily Meme Break
          </h3>
          <button
            onClick={fetchMeme}
            disabled={loading}
            className="text-xs px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded transition-colors"
          >
            {loading ? "Loading..." : "New Meme"}
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
        ) : error && !useFallback ? (
          <div className="text-center text-gray-500 py-10">
            <p>{error}</p>
            <button
              onClick={fetchMeme}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Try Again
            </button>
          </div>
        ) : meme ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{meme.title}</p>
            <div className="relative w-full h-64 flex justify-center items-center bg-gray-100 rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meme.url}
                alt="Meme"
                className="max-w-full max-h-64 object-contain"
                onError={() => {
                  setMeme(fallbackMeme as Meme);
                  setUseFallback(true);
                }}
              />
            </div>
            {!useFallback && (
              <div className="text-right">
                <a
                  href={meme.postLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  View Original
                </a>
              </div>
            )}
            <div className="text-right text-xs text-gray-500">
              From r/{meme.subreddit || currentSubreddit}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>No meme available. Try refreshing.</p>
            <button
              onClick={fetchMeme}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Load Meme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
