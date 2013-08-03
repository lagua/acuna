define([
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-style"
],
	function(lang, array, domStyle){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	acuna.getStyle = function(stack,args,context){
		var x = stack.pop();
		var s = args.shift();
		var r = domStyle.get(x.domNode,s);
		r = r.indexOf("px") ? parseInt(r,10) : r;
		stack.push(r);
		stack = stack.concat(args);
		return stack;
	}
	
	return acuna.getStyle;
});