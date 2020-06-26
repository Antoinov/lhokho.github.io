const delay = ms => new Promise(res => setTimeout(res, ms));

function arrayRemove(arr, value) { return arr.filter(function(ele){ return ele != value; });}
