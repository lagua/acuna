define([ "dojo/_base/lang","dojo/json" ], function(lang,JSON) {
	var markup = lang.getObject("acuna.markup", true);

	var insert = function(a,context) {
		var style = context.document.documentElement.appendChild(context.document.createElement("style"));
		if(context.window.CSSRule.KEYFRAMES_RULE) { // W3C
		    style.sheet.insertRule("@keyframes " + a, 0);
		} else if (context.window.CSSRule.WEBKIT_KEYFRAMES_RULE) { // WebKit
		    style.sheet.insertRule("@-webkit-keyframes " + a, 0);
		}
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

	markup["@keyframes"] = function(stack, args, context) {
		var x = stack.pop();
		var r = args.shift();
		var step = "{ \n";
		for(var k in x) {
			step += k+" ";
			step += JSON.stringify(x[k],function(key, val){
				if(key) {
					return val + ";";
				}
				return val;
			},2).replace(/\"|,/g,"")+"\n";
		}
		step += "}";
		var rule = find(r, context);
		if(!rule) insert(r + " " + step, context);
		return stack;
	};

	return markup["@keyframes"];
});