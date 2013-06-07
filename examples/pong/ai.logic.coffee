computer y {
  avg = $$("ball y").reduce( ((prev, ball) -> prev + ball.y), 0) / $$("ball y").length
  @y = avg
}