from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Dict, List, Optional

from .model_store import MODEL_PATH, predict, train_model

app = FastAPI(title="Question For The Day ML Service", version="1.0.0")


class PredictionRequest(BaseModel):
    accuracy: float = 0
    streak: int = 0
    weak_topics: List[str] = Field(default_factory=list)
    solved_difficulty: float = 1
    avg_time: float = 0


class TrainRequest(BaseModel):
    rows: Optional[List[Dict]] = None


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "question-for-the-day-ml",
        "model_loaded": MODEL_PATH.exists(),
    }


@app.post("/predict")
def predict_next(payload: PredictionRequest):
    prediction, confidence = predict(payload)
    return {**prediction, "confidence": confidence}


@app.post("/train")
def train(payload: TrainRequest):
    metrics = train_model(payload.rows or [])
    return {"ok": True, "metrics": metrics}


@app.post("/recommend")
def recommend_compat(payload: Dict):
    features = payload.get("user_features", {})
    request = PredictionRequest(
        accuracy=features.get("accuracy", 0),
        streak=features.get("streak", 0),
        weak_topics=features.get("weakTopics", []),
        solved_difficulty=features.get("solvedDifficulty", 1),
        avg_time=features.get("avgTime", 0),
    )
    prediction, confidence = predict(request)
    candidates = payload.get("candidates", [])
    selected = sorted(
        candidates,
        key=lambda item: (
            item.get("topic") == prediction["topic"],
            item.get("difficulty") == prediction["difficulty"],
        ),
        reverse=True,
    )
    return {
        "questionId": selected[0].get("id") if selected else None,
        "targetDifficulty": prediction["difficulty"],
        "targetTopic": prediction["topic"],
        "confidence": confidence,
        "reason": prediction["reason"],
    }
