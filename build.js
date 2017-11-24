"use strict";

var _stripAnsiStream = require("strip-ansi-stream");

var _stripAnsiStream2 = _interopRequireDefault(_stripAnsiStream);

var _parse = require("@manaflair/term-strings/parse");

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// process.stdin.setRawMode(true)

let stdout = (0, _stripAnsiStream2.default)();
let stderr = (0, _stripAnsiStream2.default)();
let child = (0, _child_process.spawn)("bash", [], { shell: true });

let epoch = Date.now();
let session = [];

// child.stdout.on("data", data => {
//   stdout.write(data)
// })

// child.stderr.on("data", data => {
//   stderr.write(data)
// })

// stdout.on("readable", () => {
//   let data = stdout.read()
//   if (data) {
//     write({ data, type: "out" })
//     process.stdout.write(data)
//   }
// })

// stderr.on("readable", () => {
//   let data = stderr.read()
//   if (data) {
//     write({ data, type: "err" })
//     process.stderr.write(data)
//   }
// })

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
  try {
    child.stdin.write(data);
  } catch (e) {}
});

process.on('SIGINT', () => {});

child.on("close", () => play());

function play() {
  let ms = 0;
  let id = setInterval(() => {
    if (!session.length) {
      clearInterval(id);
      process.exit();
    }
    ms += 100;
    playTime(ms);
  }, 100);
}

function playTime(ms) {
  if (session[0] && session[0][0] <= ms) {
    let [undefined, type, data] = session.shift();
    if (type == "out" || type == "in") {
      process.stdout.write(new Buffer(data));
    } else if (type == "err") {
      process.stderr.write(new Buffer(data));
    }
    playTime(ms);
  }
}

function write({ data, type }) {
  let time = Date.now() - epoch;
  session.push([time, type, data.toJSON().data]);
}
