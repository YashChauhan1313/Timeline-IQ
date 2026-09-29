import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()

from hindsight_client import Hindsight
from events import EVENTS

client = Hindsight(
    base_url="https://api.hindsight.vectorize.io",
    api_key=os.environ["HINDSIGHT_API_KEY"],
    timeout=120.0
)

for company in ["samsung", "apple"]:
    items = [
        {"content": e["headline"], "timestamp": e["date"], "context": e["category"]}
        for e in EVENTS if e["company"] == company
    ]
    client.retain_batch(bank_id=company, items=items, retain_async=True)
    print(f"Queued {len(items)} events for {company}")

print("Done. Give it a minute or two to finish processing before asking questions.")