define([
"dojo/_base/lang",
"dojo/_base/array",
"dojo/request",
"dojo/Deferred",
"dojo/promise/all",
"dojo/json"
],function(lang,array,request,Deferred,all,JSON) {
	lang.getObject("acuna.kernel",true);
	
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	var isNumeric = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	
	var Word = function(word,depth,line,block,args){
		this.word = word;
		this.depth = depth;
		this.line = line;
		this.block = block;
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
			defblocks.reverse();
			defblocks.forEach(function(defblock){
				var word, def;
				// search each block in una string
				defblock.split(/(?:\n){2,}?/g).forEach(function(block,blockno){
					var words = [];
					var parent;
					var first = block.match(/^\S+/);
					// DEFINE should only happen once per block
					// in other words: each block MUST start with DEFINE
					if(first instanceof Array && first.length) first = first[0]; 
					var target = first ? (first=="DEFINE" || first=="USE" ? first : (first.indexOf("\"")==-1 && !isNumeric(first) ? "words" : "DEFINE")) : "DEFINE";
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
							word = new Word(useWord,0,0,0,[]);
							word.path = path;
							word.exec = !parts[1];
							word.file = file;
							word.ext = ext;
							word.words = [];
							word.comments = [];
							word.USE = [];
							context.DEFINE[useWord] = def = parent = word;
						}
					}
					if(blockno>word.block) word = def;
					// search each line
					block.split(/\n/).forEach(function(line,lineno){
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
							if(p.indexOf("\"")==-1 && !isNumeric(p)) {
								if(p!="USE" && context.resolvedWords[p]) {
									console.log(p,context.resolvedWords[p])
									word = context.resolvedWords[p];
								} else {
									word = new Word(p,depth,lineno,blockno,[]);
								}
								var leftword = parts[index-1] ? parts[index-1] : null;
								leftword = leftword && leftword.indexOf("\"")==-1 && !isNumeric(leftword);
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
								if(p!="USE" && parent!=word) word.parent = parent;
								//if(index==0 && endword) endword = false;
								if(index==parts.length-1) {
									parent = word;
								}
							} else {
								// consider new lines
								// and first word && depth=0
								var val = preserveData && target == "words" ? p : isNumeric(p) ? parseFloat(p) : p.replace(/"/g,"");
								// this is a DEFINE comment
								if(target == "DEFINE" && blockno==0) {
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
									if(!endword && target != "DEFINE") {
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
						if(target=="USE") {
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
						context.data[k] = parser.parseData(new Word(k,0,0,0,def.words[0]))[k];
					} else {
						context.data[k] = def.args;
					}
					if(context.data[k].length == 1) context.data[k] = context.data[k][0];
				}
			}
			return context;
		},
		getModules:function(context){
			var use = [], modules = {};
			for(var k in context.DEFINE) {
				array.forEach(context.DEFINE[k].USE,function(u) {
					use = use.concat(u);
				});
			}
			var lastuse;
			var getModuleByWord = function(word) {
				for(var k in modules) {
					if(modules[k].word==word) return k;
				}
			};
			var i = 0;
			array.forEach(use,function(u) {
				var m;
				if(u.word!="USE") {
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
		use:function(context,callback) {
			var modules = parser.getModules(context);
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
							if(typeof a == "function") {
								context.resolvedWords[m.word] = a;
							} else {
								context.data[m.word] = a;
							}
							modules[toResolve[i].module] = a;
						}
					}
					context.modules = modules;
					if(items.length) {
						all(array.map(items,function(item){
							return item.f(item.module,item.args);
						})).then(function(res){
							array.forEach(res,function(a,i){
								var m = toResolve[items[i].index].module;
								lang.mixin(context.resolvedWords,a);
								context.modules[m] = items[i].module;
							});
							console.log(context)
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
		parseArgs:function(w,context) {
			var args = [];
			var checkWord = function(a) {
				if(typeof a == "object" && a instanceof Word) {
					if(context.resolvedWords[a.word]) {
						var f = context.resolvedWords[a.word];
						var fargs = parser.parseArgs(a,context);
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
						return ["words['"+a.word+"']",parser.parseArgsToString(a,context,useContextData)];
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
		words:function(context) {
			//var use = [];
			// words array is a chain
			//var stack = [];
			for(var k in context.DEFINE) {
				if(context.DEFINE[k].words.length) {
					context.resolvedWords[k] = function(word,stack,args,context){
						var def = context.DEFINE[word];
						// TODO when to clear the stack?
						stack = def.args.length ? stack.concat(def.args[0]) : stack;
						stack = stack.concat(args);
						array.forEach(def.words,function(block) {
							array.forEach(block,function(w) {
								stripSingles(w,context);
								var args = parser.parseArgs(w,context);
								var f = context.resolvedWords[w.word];
								if(f) {
									stack = f(stack,args,context,w.word);
								}
							});
						});
						return stack;
					}
					context.resolvedWords[k] = context.resolvedWords[k].bind(undefined,k)
				}
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
			var context = parser.define(context);
			var modules = parser.getModules(context);
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
			var jscontext = {
				stack:[],
				data:data
			};
			var getResolved = function(t){
				for(var m in modules) {
					if(modules[m].targets[t]) return modules[m];
				}
			}
			requireVocabs(vocabs,function(vocabs){
				var str = options.module ? "define" : "require";
				str += "([\n"+reqs.join(",\n")+"\n],function(){\n\n";
				var resolvedWords = [];
				for(m in modules) {
					var i = modules[m].index;
					var w = modules[m].word;
					if(w) {
						resolvedWords.push("'"+w+"':arguments["+i+"]");
					} else {
						var r = getResolved(m);
						var ri = r ? r.index : 0;
						var rargs = r ? r.targets[m].args : null;
						array.forEach(vocabs[m],function(w){
							var s = "'"+w+"':"
							if(r) s += "arguments["+ri+"]("
							s += "arguments["+i+"]";
							if(r) s += rargs ? ","+JSON.stringify(rargs)+")" : ")";
							s += "['"+w+"']";
							resolvedWords.push(s);
						});
					}
					//var v =  s.target.args[0].split(/\//g).pop();
					//str += "\""+v+"\":"+s.word+"("+v+",[\""+s.args.join("\",\"")+"\"]);\n";
				}
				str += "var words = {\n"+resolvedWords.join(",\n")+"\n};\n\n";
				if(options.module) str += "return function(stack,args,remotecontext){\n";
				str += "context = "+JSON.stringify(jscontext,undefined,2)+";\n";
				//str += "var stack = [];\n";
				for(var k in context.DEFINE) {
					var def = context.DEFINE[k];
					if(!def.words.length) continue;
					array.forEach(def.words,function(block,index) {
						if(!def.exec) {
							str += "words['"+def.word+"'] = function(stack,args,context) {\n";
						} else {
							str += "var stack = "+JSON.stringify(def.args.length ? def.args[0] : [])+";\n";
						}
						array.forEach(block,function(w) {
							stripSingles(w,context);
							var args = parser.parseArgsToString(w,context,options.useContextData);
							args = JSON.stringify(args);
							args = args.replace(/\\"/g,"@@");
							args = args.replace(/"/g,"").replace(/@@/g,'"');
							var f = w.word;
							str += "stack = words['"+f+"'](stack,"+args+",context);\n";
						});
						if(!def.exec) {
							str += "return stack;\n};\n";
						} else {
							str += "context.stack = stack;\n";
						}
					});
				}
				if(options.module) {
					str += "return stack;\n";
					str += "};\n";
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
		execute:function(file,callback,direct,args,doc){
			var context = {
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				stack:[],
				doc: doc || document.documentElement
			};
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
					if(context.resolvedWords[context.exec]) {
						stack = context.resolvedWords[context.exec]([],args || [],context,context.exec);
					} else if(context.DEFINE[context.exec].args.length) {
						stack = context.DEFINE[context.exec].args[0];
					} else {
						stack = [];
					}
					context.stack = stack;
					if(callback) callback(context);
				});
				/*
				var proms = [];
				for(var k in context.DEFINE) {
					var d = new Deferred();
					d.key = k;
					parser.use(context.DEFINE[k],function(context){
						d.resolve(context);
					});
					proms.push(d);
				}
				all(proms).then(function(res){
					console.log()
				});*/
			});
		}
	}
	
	acuna.kernel.parser = parser;
	
	return parser;
	
});