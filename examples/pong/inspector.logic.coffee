inspector_hover x y {
  Graphics.pushStyle()
  Graphics.noFill()
  Graphics.strokeWeight 1
  Graphics.stroke 255, 0, 0, 128
  Graphics.line 0, @y, Graphics.width, @y
  Graphics.line @x, 0, @x, Graphics.height
  Graphics.popStyle()
}