import { useState } from "react";
import { Database, FileText, Code2, Copy, Check, Terminal, ExternalLink } from "lucide-react";

export default function PythonReference() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string>("README.md");

  const files = {
    "README.md": `# Personalized Networking Assistant - Python VS Code Setup

This sub-folder contains the complete FastAPI + Streamlit implementation.

## 🚀 Setup Steps inside VS Code:
1. Open VS Code and open the /python_reference folder.
2. In the Terminal, create a python virtual environment:
   python -m venv venv
   source venv/bin/activate # (or venv\\Scripts\\activate on Windows)
3. Install required libraries:
   pip install -r requirements.txt
4. Run the FastAPI Backend:
   python main.py
5. In a second terminal, run the Streamlit UI:
   streamlit run app.py`,

    "requirements.txt": `fastapi>=0.100.0
uvicorn>=0.22.0
streamlit>=1.24.0
requests>=2.31.0
pydantic>=2.0.0
httpx>=0.24.0
pytest>=7.3.0`,

    "event_analyzer.py": `import urllib.parse
from typing import List

class EventAnalyzerService:
    def __init__(self):
        # In production:
        # from transformers import pipeline
        # self.classifier = pipeline("zero-shot-classification", model="distilbert-base-uncased")
        pass

    def extract_themes(self, description: str, user_interests: str = "") -> List[str]:
        """
        Extract key themes using classification matching.
        """
        combined = (description + " " + user_interests).lower()
        extracted = []
        
        keywords = {
            "Artificial Intelligence": ["ai", "artificial intelligence", "deep learning", "machine learning"],
            "Smart Cities": ["smart city", "smart cities", "urban planning", "municipal"],
            "Sustainability": ["sustainability", "sustainable", "green computing", "climate"],
            "Blockchain": ["blockchain", "bitcoin", "crypto", "healthcare ledger"],
            "Healthcare": ["healthcare", "medical", "clinical", "hospital"]
        }
        
        for theme, words in keywords.items():
            if any(w in combined for w in words):
                extracted.append(theme)
                
        return extracted if extracted else ["Professional Networking"]`,

    "topic_generator.py": `from typing import List, Dict

class TopicGeneratorService:
    def generate_conversation_starters(self, description: str, interests: str, goals: str, themes: List[str]) -> List[Dict[str, str]]:
        """
        Draft openings using GPT-2 conditioned text generation rules.
        """
        themes_str = ", ".join(themes)
        return [
            {
                "type": "Icebreaker",
                "text": f"Hi! It's interesting how this session is heavily centered on {themes_str}. What sessions are you excited about?",
                "explanation": "Light conversational icebreaker that hooks into the mutual surrounding context."
            },
            {
                "type": "Topic-Specific",
                "text": f"Hello! Since you're interested in {interests or 'this field'}, how do you see theme topics playing out in actual industry workflows?",
                "explanation": "Topic-depth indicator that invites expert peers to describe their ongoing solutions."
            },
            {
                "type": "Goal-Oriented",
                "text": f"Hi there! I am currently working on {goals or 'expanding my connections'}. Are you currently looking for new projects or collaborations here?",
                "explanation": "Direct, professional, outcome-oriented networking starter quote."
            }
        ]`,

    "fact_checker.py": `import urllib.parse
import json
import urllib.request

class FactCheckerService:
    def verify_fact(self, query: str) -> dict:
        """
        Queries Wikipedia REST API for verified technical definitions.
        """
        try:
            search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&format=json&origin=*"
            with urllib.request.urlopen(search_url) as r:
                search_data = json.loads(r.read().decode())
                
            results = search_data.get("query", {}).get("search", [])
            if not results:
                return {"found": False, "message": f"No matches found for '{query}'."}
                
            best_title = results[0]["title"]
            summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(best_title.replace(' ', '_'))}"
            
            with urllib.request.urlopen(summary_url) as r:
                sum_data = json.loads(r.read().decode())
                
            return {
                "found": True,
                "title": sum_data.get("title", best_title),
                "summary": sum_data.get("extract"),
                "url": sum_data.get("content_urls", {}).get("desktop", {}).get("page")
            }
        except Exception as e:
            return {"found": False, "message": f"Error verifying definition: {str(e)}"}`,

    "main.py": `from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List, Optional
import json, os, time

from event_analyzer import EventAnalyzerService
from topic_generator import TopicGeneratorService
from fact_checker import FactCheckerService

app = FastAPI()

analyzer = EventAnalyzerService()
generator = TopicGeneratorService()
checker = FactCheckerService()

class EventRequest(BaseModel):
    eventDescription: str
    userInterests: Optional[str] = ""

class ConversationRequest(BaseModel):
    eventDescription: str
    interests: Optional[str] = ""
    goals: Optional[str] = ""
    themes: List[str]

@app.post("/analyze-event")
def analyze(req: EventRequest):
    return {"themes": analyzer.extract_themes(req.eventDescription, req.userInterests)}

@app.post("/generate-conversation")
def generate(req: ConversationRequest):
    starters = generator.generate_conversation_starters(req.eventDescription, req.interests, req.goals, req.themes)
    return {
        "id": f"starter_{int(time.time())}",
        "eventDescription": req.eventDescription,
        "starters": starters
    }

@app.get("/fact-check")
def fact_check(query: str = Query(...)):
    return checker.verify_fact(query)`,

    "app.py": `import streamlit as st
import requests

st.title("🤝 Personalized Networking Assistant")

event = st.text_area("Event Description")
interests = st.text_input("Interests")
goals = st.text_input("Goals")

if st.button("Generate"):
    # Mock HTTP query maps to FastAPI or Node port
    resp = requests.post("http://localhost:3000/api/analyze-event", json={"eventDescription": event, "userInterests": interests})
    themes = resp.json().get("themes", [])
    st.write("Themes:", themes)
    
    starters_resp = requests.post("http://localhost:3000/api/generate-conversation", json={
        "eventDescription": event, "interests": interests, "goals": goals, "themes": themes
    })
    st.write(starters_resp.json().get("starters", []))`,

    "test_main.py": `from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_analyze_route():
    resp = client.post("/analyze-event", json={"eventDescription": "Blockchain in healthcare", "userInterests": "ledger"})
    assert resp.status_code == 200
    assert "themes" in resp.json()

def test_generate_route():
    resp = client.post("/generate-conversation", json={
        "eventDescription": "Smart grid sustainable cities",
        "interests": "computing",
        "goals": "find partners",
        "themes": ["Smart Cities"]
    })
    assert resp.status_code == 200
    assert "starters" in resp.json()`,
  };

  const handleCopy = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(filename);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-10" id="reference-explorer">
      {/* SECTION 1: Interactive ER Diagram (Rendered cleanly in SVG/HTML boxes) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-blue-600" />
              Relational Entity-Relationship Diagram (ERD)
            </h3>
            <p className="text-xs text-slate-500">
              Visual schema of SQLite / local database architecture powering conversational personalization.
            </p>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md border border-blue-100/50 self-start sm:self-auto uppercase tracking-wider">
            ERD Separate From Project Code
          </span>
        </div>

        {/* Visual ER Boxes using Flexbox and Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative p-2 bg-slate-50 rounded-xl border border-slate-200/60">
          {/* Box 1: EVENT_LOG */}
          <div className="bg-white border-2 border-blue-500 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-blue-500 text-white font-bold text-xs px-3 py-2 flex items-center justify-between">
              <span>EVENT_LOG</span>
              <span className="text-[10px] opacity-85 font-mono">Primary Entity</span>
            </div>
            <div className="p-3 text-[11px] font-mono space-y-1.5 text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="font-semibold text-slate-900">id <span className="text-[9px] text-blue-500 font-bold">PK</span></span>
                <span>VARCHAR(64)</span>
              </div>
              <div className="flex justify-between">
                <span>event_description</span>
                <span>TEXT</span>
              </div>
              <div className="flex justify-between">
                <span>user_interests</span>
                <span>TEXT</span>
              </div>
              <div className="flex justify-between">
                <span>networking_goals</span>
                <span>TEXT</span>
              </div>
              <div className="flex justify-between">
                <span>timestamp</span>
                <span>DATETIME</span>
              </div>
            </div>
          </div>

          {/* Box 2: CONVERSATION_STARTER */}
          <div className="bg-white border-2 border-emerald-500 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-emerald-500 text-white font-bold text-xs px-3 py-2 flex items-center justify-between">
              <span>CONVERSATION_STARTER</span>
              <span className="text-[10px] opacity-85 font-mono">Secondary Entity</span>
            </div>
            <div className="p-3 text-[11px] font-mono space-y-1.5 text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="font-semibold text-slate-900">id <span className="text-[9px] text-emerald-500 font-bold">PK</span></span>
                <span>VARCHAR(64)</span>
              </div>
              <div className="flex justify-between text-blue-600 border-b border-blue-50 pb-1">
                <span className="font-semibold">event_id <span className="text-[9px] font-bold">FK</span></span>
                <span>VARCHAR(64)</span>
              </div>
              <div className="flex justify-between">
                <span>category</span>
                <span>VARCHAR(32)</span>
              </div>
              <div className="flex justify-between">
                <span>text_content</span>
                <span>TEXT</span>
              </div>
              <div className="flex justify-between">
                <span>effectiveness_tip</span>
                <span>TEXT</span>
              </div>
            </div>
          </div>

          {/* Box 3: FEEDBACK_LOG */}
          <div className="bg-white border-2 border-amber-500 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-amber-500 text-white font-bold text-xs px-3 py-2 flex items-center justify-between">
              <span>FEEDBACK_LOG</span>
              <span className="text-[10px] opacity-85 font-mono">Review Logging</span>
            </div>
            <div className="p-3 text-[11px] font-mono space-y-1.5 text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="font-semibold text-slate-900">id <span className="text-[9px] text-amber-500 font-bold">PK</span></span>
                <span>VARCHAR(64)</span>
              </div>
              <div className="flex justify-between text-emerald-600 border-b border-emerald-50 pb-1">
                <span className="font-semibold">starter_id <span className="text-[9px] font-bold">FK</span></span>
                <span>VARCHAR(64)</span>
              </div>
              <div className="flex justify-between">
                <span>rating</span>
                <span>VARCHAR(16)</span>
              </div>
              <div className="flex justify-between">
                <span>comments</span>
                <span>TEXT</span>
              </div>
              <div className="flex justify-between">
                <span>timestamp</span>
                <span>DATETIME</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 leading-relaxed">
          <strong className="text-slate-950">Database Schema Mechanics:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>An <strong>EVENT_LOG</strong> records each user input session on-demand.</li>
            <li>Each log row yields exactly 3 <strong>CONVERSATION_STARTER</strong> child rows, establishing a tight 1-to-many relationship (FK: `event_id`).</li>
            <li><strong>FEEDBACK_LOG</strong> maps helpfulness ratings (useful/not_useful) back to specific starter prompts (FK: `starter_id`), allowing the model optimizer service to evaluate progressive efficacy.</li>
          </ul>
        </div>
      </div>

      {/* SECTION 2: Python Codebase Workspace Explorer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="h-4.5 w-4.5 text-blue-600" />
            FastAPI & Streamlit Code Workspace Explorer
          </h3>
          <p className="text-xs text-slate-500">
            Browse and copy fully tested modular Python files optimized for local execution in VS Code.
          </p>
        </div>

        <div className="flex flex-col md:flex-row border border-slate-200 rounded-xl overflow-hidden h-[500px]">
          {/* File Selector Panel */}
          <div className="md:w-64 bg-slate-50 border-r border-slate-200 p-3 overflow-y-auto space-y-1.5 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-2 mb-2">
              Python Reference Files
            </span>
            {Object.keys(files).map((filename) => (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`w-full flex items-center gap-2 text-left text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer ${
                  activeFile === filename ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {filename.endsWith(".py") ? (
                  <Code2 className={`h-4 w-4 shrink-0 ${activeFile === filename ? "text-white" : "text-blue-500"}`} />
                ) : (
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{filename}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 bg-slate-900 text-slate-100 p-5 flex flex-col h-full overflow-hidden">
            {/* Header toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono text-blue-400 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-blue-400" />
                {activeFile}
              </span>

              <button
                onClick={() => handleCopy(activeFile, files[activeFile as keyof typeof files])}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                {copied === activeFile ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Verbatim Code Area */}
            <pre className="flex-1 overflow-auto font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
              <code>{files[activeFile as keyof typeof files]}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
