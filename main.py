import os
import json
import urllib.request
import urllib.parse
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ListMaster AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

class ProductRequest(BaseModel):
    product_name: str

SYSTEM_PROMPT = """You are an expert E-Commerce copywriter and listing optimizer.
Generate highly optimized, platform-specific product listings for Amazon, Flipkart, and Meesho based on the product provided.

Follow these platform guidelines:
1. Amazon: SEO-heavy long title, 5 detailed bullet points (benefits and features), a professional description, and backend search terms.
2. Flipkart: Crisp and clean title, 4-5 short bulleted "Highlights", and clear specifications (key-value pairs).
3. Meesho: Very simple and short title, a value-focused short description in simple English (geared towards Indian budget buyers), and a list of comma-separated raw tags.

Output your response STRICTLY as a valid JSON object matching the following structure exactly (do not include markdown formatting like ```json):
{
  "amazon": {
    "title": "string",
    "bullet_points": ["string", "string"],
    "description": "string",
    "search_terms": "string"
  },
  "flipkart": {
    "title": "string",
    "highlights": ["string", "string"],
    "specifications": {"string": "string"}
  },
  "meesho": {
    "title": "string",
    "description": "string",
    "tags": "string"
  }
}"""

@app.post("/api/analyze-product")
async def analyze_product(req: ProductRequest):
    if not req.product_name.strip():
        raise HTTPException(status_code=400, detail="Product name cannot be empty.")
        
    try:
        # Build prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\nProduct Details:\n{req.product_name.strip()}"
        encoded_prompt = urllib.parse.quote(full_prompt)
        url = f"https://text.pollinations.ai/{encoded_prompt}?json=true"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'ListMaster/1.0'})
        with urllib.request.urlopen(req) as response:
            text_res = response.read().decode('utf-8').strip()
            
        # Clean response
        text_res = text_res.strip()
        start_idx = text_res.find('{')
        end_idx = text_res.rfind('}')
        if start_idx != -1 and end_idx != -1:
            text_res = text_res[start_idx:end_idx+1]
            
        json_data = json.loads(text_res)
        return JSONResponse(content=json_data)
        
    except json.JSONDecodeError:
        print("JSON Error:", text_res)
        raise HTTPException(status_code=500, detail="AI returned invalid data format. Please try again.")
    except Exception as e:
        print(f"API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Static UI routes
@app.get("/favicon.ico")
def get_favicon():
    favicon_path = os.path.join(FRONTEND_DIR, "favicon.png")
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path, media_type="image/png")
    raise HTTPException(status_code=404)

@app.get("/static/style.css")
def get_style():
    style_path = os.path.join(FRONTEND_DIR, "style.css")
    if os.path.exists(style_path):
        return FileResponse(style_path, media_type="text/css")
    raise HTTPException(status_code=404)

@app.get("/static/script.js")
def get_script():
    script_path = os.path.join(FRONTEND_DIR, "script.js")
    if os.path.exists(script_path):
        return FileResponse(script_path, media_type="application/javascript")
    raise HTTPException(status_code=404)

@app.get("/")
def get_index():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"message": "FastAPI is running! Create index.html in frontend folder."})
