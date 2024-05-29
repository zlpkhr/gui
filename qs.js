
Array.prototype.insert = function ( index, ...items ) {
    this.splice( index, 0, ...items );
};

const fs = require('node:fs')

let json = fs.readFileSync('./output.json','utf8')

const regexp = /\{\"messages\"\:\[\{\"/g;
let match;
let str = json

while ((match = regexp.exec(str)) !== null) {
  console.log(
    `Found ${match[0]} start=${match.index} end=${regexp.lastIndex}.`,
  );

  let cp = str.split('')
  cp.insert(match.index,'\n')
  str = cp.join('')
}

fs.writeFileSync('./a.json',str)