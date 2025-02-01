import time
from geopy.distance import geodesic

def interpolate_coordinates(start, end, steps):
    lat1, lon1 = start
    lat2, lon2 = end
    return [
        (lat1 + i * (lat2 - lat1) / steps, lon1 + i * (lon2 - lon1) / steps)
        for i in range(steps + 1)
    ]

def simulate_drive(start, end, speed_kmh, update_interval):
    """
    Simulates driving from start to end at a given speed.
    :param start: Tuple (lat, lon) for the starting location.
    :param end: Tuple (lat, lon) for the end location.
    :param speed_kmh: Speed in kilometers per hour.
    :param update_interval: How often to update the location in seconds.
    """
    # Calculate total distance
    total_distance = geodesic(start, end).kilometers

    # Calculate steps based on speed and interval
    step_distance = (speed_kmh / 3600) * update_interval  # Distance per interval
    steps = int(total_distance / step_distance)

    # Interpolate coordinates
    path = interpolate_coordinates(start, end, steps)

    # Simulate the drive
    for point in path:
        print(f"Current simulated location: {point}")
        time.sleep(update_interval)

# Example usage
if __name__ == "__main__":
    start_point = (35.9606186, -85.8141516)  # Smithville, TN
    end_point = (36.2079779, -86.2910945)    # Lebanon, TN
    simulate_drive(start_point, end_point, speed_kmh=100, update_interval=5)
