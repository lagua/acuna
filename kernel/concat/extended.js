define(["dojo/_base/lang","acuna/kernel/concat"],
	function(lang,concat){
	
	"use strict";
	var extended = lang.getObject("acuna.kernel.concat.extended", true);

	lang.mixin(extended, {
		dupd:function(stack,args,context) {
			stack = concat.dip(stack,[concat.dup],context);
			stack = stack.concat(args);
			return stack;
		},
		dupdd:function(stack,args,context) {
			stack = concat.dip(stack,[extended.dupd],context);
			stack = stack.concat(args);
			return stack;
		},
		swapd:function(stack,args,context) {
			stack = concat.dip(stack,[concat.swap],context);
			stack = stack.concat(args);
			return stack;
		},
		bury:function(stack,args,context) {
			stack = concat.swap(stack,[],context);
			stack = extended.swapd(stack,[],context);
			stack = stack.concat(args);
			return stack;
		}
	});
	return extended;
});