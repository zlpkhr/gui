const fs = require('fs')

const jsonl = fs.readFileSync('./output.json','utf8')

const lines = jsonl.split('\n').map(JSON.parse)


for (const line of lines) {
    const [system, user, assistant] = line.messages

    const l = ({
        'text': `<human>: ${system.content}? Q: ${user.content} A: ${JSON.stringify(assistant.content)}`
    })

    fs.appendFileSync('lol.jsonl',JSON.stringify(l).concat('\n'))
}
