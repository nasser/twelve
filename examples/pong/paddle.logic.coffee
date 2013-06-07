paddle !size {
  @size = 50
}

paddle player {
  @x = 50
}

paddle computer {
  @x = 400-50
}

paddle size {
  Graphics.strokeWeight 5
  Graphics.line @x, @y-@size, @x, @y+@size
}