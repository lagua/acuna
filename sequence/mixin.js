define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	// list1 f filter
	// apply f to list
	var mixin = function(list,args,context) {
		array.forEach(list,function(item){
			// args is array of functions
			array.forEach(args,function(a){
				item[a[0]] = a[1];
			});
		});
		return list;
	};
	
	seq.mixin = mixin;
	
	return mixin;
	
});
