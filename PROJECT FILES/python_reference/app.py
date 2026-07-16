# app.py
"""
Personalized Networking Assistant - Streamlit Frontend
Provides an interactive dashboard UI that communicates with the FastAPI backend.
"""

import streamlit as st
import requests

# FastAPI Backend URL (default running locally)
BACKEND_URL = "http://localhost:3000/api" # Maps to Node backend or FastAPI's port 8000

st.set_page_config(
    page_title="Personalized Networking Assistant",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Style styling
st.markdown("""
<style>
    .main-header { font-size: 36px; font-weight: 700; color: #1E3A8A; margin-bottom: 20px; }
    .card { background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin-bottom: 15px; }
    .badge { background-color: #3B82F6; color: white; padding: 4px 8px; border-radius: 5px; font-size: 12px; font-weight: bold; }
    .starter-quote { font-style: italic; font-size: 18px; color: #111827; border-left: 4px solid #10B981; padding-left: 10px; margin: 10px 0; }
</style>
""", unsafe_allow_html=True)

st.title("🤝 Personalized Networking Assistant")
st.write("An AI-powered assistant designed to generate smart, tailored conversation starters and verify facts prior to attending networking events.")

# Sidebar - Instructions & Quick Info
st.sidebar.header("Navigation")
page = st.sidebar.radio("Go to", ["Generate Starters", "Quick Fact Verification", "Past Strategies History"])

st.sidebar.markdown("---")
st.sidebar.info("""
**AI Models Utilized:**
- **DistilBERT** (Zero-shot classification for event theme extraction)
- **GPT-2** (Causal generation for conversation prompts)
- **Wikipedia API** (Live fact-checking of technical concepts)
""")

# ==========================================
# PAGE 1: Generate Starters
# ==========================================
if page == "Generate Starters":
    st.header("🎯 Generate Smart Conversation Starters")
    st.write("Enter the networking event details and your interests below. The assistant will classify the themes and draft customized openings.")

    col1, col2 = st.columns([3, 2])

    with col1:
        event_description = st.text_area(
            "Event Description", 
            placeholder="e.g., AI for Sustainable Cities. Explores municipal engineering, smart grids, and green computing.",
            height=120
        )
        interests = st.text_input("My Specific Interests", placeholder="e.g., climate change, urban planning, green energy")
        goals = st.text_input("My Networking Goals", placeholder="e.g., looking for startup co-founders, looking for internship")

        generate_btn = st.button("🚀 Analyze Event & Generate Starters", type="primary")

    with col2:
        st.subheader("💡 Tips for Good Networking")
        st.info("""
        1. **Listen more than you talk.**
        2. **Refer to context.** Use contextual indicators like the physical location or key speaker sessions.
        3. **Have a clear goal.** Know if you are seeking a job, a mentor, or simply learning about a new technical stack.
        """)

    if generate_btn:
        if not event_description:
            st.error("Please enter an event description before generating.")
        else:
            with st.spinner("Classifying themes and generating conversational models..."):
                try:
                    # Step 1: Call Event Analyzer (mimics DistilBERT Zero-Shot)
                    theme_resp = requests.post(
                        f"{BACKEND_URL}/analyze-event", 
                        json={"eventDescription": event_description, "userInterests": interests}
                    )
                    themes = theme_resp.json().get("themes", [])

                    st.success("Analysis Complete!")
                    st.subheader("🏷️ Extracted Event Themes")
                    
                    theme_badges = " ".join([f"<span class='badge'>{t}</span>" for t in themes])
                    st.markdown(theme_badges, unsafe_allow_html=True)

                    # Step 2: Call Starter Generator (mimics GPT-2 conditional generation)
                    starter_resp = requests.post(
                        f"{BACKEND_URL}/generate-conversation",
                        json={
                            "eventDescription": event_description,
                            "interests": interests,
                            "goals": goals,
                            "themes": themes
                        }
                    )
                    
                    data = starter_resp.json()
                    starters = data.get("starters", [])
                    starter_id = data.get("id")

                    st.markdown("---")
                    st.subheader("💬 Tailored Conversation Openings")

                    for idx, item in enumerate(starters):
                        with st.container():
                            st.markdown(f"**Option {idx+1}: {item['type']}**")
                            st.markdown(f"<div class='starter-quote'>{item['text']}</div>", unsafe_allow_html=True)
                            st.caption(f"*Why this works:* {item['explanation']}")
                            st.markdown("<br>", unsafe_allow_html=True)

                    # Quick feedback mechanism
                    st.write("Were these starters helpful?")
                    f_col1, f_col2 = st.columns(2)
                    with f_col1:
                        if st.button("👍 Yes, Useful!", key=f"yes_{starter_id}"):
                            requests.post(f"{BACKEND_URL}/feedback", json={"starterId": starter_id, "rating": "useful"})
                            st.toast("Thank you for your feedback!")
                    with f_col2:
                        if st.button("👎 No, Needs work", key=f"no_{starter_id}"):
                            requests.post(f"{BACKEND_URL}/feedback", json={"starterId": starter_id, "rating": "not_useful"})
                            st.toast("Logged feedback. We will refine future templates.")

                except Exception as e:
                    st.error(f"Failed to communicate with backend APIs: {str(e)}")

# ==========================================
# PAGE 2: Quick Fact Verification
# ==========================================
elif page == "Quick Fact Verification":
    st.header("🔍 Quick Fact Verification")
    st.write("Ensure your knowledge is precise before entering the conference room. Search any term or topic below to verify reliable definitions on-demand.")

    query = st.text_input("Enter Tech Term or Concept", placeholder="e.g., blockchain in healthcare, green computing, smart grids")
    verify_btn = st.button("Verify on Wikipedia", type="primary")

    if verify_btn:
        if not query:
            st.warning("Please enter a query.")
        else:
            with st.spinner("Retrieving verified page summaries..."):
                try:
                    resp = requests.get(f"{BACKEND_URL}/fact-check", params={"query": query})
                    data = resp.json()

                    if data.get("found"):
                        st.subheader(f"✅ {data.get('title')}")
                        
                        col_img, col_text = st.columns([1, 4])
                        with col_text:
                            st.markdown(f"<p style='font-size: 16px;'>{data.get('summary')}</p>", unsafe_allow_html=True)
                            st.markdown(f"[Read full page on Wikipedia ↗]({data.get('url')})")
                        with col_img:
                            if data.get("thumbnail"):
                                st.image(data.get("thumbnail"), width=150)
                            else:
                                st.write("No illustration available.")
                    else:
                        st.error(data.get("message", "Could not verify topic."))
                except Exception as e:
                    st.error(f"Error querying fact checker API: {str(e)}")

# ==========================================
# PAGE 3: Past Strategies History
# ==========================================
elif page == "Past Strategies History":
    st.header("📋 Past Strategies & Interaction Logs")
    st.write("Review your conversation starters history and track which prompts were marked helpful during your networking events.")

    try:
        resp = requests.get(f"{BACKEND_URL}/history")
        history_list = resp.json()

        if not history_list:
            st.info("No logs saved yet. Go to 'Generate Starters' to build your first strategy.")
        else:
            for item in history_list:
                status_icon = "👍 Helpful" if item.get("rating") == "useful" else ("👎 Needs Work" if item.get("rating") == "not_useful" else "⏳ Unrated")
                
                with st.expander(f"📅 {item['timestamp']} - Event: {item['eventDescription'][:50]}... ({status_icon})"):
                    st.write(f"**Full Event Description:** {item['eventDescription']}")
                    st.write(f"**Interests:** {item['interests']}")
                    st.write(f"**Goal:** {item['goals']}")
                    
                    themes_badges = " ".join([f"<span class='badge'>{t}</span>" for t in item.get("extractedThemes", [])])
                    st.markdown(f"**Extracted Themes:** {themes_badges}", unsafe_allow_html=True)
                    
                    st.markdown("---")
                    st.write("**Generated Starters:**")
                    for s in item.get("starters", []):
                        st.markdown(f"- *[{s['type']}]* **\"{s['text']}\"**")
                        st.caption(f"  *Tip:* {s['explanation']}")

    except Exception as e:
        st.error(f"Error retrieving history: {str(e)}")
