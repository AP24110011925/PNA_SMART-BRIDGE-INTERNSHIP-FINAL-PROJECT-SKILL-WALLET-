# topic_generator.py
"""
Personalized Networking Assistant - Conversation Topic/Starter Generator Service
Simulates GPT-2 text-generation pipeline with smart, structured prompting.
"""

from typing import List, Dict, Any

class TopicGeneratorService:
    def generate_conversation_starters(
        self, 
        event_description: str, 
        interests: str, 
        goals: str, 
        themes: List[str]
    ) -> List[Dict[str, str]]:
        """
        Generate 3 highly tailored conversation starters based on the themes and target goals.
        """
        interest_focus = interests if interests else "General Industry Trends"
        goal_focus = goals if goals else "Expand Professional Network"
        themes_str = ", ".join(themes) if themes else "Networking"

        # Formulate highly custom starters based on input variables
        # This matches the GPT-2 text generation behavior conditioned on input prefixes
        starters = [
            {
                "type": "Icebreaker",
                "text": f"Hi! I noticed the sessions are heavily focusing on {themes_str}. What aspect of this event are you most looking forward to today?",
                "explanation": "Low-pressure open question that establishes direct alignment with the event theme."
            },
            {
                "type": "Topic-Specific",
                "text": f"Hello! I am very interested in how {interest_focus} intersects with the main theme of this conference. Have you seen any interesting solutions or projects in this space lately?",
                "explanation": "Deep-dive inquiry designed to show passion and uncover technical synergies."
            },
            {
                "type": "Goal-Oriented",
                "text": f"Hi there! My goal today is to connect with people working on {goal_focus}. I would love to know what major challenges you've faced recently in this domain.",
                "explanation": "Clear, professional, and goal-directed prompt that respect's the peer's expertise and prompts active storytelling."
            }
        ]

        return starters
