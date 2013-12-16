SpriteSheet.prototype.initGridBySize = function(w, h) {
  for(var i=0; (i*w)<this.imgElement.width; i++) {
    for(var j=0; (j*h)<this.imgElement.height; j++) {
      this.nameSprite([i, j], {x:i*w, y:j*h, w:w, h:h})
    }
  }
}

SpriteSheet.prototype.initGridByCount = function(nx, ny) {
  this.initGridBySize(this.imgElement.width/nx, this.imgElement.height/ny)
}

SpriteSheet.prototype.nameBlock = function(name, from, to) {
  from = this.sprites[from]
  to = this.sprites[to]
  this.nameSprite(name, {x:from.x, y:from.y, w:to.x-from.x+from.w, h:to.y-from.y+from.h})
}