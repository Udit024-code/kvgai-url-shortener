# 🛡️ SecurePath AI
### Next-Gen URL Infrastructure & Automated Cyber-Threat Mitigation Matrix

SecurePath AI is a production-grade, full-stack URL shortening ecosystem featuring dynamic AI-driven safety isolation, automatic QR code asset distribution, and real-time click telemetry metrics. 

🔗 **Live Deployment Portal:** [https://securepath-ai.vercel.app/](https://securepath-ai.vercel.app/)  
⚙️ **Interactive API Documentation:** [https://securepath-backend.onrender.com/docs](https://securepath-backend.onrender.com/docs)

---

## 🚀 Key Features

* **🔀 Smart URL Condensation:** Generates ultra-low latency, cryptographically secure 6-character routing slugs or user-defined custom aliases.
* **🤖 Dual-Layer Threat Mitigation Engine:** Features parallel filtering powered by the **Google Gemini AI Engine** coupled with hardcoded fallback safety heuristics to isolate phishing traps, brand-mimicking domain exploits, and malicious payload paths.
* **📊 Analytics & Telemetry Matrix:** Monitors real-time click interactions, traffic logs, and safety flags across an optimized live database stream, complete with visual color-coded risk indicators.
* **🖼️ Dynamic QR Code Synthesis:** Instant on-the-fly execution and rendering of high-density QR asset modules for every shortened deployment.
* **🎛️ Unified Operations Control:** Outfitted with async data hydration controls allowing instant manual dashboard refreshing and database sanitization operations.

---

## 📐 System Pipeline Architecture

```text
[ Client Browser ] ----(HTTPS Requests)----> [ Vercel Edge Global CDN ]
       |                                                |
 (Dynamic UI Hydration)                         (JSON API Actions)
       |                                                v
       +-----------------------------------> [ FastAPI Backend (Render) ]
                                                        |
                                       +----------------+----------------+
                                       |                                 |
                                       v                                 v
                        [ Gemini AI Safety Engine ]        [ Neon Serverless PostgreSQL ]
                        (Predictive Risk Scoring)          (Singapore Region Pool)
```

1. **Edge Client Delivery:** The frontend is statically optimized and delivered globally over Vercel's Edge Network.
2. **Asynchronous API Interception:** Requests hitting the FastAPI gateway are asynchronously parsed and dispatched into the security analysis layer.
3. **Dual-Layer Inspection Pipeline:** The destination target is evaluated against predictive AI heuristics via the Gemini API model to return structural safety risk categories (`Safe`, `Suspicious`, or `Dangerous`).
4. **Relational Data Storage:** Records match to a high-availability serverless PostgreSQL instance (Neon.tech) optimized for high-write click throughput.

---

## 🛠️ Deep Tech Stack

| Layer | Component Technology | Deployment Architecture |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / CSS3 / Vanilla Modern JS (ES6+) | Vercel Edge Platform |
| **Backend** | FastAPI (Python) / Async ASGI Execution / SQLAlchemy ORM | Render Container Cloud |
| **Database** | PostgreSQL Serverless Engine | Neon.tech (Singapore Node) |
| **Cognitive** | Google GenAI SDK (`gemini-2.5-flash`) | Google Vertex AI Network |

---

## 🔌 Core API Architecture Engine

### Data Model Payloads
```json
{
  "original_url": "string",
  "custom_alias": "string (optional)"
}
```

### Route Operations Registry
| Method | Endpoint | Access Scope | Functional Responsibility |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | System Health Metrics Verification |
| `POST` | `/shorten` | Public | Executes safety analysis pipeline & creates mapping record |
| `GET` | `/analytics` | Dashboard | Fetches complete database transaction logs & summaries |
| `DELETE` | `/clear-all` | Administrator | Hard resets database instances & purges telemetry history |
| `GET` | `/{short_code}` | Public | Registers click interaction count and executes 307 redirect |

---

## 🧪 Official Evaluation Test Cases

To verify the predictive capabilities, fallback heuristics, and UI dynamic rendering of the SecurePath AI Pipeline, use the following standardized evaluation vectors:

### 🟢 1. Safe Destination Verification
* **Target URL:** `https://www.wikipedia.org`
* **Expected UI Behavior:** Renders a green `SAFE` status badge and returns a verified legitimacy summary confirming an authenticated domain.

### 🟡 2. Pattern Matching Heuristics (Suspicious)
* **Target URL:** `https://my-test-domain-sketchy.com`
* **Expected UI Behavior:** Triggers a yellow `SUSPICIOUS` risk badge, signaling the detection of high-risk keyword parameters within unverified hosting blocks.

### 🔴 3. Automated Isolation (Dangerous Phishing)
* **Target URL:** `https://paypal-secure-update-signin.com`
* **Expected UI Behavior:** Quarantines the link under a red `DANGEROUS` badge alert, capturing malicious brand-mimicking domain keywords and phishing indicators.

---

## 💻 Local Workspace Engineering Setup

### Environment Declarations
Create a hidden configuration layout file named `.env` inside your root `/backend` folder directory path:
```env
DATABASE_URL=postgresql://your_user:your_password@your_neon_host/dbname?sslmode=require
GEMINI_API_KEY=AIzaSyYourProductionGoogleGeminiKeyHere
```

### Installation Steps

**1. Service Node Blueprint Preparation (Backend)**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**2. Client Space Execution (Frontend)**
Because the client layer utilizes native asynchronous module engines, you can serve the root directory path files using any standard live workspace server (like VS Code Live Server) or execute natively directly from your environment deployment space.
```bash
cd ../frontend
# Open index.html inside your live server environment layout context
```
