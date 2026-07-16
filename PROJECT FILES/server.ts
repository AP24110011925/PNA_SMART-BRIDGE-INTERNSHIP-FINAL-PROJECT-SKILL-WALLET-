import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

// Shared interfaces
interface ConversationStarter {
  id: string;
  eventDescription: string;
  interests: string;
  goals: string;
  extractedThemes: string[];
  starters: string[];
  timestamp: string;
  rating: "useful" | "not_useful" | null;
}

interface Feedback {
  id: string;
  starterId: string;
  rating: "useful" | "not_useful";
  feedbackText: string;
  timestamp: string;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Local JSON File Database Paths
const HISTORY_FILE = path.join(process.cwd(), "history.json");
const FEEDBACK_FILE = path.join(process.cwd(), "feedback.json");

// Ensure data files exist
function initDatabase() {
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2));
  }
}
initDatabase();

// Helper to read and write database
function readHistory(): ConversationStarter[] {
  try {
    initDatabase();
    const data = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading history file, resetting database:", err);
    return [];
  }
}

function writeHistory(history: ConversationStarter[]) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function readFeedback(): Feedback[] {
  try {
    initDatabase();
    const data = fs.readFileSync(FEEDBACK_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading feedback file, resetting database:", err);
    return [];
  }
}

function writeFeedback(feedback: Feedback[]) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedback, null, 2));
}

// Lazy initialization of the GoogleGenAI client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to run the AI engine.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Analyze Event Themes (DistilBERT-style Zero-Shot Classification simulation)
app.post("/api/analyze-event", async (req, res) => {
  const { eventDescription, userInterests } = req.body;

  if (!eventDescription) {
    return res.status(400).json({ error: "Event description is required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `You are mimicking a DistilBERT zero-shot classification model.
Given the following event description and user interests, extract exactly 3-5 core professional, technological, or social themes (categories) from the event.
Provide the output as a clean, valid JSON array of strings. Do not include any markdown format or surrounding explanation.

Event Description: "${eventDescription}"
User Interests: "${userInterests || 'None specified'}"

Example Output:
["AI", "Smart Cities", "Urban Planning", "Sustainability"]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const themes = JSON.parse(text.trim());
    res.json({ themes });
  } catch (error: any) {
    console.error("Error in theme extraction:", error);
    // Fallback safe tags if Gemini is unconfigured or failed
    const fallbacks = ["Networking", "Event", "Professional Development"];
    res.json({ themes: fallbacks, error: error.message });
  }
});

// 2. Generate Conversation Starters (GPT-2 Style text generation simulation)
app.post("/api/generate-conversation", async (req, res) => {
  const { eventDescription, interests, goals, themes } = req.body;

  if (!eventDescription) {
    return res.status(400).json({ error: "Event description is required." });
  }

  try {
    const ai = getAiClient();
    const extractedThemesStr = themes && themes.length ? themes.join(", ") : "general networking";
    const prompt = `You are acting as a GPT-2 model optimized for human-like conversation prompt generation.
Generate exactly 3 smart, highly tailored conversation starters for a professional or social networking event with these details:
- Event: "${eventDescription}"
- User Interests: "${interests || 'General'}"
- Networking Goal: "${goals || 'Make new connections'}"
- Extracted Themes: "${extractedThemesStr}"

Provide a varied mix:
1. One Icebreaker (lightweight, contextual to the event setting).
2. One Topic-Specific (deep-dive query about the extracted themes or user interests).
3. One Goal-Oriented (designed to seek collaborations, mentorship, or career opportunities aligned with the user's goals).

Provide the output as a valid JSON array of objects with fields:
- "type": (either "Icebreaker", "Topic-Specific", or "Goal-Oriented")
- "text": (the conversational quote ready to say)
- "explanation": (brief tip on why this is effective and how/when to use it)

Do not include any markdown format or surrounding explanation. Only output a valid JSON array of 3 objects.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const starters = JSON.parse(text.trim());
    res.json({ starters });
  } catch (error: any) {
    console.error("Error in conversation generation:", error);
    // Fallback templates if Gemini is unconfigured or failed
    const fallbacks = [
      {
        type: "Icebreaker",
        text: "Hi there! What brought you to this event today?",
        explanation: "Simple, friendly, and works in any environment.",
      },
      {
        type: "Topic-Specific",
        text: `With the themes of "${interests || 'technology'}" being discussed, what session are you most excited about?`,
        explanation: "Contextual and invites them to share their key learning focus.",
      },
      {
        type: "Goal-Oriented",
        text: "Hi! I'm hoping to learn more about industry roles in this space. Do you have any experience here?",
        explanation: "Directly addresses your professional networking goals.",
      },
    ];
    res.json({ starters: fallbacks, error: error.message });
  }
});

// 3. Fact-checking via Wikipedia Search & REST APIs
app.get("/api/fact-check", async (req, res) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: "Search query is required." });
  }

  try {
    // Phase A: Search Wikipedia for matching pages
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    const searchResults = searchData?.query?.search || [];

    if (searchResults.length === 0) {
      return res.json({
        found: false,
        message: `No verified Wikipedia pages found for "${query}". Try standardizing your terms.`,
      });
    }

    // Phase B: Fetch the summary of the first best-matching page
    const pageTitle = searchResults[0].title;
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      pageTitle.replace(/ /g, "_")
    )}`;

    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();

    if (summaryResponse.ok && summaryData.extract) {
      return res.json({
        found: true,
        title: summaryData.title,
        summary: summaryData.extract,
        url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
        thumbnail: summaryData.thumbnail?.source || null,
      });
    } else {
      // Fallback if rest summary fails but we have search result snippet
      return res.json({
        found: true,
        title: pageTitle,
        summary: searchResults[0].snippet.replace(/<span class="searchmatch">|<\/span>/g, ""),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
        thumbnail: null,
      });
    }
  } catch (error: any) {
    console.error("Wikipedia API fetch error:", error);
    res.status(500).json({ error: "Failed to communicate with Wikipedia API.", details: error.message });
  }
});

// 4. Conversation Starter History endpoints
app.get("/api/history", (req, res) => {
  const history = readHistory();
  res.json(history);
});

app.post("/api/history", (req, res) => {
  const { eventDescription, interests, goals, extractedThemes, starters } = req.body;

  if (!eventDescription || !starters) {
    return res.status(400).json({ error: "Invalid data structure." });
  }

  const history = readHistory();
  const newItem: ConversationStarter = {
    id: `starter_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    eventDescription,
    interests: interests || "General",
    goals: goals || "Networking",
    extractedThemes: extractedThemes || [],
    starters: starters || [],
    timestamp: new Date().toISOString(),
    rating: null,
  };

  history.unshift(newItem); // Keep latest on top
  writeHistory(history);
  res.json(newItem);
});

// 5. Feedback logging endpoints
app.get("/api/feedback", (req, res) => {
  const feedback = readFeedback();
  res.json(feedback);
});

app.post("/api/feedback", (req, res) => {
  const { starterId, rating, feedbackText } = req.body;

  if (!starterId || !rating) {
    return res.status(400).json({ error: "Starter ID and rating are required." });
  }

  // A. Log raw feedback in feedback.json
  const feedbackList = readFeedback();
  const newFeedback: Feedback = {
    id: `fb_${Date.now()}`,
    starterId,
    rating,
    feedbackText: feedbackText || "",
    timestamp: new Date().toISOString(),
  };
  feedbackList.unshift(newFeedback);
  writeFeedback(feedbackList);

  // B. Update the corresponding rating in history.json
  const history = readHistory();
  const itemIndex = history.findIndex((item) => item.id === starterId);
  if (itemIndex !== -1) {
    history[itemIndex].rating = rating;
    writeHistory(history);
  }

  res.json({ success: true, feedback: newFeedback });
});

// ==========================================
// VITE CLIENT DEV SERVER / PRODUCTION STATIC BUILD
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
