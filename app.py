from flask import Flask, request, jsonify
import joblib
import pandas as pd

# ===============================
# 1. Initialize Flask
# ===============================
app = Flask(__name__)

# ===============================
# 2. Load ML model and encoders
# ===============================
model = joblib.load("bus_delay_model.pkl")  # your trained LightGBM model
# Optional: if you saved LabelEncoders for categorical features
# encoders = joblib.load("encoders.pkl")

# ===============================
# 3. Define routes
# ===============================
@app.route("/")
def home():
    return "Flask server is running!"

@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects JSON like:
    {
        "hour": 14,
        "day_of_week": 5,
        "is_weekend": 1,
        "route_id_enc": 12,
        "bus_id_enc": 5,
        "stop_id_enc": 33,
        "segment_distance_km": 1.2,
        "speed_kmh": 25,
        "traffic_level_enc": 2,
        "route_avg_speed": 22.5,
        "route_avg_distance": 1.1,
        "route_stop_count": 5
    }
    """
    try:
        data = request.json
        df = pd.DataFrame([data])

        # Optional: encode categorical features if you saved encoders
        # for col, le in encoders.items():
        #     df[col] = le.transform(df[col])

        prediction = model.predict(df)[0]
        return jsonify({"predicted_time_per_km": float(prediction)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===============================
# 4. Run server
# ===============================
if __name__ == "__main__":
    app.run(debug=True)
