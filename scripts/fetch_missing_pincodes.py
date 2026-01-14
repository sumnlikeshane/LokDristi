import requests
import time
import json
import os

# Read missing pincodes from file
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
missing_file = os.path.join(root_dir, "missing_pincodes.txt")
existing_file = os.path.join(root_dir, "public/data/pincode_latlng.json")

with open(missing_file, "r") as f:
    PIN_CODES = [line.strip() for line in f.readlines() if line.strip()]

print(f"📍 Found {len(PIN_CODES)} missing pincodes to fetch")

BASE_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    "User-Agent": "lokdristi-pincode-mapper/1.0 (India geospatial visualization project)"
}

# Load existing pincode data
with open(existing_file, "r") as f:
    existing_data = json.load(f)

print(f"📦 Existing pincodes: {len(existing_data)}")

result = {}
not_found = []

for i, pin in enumerate(PIN_CODES):
    params = {
        "q": f"{pin}, India",
        "format": "json",
        "limit": 1,
        "countrycodes": "in"
    }

    try:
        res = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=10)
        data = res.json()

        if data:
            result[pin] = {
                "lat": float(data[0]["lat"]),
                "lng": float(data[0]["lon"])
            }
            print(f"✅ [{i+1}/{len(PIN_CODES)}] {pin}: {result[pin]['lat']}, {result[pin]['lng']}")
        else:
            not_found.append(pin)
            print(f"⚠️ [{i+1}/{len(PIN_CODES)}] Not found: {pin}")

    except Exception as e:
        not_found.append(pin)
        print(f"❌ [{i+1}/{len(PIN_CODES)}] Error for {pin}: {e}")

    # Rate limiting - Nominatim requires 1 request per second
    time.sleep(1.1)

# Merge with existing data
merged_data = {**existing_data, **result}

# Save merged data
with open(existing_file, "w") as f:
    json.dump(merged_data, f, indent=2)

print(f"\n{'='*50}")
print(f"✅ Done!")
print(f"   Found coordinates: {len(result)}")
print(f"   Not found: {len(not_found)}")
print(f"   Total pincodes now: {len(merged_data)}")
print(f"   Saved to: {existing_file}")

if not_found:
    not_found_file = os.path.join(root_dir, "still_missing_pincodes.txt")
    with open(not_found_file, "w") as f:
        f.write("\n".join(not_found))
    print(f"   Still missing saved to: {not_found_file}")
