
# commandland

terminal emulator with record & playback

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [record anything!](#record-anything)
- [run a command](#run-a-command)
- [replay a command](#replay-a-command)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## record anything!

* automation scripts
* live bash sessions
* automated + live input hybrid

## run a command

```js
import { run } from "commandland"
await run("ls", [ "/" ])
```

## replay a command

```js
import { command, replay } from "commandland"
let { session } = await command("ls", [ "/" ], { record: true })
await replay(session)
```
