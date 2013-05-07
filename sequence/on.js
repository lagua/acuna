define(["dojo/_base/lang", "acuna/kernel/array", "dojo/on"],
	function(lang, array, on){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	seq.on = function(stack,args,context) {
		stack = array.defer(stack,args,context);
		stack = array.apply(stack,[on],context);
		return stack;
	}
	
	return seq.on;
	
});
