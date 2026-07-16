# test_main.py
"""
Personalized Networking Assistant - Pytest Unit Test Suite
Verifies API routes, data validation schemas, services, and persistence layers.
"""

import os
import json
from fastapi.testclient import TestClient

# Import FastAPI app
from main import app, HISTORY_FILE, FEEDBACK_FILE

client = TestClient(app)

def setup_module(module):
    """
    Setup temporary state files for isolated testing.
    """
    # Backup existing database files if they exist
    if os.path.exists(HISTORY_FILE):
        os.rename(HISTORY_FILE, HISTORY_FILE + ".bak")
    if os.path.exists(FEEDBACK_FILE):
        os.rename(FEEDBACK_FILE, FEEDBACK_FILE + ".bak")

def teardown_module(module):
    """
    Teardown and restore prior local state files.
    """
    # Remove test files
    if os.path.exists(HISTORY_FILE):
        os.remove(HISTORY_FILE)
    if os.path.exists(FEEDBACK_FILE):
        os.remove(FEEDBACK_FILE)

    # Restore backup
    if os.path.exists(HISTORY_FILE + ".bak"):
        os.rename(HISTORY_FILE + ".bak", HISTORY_FILE)
    if os.path.exists(FEEDBACK_FILE + ".bak"):
        os.rename(FEEDBACK_FILE + ".bak", FEEDBACK_FILE)


def test_analyze_event_success():
    """
    Test event theme classification returns expected categories.
    """
    response = client.post(
        "/analyze-event",
        json={"eventDescription": "Workshop on Deep Learning and AI tools for smart cities", "userInterests": "AI"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "themes" in data
    assert isinstance(data["themes"], list)
    # At least "Artificial Intelligence" or "Smart Cities" should be classified
    assert len(data["themes"]) > 0


def test_analyze_event_validation_error():
    """
    Test empty request payloads return HTTP 422 or 400.
    """
    response = client.post("/analyze-event", json={"eventDescription": ""})
    assert response.status_code == 400


def test_generate_conversation_success():
    """
    Test full pipeline generation completes and logs starter histories.
    """
    payload = {
        "eventDescription": "Blockchain in Healthcare meetup",
        "interests": "secure records",
        "goals": "find collaborators",
        "themes": ["Blockchain", "Healthcare"]
    }
    response = client.post("/generate-conversation", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert "id" in data
    assert "starters" in data
    assert len(data["starters"]) == 3
    assert data["starters"][0]["type"] == "Icebreaker"
    assert data["starters"][1]["type"] == "Topic-Specific"
    assert data["starters"][2]["type"] == "Goal-Oriented"


def test_fact_check_success():
    """
    Test real-time Wikipedia search returns valid payload.
    """
    response = client.get("/fact-check?query=blockchain")
    assert response.status_code == 200
    data = response.json()
    assert "found" in data
    if data["found"]:
        assert "title" in data
        assert "summary" in data
        assert "url" in data


def test_submit_feedback_success():
    """
    Test that thumbs-up logs successfully register.
    """
    # 1. Create a history starter first
    payload = {
        "eventDescription": "SaaS growth meetup",
        "interests": "cloud infrastructure",
        "goals": "get feedback",
        "themes": ["SaaS & Cloud"]
    }
    res_gen = client.post("/generate-conversation", json=payload)
    starter_id = res_gen.json()["id"]

    # 2. Submit rating feedback
    feedback_payload = {
        "starterId": starter_id,
        "rating": "useful",
        "feedbackText": "Great options!"
    }
    response = client.post("/feedback", json=feedback_payload)
    assert response.status_code == 200
    assert response.json()["success"] is True

    # 3. Check history has rating updated
    history_resp = client.get("/history")
    latest_item = history_resp.json()[0]
    assert latest_item["id"] == starter_id
    assert latest_item["rating"] == "useful"
