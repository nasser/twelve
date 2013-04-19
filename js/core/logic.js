/*
 * Application logic
 */
var PEG = require("./peg.js")
var CoffeeScript = require("./coffeescript.js").CoffeeScript
var Query = require("./query.js")
var fs = require("fs")

// http://tech.karbassi.com/2009/12/17/pure-javascript-flatten-array/
Array.prototype.flatten = function flatten() {
   var flat = [];
   for (var i = 0, l = this.length; i < l; i++){
       var type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
       if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten.call(this[i]) : this[i]); }
   }
   return flat;
};


var Logic = {
  parser: PEG.buildParser(" \
    start = logic* \
    logic = comment? q:query e:event? a:action white { return { querySource:q, event:e, actionSource:a } }  \
    query = q:[^{:\\n]+ { return q.join('').trim() } \
    event = ':' event:alpha+ white { return event.join('') } \
    action = block:(curly / indented) { return block } \
    curly = curly:('{' ([^{}]+ / curly)+ '}') { return curly.flatten().join('') } \
    indented = '\\n' indented:indented_line+ ('\\n' / !.) { return '\\n  ' + indented.join('\\n  ') } \
    indented_line = '  ' line:[^\\n]+ ('\\n' / !.) { return line.join('') } \
    comment = '/*' (!'*/' .)* '*/' white / ('//'/'#') [^\\n]* '\\n' white \
    alpha = a:[a-zA-Z_]+ { return a.join('') } \
    white = [\\n  ]* \
  "),

  namify: function(query, event) {
    return (query + (event ? '_on' + event : '')).
      replace('!', 'not').
      replace('<', 'lt').
      replace('>', 'gt').
      replace(/[^\w]/g, '_') +
      '_' + Math.random().toString(36).
      replace('0.', '')
  },

  compiledLogics: 0,

  // parse and build out logic objects from text
  compile: function(logics) {
    return this.parser.parse(logics).map(function(logic) {
      // compile query string into query function
      logic.query = Query.compile(logic.querySource);

      // treat blank event as update
      logic.event = logic.event == '' ? 'update' : logic.event;

      // process the source
      var processedSource = logic.actionSource.
        replace(/^\{/, '').replace(/\}$/, '').
        replace(/\$\$(\w+)/, "World.query(\"$1\")").
        replace(/\$(\w+)/, "World.queryFirst(\"$1\")")

      // compile action source into function
      logic.action = CoffeeScript.eval('(args) -> ' + processedSource)

      // add apply funciton, queries world for
      // matching entities and runs logic on all
      logic.apply = function(args) {
        args = (typeof args === 'undefined') ? {} : args;
        var entities = World.queryRaw(this.query);
        for (var i = 0; i < entities.length; i++) {
          this.action.call(entities[i], args);
        }
      }

      // record position in source
      logic.sourcePosition = Logic.compiledLogics++;

      // record order, used to sort logics
      logic.order = logic.query.specificity * 1000 + logic.sourcePosition;

      // add meaningful toString
      logic.toString = function() { return logic.query.toString() + ' ' + logic.actionSource.replace('function (args)', '') };

      return logic;
    });
  },

  store: {},
  
  // add a logic to the store
  // build event prototype and cache if needed
  add: function(logic) {
    // crete prototype function if it doesnt exist
    if(!World.Entity[logic.event])
      World.Entity[logic.event] = function(args) {
        args = (typeof args === 'undefined') ? {} : args;
        var logics = Logic.store[logic.event];
        var logicFound = false;
        var returnValue;
        for(var i=0; i<logics.length; i++) {
           if(logics[i].query(this)) {
             returnValue = logics[i].action.call(this, args);
             logicFound = true;
           }
         }
         if(!logicFound)
          console.warn("Entity " + this + " does not understand the message `" + logic.event + "'");

        return returnValue;
      }

    // create logic store if it doesnt exist
    if(!Logic.store[logic.event]) {
      Logic.store[logic.event] = []
      Logic.store[logic.event].apply = function(args) {
        this.forEach(function(logic) { logic.apply(args) });
      }
      Logic.store[logic.event].toString = function() { return ":" + logic.event + "[" + this.map(function(l) { return "'" + l.toString() + "'" }) + "]"; }
    }

    // push logic to store
    Logic.store[logic.event].push(logic)
  },

  addFromString: function(logics) {
    Logic.compile(logics).forEach(function(logic) { Logic.add(logic); })
  },

  load: function(file) {
    console.log("Loading logic from %s...", file)
    Logic.addFromString(fs.readFileSync(file).toString());
  },

  runAll: function() {
    for (var i = 0; i < this.store.length; i++) {
      this.store[i].apply();
    };
  }
}

GLOBAL.Logic = Logic