from dotenv import load_dotenv
import os
import requests

load_dotenv()

API_KEY = os.getenv("WATSONX_API_KEY")
PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
URL = os.getenv("WATSONX_URL")

def get_iam_token():
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": API_KEY
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return response.json()["access_token"]

def test_watsonx():
    print("Getting IAM token...")
    token = get_iam_token()
    print("Token received ✓")

    print("Calling watsonx...")
    response = requests.post(
        f"{URL}/ml/v1/text/chat?version=2024-05-31",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "model_id": "ibm/granite-3-3-8b-instruct",
            "project_id": PROJECT_ID,
            "messages": [
                {"role": "system", "content": "You are an educational tutor. Always respond in English. Keep responses under 80 words."},
                {"role": "user", "content": "Teach me about fractions at beginner level."}
            ],
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.7
            }
        }
    )
    print("Status code:", response.status_code)
    print("Response:", response.json())

test_watsonx()
