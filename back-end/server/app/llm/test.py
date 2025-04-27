from client import complete
from openai import OpenAI
from dotenv import load_dotenv
import os
from pydantic import BaseModel

load_dotenv(dotenv_path="../../../../.env")


class Step(BaseModel):
    explanation: str
    output: str


class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str


api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

response = client.responses.parse(
    model="gpt-4.1-mini-2025-04-14", input="what is 3 + 2?", text_format=MathReasoning, instructions="You are a math teacher. Guide user to get the answer.")

print(response.output_text)
print(response.output_parsed.final_answer)
