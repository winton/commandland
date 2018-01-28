# commandland

I make executing commands look good.

![No](https://cdn.vox-cdn.com/thumbor/LqIoaTI0uqtGV8kxZ-vC3yzWx9M=/cdn.vox-cdn.com/uploads/chorus_asset/file/6188437/giphy.0.gif)

| Feature |
| --- |
| Live stdout with ASCII colors |
| Live stdin |
| (Or keep live stdout/stdin silent) |
| Capture output as string |
| Exit code and signal capture |
| Session record & playback |

## Run a command

```js
import { run } from "commandland"
await run("ls", ["/"])
```

## Execution options

| Option | Example | Purpose |
| --- | --- | --- |
| args | `["/"]` | Command arguments |
| command | `"ls"` | Command to execute |
| cols, rows | `100` | Column and rows for pty |
| cwd | `process.env.HOME` | Working directory for pty |
| env | `process.env` | Environment for pty |
| record | `false` | Record the session |
| silent | `false` | Execute without stdout |
| stdin | `false` | Allow stdin input |

## Replay a session

```js
import { run, replay } from "commandland"
let { session } = await run("ls", ["/"], { record: true })
await replay(session)
```
