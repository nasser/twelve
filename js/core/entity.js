define(["core/query"], function(Query) {
  var Entity = function(structure) {
    structure = typeof structure === "object" ? structure : World.compile(structure || "")[0]

    var id = structure.id || World.newId()
    this.__defineGetter__("id", function() { return id })
    this.__defineSetter__("id", function(i) {
      delete World.state[this.id]
      id = i
      World.state[id] = this
    })

    for(var prop in structure)
      this[prop] = structure[prop];
  }

  Entity.prototype.toString = function() {
    return "{" + Object.keys(this).map(function(k) { return k }).join(" ") + "}";
  }

  Entity.prototype.destroy = function() {
    World.removeEntity(this);
  },

  Entity.prototype.addTag = function(tag) {
    if(this[tag] === undefined) this[tag] = {};
  },

  Entity.prototype.removeTag = function(tag) {
    delete this[tag];
  }

  Entity.prototype.respondsTo = function(event) {
    if(event) {
      return !!(Logic.store[event] && Logic.store[event].supportedBy(this));

    } else {
      var _this = this;
      return Object.keys(Logic.store).filter(function(event) {
        return Logic.store[event].supportedBy(_this);
      });
    }
  }

  Entity.prototype.implementation = function(event) {
    // TODO clean up
    var _this = this;
    return Logic.store[event].filter(function(l) { return l.matches(_this); });
  }

  Entity.prototype.matches = function(query) {
    return Query.compile(query)(this);
  }

  Entity.prototype.clone = function() {
    var clone = new Entity();

    for(var prop in this)
      clone[prop] = this[prop]
    return clone
  }

  return Entity;
});