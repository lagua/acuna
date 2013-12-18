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
			var f = args.shift();
			array.forEach(stack.pop(),function(_){
				f.apply(null,[[_]]);
			});
			return stack.concat(args.splice(0,args.length));
		},
		merge: function(stack,args,context) {
			return [stack,args];
		},
		rmerge: function(stack,args,context) {
			return [args,stack];
		},
		prepend: function(stack,args,context) {
			return array.map(stack[0],function(_){
				return [_].concat(stack[1]);
			});
		},
		append: function(stack,args,context) {
			return array.map(stack[0],function(_){
				return stack[1].concat([_]);
			});
		},
		mapleft: function(stack,args,context){
			return array.map(stack[0],function(_){
				return [_,stack[1]];
			});
		},
		mapright: function(stack,args,context){
			return array.map(stack[0],function(_){
				return [stack[1],_];
			});
		},
		reverse: function(stack,args,context) {
			return stack.reverse();
		},
		apply: function(stack,args,context){
			array.forEach(args,function(arg){
				array.forEach(stack,function(_){
					arg.apply(null,_);
				});
			});
			return stack;
		},
		defer:function(stack,args,context) {
			var replaceArgs = function(args){
				if(typeof args[0]=="function") {
					return function(){
						args[0](stack,args[1],context);
					};
				} else {
					//stack = [args[0]];
					for(var i=0;i<args.length;i++) {
						args[i] = args[i] instanceof Array ? replaceArgs(args[i]) : args[i];
					}
					return args;
				}
			};
			return stack.map(function(_){
				return [_].concat(replaceArgs(args));
			});
		}
	});
	
	return kernel.array;

});