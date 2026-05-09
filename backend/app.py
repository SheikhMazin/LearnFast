from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, requests

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({"status": "LearnFast backend running"})

@app.get("/languages")
def languages():
    return jsonify([
        "English", "Spanish", "French",
        "Mandarin", "Arabic", "Hindi",
        "Portuguese", "Swahili"
        ])

if __name__ == "__main__":
    app.run(debug=True, port=5000)
