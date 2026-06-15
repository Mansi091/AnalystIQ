import sys
import os
import time
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from langchain_groq import ChatGroq

models = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
    "llama3-8b-8192",
    "llama3-70b-8192"
]

print("Testing model latencies:")
for m in models:
    t0 = time.time()
    try:
        llm = ChatGroq(model=m, temperature=0.2)
        response = llm.invoke("Say hello in one word.")
        dt = time.time() - t0
        print(f"Model: {m} -> Success! Latency: {dt:.2f} seconds. Response: {response.content.strip()}")
    except Exception as e:
        dt = time.time() - t0
        print(f"Model: {m} -> Failed! Latency: {dt:.2f} seconds. Error: {str(e)}")
