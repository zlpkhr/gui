const fs = require('fs')

const jsonl = fs.readFileSync('./lol.jsonl','utf8')

fs.appendFileSync('lol.jsonl',jsonl)
