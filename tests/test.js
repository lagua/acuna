define([
"acuna/query",
"acuna/dictionary",
"acuna/sequence",
"acuna/filter",
"acuna/style"
],function(){

var words = {
'query':arguments[0],
'dictionary':arguments[1],
'filter':arguments[1](arguments[2],["acuna/dictionaries/short"])['filter'],
'mixin':arguments[1](arguments[2],["acuna/dictionaries/short"])['mixin'],
'on':arguments[1](arguments[2],["acuna/dictionaries/short"])['on'],
'and':arguments[3]['and'],
'eq':arguments[3]['eq'],
'style':arguments[4]
};

return function(stack,args,remotecontext){
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
    "myfavoritecolor": "red"
  }
};
var stack = [];
stack = words['query'](stack,["#app"],context);
stack = words['filter'](stack,[[words['and'],[[words['eq'],["id","app"]]]]],context);
stack = words['style'](stack,[["color","blue"]],context);
context.stack = stack;
stack = words['query'](stack,["#app"],context);
stack = words['on'](stack,["click",[words['style'],[["color",context.data.myfavoritecolor]]]],context);
context.stack = stack;
return stack;
};

});