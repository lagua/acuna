define([
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-style"
],
	function(lang, array, domStyle){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	acuna.setStyle = function(stack,args,context){
		var v = stack.pop();
		var s = args.shift();
		var x = stack.pop();
		domStyle.set(x.domNode ? x.domNode : x,s,v);
		stack = stack.concat(args);
		return stack;
	}
	
	return acuna.setStyle;
});