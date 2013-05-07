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
		array.forEach(ar,function(a){
			o[a[0]] = a[1];
		});
		return o;
	}
	
	acuna.style = function(list,args,context){
		array.forEach(list,function(item){
			var s = arrayToObject(args);
			domStyle.set(item.domNode,s);
		});
		return list;
	}
	
	return acuna.style;
});