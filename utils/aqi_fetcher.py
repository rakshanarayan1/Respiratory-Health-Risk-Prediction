import os, requests

OPENWEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

def fetch_aqi_by_coords(lat, lon):
    url = (
        f"http://api.openweathermap.org/data/2.5/air_pollution"
        f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
    )
    resp = requests.get(url)
    resp.raise_for_status()
    data = resp.json()
    return data["list"][0]["main"]["aqi"]
