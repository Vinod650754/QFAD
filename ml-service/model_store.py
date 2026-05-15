import json
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "model.pkl"
METRICS_PATH = MODEL_DIR / "metrics.json"
DEFAULT_TOPICS = [
    "General",
    "JavaScript Arrays",
    "Chemistry",
    "Ratios",
    "Vocabulary",
    "Python Lists",
]
DIFFICULTIES = ["Easy", "Medium", "Hard"]


def feature_vector(payload: Dict, topic_encoder: LabelEncoder) -> np.ndarray:
    if hasattr(payload, "dict"):
        payload = payload.dict()

    weak_topics = payload.get("weak_topics") or []
    weak_topic = weak_topics[0] if weak_topics else "General"
    known_topics = set(topic_encoder.classes_)
    topic_code = int(topic_encoder.transform([weak_topic])[0]) if weak_topic in known_topics else 0
    return np.array(
        [
            float(payload.get("accuracy", 0.0)),
            float(payload.get("streak", 0)),
            float(payload.get("solved_difficulty", 1.0)),
            float(payload.get("avg_time", 0.0)),
            float(len(weak_topics)),
            float(topic_code),
        ],
        dtype=float,
    )


def _build_training_dataset(rows: Optional[Sequence[Dict]] = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray, List[str]]:
    rows = rows or []
    topics = set(DEFAULT_TOPICS)
    for row in rows:
        topic = str(row.get("topic", "General"))
        topics.add(topic)

    topics = sorted(topics)
    features = []
    difficulty_targets = []
    topic_targets = []

    for topic in topics:
        for difficulty in DIFFICULTIES:
            base = {"Easy": 1, "Medium": 2, "Hard": 3}[difficulty]
            features.append([0.25, 0.0, float(base), 90.0, 2.0, float(topics.index(topic))])
            difficulty_targets.append("Easy")
            topic_targets.append(topic)

            features.append([0.62, 2.0, float(base), 55.0, 1.0, float(topics.index(topic))])
            difficulty_targets.append(difficulty)
            topic_targets.append(topic)

            next_diff = DIFFICULTIES[min(2, base)]
            features.append([0.88, 5.0, float(base), 35.0, 0.0, float(topics.index(topic))])
            difficulty_targets.append(next_diff)
            topic_targets.append(topic)

    return (
        np.array(features, dtype=float),
        np.array(difficulty_targets, dtype=object),
        np.array(topic_targets, dtype=object),
        topics,
    )


def train_model(rows: Optional[Sequence[Dict]] = None) -> Dict:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    X, y_diff, y_topic, topics = _build_training_dataset(rows)
    difficulty_encoder = LabelEncoder().fit(DIFFICULTIES)
    topic_encoder = LabelEncoder().fit(topics)

    y_diff_encoded = difficulty_encoder.transform(y_diff)
    y_topic_encoded = topic_encoder.transform(y_topic)

    x_train, x_test, yd_train, yd_test, yt_train, yt_test = train_test_split(
        X,
        y_diff_encoded,
        y_topic_encoded,
        test_size=0.25,
        random_state=42,
        stratify=y_topic_encoded,
    )

    difficulty_model = RandomForestClassifier(
        n_estimators=25,
        max_depth=8,
        random_state=42,
        n_jobs=1,
    )
    topic_model = RandomForestClassifier(
        n_estimators=25,
        max_depth=8,
        random_state=42,
        n_jobs=1,
    )

    difficulty_model.fit(x_train, yd_train)
    topic_model.fit(x_train, yt_train)

    difficulty_accuracy = accuracy_score(yd_test, difficulty_model.predict(x_test))
    topic_accuracy = accuracy_score(yt_test, topic_model.predict(x_test))

    model_bundle = {
        "difficulty_model": difficulty_model,
        "topic_model": topic_model,
        "difficulty_encoder": difficulty_encoder,
        "topic_encoder": topic_encoder,
    }
    joblib.dump(model_bundle, MODEL_PATH)

    metrics = {
        "training_rows": int(X.shape[0]),
        "difficulty_accuracy": round(float(difficulty_accuracy), 4),
        "topic_accuracy": round(float(topic_accuracy), 4),
    }
    METRICS_PATH.write_text(json.dumps(metrics))
    return metrics


def load_model(path: Path = MODEL_PATH) -> Dict:
    if not path.exists():
        raise FileNotFoundError(
            f"Trained model not found at {path}. Run `python train.py` locally and add the file before deployment."
        )
    return joblib.load(path, mmap_mode="r")


def predict_payload(payload: Dict, bundle: Dict) -> Dict:
    topic_encoder = bundle["topic_encoder"]
    payload_dict = payload.dict() if hasattr(payload, "dict") else payload
    vector = feature_vector(payload_dict, topic_encoder).reshape(1, -1)

    difficulty_model = bundle["difficulty_model"]
    topic_model = bundle["topic_model"]

    difficulty_index = difficulty_model.predict(vector)[0]
    topic_index = topic_model.predict(vector)[0]

    difficulty_confidence = float(np.max(difficulty_model.predict_proba(vector)[0]))
    topic_confidence = float(np.max(topic_model.predict_proba(vector)[0]))

    recommended_topic = (
        (payload_dict.get("weak_topics") or [None])[0]
        or str(topic_encoder.inverse_transform([topic_index])[0])
    )

    return {
        "difficulty": str(bundle["difficulty_encoder"].inverse_transform([difficulty_index])[0]),
        "topic": recommended_topic,
        "confidence": round((difficulty_confidence + topic_confidence) / 2, 4),
        "reason": "ML model prediction from performance features",
    }
