import os, urllib.request, urllib.error
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()

API_KEY = os.environ["HINDSIGHT_API_KEY"]
BASE = "https://api.hindsight.vectorize.io"

for bank in ["samsung", "apple"]:
    req = urllib.request.Request(
        f"{BASE}/v1/default/banks/{bank}",
        method="DELETE",
        headers={"Authorization": f"Bearer {API_KEY}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            print(bank, "deleted, status", r.status)
    except urllib.error.HTTPError as e:
        print(bank, "failed:", e.code, e.read().decode())