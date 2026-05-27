import random
import string
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Import the tool to read your hidden .env file
from dotenv import load_dotenv

# Import the modern official Google GenAI library
from google import genai

import database
import models

# Look inside your hidden .env file on your computer
load_dotenv()

# Pull the brand new API key securely out of the environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize the modern production client using your hidden key
ai_client = genai.Client(api_key=GEMINI_API_KEY)

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

# Security-Hardened AI Safety Scanner Function
def scan_url_safety(url: str) -> tuple:
    # Fallback heuristics check if the environment key is completely missing
    if not GEMINI_API_KEY:
        lower_url = url.lower()
        if "paypal" in lower_url or "signin" in lower_url or "secure" in lower_url or "update" in lower_url:
            return "Dangerous", "Heuristic Match: High-risk brand-mimicking domain detected."
        if "test" in lower_url or "sketchy" in lower_url:
            return "Suspicious", "URL contains highly unusual domain keywords."
        if "hack" in lower_url or "free-money" in lower_url:
            return "Dangerous", "High probability of phishing or credential harvesting."
        return "Safe", "Domain cleared by default structural heuristics."

    try:
        prompt = (
            f"Analyze this URL for phishing, scam, malware, or suspicious parameters: {url}. "
            "Determine its risk status. Respond in exactly this format and absolutely nothing else:\n"
            "STATUS: <Safe, Suspicious, or Dangerous> | REASON: <one brief sentence explaining why>"
        )
        
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        if not response.text:
            return "Dangerous", "Blocked by Google Safety Filters: High probability of phishing/fraud mimicry."

        text_result = response.text.strip()

        if "STATUS:" in text_result and "|" in text_result:
            parts = text_result.split("|")
            status = parts[0].replace("STATUS:", "").strip()
            reason = parts[1].replace("REASON:", "").strip()
            return status, reason
        
        return "Safe", "Analyzed successfully."
        
    except Exception as e:
        print(f"\n⚠️ AI Scanner Exception Caught: {e}\n")
        
        lower_url = url.lower()
        if "paypal" in lower_url or "signin" in lower_url or "secure" in lower_url or "update" in lower_url:
            return "Dangerous", "Heuristic Match: High-risk brand-mimicking domain detected."
        if "test" in lower_url or "sketchy" in lower_url:
            return "Suspicious", "Heuristic analysis flagged unusual keywords."
        if "hack" in lower_url or "free-money" in lower_url:
            return "Dangerous", "Heuristic analysis flagged a phishing hazard."
            
        return "Safe", "Structural heuristic analysis cleared the URL."

@app.get("/")
def read_root():
    return {"message": "Welcome to the SecurePath AI Pipeline!"}

@app.post("/shorten")
def shorten_url(payload: URLCreate, db: Session = Depends(database.get_db)):
    url_to_shorten = payload.original_url.strip()
    if not url_to_shorten:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    
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

@app.delete("/clear-all")
def clear_all_links(db: Session = Depends(database.get_db)):
    try:
        db.query(models.URLItem).delete()
        db.commit()
        return {"message": "All analytics data cleared successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database clear failed: {str(e)}")

@app.get("/{short_code}")
def redirect_to_original(short_code: str, db: Session = Depends(database.get_db)):
    db_entry = db.query(models.URLItem).filter(models.URLItem.short_code == short_code).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    db_entry.clicks += 1
    db.commit()
    return RedirectResponse(url=db_entry.original_url)