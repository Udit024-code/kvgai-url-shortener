import random
import string
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import database
import models

app = FastAPI()

# Add CORS middleware to allow the frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your local HTML file to talk to the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Automatically create the database tables inside links.db on startup
models.Base.metadata.create_all(bind=database.engine)

# Pydantic schema to validate data coming from the frontend
class URLCreate(BaseModel):
    original_url: str

# Helper function to generate a random 6-character string
def generate_short_code(db: Session, length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    while True:
        code = "".join(random.choice(chars) for _ in range(length))
        db_exists = db.query(models.URLItem).filter(models.URLItem.short_code == code).first()
        if not db_exists:
            return code

@app.get("/")
def read_root():
    return {"message": "Welcome to the URL Shortener API!"}

# ==========================================
# 1. POST ROUTES FIRST
# ==========================================
@app.post("/shorten")
def shorten_url(payload: URLCreate, db: Session = Depends(database.get_db)):
    url_to_shorten = payload.original_url.strip()
    if not url_to_shorten:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    
    short_code = generate_short_code(db)
    
    new_url_entry = models.URLItem(
        original_url=url_to_shorten,
        short_code=short_code
    )
    
    db.add(new_url_entry)
    db.commit()
    db.refresh(new_url_entry)
    
    return {
        "original_url": new_url_entry.original_url,
        "short_code": new_url_entry.short_code,
        "short_url": f"http://127.0.0.1:8000/{new_url_entry.short_code}"
    }

# ==========================================
# 2. STATIC GET ROUTES SECOND
# ==========================================
@app.get("/analytics")
def get_all_links(db: Session = Depends(database.get_db)):
    all_links = db.query(models.URLItem).all()
    return all_links

# ==========================================
# 3. WILDCARD / PARAMETER GET ROUTES LAST
# ==========================================
@app.get("/{short_code}")
def redirect_to_original(short_code: str, db: Session = Depends(database.get_db)):
    db_entry = db.query(models.URLItem).filter(models.URLItem.short_code == short_code).first()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    db_entry.clicks += 1
    db.commit()
    
    return RedirectResponse(url=db_entry.original_url)