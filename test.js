var commandland = require("./.build")

commandland.run({ record: true }).then(function(output) {
  return commandland.replay(output.session)
}).then(function() {
  process.exit()
})
