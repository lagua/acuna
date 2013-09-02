define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	"use strict";
	var concat = lang.getObject("acuna.kernel.concat", true);

	lang.mixin(concat, {
		bridge: function(stack,args,context){
			// the function to bridge
			var f = args.shift();
			var l = f.length;
			if(typeof f !== "function") {
				l = parseInt(f,10);
				f = args.shift();
			}
			var fargs = stack.splice(-l);
			fargs = fargs.map(function(_){
				if(typeof _ === "function") {
					var lstack = array.map(stack,function(_) { return _ });
					return function() {
						lstack = _(lstack,Array.prototype.slice.call(arguments),context);
					}
				} else {
					return _;
				}
			});
			var a = f.apply(window,fargs);
			if(a) stack = stack.concat(a);
			return stack;
		},
		object:function(stack,args,context){
			stack.push(args.shift() || {});
			stack = stack.concat(args);
			return stack;
		},
		dup: function(stack,args,context) {
			var x = stack.pop();
			stack = stack.concat([x,x]);
			stack = stack.concat(args);
			return stack;
		},
		pop:function(stack,args,context){
			stack.pop();
			stack = stack.concat(args);
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
	return concat;
});