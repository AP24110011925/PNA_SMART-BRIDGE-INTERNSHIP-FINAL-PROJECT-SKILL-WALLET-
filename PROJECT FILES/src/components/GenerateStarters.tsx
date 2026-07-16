import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Sparkles, ThumbsUp, ThumbsDown, Zap, Lightbulb, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { ConversationStarter, StarterOption } from "../types";

interface GenerateStartersProps {
  onGenerationComplete: () => void;
}

export default function GenerateStarters({ onGenerationComplete }: GenerateStartersProps) {
  const [eventDescription, setEventDescription] = useState("");
  const [interests, setInterests] = useState("");
  const [goals, setGoals] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"idle" | "classifying" | "generating">("idle");
  const [error, setError] = useState<string | null>(null);

  // Completed result state
  const [themes, setThemes] = useState<string[]>([]);
  const [starters, setStarters] = useState<StarterOption[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<"useful" | "not_useful" | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventDescription.trim()) return;

    setLoading(true);
    setError(null);
    setFeedbackSubmitted(false);
    setFeedbackRating(null);

    try {
      // 1. Analyze themes (mimicking DistilBERT Zero-Shot Classifier)
      setLoadingStep("classifying");
      const themeResponse = await fetch("/api/analyze-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDescription, userInterests: interests }),
      });
      const themeData = await themeResponse.json();
      const extractedThemes = themeData.themes || [];
      setThemes(extractedThemes);

      // 2. Generate conversation starters (mimicking GPT-2 model text-generation)
      setLoadingStep("generating");
      const genResponse = await fetch("/api/generate-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDescription,
          interests,
          goals,
          themes: extractedThemes,
        }),
      });

      const genData = await genResponse.json();
      if (genData.starters) {
        setStarters(genData.starters);
        setCurrentId(genData.id);
      } else {
        throw new Error("Could not parse conversation starters.");
      }

      onGenerationComplete(); // Refresh history logs parent
    } catch (err: any) {
      console.error(err);
      setError("An error occurred during AI content generation. Standard template guides loaded below.");
      // Soft fallbacks
      setThemes(["Networking", "Professional Connections"]);
      setStarters([
        {
          type: "Icebreaker",
          text: "Hi! What session or speaker are you most looking forward to in this event?",
          explanation: "Simple, highly effective opening aligned with any professional environment.",
        },
        {
          type: "Topic-Specific",
          text: `Hi! I was excited to see interests related to this event's theme discussed. Are you working on any projects in this domain?`,
          explanation: "Inquires about mutual technological or business challenges.",
        },
        {
          type: "Goal-Oriented",
          text: "Hello! I am hoping to learn more about career paths and collaborations in this field. Have you been in this industry long?",
          explanation: "Expresses a clear outcome-oriented networking goal respectfully.",
        },
      ]);
    } finally {
      setLoading(false);
      setLoadingStep("idle");
    }
  };

  const handleFeedback = async (rating: "useful" | "not_useful") => {
    if (!currentId) return;
    setFeedbackRating(rating);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starterId: currentId,
          rating,
          feedbackText: "Rating submitted via web client dashboard.",
        }),
      });
      setFeedbackSubmitted(true);
      onGenerationComplete(); // Refresh parent lists
    } catch (err) {
      console.error("Feedback logging error:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="generation-container">
      {/* Input Section - Left Side */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Event Context & Goals</h2>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Event Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="e.g. AI for Sustainable Cities. Explores green energy, smart grids, city planning, and municipal software development."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 placeholder-slate-400"
            />
            <p className="mt-1.5 text-[11px] text-slate-400 leading-normal">
              Paste the event agenda, headline, or elevator description to extract themes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              My Specific Interests <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. green computing, climate change, urban transit"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              My Networking Goals <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. looking for startup co-founders, career guidance"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                {loadingStep === "classifying"
                  ? "DistilBERT: Classifying Themes..."
                  : "GPT-2: Designing Openings..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                Generate Networking Starters
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section - Right Side */}
      <div className="lg:col-span-7 space-y-6">
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 py-16">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {loadingStep === "classifying" ? "Zero-Shot Text Classification" : "Prompt Generation Pipeline"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {loadingStep === "classifying"
                  ? "Evaluating thematic keyword scores to map primary event sectors."
                  : "Drafting human-aligned conversation openers designed around your target goals."}
              </p>
            </div>
          </div>
        )}

        {!loading && starters.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 py-16">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
              <Sparkles className="h-10 w-10 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Starters Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Input your event agenda on the left and click generate to build customized openings categorized by conversational style.
              </p>
            </div>
          </div>
        )}

        {!loading && starters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Theme Classification Results */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                DistilBERT Theme Classification Result
              </h3>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 border border-blue-100/50 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Generated Prompts Card */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                GPT-2 Generative Prompts (Tailored Options)
              </h3>

              {starters.map((starter, index) => {
                const colors = {
                  Icebreaker: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100/50" },
                  "Topic-Specific": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100/50" },
                  "Goal-Oriented": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100/50" },
                }[starter.type] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-100" };

                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {starter.type}
                      </span>
                    </div>

                    <p className="text-sm text-slate-900 font-bold leading-relaxed italic border-l-4 border-blue-500 pl-3">
                      "{starter.text}"
                    </p>

                    <div className="flex items-start gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <Lightbulb className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-700 font-semibold">Why it works:</strong> {starter.explanation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Micro Feedback Mechanism */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Did these openings fit your event?</h4>
                <p className="text-xs text-slate-500">Providing feedback helps optimize NLP response personalization.</p>
              </div>

              <div className="flex items-center gap-3">
                {feedbackSubmitted ? (
                  <div className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" />
                    Feedback Recorded
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleFeedback("useful")}
                      className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm cursor-pointer ${
                        feedbackRating === "useful" ? "ring-2 ring-blue-500 text-blue-600 bg-blue-50" : "text-slate-600"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Useful
                    </button>
                    <button
                      onClick={() => handleFeedback("not_useful")}
                      className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm cursor-pointer ${
                        feedbackRating === "not_useful" ? "ring-2 ring-blue-500 text-rose-600 bg-rose-50" : "text-slate-600"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Needs Work
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
