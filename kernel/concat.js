define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	"use strict";
	var concat = lang.getObject("acuna.kernel.concat", true);

	lang.mixin(concat, {
		bridge: function(stack,args,context){
			// the function to bridge
			var f = args.shift();
			var fargs = stack.splice(-f.length);
			fargs = fargs.map(function(_){
				if(typeof _ === "function") {
					var lstack = array.map(stack,function(_) { return _ });
					return function() {
						console.log(arguments);
						lstack = _(lstack,[],context);
					}
				} else {
					return _;
				}
			});
			var a = f.apply(f,fargs);
			return stack;
		},
		args2stack: function(stack,args,context) {
			var l = stack.pop();
			args = args.splice(-l);
			return stack.concat(args);
		},
		quote:function(stack,args,context) {
			console.log(stack,args)
		},
		dup: function(stack,args,context) {
			var x = stack.pop();
			stack = stack.concat([x,x]);
			stack = stack.concat(args);
			return stack;
		},
		dupd:function(stack,args,context) {
			stack = concat.dip(stack,[concat.dup],context);
			return stack;
		},
		dupdd:function(stack,args,context) {
			stack = concat.dip(stack,[concat.dupd],context);
			return stack;
		},
		pop:function(stack,args,context){
			stack.pop();
			return stack;
		},
		swap:function(stack,args,context){
			var x = stack.pop();
			var y = stack.pop();
			stack.push(x);
			stack.push(y);
			stack = stack.concat(args);
			return stack;
		},
		neg:function(stack,args,context){
			stack.push(-stack.pop());
			stack = stack.concat(args);
			return stack;
		},
		dip:function(stack,args,context){
			// quotation
			// if quotation in args use it!
			var f = args.length ? args.shift() : stack.pop();
			var t = stack.pop();
			stack = f(stack,args,context);
			stack.push(t);
			stack = stack.concat(args);
			return stack;
		},
		compose:function(stack,args,context){
			// quotation
			// if quotation in args use it!
			//var lstack = array.map(stack,function(_) { return _ });
			var f = function() {
				args.forEach(function(_){
					stack = _(stack,[],context);
				});
			}
			f();
			return stack;
		},
		"if":function(stack,args,context){
			var b = stack.pop();
			var t = args.shift();
			var f = args.shift();
			stack.push(b ? t : f);
			stack = stack.concat(args);
			return stack;
		},
		"eq":function(stack,args,context){
			stack.push(stack.pop() == stack.pop());
			stack = stack.concat(args);
			return stack;
		}
	});
	var operators = ["+","-","*","/","%"];
	array.forEach(operators,function(o){
		concat[o] = function(stack,args,context) {
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
				concat[k] = function(stack,args,context) {
					stack.push(Math[k](stack.pop()));
					if(args.length) stack = stack.concat(args);
					return stack;
				}
			} else if(len==2){
				concat[k] = function(stack,args,context) {
					var x = Math[k](stack.pop(),stack.pop());
					stack.push(x);
					if(args.length) stack = stack.concat(args);
					return stack;
				}
			}
		} else {
			concat[k] = function(stack,args,context) {
				stack.push(Math[k]);
				if(args.length) stack = stack.concat(args);
				return stack;
			}
		}
	});
	/*
	// combinators
	Brief.Primitive("keep", function (q) { var x = Brief.Peek(); Brief.Run(q); Brief.Push(x); });
	Brief.Primitive("bi", function (x, p, q) { Brief.Push(x); Brief.Run(p); Brief.Push(x); Brief.Run(q); });
	Brief.Primitive("tri", function (x, p, q, r) { Brief.Push(x); Brief.Run(p); Brief.Push(x); Brief.Run(q); Brief.Push(x); Brief.Run(r); });
	Brief.Primitive("2bi", function (y, x, p, q) { Brief.Push(y); Brief.Push(x); Brief.Run(p); Brief.Push(y); Brief.Push(x); Brief.Run(q); });
	Brief.Primitive("bi*", function (y, x, p, q) { Brief.Push(y); Brief.Run(p); Brief.Push(x); Brief.Run(q); });

	*/
	return concat;
});