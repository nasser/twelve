# Twelve
Experimental game engine based on an extreme interpretation of the Entity Component System architchture.

## Status
This is highly experimental, both conceptually and technically. It may well be a terrible idea. 

## Overview
A game in Twelve is made up of three things: **objects**, **logic**, and **backends**. Broadly, objects store the state of the game, like positions or speed, logic implements behavior, like movement or death, and backends access non-game specific utilities like, graphics or input.

Each bit of game logic *selects* a particular set of objects, runs code *on each* matching object. This select-and-apply paradigm, inspired by Entity Component Systems, is what Twelve is exploring.

### Objects
Objects are just collections of data, represented as named *properties* with *values*. They have no behavior attached to them, and can't do anything on their own. Each object represents the state of one entity in your game, and taken together they represent the state of the entire game.

This is an object that has three properties, `name`, `x`, and `y`, with values `"Ramsey"`, `13`, and `17` respectively.

```javascript
name="Ramsey" x=13 y=17
```

Sometimes you will want to 'tag' an object to categorize it. For example, maybe the previous object represents the player in the game. You could do this

```javascript
player=true name="Ramsey" x=13 y=17
```

Tagging is common enough in Twelve that a shortcut is provided. Listing a property name with no value 'tags' the object with that property name. The next line of code is identical to the one above

```
player name="Ramsey" x=13 y=17
```

Objects can be created and destroyed in logic. You often want to start each game with a set of known objects. Here is how you might initialize a Pong-stye game.

```javascript
screen width=200 height=200
paddle player y=100
paddle computer y=100
ball x=100 y=100 bounces
```

Again, none of these properties have any inherent meaning. They are only brought to life by logic.

### Logic
Logic is where you implement your game mechanic. It is also where Twelve's paradigm is most visible: a logic block is made up of a **query** and an **action**.

```javascript
query {
  action
}
```

While the game is running, each logic block is selected in turn, a list of all objects matching the query is built, and the action is run on every object in the list. Actions are specified in JavaScrpt.

If you wanted to move everything with a `y` property down every frame, perhaps tp simulate gravity, you would write

```javascript
y {
  this.y = this.y - 1
}
```

Every frame, every object with a `y` property has this block of JavaScrpt run on it, and has its `y` value changed.

To move in x and y with given speeds:

```javascript
x xspeed y yspeed {
  this.x += this.xspeed
  this.y += this.yspeed
}
```

### Backends
Objects and Logic give you a way to organize data, but your game still needs to the machine it is running on in order to process inputs or draw graphics. There is general functionality that is not specific to a game mechnic, such as collision detection, that might make more sense outside of the Object/Logic system. These are situation where you might use or write a backend.

Backends are implemented in normal JavaScript and loaded into the global namespace. They can define their own API, and can even wrap existing libraries if needed. The key thing is that **backends should not maintain application state**. This breaks a lot of assumptions that make the system powerful. State should be maintained in the objects, and backends should simply provide functionality.

Here are two logic blocks that use the included Graphics backend, which just wraps Processing.js.

```javascript
/* Move player's paddle with mouse */
player paddle y {
  this.y = Graphics.mouseY
}

/* Draw the ball */
ball {
  Graphics.ellipse(this.x, this.y, 10, 10)
}
```

## Name
The first commits happened on 12/12/12. So, Twelve.

## Legal
Copyright &copy; Ramsey Nasser 2012, provided under the [MIT License](http://opensource.org/licenses/MIT).

Developed at [Eyebeam](http://eyebeam.org) as part of my fellowship exploring code as a medium of self expression.