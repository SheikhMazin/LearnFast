import os
from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params

load_dotenv()

# Singleton — initialized once on first call, reused for every request
_client = None


def init_client():
    api_key = os.getenv("WATSONX_API_KEY")
    project_id = os.getenv("WATSONX_PROJECT_ID")
    url = os.getenv("WATSONX_URL")

    if not api_key:
        raise ValueError("Missing WATSONX_API_KEY in .env") 
    if not project_id:
        raise ValueError("Missing WATSONX_PROJECT_ID in .env")
    if not url:
        raise ValueError("Missing WATSONX_URL in .env")

    creds = Credentials(url=url, api_key=api_key)

    return ModelInference(
            model_id="ibm/granite-4-h-small",
            credentials=creds,
            project_id=project_id
            )

def get_client():
    global _client
    if _client is None:
        _client = init_client()
    return _client
   



def call_granite(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str:
    client = get_client()
    messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
    ]

    params = {
            Params.MAX_NEW_TOKENS:  max_tokens,
            Params.TEMPERATURE:     0.7,
            Params.TOP_P:           0.9,
    }

    response = client.chat(messages=messages, params=params)
    return response["choices"][0]["message"]["content"]


