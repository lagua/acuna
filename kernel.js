define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	var kernel = lang.getObject("acuna.kernel", true);
	var leave = false;

	lang.mixin(kernel, {
		bridge: function(stack,args,context){
			// the function to bridge
			var f = stack.pop();
			var l = args.shift();
			var useargs = args.shift();
			var fargs = stack.splice(-l);
			var lstack = stack.slice();
			fargs = fargs.map(function(_){
				if(typeof _ === "function") {
					var f = function(_){
						return function() {
							if(useargs) lstack = lstack.concat(Array.prototype.slice.call(arguments));
							lstack = _(lstack,args,context);
						}
					};
					_ = f(_);
				}
				return _;
			});
			var a = f.apply(window,fargs);
			if(a) stack = stack.concat(a);
			return stack;
		},
		apply:function(stack,args,context) {
			var f = stack.pop();
			stack = f(stack,[],context);
			return stack;
		},
		object:function(stack,args,context){
			stack.push(args.shift() || {});
			return stack;
		},
		dup: function(stack,args,context) {
			var x = stack.pop();
			stack = stack.concat([x,x]);
			return stack;
		},
		over: function(stack,args,context) {
			var t = stack.pop();
			var x = stack.pop();
			stack = stack.concat([x,t,x]);
			return stack;
		},
		pop:function(stack,args,context){
			stack.pop();
			return stack;
		},
		nip: function(stack,args,context) {
			var t = stack.pop();
			stack.pop();
			stack.push(t);
			return stack;
		},
		swap:function(stack,args,context){
			var x = stack.pop();
			var y = stack.pop();
			stack.push(x);
			stack.push(y);
			return stack;
		},
		dip:function(stack,args,context){
			// quotation
			// if quotation in args use it!
			var f = args.length ? args.shift() : stack.pop();
			var t = stack.pop();
			stack = f(stack,args,context);
			stack.push(t);
			return stack;
		},
		quot:function(stack,args,context) {
			var f = args.length ? args.shift() : stack.pop();
			stack.push(f);
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
		leave:function(stack,args,context){
			leave = true;
			return stack;
		},
		"for":function(stack,args,context) {
			var b = stack.pop();
			var z = stack.pop();
			for(var i=0;i<z;i++) {
				stack.push(i);
				stack = b(stack,args,context);
				if(leave) {
					leave = false;
					break;
				}
			}
			return stack;
		},
		"throw":function(stack,args,context){
			alert("error: "+stack.pop());
			return stack;
		},
		"if":function(stack,args,context){
			var c = [];
			c[1] = stack.pop();
			c[0] = stack.pop();
			var b = stack.pop();
			return c[+b](stack,args,context);
		},
		"eq":function(stack,args,context){
			var x = stack.pop(), y = stack.pop();
			stack.push(x === y);
			return stack;
		},
		"ne":function(stack,args,context){
			var x = stack.pop(), y = stack.pop();
			stack.push(x !== y);
			return stack;
		},
		"gt":function(stack,args,context){
			var x = stack.pop(), y = stack.pop();
			stack.push(x > y);
			return stack;
		},
		"and":function(stack,args,context){
			var x = stack.pop(), y = stack.pop();
			stack.push(x && y);
			return stack;
		},
		"or":function(stack,args,context){
			var x = stack.pop(), y = stack.pop();
			stack.push(x || y);
			return stack;
		}
	});
	return kernel;
});