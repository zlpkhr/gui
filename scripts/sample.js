#!/usr/bin/env node

const { parseArgs } = require("node:util");
const { createReadStream, createWriteStream } = require("node:fs");
const { resolve } = require("node:path");
const { createInterface } = require("node:readline");

const options = {
  input: { type: "string", short: "i" },
  output: { type: "string", short: "o" },
  size: { type: "string", short: "s" },
};

const args = parseArgs({ options });

const readStream = createReadStream(resolve(process.cwd(), args.values.input));

const readLine = createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

const size = parseInt(args.values.size, 10);
const reservoir = [];
let count = 0;

const writeStream = createWriteStream(
  resolve(process.cwd(), args.values.output),
);

readLine.on("line", (line) => {
  count += 1;

  if (reservoir.length < size) {
    reservoir.push(line);
  } else {
    const randomIndex = Math.floor(Math.random() * count);

    if (randomIndex < size) {
      reservoir[randomIndex] = line;
    }
  }
});

readLine.on("close", () => {
  writeStream.write(reservoir.join("\n"));

  writeStream.end();
});
