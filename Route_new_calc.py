import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# --- Load original and cleaned datasets ---
df_original = pd.read_csv("cleaned_bus_data.csv")          # original dataset
df_cleaned = pd.read_csv("cleaned_bus_data_v2.csv")       # cleaned dataset

# --- 1. Route length distributions ---
route_len_orig = df_original.groupby('route_id').size().reset_index(name='num_stops')
route_len_clean = df_cleaned.groupby('route_id').size().reset_index(name='num_stops')

plt.figure(figsize=(10,5))
sns.kdeplot(route_len_orig['num_stops'], label='Original', fill=True)
sns.kdeplot(route_len_clean['num_stops'], label='Cleaned', fill=True)
plt.title("Route Length Distribution (Number of Stops)")
plt.xlabel("Number of Stops")
plt.ylabel("Density")
plt.legend()
plt.show()

# --- 2. Average travel time per route (minutes) ---
# Compute travel time if not already computed
for df, label in zip([df_original, df_cleaned], ['Original', 'Cleaned']):
    if 'travel_time_min' not in df.columns:
        df['departure_time'] = pd.to_datetime(df['departure_time'])
        df['arrival_time'] = pd.to_datetime(df['arrival_time'])
        df['travel_time_min'] = (df['arrival_time'] - df['departure_time']).dt.total_seconds() / 60
        # Replace negative or missing times with mean of valid times
        mean_time = df.loc[df['travel_time_min'] > 0, 'travel_time_min'].mean()
        df['travel_time_min'] = df['travel_time_min'].apply(lambda x: mean_time if x <=0 or pd.isna(x) else x)

avg_travel_time_orig = df_original.groupby('route_id')['travel_time_min'].mean().reset_index()
avg_travel_time_clean = df_cleaned.groupby('route_id')['travel_time_min'].mean().reset_index()

plt.figure(figsize=(10,5))
sns.kdeplot(avg_travel_time_orig['travel_time_min'], label='Original', fill=True)
sns.kdeplot(avg_travel_time_clean['travel_time_min'], label='Cleaned', fill=True)
plt.title("Average Travel Time per Route")
plt.xlabel("Travel Time (minutes)")
plt.ylabel("Density")
plt.legend()
plt.show()

plt.figure(figsize=(10,5))
plt.hist(route_len_orig['num_stops'], bins=range(1,10), alpha=0.5, label='Original')
plt.hist(route_len_clean['num_stops'], bins=range(1,10), alpha=0.5, label='Cleaned')
plt.title("Route Length Distribution (Number of Stops)")
plt.xlabel("Number of Stops")
plt.ylabel("Count")
plt.legend()
plt.show()

plt.figure(figsize=(10,5))
plt.hist(avg_travel_time_orig['travel_time_min'], bins=20, alpha=0.5, label='Original')
plt.hist(avg_travel_time_clean['travel_time_min'], bins=20, alpha=0.5, label='Cleaned')
plt.title("Average Travel Time per Route")
plt.xlabel("Travel Time (minutes)")
plt.ylabel("Count")
plt.legend()
plt.show()


# --- 3. Number of unique buses before and after ---
unique_buses_orig = df_original['bus_id'].nunique()
unique_buses_clean = df_cleaned['bus_id'].nunique()

print(f"Number of unique buses (Original dataset): {unique_buses_orig}")
print(f"Number of unique buses (Cleaned dataset): {unique_buses_clean}")
