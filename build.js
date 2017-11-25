"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replay = exports.cmd = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let cmd = exports.cmd = (() => {
  var _ref = _asyncToGenerator(function* (options) {
    let epoch = Date.now(),
        session = [];
    let pty = setupPty(_extends({}, options, { epoch, session }));

    return new Promise(function (resolve, reject) {
      pty.on("close", function () {
        return resolve(_extends({}, options, { epoch, session }));
      });
      pty.on("error", function () {
        return reject(_extends({}, options, { epoch, session }));
      });
    });
  });

  return function cmd(_x) {
    return _ref.apply(this, arguments);
  };
})();

let replay = exports.replay = (() => {
  var _ref2 = _asyncToGenerator(function* ({ session }) {
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

  return function replay(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

var _nodePty = require("node-pty");

var _readline = require("readline");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

(0, _readline.emitKeypressEvents)(process.stdin);

function catchCtrlC(ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
}

function playTime({ ms, session }) {
  if (session[0] && session[0][0] <= ms) {
    let data = session.shift()[1];
    process.stdout.write(new Buffer(data));
    playTime({ ms, session });
  }
}

function setupPty({
  args = [],
  command = "bash",
  cols = 100, rows = 100,
  cwd,
  env,
  epoch,
  record = false,
  session
}) {
  let raw = process.stdin.isRaw;
  let pty = (0, _nodePty.spawn)(command, args, {
    cols, cwd, env, name: "xterm-color", rows
  });

  let writePty = data => pty.write(data);

  pty.on("close", data => {
    teardownStdin({ raw, writePty });
  });

  pty.on("data", data => {
    writeSession({ data, epoch, record, session });
    process.stdout.write(data);
  });

  setupStdin({ writePty });

  return pty;
}

function setupStdin({ writePty }) {
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", catchCtrlC);
  process.stdin.on("data", writePty);
}

function teardownStdin({ raw, writePty }) {
  process.stdin.setRawMode(raw);
  process.stdin.removeListener("keypress", catchCtrlC);
  process.stdin.removeListener("data", writePty);
}

function writeSession({ data, epoch, record = true, session }) {
  if (!record) return;
  let time = Date.now() - epoch;
  data = Buffer.from(data, "utf8");
  session.push([time, data]);
}
