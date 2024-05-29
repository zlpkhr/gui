#!/usr/bin/env node

const { parseArgs } = require("node:util");
const { Transform } = require("node:stream");
const { createReadStream, createWriteStream } = require("node:fs");
const { resolve } = require("node:path");
const { createInterface } = require("node:readline");

const options = {
  input: { type: "string", short: "i" },
  output: { type: "string", short: "o" },
};

const args = parseArgs({ options });

const reverse = (domain) => domain.split(".").reverse().join(".");

const transformer = new Transform({
  transform(chunk, encoding, callback) {
    const parts = chunk.toString().split("\t");
    this.push(reverse(parts[1]).concat("\n"));
    callback();
  },
});

const readStream = createReadStream(resolve(process.cwd(), args.values.input));

const readLine = createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

readLine.on("line", (line) => {
  transformer.write(line);
});

readLine.on("close", () => {
  transformer.end();
});

const writeStream = createWriteStream(
  resolve(process.cwd(), args.values.output),
);

transformer.pipe(writeStream);
