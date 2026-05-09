import os
from dotenv import load_dotenv
from ibm_watson_ai.foundation_models import ModelInference

load_dotenv()

# Singleton — initialized once on first call, reused for every request
_client = None


def init_client():
    """
    Initialize the watsonx.ai ModelInference client and return it.

    What to do:
    - Read these env vars from .env:
        IBM_API_KEY       — your IBM Cloud API key
        IBM_PROJECT_ID    — your watsonx.ai project ID
        IBM_WATSONX_URL   — e.g. "https://us-south.ml.cloud.ibm.com"
    - Raise ValueError if any are missing (fail fast so the problem is obvious at startup)
    - Build credentials:
        from ibm_watsonx_ai import Credentials
        creds = Credentials(url=IBM_WATSONX_URL, api_key=IBM_API_KEY)
    - Create and return the model client:
        from ibm_watsonx_ai.foundation_models import ModelInference
        return ModelInference(
            model_id="ibm/granite-13b-instruct-v2",   # adjust to whichever Granite model your project has access to
            credentials=creds,
            project_id=IBM_PROJECT_ID
        )

    Raises:
        ValueError: if a required env var is missing
        Exception: if watsonx authentication fails (wrong key, wrong URL, etc.)
    """
    pass


def get_client():
    """
    Return the singleton watsonx client, creating it on first call.

    What to do:
    - Reference the module-level _client variable with `global _client`
    - If _client is None, call init_client() and assign the result to _client
    - Return _client

    This pattern avoids re-authenticating on every request while still being
    simple enough for a hackathon (no dependency injection framework needed).
    """
    pass


def call_granite(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str:
    """
    Send a prompt pair to IBM Granite and return the generated text.

    What to do:
    - Call get_pyclient() to get the ModelInference instance
    - Build the messages list in the chat format:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ]
    - Set generation parameters:
        from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params
        params = {
            Params.MAX_NEW_TOKENS: max_tokens,
            Params.TEMPERATURE:    0.7,
            Params.TOP_P:          0.9,
        }
    - Call the model:
        response = client.chat(messages=messages, params=params)
      (Some SDK versions use generate_text — check ibm_watsonx_ai docs for your version)
    - Extract and return the text string from the response.
      Typical path: response["choices"][0]["message"]["content"]
      or:           response.result["results"][0]["generated_text"]
      Print the raw response once during development to confirm the exact shape.

    Args:
        system_prompt: Language + persona instructions (built by prompts.py)
        user_prompt:   The actual content request (lesson/challenge/feedback)
        max_tokens:    Cap on output length — 400 for lessons, 500 for challenges, 200 for feedback

    Returns:
        str: Raw generated text from Granite

    Raises:
        Exception: propagate as-is; the Flask route handler will catch and return HTTP 500
    """
    
    
    pass
