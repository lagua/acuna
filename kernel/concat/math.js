define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	"use strict";
	var cmath = lang.getObject("acuna.kernel.concat.math", true);

	lang.mixin(cmath, {
		neg:function(stack,args,context){
			stack.push(-stack.pop());
			stack = stack.concat(args);
			return stack;
		}
	});
	var operators = ["+","-","*","/","%"];
	array.forEach(operators,function(o){
		cmath[o] = function(stack,args,context) {
			var x = stack.pop();
			var y = stack.pop();
			stack.push(eval("y"+o+"x"));
			stack = stack.concat(args);
			return stack;
		}
	});
	var math = Object.getOwnPropertyNames(Math);
	array.forEach(math,function(k){
		if(typeof Math[k] == "function") {
			var len = Math[k].length;
			if(len==1){
				cmath[k] = function(stack,args,context) {
					stack.push(Math[k](stack.pop()));
					if(args.length) stack = stack.concat(args);
					return stack;
				}
			} else if(len==2){
				cmath[k] = function(stack,args,context) {
					var x = Math[k](stack.pop(),stack.pop());
					stack.push(x);
					if(args.length) stack = stack.concat(args);
					return stack;
				}
			}
		} else {
			cmath[k] = function(stack,args,context) {
				stack.push(Math[k]);
				if(args.length) stack = stack.concat(args);
				return stack;
			}
		}
	});
	return cmath;
});