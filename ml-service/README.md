# ML Service

FastAPI recommendation service for Question For The Day.

The first production version uses a lightweight Scikit-learn recommendation approach instead of deep learning:

- User performance features: accuracy, weak topics, average time, solved difficulty, streak
- Candidate question features: topic, category, difficulty
- RandomForest models for difficulty and topic assistance
- Hybrid weak-topic priority for reliable adaptive behavior

## Run Locally

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Train model:

```bash
python -m scripts.train
```

Test predictions:

```bash
python -m scripts.test_predictions
```

API endpoints:

- `GET /health`
- `POST /predict`
- `POST /train`
- `POST /recommend` compatibility endpoint

## Deploy on Render

- Root directory: `ml-service`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Set backend `ML_SERVICE_URL` to the deployed ML URL.
