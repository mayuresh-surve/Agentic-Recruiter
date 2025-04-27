import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../../../.env")

# Low-level wrapper around OpenAI Response API

def complete(prompt: list, **kwargs):
    """
    Send a completion request to OpenAI's Response API and return raw text.
    TODO: configure retries, timeouts, and error handling.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    parse_output = False
    params = {
        "model": kwargs.get("model", "gpt-4.1-mini-2025-04-14"),
        "input": prompt,
        "max_output_tokens": kwargs.get("max_output_tokens", 5000),
        "temperature": kwargs.get("temperature", 0),
    }
    if "instructions" in kwargs and kwargs["instructions"] is not None:
        params["instructions"] = kwargs["instructions"]
    if "output_format" in kwargs and kwargs["output_format"] is not None:
        parse_output = True
        params["text_format"] = kwargs["output_format"]

    
    response = client.responses.parse(**params)
    print(response.output_text)

    return response.output_parsed if parse_output else response.output_text
