import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from joblib import dump
import os

# Step 1: Generate mock training data
np.random.seed(42)
n_samples = 1000
data = pd.DataFrame({
    "aqi": np.random.randint(1, 6, size=n_samples),
    "heart_rate": np.random.randint(60, 120, size=n_samples),
    "spo2": np.random.randint(88, 100, size=n_samples),
    "cough_count": np.random.randint(0, 20, size=n_samples),
    "asthma": np.random.randint(0, 2, size=n_samples)
})

# Step 2: Generate target: 0 = low risk, 1 = high risk
data["risk"] = (
    (data["aqi"] > 3).astype(int) |
    (data["spo2"] < 93).astype(int) |
    (data["heart_rate"] > 100).astype(int) |
    (data["cough_count"] > 10).astype(int) |
    (data["asthma"] == 1).astype(int)
)

# Step 3: Train model
X = data[["aqi", "heart_rate", "spo2", "cough_count", "asthma"]]
y = data["risk"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = RandomForestClassifier()
model.fit(X_train, y_train)

# Step 4: Save model
output_path = os.path.join("models", "aqi_health_model.pkl")
dump(model, output_path)
print(f"Model trained and saved to {output_path}")
