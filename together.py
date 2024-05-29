import os
from together import Together

client = Together(api_key="")

resp = client.files.upload(file="lol.jsonl") # uploads a file
print(resp.dict())