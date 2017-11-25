import { spawn } from "node-pty"
import { emitKeypressEvents } from "readline"

emitKeypressEvents(process.stdin)

export async function cmd(options) {
  let epoch = Date.now(), session = []
  let pty = setupPty({ ...options, epoch, session })

  return new Promise((resolve, reject) => {
    pty.on("close", () =>
      resolve({ ...options, epoch, session })
    )
    pty.on("error", () =>
      reject({ ...options, epoch, session })
    )
  })
}

export async function replay({ session }) {
  let id, ms = 0

  return new Promise(resolve => {
    id = setInterval(() => {
      if (!session.length) {
        clearInterval(id)
        resolve()
      }
      ms += 100
      playTime({ ms, session })
    }, 100)
  })
}

function catchCtrlC(ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.exit()
  }
}

function playTime({ ms, session }) {
  if (session[0] && session[0][0] <= ms) {
    let data = session.shift()[1]
    process.stdout.write(new Buffer(data))
    playTime({ ms, session })
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
  let raw = process.stdin.isRaw
  let pty = spawn(command, args, {
    cols, cwd, env, name: "xterm-color", rows
  })

  let writePty = data => pty.write(data)

  pty.on("close", data => {
    teardownStdin({ raw, writePty })
  })

  pty.on("data", data => {
    writeSession({ data, epoch, record, session })
    process.stdout.write(data)
  })

  setupStdin({ writePty })

  return pty
}

function setupStdin({ writePty }) {
  process.stdin.setRawMode(true)
  process.stdin.on("keypress", catchCtrlC)
  process.stdin.on("data", writePty)
}

function teardownStdin({ raw, writePty }) {
  process.stdin.setRawMode(raw)
  process.stdin.removeListener("keypress", catchCtrlC)
  process.stdin.removeListener("data", writePty)
}

function writeSession({ data, epoch, record = true, session }) {
  if (!record) return
  let time = Date.now() - epoch
  data = Buffer.from(data, "utf8")
  session.push([ time, data ])
}
