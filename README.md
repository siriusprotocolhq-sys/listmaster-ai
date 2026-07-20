# 📦 ListMaster AI

**ListMaster AI** is an intelligent web application designed to automatically generate highly optimized, platform-specific e-commerce product listings. With just a product name, it creates tailored titles, descriptions, and bullet points for Amazon, Flipkart, and Meesho.

## 🚀 Features
*   **Amazon Optimization:** Generates SEO-heavy titles, detailed bullet points, professional descriptions, and backend search terms.
*   **Flipkart Optimization:** Creates crisp titles, short highlights, and clear technical specifications.
*   **Meesho Optimization:** Produces simple, budget-buyer focused titles and descriptions along with raw tags.
*   **FastAPI Backend:** Lightweight, lightning-fast Python server.
*   **AI Integration:** Powered by the Pollinations AI text API for seamless natural language generation without the need for complex API keys.

## 🛠️ Tech Stack
*   **Backend:** Python, FastAPI, Uvicorn
*   **Frontend:** HTML, CSS, Vanilla JavaScript
*   **AI:** Pollinations Text AI

## ⚙️ Local Setup
1. Clone this repository.
2. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8020
   ```
4. Open your browser and go to `http://localhost:8020`

## 🌐 Deployment (Render)
This project is fully ready to be deployed on Render as a Web Service. 
*   **Build Command:** `pip install -r requirements.txt`
*   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
