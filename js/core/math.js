define([], function() {
  // http://stackoverflow.com/questions/521295/javascript-random-seeds
  Math.seed = Date.now();
  Math.random = function() {
    var r = Math.sin(Math.seed++) * 10000;
    return r - Math.floor(r);
  }

  console.log("Math.seed: " + Math.seed);
})