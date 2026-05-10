from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "recommendation_model.joblib"
METRICS_PATH = MODEL_DIR / "metrics.json"

DEFAULT_TOPICS = ["General", "JavaScript Arrays", "Chemistry", "Ratios", "Vocabulary", "Python Lists"]
DIFFICULTIES = ["Easy", "Medium", "Hard"]


def feature_vector(payload, topic_encoder: LabelEncoder) -> List[float]:
    weak_topic = (payload.weak_topics or ["General"])[0]
    known_topics = set(topic_encoder.classes_)
    topic_code = int(topic_encoder.transform([weak_topic])[0]) if weak_topic in known_topics else 0
    return [
        float(payload.accuracy),
        float(payload.streak),
        float(payload.solved_difficulty),
        float(payload.avg_time),
        float(len(payload.weak_topics or [])),
        float(topic_code),
    ]


def train_model(rows: List[Dict] | None = None) -> Dict:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    frame = build_training_frame(rows or [])
    difficulty_encoder = LabelEncoder().fit(DIFFICULTIES)
    topic_encoder = LabelEncoder().fit(sorted(set(DEFAULT_TOPICS + frame["target_topic"].tolist())))
    frame["weak_topic_code"] = topic_encoder.transform(frame["weak_topic"])
    features = frame[[
        "accuracy",
        "streak",
        "solved_difficulty",
        "avg_time",
        "weak_topic_count",
        "weak_topic_code",
    ]]

    y_difficulty = difficulty_encoder.transform(frame["target_difficulty"])
    y_topic = topic_encoder.transform(frame["target_topic"])

    x_train, x_test, yd_train, yd_test, yt_train, yt_test = train_test_split(
        features, y_difficulty, y_topic, test_size=0.25, random_state=42, stratify=y_topic
    )

    difficulty_model = RandomForestClassifier(n_estimators=80, random_state=42)
    topic_model = RandomForestClassifier(n_estimators=80, random_state=42)
    difficulty_model.fit(x_train, yd_train)
    topic_model.fit(x_train, yt_train)

    difficulty_accuracy = accuracy_score(yd_test, difficulty_model.predict(x_test))
    topic_accuracy = accuracy_score(yt_test, topic_model.predict(x_test))

    bundle = {
        "difficulty_model": difficulty_model,
        "topic_model": topic_model,
        "difficulty_encoder": difficulty_encoder,
        "topic_encoder": topic_encoder,
    }
    joblib.dump(bundle, MODEL_PATH)

    metrics = {
        "training_rows": int(len(frame)),
        "difficulty_accuracy": round(float(difficulty_accuracy), 4),
        "topic_accuracy": round(float(topic_accuracy), 4),
    }
    METRICS_PATH.write_text(pd.Series(metrics).to_json())
    return metrics


def predict(payload) -> Tuple[Dict, float]:
    bundle = load_or_train()
    topic_encoder = bundle["topic_encoder"]
    vector = pd.DataFrame(
        [feature_vector(payload, topic_encoder)],
        columns=[
            "accuracy",
            "streak",
            "solved_difficulty",
            "avg_time",
            "weak_topic_count",
            "weak_topic_code",
        ],
    )

    difficulty_model = bundle["difficulty_model"]
    topic_model = bundle["topic_model"]
    difficulty_encoder = bundle["difficulty_encoder"]
    difficulty_index = difficulty_model.predict(vector)[0]
    topic_index = topic_model.predict(vector)[0]

    difficulty_confidence = float(np.max(difficulty_model.predict_proba(vector)[0]))
    topic_confidence = float(np.max(topic_model.predict_proba(vector)[0]))

    recommended_topic = (payload.weak_topics or [None])[0] or str(topic_encoder.inverse_transform([topic_index])[0])

    return {
        "difficulty": str(difficulty_encoder.inverse_transform([difficulty_index])[0]),
        "topic": str(recommended_topic),
        "confidence": round((difficulty_confidence + topic_confidence) / 2, 4),
        "reason": "ML model prediction from performance features",
    }, round((difficulty_confidence + topic_confidence) / 2, 4)


def load_or_train() -> Dict:
    if not MODEL_PATH.exists():
        train_model()
    return joblib.load(MODEL_PATH)


def build_training_frame(rows: List[Dict]) -> pd.DataFrame:
    synthetic = []
    topics = sorted(set(DEFAULT_TOPICS + [str(row.get("topic", "General")) for row in rows]))
    for topic in topics:
        for difficulty in DIFFICULTIES:
            base = {"Easy": 1, "Medium": 2, "Hard": 3}[difficulty]
            synthetic.extend(
                [
                    {
                        "accuracy": 0.25,
                        "streak": 0,
                        "solved_difficulty": base,
                        "avg_time": 90,
                        "weak_topic_count": 2,
                        "weak_topic": topic,
                        "target_difficulty": "Easy",
                        "target_topic": topic,
                    },
                    {
                        "accuracy": 0.62,
                        "streak": 2,
                        "solved_difficulty": base,
                        "avg_time": 55,
                        "weak_topic_count": 1,
                        "weak_topic": topic,
                        "target_difficulty": difficulty,
                        "target_topic": topic,
                    },
                    {
                        "accuracy": 0.88,
                        "streak": 5,
                        "solved_difficulty": base,
                        "avg_time": 35,
                        "weak_topic_count": 0,
                        "weak_topic": topic,
                        "target_difficulty": DIFFICULTIES[min(2, base)],
                        "target_topic": topic,
                    },
                ]
            )
    return pd.DataFrame(synthetic)
