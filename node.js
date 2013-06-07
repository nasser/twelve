var inspect = require('eyes').inspector();

require("./js/core/logic.js")
require("./js/core/world.js")

Logic.load("examples/asteroids/main.12")
World.load("examples/asteroids/init.w")

inspect($("random"))
inspect($("ship"))

// Logic.store.update.apply({delta:1})

// $('inventory name="radio"').click()
// Logic.store.update.apply({delta:1})
// inspect($$("*"))

// Logic.store.update.apply({delta:1})
// inspect($$("*"))

// Logic.store.update.apply({delta:1})
// inspect($$("*"))

// // World.spawn('item="radio"')
// // Logic.store.update.apply({delta:1})

// // console.log(Query.compile("foo what *").toString())

// // Logic.store.update.apply({delta:1})
// // inspect(World.state)