define([
"dojo/_base/lang",
"dojo/_base/array",
"dojo/request",
"dojo/Deferred",
"dojo/json"
],function(lang,array,request,Deferred,JSON) {
	lang.getObject("acuna.kernel",true);
	
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	var isBool = function(n){
		return n==="true" || n==="false";
	};
	
	var isNumericOrBool = function(n) {
		return isBool(n) || isNumeric(n);
	};
	
	var isNumeric = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	
	var normalizeModule = function(m) {
		var w = m.split("/").pop();
		return array.map(w.split("-"),function(_,i){
			return i===0 ? _ : _.charAt(0).toUpperCase() + _.substr(1);
		}).join("");
	};
	
	var Word = function(word,def,block,line,index,depth,args){
		this.word = word;
		this.def = def;
		this.block = block;
		this.line = line;
		this.index = index;
		this.depth = depth;
		this.args = args;
	};
	
	var stripSingles = function(w,context) {
		if(w instanceof Word && w.args) {
			var dataword = false;
			for(var i=0;i<w.args.length;i++) {
				if(w.args[i] instanceof Array && w.args[i].length==1){
					var rest = w.args.slice(i+1);
					for(var j=0;j<rest.length;j++) {
						if(typeof rest[j]=="object" && rest[j] instanceof Word && context.data[rest[j].word]) {
							dataword = true;
							break;
						}
					}
					w.args[i] = w.args[i][0];
				} else if(w.args[i] instanceof Word) {
					stripSingles(w.args[i],context);
				}
			}
			if(dataword) w.args = [w.args];
		}
	};
	
	var inUse = function(def,word){
		for(var i=0;i<def.USE.length;i++){
			if(def.USE[i].args[1]==word) return true;
		}
	};
	
	var parser = {
		parse:function(context,string,path,preserveData){
			string = string.replace(/\r\n/g,"\n");
			string = string.replace(/ {4,}/g,"\t");
			var file = path.substring(path.lastIndexOf("/")+1);
			var ar = file.split(/\./g);
			var ext = ar.pop();
			var defWord = ar.join(".");
			var defblocks = string.split(/(?:\n){3,}?/g);
			var useWord;
			context.string = string;
			defblocks.reverse();
			defblocks.forEach(function(defblock,defno){
				var word, def;
				// search each block in una string
				defblock.split(/(?:\n){2,}?/g).forEach(function(block,blockno,blocks){
					var words = [];
					var parent;
					var first = block.match(/^\S+/);
					// DEFINE should only happen once per block
					// in other words: each block MUST start with DEFINE
					if(first instanceof Array && first.length) first = first[0]; 
					var target = first ? (first.toUpperCase()=="DEFINE" || first.toUpperCase()=="USE" ? first.toUpperCase() : (first.indexOf("\"")==-1 && !isNumericOrBool(first) ? "words" : "DEFINE")) : "DEFINE";
					// word block
					var curdepth;
					var endword;
					if(target=="DEFINE" && blockno==0) {
						var ar = block.split(/\n/);
						var l = ar.shift();
						var parts = l.match(/[^"\s]+|"(.*?)"/g);
						block = ar.join("\n");
						if(parts[1]) {
							useWord = parts[1].replace(/"/g,"");
						} else {
							useWord = defWord || "exec";
							if(!context.exec) context.exec = useWord;
						}
						// if useWord exists the string is loaded from an external file
						if(useWord) {
							context.blocks[useWord] = defblock;
							word = new Word(useWord,defno,0,0,0,0,[]);
							word.path = path;
							word.exec = !parts[1];
							word.file = file;
							word.ext = ext;
							word.words = [];
							word.comments = [];
							word.USE = [];
							word.resolvedWords = {};
							context.DEFINE[useWord] = def = parent = word;
						}
					}
					if(blockno>word.block) word = def;
					// search each line
					block.split(/\n/).forEach(function(line,lineno,lines){
						// capture nesting
						var tmatch = line.match(/^\t+/g);
						var tabs = tmatch && tmatch.length>0 ? tmatch[0] : null;
						// count tabs
						var depth = tabs ? tabs.match(/\t/g).length : 0;
						line = line.replace(tabs,"");
						// split line on spaces, preserving anything between quotes
						var parts = line.match(/[^"\s]+|"(.*?)"/g);
						if(!parts) return;
						var f = parts[0];
						/*
						var data = array.filter(parts,function(p){
							return p.indexOf("\"")>-1 || isNumeric(p);
						});
						*/
						// search entire tree until parent is found
						var findParent = function(parent){
							var i;
							if(parent.depth>depth || !parent.args || !parent.args.length) return;
							for(i=0;i<parent.args.length;i++) {
								if(parent.args[i].depth==depth) return parent;
							}
							for(i=0;i<parent.args.length;i++) {
								return findParent(parent.args[i]);
							}
						};
						// search in current parent and move up tree
						var findParent2 = function(parent){
							var i;
							if(parent.depth==depth-1) return parent;
							return findParent2(parent.parent);
						};
						// search line parts
						var last = parts.pop();
						parts.push(last);
						array.forEach(parts,function(p,index){
							// check if it is a number or string
							if(p.indexOf("\"")==-1 && !isNumericOrBool(p)) {
								if(p.toUpperCase()!="USE" && context.resolvedWords[p]) {
									word = context.resolvedWords[p];
								} else {
									word = new Word(p,defno,blockno,lineno,index,depth,[]);
								}
								var leftword = parts[index-1] ? parts[index-1] : null;
								leftword = leftword && lineno<lines.length-1 && leftword.indexOf("\"")==-1 && !isNumericOrBool(leftword);
								if(!leftword && parent && depth>curdepth) {
									//parent = endword;
									parent.args.push(word);
								} else if(parent && depth>0 && !inUse(def,p)) {
									if(parent.depth>depth) {
										// find ancestor with correct depth
										parent = findParent(words[words.length-1]);
										parent.args.push(word);
									} else if(parent.depth==depth) {
										parent = findParent2(parent);
										parent.args.push(word);
									} else {
										parent.args.push(word);
									}
								} else {
									parent = word;
									words.push(word);
								}
								if(p.toUpperCase()!="USE" && parent!=word) word.parent = parent;
								//if(index==0 && endword) endword = false;
								if(index==parts.length-1) {
									parent = word;
								}
							} else {
								// consider new lines
								// and first word && depth=0
								var val = preserveData && target == "words" ? p : (isBool(p) ?  eval(p) : isNumeric(p) ? parseFloat(p) : p.replace(/"/g,""));
								// this is a DEFINE comment
								if(target.toUpperCase() == "DEFINE" && blockno==0) {
									if(val.charAt(0)=="#") {
										var t = val.substr(1).split("=");
										word[t[0]] = t.length > 1 ? (isNumeric(t[1]) ? parseFloat(t[1]) : t[1]) : true;
									}
									word.comments.push(val);
								} else {
									var atDepth = function(ar,d,val) {
										for(var i=0;i<d;i++) {
											var len = ar.length;
											if(!len) {
												ar.push([]);
												len = 1;
											}
											ar = len>1 ? ar[len-1] : ar;
										}
										ar.push(val);
									}
									if(!endword && target.toUpperCase() != "DEFINE") {
										if(word.parent && lineno>word.line && word.depth==depth) {
											word.parent.args.push(val);
										} else {
											word.args.push(val);
										}
									} else {
										var wlen = word.args.length;
										if(depth<2 || !wlen) {
											if(depth<curdepth) {
												// we started adding data so continue
												// should be same as depth<curdepth
												atDepth(word.args[wlen-1],depth-1,val);
											} else {
												if(index>0 && (!word.args.length || !(word.args[0] instanceof Array))) {
													word.args.push(val);1
												} else {
													if(index==0 || !word.args.length) word.args.push([]);
													wlen = word.args.length;
													word.args[wlen-1].push(val);
												}
												// FIXME: dirty hack to set parent when it gets lost because first val is text
												parent = word;
											}
										} else {
											if(index==0) word.args[wlen-1].push([]);
											atDepth(word.args[wlen-1],depth-1,val);
										}
									}
								}
							}
						});
						curdepth = depth;
					});
					if(words.length && blockno>0) {
						if(target.toUpperCase()=="USE") {
							def.USE = def.USE.concat(words);
						} else {
							def.words.push(words);
						}
					}
				});
			});
			return context;
		},
		define:function(context){
			for(var k in context.DEFINE) {
				var def = context.DEFINE[k];
				if(!def.USE.length) {
					if(def.words.length && !def.args.length) {
						// treat like args and parse
						context.data[k] = parser.parseData(new Word(k,0,0,0,0,0,def.words[0]))[k];
					} else {
						context.data[k] = def.args;
					}
					if(context.data[k].length == 1) context.data[k] = context.data[k][0];
				}
			}
			return context;
		},
		getModules:function(def){
			var use = [], modules = {};
			array.forEach(def.USE,function(u) {
				use = use.concat(u);
			});
			var lastuse;
			var getModuleByWord = function(word) {
				for(var k in modules) {
					if(modules[k].word==word) return k;
				}
			};
			var i = 0;
			array.forEach(use,function(u) {
				var m;
				if(u.word.toUpperCase()!="USE") {
					m = getModuleByWord(u.word);
					if(modules[m]){
						modules[m].targets[lastuse.args[0]] = {
							args:u.args
						};
					}
				} else {
					m = u.args[0];
					var ext = m.split("\.").pop();
					if(ext=="una") m = "dojo/text!" + m;
					modules[m] = {
						word:u.args[1],
						module:m,
						ext:ext,
						index:i,
						targets:{},
						context:[]
					};
					i++;
					lastuse = u;
				}
			});
			return modules;
		},
		use:function(context,callback){
			var def = context.DEFINE[context.exec];
			var modules = parser.getModules(def);
			var reqs = [];
			for(var m in modules) {
				if(Object.size(modules[m].targets)>0) reqs.push(m);
			}
			// pre-require reqs
			require(reqs,function(){
				var m;
				// replace targets
				for(var i=0;i<arguments.length;i++) {
					var r = modules[reqs[i]];
					for(m in r.targets) {
						modules[m].context.push({
							f:arguments[i],
							args:r.targets[m].args
						});
					}
				}
				reqs = [];
				var toResolve = [];
				for(m in modules) {
					toResolve.push({
						module:m
					});
					reqs.push(m);
				}
				require(reqs,function(){
					var items = [];
					for(var i=0;i<arguments.length;i++) {
						m = modules[toResolve[i].module];
						var a = arguments[i];
						if(m.ext=="una") {
							context = parser.parse(context,a,m.module,false);
							parser.define(context);
							modules[toResolve[i].module] = context.DEFINE[m.word];
						} else if(typeof a != "function" && !m.word) {
							if(m.context.length) {
								items = items.concat(array.map(m.context,function(item){
									if(item.f) {
										item.module = a;
										item.index = i;
										return item;
									}
								}));
							} else {
								lang.mixin(context.resolvedWords,a);
							}
						} else {
							if(typeof a == "function" || (typeof a == "object" && a instanceof Object)) {
								context.resolvedWords[m.word] = a;
							} else {
								def.data[m.word] = a;
							}
							modules[toResolve[i].module] = a;
						}
					}
					def.modules = modules;
					if(items.length) {
						all(array.map(items,function(item){
							return item.f(item.module,item.args);
						})).then(function(res){
							array.forEach(res,function(a,i){
								var m = toResolve[items[i].index].module;
								lang.mixin(context.resolvedWords,a);
								def.modules[m] = items[i].module;
							});
							if(callback) callback(context);
						});
					} else {
						if(callback) callback(context);
					}
				});
			});
		},
		parseData:function(w,root) {
			if(typeof w == "object" && w instanceof Word) {
				var obj = {};
				var mixed = false;
				obj[w.word] = {};
				var keys = [];
				// TODO use array for mixed content, object for anything else
				for(var i=0;i<w.args.length;i++) {
					var a = w.args[i];
					
					var key = a.word;
					mixed = mixed || keys.indexOf(key)>-1;
					
					var res = parser.parseData(a);
					
					mixed = mixed || (typeof res != "object" && w.args.length > 1);
					
					keys.push(key);
					
					if(mixed) {
						if(!(obj[w.word] instanceof Array)) {
							if(typeof obj[w.word] != "object") {
								obj[w.word] = [obj[w.word]];
							} else {
								var o = lang.clone(obj[w.word]);
								obj[w.word] = [];
								for(var k in o) {
									var newo = {};
									newo[k] = o[k];
									obj[w.word].push(newo);
								}
							}
						}
						obj[w.word].push(res);
					} else {
						obj[w.word] = res instanceof Object ? lang.mixin(obj[w.word],res) : res;
					}
				}
				return root ? [obj] : obj;
			} else {
				return w;
			}
		},
		parseArgs:function(w,def,context) {
			var args = [];
			var checkWord = function(a) {
				if(typeof a == "object" && a instanceof Word) {
					if(context.resolvedWords[a.word]) {
						var f = context.resolvedWords[a.word];
						if(!a.args.length) return f;
						var fargs = parser.parseArgs(a,def,context);
						return function(stack,args,context) {
							return f(stack,lang.clone(fargs),context);
						}
					} else if(context.data[a.word]) {
						return parser.parseData(context.data[a.word], true);
					} else {
						// it's just an object
						return parser.parseData(a);
					}
				} else {
					if(typeof a == "object" && a instanceof Array) {
						for(var i=0;i<a.length;i++) {
							a[i] = checkWord(a[i]);
						}
					}
					return a;
				}
			};
			for(var i=0;i<w.args.length;i++) {
				args.push(checkWord(w.args[i]));
			}
			return args;
		},
		parseArgsToString:function(w,context,useContextData) {
			var args = [];
			var checkWord = function(a){
				if(typeof a == "object" && a instanceof Word) {
					if(context.data[a.word]) {
						var len = args.length;
						if(useContextData) {
							return "context.data."+a.word;
						} else {
							var data = parser.parseData(context.data[a.word], true);
							if(len && args[len-1] instanceof Array) {
								args[len-1].push(JSON.stringify(data));
							} else {
								args.push(JSON.stringify(data));
							}
						}
					} else {
						if(a.args.length) {
							return a.word+"("+parser.parseArgsToString(a,context,useContextData)+")";
						} else {
							return a.word;
						}
					}
				} else {
					if(typeof a == "object" && a instanceof Array) {
						for(var i=0;i<a.length;i++) {
							a[i] = checkWord(a[i]);
						}
					}
					return a;
				}
			}
			for(var i=0;i<w.args.length;i++) {
				args.push(checkWord(w.args[i]));
			}
			return args;
		},
		parseArgsToCSS:function(w,data) {
			var args = [];
			for(var i=0;i<w.args.length;i++) {
				var a = w.args[i];
				if(typeof a == "object" && a instanceof Word) {
					if(data[a.word]) {
						var len = args.length;
						if(len && args[len-1] instanceof Array) {
							args[len-1].push(data[a.word]);
						} else {
							args.push("context.data."+a.word);
						}
					} else {
						args.push([a.word,parser.parseArgsToString(a,data)]);
					}
				} else {
					args.push(a);
				}
			}
			return args;
		},
		parseWord:function(w,context){
			var obj = {};
			var mixed = false;
			obj[w.word] = {};
			var keys = [];
			// TODO use array for mixed content, object for anything else
			for(var i=0;i<w.args.length;i++) {
				var a = w.args[i];
				
				var key = a.word;
				mixed = mixed || keys.indexOf(key)>-1;
				
				var res = typeof a == "object" && a instanceof Word ? parser.parseWord(a,context) : a;
				if(typeof a == "object" && a instanceof Word) {
					var ar = a.word.split(".");
					var rw = ar.length>1 ? context.resolvedWords[ar[0]][ar[1]] : context.resolvedWords[a.word];
					if(rw) {
						var f = rw;
						if(!a.args.length) {
							res = f;
						} else {
							var wo = parser.parseWord(a,context);
							var fargs = wo && wo[a.word] ? wo[a.word] : [];
							fargs = typeof fargs == "object" && fargs instanceof Object && !Object.size(fargs) ? [] : fargs;
							fargs = fargs instanceof Array ? fargs : [fargs];
							res = function(stack,args,context) {
								return f(stack,lang.clone(fargs),context);
							}
						}
					}
				}
				mixed = mixed || (typeof res != "object" && w.args.length > 1);
				
				keys.push(key);
				
				if(mixed) {
					if(!(obj[w.word] instanceof Array)) {
						if(typeof obj[w.word] != "object") {
							obj[w.word] = [obj[w.word]];
						} else {
							var o = lang.clone(obj[w.word]);
							obj[w.word] = [];
							for(var k in o) {
								var newo = {};
								newo[k] = o[k];
								obj[w.word].push(newo);
							}
						}
					}
					obj[w.word].push(res);
				} else {
					obj[w.word] = (typeof res == "object" && res instanceof Object) ? lang.mixin(obj[w.word],res) : res;
				}
			}
			return obj;
		},
		words:function(context) {
			var f = function(word){
				var def = context.DEFINE[word];
				return function(stack,args,context){
					// TODO when to clear the stack?
					stack = def.args.length ? stack.concat(def.args[0]) : stack;
					// args2stack should be a hint, because args are not passed around!
					if(def.args2stack) {
						stack = stack.concat(args.splice(0,def.args2stack));
					}
					var breakonwords = [];
					array.forEach(def.words,function(block) {
						array.forEach(block,function(w) {
							if(context.resolvedWords[w.word]) {
								stripSingles(w,context);
								//args = parser.parseArgs(w,def,context);
								var wo = parser.parseWord(w,context);
								var args = wo && wo[w.word] ? wo[w.word] : [];
								args = typeof args == "object" && args instanceof Object && !Object.size(args) ? [] : args;
								args = args instanceof Array ? args : [args];
								
								if(context.breakonwords) {
									var f = function(word,args){
										return function(stack,context) {
											stack = context.resolvedWords[word](stack,args,context,word);
											return stack;
										}
									};
									breakonwords.push({w:w,f:f(w.word,args)});
								} else {
									var f = function(word){
										return function(stack,args,context) {
											stack = context.resolvedWords[word](stack,args,context,word);
											return stack;
										}
									};
									stack = f(w.word)(stack,args,context);
								}
							}
						});
					});
					if(context.breakonwords) context.breakonwords = breakonwords.concat(context.breakonwords);
					return stack.concat(args);
				}
			};
			for(var k in context.DEFINE) {
				if(context.DEFINE[k].words.length) context.resolvedWords[k] = f(k);
			}
			return context;
		},
		toCSS:function(context){
			var str = "";
			var context = parser.define(context);
			var data = {};
			for(var k in context.data) {
				data[k] = parser.parseData(context.data[k],true);
			}
			array.forEach(context.words,function(block,index) {
				array.forEach(block,function(w) {
					var args = parser.parseArgsToCSS(w,data);
					switch(w.word) {
						case "query":
						args = args.join(",");
						args = args.replace(/"/g,"");
						str += args + " {\n";
						break;
						
						case "style":
						for(var i=0;i<args.length;i++) {
							var s =args[i][0]+":"+args[i][1]+";\n";
							str += s.replace(/"/g,"");
						}
						break;
					}
				});
			});
			return str;
		},
		toJS:function(context,callback,options){
			options = options || {};
			var def = context.DEFINE[context.exec];
			var modules = parser.getModules(def);
			var reqs = [];
			var words = [];
			var vocabs = {};
			var requireVocabs = function(list,callback){
				var result = {};
				if(!list.length && callback) callback();
				require(list,function(){
					for(var i=0;i<list.length;i++) {
						result[list[i]] = [];
						for(var k in arguments[i]) {
							result[list[i]].push(k);
						}
					}
					if(callback) callback(result);
				});
			};
			var vocabs = [];
			var data = {};
			if(options.useContextData) {
				for(var k in context.data) {
					data[k] = parser.parseData(context.data[k],true);
				}
			}
			for(m in modules) {
				if(!modules[m].word) {
					vocabs.push(m);
				}
				reqs.push('"'+m+'"');
			}
			var getResolved = function(t){
				for(var m in modules) {
					if(modules[m].targets[t]) return modules[m];
				}
			}
			requireVocabs(vocabs,function(vocabs){
				var str = options.module ? "define" : "require";
				str += "([\n\t"+reqs.join(",\n\t")+"\n],function(";
				var resolvedWords = {};
				var mods = [];
				for(m in modules) {
					var i = modules[m].index;
					var w = modules[m].word;
					if(w) {
						mods.push(w);
					} else {
						var nm = normalizeModule(m);
						mods.push(nm);
						/*var r = getResolved(m);
						var ri = r ? r.index : 0;
						var rargs = r ? r.targets[m].args : null;*/
						array.forEach(vocabs[m],function(w){
							/*var s = "'"+w+"':"
							if(r) s += "arguments["+ri+"]("
							s += "arguments["+i+"]";
							if(r) s += rargs ? ","+JSON.stringify(rargs)+")" : ")";
							s += "['"+w+"']";*/
							resolvedWords[w] = nm;
						});
					}
				}
				str += mods.join(",");
				str += "){\n\n";
				var t = "\t\t";
				for(var k in context.DEFINE) {
					def = context.DEFINE[k];
					if(k == context.exec || !def.words.length) continue;
					str += "\tvar "+k+" = function(stack,args,context){\n";
					if(def.args.length) str += t+"stack = stack.concat("+JSON.stringify(def.args[0])+");\n";
					if(def.args2stack) str += t+"stack = stack.concat(args.splice(0,"+def.args2stack+"));\n";
					array.forEach(def.words,function(block,index) {
						array.forEach(block,function(w) {
							stripSingles(w,context);
							var args = parser.parseArgsToString(w,context,options.useContextData);
							args = JSON.stringify(args);
							args = args.replace(/\\"/g,"@@");
							args = args.replace(/"/g,"").replace(/@@/g,'"');
							var f = resolvedWords[w.word] ? resolvedWords[w.word]+"['"+w.word+"']" : w.word;
							str += t+"stack = "+f+"(stack,"+args+",context);\n";
						});
					});
					str += t+"return stack.concat(args);\n";
					str += "\t};\n\n";
				}
				t = options.module ? "\t\t" : "\t";
				if(options.module) {
					str += "\treturn function(stack,args,context){\n";
				}
				if(def.args.length) str += t+"stack = stack.concat("+JSON.stringify(def.args[0])+");\n";
				if(def.args2stack) str += t+"stack = stack.concat(args.splice(0,"+def.args2stack+"));\n";
				array.forEach(def.words,function(block,index) {
					array.forEach(block,function(w) {
						stripSingles(w,context);
						var args = parser.parseArgsToString(w,context,options.useContextData);
						args = JSON.stringify(args);
						args = args.replace(/\\"/g,"@@");
						args = args.replace(/"/g,"").replace(/@@/g,'"');
						var f = resolvedWords[w.word] ? resolvedWords[w.word]+"['"+w.word+"']" : w.word;
						str += t+"stack = "+f+"(stack,"+args+",context);\n";
					});
				});
				str += t+"return stack.concat(args);\n";
				if(options.module) {
					str += "\t};\n";
				}
				
				str += "\n});";
				if(callback) callback(str);
			});
		},
		load:function(file,callback,preserveData){
			var context = {
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				stack:[]
			};
			request.get(file).then(function(result){
				context = parser.parse(context,result,file,preserveData);
				if(callback) callback(context);
			});
		},
		nextword:function(context,callback){
			var w = context.breakonwords.shift();
			console.log(w.w.word)
			parser.onWord(w.w);
			var stack = context.stack;
			stack = w.f(stack,context);
			context.stack = stack;
			if(callback) {
				callback(context);
			}
		},
		onWord:function(w){
		},
		execute:function(file,callback,direct,args,seed){
			seed = seed || {};
			var context = lang.mixin({
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				stack:[]
			},seed);
			var d = new Deferred();
			if(direct) {
				d.resolve(direct);
			} else {
				d = request.get(file);
			}
			d.then(function(result){
				context = parser.parse(context,result,file);
				context = parser.define(context);
				context = parser.use(context,function(context){
					context = parser.words(context);
					if(context.breakonwords) {
						console.log(context.exec);
						stack = context.resolvedWords[context.exec]([],args || [],context,context.exec);
					} else if(context.resolvedWords[context.exec]) {
						stack = context.resolvedWords[context.exec]([],args || [],context,context.exec);
					} else if(context.DEFINE[context.exec].args.length) {
						stack = context.DEFINE[context.exec].args[0];
					} else {
						stack = [];
					}
					context.stack = stack;
					if(callback) callback(context);
				});
			});
		}
	}
	
	acuna.kernel.parser = parser;
	
	return parser;
	
});