/*
 * Application state
 */

var PEG = require("./peg.js")
var Query = require("./query.js")
var fs = require("fs")
var inspect = require("eyes").inspector()

var World = {
  parser: PEG.buildParser(" \
    start = entity* \
    entity = (' ' / '\\n')* e:[^;\\n]+ (';' / '\\n' / !.) { return e.join('') } \
  "),

  compile: function(state_source) {
    return World.parser.parse(state_source).map(function(queryString) {
      var entity = { _tags:{} }

      Query.parser.parse(queryString)[0].forEach(function(predicate) {
        if(predicate.simple) {
          entity._tags[predicate.property] = true;

        } else if(predicate.infix) {
          switch(predicate.infix) {
            case '=': entity[predicate.property] = predicate.value; break;
            case '!=': if(predicate.value == undefined) entity[predicate.property] = true; break;
            default: console.warn("Ignoring unsupported infix operator '" + predicate.infix + "' in entity")
          }

        } else if(predicate.prefix) {
          console.warn("Ignoring unsupported prefix operator '" + predicate.prefix + "' in entity")

        } else if(predicate.wildcard) {
          console.warn("Ignoring wildcard predicate in spawn")

        }
      });

      return entity;
    });
  },

  state: [],

  Entity: {
    toString: function() {
      var obj = this
      return "{" + Object.keys(this).map(function(k) { return typeof obj[k] == 'string' ? k +"='"+obj[k] +"'" : k }).join(" ") + "}";
    }
  },

  id: function() {
    return (Date.now() + Math.random()).toString(36)
  },

  add: function(state_source) {
    World.parser.parse(state_source).forEach(function(source) { World.spawn(source) });
  },

  load: function(file) {
    console.log("Loading state from %s...", file)
    World.add(fs.readFileSync(file).toString());
  },

  remove: function(entity) {
    World.state.splice(World.state.indexOf(entity), 1)
  },

  clone: function(original) {
    var clone = World.spawn();
    for(var prop in original)
      clone[prop] = original[prop]
    return clone
  },

  spawn: function(structure) {
    var newEntity = structure ? World.compile(structure)[0] : {};
    newEntity.__proto__ = World.Entity;

    World.state.push(newEntity);
    newEntity.start()
    return newEntity;
  },

  query: function(expression) {
    return World.state.filter(Query.compile(expression));
  },

  queryFirst: function(expression) {
    return World.query(expression)[0];
  },

  queryRaw: function(fn) {
    return World.state.filter(fn);
  }
}

GLOBAL.World = World
GLOBAL['$'] = World.queryFirst
GLOBAL['$$'] = World.query


// var scripts = document.querySelectorAll("script[type='text/state']");
// for (var i = 0; i < scripts.length; i++) {
//   if(scripts[i].src.length > 0) World.addFile(scripts[i].src)
//   World.add( scripts[i].text.trim() )
// };