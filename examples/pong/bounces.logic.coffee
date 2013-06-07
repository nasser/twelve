bounces x y xspeed yspeed {
  @x += @xspeed
  @y += @yspeed
}

bounces !xspeed !yspeed {
  @xspeed = Graphics.random(-0.5, 0.5)
  @yspeed = Graphics.random(-0.5, 0.5)
}

bounces xspeed x>350 x<355 {
  paddle = $("computer")
  if @y < (paddle.y + paddle.size) and @y > (paddle.y - paddle.size)
    @xspeed *= -1
    @yspeed += Graphics.random(-1, 1)
}

bounces xspeed x<50 x>45 {
  paddle = $("player")
  if (paddle.y + paddle.size) > @y > (paddle.y - paddle.size)
    @xspeed *= -1
    @yspeed += Graphics.random(-1, 1)
}

bounces yspeed y>350,
bounces yspeed y<50 {
  @yspeed *= -1
  @xspeed += Graphics.random(-1, 1)
}

bounces x<0,
bounces x>400 {
  @offscreen = true
}
