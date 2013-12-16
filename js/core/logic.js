/*
 * Application logic
 * 
 * Logics define the behaviour of the application. A logic looks like this:
 * 
 * player health<20 :move {
 *   @x += @speed * .5
 * }
 * 
 * A logic consists of three parts:
 * 
 * 1. The query (e.g. player health<20)
 * 2. The message name (e.g. move)
 * 3. The action (e.g. { @x += @speed * .5 })
 * 
 * Whenever an entity recieves a message, it runs all of the actions who's
 * queries match that entity. So $('player').move() would run the above action
 * only if the returned entity also had a health property with a value less
 * than 20.
 */

define(["core/peg", "core/coffeescript", "core/query", "core/entity", "core/ajax", "core/sugar", "core/math"], function(PEG, CoffeeScript, Query, Entity, Ajax) {
  var Logic = {
    parser: PEG.buildParser(" \
      start = logic* \
      logic = comment? q:query m:message? p:query? a:action white { return { querySource:q, message:m, actionSource:a, parameterSource:p } }  \
      query = q:[^{:\\n]+ { return q.join('').trim() } \
      message = ':' message:alpha+ white { return message.join('') } \
      action = block:(curly / indented) { return block } \
      curly = curly:('{' ([^{}]+ / curly)* '}') { return curly.flatten().join('') } \
      indented = '\\n' indented:indented_line+ ('\\n' / !.) { return '\\n  ' + indented.join('\\n  ') } \
      indented_line = '  ' line:[^\\n]+ ('\\n' / !.) { return line.join('') } \
      comment = '/*' (!'*/' .)* '*/' white / ('//'/'#') [^\\n]* '\\n' white \
      alpha = a:[a-zA-Z_]+ { return a.join('') } \
      white = [\\n  ]* \
    "),

    /*
     * Overridable options for the Logic system
     */ 
    options: {
      defaultMessageName: 'spawned'
    },

    /*
     * Generates a unique name for a query and message
     * 
     * Logic.namify("player health<20 state='alive'", "move")
     * > "player_healthlt20_state__alive__onmove_mzbc56qukkv5cdi"
     * 
     * TODO never actually used
     */
    namify: function(query, message) {
      return (query + (message ? '_on' + message : '')).
        replace('!', 'not').
        replace('<', 'lt').
        replace('>', 'gt').
        replace(/[^\w]/g, '_') +
        '_' + Math.random().toString(36).
        replace('0.', '')
    },

    /*
     * The total number of logics compiled
     * 
     * Used to keep track of source position
     */
    compiledLogics: 0,

    /*
     * Parse and build out logic objects from text
     * 
     * logic - The source text of the Logics to compile
     * 
     * Returns an array of Logic objects 
     */
    compile: function(logics, file) {
      return this.parser.parse(logics).map(function(logic) {
        // compile query string into query function
        logic.query = Query.compile(logic.querySource);

        // treat blank message as update
        logic.message = logic.message == '' ? Logic.options.defaultMessageName : logic.message;

        if(logic.parameterSource != '') {
          logic.parameterQuery = Query.compile(logic.parameterSource)
        }

        // process the source
        var processedSource = logic.actionSource.
          replace(/^\{/, '').replace(/\}$/, '').
          replace(/\?(\w+)/g, "args.$1")

        logic.actionSource = processedSource

        // compile action source into function
        logic.action = CoffeeScript.eval('(args) -> ' + processedSource)

        // the file this logic came from
        logic.file = file || "(eval)"

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

        // TODO cleanup
        logic.matches = function(e) { return this.query(e); }

        // add meaningful toString
        logic.toString = function() { return logic.query.toString() + ' ' + logic.actionSource.replace('function (args)', '') };

        return logic;
      });
    },

    /*
     * Store for all Logics
     * 
     * Maps message name to an array of Logic objects for that message
     */
    store: {},
    
    // add a logic to the store
    // build message prototype and cache if needed
    add: function(logic) {
      // crete Entity prototype function if it doesnt exist
      if(!Entity.prototype[logic.message]) {
        Entity.prototype[logic.message] = function(args) {
          args = (typeof args === 'undefined') ? {} : args;
          var logics = Logic.store[logic.message];
          var logicFound = false;
          var returnValue;
          for(var i=0; i<logics.length; i++) {
            try {
              if(logics[i].query(this) && (logics[i].parameterQuery === undefined || logics[i].parameterQuery(args))) {
                returnValue = logics[i].action.call(this, args);
                  logicFound = true;
                }
             } catch(err) {
              err.message = logics[i].file + "@" + logics[i].querySource + ":" + logics[i].message + " : " + err.message
              throw err;
             }
           }  

           // if(!logicFound)
           //  console.warn("Entity " + this + " does not understand the message `" + logic.message + "'");

          return returnValue;
        }
      }

      // create Array prototype function of it doesnt exist
      if(!Array.prototype[logic.message]) {
        var extend_object = {}
        extend_object[logic.message] = function(args) {
          args = (typeof args === 'undefined') ? {} : args;
          for (var i = 0; i < this.length; i++) {
            if(this[i][logic.message])
              this[i][logic.message].call(this[i], args)
          };
        }

        Array.extend(extend_object);
      }

      // create logic store if it doesnt exist
      if(!Logic.store[logic.message]) {
        Logic.store[logic.message] = []
        Logic.store[logic.message].apply = function(args) {
          this.forEach(function(logic) { logic.apply(args) });
        }
        Logic.store[logic.message].toString = function() { return ":" + logic.message + "[" + this.map(function(l) { return "'" + l.toString() + "'" }) + "]"; }

        Logic.store[logic.message].supportedBy = function(o) { return this.reduce(function(m, l) { return m || l.query(o) }, false) };
      }

      // push logic to store
      Logic.store[logic.message].push(logic)
    },

    addFromString: function(logics, file) {
      Logic.compile(logics, file).forEach(function(logic) { Logic.add(logic); })
    },

    load: function(file) {
      console.log("Loading logic from %s...", file);
      (new Ajax()).connect(file, "GET", "", function(res) {
        Logic.addFromString(res.response, file)
      })
    },

    runAll: function() {
      for (var i = 0; i < this.store.length; i++) {
        this.store[i].apply();
      };
    }
  }

  window.Logic = Logic;
  return Logic;
});