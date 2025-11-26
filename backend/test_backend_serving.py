import requests
import sys

url = "http://127.0.0.1:8000/uploads/invoices/da33049d-7804-4746-89b2-41081195f821.jpg"

try:
    print(f"Testing URL: {url}")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success: File is accessible directly from backend.")
    else:
        print(f"Failed: Backend returned {response.status_code}")
        print(response.text[:200])
except Exception as e:
    print(f"Error connecting to backend: {e}")
