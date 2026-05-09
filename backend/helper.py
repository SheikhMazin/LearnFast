import requests


def get_iam_token(API_KEY):
    response = requests.post(
            "https://iam.cloud.ibm.com/identity/token",
            data = {
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": API_KEY
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
    return response.json()["access_token"]

def call_watsonx(system_prompt, user_message, API_KEY, URL, PROJECT_ID):
    token = get_iam_token(API_KEY)
    response = requests.post(f"{URL}/m1/v1/text/chat?version=2024-05-31",
                             headers={
                                 "Authorization": f"Bearer {token}",
                                 "Content-Type": "application/json"
                                 },
                                json={
                                        "model_id": "ibm/granite-13b-instruct-v2",
                                        "project_id": PROJECT_ID,
                                        "messages": [
                                            {"role": "system", "content": system_prompt},
                                            {"role": "user", "content": user_message}
                                            ],
                                        "parameters": {
                                            "max_new_tokens": 500,
                                            "temperature": 0.7
                                            }

                                    }

                             )
    return response.json()["choices"][0]["message"]["content"]
