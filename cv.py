import json

def convert_json(input_json):
    messages = input_json.get("messages", [])
    text_parts = []
    
    role_map = {
        "user": "human",
        "assistant": "Rosey",
        "system": "system"
    }
    
    for message in messages:
        if "content" in message:
            role = role_map.get(message.get("role", "unknown"), "unknown")
            content = message["content"]
            text_parts.append(f"<{role}>: {content}")
    
    combined_text = "\n".join(text_parts)
    output_json = {
        "text": combined_text,
        "metadata": {"source": "unified_joke_explanations"}
    }
    
    return json.dumps(output_json, indent=4)

input_json = {
    "messages": [
        {"role": "system", "content": "This tool generates HTML and CSS from textual descriptions."},
        {"role": "user", "content": "Q: What kind of flowers are great friends? A: Rose buds!"},
        {"role": "assistant", "content": "Roses are one of the best known flowers. As a rose grows, in the spring you will notice buds. Rose buds are little bumps on the stem of a rose from which the flowers will appear. Yes, roses are beautiful! (Be careful of the thorns, though.)"}
    ]
}

output_json = convert_json(input_json)
print(output_json)
