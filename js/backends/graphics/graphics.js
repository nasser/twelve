require(["backends/graphics/processing", "core/world", "core/logic"], function(Processing, World, Logic) {
  var canvas = document.createElement("canvas")
  document.body.appendChild(canvas);
  var Graphics = new Processing(canvas);

  Graphics.keyPressed = function() {
    World.query("keyboard").forEach(function(e) {
      e.key = Graphics.keyCode;
      e.key_down({key:Graphics.keyCode})
    });
  }

  Graphics.keyReleased = function() {
    World.query("keyboard").forEach(function(e) {
      e.key_up({key:e.key})
      delete e.key;
    });
  }

  Graphics.mousePressed = function () {
    World.query("mouse.hitbox").forEach(function(e) {
      // e.mouse.pressed = true;
      if( Graphics.mouseX < e.mouse.hitbox.x+e.mouse.hitbox.width && Graphics.mouseX > e.mouse.hitbox.x &&
          Graphics.mouseY < e.mouse.hitbox.y + e.mouse.hitbox.height && Graphics.mouseY > e.mouse.hitbox.y ) {
        e.mouse_down();
      }
    });
  }

  Graphics.mouseReleased = function () {
    World.query("mouse.hitbox").forEach(function(e) {
      // e.mouse.pressed = false;
      if( Graphics.mouseX < e.mouse.hitbox.x+e.mouse.hitbox.width && Graphics.mouseX > e.mouse.hitbox.x &&
          Graphics.mouseY < e.mouse.hitbox.y + e.mouse.hitbox.height && Graphics.mouseY > e.mouse.hitbox.y ) {
        e.mouse_up();
      }
    });
  }

  Graphics.mouseMoved = function () {
    World.query("mouse.hitbox").forEach(function(e) {
      if( Graphics.mouseX < e.mouse.hitbox.x+e.mouse.hitbox.width && Graphics.mouseX > e.mouse.hitbox.x &&
          Graphics.mouseY < e.mouse.hitbox.y + e.mouse.hitbox.height && Graphics.mouseY > e.mouse.hitbox.y ) {
        e.mouse.hover = true;

      } else {
        e.mouse.hover = false;

      }
    });
  }

  window.Graphics = Graphics;

  Logic.load("/js/backends/graphics/graphics.12")
  World.spawn("canvas width=750 height=840"); // TODO where do you init canvas dimentions?
});