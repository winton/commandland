import os from "os"
import { spawn } from "node-pty"
import stripAnsi from "strip-ansi"

process.stdin.setRawMode(true)

let epoch = Date.now()
let session = []

let ptyProcess = spawn("bash", [], {
  cols: 100,
  rows: 100,
  cwd: process.env.HOME,
  env: process.env
})

ptyProcess.on('data', function(data) {
  data = stripAnsi(data)
  write({ data })
  process.stdout.write(data)
})

process.stdin.on("data", data => {
  ptyProcess.write(data)
})

process.on('SIGINT', () => {})
ptyProcess.on("close", () => play())

function play() {
  let ms = 0
  let id = setInterval(() => {
    if (!session.length) {
      clearInterval(id)
      process.exit()
    }
    ms += 100
    playTime(ms)
  }, 100)
}

function playTime(ms) {
  if (session[0] && session[0][0] <= ms) {
    let [ undefined, data ] = session.shift()
    process.stdout.write(new Buffer(data))
    playTime(ms)
  }
}

function write({ data }) {
  let time = Date.now() - epoch
  data = Buffer.from(data, "utf8")
  session.push([ time, data ])
}
