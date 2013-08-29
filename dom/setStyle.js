define([
	"dojo/_base/lang",
	"acuna/kernel/concat",
	"dojo/dom-style"
],
	function(lang, concat, domStyle){
	
	"use strict";

	var dom = lang.getObject("acuna.dom", true);
	
	dom.setStyle = function(stack,args,context){
		stack.push(3);
		stack = concat.args2stack(stack,args,context);
		stack = concat.dupdd(stack,args,context);
		stack = concat.bridge(stack,[domStyle.set],context);
		return stack;
	}
	
	return dom.setStyle;
});