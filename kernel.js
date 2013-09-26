define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	var concat = lang.getObject("acuna.kernel.concat", true);

	lang.mixin(concat, {
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
							var args = useargs ? Array.prototype.slice.call(arguments) : [];
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
		pop:function(stack,args,context){
			stack.pop();
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
			return stack;
		},
		"eq":function(stack,args,context){
			stack.push(stack.pop() == stack.pop());
			return stack;
		}
	});
	return concat;
});