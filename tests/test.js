define([
"acuna/query",
"acuna/dictionary",
"acuna/sequence",
"acuna/filter",
"acuna/style"
],function(query,dictionary,_sequence,_filter,style){

return function(){
_sequence = dictionary(_sequence,["acuna/dictionaries/short"]);
var each = _sequence.each;
var filter = _sequence.filter;
var mixin = _sequence.mixin;
var on = _sequence.on;
var and = _filter.and;
var eq = _filter.eq;
var context = {
  "path": "test.una",
  "file": "test.una",
  "word": "test",
  "ext": "una",
  "data": {
    "data": [
      {
        "person": {
          "firstname": "Wouter",
          "lastname": "Hager"
        }
      }
    ],
    "mylist": [
      "lucky",
      "number",
      7
    ],
    "mynolist": [
      1,
      2,
      3,
      [
        4,
        5,
        6
      ],
      [
        7,
        8,
        9
      ],
      0
    ],
    "myfavoritecolor": [
      "red"
    ]
  }
};
var result = [];
result[0] = query(result[0],["#app"],context);
result[0] = filter(result[0],[[and,[[eq,["id","app"]]]]],context);
result[0] = style(result[0],[["color","blue"]],context);
result[1] = query(result[1],["#app"],context);
result[1] = on(result[1],[["click"],[style,[["color",context.data.myfavoritecolor]]]],context);
context.result = result;
return context;
};
});