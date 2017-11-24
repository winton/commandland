import { spawn } from "node-pty"

// global
//
let epoch = Date.now()
let session = []

// process
//
process.stdin.setRawMode(true)

process.stdin.on("data", data => {
  pty.write(data)
})

process.on('SIGINT', () => {})

// pty
//
let pty = spawn("bash", [], {
  cols: 100,
  rows: 100,
  cwd: process.env.HOME,
  env: process.env
})

pty.on('data', function(data) {
  write({ data })
  process.stdout.write(data)
})

pty.on("close", play)

// replay
//
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
    let data = session.shift()[1]
    process.stdout.write(new Buffer(data))
    playTime(ms)
  }
}

function write({ data }) {
  let time = Date.now() - epoch
  data = Buffer.from(data, "utf8")
  session.push([ time, data ])
}
