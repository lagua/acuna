define([
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-style"
],
	function(lang, array, domStyle){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	var arrayToObject = function(ar) {
		var o = {};
		array.forEach(ar,function(_){
			for(var k in _) {
				o[k] = _[k];
			}
		});
		return o;
	}
	
	acuna.style = function(list,args,context){
		if(!args.length) return;
		var s = arrayToObject(args);
		array.forEach(list,function(item){
			domStyle.set(item.domNode,s);
		});
		return list;
	}
	
	return acuna.style;
});