#!/usr/bin/env node

const { parseArgs } = require("node:util");
const { createReadStream, createWriteStream } = require("node:fs");
const { resolve } = require("node:path");
const { createInterface } = require("node:readline");
const { get } = require("node:https");

const options = {
  input: { type: "string", short: "i" },
  output: { type: "string", short: "o" },
  timeout: { type: "string", short: "t" },
};

const args = parseArgs({ options });

const readStream = createReadStream(resolve(process.cwd(), args.values.input));

const readLine = createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

const isResolvable = async (domain, options) =>
  new Promise((resolve) => {
    const req = get(`https://${domain}`, options, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });

const timeout = parseInt(args.values.timeout, 10);

const writeStream = createWriteStream(
  resolve(process.cwd(), args.values.output),
);

readLine.on("line", async (line) => {
  if (
    await isResolvable(line, {
      timeout,
    })
  ) {
    writeStream.write(line.concat("\n"));
  }
});

readLine.on("close", () => {
  writeStream.end();
});
