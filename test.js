var cmd = require("./build")

cmd.cmd({ record: true }).then(function(output) {
  return cmd.replay({ session: output.session })
}).then(function() {
  process.exit()
})

