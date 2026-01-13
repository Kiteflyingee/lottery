import requests
import random
import time

BASE_URL = "http://124.70.165.131:3000/api/users"

def generate_users(count=100):
    success_count = 0
    
    print(f"Starting generation of {count} users to {BASE_URL}...")
    
    for i in range(count):
        # Generate random 4-digit ID
        employee_id = f"{random.randint(0, 9999):04d}"
        name = f"测试用户_{employee_id}"
        
        payload = {
            "name": name,
            "employeeId": employee_id
        }
        
        try:
            response = requests.post(BASE_URL, json=payload, timeout=5)
            if response.status_code == 200:
                print(f"[{i+1}/{count}] Created user: {name} (ID: {employee_id})")
                success_count += 1
            else:
                print(f"[{i+1}/{count}] Failed to create user {name}: {response.text}")
        except Exception as e:
            print(f"[{i+1}/{count}] Error creating user {name}: {str(e)}")
            
    print(f"\nFinished. Successfully created {success_count}/{count} users.")

if __name__ == "__main__":
    generate_users(100)
