from app.main import PredictionRequest
from app.model_store import predict, train_model


def main():
    metrics = train_model()
    prediction, confidence = predict(
        PredictionRequest(
            accuracy=0.4,
            streak=1,
            weak_topics=["Ratios"],
            solved_difficulty=2,
            avg_time=80,
        )
    )
    assert prediction["difficulty"] in {"Easy", "Medium", "Hard"}
    assert 0 <= confidence <= 1
    print({"metrics": metrics, "prediction": prediction})


if __name__ == "__main__":
    main()
