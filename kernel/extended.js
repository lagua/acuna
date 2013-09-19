define(["dojo/_base/lang","acuna/kernel"],
	function(lang,k){
	
	lang.mixin(k, {
		dupd:function(stack,args,context) {
			stack = k.dip(stack,[k.dup],context);
			stack = stack.concat(args);
			return stack;
		},
		dupdd:function(stack,args,context) {
			stack = k.dip(stack,[k.dupd],context);
			stack = stack.concat(args);
			return stack;
		},
		swapd:function(stack,args,context) {
			stack = k.dip(stack,[k.swap],context);
			stack = stack.concat(args);
			return stack;
		},
		bury:function(stack,args,context) {
			stack = k.swap(stack,[],context);
			stack = k.swapd(stack,[],context);
			stack = stack.concat(args);
			return stack;
		}
	});
	return k;
});