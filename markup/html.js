define(["dojo/_base/lang", "dojo/_base/array","dojo/dom-construct"],
	function(lang,array, domConstruct){
	
	"use strict";

	var markup = lang.getObject("acuna.markup", true);
	
	var checkMixed = function(obj){
		var unmix = {};
		for(var i=0;i<obj.length;i++) {
			var _ = obj[i];
			if(typeof _ == "object") {
				if(_ instanceof Object) {
					for(var k in _) {
						if(unmix[k]) {
							return true;
						}
						unmix[k] = 1;
					}
				}
			} else {
				return true;
			}
		}
	};
	
	var traverse = function(name,obj,parent){
		var elm;
		var attrs = {};
		if(obj instanceof Array) {
			// element should be created now
			if(!obj.length) return;
			var temp = [], ar = [];
			array.forEach(obj,function(_,i){
				if(typeof _ == "object" && _ instanceof Array) {
					if(_.length) {
						if(typeof _[0] == "function" && temp[i-1] instanceof Object) {
							for(var k in temp[i-1]) {
								var a = temp[i-1][k];
								if(!(a instanceof Array)) a = _[1];
								temp[i-1][k]["#text"] = _[0](a,[])[0];
							}
						}
					}
				} else {
					temp.push(_);
				}
			});
			array.forEach(temp,function(_){
				var attr;
				if(typeof _ == "object") {
					for(var k in _){
						if(k.charAt(0)=="@") {
							attr = k.replace("@","");
							attrs[attr] = _[k];
						}
						if(typeof _[k] != "object") _[k] = {"#text":_[k]};
					}
				} else {
					_ = {"#text":_};
				}
				if(!attr) ar.push(_);
			});
			elm = domConstruct.create(name,attrs,parent);
			ar.forEach(function(_){
				for(var k in _){
					traverse(k,_[k],elm);
				}
			});
			return elm;
		}
		if(name=="#text") {
			if(typeof obj == "function") obj = obj();
			parent.appendChild(document.createTextNode(obj));
			return;
		}
		for(var k in obj) {
			if(k.charAt(0)=="@") {
				var attr = k.replace("@","");
				attrs[attr] = obj[k];
				delete obj[k];
			}
		}
		elm = domConstruct.create(name,attrs,parent);
		for(var k in obj) {
			if(k!="#text" && typeof obj[k] != "object") obj[k] = {"#text":obj[k]};
			traverse(k,obj[k],elm);
		}
		return elm;
	}
	
	markup.html = function(stack,args,context) {
		var x = traverse("html",args);
		domConstruct.place(x,context.document.documentElement,"replace");
		stack.push(context.document.body);
		return stack;
	}
	
	return markup.html;
	
});
