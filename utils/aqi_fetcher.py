import os
import requests
from dotenv import load_dotenv

load_dotenv()
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

def fetch_aqi_by_coords(lat, lon):
    url = (
        f"http://api.openweathermap.org/data/2.5/air_pollution"
        f"?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}"
    )
    response = requests.get(url)
    data = response.json()
    return data["list"][0]["main"]["aqi"]
