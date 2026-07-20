"""
Repote AI Assistant - Backend API
FastAPI + DeepSeek integration for FRP/flashing assistance
"""

import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Repote AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

# Load models and FRP data
def load_models():
    try:
        with open("../src/data/screen_catalog.json", "r") as f:
            return json.load(f)
    except:
        return []

SCREENS = load_models()

FRP_KNOWLEDGE = """
KNOWLEDGE BASE: FRP UNLOCK METHODS BY CHIPSET

SPD (Spreadtrum/Unisoc):
- Used in: Tecno (Spark, Pop, Camon entry), Infinix (Smart, Hot entry), 
  Alcatel (1 series), Samsung (A03, A02, A12), ZTE Blade
- Tools: SPD Flash Tool, Research Download, UMT (Unlockroot Module Tool)
- Method: Flash with SPD tool, format + auth file

BROM (MediaTek):
- Used in: Xiaomi/Redmi/POCO, Tecno (Camon Pro, Pova), Infinix (Note, Zero, Hot),
  Huawei (Kirin), Motorola (Dimensity models), LG (K series)
- Tools: MTK Bypass Tool, UMT, Miracle Box, SP Flash Tool
- Method: BROM mode (vol down + power), bypass auth with Bypass Tool

Testpoint (Qualcomm):
- Used in: Samsung (S series, A series mid/high), Motorola (Moto G), 
  LG (G series, V series), Google Pixel
- Tools: QPST, QFIL, UMT, Octoplus
- Method: Short testpoint pins, load Firehose/Programmer in EDL mode

EDL (Qualcomm Emergency Download):
- Used in: Samsung (Snapdragon), Motorola (Edge, G), LG, OnePlus
- Tools: QFIL, UMT, Octoplus, Chimera
- Method: Enter EDL mode (vol up+down, or testpoint), flash with Firehose loader

Bypass Software:
- Used in: Samsung (One UI 6+), Apple (iOS 15+), Google Pixel (Tensor)
- Method: Software unlock tools, specific account removal
- Samsung: SamFW FRP Tool, Octoplus Samsung
- Apple: iCloud bypass tools (checkm8 devices)

Octoplus/Octopus Box:
- Universal tool for Samsung, Huawei, LG, Alcatel
- Supports FRP unlock, network unlock, firmware flashing

UMT (UnlockRoot Module Tool):
- Universal for SPD + BROM devices
- Great for Tecno, Infinix, Xiaomi entry level
"""

SYSTEM_PROMPT = f"""Eres un asistente experto en reparación de teléfonos móviles, 
especializado en FRP (Factory Reset Protection), desbloqueo y reparación de software.

Tienes acceso a un catálogo de {len(SCREENS)} pantallas de repuesto con precios.

Tu función es:
1. Ayudar a identificar el método FRP correcto según el modelo y chipset
2. Sugerir herramientas y pasos para flashear/unlock
3. Recomendar pantallas compatibles y sus precios
4. Responder preguntas técnicas sobre reparación

Sé conciso, práctico y específico. Usa la base de conocimientos incluida.

{FRP_KNOWLEDGE}
"""

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not DEEPSEEK_API_KEY:
        # Fallback: rule-based responses when no API key
        return ChatResponse(response=fallback_response(req.message))

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
    ]
    for h in req.history[-10:]:
        messages.append(h)
    messages.append({"role": "user", "content": req.message})

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": DEEPSEEK_MODEL,
                    "messages": messages,
                    "max_tokens": 1024,
                    "temperature": 0.7,
                    "stream": False,
                },
            )
            data = resp.json()
            return ChatResponse(response=data["choices"][0]["message"]["content"])
        except Exception as e:
            return ChatResponse(response=fallback_response(req.message))


@app.get("/api/health")
async def health():
    return {"status": "ok", "screens_count": len(SCREENS)}


def fallback_response(msg: str) -> str:
    """Rule-based fallback when DeepSeek API is not configured."""
    msg_lower = msg.lower()
    
    if "frp" in msg_lower or "metodo" in msg_lower or "desbloqueo" in msg_lower:
        return (
            "Para FRP, el método depende del chipset:\n\n"
            "📱 **SPD (Unisoc)** → Tecno Spark/Pop, Infinix Smart, Samsung A03/A12\n"
            "  Usa: SPD Flash Tool + Research Download\n\n"
            "📱 **BROM (MediaTek)** → Xiaomi/Redmi, Tecno Camon, Infinix Note\n"
            "  Usa: MTK Bypass Tool + SP Flash Tool\n\n"
            "📱 **Testpoint (Qualcomm)** → Samsung S/A, Moto G, LG\n"
            "  Usa: QPST/QFIL + Firehose loader\n\n"
            "¿Qué modelo tienes y te ayudo con el método exacto?"
        )
    
    if "pantalla" in msg_lower or "screen" in msg_lower or "precio" in msg_lower:
        if SCREENS:
            # Find matching screens
            results = []
            for s in SCREENS[:5]:
                results.append(f"  • {s['brand']} {s['model']} | {s['screenType']} | ${s['retailPrice']:.2f}")
            return (
                "📱 **Pantallas disponibles** (muestra):\n" + 
                "\n".join(results) + 
                "\n\n¿Buscas alguna pantalla en específico?"
            )
        return "El catálogo de pantallas está disponible en la sección Pantallas de la app."
    
    if any(w in msg_lower for w in ["hola", "buenos", "ayuda", "help"]):
        return (
            "👋 ¡Hola! Soy el asistente Repote. Puedo ayudarte con:\n\n"
            "• 🔓 **FRP/Desbloqueo** - Métodos por modelo y chipset\n"
            "• 📱 **Pantallas** - Precios y compatibilidad\n"
            "• ⚡ **Flasheo** - Herramientas y procedimientos\n"
            "• 🔧 **Reparación** - Diagnóstico y soluciones\n\n"
            "¿En qué te ayudo?"
        )

    return (
        "Soy el asistente IA de Repote. "
        "Puedo ayudarte con FRP, flasheo, pantallas y reparación de teléfonos. "
        "¿Qué necesitas? (Configura DEEPSEEK_API_KEY para respuestas con IA completa)"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
