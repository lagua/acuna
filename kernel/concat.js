define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	"use strict";
	var kernel = lang.getObject("acuna.kernel", true);

	kernel.concat = {};
	
	lang.mixin(kernel.concat, {
		dup: function(stack,args,context) {
			var x = stack.pop();
			stack = stack.concat([x,x]);
			if(args.length) stack = stack.concat(args);
			return stack;
		},
		drop:function(stack,args,context){
			return args.length ? args : [];
		},
		swap:function(stack,args,context){
			var x = [stack.pop(),stack.pop()].reverse();
			stack = stack.concat(x);
			if(args.length) stack = stack.concat(args);
			return stack;
		},
		neg:function(stack,args,context){
			stack.push(-stack.pop());
			if(args.length) stack = stack.concat(args);
			return stack;
		},
		dip:function(stack,args,context){
			// quotation
		}
	});
	var operators = ["+","-","*","/","%"];
	array.forEach(operators,function(o){
		kernel.concat[o] = function(stack,args,context) {
			var x = eval("stack.pop()"+o+"stack.pop()");
			stack.push(x);
			if(args.length) stack = stack.concat(args);
			return stack;
		}
	});
	var math = Object.getOwnPropertyNames(Math);
	array.forEach(math,function(k){
		if(typeof Math[k] == "function") {
			var len = Math[k].length;
			if(len==1){
				kernel.concat[k] = function(stack,args,context) {
					stack.push(Math[k](stack.pop()));
					if(args.length) stack = stack.concat(args);
					return stack;
				}
			} else if(len==2){
				kernel.concat[k] = function(stack,args,context) {
					var x = Math[k](stack.pop(),stack.pop());
					stack.push(x);
					if(args.length) stack = stack.concat(args);
					return stack;
				}
			}
		} else {
			kernel.concat[k] = function(stack,args,context) {
				stack.push(Math[k]);
				if(args.length) stack = stack.concat(args);
				return stack;
			}
		}
	});
	/*
	Brief.Primitive("drop", function (x) { });
	Brief.Primitive("dup", function (x) { var ret = [x, x]; ret.kind = "tuple"; return ret; });
	Brief.Primitive("swap", function (y, x) { var ret = [x, y]; ret.kind = "tuple"; return ret; });

	// combinators
	Brief.Primitive("dip", function (x, q) { Brief.Run(q); Brief.Push(x); });
	Brief.Primitive("keep", function (q) { var x = Brief.Peek(); Brief.Run(q); Brief.Push(x); });
	Brief.Primitive("bi", function (x, p, q) { Brief.Push(x); Brief.Run(p); Brief.Push(x); Brief.Run(q); });
	Brief.Primitive("tri", function (x, p, q, r) { Brief.Push(x); Brief.Run(p); Brief.Push(x); Brief.Run(q); Brief.Push(x); Brief.Run(r); });
	Brief.Primitive("2bi", function (y, x, p, q) { Brief.Push(y); Brief.Push(x); Brief.Run(p); Brief.Push(y); Brief.Push(x); Brief.Run(q); });
	Brief.Primitive("bi*", function (y, x, p, q) { Brief.Push(y); Brief.Run(p); Brief.Push(x); Brief.Run(q); });

	// arithmetic
	Brief.Primitive("+", function (y, x) { return y + x; });
	Brief.Primitive("-", function (y, x) { return y - x; });
	Brief.Primitive("*", function (y, x) { return y * x; });
	Brief.Primitive("/", function (y, x) { return y / x; });
	Brief.Primitive("mod", function (y, x) { Brief.Push(y % x); });
	Brief.Primitive("neg", function (x) { return -x; });
	Brief.Primitive("abs", function (x) { return Math.abs(x); });
	*/
	return kernel.concat;
});