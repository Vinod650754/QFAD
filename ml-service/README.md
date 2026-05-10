# ML Service

FastAPI recommendation service for Question For The Day.

This service is split into local training and deployment. The deployed API loads a trained model from `models/model.pkl` only and does not train during startup.

## Run Locally

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python train.py
uvicorn app:app --host 0.0.0.0 --port 10000
```

Health check:

```bash
curl http://localhost:10000/health
```

Train model:

```bash
python train.py
```

Test predictions:

```bash
python test_predictions.py
```

API endpoints:

- `GET /health`
- `POST /predict`

## Render Deployment

- Root directory: `ml-service`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app:app --host 0.0.0.0 --port 10000`

### Render best practices

- Use `python-3.11.9` in `runtime.txt`.
- Do not train on Render.
- Run `python train.py` locally and commit `models/model.pkl` before deployment.
- Ensure `models/model.pkl` exists in the repository or the deployment will return `503` for `/predict`.
