game !inited {
  Graphics.size 400, 400, Graphics.P2D
  Graphics.background 0
  Graphics.color 255
  Graphics.stroke 255
  Graphics.ellipseMode Graphics.CENTER
  @inited = true
}

game {
  Graphics.background 0
  Graphics.strokeWeight 1
  Graphics.line 0, 50, Graphics.width, 50
  Graphics.line 0, 350, Graphics.width, 350
}