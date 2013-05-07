define([
	"dojo/_base/lang",
	"acuna/sequence/each",
	"acuna/sequence/filter",
	"acuna/sequence/mixin",
	"acuna/sequence/on"
],
	function(lang, each, filter,mixin,on){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	seq = lang.mixin(seq,{
		each:each,
		filter:filter,
		mixin:mixin,
		on:on
	});
	return seq;
});