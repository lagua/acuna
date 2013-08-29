define([
"acuna/kernel/concat",
"acuna/kernel/concat/extended",
"dojo/dom-style"
],function(concat,extended,domStyle){

return function(stack,args,context){
	stack = stack.concat(args.splice(0,2));
	stack = extended['dupdd'](stack,[],context);
	stack = concat['bridge'](stack,[domStyle.set],context);
	stack = concat['pop'](stack,[],context);
	stack = stack.concat(args);
	return stack;
};

});