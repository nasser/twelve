document.write("<canvas>")
var Graphics = new Processing(document.querySelector('canvas'));

Graphics.keyPressed = function() {
  World.query("keyboard").forEach(function(e) {
    e.key = Graphics.keyCode;
  });
}

Graphics.keyReleased = function() {
  World.query("keyboard").forEach(function(e) {
    delete e.key;
  });
}

Logic.addFromFile("/js/backends/graphics/graphics.12")

var canvas = World.spawn("canvas width=900 height=400");