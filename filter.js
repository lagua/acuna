define([
	"dojo/_base/lang",
	"acuna/filter/and",
	"acuna/filter/eq"
],
	function(lang, and, eq){
	
	"use strict";

	var filter = lang.getObject("acuna.filter", true);
	
	filter = lang.mixin(filter,{
		and:and,
		eq:eq
	});
	return filter;
});