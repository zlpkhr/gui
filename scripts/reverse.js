#!/usr/bin/env node

const { parseArgs } = require("node:util");
const { Transform } = require("node:stream");
const { createReadStream, createWriteStream } = require("node:fs");
const { resolve } = require("node:path");

const options = {
  input: { type: "string", short: "i" },
  output: { type: "string", short: "o" },
};

const args = parseArgs({ options });

const reverse = (domain) => domain.split(".").reverse().join(".");

const transformer = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split("\n");

    for (const line of lines) {
      const parts = line.split("\t");
      if (parts.length === 3) {
        this.push(reverse(parts.at(1)).concat("\n"));
      }
    }

    callback();
  },
});

const readStream = createReadStream(resolve(process.cwd(), args.values.input));

const writeStream = createWriteStream(
  resolve(process.cwd(), args.values.output),
);

readStream.pipe(transformer).pipe(writeStream);
