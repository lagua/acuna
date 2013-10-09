define([ "dojo/_base/lang","dojo/json" ], function(lang,JSON) {
	var style = lang.getObject("acuna.style", true);
	
	var insert = function(a,context) {
		var style = context.document.documentElement.appendChild(context.document.createElement("style"));
	    style.sheet.insertRule(a, 0);
	};
	var find = function(a,context) {
		var ss = document.styleSheets;
		for(var i = ss.length - 1; i >= 0; i--) {
			try {
				var s = ss[i], rs = s.cssRules ? s.cssRules : s.rules ? s.rules : [];
				for(var j = rs.length - 1; j >= 0; j--) {
					if((rs[j].type === context.window.CSSRule.WEBKIT_KEYFRAMES_RULE || rs[j].type === context.window.CSSRule.MOZ_KEYFRAMES_RULE) && rs[j].name == a) {
						return rs[j];
					}
				}
			} catch (e) {
			}
		}
		return null;
	};
	style.create = function(stack,args,context){
		var x = stack.pop();
		var r = args.shift();
		var step = r + " ";
		step += JSON.stringify(x,function(key, val){
			if(key) {
				return val + ";";
			}
			return val;
		},2).replace(/\"|,/g,"")+"\n";
		var rule = find(r, context);
		if(!rule) insert(step, context);
		return stack;
	};
	
	return style.create;
	
});