define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";
	
	var filter = lang.getObject("acuna.filter", true);
	
	var or = function(item,args,context) {
		// args is array of functions and args
		var result = array.some(args,function(a){
			return a[0](item,a[1],context);
		});
		console.log(result);
		return result;
	};
	
	filter.or = or;
	
	return or;
	
});