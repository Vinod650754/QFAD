import json
import sys
from pathlib import Path

from app.model_store import train_model


def main():
    rows = []
    if len(sys.argv) > 1:
        rows = json.loads(Path(sys.argv[1]).read_text())
    metrics = train_model(rows)
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
