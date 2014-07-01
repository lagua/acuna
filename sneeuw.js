define([ "dahex_com/kernel-x" ], function(kernelX) {

	var new_object = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = kernelX['win'](__s, __a, __c);
				__s = __s.concat([ "Object" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['get'](__s, __a, __c);
			__s = kernelX['new'](__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	var interval = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = kernelX['swap'](__s, __a, __c);
				__s = __s.concat([ 2, false, "setInterval" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['call_global'](__s, __a, __c);
			__s = kernelX['pop'](__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	var by_id = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = kernelX['doc'](__s, __a, __c);
				__s = __s.concat([ 1, false, "getElementById" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['call'](__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	var body = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = kernelX['doc'](__s, __a, __c);
				__s = __s.concat([ "body" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['get'](__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	var ctx = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = __s.concat([ "2d", "canvas" ]);
				__s = by_id(__s, __a, __c);
				__s = __s.concat([ 1, false, "getContext" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['call'](__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	var teken_sneeuw = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = __s.concat([ 0, 0, "canvas" ]);
				__s = by_id(__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = kernelX['dup'](__s, __a, __c);
				__s = __s.concat([ "width" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['get'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = kernelX['swap'](__s, __a, __c);
				__s = __s.concat([ "height" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['get'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = ctx(__s, __a, __c);
				__s = __s.concat([ 4, false, "clearRect" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['call'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = ctx(__s, __a, __c);
				__s = __s.concat([ "fillStyle", "rgba(255, 255, 255, 0.8)" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['set'](__s, __a, __c);
			__s = kernelX['pop'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = __s.concat([ 0, false, "beginPath" ]);
				__s = kernelX['call'](__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['dup'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = __s.concat([ function(__s, __a, __c) {
					__s = function(__s, __a, __c) {
						__s = kernelX['dup'](__s, __a, __c);
						__s = __s.concat([ "x" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['get2'](__s, __a, __c);
						__s = __s.concat([ "y" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = ctx(__s, __a, __c);
						__s = __s.concat([ 2, false, "moveTo" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['call'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['dup'](__s, __a, __c);
						__s = __s.concat([ "x" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['get2'](__s, __a, __c);
						__s = __s.concat([ "y" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['dig'](__s, __a, __c);
						__s = __s.concat([ "r" ]);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['get'](__s, __a, __c);
						__s = __s.concat([ 0 ]);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['PI'](__s, __a, __c);
						__s = __s.concat([ 2 ]);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['*'](__s, __a, __c);
						__s = __s.concat([ true ]);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = ctx(__s, __a, __c);
						__s = __s.concat([ 6, false, "arc" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['call'](__s, __a, __c);
					return __s;
				} ]);
				__s = kernelX['for_each'](__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = ctx(__s, __a, __c);
				__s = __s.concat([ 0, false, "fill" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['call'](__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	var update_sneeuw = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = __s.concat([ 0.01 ]);
				__s = kernelX['+'](__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['swap'](__s, __a, __c);
			__s = kernelX['dup'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = __s.concat([ function(__s, __a, __c) {
					__s = function(__s, __a, __c) {
						__s = kernelX['dup'](__s, __a, __c);
						__s = __s.concat([ "d" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = kernelX['get4'](__s, __a, __c);
					__s = kernelX['+'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['cos'](__s, __a, __c);
						__s = __s.concat([ 1 ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['+'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['get2'](__s, __a, __c);
						__s = __s.concat([ "r" ]);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['get'](__s, __a, __c);
						__s = __s.concat([ 2 ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['/'](__s, __a, __c);
					__s = kernelX['+'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['get2'](__s, __a, __c);
						__s = __s.concat([ "y" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['+'](__s, __a, __c);
						__s = __s.concat([ "y" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['swap'](__s, __a, __c);
					__s = kernelX['set'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = __s.concat([ function(__s, __a, __c) {
							__s = function(__s, __a, __c) {
								__s = kernelX['dup'](__s, __a, __c);
								__s = __s.concat([ "x" ]);
								return __s;
							}(__s, __a, __c);
							__s = kernelX['get'](__s, __a, __c);
							__s = kernelX['get4'](__s, __a, __c);
							__s = function(__s, __a, __c) {
								__s = kernelX['sin'](__s, __a, __c);
								__s = __s.concat([ 2 ]);
								return __s;
							}(__s, __a, __c);
							__s = kernelX['*'](__s, __a, __c);
							__s = function(__s, __a, __c) {
								__s = kernelX['+'](__s, __a, __c);
								__s = __s.concat([ "x" ]);
								return __s;
							}(__s, __a, __c);
							__s = kernelX['swap'](__s, __a, __c);
							__s = kernelX['set'](__s, __a, __c);
							return __s;
						} ]);
						__s = kernelX['dip'](__s, __a, __c);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = __s.concat([ "canvas" ]);
						__s = by_id(__s, __a, __c);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['dup'](__s, __a, __c);
						__s = __s.concat([ "width" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['swap'](__s, __a, __c);
						__s = __s.concat([ "height" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['get'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['get2'](__s, __a, __c);
						__s = __s.concat([ 5 ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['+'](__s, __a, __c);
					__s = kernelX['get5'](__s, __a, __c);
					__s = kernelX['gt'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['dig5'](__s, __a, __c);
						__s = __s.concat([ 5 ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['neg'](__s, __a, __c);
					__s = kernelX['swap'](__s, __a, __c);
					__s = kernelX['lt'](__s, __a, __c);
					__s = kernelX['or'](__s, __a, __c);
					__s = kernelX['get2'](__s, __a, __c);
					__s = kernelX['dig5'](__s, __a, __c);
					__s = kernelX['gt'](__s, __a, __c);
					__s = kernelX['or'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = __s.concat([ function(__s, __a, __c) {
							__s = kernelX['pop'](__s, __a, __c);
							__s = kernelX['random'](__s, __a, __c);
							__s = function(__s, __a, __c) {
								__s = kernelX['*'](__s, __a, __c);
								__s = __s.concat([ "x" ]);
								return __s;
							}(__s, __a, __c);
							__s = kernelX['swap'](__s, __a, __c);
							__s = kernelX['set'](__s, __a, __c);
							__s = function(__s, __a, __c) {
								__s = kernelX['pop'](__s, __a, __c);
								__s = __s.concat([ "y", -10 ]);
								return __s;
							}(__s, __a, __c);
							__s = kernelX['set'](__s, __a, __c);
							__s = kernelX['pop'](__s, __a, __c);
							return __s;
						} ]);
						__s = kernelX['if_true'](__s, __a, __c);
						return __s;
					}(__s, __a, __c);
					return __s;
				} ]);
				__s = kernelX['for_each'](__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			__s = teken_sneeuw(__s, __a, __c);
			__s = kernelX['swap'](__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	var sneeuw = function(__s, __a, __c) {
		__s = function(__s, __a, __c) {
			__s = function(__s, __a, __c) {
				__s = __s.concat([ "canvas" ]);
				__s = by_id(__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['test'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = kernelX['dup'](__s, __a, __c);
				__s = __s.concat([ "offsetWidth" ]);
				return __s;
			}(__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = kernelX['get'](__s, __a, __c);
				__s = __s.concat([ "width" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['swap'](__s, __a, __c);
			__s = kernelX['set'](__s, __a, __c);
			__s = kernelX['swap'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = kernelX['dup'](__s, __a, __c);
				__s = __s.concat([ "offsetHeight" ]);
				return __s;
			}(__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = kernelX['get'](__s, __a, __c);
				__s = __s.concat([ "height" ]);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['swap'](__s, __a, __c);
			__s = kernelX['set'](__s, __a, __c);
			__s = kernelX['swap'](__s, __a, __c);
			__s = kernelX['pop'](__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = kernelX['nil'](__s, __a, __c);
				__s = __s.concat([ 1500 ]);
				return __s;
			}(__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = __s.concat([ function(__s, __a, __c) {
					__s = kernelX['pop'](__s, __a, __c);
					__s = new_object(__s, __a, __c);
					__s = kernelX['get4'](__s, __a, __c);
					__s = kernelX['random'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['*'](__s, __a, __c);
						__s = __s.concat([ "x" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['swap'](__s, __a, __c);
					__s = kernelX['set'](__s, __a, __c);
					__s = kernelX['pop'](__s, __a, __c);
					__s = kernelX['get3'](__s, __a, __c);
					__s = kernelX['random'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['*'](__s, __a, __c);
						__s = __s.concat([ "y" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['swap'](__s, __a, __c);
					__s = kernelX['set'](__s, __a, __c);
					__s = kernelX['pop'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = __s.concat([ 5 ]);
						__s = kernelX['random'](__s, __a, __c);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['*'](__s, __a, __c);
						__s = __s.concat([ "r" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['swap'](__s, __a, __c);
					__s = kernelX['set'](__s, __a, __c);
					__s = kernelX['pop'](__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = __s.concat([ 1500 ]);
						__s = kernelX['random'](__s, __a, __c);
						return __s;
					}(__s, __a, __c);
					__s = function(__s, __a, __c) {
						__s = kernelX['*'](__s, __a, __c);
						__s = __s.concat([ "d" ]);
						return __s;
					}(__s, __a, __c);
					__s = kernelX['swap'](__s, __a, __c);
					__s = kernelX['set'](__s, __a, __c);
					__s = kernelX['pop'](__s, __a, __c);
					__s = kernelX['cons'](__s, __a, __c);
					return __s;
				} ]);
				__s = kernelX['for'](__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			__s = kernelX['bury'](__s, __a, __c);
			__s = kernelX['pop'](__s, __a, __c);
			__s = kernelX['pop'](__s, __a, __c);
			__s = teken_sneeuw(__s, __a, __c);
			__s = function(__s, __a, __c) {
				__s = __s.concat([ 0, 33, update_sneeuw ]);
				__s = interval(__s, __a, __c);
				return __s;
			}(__s, __a, __c);
			return __s;
		}(__s, [], __c);
		return __s;
	};
	return sneeuw;
});