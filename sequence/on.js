define(["dojo/_base/lang", "acuna/kernel/extended", "dojo/on"],
	function(lang, extended, on){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	seq.on = function(stack,args,context) {
		stack.push(2);
		stack = extended.args2stack(stack,args,context);
		stack = extended.dupdd(stack,args,context);
		stack.push(false);
		stack = extended.bridge(stack,[on],context);
		
		return stack;
	}
	
	return seq.on;
	
});
