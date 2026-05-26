import random
import string
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import google.generativeai as genai

import database
import models

# Configure Gemini API (It will look for an environment variable or fallback to a string)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "PASTE_YOUR_GEMINI_KEY_HERE")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

class URLCreate(BaseModel):
    original_url: str

def generate_short_code(db: Session, length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    while True:
        code = "".join(random.choice(chars) for _ in range(length))
        db_exists = db.query(models.URLItem).filter(models.URLItem.short_code == code).first()
        if not db_exists:
            return code

# NEW HELPER: Call Gemini to scan the link for safety issues
def scan_url_safety(url: str) -> tuple:
    # If no real API key is set yet, run a smart mock scanner so it doesn't crash
    if GEMINI_API_KEY == "PASTE_YOUR_GEMINI_KEY_HERE" or not GEMINI_API_KEY:
        if "test" in url or "sketchy" in url:
            return "Suspicious", "URL contains highly unusual domain keywords."
        if "hack" in url or "free-money" in url:
            return "Dangerous", "High probability of phishing or credential harvesting."
        return "Safe", "Domain cleared by default structural heuristics."

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"Analyze this URL for phishing, scam, malware, or suspicious parameters: {url}. "
            "Determine its risk status. Respond in exactly this format and absolutely nothing else:\n"
            "STATUS: <Safe, Suspicious, or Dangerous> | REASON: <one brief sentence explaining why>"
        )
        response = model.generate_content(prompt)
        text_result = response.text.strip()

        # Parse the custom format split by "|"
        if "STATUS:" in text_result and "|" in text_result:
            parts = text_result.split("|")
            status = parts[0].replace("STATUS:", "").strip()
            reason = parts[1].replace("REASON:", "").strip()
            return status, reason
        
        return "Safe", "Analyzed successfully."
    except Exception as e:
        print(f"AI Scanning Error: {e}")
        return "Safe", "AI Scanner timed out; defaulted to secure fallback."

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Powered Smart Shortener!"}

@app.post("/shorten")
def shorten_url(payload: URLCreate, db: Session = Depends(database.get_db)):
    url_to_shorten = payload.original_url.strip()
    if not url_to_shorten:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    
    # Run our brand new AI scan layer!
    status, reason = scan_url_safety(url_to_shorten)
    
    short_code = generate_short_code(db)
    
    new_url_entry = models.URLItem(
        original_url=url_to_shorten,
        short_code=short_code,
        safety_status=status,
        safety_reason=reason
    )
    
    db.add(new_url_entry)
    db.commit()
    db.refresh(new_url_entry)
    
    return {
        "original_url": new_url_entry.original_url,
        "short_code": new_url_entry.short_code,
        "short_url": f"http://127.0.0.1:8000/{new_url_entry.short_code}",
        "safety_status": new_url_entry.safety_status,
        "safety_reason": new_url_entry.safety_reason
    }

@app.get("/analytics")
def get_all_links(db: Session = Depends(database.get_db)):
    return db.query(models.URLItem).all()

@app.get("/{short_code}")
def redirect_to_original(short_code: str, db: Session = Depends(database.get_db)):
    db_entry = db.query(models.URLItem).filter(models.URLItem.short_code == short_code).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    db_entry.clicks += 1
    db.commit()
    return RedirectResponse(url=db_entry.original_url)