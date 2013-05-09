define([
	"dojo/_base/lang",
	"acuna/sequence/filter",
	"acuna/sequence/mixin",
	"acuna/sequence/on"
],
	function(lang, filter,mixin,on){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	seq = lang.mixin(seq,{
		filter:filter,
		mixin:mixin,
		on:on
	});
	return seq;
});