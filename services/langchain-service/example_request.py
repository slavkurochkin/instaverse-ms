"""
Example script to test the LangChain service API
"""

import requests
import json

# Service URL
SERVICE_URL = "http://localhost:5006"

def test_health_check():
    """Test the health check endpoint"""
    response = requests.get(f"{SERVICE_URL}/health")
    print("Health Check:")
    print(json.dumps(response.json(), indent=2))
    print()

def test_generate_post():
    """Test the post generation endpoint"""
    payload = {
        "image_description": "A beautiful sunset over the mountains with vibrant orange and pink colors painting the sky",
        "tags": ["sunset", "mountains", "nature"],
        "platform": "instagram",
        "tone": "friendly"
    }
    
    response = requests.post(
        f"{SERVICE_URL}/api/generate-post",
        json=payload
    )
    
    print("Generate Post Response:")
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == "__main__":
    try:
        test_health_check()
        test_generate_post()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the service.")
        print("Make sure the service is running on", SERVICE_URL)
    except Exception as e:
        print(f"Error: {e}")

