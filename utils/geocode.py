import os
import requests
from dotenv import load_dotenv

load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def geocode_location(location_name):
    """
    Converts a location name like 'Delhi' into (latitude, longitude).
    """
    url = (
        f"https://maps.googleapis.com/maps/api/geocode/json"
        f"?address={location_name}&key={GOOGLE_MAPS_API_KEY}"
    )
    response = requests.get(url)
    data = response.json()

    if data["status"] != "OK":
        raise Exception(f"Geocoding error: {data['status']}")

    lat = data["results"][0]["geometry"]["location"]["lat"]
    lon = data["results"][0]["geometry"]["location"]["lng"]
    return lat, lon
