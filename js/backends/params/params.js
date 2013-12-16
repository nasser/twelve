define(["core/world", "core/sugar"], function(World) {
  var Params = {
    load: function() {
      var params = eval("({" + decodeURI(window.location.search.substring(1)) + "})");
      if(World.state.params != undefined) {
        World.state.params = Object.merge(World.state.params, params)
        console.log(World.state.params)

      } else {
        params.id = "params"
        World.spawn(params)
        
      }

      console.log(World.state.params)
      if(World.state.params.seed) Math.seed = World.state.params.seed;
    }
  }

  return Params;
});