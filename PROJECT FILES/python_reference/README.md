# Personalized Networking Assistant - Python VS Code Implementation

This sub-folder contains a complete, production-ready python implementation of the **Personalized Networking Assistant** using **FastAPI** for backend API services and **Streamlit** for the frontend UI. It utilizes the exact modular architecture requested for Epic 1 through Epic 5.

## 📁 File Structure

- `main.py` - FastAPI entry point holding API routes and file persistence schemas.
- `event_analyzer.py` - Core service module for zero-shot thematic event classification (mimics DistilBERT).
- `topic_generator.py` - Core service module for generating conversational networking openings (mimics GPT-2).
- `fact_checker.py` - Core service module utilizing Wikipedia REST APIs to perform live fact checking.
- `test_main.py` - Complete test suite using `pytest` and `httpx` testing clients.
- `app.py` - Interactive Streamlit visual interface.

---

## 🚀 Setup & Execution Guide

Follow these steps to run the application locally on your computer inside **Visual Studio Code**:

### 1. Prerequisite Setup
Ensure you have **Python 3.10 or higher** installed on your system.

### 2. Open Project in VS Code
Open VS Code, choose **File > Open Folder...**, and select this `/python_reference` directory.

### 3. Create a Virtual Environment
Open the VS Code Terminal (Ctrl + ` or Cmd + `) and create a Python virtual environment to isolate dependencies:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies
Install all the required python modules using pip:
```bash
pip install -r requirements.txt
```

### 5. Start the FastAPI Backend
Run the backend web server using `uvicorn`:
```bash
python main.py
```
The FastAPI documentation (Swagger UI) will become available at:
👉 **http://localhost:8000/docs**

### 6. Launch the Streamlit Frontend
Open a new terminal session in VS Code (keep the first uvicorn server running!), activate the virtual environment, and boot the Streamlit app:
```bash
# Activate env again if needed
source venv/bin/activate # or venv\Scripts\activate on Windows

# Launch Streamlit
streamlit run app.py
```
The browser will automatically open:
👉 **http://localhost:8501**

---

## 🧪 Running Unit Tests
To verify all routes, schemas, and data persistence modules, execute `pytest` in your terminal:
```bash
pytest test_main.py -v
```
All unit tests should complete successfully, printing details on each of the service checks!
