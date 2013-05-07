define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	// list1 f filter
	// apply f to list
	var filter = function(list,args,context) {
		return array.filter(list,function(item){
			// args is array of functions
			return array.every(args,function(a){
				return a[0](item,a[1],context);
			});
		});
	};
	
	seq.filter = filter;
	
	return filter;
	
});
