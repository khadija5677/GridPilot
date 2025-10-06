# ============================================
# train_bus_model_fixed.py
# ============================================

# 1️⃣ Import Libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import lightgbm as lgb
from lightgbm import LGBMRegressor, early_stopping, log_evaluation
import joblib

# ============================================
# 2️⃣ Load Dataset
# ============================================
df = pd.read_csv("cleaned_bus_data.csv", parse_dates=["departure_time", "arrival_time"])
print("Dataset shape:", df.shape)
print(df.head())

# ============================================
# 3️⃣ Target Variable: Travel time per km
# ============================================
# Compute travel time in minutes
df["travel_time_minutes"] = (df["arrival_time"] - df["departure_time"]).dt.total_seconds() / 60

# Replace 0 distances to avoid divide-by-zero
df["segment_distance_km"].replace(0, 1, inplace=True)

# Compute time per km
df["time_per_km"] = df["travel_time_minutes"] / df["segment_distance_km"]

# Route-level features
df["route_avg_speed"] = df.groupby("route_id")["speed_kmh"].transform("mean")
df["route_avg_distance"] = df.groupby("route_id")["segment_distance_km"].transform("mean")
df["route_stop_count"] = df.groupby("route_id")["stop_id"].transform("count")

# Time features
df["hour"] = df["departure_time"].dt.hour
df["day_of_week"] = df["departure_time"].dt.dayofweek
df["is_weekend"] = df["day_of_week"].isin([5,6]).astype(int)

# Encode categorical IDs
df["route_id_enc"] = df["route_id"].astype("category").cat.codes
df["bus_id_enc"] = df["bus_id"].astype("category").cat.codes
df["stop_id_enc"] = df["stop_id"].astype("category").cat.codes
df["traffic_level_enc"] = df["traffic_level"].astype("category").cat.codes

# ============================================
# 4️⃣ Features & Target
# ============================================
features = [
    "hour", "day_of_week", "is_weekend",
    "route_id_enc", "bus_id_enc", "stop_id_enc",
    "segment_distance_km", "speed_kmh", "traffic_level_enc",
    "route_avg_speed", "route_avg_distance", "route_stop_count"
]

X = df[features].copy()
y = df["time_per_km"].copy()

# Fill any remaining NaNs in features
X.fillna(X.mean(), inplace=True)

# Drop rows with NaN target
mask = ~y.isna()
X = X[mask]
y = y[mask]

# ============================================
# 5️⃣ Train/Test Split
# ============================================
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
print("Train size:", X_train.shape, "Test size:", X_test.shape)

# ============================================
# 6️⃣ Train LightGBM Model
# ============================================
model = LGBMRegressor(
    objective="regression",
    boosting_type="gbdt",
    learning_rate=0.1,
    num_leaves=31,
    n_estimators=200
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    eval_metric="mae",
    callbacks=[early_stopping(20), log_evaluation(10)]
)

# ============================================
# 7️⃣ Evaluate Model
# ============================================
y_pred = model.predict(X_test)

# Ensure no NaNs for MAE
mask_eval = ~np.isnan(y_test) & ~np.isnan(y_pred)
y_test_clean = y_test[mask_eval]
y_pred_clean = y_pred[mask_eval]

mae = mean_absolute_error(y_test_clean, y_pred_clean)
print("Test MAE (minutes per km):", mae)

# ============================================
# 8️⃣ Save Model
# ============================================
joblib.dump(model, "bus_delay_model2.pkl")
print("✅ Model saved as bus_delay_model.pkl")
