# increment scores
ball x<0   { ($ "game").computer_score += 1 }
ball x>400 { ($ "game").player_score += 1 }

# Remove offscreen balls, spawn new balls
ball offscreen {
  delete @offscreen
  
  newBall = World.clone(this)

  newBall.x = Graphics.width/2
  newBall.y = Graphics.height/2
  newBall.xspeed = Graphics.random(-0.5, 0.5)
  newBall.yspeed = Graphics.random(-0.5, 0.5)
  

  World.remove(this)
}

# Draw the ball
ball {
  Graphics.fill()
  Graphics.ellipse @x, @y, 10, 10
}