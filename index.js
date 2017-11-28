import { spawn } from "node-pty"

export function terminal(...argv) {
  let options = setupOptions(...argv)

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
  } = options

  let pty = spawn(command, args, {
    cols, cwd, env, name: "xterm-color", rows
  })

  let stdio = {
    raw: process.stdin.isRaw,
    writePty: data => pty.write(data)
  }

  pty.on("close", data => {
    teardownStdin(stdio)
  })

  pty.on("data", data => {
    options.out += data
    writeSession({ data, epoch, record, session })
    if (!silent) process.stdout.write(data)
  })

  setupStdin(stdio)

  return { pty, options }
}

export async function run(command, args, opts) {
  let { pty, options } = terminal(command, args, opts)

  return new Promise((resolve, reject) => {
    pty.on("exit", (code, signal) =>
      resolve({ ...options, code, signal })
    )
    pty.on("error", () => reject(options))
  })
}

export async function replay(session) {
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

function playTime({ ms, session }) {
  if (session[0] && session[0][0] <= ms) {
    let data = session.shift()[1]
    process.stdout.write(new Buffer(data))
    playTime({ ms, session })
  }
}

function setupOptions(command, args, opts) {
  let epoch = Date.now()
  let session = []

  if (command && command.constructor.name == "Object") {
    opts = command
    command = opts.command
    args = opts.args
  }

  if (args && args.constructor.name == "Object") {
    opts = args
    args = []
  }
  
  return {
    command: "bash",
    cols: 100, rows: 100,
    out: "",
    record: false,
    silent: false,
    ...opts, command, args, epoch, session
  }
}

function setupStdin({ keypress, writePty }) {
  process.stdin.setRawMode(true)
  process.stdin.on("data", writePty)
}

function teardownStdin({ keypress, raw, writePty }) {
  process.stdin.setRawMode(raw)
  process.stdin.removeListener("data", writePty)
}

function writeSession({ data, epoch, record = true, session }) {
  if (!record) return
  let time = Date.now() - epoch
  data = Buffer.from(data, "utf8")
  session.push([ time, data ])
}
