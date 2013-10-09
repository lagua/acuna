define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	var widget = lang.getObject("acuna.widget", true);

	var set = function(stack,args,context) {
		var k = args.shift();
		var v = args.shift();
		var nodes = stack.pop();
		array.forEach(nodes,function(node){
			node.set(k,v);
		});
		
		stack.push(nodes);
		
		return stack;
	};
	
	widget.set = set;
	
	return set;
	
});