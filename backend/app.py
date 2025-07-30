import os, sys, traceback
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib

# Make project root importable
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
sys.path.insert(0, BASE_DIR)

from utils.geocode import geocode_location
from utils.aqi_fetcher import fetch_aqi_by_coords
from utils.wearable_sim import simulate_wearable

# Load env vars
load_dotenv(os.path.join(BASE_DIR, ".env"))
OPENAI_API_KEY      = os.getenv("OPENAI_API_KEY")
OPENWEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# Initialize Flask
app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "frontend"),
    static_url_path="/"
)
CORS(app, origins=["http://localhost:5500"])

# Load trained model
MODEL_PATH = os.path.join(BASE_DIR, "models", "aqi_health_model.pkl")
model = joblib.load(MODEL_PATH)

@app.route("/health-risk", methods=["POST"])
def health_risk():
    data = request.get_json(force=True)

    location = data.get("location")
    if not location or not isinstance(location, str):
        return jsonify({"error": "Field 'location' is required."}), 400

    has_asthma = bool(data.get("asthma", False))
    hr         = data.get("heart_rate")
    spo2       = data.get("spo2")
    cough_count= data.get("cough_count")

    # Simulate wearable if any missing
    if hr is None or spo2 is None or cough_count is None:
        wearable = simulate_wearable()
        hr, spo2, cough_count = (
            wearable["heart_rate"],
            wearable["spo2"],
            wearable["cough_count"]
        )

    try:
        lat, lon = geocode_location(location)
        aqi = fetch_aqi_by_coords(lat, lon)

        features = [[aqi, hr, spo2, cough_count, int(has_asthma)]]
        pred = model.predict(features)[0]
        risk_label = "High Risk" if pred == 1 else "Low Risk"
        advice = (
            "Avoid outdoor activities, use N95 mask, and consult a doctor."
            if pred == 1
            else "Air quality seems okay, but still wear a mask and stay hydrated."
        )

        return jsonify({
            "risk": risk_label,
            "advice": advice,
            "aqi": aqi,
            "heart_rate": hr,
            "spo2": spo2,
            "cough_count": cough_count
        })

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Internal server error."}), 500

@app.route("/chat", methods=["POST"])
def chatbot():
    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)

    data = request.get_json(force=True)
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "Field 'prompt' is required."}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful respiratory health advisor."},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.6,
            max_tokens=150
        )
        return jsonify({"reply": response.choices[0].message.content})

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Failed to get response from OpenAI."}), 500

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    full_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
