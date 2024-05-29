const {setTimeout} = require('timers/promises')
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: "",
});

const inputFile = './data/clean.json';
const outputFile = 'output.json';

async function generatePrompt(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        "role": "system",
        "content": "Generate prompt for fine tuning openai model that will generate html documents based on the textual input, following text is text from parsed html, giveout only the prompt input example from the understanding from the provided text what this website is about. Give only the user input example, WITHOUT EXAMPLE OUTPUT, GIVE JUST TEXT, DO NOT ADD NOTHING, NO FORMATTING, NO DESCRIPTION, DO NOT WRITE ABOUT FACTS ABOUT WEBSITE, JUST THE DESCRIPTION OF THE WEBSITE, DO NOT INCLUDE ACTUAL URLs"
      },
      {
        'role': 'user',
        "content": text
      }
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  
  return response.choices[0].message.content;
}

async function processFile() {
  // Read input JSON file
  const data = fs.readFileSync(inputFile, 'utf8');
  const jsonArray = JSON.parse(data);
  const outputData = [];

  for (const item of jsonArray) {
    const promptText = await generatePrompt(item.text);
    const message = {
      "messages": [
        {
          "role": "system",
          "content": "This tool generates HTML and CSS from textual descriptions."
        },
        {
          "role": "user",
          "content": promptText
        },
        {
          "role": "assistant",
          "content": `{"html": "${item.html}", "css": "${item.css}"}`
        }
      ]
    };
    fs.appendFileSync(outputFile,JSON.stringify(message,null,0).concat('\n'))
    await setTimeout(5000)
  }

  // Write output JSON file
  // fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf8');
  console.log('Output successfully written to', outputFile);
}

processFile().catch(err => {
  console.error('Error processing file:', err);
});
