define(["dojo/_base/lang", "acuna/kernel/concat", "dojo/on"],
	function(lang, concat, on){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	seq.on = function(stack,args,context) {
		stack.push(2);
		stack = concat.args2stack(stack,args,context);
		stack = concat.dupdd(stack,args,context);
		stack.push(false);
		stack = concat.bridge(stack,[on],context);
		
		return stack;
	}
	
	return seq.on;
	
});
