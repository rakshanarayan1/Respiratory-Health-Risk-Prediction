import random

def simulate_wearable():
    """
    Simulates data from a wearable device.
    Returns heart rate (bpm), SpO2 (%), and cough count (in last hour).
    """
    heart_rate = random.randint(60, 110)
    spo2 = random.randint(90, 100)
    cough_count = random.randint(0, 20)
    
    return {
        "heart_rate": heart_rate,
        "spo2": spo2,
        "cough_count": cough_count
    }
