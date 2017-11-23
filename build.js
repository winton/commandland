"use strict";

var _child_process = require("child_process");

let child = (0, _child_process.spawn)("node", ["-i"]);
let epoch = Date.now();
let session = [];

child.stdin.setEncoding("utf-8");

child.stdout.on("data", data => {
  write({ data, type: "out" });
  process.stdout.write(data);
});

child.stderr.on("data", data => {
  write({ data, type: "err" });
  process.stderr.write(data);
});

process.stdin.on("data", data => {
  write({ data, type: "in" });
  child.stdin.write(data);
});

process.on('SIGINT', () => {});

child.on("close", () => {
  console.log(session);
  process.exit();
});

function write({ data, type }) {
  let time = Date.now() - epoch;
  session.push([time, type, data.toJSON().data]);
}
