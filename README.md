# kvgai-url-shortener
# SecurePath AI - Advanced URL Shortener & Analytics Pipeline

SecurePath AI is a production-grade, full-stack URL shortening application featuring automated AI safety filtering, dynamic QR code generation, and real-time click analytics. The project utilizes a fully decoupled cloud architecture for maximum speed, scalability, and security.

🔗 **Live Frontend:** https://securepath-ai.vercel.app/  
⚙️ **Live Backend API:** `https://securepath-backend.onrender.com/docs`

---

## 🚀 Key Features

* **Custom Aliases:** Users can define unique, memorable slugs for their shortened URLs.
* **AI Safety Screening:** Integrated with **Google Gemini AI** to automatically evaluate target URLs for malicious activity, phishing, or unsafe content before shortening.
* **Dynamic QR Codes:** Instantly generates downloadable QR codes for every shortened link.
* **Live Analytics:** Tracks destination click-through counts using an optimized database pipeline.
* **Cloud Architecture:** Fully decoupled client-server model utilizing managed cloud databases and edge delivery networks.

---

## 🛠️ Tech Stack

### Frontend
* **HTML5, CSS3, & Modern JavaScript (ES6+)** – Interactive, responsive UI.
* **Vercel** – Hosted globally on edge Content Delivery Networks (CDNs).

### Backend
* **FastAPI (Python)** – High-performance, asynchronous REST API.
* **SQLAlchemy** – Object-Relational Mapping (ORM) for secure database queries.
* **Uvicorn** – Light-speed ASGI server execution.
* **Render** – Containerized backend cloud hosting.

### Database & AI
* **PostgreSQL (Neon.tech)** – Serverless cloud database running connection pooling.
* **Google Gemini API** – Predictive AI integration for URL content safety assessments.

---

## 📐 System Architecture

The application operates on a modern microservices-inspired workflow:
1. **Frontend (Vercel)** dispatches user requests across secure HTTPS channels.
2. **Backend API (Render)** intercepts the payload, triggering a parallel security check via the **Gemini AI Engine**.
3. Upon safety clearance, relational data maps directly to a high-availability **PostgreSQL Instance (Neon)** located in the same geographic region (Singapore) to ensure ultra-low latency.

---

## 🛠️ Local Development Setup

### Prerequisites
* Python 3.10+
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/Udit024-code/kvgai-url-shortener.git](https://github.com/Udit024-code/kvgai-url-shortener.git)
cd kvgai-url-shortener