import { useState } from "react";
import { motion } from "motion/react";
import { Search, Globe, HelpCircle, AlertTriangle, HelpCircle as HelpIcon, CheckCircle2, Loader2, ArrowUpRight } from "lucide-react";
import { WikipediaResult } from "../types";

export default function FactVerifier() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WikipediaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedTerms = [
    "Blockchain in Healthcare",
    "Smart Grids",
    "Green Computing",
    "Circular Economy",
    "Zero-Shot Classification",
  ];

  const handleVerify = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch(`/api/fact-check?query=${encodeURIComponent(searchQuery)}`);
      if (!resp.ok) {
        throw new Error("Wikipedia API is currently busy. Try again shortly.");
      }
      const data = await resp.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to search term definition.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="fact-verifier-container">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-blue-500 opacity-10 blur-sm">
          <HelpIcon className="h-64 w-64" />
        </div>
        <div className="max-w-xl space-y-2 relative">
          <span className="text-[10px] font-bold bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Fact Verification Engine
          </span>
          <h2 className="text-xl font-bold tracking-tight">Technical Reference Checker</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Quickly check and verify emerging technical terms, paradigms, and topics prior to your meeting. Pulls live summaries directly from Wikipedia REST services.
          </p>
        </div>
      </div>

      {/* Query Search Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify(query)}
              placeholder="e.g. Blockchain in healthcare, smart grids, generative artificial intelligence"
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs placeholder-slate-400 text-slate-800"
            />
          </div>
          <button
            onClick={() => handleVerify(query)}
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Term"}
          </button>
        </div>

        {/* Suggestion Badges */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Suggested Quick Checks:</span>
          <div className="flex flex-wrap gap-2">
            {suggestedTerms.map((term, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(term);
                  handleVerify(term);
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-100 text-slate-600 hover:text-blue-600 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Output */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm py-16">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Querying encyclopedia indexes and summarizing verification reports...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 flex gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-950 uppercase tracking-wide">Search Error</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!loading && result && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
        >
          {result.found ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-full text-xs font-semibold w-fit">
                <CheckCircle2 className="h-4 w-4" />
                Fact-Check Verified Reference Match
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {result.thumbnail && (
                  <div className="md:w-44 h-44 border border-slate-100 rounded-xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{result.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{result.summary}</p>
                  
                  <div className="pt-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <Globe className="h-4 w-4" />
                      Read Verified Wikipedia Entry
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                <HelpCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-slate-950">No Perfect Reference Match</h4>
                <p className="text-xs text-slate-500 max-w-md">{result.message}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
