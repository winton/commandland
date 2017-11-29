"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replay = exports.run = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let run = exports.run = (() => {
  var _ref = _asyncToGenerator(function* (command, args, opts) {
    let { pty, options } = terminal(command, args, opts);

    return new Promise(function (resolve, reject) {
      pty.on("exit", function (code, signal) {
        return resolve(_extends({}, options, { code, signal }));
      });
      pty.on("error", function () {
        return reject(options);
      });
    });
  });

  return function run(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let replay = exports.replay = (() => {
  var _ref2 = _asyncToGenerator(function* (session) {
    let id,
        ms = 0;

    return new Promise(function (resolve) {
      id = setInterval(function () {
        if (!session.length) {
          clearInterval(id);
          resolve();
        }
        ms += 100;
        playTime({ ms, session });
      }, 100);
    });
  });

  return function replay(_x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.terminal = terminal;

var _nodePty = require("node-pty");

var _events = require("events");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function terminal(...argv) {
  let options = setupOptions(...argv);

  let {
    args,
    command,
    cols, rows,
    cwd,
    env,
    epoch,
    record,
    session,
    silent
  } = options;

  let pty = (0, _nodePty.spawn)(command, args, {
    cols, cwd, env, name: "xterm-color", rows
  });

  let stdio = {
    raw: process.stdin.isRaw,
    writePty: data => pty.write(data)
  };

  pty.on("close", data => {
    teardownStdin(stdio);
  });

  pty.on("data", data => {
    options.out += data;
    writeSession({ data, epoch, record, session });
    if (!silent) process.stdout.write(data);
  });

  setupStdin(stdio);

  return { pty, options };
}

function playTime({ ms, session }) {
  if (session[0] && session[0][0] <= ms) {
    let data = session.shift()[1];
    process.stdout.write(new Buffer(data));
    playTime({ ms, session });
  }
}

function setupOptions(command, args, opts) {
  let epoch = Date.now();
  let session = [];

  if (command && command.constructor.name == "Object") {
    opts = command;
    command = opts.command;
    args = opts.args;
  }

  if (args && args.constructor.name == "Object") {
    opts = args;
    args = [];
  }

  return _extends({
    command: "bash",
    cols: 100, rows: 100,
    out: "",
    record: false,
    silent: false
  }, opts, { command, args, epoch, session
  });
}

function setupStdin({ keypress, writePty }) {
  process.stdin.setRawMode(true);
  process.stdin.setMaxListeners(1000);
  process.stdin.on("data", writePty);
}

function teardownStdin({ keypress, raw, writePty }) {
  process.stdin.setRawMode(raw);
  process.stdin.removeListener("data", writePty);
  process.stdin.unref();
}

function writeSession({ data, epoch, record = true, session }) {
  if (!record) return;
  let time = Date.now() - epoch;
  data = Buffer.from(data, "utf8");
  session.push([time, data]);
}
