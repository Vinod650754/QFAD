import argparse
import json
from pathlib import Path

from model_store import train_model


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train the ML model locally and save it to models/model.pkl"
    )
    parser.add_argument(
        "--rows",
        type=Path,
        help="Path to a JSON file with optional training rows",
    )
    args = parser.parse_args()

    rows = []
    if args.rows:
        rows = json.loads(args.rows.read_text())

    metrics = train_model(rows)
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
