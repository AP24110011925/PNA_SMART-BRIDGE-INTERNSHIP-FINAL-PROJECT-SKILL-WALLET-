# main.py
"""
Personalized Networking Assistant - FastAPI Backend Service
Coordinates event analyzer, topic generation, fact-checking, and local persistence files.
"""

import os
import json
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import services
from event_analyzer import EventAnalyzerService
from topic_generator import TopicGeneratorService
from fact_checker import FactCheckerService

app = FastAPI(
    title="Personalized Networking Assistant Backend",
    description="A modular FastAPI service for generating context-aware conversation prompts.",
    version="1.0.0"
)

# Allow Streamlit and local React clients to query
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
analyzer = EventAnalyzerService()
generator = TopicGeneratorService()
checker = FactCheckerService()

# Database File Paths
HISTORY_FILE = "history.json"
FEEDBACK_FILE = "feedback.json"

# Models
class EventRequest(BaseModel):
    eventDescription: str
    userInterests: Optional[str] = ""

class ConversationRequest(BaseModel):
    eventDescription: str
    interests: Optional[str] = ""
    goals: Optional[str] = ""
    themes: List[str]

class FeedbackRequest(BaseModel):
    starterId: str
    rating: str  # "useful" or "not_useful"
    feedbackText: Optional[str] = ""

# Database helpers
def load_json(filepath: str) -> list:
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_json(filepath: str, data: list):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# API ENDPOINTS

@app.post("/analyze-event")
def analyze_event(req: EventRequest):
    if not req.eventDescription.strip():
        raise HTTPException(status_code=400, detail="Event description is empty.")
    themes = analyzer.extract_themes(req.eventDescription, req.userInterests)
    return {"themes": themes}

@app.post("/generate-conversation")
def generate_conversation(req: ConversationRequest):
    if not req.eventDescription.strip():
        raise HTTPException(status_code=400, detail="Event description is empty.")
    
    # Generate starters
    starters = generator.generate_conversation_starters(
        req.eventDescription, req.interests, req.goals, req.themes
    )

    # Save automatically to history database
    history = load_json(HISTORY_FILE)
    history_item = {
        "id": f"starter_{int(time.time())}",
        "eventDescription": req.eventDescription,
        "interests": req.interests or "General",
        "goals": req.goals or "Networking",
        "extractedThemes": req.themes,
        "starters": starters,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "rating": None
    }
    history.insert(0, history_item) # Insert on top
    save_json(HISTORY_FILE, history)

    return history_item

@app.get("/fact-check")
def fact_check(query: str = Query(..., description="Term to fact check on Wikipedia")):
    res = checker.verify_fact(query)
    return res

@app.get("/history")
def get_history():
    return load_json(HISTORY_FILE)

@app.post("/feedback")
def submit_feedback(req: FeedbackRequest):
    if req.rating not in ["useful", "not_useful"]:
        raise HTTPException(status_code=400, detail="Rating must be 'useful' or 'not_useful'.")

    # Save to feedback.json
    feedbacks = load_json(FEEDBACK_FILE)
    new_fb = {
        "id": f"fb_{int(time.time())}",
        "starterId": req.starterId,
        "rating": req.rating,
        "feedbackText": req.feedbackText,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    feedbacks.insert(0, new_fb)
    save_json(FEEDBACK_FILE, feedbacks)

    # Update state in history.json
    history = load_json(HISTORY_FILE)
    updated = False
    for item in history:
        if item["id"] == req.starterId:
            item["rating"] = req.rating
            updated = True
            break
    if updated:
        save_json(HISTORY_FILE, history)

    return {"success": True, "feedback": new_fb}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
