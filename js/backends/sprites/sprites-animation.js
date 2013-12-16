SpriteSheet.prototype.defineAnimation = function(name, frames, rate, defaults) {
  this.animations = this.animations || {}

  this.animations[name] = {
    rate: rate,
    lastIncrement: Date.now(),
    lastDraw: 0,
    loop: true,
    currentFrame: 0,
    defaults: defaults
  }

  var _this = this;
  this.animations[name].frames = frames.map(function(f) {
    if(isSprite(f)) {
      return f;
    } else if(_this.sprites[f]) {
      return _this.sprites[f];
    } else {
      throw new Error("Frame `" + f.toString() + "' is not a valid name or sprite")
    }
  })
}

SpriteSheet.prototype.drawAnimation = function(name, x, y, options) {
  options = options || {}
  options.loop = options.loop || true
  this.animations = this.animations || {}

  if(!this.animations[name])
    throw new Error("Animation `" + name + "' not found")

  var animation = this.animations[name]
  this.drawSprite(animation.frames[animation.currentFrame], x, y, options)

  if(options.loop === false && animation.currentFrame == animation.frames.length-1)
    return;

  if(Date.now() - animation.lastIncrement > animation.rate) {
    animation.lastIncrement = Date.now();
    animation.currentFrame++
    if(options.loop)
      animation.currentFrame %= animation.frames.length
  }
}

SpriteSheet.prototype.drawStill = SpriteSheet.prototype.draw;
SpriteSheet.prototype.draw = function(name, x, y, options) {
  this.animations = this.animations || {}
  
  if(this.animations[name]) {
    this.drawAnimation(name, x, y, options)
  } else {
    this.drawStill(name, x, y, options)
  }
}