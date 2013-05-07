define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	// list [f1 f2] each
	// takes two sequences, applies all words in 2nd to 1st
	var merge = function(stack,args,context) {
		return [stack,args];
	};
	
	seq.merge = merge;
	
	return merge;
	
});
