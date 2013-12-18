define(["dojo/_base/lang","acuna/kernel"],
	function(lang,k){
	
	lang.mixin(k, {
		dupd:function(stack,args,context) {
			stack = k.dip(stack,[k.dup],context);
			return stack;
		},
		dupdd:function(stack,args,context) {
			stack = k.dip(stack,[k.dupd],context);
			return stack;
		},
		"null":function(stack,args,context) {
			return stack;
		},
		swapd:function(stack,args,context) {
			stack = k.dip(stack,[k.swap],context);
			return stack;
		},
		bury:function(stack,args,context) {
			stack = k.swap(stack,[],context);
			stack = k.swapd(stack,[],context);
			return stack;
		},
		bury4:function(stack,args,context) {
			stack = k.swap(stack,[],context);
			stack = k.dip(stack,[k.bury],context);
			return stack;
		},
		bury5:function(stack,args,context) {
			stack = k.swap(stack,[],context);
			stack = k.dip(stack,[k.bury4],context);
			return stack;
		},
		dig:function(stack,args,context) {
			stack = k.swapd(stack,[],context);
			stack = k.swap(stack,[],context);
			return stack;
		},
		dig4:function(stack,args,context) {
			stack = k.dip(stack,[k.dig],context);
			stack = k.swap(stack,[],context);
			return stack;
		},
		dig5:function(stack,args,context) {
			stack = k.dip(stack,[k.dig4],context);
			stack = k.swap(stack,[],context);
			return stack;
		},
		get2:function(stack,args,context) {
			stack = k.dip(stack,[k.dup],context);
			stack = k.swap(stack,[],context);
			return stack;
		},
		get3:function(stack,args,context) {
			stack = k.dip(stack,[k.get2],context);
			stack = k.swap(stack,[],context);
			return stack;
		},
		get4:function(stack,args,context) {
			stack = k.dip(stack,[k.get3],context);
			stack = k.swap(stack,[],context);
			return stack;
		},
		get5:function(stack,args,context) {
			stack = k.dip(stack,[k.get4],context);
			stack = k.swap(stack,[],context);
			return stack;
		}
	});
	return k;
});