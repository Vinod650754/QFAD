from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from model_store import MODEL_PATH, load_model, predict_payload

app = FastAPI(title="Question For The Day ML Service", version="1.0.0")


class PredictionRequest(BaseModel):
    accuracy: float = 0.0
    streak: int = 0
    weak_topics: List[str] = Field(default_factory=list)
    solved_difficulty: float = 1.0
    avg_time: float = 0.0


model_bundle = None
model_load_error: Optional[str] = None


@app.on_event("startup")
def startup_event():
    global model_bundle, model_load_error
    try:
        model_bundle = load_model(MODEL_PATH)
        model_load_error = None
    except FileNotFoundError as exc:
        model_bundle = None
        model_load_error = str(exc)


@app.get("/health")
def health():
    return {
        "ok": model_bundle is not None,
        "model_loaded": model_bundle is not None,
        "model_path": str(MODEL_PATH),
        "model_status": "loaded" if model_bundle is not None else "missing",
        "error": model_load_error,
    }


@app.post("/predict")
def predict_next(payload: PredictionRequest):
    if model_bundle is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model not loaded. Create a trained model locally with `python train.py` "
                "and place it at `models/model.pkl` before deployment."
            ),
        )
    return predict_payload(payload, model_bundle)
