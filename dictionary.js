define(["dojo/_base/lang","dojo/_base/array","dojo/Deferred"],function(lang,array,Deferred) {
	var acuna = lang.getObject("acuna",true);
	var dictionary = function(vocab,args){
		var d = new Deferred();
		require(args,function(){
			for(var i=0;i<arguments.length;i++) {
				var dict = arguments[i];
				for(var k in vocab) {
					if(dict[k]) {
						array.forEach(dict[k],function(_){
							vocab[_] = vocab[k];
						});
					}
				}
			}
			d.resolve(vocab);
		});
		console.log(vocab,args);
		return d;
	};
	acuna.dictionary = dictionary;
	return dictionary;
});