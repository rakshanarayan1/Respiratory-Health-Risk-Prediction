from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import joblib
from dotenv import load_dotenv
import openai
import sys

# Set path to import from utils folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.geocode import geocode_location
from utils.aqi_fetcher import fetch_aqi_by_coords
from utils.wearable_sim import simulate_wearable

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
print("GOOGLE KEY:", os.getenv("GOOGLE_MAPS_API_KEY"))

# Load AI model
model = joblib.load("models/aqi_health_model.pkl")

# Init Flask app
app = Flask(__name__)
CORS(app)

@app.route("/health-risk", methods=["POST"])
def health_risk():
    data = request.json
    location = data.get("location")
    has_asthma = data.get("asthma", False)

    try:
        lat, lon = geocode_location(location)
        aqi = fetch_aqi_by_coords(lat, lon)
        wearable = simulate_wearable()

        print("Wearable data:", wearable)

        features = [
            aqi,
            wearable["heart_rate"],
            wearable["spo2"],
            wearable["cough_count"],
            int(has_asthma)
        ]

        prediction = model.predict([features])[0]
        risk_label = "High Risk" if prediction == 1 else "Low Risk"
        advice = (
            "Avoid outdoor activities, use N95 mask, and consult a doctor." if prediction == 1
            else "Air quality seems okay, but still wear a mask and stay hydrated."
        )

        return jsonify({
            "risk": risk_label,
            "aqi": aqi,
            "wearable": wearable,
            "advice": advice
        })

    except Exception as e:
        print("ERROR in /health-risk route:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chatbot():
    data = request.json
    prompt = data.get("prompt", "")

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful respiratory health advisor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=150
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
