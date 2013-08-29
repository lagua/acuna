define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";
	
	var filter = lang.getObject("acuna.filter", true);
	
	var and = function(item,args,context) {
		// args is array of functions and args
		var result = array.every(args,function(a){
			return a(item,a[1],context);
		});
		console.log(result);
		return result;
	};
	
	filter.and = and;
	
	return and;
	
});