var commandland = require("./.build")

commandland.run({ record: true, stdin: true }).then(function(output) {
  return commandland.replay(output.session)
}).then(function() {
  process.stdin.unref()
})
