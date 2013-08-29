define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	// list1 f filter
	// apply f to list
	var filter = function(stack,args,context) {
		var list = stack.pop();
		list = array.filter(list,function(item){
			// args is array of functions
			return array.every(args,function(a){
				return a(item,a[1],context);
			});
		});
		stack.push(list);
		return stack;
	};
	
	seq.filter = filter;
	
	return filter;
	
});
