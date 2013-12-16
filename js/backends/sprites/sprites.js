define(["core/ajax", "core/logic"], function(Ajax, Logic) {
  function isSprite(region) {
    return ((typeof region.x !== 'undefined') &&
            (typeof region.y !== 'undefined') &&
            (typeof region.w !== 'undefined') &&
            (typeof region.h !== 'undefined'))
  }

  // low level, basic sprite sheet
  // a spritesheet is an image and a set of sprites
  // a sprite is a mapping from a string to a rectangular region
  // e.g. 'monster-angry' -> {x:32, y:32, w:64, h:32}
  // TODO ctx?
  var SpriteSheet = function(url, canvas, onload) { 
    var i = new Image()
    i.onload = onload;
    i.src = url;
    this.imgElement = i;
    this.ctx = canvas.getContext("2d");
    this.sprites = {}
  }

  SpriteSheet.sheets = {}

  SpriteSheet.get = function (url, onload) {
    if(SpriteSheet.sheets[url] === undefined)
      SpriteSheet.sheets[url] = new SpriteSheet("/sprites/" + url + ".png", document.querySelector('canvas'), function() {
        SpriteSheet.sheets[url].initWithJson("/sprites/" + url + ".json")
      });

    return SpriteSheet.sheets[url];
  }

  // draw a region of the spritesheet in the context
  // sprite = {x,y,w,h}
  SpriteSheet.prototype.drawSprite = function(sprite, x, y, options) {
    options = options || {}
    options.offset = options.offset || [0,0]

    if(options.center == true)
      options.anchor = [0.5,0.5]
    if(options.anchor)
      options.offset = [-sprite.w*options.anchor[0], -sprite.h*options.anchor[1]]

    this.ctx.drawImage(this.imgElement, sprite.x, sprite.y, sprite.w, sprite.h, (x + options.offset[0])|0, (y + options.offset[1])|0, sprite.w, sprite.h);
  }

  // draw a named region of the sprite in the context
  SpriteSheet.prototype.drawNamed = function(name, x, y, options) {
    if(typeof this.sprites[name] === 'undefined')
      throw new Error("No sprite with name `" + name + "' found!")
    this.drawSprite(this.sprites[name], x, y, options)
  }

  // overloaded draw method
  SpriteSheet.prototype.draw = function(what, x, y, options) {
    if(isSprite(what)) {
      this.drawSprite(what, x, y, options);
    } else {
      this.drawNamed(what, x, y, options)
    }
  }

  // name a region of the spritesheet
  // region can be a {x,y,w,h} region or a name of an exisiting region
  // TODO default options (anchor etc)
  SpriteSheet.prototype.nameSprite = function(name, region) {
    if(isSprite(region)) {
      this.sprites[name] = region
    } else {
      this.nameSprite(name, this.sprites[region]);
    }
  }

  SpriteSheet.prototype.clearSprites = function() {
    this.sprites = {}
  }

  SpriteSheet.prototype.initWithJson = function (url) {
    var _this = this;
    (new Ajax()).connect(url, "GET", "", function(res) {
      var json = JSON.parse(res.response)
      for(var name in json.frames) {
        _this.nameSprite(name, json.frames[name].frame)
      }
    })
  }

  window.SpriteSheet = SpriteSheet;

  Logic.load("/js/backends/sprites/sprites.12")

  return SpriteSheet;
});