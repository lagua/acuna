define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	var kernel = lang.getObject("acuna.kernel", true);

	kernel.array = {};
	lang.mixin(kernel.array, {
		count: function(stack,args,context) {
			var l = stack.pop();
			return stack.concat([l,l.length]);
		},
		get_at:function(stack,args,context) {
			var l = stack.pop();
			var p = args.shift();
			return stack.concat([l,l[p]]);
		},
		set_at:function(stack,args,context) {
			var p,x;
			if(args.length) {
				p = args.shift();
				x = args.shift();
			} else {
				x = stack.pop();
				p = stack.pop();
			}
			var l = stack.pop();
			l[p] = x;
			return stack.concat([l]);
		},
		get_at2:function(stack,args,context) {
			var p1, p2;
			if(args.length) {
				p1 = args.shift();
				p2 = args.shift();
			} else {
				p2 = stack.pop();
				p1 = stack.pop();
			}
			var l = stack.pop();
			return stack.concat([l,l[p1][p2]]);
		},
		set_at2:function(stack,args,context) {
			var p1, p2, x;
			if(args.length) {
				p1 = args.shift();
				p2 = args.shift();
				x = args.shift();
			} else {
				x = stack.pop();
				p2 = stack.pop();
				p1 = stack.pop();
			}
			var l = stack.pop();
			l[p1][p2] = x;
			return stack.concat([l]);
		},
		forEach: function(stack,args,context){
			var f = stack.pop();
			var a = stack.pop();
			var lstack = stack.slice();
			array.forEach(a,function(_){
				lstack = f(lstack.concat(_),[],context);
			});
			return stack;
		},
		concat: function(stack,args,context) {
			var x = stack.pop();
			var y = stack.pop();
			stack.push(y.concat(x));
			return stack;
		},
		map: function(stack,args,context){
			var f = stack.pop();
			var a = stack.pop();
			var lstack = stack.slice();
			stack.push(array.map(a,function(_){
				lstack = f(lstack.concat(_),[],context);
				return lstack.pop();
			}));
			return stack;
		},
		reverse: function(stack,args,context) {
			var x = stack.pop();
			x.reverse();
			stack.push(x);
			return stack;
		}
	});
	
	return kernel;

});