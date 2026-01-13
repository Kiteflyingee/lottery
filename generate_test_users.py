import requests
import time
import uuid

BASE_URL = "http://localhost:3001/api/users"

def generate_users(count=100):
    success_count = 0
    
    print(f"Starting generation of {count} users to {BASE_URL}...")
    
    # Use timestamp + index to ensure unique IDs
    timestamp = int(time.time() * 1000) % 10000000
    
    for i in range(count):
        # Generate unique ID using timestamp and index
        unique_id = f"{(timestamp + i) % 10000:04d}"
        # Add a unique suffix using uuid to guarantee uniqueness
        unique_suffix = uuid.uuid4().hex[:4]
        name = f"用户_{unique_id}_{unique_suffix}"
        employee_id = unique_id
        
        payload = {
            "name": name,
            "employeeId": employee_id
        }
        
        try:
            response = requests.post(BASE_URL, json=payload, timeout=5)
            if response.status_code == 200:
                result = response.json()
                # Check if this is a new user (registeredAt should be very recent)
                print(f"[{i+1}/{count}] Created user: {name} (ID: {employee_id})")
                success_count += 1
            else:
                print(f"[{i+1}/{count}] Failed to create user {name}: {response.text}")
        except Exception as e:
            print(f"[{i+1}/{count}] Error creating user {name}: {str(e)}")
            
    print(f"\nFinished. Successfully created {success_count}/{count} users.")

if __name__ == "__main__":
    generate_users(100)
