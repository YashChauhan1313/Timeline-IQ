import os
from groq import Groq

groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM = """You are a competitive-intelligence analyst covering Samsung and Apple.
Answer ONLY from the memory excerpts provided. Cite dates when you can, call out
price changes, and end with a one-line 'So what:' takeaway. If the memories
don't cover something, say so instead of guessing. Use markdown."""

def synthesize(query, memories_by_company):
    context = "\n\n".join(
        f"## {company.upper()} MEMORIES\n" + "\n".join(f"- {m}" for m in mems)
        for company, mems in memories_by_company.items()
    )
    resp = groq_client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": f"{context}\n\nQuestion: {query}"},
    ],
    temperature=0.3,
    )
    return resp.choices[0].message.content