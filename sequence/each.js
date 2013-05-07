define(["dojo/_base/lang", "dojo/_base/array", "acuna/kernel/apply", "acuna/sequence/merge"],
	function(lang, array, apply, merge){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	var prepend = function(stack,args,context) {
		return array.map(stack[0],function(_){
			return [_].concat(stack[1]);
		});
	};
	
	var append = function(stack,args,context) {
		return array.map(stack[0],function(_){
			return stack[1].concat([_]);
		});
	};
	
	var mapleft = function(stack,args,context){
		return array.map(stack[0],function(_){
			return [_,stack[1]];
		});
	};
	
	var mapright = function(stack,args,context){
		return array.map(stack[0],function(_){
			return [stack[1],_];
		});
	};
	
	var reverse = function(stack,args,context) {
		return stack.reverse();
	};
	
	// list [f1 f2] each
	// takes two sequences, applies all words in 2nd to 1st
	var each = function(stack,args,context) {
		stack = prepend(stack,args,context);
		stack = merge(stack,args,context);
		stack = reverse(stack,args,context);
		stack = mapleft(stack,args,context);
		return apply(stack,args,context);
	};
	
	seq.each = each;
	
	return each;
	
});
