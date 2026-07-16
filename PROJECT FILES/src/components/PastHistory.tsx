import { useState, useEffect } from "react";
import { Clock, ThumbsUp, ThumbsDown, BookOpen, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { ConversationStarter } from "../types";

interface PastHistoryProps {
  refreshTrigger: number;
}

export default function PastHistory({ refreshTrigger }: PastHistoryProps) {
  const [history, setHistory] = useState<ConversationStarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "useful" | "not_useful">("all");

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/history");
      if (!resp.ok) {
        throw new Error("Failed to load historical strategies.");
      }
      const data = await resp.json();
      setHistory(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch past session logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const filteredHistory = history.filter((item) => {
    if (activeFilter === "all") return true;
    return item.rating === activeFilter;
  });

  return (
    <div className="space-y-6" id="history-container">
      {/* Tab Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-slate-500" />
            Strategy History & Feedback
          </h2>
          <p className="text-xs text-slate-500">
            Review past event configurations and strategies marked useful.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Logs ({history.length})
          </button>
          <button
            onClick={() => setActiveFilter("useful")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeFilter === "useful" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ThumbsUp className="h-3 w-3" />
            Helpful ({history.filter((i) => i.rating === "useful").length})
          </button>
          <button
            onClick={() => setActiveFilter("not_useful")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeFilter === "not_useful" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ThumbsDown className="h-3 w-3" />
            Needs Work ({history.filter((i) => i.rating === "not_useful").length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm py-16">
          <RefreshCw className="h-8 w-8 animate-spin mb-2 text-blue-500" />
          <p className="text-xs">Retrieving historic databases...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 flex gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-950 uppercase tracking-wide">Database Read Failure</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!loading && filteredHistory.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 py-16">
          <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
            <BookOpen className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">No Strategies Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              {activeFilter === "all"
                ? "No conversation starter sessions have been run yet. Go design one!"
                : "No log items match the selected feedback category."}
            </p>
          </div>
        </div>
      )}

      {!loading && filteredHistory.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 space-y-4"
            >
              {/* Card Title & Meta Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1.5 font-mono">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    Session: {item.id}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono">
                    Created: {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="shrink-0">
                  {item.rating === "useful" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100/50">
                      <ThumbsUp className="h-3 w-3" />
                      Helpful Strategy
                    </span>
                  ) : item.rating === "not_useful" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-100/50">
                      <ThumbsDown className="h-3 w-3" />
                      Refinement Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200">
                      Unrated Strategy
                    </span>
                  )}
                </div>
              </div>

              {/* Input Context Summary */}
              <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Event Description:</span>
                  <p className="text-slate-700 leading-relaxed italic">"{item.eventDescription}"</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">My Interests:</span>
                    <span className="text-slate-700 font-semibold">{item.interests || "General"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Target Goals:</span>
                    <span className="text-slate-700 font-semibold">{item.goals || "Networking"}</span>
                  </div>
                </div>
              </div>

              {/* Extracted Themes Row */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Classified Core Themes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.extractedThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-blue-50 border border-blue-100/50 text-blue-700 text-[11px] font-bold rounded-md"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conversation Starters List */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Generated Conversational Starters
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.starters.map((starter, sIdx) => {
                    const colors = {
                      Icebreaker: "border-l-emerald-500 bg-emerald-50/20",
                      "Topic-Specific": "border-l-blue-500 bg-blue-50/20",
                      "Goal-Oriented": "border-l-amber-500 bg-amber-50/20",
                    }[starter.type] || "border-l-slate-500 bg-slate-50/20";

                    return (
                      <div
                        key={sIdx}
                        className={`border-l-4 rounded-r-xl p-4 text-xs space-y-2 flex flex-col justify-between border border-slate-100/60 ${colors}`}
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-slate-950 text-xs">{starter.type}</span>
                          <p className="text-slate-800 leading-relaxed italic">"{starter.text}"</p>
                        </div>
                        <p className="text-slate-500 text-[11px] pt-1.5 border-t border-slate-100/80">
                          <strong>Tip:</strong> {starter.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
