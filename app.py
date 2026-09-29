import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()

from flask import Flask, request, jsonify, render_template
from hindsight_client import Hindsight
from events import EVENTS
from llm import synthesize

app = Flask(__name__)


def new_client():
    return Hindsight(
        base_url="https://api.hindsight.vectorize.io",
        api_key=os.environ["HINDSIGHT_API_KEY"],
        timeout=120.0,
    )


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/events")
def get_events():
    company = request.args.get("company", "samsung")
    return jsonify([e for e in EVENTS if e["company"] == company])


@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    company = data.get("company", "samsung")
    query = data.get("query")

    client = new_client()
    try:
        answer = client.reflect(bank_id=company, query=query)
        return jsonify({"answer": answer.text})
    finally:
        try:
            client.close()
        except Exception:
            pass

def recall_texts(client, bank, query):
    res = client.recall(bank_id=bank, query=query)
    return [r.text for r in res.results]


@app.route("/ask_llm", methods=["POST"])
def ask_llm():
    data = request.json
    query = data.get("query")
    company = data.get("company", "samsung")
    compare = data.get("compare", False)

    client = new_client()
    try:
        banks = ["samsung", "apple"] if compare else [company]
        memories = {b: recall_texts(client, b, query) for b in banks}
        return jsonify({"answer": synthesize(query, memories)})
    except Exception as e:
        return jsonify({"answer": f"Error: {e}"}), 500
    finally:
        try:
            client.close()
        except Exception:
            pass
if __name__ == "__main__":
    app.run(debug=True, threaded=False)
