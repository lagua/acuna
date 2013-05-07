define(["dojo/_base/lang"],function(lang) {
	var acuna = lang.getObject("acuna",true);
	var dictionary = function(vocab,args){
		console.log(vocab,args);
		return vocab;
	};
	acuna.dictionary = dictionary;
	return dictionary;
});