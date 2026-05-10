import json
from model_store import load_model, MODEL_PATH, predict_payload


def main() -> None:
    model = load_model(MODEL_PATH)
    sample = {
        "accuracy": 0.4,
        "streak": 1,
        "weak_topics": ["Ratios"],
        "solved_difficulty": 2,
        "avg_time": 80,
    }

    prediction = predict_payload(sample, model)
    print(json.dumps(prediction, indent=2))


if __name__ == "__main__":
    main()
