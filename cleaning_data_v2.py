import pandas as pd
import numpy as np
from geopy.distance import geodesic
import re

# --- Load dataset ---
df = pd.read_csv("cleaned_bus_data.csv")  # change path if needed

# --- 1. Standardize stop names ---
def clean_stop_name(name):
    name = str(name).lower()
    name = re.sub(r'[^a-z0-9\s]', '', name)  # remove punctuation
    name = re.sub(r'\s+', ' ', name).strip()  # remove extra spaces
    return name

df['stop_name'] = df['stop_name'].apply(clean_stop_name)

# Optional: map known variants manually
stop_mapping = {
    'main rd': 'main road',
    'mainrd': 'main road',
    'central stn': 'central station',
    # add more mappings if needed
}
df['stop_name'] = df['stop_name'].replace(stop_mapping)

# --- 2. Merge stops with very close coordinates (±30 meters) ---
def merge_close_coords(df, lat_col="stop_lat", lon_col="stop_lon", tol_m=30):
    coords = df[[lat_col, lon_col]].to_numpy()
    merged = {}
    for i, (lat, lon) in enumerate(coords):
        key = None
        for mlat, mlon in merged.keys():
            if geodesic((lat, lon), (mlat, mlon)).meters <= tol_m:
                key = (mlat, mlon)
                break
        if key:
            merged[key].append(i)
        else:
            merged[(lat, lon)] = [i]
    for key, idxs in merged.items():
        df.loc[idxs, [lat_col, lon_col]] = key
    return df

df = merge_close_coords(df)

# --- 3. Compute travel time in minutes ---
df['departure_time'] = pd.to_datetime(df['departure_time'])
df['arrival_time'] = pd.to_datetime(df['arrival_time'])
df['travel_time_min'] = (df['arrival_time'] - df['departure_time']).dt.total_seconds() / 60

# Replace negative or missing times with mean of valid travel times
mean_time = df.loc[df['travel_time_min'] > 0, 'travel_time_min'].mean()
df['travel_time_min'] = df['travel_time_min'].apply(lambda x: mean_time if x <= 0 or pd.isna(x) else x)

# --- 4. Handle missing distances ---
df['segment_distance_km'] = df['segment_distance_km'].fillna(df['segment_distance_km'].mean())
# Standardize units if needed
if df['segment_distance_km'].max() > 50:  # likely meters
    df['segment_distance_km'] = df['segment_distance_km'] / 1000

# --- 5. Reorder stops & remove illogical jumps ---
def reorder_and_clean_stops(df, max_jump_km=50):
    clean_routes = []
    for route_id, group in df.groupby('route_id'):
        group = group.sort_values(by='segment_distance_km').reset_index(drop=True)
        mask = group['segment_distance_km'].diff().fillna(0).abs() <= max_jump_km
        mask.iloc[0] = True
        group = group[mask]
        # Reduce long routes (>8 stops)
        while len(group) > 8:
            diffs = group['segment_distance_km'].diff().fillna(0).abs()
            idx_to_drop = diffs.idxmin()
            group = group.drop(idx_to_drop).reset_index(drop=True)
        clean_routes.append(group)
    return pd.concat(clean_routes).reset_index(drop=True)

df = reorder_and_clean_stops(df)

# --- 6. Remove exact duplicate routes ---
df = df.drop_duplicates()

# --- Save cleaned dataset ---
df.to_csv("cleaned_bus_data_v2.csv", index=False)

# --- Summary ---
print("Data cleaning complete!")
print(f"Number of routes: {df['route_id'].nunique()}")
print(f"Number of stops: {df.shape[0]}")
