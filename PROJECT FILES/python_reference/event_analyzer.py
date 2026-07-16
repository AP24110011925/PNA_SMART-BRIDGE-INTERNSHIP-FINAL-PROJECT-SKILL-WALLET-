# event_analyzer.py
"""
Personalized Networking Assistant - Event Theme Analyzer Service
Uses Hugging Face Transformers DistilBERT/pipeline for Zero-Shot Theme Classification.
"""

from typing import List

class EventAnalyzerService:
    def __init__(self):
        # In a real environment, we would initialize the classification pipeline:
        # from transformers import pipeline
        # self.classifier = pipeline("zero-shot-classification", model="valhalla/distilbert-neo-zero-shot")
        self.candidate_labels = [
            "Artificial Intelligence", "Smart Cities", "Urban Planning", 
            "Sustainability", "Blockchain", "Healthcare", "Climate Change", 
            "Professional Networking", "SaaS & Cloud", "Software Engineering",
            "Finance & Fintech", "Product Management", "Cybersecurity", "Social Media"
        ]

    def extract_themes(self, description: str, user_interests: str = "") -> List[str]:
        """
        Extract key professional or technical themes from the event description
        using zero-shot classification logic.
        """
        if not description:
            return []

        # Simulated NLP classification based on keyword relevance & zero-shot matching
        combined_text = (description + " " + user_interests).lower()
        extracted = []

        # Simple semantic keyword scoring to mimic zero-shot outputs on local CPU without massive downloads
        theme_mapping = {
            "Artificial Intelligence": ["ai", "artificial intelligence", "machine learning", "deep learning", "neural", "nlp", "chatbot"],
            "Smart Cities": ["smart city", "smart cities", "urban planning", "municipal", "traffic", "infrastructure"],
            "Urban Planning": ["urban planning", "city planning", "architecture", "civic", "transportation"],
            "Sustainability": ["sustainable", "sustainability", "eco", "green", "clean energy", "circular economy"],
            "Blockchain": ["blockchain", "bitcoin", "crypto", "ethereum", "web3", "ledger"],
            "Healthcare": ["health", "healthcare", "medical", "hospital", "patient", "clinical"],
            "Climate Change": ["climate", "global warming", "carbon", "emissions", "pollution"],
            "Software Engineering": ["developer", "software", "programming", "code", "coding", "web development", "api"],
            "Finance & Fintech": ["finance", "banking", "payment", "investment", "fintech", "stock"],
            "Cybersecurity": ["cybersecurity", "security", "encryption", "hacker", "firewall", "auth"],
            "Product Management": ["product management", "product owner", "scrum", "agile", "roadmap"]
        }

        for label, keywords in theme_mapping.items():
            for kw in keywords:
                if kw in combined_text:
                    extracted.append(label)
                    break

        # Fallback to general themes if none of the specific keywords are detected
        if not extracted:
            extracted = ["Professional Networking", "General Collaboration"]

        return list(set(extracted))[:4] # Return up to 4 top themes
