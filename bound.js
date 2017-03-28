/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*!
built in 2017-1-4:13:4 version 2.2.4 by 司徒正美
https://github.com/RubyLouvre/avalon/tree/2.2.3

修正IE下 orderBy BUG
更改下载Promise的提示
修复avalon.modern 在Proxy 模式下使用ms-for 循环对象时出错的BUG
修复effect内部传参 BUG
重构ms-validate的绑定事件的机制

*/(function (global, factory) {
     true ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.avalon = factory();
})(this, function () {
    'use strict';

    var win = typeof window === 'object' ? window : typeof global === 'object' ? global : {};

    var inBrowser = !!win.location && win.navigator;
    /* istanbul ignore if  */

    var document$1 = inBrowser ? win.document : {
        createElement: Object,
        createElementNS: Object,
        documentElement: 'xx',
        contains: Boolean
    };
    var root = inBrowser ? document$1.documentElement : {
        outerHTML: 'x'
    };

    var versions = {
        objectobject: 7, //IE7-8
        objectundefined: 6, //IE6
        undefinedfunction: NaN, // other modern browsers
        undefinedobject: NaN };
    /* istanbul ignore next  */
    var msie = document$1.documentMode || versions[typeof document$1.all + typeof XMLHttpRequest];

    var modern = /NaN|undefined/.test(msie) || msie > 8;

    /*
     https://github.com/rsms/js-lru
     entry             entry             entry             entry        
     ______            ______            ______            ______       
     | head |.newer => |      |.newer => |      |.newer => | tail |      
     |  A   |          |  B   |          |  C   |          |  D   |      
     |______| <= older.|______| <= older.|______| <= older.|______|      
     
     removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added 
     */
    function Cache(maxLength) {
        // 标识当前缓存数组的大小
        this.size = 0;
        // 标识缓存数组能达到的最大长度
        this.limit = maxLength;
        //  head（最不常用的项），tail（最常用的项）全部初始化为undefined

        this.head = this.tail = void 0;
        this._keymap = {};
    }

    Cache.prototype = {
        put: function put(key, value) {
            var entry = {
                key: key,
                value: value
            };
            this._keymap[key] = entry;
            if (this.tail) {
                // 如果存在tail（缓存数组的长度不为0），将tail指向新的 entry
                this.tail.newer = entry;
                entry.older = this.tail;
            } else {
                // 如果缓存数组的长度为0，将head指向新的entry
                this.head = entry;
            }
            this.tail = entry;
            // 如果缓存数组达到上限，则先删除 head 指向的缓存对象
            /* istanbul ignore if */
            if (this.size === this.limit) {
                this.shift();
            } else {
                this.size++;
            }
            return value;
        },
        shift: function shift() {
            /* istanbul ignore next */
            var entry = this.head;
            /* istanbul ignore if */
            if (entry) {
                // 删除 head ，并改变指向
                this.head = this.head.newer;
                // 同步更新 _keymap 里面的属性值
                this.head.older = entry.newer = entry.older = this._keymap[entry.key] = void 0;
                delete this._keymap[entry.key]; //#1029
                // 同步更新 缓存数组的长度
                this.size--;
            }
        },
        get: function get(key) {
            var entry = this._keymap[key];
            // 如果查找不到含有`key`这个属性的缓存对象
            if (entry === void 0) return;
            // 如果查找到的缓存对象已经是 tail (最近使用过的)
            /* istanbul ignore if */
            if (entry === this.tail) {
                return entry.value;
            }
            // HEAD--------------TAIL
            //   <.older   .newer>
            //  <--- add direction --
            //   A  B  C  <D>  E
            if (entry.newer) {
                // 处理 newer 指向
                if (entry === this.head) {
                    // 如果查找到的缓存对象是 head (最近最少使用过的)
                    // 则将 head 指向原 head 的 newer 所指向的缓存对象
                    this.head = entry.newer;
                }
                // 将所查找的缓存对象的下一级的 older 指向所查找的缓存对象的older所指向的值
                // 例如：A B C D E
                // 如果查找到的是D，那么将E指向C，不再指向D
                entry.newer.older = entry.older; // C <-- E.
            }
            if (entry.older) {
                // 处理 older 指向
                // 如果查找到的是D，那么C指向E，不再指向D
                entry.older.newer = entry.newer; // C. --> E
            }
            // 处理所查找到的对象的 newer 以及 older 指向
            entry.newer = void 0; // D --x
            // older指向之前使用过的变量，即D指向E
            entry.older = this.tail; // D. --> E
            if (this.tail) {
                // 将E的newer指向D
                this.tail.newer = entry; // E. <-- D
            }
            // 改变 tail 为D 
            this.tail = entry;
            return entry.value;
        }
    };

    var delayCompile = {};

    var directives = {};

    function directive(name, opts) {
        if (directives[name]) {
            avalon.warn(name, 'directive have defined! ');
        }
        directives[name] = opts;
        if (!opts.update) {
            opts.update = function () {};
        }
        if (opts.delay) {
            delayCompile[name] = 1;
        }
        return opts;
    }

    function delayCompileNodes(dirs) {
        for (var i in delayCompile) {
            if ('ms-' + i in dirs) {
                return true;
            }
        }
    }

    var window$1 = win;
    function avalon(el) {
        return new avalon.init(el);
    }

    avalon.init = function (el) {
        this[0] = this.element = el;
    };

    avalon.fn = avalon.prototype = avalon.init.prototype;

    function shadowCopy(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }
    var rword = /[^, ]+/g;
    var rnowhite = /\S+/g; //存在非空字符
    var platform = {}; //用于放置平台差异的方法与属性


    function oneObject(array, val) {
        if (typeof array === 'string') {
            array = array.match(rword) || [];
        }
        var result = {},
            value = val !== void 0 ? val : 1;
        for (var i = 0, n = array.length; i < n; i++) {
            result[array[i]] = value;
        }
        return result;
    }

    var op = Object.prototype;
    function quote(str) {
        return avalon._quote(str);
    }
    var inspect = op.toString;
    var ohasOwn = op.hasOwnProperty;
    var ap = Array.prototype;

    var hasConsole = typeof console === 'object';
    avalon.config = { debug: true };
    function log() {
        if (hasConsole && avalon.config.debug) {
            Function.apply.call(console.log, console, arguments);
        }
    }
    function warn() {
        if (hasConsole && avalon.config.debug) {
            var method = console.warn || console.log;
            // http://qiang106.iteye.com/blog/1721425
            Function.apply.call(method, console, arguments);
        }
    }
    function error(str, e) {
        throw (e || Error)(str);
    }
    function noop() {}
    function isObject(a) {
        return a !== null && typeof a === 'object';
    }

    function range(start, end, step) {
        // 用于生成整数数组
        step || (step = 1);
        if (end == null) {
            end = start || 0;
            start = 0;
        }
        var index = -1,
            length = Math.max(0, Math.ceil((end - start) / step)),
            result = new Array(length);
        while (++index < length) {
            result[index] = start;
            start += step;
        }
        return result;
    }

    var rhyphen = /([a-z\d])([A-Z]+)/g;
    function hyphen(target) {
        //转换为连字符线风格
        return target.replace(rhyphen, '$1-$2').toLowerCase();
    }

    var rcamelize = /[-_][^-_]/g;
    function camelize(target) {
        //提前判断，提高getStyle等的效率
        if (!target || target.indexOf('-') < 0 && target.indexOf('_') < 0) {
            return target;
        }
        //转换为驼峰风格
        return target.replace(rcamelize, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }

    var _slice = ap.slice;
    function slice(nodes, start, end) {
        return _slice.call(nodes, start, end);
    }

    var rhashcode = /\d\.\d{4}/;
    //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function makeHashCode(prefix) {
        /* istanbul ignore next*/
        prefix = prefix || 'avalon';
        /* istanbul ignore next*/
        return String(Math.random() + Math.random()).replace(rhashcode, prefix);
    }
    //生成事件回调的UUID(用户通过ms-on指令)
    function getLongID(fn) {
        /* istanbul ignore next */
        return fn.uuid || (fn.uuid = makeHashCode('e'));
    }
    var UUID = 1;
    //生成事件回调的UUID(用户通过avalon.bind)
    function getShortID(fn) {
        /* istanbul ignore next */
        return fn.uuid || (fn.uuid = '_' + ++UUID);
    }

    var rescape = /[-.*+?^${}()|[\]\/\\]/g;
    function escapeRegExp(target) {
        //http://stevenlevithan.com/regex/xregexp/
        //将字符串安全格式化为正则表达式的源码
        return (target + '').replace(rescape, '\\$&');
    }

    var eventHooks = {};
    var eventListeners = {};
    var validators = {};
    var cssHooks = {};

    window$1.avalon = avalon;

    function createFragment() {
        /* istanbul ignore next  */
        return document$1.createDocumentFragment();
    }

    var rentities = /&[a-z0-9#]{2,10};/;
    var temp = document$1.createElement('div');
    shadowCopy(avalon, {
        Array: {
            merge: function merge(target, other) {
                //合并两个数组 avalon2新增
                target.push.apply(target, other);
            },
            ensure: function ensure(target, item) {
                //只有当前数组不存在此元素时只添加它
                if (target.indexOf(item) === -1) {
                    return target.push(item);
                }
            },
            removeAt: function removeAt(target, index) {
                //移除数组中指定位置的元素，返回布尔表示成功与否
                return !!target.splice(index, 1).length;
            },
            remove: function remove(target, item) {
                //移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否
                var index = target.indexOf(item);
                if (~index) return avalon.Array.removeAt(target, index);
                return false;
            }
        },
        evaluatorPool: new Cache(888),
        parsers: {
            number: function number(a) {
                return a === '' ? '' : parseFloat(a) || 0;
            },
            string: function string(a) {
                return a === null || a === void 0 ? '' : a + '';
            },
            "boolean": function boolean(a) {
                if (a === '') return a;
                return a === 'true' || a === '1';
            }
        },
        _decode: function _decode(str) {
            if (rentities.test(str)) {
                temp.innerHTML = str;
                return temp.innerText || temp.textContent;
            }
            return str;
        }
    });

    //============== config ============
    function config(settings) {
        for (var p in settings) {
            var val = settings[p];
            if (typeof config.plugins[p] === 'function') {
                config.plugins[p](val);
            } else {
                config[p] = val;
            }
        }
        return this;
    }

    var plugins = {
        interpolate: function interpolate(array) {
            var openTag = array[0];
            var closeTag = array[1];
            if (openTag === closeTag) {
                throw new SyntaxError('interpolate openTag cannot equal to closeTag');
            }
            var str = openTag + 'test' + closeTag;

            if (/[<>]/.test(str)) {
                throw new SyntaxError('interpolate cannot contains "<" or ">"');
            }

            config.openTag = openTag;
            config.closeTag = closeTag;
            var o = escapeRegExp(openTag);
            var c = escapeRegExp(closeTag);

            config.rtext = new RegExp(o + '(.+?)' + c, 'g');
            config.rexpr = new RegExp(o + '([\\s\\S]*)' + c);
        }
    };
    function createAnchor(nodeValue) {
        return document$1.createComment(nodeValue);
    }
    config.plugins = plugins;
    config({
        interpolate: ['{{', '}}'],
        debug: true
    });
    //============  config ============

    shadowCopy(avalon, {
        shadowCopy: shadowCopy,

        oneObject: oneObject,
        inspect: inspect,
        ohasOwn: ohasOwn,
        rword: rword,
        version: "2.2.4",
        vmodels: {},

        directives: directives,
        directive: directive,

        eventHooks: eventHooks,
        eventListeners: eventListeners,
        validators: validators,
        cssHooks: cssHooks,

        log: log,
        noop: noop,
        warn: warn,
        error: error,
        config: config,

        modern: modern,
        msie: msie,
        root: root,
        document: document$1,
        window: window$1,
        inBrowser: inBrowser,

        isObject: isObject,
        range: range,
        slice: slice,
        hyphen: hyphen,
        camelize: camelize,
        escapeRegExp: escapeRegExp,
        quote: quote,

        makeHashCode: makeHashCode

    });

    /**
     * 此模块用于修复语言的底层缺陷
     */
    function isNative(fn) {
        return (/\[native code\]/.test(fn)
        );
    }

    /* istanbul ignore if*/
    if (!isNative('司徒正美'.trim)) {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function () {
            return this.replace(rtrim, '');
        };
    }
    if (!Object.create) {
        Object.create = function () {
            function F() {}

            return function (o) {
                if (arguments.length != 1) {
                    throw new Error('Object.create implementation only accepts one parameter.');
                }
                F.prototype = o;
                return new F();
            };
        }();
    }
    var hasDontEnumBug = !{
        'toString': null
    }.propertyIsEnumerable('toString');
    var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
    var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
    var dontEnumsLength = dontEnums.length;
    /* istanbul ignore if*/
    if (!isNative(Object.keys)) {
        Object.keys = function (object) {
            //ecma262v5 15.2.3.14
            var theKeys = [];
            var skipProto = hasProtoEnumBug && typeof object === 'function';
            if (typeof object === 'string' || object && object.callee) {
                for (var i = 0; i < object.length; ++i) {
                    theKeys.push(String(i));
                }
            } else {
                for (var name in object) {
                    if (!(skipProto && name === 'prototype') && ohasOwn.call(object, name)) {
                        theKeys.push(String(name));
                    }
                }
            }

            if (hasDontEnumBug) {
                var ctor = object.constructor,
                    skipConstructor = ctor && ctor.prototype === object;
                for (var j = 0; j < dontEnumsLength; j++) {
                    var dontEnum = dontEnums[j];
                    if (!(skipConstructor && dontEnum === 'constructor') && ohasOwn.call(object, dontEnum)) {
                        theKeys.push(dontEnum);
                    }
                }
            }
            return theKeys;
        };
    }
    /* istanbul ignore if*/
    if (!isNative(Array.isArray)) {
        Array.isArray = function (a) {
            return Object.prototype.toString.call(a) === '[object Array]';
        };
    }

    /* istanbul ignore if*/
    if (!isNative(isNative.bind)) {
        /* istanbul ignore next*/
        Function.prototype.bind = function (scope) {
            if (arguments.length < 2 && scope === void 0) return this;
            var fn = this,
                argv = arguments;
            return function () {
                var args = [],
                    i;
                for (i = 1; i < argv.length; i++) {
                    args.push(argv[i]);
                }for (i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }return fn.apply(scope, args);
            };
        };
    }
    //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
    /**
     * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
     * on host objects like NamedNodeMap, NodeList, and HTMLCollection
     * (technically, since host objects have been implementation-dependent,
     * at least before ES6, IE hasn't needed to work this way).
     * Also works on strings, fixes IE < 9 to allow an explicit undefined
     * for the 2nd argument (as in Firefox), and prevents errors when
     * called on other DOM objects.
     */

    try {
        // Can't be used with DOM elements in IE < 9
        _slice.call(avalon.document.documentElement);
    } catch (e) {
        // Fails in IE < 9
        // This will work for genuine arrays, array-like objects,
        // NamedNodeMap (attributes, entities, notations),
        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
        /* istanbul ignore next*/
        ap.slice = function (begin, end) {
            // IE < 9 gets unhappy with an undefined end argument
            end = typeof end !== 'undefined' ? end : this.length;

            // For native Array objects, we use the native slice function
            if (Array.isArray(this)) {
                return _slice.call(this, begin, end);
            }

            // For array like object we handle it ourselves.
            var i,
                cloned = [],
                size,
                len = this.length;

            // Handle negative value for "begin"
            var start = begin || 0;
            start = start >= 0 ? start : len + start;

            // Handle negative value for "end"
            var upTo = end ? end : len;
            if (end < 0) {
                upTo = len + end;
            }

            // Actual expected size of the slice
            size = upTo - start;

            if (size > 0) {
                cloned = new Array(size);
                if (this.charAt) {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this.charAt(start + i);
                    }
                } else {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this[start + i];
                    }
                }
            }

            return cloned;
        };
    }
    /* istanbul ignore next*/
    function iterator(vars, body, ret) {
        var fun = 'for(var ' + vars + 'i=0,n = this.length; i < n; i++){' + body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))') + '}' + ret;
        /* jshint ignore:start */
        return Function('fn,scope', fun);
        /* jshint ignore:end */
    }
    /* istanbul ignore if*/
    if (!isNative(ap.map)) {
        avalon.shadowCopy(ap, {
            //定位操作，返回数组中第一个等于给定参数的元素的索引值。
            indexOf: function indexOf(item, index) {
                var n = this.length,
                    i = ~~index;
                if (i < 0) i += n;
                for (; i < n; i++) {
                    if (this[i] === item) return i;
                }return -1;
            },
            //定位操作，同上，不过是从后遍历。
            lastIndexOf: function lastIndexOf(item, index) {
                var n = this.length,
                    i = index == null ? n - 1 : index;
                if (i < 0) i = Math.max(0, n + i);
                for (; i >= 0; i--) {
                    if (this[i] === item) return i;
                }return -1;
            },
            //迭代操作，将数组的元素挨个儿传入一个函数中执行。Prototype.js的对应名字为each。
            forEach: iterator('', '_', ''),
            //迭代类 在数组中的每个项上运行一个函数，如果此函数的值为真，则此元素作为新数组的元素收集起来，并返回新数组
            filter: iterator('r=[],j=0,', 'if(_)r[j++]=this[i]', 'return r'),
            //收集操作，将数组的元素挨个儿传入一个函数中执行，然后把它们的返回值组成一个新数组返回。Prototype.js的对应名字为collect。
            map: iterator('r=[],', 'r[i]=_', 'return r'),
            //只要数组中有一个元素满足条件（放进给定函数返回true），那么它就返回true。Prototype.js的对应名字为any。
            some: iterator('', 'if(_)return true', 'return false'),
            //只有数组中的元素都满足条件（放进给定函数返回true），它才返回true。Prototype.js的对应名字为all。
            every: iterator('', 'if(!_)return false', 'return true')
        });
    }

    //这里放置存在异议的方法
    var compaceQuote = function () {
        //https://github.com/bestiejs/json3/blob/master/lib/json3.js
        var Escapes = {
            92: "\\\\",
            34: '\\"',
            8: "\\b",
            12: "\\f",
            10: "\\n",
            13: "\\r",
            9: "\\t"
        };

        var leadingZeroes = '000000';
        var toPaddedString = function toPaddedString(width, value) {
            return (leadingZeroes + (value || 0)).slice(-width);
        };
        var unicodePrefix = '\\u00';
        var escapeChar = function escapeChar(character) {
            var charCode = character.charCodeAt(0),
                escaped = Escapes[charCode];
            if (escaped) {
                return escaped;
            }
            return unicodePrefix + toPaddedString(2, charCode.toString(16));
        };
        var reEscape = /[\x00-\x1f\x22\x5c]/g;
        return function (value) {
            /* istanbul ignore next */
            reEscape.lastIndex = 0;
            /* istanbul ignore next */
            return '"' + (reEscape.test(value) ? String(value).replace(reEscape, escapeChar) : value) + '"';
        };
    }();
    try {
        avalon._quote = JSON.stringify;
    } catch (e) {
        /* istanbul ignore next  */
        avalon._quote = compaceQuote;
    }

    var class2type = {};
    'Boolean Number String Function Array Date RegExp Object Error'.replace(avalon.rword, function (name) {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });

    avalon.type = function (obj) {
        //取得目标的类型
        if (obj == null) {
            return String(obj);
        }
        // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
        return typeof obj === 'object' || typeof obj === 'function' ? class2type[inspect.call(obj)] || 'object' : typeof obj;
    };

    var rfunction = /^\s*\bfunction\b/;

    avalon.isFunction = /* istanbul ignore if */typeof alert === 'object' ? function (fn) {
        /* istanbul ignore next */
        try {
            /* istanbul ignore next */
            return rfunction.test(fn + '');
        } catch (e) {
            /* istanbul ignore next */
            return false;
        }
    } : function (fn) {
        return inspect.call(fn) === '[object Function]';
    };

    // 利用IE678 window == document为true,document == window竟然为false的神奇特性
    // 标准浏览器及IE9，IE10等使用 正则检测
    /* istanbul ignore next */
    function isWindowCompact(obj) {
        if (!obj) {
            return false;
        }
        return obj == obj.document && obj.document != obj; //jshint ignore:line
    }

    var rwindow = /^\[object (?:Window|DOMWindow|global)\]$/;

    function isWindowModern(obj) {
        return rwindow.test(inspect.call(obj));
    }

    avalon.isWindow = isWindowModern(avalon.window) ? isWindowModern : isWindowCompact;

    var enu;
    var enumerateBUG;
    for (enu in avalon({})) {
        break;
    }

    enumerateBUG = enu !== '0'; //IE6下为true, 其他为false

    /*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/
    /* istanbul ignore next */
    function isPlainObjectCompact(obj, key) {
        if (!obj || avalon.type(obj) !== 'object' || obj.nodeType || avalon.isWindow(obj)) {
            return false;
        }
        try {
            //IE内置对象没有constructor
            if (obj.constructor && !ohasOwn.call(obj, 'constructor') && !ohasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
            var isVBscript = obj.$vbthis;
        } catch (e) {
            //IE8 9会在这里抛错
            return false;
        }
        /* istanbul ignore if */
        if (enumerateBUG) {
            for (key in obj) {
                return ohasOwn.call(obj, key);
            }
        }
        for (key in obj) {}
        return key === undefined$1 || ohasOwn.call(obj, key);
    }

    /* istanbul ignore next */
    function isPlainObjectModern(obj) {
        // 简单的 typeof obj === 'object'检测，会致使用isPlainObject(window)在opera下通不过
        return inspect.call(obj) === '[object Object]' && Object.getPrototypeOf(obj) === Object.prototype;
    }
    /* istanbul ignore next */
    avalon.isPlainObject = /\[native code\]/.test(Object.getPrototypeOf) ? isPlainObjectModern : isPlainObjectCompact;

    var rcanMix = /object|function/;

    //与jQuery.extend方法，可用于浅拷贝，深拷贝
    /* istanbul ignore next */
    avalon.mix = avalon.fn.mix = function () {
        var n = arguments.length,
            isDeep = false,
            i = 0,
            array = [];
        if (arguments[0] === true) {
            isDeep = true;
            i = 1;
        }
        //将所有非空对象变成空对象
        for (; i < n; i++) {
            var el = arguments[i];
            el = el && rcanMix.test(typeof el) ? el : {};
            array.push(el);
        }
        if (array.length === 1) {
            array.unshift(this);
        }
        return innerExtend(isDeep, array);
    };
    var undefined$1;

    function innerExtend(isDeep, array) {
        var target = array[0],
            copyIsArray,
            clone,
            name;
        for (var i = 1, length = array.length; i < length; i++) {
            //只处理非空参数
            var options = array[i];
            var noCloneArrayMethod = Array.isArray(options);
            for (name in options) {
                if (noCloneArrayMethod && !options.hasOwnProperty(name)) {
                    continue;
                }
                try {
                    var src = target[name];
                    var copy = options[name]; //当options为VBS对象时报错
                } catch (e) {
                    continue;
                }

                // 防止环引用
                if (target === copy) {
                    continue;
                }
                if (isDeep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && avalon.isPlainObject(src) ? src : {};
                    }

                    target[name] = innerExtend(isDeep, [clone, copy]);
                } else if (copy !== undefined$1) {
                    target[name] = copy;
                }
            }
        }
        return target;
    }

    var rarraylike = /(Array|List|Collection|Map|Arguments)\]$/;
    /*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
    /* istanbul ignore next */
    function isArrayLike(obj) {
        if (!obj) return false;
        var n = obj.length;
        if (n === n >>> 0) {
            //检测length属性是否为非负整数
            var type = inspect.call(obj);
            if (rarraylike.test(type)) return true;
            if (type !== '[object Object]') return false;
            try {
                if ({}.propertyIsEnumerable.call(obj, 'length') === false) {
                    //如果是原生对象
                    return rfunction.test(obj.item || obj.callee);
                }
                return true;
            } catch (e) {
                //IE的NodeList直接抛错
                return !obj.window; //IE6-8 window
            }
        }
        return false;
    }

    avalon.each = function (obj, fn) {
        if (obj) {
            //排除null, undefined
            var i = 0;
            if (isArrayLike(obj)) {
                for (var n = obj.length; i < n; i++) {
                    if (fn(i, obj[i]) === false) break;
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
                        break;
                    }
                }
            }
        }
    };
    (function () {
        var welcomeIntro = ["%cavalon.js %c" + avalon.version + " %cin debug mode, %cmore...", "color: rgb(114, 157, 52); font-weight: normal;", "color: rgb(85, 85, 85); font-weight: normal;", "color: rgb(85, 85, 85); font-weight: normal;", "color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;"];
        var welcomeMessage = "You're running avalon in debug mode - messages will be printed to the console to help you fix problems and optimise your application.\n\n" + 'To disable debug mode, add this line at the start of your app:\n\n  avalon.config({debug: false});\n\n' + 'Debug mode also automatically shut down amicably when your app is minified.\n\n' + "Get help and support:\n  https://segmentfault.com/t/avalon\n  http://avalonjs.coding.me/\n  http://www.baidu-x.com/?q=avalonjs\n  http://www.avalon.org.cn/\n\nFound a bug? Raise an issue:\n  https://github.com/RubyLouvre/avalon/issues\n\n";
        if (typeof console === 'object') {
            var con = console;
            var method = con.groupCollapsed || con.log;
            Function.apply.call(method, con, welcomeIntro);
            con.log(welcomeMessage);
            if (method !== console.log) {
                con.groupEnd(welcomeIntro);
            }
        }
    })();

    function toFixedFix(n, prec) {
        var k = Math.pow(10, prec);
        return '' + (Math.round(n * k) / k).toFixed(prec);
    }
    function numberFilter(number, decimals, point, thousands) {
        //https://github.com/txgruppi/number_format
        //form http://phpjs.org/functions/number_format/
        //number 必需，要格式化的数字
        //decimals 可选，规定多少个小数位。
        //point 可选，规定用作小数点的字符串（默认为 . ）。
        //thousands 可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 3 : Math.abs(decimals),
            sep = typeof thousands === 'string' ? thousands : ",",
            dec = point || ".",
            s = '';

        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        /** //好像没有用
         var s1 = s[1] || ''
        
          if (s1.length < prec) {
                  s1 += new Array(prec - s[1].length + 1).join('0')
                  s[1] = s1
          }
          **/
        return s.join(dec);
    }

    var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim;
    var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g;
    var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/ig;
    var rsanitize = {
        a: /\b(href)\=("javascript[^"]*"|'javascript[^']*')/ig,
        img: /\b(src)\=("javascript[^"]*"|'javascript[^']*')/ig,
        form: /\b(action)\=("javascript[^"]*"|'javascript[^']*')/ig
    };

    //https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    //    <a href="javasc&NewLine;ript&colon;alert('XSS')">chrome</a> 
    //    <a href="data:text/html;base64, PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpPg==">chrome</a>
    //    <a href="jav	ascript:alert('XSS');">IE67chrome</a>
    //    <a href="jav&#x09;ascript:alert('XSS');">IE67chrome</a>
    //    <a href="jav&#x0A;ascript:alert('XSS');">IE67chrome</a>
    function sanitizeFilter(str) {
        return str.replace(rscripts, "").replace(ropen, function (a, b) {
            var match = a.toLowerCase().match(/<(\w+)\s/);
            if (match) {
                //处理a标签的href属性，img标签的src属性，form标签的action属性
                var reg = rsanitize[match[1]];
                if (reg) {
                    a = a.replace(reg, function (s, name, value) {
                        var quote = value.charAt(0);
                        return name + "=" + quote + "javascript:void(0)" + quote; // jshint ignore:line
                    });
                }
            }
            return a.replace(ron, " ").replace(/\s+/g, " "); //移除onXXX事件
        });
    }

    /*
     'yyyy': 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
     'yy': 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
     'y': 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
     'MMMM': Month in year (January-December)
     'MMM': Month in year (Jan-Dec)
     'MM': Month in year, padded (01-12)
     'M': Month in year (1-12)
     'dd': Day in month, padded (01-31)
     'd': Day in month (1-31)
     'EEEE': Day in Week,(Sunday-Saturday)
     'EEE': Day in Week, (Sun-Sat)
     'HH': Hour in day, padded (00-23)
     'H': Hour in day (0-23)
     'hh': Hour in am/pm, padded (01-12)
     'h': Hour in am/pm, (1-12)
     'mm': Minute in hour, padded (00-59)
     'm': Minute in hour (0-59)
     'ss': Second in minute, padded (00-59)
     's': Second in minute (0-59)
     'a': am/pm marker
     'Z': 4 digit (+sign) representation of the timezone offset (-1200-+1200)
     format string can also be one of the following predefined localizable formats:
     
     'medium': equivalent to 'MMM d, y h:mm:ss a' for en_US locale (e.g. Sep 3, 2010 12:05:08 pm)
     'short': equivalent to 'M/d/yy h:mm a' for en_US locale (e.g. 9/3/10 12:05 pm)
     'fullDate': equivalent to 'EEEE, MMMM d,y' for en_US locale (e.g. Friday, September 3, 2010)
     'longDate': equivalent to 'MMMM d, y' for en_US locale (e.g. September 3, 2010
     'mediumDate': equivalent to 'MMM d, y' for en_US locale (e.g. Sep 3, 2010)
     'shortDate': equivalent to 'M/d/yy' for en_US locale (e.g. 9/3/10)
     'mediumTime': equivalent to 'h:mm:ss a' for en_US locale (e.g. 12:05:08 pm)
     'shortTime': equivalent to 'h:mm a' for en_US locale (e.g. 12:05 pm)
     */

    function toInt(str) {
        return parseInt(str, 10) || 0;
    }

    function padNumber(num, digits, trim) {
        var neg = '';
        /* istanbul ignore if*/
        if (num < 0) {
            neg = '-';
            num = -num;
        }
        num = '' + num;
        while (num.length < digits) {
            num = '0' + num;
        }if (trim) num = num.substr(num.length - digits);
        return neg + num;
    }

    function dateGetter(name, size, offset, trim) {
        return function (date) {
            var value = date["get" + name]();
            if (offset > 0 || value > -offset) value += offset;
            if (value === 0 && offset === -12) {
                /* istanbul ignore next*/
                value = 12;
            }
            return padNumber(value, size, trim);
        };
    }

    function dateStrGetter(name, shortForm) {
        return function (date, formats) {
            var value = date["get" + name]();
            var get = (shortForm ? "SHORT" + name : name).toUpperCase();
            return formats[get][value];
        };
    }

    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset();
        var paddedZone = zone >= 0 ? "+" : "";
        paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);
        return paddedZone;
    }
    //取得上午下午
    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
    }
    var DATE_FORMATS = {
        yyyy: dateGetter("FullYear", 4),
        yy: dateGetter("FullYear", 2, 0, true),
        y: dateGetter("FullYear", 1),
        MMMM: dateStrGetter("Month"),
        MMM: dateStrGetter("Month", true),
        MM: dateGetter("Month", 2, 1),
        M: dateGetter("Month", 1, 1),
        dd: dateGetter("Date", 2),
        d: dateGetter("Date", 1),
        HH: dateGetter("Hours", 2),
        H: dateGetter("Hours", 1),
        hh: dateGetter("Hours", 2, -12),
        h: dateGetter("Hours", 1, -12),
        mm: dateGetter("Minutes", 2),
        m: dateGetter("Minutes", 1),
        ss: dateGetter("Seconds", 2),
        s: dateGetter("Seconds", 1),
        sss: dateGetter("Milliseconds", 3),
        EEEE: dateStrGetter("Day"),
        EEE: dateStrGetter("Day", true),
        a: ampmGetter,
        Z: timeZoneGetter
    };
    var rdateFormat = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/;
    var raspnetjson = /^\/Date\((\d+)\)\/$/;
    function dateFilter(date, format) {
        var locate = dateFilter.locate,
            text = "",
            parts = [],
            fn,
            match;
        format = format || "mediumDate";
        format = locate[format] || format;
        if (typeof date === "string") {
            if (/^\d+$/.test(date)) {
                date = toInt(date);
            } else if (raspnetjson.test(date)) {
                date = +RegExp.$1;
            } else {
                var trimDate = date.trim();
                var dateArray = [0, 0, 0, 0, 0, 0, 0];
                var oDate = new Date(0);
                //取得年月日
                trimDate = trimDate.replace(/^(\d+)\D(\d+)\D(\d+)/, function (_, a, b, c) {
                    var array = c.length === 4 ? [c, a, b] : [a, b, c];
                    dateArray[0] = toInt(array[0]); //年
                    dateArray[1] = toInt(array[1]) - 1; //月
                    dateArray[2] = toInt(array[2]); //日
                    return "";
                });
                var dateSetter = oDate.setFullYear;
                var timeSetter = oDate.setHours;
                trimDate = trimDate.replace(/[T\s](\d+):(\d+):?(\d+)?\.?(\d)?/, function (_, a, b, c, d) {
                    dateArray[3] = toInt(a); //小时
                    dateArray[4] = toInt(b); //分钟
                    dateArray[5] = toInt(c); //秒
                    if (d) {
                        //毫秒
                        dateArray[6] = Math.round(parseFloat("0." + d) * 1000);
                    }
                    return "";
                });
                var tzHour = 0;
                var tzMin = 0;
                trimDate = trimDate.replace(/Z|([+-])(\d\d):?(\d\d)/, function (z, symbol, c, d) {
                    dateSetter = oDate.setUTCFullYear;
                    timeSetter = oDate.setUTCHours;
                    if (symbol) {
                        tzHour = toInt(symbol + c);
                        tzMin = toInt(symbol + d);
                    }
                    return '';
                });

                dateArray[3] -= tzHour;
                dateArray[4] -= tzMin;
                dateSetter.apply(oDate, dateArray.slice(0, 3));
                timeSetter.apply(oDate, dateArray.slice(3));
                date = oDate;
            }
        }
        if (typeof date === 'number') {
            date = new Date(date);
        }

        while (format) {
            match = rdateFormat.exec(format);
            /* istanbul ignore else */
            if (match) {
                parts = parts.concat(match.slice(1));
                format = parts.pop();
            } else {
                parts.push(format);
                format = null;
            }
        }
        parts.forEach(function (value) {
            fn = DATE_FORMATS[value];
            text += fn ? fn(date, locate) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'");
        });
        return text;
    }

    var locate = {
        AMPMS: {
            0: '上午',
            1: '下午'
        },
        DAY: {
            0: '星期日',
            1: '星期一',
            2: '星期二',
            3: '星期三',
            4: '星期四',
            5: '星期五',
            6: '星期六'
        },
        MONTH: {
            0: '1月',
            1: '2月',
            2: '3月',
            3: '4月',
            4: '5月',
            5: '6月',
            6: '7月',
            7: '8月',
            8: '9月',
            9: '10月',
            10: '11月',
            11: '12月'
        },
        SHORTDAY: {
            '0': '周日',
            '1': '周一',
            '2': '周二',
            '3': '周三',
            '4': '周四',
            '5': '周五',
            '6': '周六'
        },
        fullDate: 'y年M月d日EEEE',
        longDate: 'y年M月d日',
        medium: 'yyyy-M-d H:mm:ss',
        mediumDate: 'yyyy-M-d',
        mediumTime: 'H:mm:ss',
        'short': 'yy-M-d ah:mm',
        shortDate: 'yy-M-d',
        shortTime: 'ah:mm'
    };
    locate.SHORTMONTH = locate.MONTH;
    dateFilter.locate = locate;

    /**
    $$skipArray:是系统级通用的不可监听属性
    $skipArray: 是当前对象特有的不可监听属性
    
     不同点是
     $$skipArray被hasOwnProperty后返回false
     $skipArray被hasOwnProperty后返回true
     */
    var falsy;
    var $$skipArray = {
        $id: falsy,
        $render: falsy,
        $track: falsy,
        $element: falsy,
        $computed: falsy,
        $watch: falsy,
        $fire: falsy,
        $events: falsy,
        $accessors: falsy,
        $hashcode: falsy,
        $mutations: falsy,
        $vbthis: falsy,
        $vbsetter: falsy
    };

    /*
    https://github.com/hufyhang/orderBy/blob/master/index.js
    */

    function orderBy(array, by, decend) {
        var type = avalon.type(array);
        if (type !== 'array' && type !== 'object') throw 'orderBy只能处理对象或数组';
        var criteria = typeof by == 'string' ? function (el) {
            return el && el[by];
        } : typeof by === 'function' ? by : function (el) {
            return el;
        };
        var mapping = {};
        var temp = [];
        __repeat(array, Array.isArray(array), function (key) {
            var val = array[key];
            var k = criteria(val, key);
            if (k in mapping) {
                mapping[k].push(key);
            } else {
                mapping[k] = [key];
            }
            temp.push(k);
        });

        temp.sort();
        if (decend < 0) {
            temp.reverse();
        }
        var _array = type === 'array';
        var target = _array ? [] : {};
        return recovery(target, temp, function (k) {
            var key = mapping[k].shift();
            if (_array) {
                target.push(array[key]);
            } else {
                target[key] = array[key];
            }
        });
    }

    function __repeat(array, isArray$$1, cb) {
        if (isArray$$1) {
            array.forEach(function (val, index) {
                cb(index);
            });
        } else if (typeof array.$track === 'string') {
            array.$track.replace(/[^☥]+/g, function (k) {
                cb(k);
            });
        } else {
            for (var i in array) {
                if (array.hasOwnProperty(i)) {
                    cb(i);
                }
            }
        }
    }
    function filterBy(array, search) {
        var type = avalon.type(array);
        if (type !== 'array' && type !== 'object') throw 'filterBy只能处理对象或数组';
        var args = avalon.slice(arguments, 2);
        var stype = avalon.type(search);
        if (stype === 'function') {
            var criteria = search;
        } else if (stype === 'string' || stype === 'number') {
            if (search === '') {
                return array;
            } else {
                var reg = new RegExp(avalon.escapeRegExp(search), 'i');
                criteria = function criteria(el) {
                    return reg.test(el);
                };
            }
        } else {
            return array;
        }
        var index = 0;
        var isArray$$1 = type === 'array';
        var target = isArray$$1 ? [] : {};
        __repeat(array, isArray$$1, function (key) {
            var val = array[key];
            if (criteria.apply(val, [val, index].concat(args))) {
                if (isArray$$1) {
                    target.push(val);
                } else {
                    target[key] = val;
                }
            }
            index++;
        });
        return target;
    }

    function selectBy(data, array, defaults) {
        if (avalon.isObject(data) && !Array.isArray(data)) {
            var target = [];
            return recovery(target, array, function (name) {
                target.push(data.hasOwnProperty(name) ? data[name] : defaults ? defaults[name] : '');
            });
        } else {
            return data;
        }
    }

    function limitBy(input, limit, begin) {
        var type = avalon.type(input);
        if (type !== 'array' && type !== 'object') throw 'limitBy只能处理对象或数组';
        //必须是数值
        if (typeof limit !== 'number') {
            return input;
        }
        //不能为NaN
        if (limit !== limit) {
            return input;
        }
        //将目标转换为数组
        if (type === 'object') {
            input = convertArray(input, false);
        }
        var n = input.length;
        limit = Math.floor(Math.min(n, limit));
        begin = typeof begin === 'number' ? begin : 0;
        if (begin < 0) {
            begin = Math.max(0, n + begin);
        }
        var data = [];
        for (var i = begin; i < n; i++) {
            if (data.length === limit) {
                break;
            }
            data.push(input[i]);
        }
        var isArray$$1 = type === 'array';
        if (isArray$$1) {
            return data;
        }
        var target = {};
        return recovery(target, data, function (el) {
            target[el.key] = el.value;
        });
    }

    function recovery(ret, array, callback) {
        for (var i = 0, n = array.length; i < n; i++) {
            callback(array[i]);
        }
        return ret;
    }

    //Chrome谷歌浏览器中js代码Array.sort排序的bug乱序解决办法
    //http://www.cnblogs.com/yzeng/p/3949182.html
    function convertArray(array, isArray$$1) {
        var ret = [],
            i = 0;
        __repeat(array, isArray$$1, function (key) {
            ret[i] = {
                oldIndex: i,
                value: array[key],
                key: key
            };
            i++;
        });
        return ret;
    }

    var eventFilters = {
        stop: function stop(e) {
            e.stopPropagation();
            return e;
        },
        prevent: function prevent(e) {
            e.preventDefault();
            return e;
        }
    };
    var keys = {
        esc: 27,
        tab: 9,
        enter: 13,
        space: 32,
        del: 46,
        up: 38,
        left: 37,
        right: 39,
        down: 40
    };
    for (var name$1 in keys) {
        (function (filter, key) {
            eventFilters[filter] = function (e) {
                if (e.which !== key) {
                    e.$return = true;
                }
                return e;
            };
        })(name$1, keys[name$1]);
    }

    //https://github.com/teppeis/htmlspecialchars
    function escapeFilter(str) {
        if (str == null) return '';

        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    var filters = avalon.filters = {};

    avalon.composeFilters = function () {
        var args = arguments;
        return function (value) {
            for (var i = 0, arr; arr = args[i++];) {
                var name = arr[0];
                var filter = avalon.filters[name];
                if (typeof filter === 'function') {
                    arr[0] = value;
                    try {
                        value = filter.apply(0, arr);
                    } catch (e) {}
                }
            }
            return value;
        };
    };

    avalon.escapeHtml = escapeFilter;

    avalon.mix(filters, {
        uppercase: function uppercase(str) {
            return String(str).toUpperCase();
        },
        lowercase: function lowercase(str) {
            return String(str).toLowerCase();
        },
        truncate: function truncate(str, length, end) {
            //length，新字符串长度，truncation，新字符串的结尾的字段,返回新字符串
            if (!str) {
                return '';
            }
            str = String(str);
            if (isNaN(length)) {
                length = 30;
            }
            end = typeof end === "string" ? end : "...";
            return str.length > length ? str.slice(0, length - end.length) + end : /* istanbul ignore else*/
            str;
        },

        camelize: avalon.camelize,
        date: dateFilter,
        escape: escapeFilter,
        sanitize: sanitizeFilter,
        number: numberFilter,
        currency: function currency(amount, symbol, fractionSize) {
            return (symbol || '\xA5') + numberFilter(amount, isFinite(fractionSize) ? /* istanbul ignore else*/fractionSize : 2);
        }
    }, { filterBy: filterBy, orderBy: orderBy, selectBy: selectBy, limitBy: limitBy }, eventFilters);

    var rcheckedType = /^(?:checkbox|radio)$/;

    /* istanbul ignore next */
    function fixElement(dest, src) {
        if (dest.nodeType !== 1) {
            return;
        }
        var nodeName = dest.nodeName.toLowerCase();

        if (nodeName === "script") {
            if (dest.text !== src.text) {
                dest.type = "noexec";
                dest.text = src.text;
                dest.type = src.type || "";
            }
        } else if (nodeName === 'object') {
            var params = src.childNodes;
            if (dest.childNodes.length !== params.length) {
                avalon.clearHTML(dest);
                for (var i = 0, el; el = params[i++];) {
                    dest.appendChild(el.cloneNode(true));
                }
            }
        } else if (nodeName === 'input' && rcheckedType.test(src.nodeName)) {

            dest.defaultChecked = dest.checked = src.checked;
            if (dest.value !== src.value) {
                dest.value = src.value;
            }
        } else if (nodeName === 'option') {
            dest.defaultSelected = dest.selected = src.defaultSelected;
        } else if (nodeName === 'input' || nodeName === 'textarea') {
            dest.defaultValue = src.defaultValue;
        }
    }

    /* istanbul ignore next */
    function getAll(context) {
        return typeof context.getElementsByTagName !== 'undefined' ? context.getElementsByTagName('*') : typeof context.querySelectorAll !== 'undefined' ? context.querySelectorAll('*') : [];
    }

    /* istanbul ignore next */
    function fixClone(src) {
        var target = src.cloneNode(true);
        //http://www.myexception.cn/web/665613.html
        // target.expando = null
        var t = getAll(target);
        var s = getAll(src);
        for (var i = 0; i < s.length; i++) {
            fixElement(t[i], s[i]);
        }
        return target;
    }

    /* istanbul ignore next */
    function fixContains(root, el) {
        try {
            //IE6-8,游离于DOM树外的文本节点，访问parentNode有时会抛错
            while (el = el.parentNode) {
                if (el === root) return true;
            }
        } catch (e) {}
        return false;
    }

    avalon.contains = fixContains;

    avalon.cloneNode = function (a) {
        return a.cloneNode(true);
    };

    //IE6-11的文档对象没有contains
    /* istanbul ignore next */
    function shimHack() {
        if (msie < 10) {
            avalon.cloneNode = fixClone;
        }
        if (!document$1.contains) {
            document$1.contains = function (b) {
                return fixContains(document$1, b);
            };
        }
        if (avalon.modern) {
            if (!document$1.createTextNode('x').contains) {
                Node.prototype.contains = function (child) {
                    //IE6-8没有Node对象
                    return fixContains(this, child);
                };
            }
        }
        //firefox 到11时才有outerHTML
        function fixFF(prop, cb) {
            if (!(prop in root) && HTMLElement.prototype.__defineGetter__) {
                HTMLElement.prototype.__defineGetter__(prop, cb);
            }
        }
        fixFF('outerHTML', function () {
            var div = document$1.createElement('div');
            div.appendChild(this);
            return div.innerHTML;
        });
        fixFF('children', function () {
            var children = [];
            for (var i = 0, el; el = this.childNodes[i++];) {
                if (el.nodeType === 1) {
                    children.push(el);
                }
            }
            return children;
        });
        fixFF('innerText', function () {
            //firefox45+, chrome4+ http://caniuse.com/#feat=innertext
            return this.textContent;
        });
    }

    if (inBrowser) {
        shimHack();
    }

    function ClassList(node) {
        this.node = node;
    }

    ClassList.prototype = {
        toString: function toString() {
            var node = this.node;
            var cls = node.className;
            var str = typeof cls === 'string' ? cls : cls.baseVal;
            var match = str.match(rnowhite);
            return match ? match.join(' ') : '';
        },
        contains: function contains(cls) {
            return (' ' + this + ' ').indexOf(' ' + cls + ' ') > -1;
        },
        add: function add(cls) {
            if (!this.contains(cls)) {
                this.set(this + ' ' + cls);
            }
        },
        remove: function remove(cls) {
            this.set((' ' + this + ' ').replace(' ' + cls + ' ', ' '));
        },
        set: function set(cls) {
            cls = cls.trim();
            var node = this.node;
            if (typeof node.className === 'object') {
                //SVG元素的className是一个对象 SVGAnimatedString { baseVal='', animVal=''}，只能通过set/getAttribute操作
                node.setAttribute('class', cls);
            } else {
                node.className = cls;
            }
            if (!cls) {
                node.removeAttribute('class');
            }
            //toggle存在版本差异，因此不使用它
        }
    };

    function classListFactory(node) {
        if (!('classList' in node)) {
            node.classList = new ClassList(node);
        }
        return node.classList;
    }

    'add,remove'.replace(rword, function (method) {
        avalon.fn[method + 'Class'] = function (cls) {
            var el = this[0] || {};
            //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
            if (cls && typeof cls === 'string' && el.nodeType === 1) {
                cls.replace(rnowhite, function (c) {
                    classListFactory(el)[method](c);
                });
            }
            return this;
        };
    });

    avalon.shadowCopy(avalon.fn, {
        hasClass: function hasClass(cls) {
            var el = this[0] || {};
            return el.nodeType === 1 && classListFactory(el).contains(cls);
        },
        toggleClass: function toggleClass(value, stateVal) {
            var isBool = typeof stateVal === 'boolean';
            var me = this;
            String(value).replace(rnowhite, function (c) {
                var state = isBool ? stateVal : !me.hasClass(c);
                me[state ? 'addClass' : 'removeClass'](c);
            });
            return this;
        }
    });

    var propMap = { //不规则的属性名映射
        'accept-charset': 'acceptCharset',
        'char': 'ch',
        charoff: 'chOff',
        'class': 'className',
        'for': 'htmlFor',
        'http-equiv': 'httpEquiv'
    };
    /*
    contenteditable不是布尔属性
    http://www.zhangxinxu.com/wordpress/2016/01/contenteditable-plaintext-only/
    contenteditable=''
    contenteditable='events'
    contenteditable='caret'
    contenteditable='plaintext-only'
    contenteditable='true'
    contenteditable='false'
     */
    var bools = ['autofocus,autoplay,async,allowTransparency,checked,controls', 'declare,disabled,defer,defaultChecked,defaultSelected,', 'isMap,loop,multiple,noHref,noResize,noShade', 'open,readOnly,selected'].join(',');

    bools.replace(/\w+/g, function (name) {
        propMap[name.toLowerCase()] = name;
    });

    var anomaly = ['accessKey,bgColor,cellPadding,cellSpacing,codeBase,codeType,colSpan', 'dateTime,defaultValue,contentEditable,frameBorder,longDesc,maxLength,' + 'marginWidth,marginHeight,rowSpan,tabIndex,useMap,vSpace,valueType,vAlign'].join(',');

    anomaly.replace(/\w+/g, function (name) {
        propMap[name.toLowerCase()] = name;
    });

    //module.exports = propMap

    function isVML(src) {
        var nodeName = src.nodeName;
        return nodeName.toLowerCase() === nodeName && !!src.scopeName && src.outerText === '';
    }

    var rvalidchars = /^[\],:{}\s]*$/;
    var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
    var rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g;
    var rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;

    function compactParseJSON(data) {
        if (typeof data === 'string') {
            data = data.trim();
            if (data) {
                if (rvalidchars.test(data.replace(rvalidescape, '@').replace(rvalidtokens, ']').replace(rvalidbraces, ''))) {
                    return new Function('return ' + data)(); // jshint ignore:line
                }
            }
            throw TypeError('Invalid JSON: [' + data + ']');
        }
        return data;
    }

    var rsvg = /^\[object SVG\w*Element\]$/;
    var ramp = /&amp;/g;
    function updateAttrs(node, attrs) {
        for (var attrName in attrs) {
            try {
                var val = attrs[attrName];
                // 处理路径属性
                /* istanbul ignore if*/

                //处理HTML5 data-*属性 SVG
                if (attrName.indexOf('data-') === 0 || rsvg.test(node)) {
                    node.setAttribute(attrName, val);
                } else {
                    var propName = propMap[attrName] || attrName;
                    /* istanbul ignore if */
                    if (typeof node[propName] === 'boolean') {
                        if (propName === 'checked') {
                            node.defaultChecked = !!val;
                        }
                        node[propName] = !!val;
                        //布尔属性必须使用el.xxx = true|false方式设值
                        //如果为false, IE全系列下相当于setAttribute(xxx,''),
                        //会影响到样式,需要进一步处理
                    }

                    if (val === false) {
                        //移除属性
                        node.removeAttribute(propName);
                        continue;
                    }
                    //IE6中classNamme, htmlFor等无法检测它们为内建属性　
                    if (avalon.msie < 8 && /[A-Z]/.test(propName)) {
                        node[propName] = val + '';
                        continue;
                    }
                    //SVG只能使用setAttribute(xxx, yyy), VML只能使用node.xxx = yyy ,
                    //HTML的固有属性必须node.xxx = yyy
                    /* istanbul ignore next */
                    var isInnate = !avalon.modern && isVML(node) ? true : isInnateProps(node.nodeName, attrName);
                    if (isInnate) {
                        if (attrName === 'href' || attrName === 'src') {
                            /* istanbul ignore if */
                            if (avalon.msie < 8) {
                                val = String(val).replace(ramp, '&'); //处理IE67自动转义的问题
                            }
                        }
                        node[propName] = val + '';
                    } else {
                        node.setAttribute(attrName, val);
                    }
                }
            } catch (e) {
                // 对象不支持此属性或方法 src https://github.com/ecomfe/zrender 
                // 未知名称。\/n
                // e.message大概这样,需要trim
                //IE6-8,元素节点不支持其他元素节点的内置属性,如src, href, for
                /* istanbul ignore next */
                avalon.log(String(e.message).trim(), attrName, val);
            }
        }
    }
    var innateMap = {};

    function isInnateProps(nodeName, attrName) {
        var key = nodeName + ":" + attrName;
        if (key in innateMap) {
            return innateMap[key];
        }
        return innateMap[key] = attrName in document$1.createElement(nodeName);
    }
    try {
        avalon.parseJSON = JSON.parse;
    } catch (e) {
        /* istanbul ignore next */
        avalon.parseJSON = compactParseJSON;
    }

    avalon.fn.attr = function (name, value) {
        if (arguments.length === 2) {
            this[0].setAttribute(name, value);
            return this;
        } else {
            return this[0].getAttribute(name);
        }
    };

    var cssMap = {
        'float': 'cssFloat'
    };
    avalon.cssNumber = oneObject('animationIterationCount,columnCount,order,flex,flexGrow,flexShrink,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom');
    var prefixes = ['', '-webkit-', '-o-', '-moz-', '-ms-'];
    /* istanbul ignore next */
    avalon.cssName = function (name, host, camelCase) {
        if (cssMap[name]) {
            return cssMap[name];
        }
        host = host || avalon.root.style || {};
        for (var i = 0, n = prefixes.length; i < n; i++) {
            camelCase = avalon.camelize(prefixes[i] + name);
            if (camelCase in host) {
                return cssMap[name] = camelCase;
            }
        }
        return null;
    };
    /* istanbul ignore next */
    avalon.css = function (node, name, value, fn) {
        //读写删除元素节点的样式
        if (node instanceof avalon) {
            node = node[0];
        }
        if (node.nodeType !== 1) {
            return;
        }
        var prop = avalon.camelize(name);
        name = avalon.cssName(prop) || /* istanbul ignore next*/prop;
        if (value === void 0 || typeof value === 'boolean') {
            //获取样式
            fn = cssHooks[prop + ':get'] || cssHooks['@:get'];
            if (name === 'background') {
                name = 'backgroundColor';
            }
            var val = fn(node, name);
            return value === true ? parseFloat(val) || 0 : val;
        } else if (value === '') {
            //请除样式
            node.style[name] = '';
        } else {
            //设置样式
            if (value == null || value !== value) {
                return;
            }
            if (isFinite(value) && !avalon.cssNumber[prop]) {
                value += 'px';
            }
            fn = cssHooks[prop + ':set'] || cssHooks['@:set'];
            fn(node, name, value);
        }
    };
    /* istanbul ignore next */
    avalon.fn.css = function (name, value) {
        if (avalon.isPlainObject(name)) {
            for (var i in name) {
                avalon.css(this, i, name[i]);
            }
        } else {
            var ret = avalon.css(this, name, value);
        }
        return ret !== void 0 ? ret : this;
    };
    /* istanbul ignore next */
    avalon.fn.position = function () {
        var offsetParent,
            offset,
            elem = this[0],
            parentOffset = {
            top: 0,
            left: 0
        };
        if (!elem) {
            return parentOffset;
        }
        if (this.css('position') === 'fixed') {
            offset = elem.getBoundingClientRect();
        } else {
            offsetParent = this.offsetParent(); //得到真正的offsetParent
            offset = this.offset(); // 得到正确的offsetParent
            if (offsetParent[0].tagName !== 'HTML') {
                parentOffset = offsetParent.offset();
            }
            parentOffset.top += avalon.css(offsetParent[0], 'borderTopWidth', true);
            parentOffset.left += avalon.css(offsetParent[0], 'borderLeftWidth', true);

            // Subtract offsetParent scroll positions
            parentOffset.top -= offsetParent.scrollTop();
            parentOffset.left -= offsetParent.scrollLeft();
        }
        return {
            top: offset.top - parentOffset.top - avalon.css(elem, 'marginTop', true),
            left: offset.left - parentOffset.left - avalon.css(elem, 'marginLeft', true)
        };
    };
    /* istanbul ignore next */
    avalon.fn.offsetParent = function () {
        var offsetParent = this[0].offsetParent;
        while (offsetParent && avalon.css(offsetParent, 'position') === 'static') {
            offsetParent = offsetParent.offsetParent;
        }
        return avalon(offsetParent || avalon.root);
    };

    /* istanbul ignore next */
    cssHooks['@:set'] = function (node, name, value) {
        try {
            //node.style.width = NaN;node.style.width = 'xxxxxxx';
            //node.style.width = undefine 在旧式IE下会抛异常
            node.style[name] = value;
        } catch (e) {}
    };
    /* istanbul ignore next */
    cssHooks['@:get'] = function (node, name) {
        if (!node || !node.style) {
            throw new Error('getComputedStyle要求传入一个节点 ' + node);
        }
        var ret,
            styles = window$1.getComputedStyle(node, null);
        if (styles) {
            ret = name === 'filter' ? styles.getPropertyValue(name) : styles[name];
            if (ret === '') {
                ret = node.style[name]; //其他浏览器需要我们手动取内联样式
            }
        }
        return ret;
    };

    cssHooks['opacity:get'] = function (node) {
        var ret = cssHooks['@:get'](node, 'opacity');
        return ret === '' ? '1' : ret;
    };

    'top,left'.replace(avalon.rword, function (name) {
        cssHooks[name + ':get'] = function (node) {
            var computed = cssHooks['@:get'](node, name);
            return (/px$/.test(computed) ? computed : avalon(node).position()[name] + 'px'
            );
        };
    });

    var cssShow = {
        position: 'absolute',
        visibility: 'hidden',
        display: 'block'
    };

    var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
    /* istanbul ignore next */
    function showHidden(node, array) {
        //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
        if (node.offsetWidth <= 0) {
            //opera.offsetWidth可能小于0
            if (rdisplayswap.test(cssHooks['@:get'](node, 'display'))) {
                var obj = {
                    node: node
                };
                for (var name in cssShow) {
                    obj[name] = node.style[name];
                    node.style[name] = cssShow[name];
                }
                array.push(obj);
            }
            var parent = node.parentNode;
            if (parent && parent.nodeType === 1) {
                showHidden(parent, array);
            }
        }
    }
    /* istanbul ignore next*/
    avalon.each({
        Width: 'width',
        Height: 'height'
    }, function (name, method) {
        var clientProp = 'client' + name,
            scrollProp = 'scroll' + name,
            offsetProp = 'offset' + name;
        cssHooks[method + ':get'] = function (node, which, override) {
            var boxSizing = -4;
            if (typeof override === 'number') {
                boxSizing = override;
            }
            which = name === 'Width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
            var ret = node[offsetProp]; // border-box 0
            if (boxSizing === 2) {
                // margin-box 2
                return ret + avalon.css(node, 'margin' + which[0], true) + avalon.css(node, 'margin' + which[1], true);
            }
            if (boxSizing < 0) {
                // padding-box  -2
                ret = ret - avalon.css(node, 'border' + which[0] + 'Width', true) - avalon.css(node, 'border' + which[1] + 'Width', true);
            }
            if (boxSizing === -4) {
                // content-box -4
                ret = ret - avalon.css(node, 'padding' + which[0], true) - avalon.css(node, 'padding' + which[1], true);
            }
            return ret;
        };
        cssHooks[method + '&get'] = function (node) {
            var hidden = [];
            showHidden(node, hidden);
            var val = cssHooks[method + ':get'](node);
            for (var i = 0, obj; obj = hidden[i++];) {
                node = obj.node;
                for (var n in obj) {
                    if (typeof obj[n] === 'string') {
                        node.style[n] = obj[n];
                    }
                }
            }
            return val;
        };
        avalon.fn[method] = function (value) {
            //会忽视其display
            var node = this[0];
            if (arguments.length === 0) {
                if (node.setTimeout) {
                    //取得窗口尺寸
                    return node['inner' + name] || node.document.documentElement[clientProp] || node.document.body[clientProp]; //IE6下前两个分别为undefined,0
                }
                if (node.nodeType === 9) {
                    //取得页面尺寸
                    var doc = node.documentElement;
                    //FF chrome    html.scrollHeight< body.scrollHeight
                    //IE 标准模式 : html.scrollHeight> body.scrollHeight
                    //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
                    return Math.max(node.body[scrollProp], doc[scrollProp], node.body[offsetProp], doc[offsetProp], doc[clientProp]);
                }
                return cssHooks[method + '&get'](node);
            } else {
                return this.css(method, value);
            }
        };
        avalon.fn['inner' + name] = function () {
            return cssHooks[method + ':get'](this[0], void 0, -2);
        };
        avalon.fn['outer' + name] = function (includeMargin) {
            return cssHooks[method + ':get'](this[0], void 0, includeMargin === true ? 2 : 0);
        };
    });

    function getWindow(node) {
        return node.window || node.defaultView || node.parentWindow || false;
    }

    /* istanbul ignore if */
    if (msie < 9) {
        cssMap['float'] = 'styleFloat';
        var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i;
        var rposition = /^(top|right|bottom|left)$/;
        var ralpha = /alpha\([^)]+\)/i;
        var ropactiy = /(opacity|\d(\d|\.)*)/g;
        var ie8 = msie === 8;
        var salpha = 'DXImageTransform.Microsoft.Alpha';
        var border = {
            thin: ie8 ? '1px' : '2px',
            medium: ie8 ? '3px' : '4px',
            thick: ie8 ? '5px' : '6px'
        };
        cssHooks['@:get'] = function (node, name) {
            //取得精确值，不过它有可能是带em,pc,mm,pt,%等单位
            var currentStyle = node.currentStyle;
            var ret = currentStyle[name];
            if (rnumnonpx.test(ret) && !rposition.test(ret)) {
                //①，保存原有的style.left, runtimeStyle.left,
                var style = node.style,
                    left = style.left,
                    rsLeft = node.runtimeStyle.left;
                //②由于③处的style.left = xxx会影响到currentStyle.left，
                //因此把它currentStyle.left放到runtimeStyle.left，
                //runtimeStyle.left拥有最高优先级，不会style.left影响
                node.runtimeStyle.left = currentStyle.left;
                //③将精确值赋给到style.left，然后通过IE的另一个私有属性 style.pixelLeft
                //得到单位为px的结果；fontSize的分支见http://bugs.jquery.com/ticket/760
                style.left = name === 'fontSize' ? '1em' : ret || 0;
                ret = style.pixelLeft + 'px';
                //④还原 style.left，runtimeStyle.left
                style.left = left;
                node.runtimeStyle.left = rsLeft;
            }
            if (ret === 'medium') {
                name = name.replace('Width', 'Style');
                //border width 默认值为medium，即使其为0'
                if (currentStyle[name] === 'none') {
                    ret = '0px';
                }
            }
            return ret === '' ? 'auto' : border[ret] || ret;
        };
        cssHooks['opacity:set'] = function (node, name, value) {
            var style = node.style;

            var opacity = Number(value) <= 1 ? 'alpha(opacity=' + value * 100 + ')' : '';
            var filter = style.filter || '';
            style.zoom = 1;
            //不能使用以下方式设置透明度
            //node.filters.alpha.opacity = value * 100
            style.filter = (ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + ' ' + opacity).trim();

            if (!style.filter) {
                style.removeAttribute('filter');
            }
        };
        cssHooks['opacity:get'] = function (node) {
            var match = node.style.filter.match(ropactiy) || [];
            var ret = false;
            for (var i = 0, el; el = match[i++];) {
                if (el === 'opacity') {
                    ret = true;
                } else if (ret) {
                    return el / 100 + '';
                }
            }
            return '1'; //确保返回的是字符串
        };
    }

    /* istanbul ignore next */
    avalon.fn.offset = function () {
        //取得距离页面左右角的坐标
        var node = this[0],
            box = {
            left: 0,
            top: 0
        };
        if (!node || !node.tagName || !node.ownerDocument) {
            return box;
        }
        var doc = node.ownerDocument;
        var body = doc.body;
        var root$$1 = doc.documentElement;
        var win = doc.defaultView || doc.parentWindow;
        if (!avalon.contains(root$$1, node)) {
            return box;
        }
        //http://hkom.blog1.fc2.com/?mode=m&no=750 body的偏移量是不包含margin的
        //我们可以通过getBoundingClientRect来获得元素相对于client的rect.
        //http://msdn.microsoft.com/en-us/library/ms536433.aspx
        if (node.getBoundingClientRect) {
            box = node.getBoundingClientRect(); // BlackBerry 5, iOS 3 (original iPhone)
        }
        //chrome/IE6: body.scrollTop, firefox/other: root.scrollTop
        var clientTop = root$$1.clientTop || body.clientTop,
            clientLeft = root$$1.clientLeft || body.clientLeft,
            scrollTop = Math.max(win.pageYOffset || 0, root$$1.scrollTop, body.scrollTop),
            scrollLeft = Math.max(win.pageXOffset || 0, root$$1.scrollLeft, body.scrollLeft);
        // 把滚动距离加到left,top中去。
        // IE一些版本中会自动为HTML元素加上2px的border，我们需要去掉它
        // http://msdn.microsoft.com/en-us/library/ms533564(VS.85).aspx
        return {
            top: box.top + scrollTop - clientTop,
            left: box.left + scrollLeft - clientLeft
        };
    };

    //生成avalon.fn.scrollLeft, avalon.fn.scrollTop方法
    /* istanbul ignore next */
    avalon.each({
        scrollLeft: 'pageXOffset',
        scrollTop: 'pageYOffset'
    }, function (method, prop) {
        avalon.fn[method] = function (val) {
            var node = this[0] || {};
            var win = getWindow(node);
            var root$$1 = avalon.root;
            var top = method === 'scrollTop';
            if (!arguments.length) {
                return win ? prop in win ? win[prop] : root$$1[method] : node[method];
            } else {
                if (win) {
                    win.scrollTo(!top ? val : avalon(win).scrollLeft(), top ? val : avalon(win).scrollTop());
                } else {
                    node[method] = val;
                }
            }
        };
    });

    function getDuplexType(elem) {
        var ret = elem.tagName.toLowerCase();
        if (ret === 'input') {
            return rcheckedType.test(elem.type) ? 'checked' : elem.type;
        }
        return ret;
    }

    /**
     * IE6/7/8中，如果option没有value值，那么将返回空字符串。
     * IE9/Firefox/Safari/Chrome/Opera 中先取option的value值，如果没有value属性，则取option的innerText值。
     * IE11及W3C，如果没有指定value，那么node.value默认为node.text（存在trim作），但IE9-10则是取innerHTML(没trim操作)
     */

    function getOption(node) {
        if (node.hasAttribute && node.hasAttribute('value')) {
            return node.getAttribute('value');
        }
        var attr = node.getAttributeNode('value');
        if (attr && attr.specified) {
            return attr.value;
        }
        return node.innerHTML.trim();
    }

    var valHooks = {
        'option:get': msie ? getOption : function (node) {
            return node.value;
        },
        'select:get': function selectGet(node, value) {
            var option,
                options = node.options,
                index = node.selectedIndex,
                getter = valHooks['option:get'],
                one = node.type === 'select-one' || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0;
            for (; i < max; i++) {
                option = options[i];
                //IE6-9在reset后不会改变selected，需要改用i === index判定
                //我们过滤所有disabled的option元素，但在safari5下，
                //如果设置optgroup为disable，那么其所有孩子都disable
                //因此当一个元素为disable，需要检测其是否显式设置了disable及其父节点的disable情况
                if ((option.selected || i === index) && !option.disabled && (!option.parentNode.disabled || option.parentNode.tagName !== 'OPTGROUP')) {
                    value = getter(option);
                    if (one) {
                        return value;
                    }
                    //收集所有selected值组成数组返回
                    values.push(value);
                }
            }
            return values;
        },
        'select:set': function selectSet(node, values, optionSet) {
            values = [].concat(values); //强制转换为数组
            var getter = valHooks['option:get'];
            for (var i = 0, el; el = node.options[i++];) {
                if (el.selected = values.indexOf(getter(el)) > -1) {
                    optionSet = true;
                }
            }
            if (!optionSet) {
                node.selectedIndex = -1;
            }
        }
    };

    avalon.fn.val = function (value) {
        var node = this[0];
        if (node && node.nodeType === 1) {
            var get = arguments.length === 0;
            var access = get ? ':get' : ':set';
            var fn = valHooks[getDuplexType(node) + access];
            if (fn) {
                var val = fn(node, value);
            } else if (get) {
                return (node.value || '').replace(/\r/g, '');
            } else {
                node.value = value;
            }
        }
        return get ? val : this;
    };

    /* 
     * 将要检测的字符串的字符串替换成??123这样的格式
     */
    var stringNum = 0;
    var stringPool = {
        map: {}
    };
    var rfill = /\?\?\d+/g;
    function dig(a) {
        var key = '??' + stringNum++;
        stringPool.map[key] = a;
        return key + ' ';
    }
    function fill(a) {
        var val = stringPool.map[a];
        return val;
    }
    function clearString(str) {
        var array = readString(str);
        for (var i = 0, n = array.length; i < n; i++) {
            str = str.replace(array[i], dig);
        }
        return str;
    }

    function readString(str) {
        var end,
            s = 0;
        var ret = [];
        for (var i = 0, n = str.length; i < n; i++) {
            var c = str.charAt(i);
            if (!end) {
                if (c === "'") {
                    end = "'";
                    s = i;
                } else if (c === '"') {
                    end = '"';
                    s = i;
                }
            } else {
                if (c === end) {
                    ret.push(str.slice(s, i + 1));
                    end = false;
                }
            }
        }
        return ret;
    }

    var voidTag = {
        area: 1,
        base: 1,
        basefont: 1,
        bgsound: 1,
        br: 1,
        col: 1,
        command: 1,
        embed: 1,
        frame: 1,
        hr: 1,
        img: 1,
        input: 1,
        keygen: 1,
        link: 1,
        meta: 1,
        param: 1,
        source: 1,
        track: 1,
        wbr: 1
    };

    var orphanTag = {
        script: 1,
        style: 1,
        textarea: 1,
        xmp: 1,
        noscript: 1,
        template: 1
    };

    /* 
     *  此模块只用于文本转虚拟DOM, 
     *  因为在真实浏览器会对我们的HTML做更多处理,
     *  如, 添加额外属性, 改变结构
     *  此模块就是用于模拟这些行为
     */
    function makeOrphan(node, nodeName, innerHTML) {
        switch (nodeName) {
            case 'style':
            case 'script':
            case 'noscript':
            case 'template':
            case 'xmp':
                node.children = [{
                    nodeName: '#text',
                    nodeValue: innerHTML
                }];
                break;
            case 'textarea':
                var props = node.props;
                props.type = nodeName;
                props.value = innerHTML;
                node.children = [{
                    nodeName: '#text',
                    nodeValue: innerHTML
                }];
                break;
            case 'option':
                node.children = [{
                    nodeName: '#text',
                    nodeValue: trimHTML(innerHTML)
                }];
                break;
        }
    }

    //专门用于处理option标签里面的标签
    var rtrimHTML = /<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi;
    function trimHTML(v) {
        return String(v).replace(rtrimHTML, '').trim();
    }

    //widget rule duplex validate

    //如果直接将tr元素写table下面,那么浏览器将将它们(相邻的那几个),放到一个动态创建的tbody底下
    function makeTbody(nodes) {
        var tbody,
            needAddTbody = false,
            count = 0,
            start = 0,
            n = nodes.length;
        for (var i = 0; i < n; i++) {
            var node = nodes[i];
            if (!tbody) {
                if (node.nodeName === 'tr') {
                    //收集tr及tr两旁的注释节点
                    tbody = {
                        nodeName: 'tbody',
                        props: {},
                        children: []
                    };
                    tbody.children.push(node);
                    needAddTbody = true;
                    if (start === 0) start = i;
                    nodes[i] = tbody;
                }
            } else {
                if (node.nodeName !== 'tr' && node.children) {
                    tbody = false;
                } else {
                    tbody.children.push(node);
                    count++;
                    nodes[i] = 0;
                }
            }
        }

        if (needAddTbody) {
            for (i = start; i < n; i++) {
                if (nodes[i] === 0) {
                    nodes.splice(i, 1);
                    i--;
                    count--;
                    if (count === 0) {
                        break;
                    }
                }
            }
        }
    }

    function validateDOMNesting(parent, child) {

        var parentTag = parent.nodeName;
        var tag = child.nodeName;
        var parentChild = nestObject[parentTag];
        if (parentChild) {
            if (parentTag === 'p') {
                if (pNestChild[tag]) {
                    avalon.warn('P element can not  add these childlren:\n' + Object.keys(pNestChild));
                    return false;
                }
            } else if (!parentChild[tag]) {
                avalon.warn(parentTag.toUpperCase() + 'element only add these children:\n' + Object.keys(parentChild) + '\nbut you add ' + tag.toUpperCase() + ' !!');
                return false;
            }
        }
        return true;
    }

    function makeObject(str) {
        return oneObject(str + ',template,#document-fragment,#comment');
    }
    var pNestChild = oneObject('div,ul,ol,dl,table,h1,h2,h3,h4,h5,h6,form,fieldset');
    var tNestChild = makeObject('tr,style,script');
    var nestObject = {
        p: pNestChild,
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
        select: makeObject('option,optgroup,#text'),
        optgroup: makeObject('option,#text'),
        option: makeObject('#text'),
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
        // No special behavior since these rules fall back to "in body" mode for
        // all except special table nodes which cause bad parsing behavior anyway.

        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intr
        tr: makeObject('th,td,style,script'),

        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
        tbody: tNestChild,
        tfoot: tNestChild,
        thead: tNestChild,
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
        colgroup: makeObject('col'),
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
        // table: oneObject('caption,colgroup,tbody,thead,tfoot,style,script,template,#document-fragment'),
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
        head: makeObject('base,basefont,bgsound,link,style,script,meta,title,noscript,noframes'),
        // https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
        html: oneObject('head,body')
    };

    /**
     * ------------------------------------------------------------
     * avalon2.1.1的新式lexer
     * 将字符串变成一个虚拟DOM树,方便以后进一步变成模板函数
     * 此阶段只会生成VElement,VText,VComment
     * ------------------------------------------------------------
     */
    function nomalString(str) {
        return avalon.unescapeHTML(str.replace(rfill, fill));
    }
    //https://github.com/rviscomi/trunk8/blob/master/trunk8.js

    var ropenTag = /^<([-A-Za-z0-9_]+)\s*([^>]*?)(\/?)>/;
    var rendTag = /^<\/([^>]+)>/;
    var rtagStart = /[\!\/a-z]/i; //闭标签的第一个字符,开标签的第一个英文,注释节点的!
    var rlineSp = /\\n\s*/g;
    var rattrs = /([^=\s]+)(?:\s*=\s*(\S+))?/;

    var rcontent = /\S/; //判定里面有没有内容
    function fromString(str) {
        return from(str);
    }
    avalon.lexer = fromString;

    var strCache = new Cache(100);

    function AST() {}
    AST.prototype = {
        init: function init(str) {
            this.ret = [];
            var stack = [];
            stack.last = function () {
                return stack[stack.length - 1];
            };
            this.stack = stack;
            this.str = str;
        },
        gen: function gen() {
            var breakIndex = 999999;
            do {
                this.tryGenText();
                this.tryGenComment();
                this.tryGenOpenTag();
                this.tryGenCloseTag();
                var node = this.node;
                this.node = 0;
                if (!node || --breakIndex === 0) {
                    break;
                }
                if (node.end) {
                    if (node.nodeName === 'table') {
                        makeTbody(node.children);
                    }
                    delete node.end;
                }
            } while (this.str.length);
            return this.ret;
        },

        fixPos: function fixPos(str, i) {
            var tryCount = str.length - i;
            while (tryCount--) {
                if (!rtagStart.test(str.charAt(i + 1))) {
                    i = str.indexOf('<', i + 1);
                } else {
                    break;
                }
            }
            if (tryCount === 0) {
                i = str.length;
            }
            return i;
        },
        tryGenText: function tryGenText() {
            var str = this.str;
            if (str.charAt(0) !== '<') {
                //处理文本节点
                var i = str.indexOf('<');
                if (i === -1) {
                    i = str.length;
                } else if (!rtagStart.test(str.charAt(i + 1))) {
                    //处理`内容2 {{ (idx1 < < <  1 ? 'red' : 'blue' ) + a }} ` 的情况 
                    i = this.fixPos(str, i);
                }
                var nodeValue = str.slice(0, i).replace(rfill, fill);
                this.str = str.slice(i);
                this.node = {
                    nodeName: '#text',
                    nodeValue: nodeValue
                };
                if (rcontent.test(nodeValue)) {
                    this.tryGenChildren(); //不收集空白节点
                }
            }
        },
        tryGenComment: function tryGenComment() {
            if (!this.node) {
                var str = this.str;
                var i = str.indexOf('<!--'); //处理注释节点
                /* istanbul ignore if*/
                if (i === 0) {
                    var l = str.indexOf('-->');
                    if (l === -1) {
                        avalon.error('注释节点没有闭合' + str);
                    }
                    var nodeValue = str.slice(4, l).replace(rfill, fill);
                    this.str = str.slice(l + 3);
                    this.node = {
                        nodeName: '#comment',
                        nodeValue: nodeValue
                    };
                    this.tryGenChildren();
                }
            }
        },
        tryGenOpenTag: function tryGenOpenTag() {
            if (!this.node) {
                var str = this.str;
                var match = str.match(ropenTag); //处理元素节点开始部分
                if (match) {
                    var nodeName = match[1];
                    var props = {};
                    if (/^[A-Z]/.test(nodeName) && avalon.components[nodeName]) {
                        props.is = nodeName;
                    }
                    nodeName = nodeName.toLowerCase();
                    var isVoidTag = !!voidTag[nodeName] || match[3] === '\/';
                    var node = this.node = {
                        nodeName: nodeName,
                        props: {},
                        children: [],
                        isVoidTag: isVoidTag
                    };
                    var attrs = match[2];
                    if (attrs) {
                        this.genProps(attrs, node.props);
                    }
                    this.tryGenChildren();
                    str = str.slice(match[0].length);
                    if (isVoidTag) {
                        node.end = true;
                    } else {
                        this.stack.push(node);
                        if (orphanTag[nodeName] || nodeName === 'option') {
                            var index = str.indexOf('</' + nodeName + '>');
                            var innerHTML = str.slice(0, index).trim();
                            str = str.slice(index);
                            makeOrphan(node, nodeName, nomalString(innerHTML));
                        }
                    }
                    this.str = str;
                }
            }
        },
        tryGenCloseTag: function tryGenCloseTag() {
            if (!this.node) {
                var str = this.str;
                var match = str.match(rendTag); //处理元素节点结束部分
                if (match) {
                    var nodeName = match[1].toLowerCase();
                    var last = this.stack.last();
                    /* istanbul ignore if*/
                    if (!last) {
                        avalon.error(match[0] + '前面缺少<' + nodeName + '>');
                        /* istanbul ignore else*/
                    } else if (last.nodeName !== nodeName) {
                        var errMsg = last.nodeName + '没有闭合,请注意属性的引号';
                        avalon.warn(errMsg);
                        avalon.error(errMsg);
                    }
                    var node = this.stack.pop();
                    node.end = true;
                    this.node = node;
                    this.str = str.slice(match[0].length);
                }
            }
        },
        tryGenChildren: function tryGenChildren() {
            var node = this.node;
            var p = this.stack.last();
            if (p) {
                validateDOMNesting(p, node);
                p.children.push(node);
            } else {
                this.ret.push(node);
            }
        },
        genProps: function genProps(attrs, props) {

            while (attrs) {
                var arr = rattrs.exec(attrs);

                if (arr) {
                    var name = arr[1];
                    var value = arr[2] || '';
                    attrs = attrs.replace(arr[0], '');
                    if (value) {
                        //https://github.com/RubyLouvre/avalon/issues/1844
                        if (value.indexOf('??') === 0) {
                            value = nomalString(value).replace(rlineSp, '').slice(1, -1);
                        }
                    }
                    if (!(name in props)) {
                        props[name] = value;
                    }
                } else {
                    break;
                }
            }
        }
    };

    var vdomAst = new AST();

    function from(str) {
        var cacheKey = str;
        var cached = strCache.get(cacheKey);
        if (cached) {
            return avalon.mix(true, [], cached);
        }
        stringPool.map = {};
        str = clearString(str);

        vdomAst.init(str);
        var ret = vdomAst.gen();
        strCache.put(cacheKey, avalon.mix(true, [], ret));
        return ret;
    }

    var rhtml = /<|&#?\w+;/;
    var htmlCache = new Cache(128);
    var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;

    avalon.parseHTML = function (html) {
        var fragment = createFragment();
        //处理非字符串
        if (typeof html !== 'string') {
            return fragment;
        }
        //处理非HTML字符串
        if (!rhtml.test(html)) {
            return document$1.createTextNode(html);
        }

        html = html.replace(rxhtml, '<$1></$2>').trim();
        var hasCache = htmlCache.get(html);
        if (hasCache) {
            return avalon.cloneNode(hasCache);
        }
        var vnodes = fromString(html);
        for (var i = 0, el; el = vnodes[i++];) {
            var child = avalon.vdom(el, 'toDOM');
            fragment.appendChild(child);
        }
        if (html.length < 1024) {
            htmlCache.put(html, fragment);
        }
        return fragment;
    };

    avalon.innerHTML = function (node, html) {
        var parsed = avalon.parseHTML(html);
        this.clearHTML(node);
        node.appendChild(parsed);
    };

    //https://github.com/karloespiritu/escapehtmlent/blob/master/index.js
    avalon.unescapeHTML = function (html) {
        return String(html).replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    };

    avalon.clearHTML = function (node) {
        /* istanbul ignore next */
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
        return node;
    };

    //http://www.feiesoft.com/html/events.html
    //http://segmentfault.com/q/1010000000687977/a-1020000000688757
    var canBubbleUp = {
        click: true,
        dblclick: true,
        keydown: true,
        keypress: true,
        keyup: true,
        mousedown: true,
        mousemove: true,
        mouseup: true,
        mouseover: true,
        mouseout: true,
        wheel: true,
        mousewheel: true,
        input: true,
        change: true,
        beforeinput: true,
        compositionstart: true,
        compositionupdate: true,
        compositionend: true,
        select: true,
        //http://blog.csdn.net/lee_magnum/article/details/17761441
        cut: true,
        copy: true,
        paste: true,
        beforecut: true,
        beforecopy: true,
        beforepaste: true,
        focusin: true,
        focusout: true,
        DOMFocusIn: true,
        DOMFocusOut: true,
        DOMActivate: true,
        dragend: true,
        datasetchanged: true
    };

    /* istanbul ignore if */
    var hackSafari = avalon.modern && document$1.ontouchstart;

    //添加fn.bind, fn.unbind, bind, unbind
    avalon.fn.bind = function (type, fn, phase) {
        if (this[0]) {
            //此方法不会链
            return avalon.bind(this[0], type, fn, phase);
        }
    };

    avalon.fn.unbind = function (type, fn, phase) {
        if (this[0]) {
            var args = _slice.call(arguments);
            args.unshift(this[0]);
            avalon.unbind.apply(0, args);
        }
        return this;
    };

    /*绑定事件*/
    avalon.bind = function (elem, type, fn) {
        if (elem.nodeType === 1) {
            var value = elem.getAttribute('avalon-events') || '';
            //如果是使用ms-on-*绑定的回调,其uuid格式为e12122324,
            //如果是使用bind方法绑定的回调,其uuid格式为_12
            var uuid = getShortID(fn);
            var hook = eventHooks[type];
            /* istanbul ignore if */
            if (type === 'click' && hackSafari) {
                elem.addEventListener('click', avalon.noop);
            }
            /* istanbul ignore if */
            if (hook) {
                type = hook.type || type;
                if (hook.fix) {
                    fn = hook.fix(elem, fn);
                    fn.uuid = uuid;
                }
            }
            var key = type + ':' + uuid;
            avalon.eventListeners[fn.uuid] = fn;
            /* istanbul ignore if */
            if (value.indexOf(type + ':') === -1) {
                //同一种事件只绑定一次
                if (canBubbleUp[type] || avalon.modern && focusBlur[type]) {
                    delegateEvent(type);
                } else {
                    avalon._nativeBind(elem, type, dispatch);
                }
            }
            var keys = value.split(',');
            /* istanbul ignore if */
            if (keys[0] === '') {
                keys.shift();
            }
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                setEventId(elem, keys.join(','));
                //将令牌放进avalon-events属性中
            }
            return fn;
        } else {
            /* istanbul ignore next */
            var cb = function cb(e) {
                fn.call(elem, new avEvent(e));
            };

            avalon._nativeBind(elem, type, cb);
            return cb;
        }
    };

    function setEventId(node, value) {
        node.setAttribute('avalon-events', value);
    }
    /* istanbul ignore next */
    avalon.unbind = function (elem, type, fn) {
        if (elem.nodeType === 1) {
            var value = elem.getAttribute('avalon-events') || '';
            switch (arguments.length) {
                case 1:
                    avalon._nativeUnBind(elem, type, dispatch);
                    elem.removeAttribute('avalon-events');
                    break;
                case 2:
                    value = value.split(',').filter(function (str) {
                        return str.indexOf(type + ':') === -1;
                    }).join(',');
                    setEventId(elem, value);
                    break;
                default:
                    var search = type + ':' + fn.uuid;
                    value = value.split(',').filter(function (str) {
                        return str !== search;
                    }).join(',');
                    setEventId(elem, value);
                    delete avalon.eventListeners[fn.uuid];
                    break;
            }
        } else {
            avalon._nativeUnBind(elem, type, fn);
        }
    };

    var typeRegExp = {};

    function collectHandlers(elem, type, handlers) {
        var value = elem.getAttribute('avalon-events');
        if (value && (elem.disabled !== true || type !== 'click')) {
            var uuids = [];
            var reg = typeRegExp[type] || (typeRegExp[type] = new RegExp("\\b" + type + '\\:([^,\\s]+)', 'g'));
            value.replace(reg, function (a, b) {
                uuids.push(b);
                return a;
            });
            if (uuids.length) {
                handlers.push({
                    elem: elem,
                    uuids: uuids
                });
            }
        }
        elem = elem.parentNode;
        var g = avalon.gestureEvents || {};
        if (elem && elem.getAttribute && (canBubbleUp[type] || g[type])) {
            collectHandlers(elem, type, handlers);
        }
    }

    var rhandleHasVm = /^e/;

    function dispatch(event) {
        event = new avEvent(event);
        var type = event.type;
        var elem = event.target;
        var handlers = [];
        collectHandlers(elem, type, handlers);
        var i = 0,
            j,
            uuid,
            handler;
        while ((handler = handlers[i++]) && !event.cancelBubble) {
            var host = event.currentTarget = handler.elem;
            j = 0;
            while (uuid = handler.uuids[j++]) {
                if (event.stopImmediate) {
                    break;
                }
                var fn = avalon.eventListeners[uuid];
                if (fn) {
                    var vm = rhandleHasVm.test(uuid) ? handler.elem._ms_context_ : 0;
                    if (vm && vm.$hashcode === false) {
                        return avalon.unbind(elem, type, fn);
                    }
                    var ret = fn.call(vm || elem, event);

                    if (ret === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        }
    }

    var focusBlur = {
        focus: true,
        blur: true
    };

    function delegateEvent(type) {
        var value = root.getAttribute('delegate-events') || '';
        if (value.indexOf(type) === -1) {
            //IE6-8会多次绑定同种类型的同一个函数,其他游览器不会
            var arr = value.match(avalon.rword) || [];
            arr.push(type);
            root.setAttribute('delegate-events', arr.join(','));
            avalon._nativeBind(root, type, dispatch, !!focusBlur[type]);
        }
    }

    var eventProto = {
        webkitMovementY: 1,
        webkitMovementX: 1,
        keyLocation: 1,
        fixEvent: function fixEvent() {},
        preventDefault: function preventDefault() {
            var e = this.originalEvent || {};
            e.returnValue = this.returnValue = false;
            if (modern && e.preventDefault) {
                e.preventDefault();
            }
        },
        stopPropagation: function stopPropagation() {
            var e = this.originalEvent || {};
            e.cancelBubble = this.cancelBubble = true;
            if (modern && e.stopPropagation) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function stopImmediatePropagation() {
            this.stopPropagation();
            this.stopImmediate = true;
        },
        toString: function toString() {
            return '[object Event]'; //#1619
        }
    };

    function avEvent(event) {
        if (event.originalEvent) {
            return event;
        }
        for (var i in event) {
            if (!eventProto[i]) {
                this[i] = event[i];
            }
        }
        if (!this.target) {
            this.target = event.srcElement;
        }
        var target = this.target;
        this.fixEvent();
        this.timeStamp = new Date() - 0;
        this.originalEvent = event;
    }
    avEvent.prototype = eventProto;
    //针对firefox, chrome修正mouseenter, mouseleave
    /* istanbul ignore if */
    if (!('onmouseenter' in root)) {
        avalon.each({
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
        }, function (origType, fixType) {
            eventHooks[origType] = {
                type: fixType,
                fix: function fix(elem, fn) {
                    return function (e) {
                        var t = e.relatedTarget;
                        if (!t || t !== elem && !(elem.compareDocumentPosition(t) & 16)) {
                            delete e.type;
                            e.type = origType;
                            return fn.apply(this, arguments);
                        }
                    };
                }
            };
        });
    }
    //针对IE9+, w3c修正animationend
    avalon.each({
        AnimationEvent: 'animationend',
        WebKitAnimationEvent: 'webkitAnimationEnd'
    }, function (construct, fixType) {
        if (window$1[construct] && !eventHooks.animationend) {
            eventHooks.animationend = {
                type: fixType
            };
        }
    });

    /* istanbul ignore if */
    if (!("onmousewheel" in document$1)) {
        /* IE6-11 chrome mousewheel wheelDetla 下 -120 上 120
         firefox DOMMouseScroll detail 下3 上-3
         firefox wheel detlaY 下3 上-3
         IE9-11 wheel deltaY 下40 上-40
         chrome wheel deltaY 下100 上-100 */
        var fixWheelType = document$1.onwheel !== void 0 ? 'wheel' : 'DOMMouseScroll';
        var fixWheelDelta = fixWheelType === 'wheel' ? 'deltaY' : 'detail';
        eventHooks.mousewheel = {
            type: fixWheelType,
            fix: function fix(elem, fn) {
                return function (e) {
                    var delta = e[fixWheelDelta] > 0 ? -120 : 120;
                    e.wheelDelta = ~~elem._ms_wheel_ + delta;
                    elem._ms_wheel_ = e.wheelDeltaY = e.wheelDelta;
                    e.wheelDeltaX = 0;
                    if (Object.defineProperty) {
                        Object.defineProperty(e, 'type', {
                            value: 'mousewheel'
                        });
                    }
                    return fn.apply(this, arguments);
                };
            }
        };
    }

    /* istanbul ignore if */
    if (!modern) {
        delete canBubbleUp.change;
        delete canBubbleUp.select;
    }
    /* istanbul ignore next */
    avalon._nativeBind = modern ? function (el, type, fn, capture) {
        el.addEventListener(type, fn, !!capture);
    } : function (el, type, fn) {
        el.attachEvent('on' + type, fn);
    };
    /* istanbul ignore next */
    avalon._nativeUnBind = modern ? function (el, type, fn, a) {
        el.removeEventListener(type, fn, !!a);
    } : function (el, type, fn) {
        el.detachEvent('on' + type, fn);
    };
    /* istanbul ignore next */
    avalon.fireDom = function (elem, type, opts) {
        if (document$1.createEvent) {
            var hackEvent = document$1.createEvent('Events');
            hackEvent.initEvent(type, true, true, opts);
            avalon.shadowCopy(hackEvent, opts);
            elem.dispatchEvent(hackEvent);
        } else if (root.contains(elem)) {
            //IE6-8触发事件必须保证在DOM树中,否则报'SCRIPT16389: 未指明的错误'
            hackEvent = document$1.createEventObject();
            if (opts) avalon.shadowCopy(hackEvent, opts);
            try {
                elem.fireEvent('on' + type, hackEvent);
            } catch (e) {
                avalon.log('fireDom', type, 'args error');
            }
        }
    };

    var rmouseEvent = /^(?:mouse|contextmenu|drag)|click/;
    /* istanbul ignore next */
    avEvent.prototype.fixEvent = function () {
        var event = this;
        if (event.which == null && event.type.indexOf('key') === 0) {
            event.which = event.charCode != null ? event.charCode : event.keyCode;
        }
        if (rmouseEvent.test(event.type) && !('pageX' in event)) {
            var DOC = event.target.ownerDocument || document$1;
            var box = DOC.compatMode === 'BackCompat' ? DOC.body : DOC.documentElement;
            event.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0);
            event.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0);
            event.wheelDeltaY = ~~event.wheelDelta;
            event.wheelDeltaX = 0;
        }
    };

    //针对IE6-8修正input
    /* istanbul ignore if */
    if (!('oninput' in document$1.createElement('input'))) {
        eventHooks.input = {
            type: 'propertychange',
            fix: function fix(elem, fn) {
                return function (e) {
                    if (e.propertyName === 'value') {
                        e.type = 'input';
                        return fn.apply(this, arguments);
                    }
                };
            }
        };
    }

    var readyList = [];

    function fireReady(fn) {
        avalon.isReady = true;
        while (fn = readyList.shift()) {
            fn(avalon);
        }
    }

    avalon.ready = function (fn) {
        readyList.push(fn);
        if (avalon.isReady) {
            fireReady();
        }
    };

    avalon.ready(function () {
        avalon.scan && avalon.scan(document$1.body);
    });

    /* istanbul ignore next */
    function bootstrap() {
        function doScrollCheck() {
            try {
                //IE下通过doScrollCheck检测DOM树是否建完
                root.doScroll('left');
                fireReady();
            } catch (e) {
                setTimeout(doScrollCheck);
            }
        }
        if (document$1.readyState === 'complete') {
            setTimeout(fireReady); //如果在domReady之外加载
        } else if (document$1.addEventListener) {
            document$1.addEventListener('DOMContentLoaded', fireReady, false);
        } else if (document$1.attachEvent) {
            //必须传入三个参数，否则在firefox4-26中报错
            //caught exception: [Exception... "Not enough arguments"  nsresult: "0x
            document$1.attachEvent('onreadystatechange', function () {
                if (document$1.readyState === 'complete') {
                    fireReady();
                }
            });
            try {
                var isTop = window$1.frameElement === null;
            } catch (e) {}
            if (root.doScroll && isTop && window$1.external) {
                //fix IE iframe BUG
                doScrollCheck();
            }
        }

        avalon.bind(window$1, 'load', fireReady);
    }
    if (inBrowser) {
        bootstrap();
    }

    /**
     * ------------------------------------------------------------
     *                          DOM Api
     * shim,class,data,css,val,html,event,ready  
     * ------------------------------------------------------------
     */

    function fromDOM(dom) {
        return [from$1(dom)];
    }

    function from$1(node) {
        var type = node.nodeName.toLowerCase();
        switch (type) {
            case '#text':
            case '#comment':
                return {
                    nodeName: type,
                    dom: node,
                    nodeValue: node.nodeValue
                };
            default:
                var props = markProps(node, node.attributes || []);
                var vnode = {
                    nodeName: type,
                    dom: node,
                    isVoidTag: !!voidTag[type],
                    props: props
                };
                if (type === 'option') {
                    //即便你设置了option.selected = true,
                    //option.attributes也找不到selected属性
                    props.selected = node.selected;
                }
                if (orphanTag[type] || type === 'option') {
                    makeOrphan(vnode, type, node.text || node.innerHTML);
                    if (node.childNodes.length === 1) {
                        vnode.children[0].dom = node.firstChild;
                    }
                } else if (!vnode.isVoidTag) {
                    vnode.children = [];
                    for (var i = 0, el; el = node.childNodes[i++];) {
                        var child = from$1(el);
                        if (/\S/.test(child.nodeValue)) {
                            vnode.children.push(child);
                        }
                    }
                }
                return vnode;
        }
    }

    var rformElement = /input|textarea|select/i;

    function markProps(node, attrs) {
        var ret = {};
        for (var i = 0, n = attrs.length; i < n; i++) {
            var attr = attrs[i];
            if (attr.specified) {
                //IE6-9不会将属性名变小写,比如它会将用户的contenteditable变成contentEditable
                ret[attr.name.toLowerCase()] = attr.value;
            }
        }
        if (rformElement.test(node.nodeName)) {
            ret.type = node.type;
            var a = node.getAttributeNode('value');
            if (a && /\S/.test(a.value)) {
                //IE6,7中无法取得checkbox,radio的value
                ret.value = a.value;
            }
        }
        var style = node.style.cssText;
        if (style) {
            ret.style = style;
        }
        //类名 = 去重(静态类名+动态类名+ hover类名? + active类名)
        if (ret.type === 'select-one') {
            ret.selectedIndex = node.selectedIndex;
        }
        return ret;
    }

    function VText(text) {
        this.nodeName = '#text';
        this.nodeValue = text;
    }

    VText.prototype = {
        constructor: VText,
        toDOM: function toDOM() {
            /* istanbul ignore if*/
            if (this.dom) return this.dom;
            var v = avalon._decode(this.nodeValue);
            return this.dom = document$1.createTextNode(v);
        },
        toHTML: function toHTML() {
            return this.nodeValue;
        }
    };

    function VComment(text) {
        this.nodeName = '#comment';
        this.nodeValue = text;
    }
    VComment.prototype = {
        constructor: VComment,
        toDOM: function toDOM() {
            if (this.dom) return this.dom;
            return this.dom = document$1.createComment(this.nodeValue);
        },
        toHTML: function toHTML() {
            return '<!--' + this.nodeValue + '-->';
        }
    };

    function VElement(type, props, children, isVoidTag) {
        this.nodeName = type;
        this.props = props;
        this.children = children;
        this.isVoidTag = isVoidTag;
    }
    VElement.prototype = {
        constructor: VElement,
        toDOM: function toDOM() {
            if (this.dom) return this.dom;
            var dom,
                tagName = this.nodeName;
            if (avalon.modern && svgTags[tagName]) {
                dom = createSVG(tagName);
                /* istanbul ignore next*/
            } else if (!avalon.modern && (VMLTags[tagName] || rvml.test(tagName))) {
                dom = createVML(tagName);
            } else {
                dom = document$1.createElement(tagName);
            }

            var props = this.props || {};

            for (var i in props) {
                var val = props[i];
                if (skipFalseAndFunction(val)) {
                    /* istanbul ignore if*/
                    if (specalAttrs[i] && avalon.msie < 8) {
                        specalAttrs[i](dom, val);
                    } else {
                        dom.setAttribute(i, val + '');
                    }
                }
            }
            var c = this.children || [];
            var template = c[0] ? c[0].nodeValue : '';
            switch (this.nodeName) {
                case 'script':
                    dom.type = 'noexec';
                    dom.text = template;
                    try {
                        dom.innerHTML = template;
                    } catch (e) {}
                    dom.type = props.type || '';
                    break;
                case 'noscript':
                    dom.textContent = template;
                case 'style':
                case 'xmp':
                case 'template':
                    try {
                        dom.innerHTML = template;
                    } catch (e) {
                        /* istanbul ignore next*/
                        hackIE(dom, this.nodeName, template);
                    }
                    break;
                case 'option':
                    //IE6-8,为option添加文本子节点,不会同步到text属性中
                    /* istanbul ignore next */
                    if (msie < 9) dom.text = template;
                default:
                    /* istanbul ignore next */
                    if (!this.isVoidTag && this.children) {
                        this.children.forEach(function (el) {
                            return c && dom.appendChild(avalon.vdom(c, 'toDOM'));
                        });
                    }
                    break;
            }
            return this.dom = dom;
        },

        /* istanbul ignore next */

        toHTML: function toHTML() {
            var arr = [];
            var props = this.props || {};
            for (var i in props) {
                var val = props[i];
                if (skipFalseAndFunction(val)) {
                    arr.push(i + '=' + avalon.quote(props[i] + ''));
                }
            }
            arr = arr.length ? ' ' + arr.join(' ') : '';
            var str = '<' + this.nodeName + arr;
            if (this.isVoidTag) {
                return str + '/>';
            }
            str += '>';
            if (this.children) {
                str += this.children.map(function (el) {
                    return el ? avalon.vdom(el, 'toHTML') : '';
                }).join('');
            }
            return str + '</' + this.nodeName + '>';
        }
    };
    function hackIE(dom, nodeName, template) {
        switch (nodeName) {
            case 'style':
                dom.setAttribute('type', 'text/css');
                dom.styleSheet.cssText = template;
                break;
            case 'xmp': //IE6-8,XMP元素里面只能有文本节点,不能使用innerHTML
            case 'noscript':
                dom.textContent = template;
                break;
        }
    }
    function skipFalseAndFunction(a) {
        return a !== false && Object(a) !== a;
    }
    /* istanbul ignore next */
    var specalAttrs = {
        "class": function _class(dom, val) {
            dom.className = val;
        },
        style: function style(dom, val) {
            dom.style.cssText = val;
        },
        type: function type(dom, val) {
            try {
                //textarea,button 元素在IE6,7设置 type 属性会抛错
                dom.type = val;
            } catch (e) {}
        },
        'for': function _for(dom, val) {
            dom.setAttribute('for', val);
            dom.htmlFor = val;
        }
    };

    function createSVG(type) {
        return document$1.createElementNS('http://www.w3.org/2000/svg', type);
    }
    var svgTags = avalon.oneObject('circle,defs,ellipse,image,line,' + 'path,polygon,polyline,rect,symbol,text,use,g,svg');

    var rvml = /^\w+\:\w+/;
    /* istanbul ignore next*/
    function createVML(type) {
        if (document$1.styleSheets.length < 31) {
            document$1.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        } else {
            // no more room, add to the existing one
            // http://msdn.microsoft.com/en-us/library/ms531194%28VS.85%29.aspx
            document$1.styleSheets[0].addRule(".rvml", "behavior:url(#default#VML)");
        }
        var arr = type.split(':');
        if (arr.length === 1) {
            arr.unshift('v');
        }
        var tag = arr[1];
        var ns = arr[0];
        if (!document$1.namespaces[ns]) {
            document$1.namespaces.add(ns, "urn:schemas-microsoft-com:vml");
        }
        return document$1.createElement('<' + ns + ':' + tag + ' class="rvml">');
    }

    var VMLTags = avalon.oneObject('shape,line,polyline,rect,roundrect,oval,arc,' + 'curve,background,image,shapetype,group,fill,' + 'stroke,shadow, extrusion, textbox, imagedata, textpath');

    function VFragment(children, key, val, index) {
        this.nodeName = '#document-fragment';
        this.children = children;
        this.key = key;
        this.val = val;
        this.index = index;
        this.props = {};
    }
    VFragment.prototype = {
        constructor: VFragment,
        toDOM: function toDOM() {
            if (this.dom) return this.dom;
            var f = this.toFragment();
            //IE6-11 docment-fragment都没有children属性 
            this.split = f.lastChild;
            return this.dom = f;
        },
        dispose: function dispose() {
            this.toFragment();
            this.innerRender && this.innerRender.dispose();
            for (var i in this) {
                this[i] = null;
            }
        },
        toFragment: function toFragment() {
            var f = createFragment();
            this.children.forEach(function (el) {
                return f.appendChild(avalon.vdom(el, 'toDOM'));
            });
            return f;
        },
        toHTML: function toHTML() {
            var c = this.children;
            return c.map(function (el) {
                return avalon.vdom(el, 'toHTML');
            }).join('');
        }
    };

    /**
     * 虚拟DOM的4大构造器
     */
    avalon.mix(avalon, {
        VText: VText,
        VComment: VComment,
        VElement: VElement,
        VFragment: VFragment
    });

    var constNameMap = {
        '#text': 'VText',
        '#document-fragment': 'VFragment',
        '#comment': 'VComment'
    };

    var vdom = avalon.vdomAdaptor = avalon.vdom = function (obj, method) {
        if (!obj) {
            //obj在ms-for循环里面可能是null
            return method === "toHTML" ? '' : createFragment();
        }
        var nodeName = obj.nodeName;
        if (!nodeName) {
            return new avalon.VFragment(obj)[method]();
        }
        var constName = constNameMap[nodeName] || 'VElement';
        return avalon[constName].prototype[method].call(obj);
    };

    avalon.domize = function (a) {
        return avalon.vdom(a, 'toDOM');
    };

    avalon.pendingActions = [];
    avalon.uniqActions = {};
    avalon.inTransaction = 0;
    config.trackDeps = false;
    avalon.track = function () {
        if (config.trackDeps) {
            avalon.log.apply(avalon, arguments);
        }
    };

    /**
     * Batch is a pseudotransaction, just for purposes of memoizing ComputedValues when nothing else does.
     * During a batch `onBecomeUnobserved` will be called at most once per observable.
     * Avoids unnecessary recalculations.
     */

    function runActions() {
        if (avalon.isRunningActions === true || avalon.inTransaction > 0) return;
        avalon.isRunningActions = true;
        var tasks = avalon.pendingActions.splice(0, avalon.pendingActions.length);
        for (var i = 0, task; task = tasks[i++];) {
            task.update();
            delete avalon.uniqActions[task.uuid];
        }
        avalon.isRunningActions = false;
    }

    function propagateChanged(target) {
        var list = target.observers;
        for (var i = 0, el; el = list[i++];) {
            el.schedule(); //通知action, computed做它们该做的事
        }
    }

    //将自己抛到市场上卖
    function reportObserved(target) {
        var action = avalon.trackingAction || null;
        if (action !== null) {

            avalon.track('征收到', target.expr);
            action.mapIDs[target.uuid] = target;
        }
    }

    var targetStack = [];

    function collectDeps(action, getter) {
        if (!action.observers) return;
        var preAction = avalon.trackingAction;
        if (preAction) {
            targetStack.push(preAction);
        }
        avalon.trackingAction = action;
        avalon.track('【action】', action.type, action.expr, '开始征收依赖项');
        //多个observe持有同一个action
        action.mapIDs = {}; //重新收集依赖
        var hasError = true,
            result;
        try {
            result = getter.call(action);
            hasError = false;
        } finally {
            if (hasError) {
                avalon.warn('collectDeps fail', getter + '');
                action.mapIDs = {};
                avalon.trackingAction = preAction;
            } else {
                // 确保它总是为null
                avalon.trackingAction = targetStack.pop();
                try {
                    resetDeps(action);
                } catch (e) {
                    avalon.warn(e);
                }
            }
            return result;
        }
    }

    function resetDeps(action) {
        var prev = action.observers,
            curr = [],
            checked = {},
            ids = [];
        for (var i in action.mapIDs) {
            var dep = action.mapIDs[i];
            if (!dep.isAction) {
                if (!dep.observers) {
                    //如果它已经被销毁
                    delete action.mapIDs[i];
                    continue;
                }
                ids.push(dep.uuid);
                curr.push(dep);
                checked[dep.uuid] = 1;
                if (dep.lastAccessedBy === action.uuid) {
                    continue;
                }
                dep.lastAccessedBy = action.uuid;
                avalon.Array.ensure(dep.observers, action);
            }
        }
        var ids = ids.sort().join(',');
        if (ids === action.ids) {
            return;
        }
        action.ids = ids;
        if (!action.isComputed) {
            action.observers = curr;
        } else {
            action.depsCount = curr.length;
            action.deps = avalon.mix({}, action.mapIDs);
            action.depsVersion = {};
            for (var _i in action.mapIDs) {
                var _dep = action.mapIDs[_i];
                action.depsVersion[_dep.uuid] = _dep.version;
            }
        }

        for (var _i2 = 0, _dep2; _dep2 = prev[_i2++];) {
            if (!checked[_dep2.uuid]) {
                avalon.Array.remove(_dep2.observers, action);
            }
        }
    }

    function transaction(action, thisArg, args) {
        args = args || [];
        var name = 'transaction ' + (action.name || action.displayName || 'noop');
        transactionStart(name);
        var res = action.apply(thisArg, args);
        transactionEnd(name);
        return res;
    }
    avalon.transaction = transaction;

    function transactionStart(name) {
        avalon.inTransaction += 1;
    }

    function transactionEnd(name) {
        if (--avalon.inTransaction === 0) {
            avalon.isRunningActions = false;
            runActions();
        }
    }

    var keyMap = avalon.oneObject("break,case,catch,continue,debugger,default,delete,do,else,false," + "finally,for,function,if,in,instanceof,new,null,return,switch,this," + "throw,true,try,typeof,var,void,while,with," + /* 关键字*/
    "abstract,boolean,byte,char,class,const,double,enum,export,extends," + "final,float,goto,implements,import,int,interface,long,native," + "package,private,protected,public,short,static,super,synchronized," + "throws,transient,volatile");

    var skipMap = avalon.mix({
        Math: 1,
        Date: 1,
        $event: 1,
        window: 1,
        __vmodel__: 1,
        avalon: 1
    }, keyMap);

    var rvmKey = /(^|[^\w\u00c0-\uFFFF_])(@|##)(?=[$\w])/g;
    var ruselessSp = /\s*(\.|\|)\s*/g;
    var rshortCircuit = /\|\|/g;
    var brackets = /\(([^)]*)\)/;
    var rpipeline = /\|(?=\?\?)/;
    var rregexp = /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/g;
    var robjectProp = /\.[\w\.\$]+/g; //对象的属性 el.xxx 中的xxx
    var robjectKey = /(\{|\,)\s*([\$\w]+)\s*:/g; //对象的键名与冒号 {xxx:1,yyy: 2}中的xxx, yyy
    var rfilterName = /\|(\w+)/g;
    var rlocalVar = /[$a-zA-Z_][$a-zA-Z0-9_]*/g;

    var exprCache = new Cache(300);

    function addScopeForLocal(str) {
        return str.replace(robjectProp, dig).replace(rlocalVar, function (el) {
            if (!skipMap[el]) {
                return "__vmodel__." + el;
            }
            return el;
        });
    }

    function addScope(expr, type) {
        var cacheKey = expr + ':' + type;
        var cache = exprCache.get(cacheKey);
        if (cache) {
            return cache.slice(0);
        }

        stringPool.map = {};
        //https://github.com/RubyLouvre/avalon/issues/1849
        var input = expr.replace(rregexp, function (a, b) {
            return b + dig(a.slice(b.length));
        }); //移除所有正则
        input = clearString(input); //移除所有字符串
        input = input.replace(rshortCircuit, dig). //移除所有短路运算符
        replace(ruselessSp, '$1'). //移除.|两端空白

        replace(robjectKey, function (_, a, b) {
            //移除所有键名
            return a + dig(b) + ':'; //比如 ms-widget="[{is:'ms-address-wrap', $id:'address'}]"这样极端的情况 
        }).replace(rvmKey, '$1__vmodel__.'). //转换@与##为__vmodel__
        replace(rfilterName, function (a, b) {
            //移除所有过滤器的名字
            return '|' + dig(b);
        });
        input = addScopeForLocal(input); //在本地变量前添加__vmodel__

        var filters = input.split(rpipeline); //根据管道符切割表达式
        var body = filters.shift().replace(rfill, fill).trim();
        if (/\?\?\d/.test(body)) {
            body = body.replace(rfill, fill);
        }
        if (filters.length) {
            filters = filters.map(function (filter) {
                var bracketArgs = '';
                filter = filter.replace(brackets, function (a, b) {
                    if (/\S/.test(b)) {
                        bracketArgs += ',' + b; //还原字符串,正则,短路运算符
                    }
                    return '';
                });
                var arg = '[' + avalon.quote(filter.trim()) + bracketArgs + ']';
                return arg;
            });
            filters = 'avalon.composeFilters(' + filters + ')(__value__)';
            filters = filters.replace(rfill, fill);
        } else {
            filters = '';
        }
        return exprCache.put(cacheKey, [body, filters]);
    }
    var rhandleName = /^__vmodel__\.[$\w\.]+$/;
    var rfixIE678 = /__vmodel__\.([^(]+)\(([^)]*)\)/;
    function makeHandle(body) {
        if (rhandleName.test(body)) {
            body = body + '($event)';
        }
        /* istanbul ignore if */
        if (msie < 9) {
            body = body.replace(rfixIE678, function (a, b, c) {
                return '__vmodel__.' + b + '.call(__vmodel__' + (/\S/.test(c) ? ',' + c : '') + ')';
            });
        }
        return body;
    }
    function createGetter(expr, type) {
        var arr = addScope(expr, type),
            body;
        if (!arr[1]) {
            body = arr[0];
        } else {
            body = arr[1].replace(/__value__\)$/, arr[0] + ')');
        }
        try {
            return new Function('__vmodel__', 'return ' + body + ';');
            /* istanbul ignore next */
        } catch (e) {
            avalon.log('parse getter: [', expr, body, ']error');
            return avalon.noop;
        }
    }

    /**
     * 生成表达式设值函数
     * @param  {String}  expr
     */
    function createSetter(expr, type) {
        var arr = addScope(expr, type);
        var body = 'try{ ' + arr[0] + ' = __value__}catch(e){}';
        try {
            return new Function('__vmodel__', '__value__', body + ';');
            /* istanbul ignore next */
        } catch (e) {
            avalon.log('parse setter: ', expr, ' error');
            return avalon.noop;
        }
    }

    var actionUUID = 1;
    //需要重构
    function Action(vm, options, callback) {
        for (var i in options) {
            if (protectedMenbers[i] !== 1) {
                this[i] = options[i];
            }
        }

        this.vm = vm;
        this.observers = [];
        this.callback = callback;
        this.uuid = ++actionUUID;
        this.ids = '';
        this.mapIDs = {}; //这个用于去重
        this.isAction = true;
        var expr = this.expr;
        // 缓存取值函数
        if (typeof this.getter !== 'function') {
            this.getter = createGetter(expr, this.type);
        }
        // 缓存设值函数（双向数据绑定）
        if (this.type === 'duplex') {
            this.setter = createSetter(expr, this.type);
        }
        // 缓存表达式旧值
        this.value = NaN;
        // 表达式初始值 & 提取依赖
        if (!this.node) {
            this.value = this.get();
        }
    }

    Action.prototype = {
        getValue: function getValue() {
            var scope = this.vm;
            try {
                return this.getter.call(scope, scope);
            } catch (e) {
                avalon.log(this.getter + ' exec error');
            }
        },
        setValue: function setValue(value) {
            var scope = this.vm;
            if (this.setter) {
                this.setter.call(scope, scope, value);
            }
        },


        // get --> getValue --> getter
        get: function get(fn) {
            var name = 'action track ' + this.type;

            if (this.deep) {
                avalon.deepCollect = true;
            }

            var value = collectDeps(this, this.getValue);
            if (this.deep && avalon.deepCollect) {
                avalon.deepCollect = false;
            }

            return value;
        },


        /**
         * 在更新视图前保存原有的value
         */
        beforeUpdate: function beforeUpdate() {
            var v = this.value;
            return this.oldValue = v && v.$events ? v.$model : v;
        },
        update: function update(args, uuid) {
            var oldVal = this.beforeUpdate();
            var newVal = this.value = this.get();
            var callback = this.callback;
            if (callback && this.diff(newVal, oldVal, args)) {
                callback.call(this.vm, this.value, oldVal, this.expr);
            }
            this._isScheduled = false;
        },
        schedule: function schedule() {
            if (!this._isScheduled) {
                this._isScheduled = true;
                if (!avalon.uniqActions[this.uuid]) {
                    avalon.uniqActions[this.uuid] = 1;
                    avalon.pendingActions.push(this);
                }

                runActions(); //这里会还原_isScheduled

            }
        },
        removeDepends: function removeDepends() {
            var self = this;
            this.observers.forEach(function (depend) {
                avalon.Array.remove(depend.observers, self);
            });
        },


        /**
         * 比较两个计算值是否,一致,在for, class等能复杂数据类型的指令中,它们会重写diff复法
         */
        diff: function diff(a, b) {
            return a !== b;
        },


        /**
         * 销毁指令
         */
        dispose: function dispose() {
            this.value = null;
            this.removeDepends();
            if (this.beforeDispose) {
                this.beforeDispose();
            }
            for (var i in this) {
                delete this[i];
            }
        }
    };

    var protectedMenbers = {
        vm: 1,
        callback: 1,

        observers: 1,
        oldValue: 1,
        value: 1,
        getValue: 1,
        setValue: 1,
        get: 1,

        removeDepends: 1,
        beforeUpdate: 1,
        update: 1,
        //diff
        //getter
        //setter
        //expr
        //vdom
        //type: "for"
        //name: "ms-for"
        //attrName: ":for"
        //param: "click"
        //beforeDispose
        dispose: 1
    };

    /**
    * 
     与Computed等共享UUID
    */
    var obid = 1;
    function Mutation(expr, value, vm) {
        //构造函数
        this.expr = expr;
        if (value) {
            var childVm = platform.createProxy(value, this);
            if (childVm) {
                value = childVm;
            }
        }
        this.value = value;
        this.vm = vm;
        try {
            vm.$mutations[expr] = this;
        } catch (ignoreIE) {}
        this.uuid = ++obid;
        this.updateVersion();
        this.mapIDs = {};
        this.observers = [];
    }

    Mutation.prototype = {
        get: function get() {
            if (avalon.trackingAction) {
                this.collect(); //被收集
                var childOb = this.value;
                if (childOb && childOb.$events) {
                    if (Array.isArray(childOb)) {
                        childOb.forEach(function (item) {
                            if (item && item.$events) {
                                item.$events.__dep__.collect();
                            }
                        });
                    } else if (avalon.deepCollect) {
                        for (var key in childOb) {
                            if (childOb.hasOwnProperty(key)) {
                                var collectIt = childOb[key];
                            }
                        }
                    }
                }
            }
            return this.value;
        },
        collect: function collect() {
            avalon.track(name, '被收集');
            reportObserved(this);
        },
        updateVersion: function updateVersion() {
            this.version = Math.random() + Math.random();
        },
        notify: function notify() {
            transactionStart();
            propagateChanged(this);
            transactionEnd();
        },
        set: function set(newValue) {
            var oldValue = this.value;
            if (newValue !== oldValue) {
                if (avalon.isObject(newValue)) {
                    var hash = oldValue && oldValue.$hashcode;
                    var childVM = platform.createProxy(newValue, this);
                    if (childVM) {
                        if (hash) {
                            childVM.$hashcode = hash;
                        }
                        newValue = childVM;
                    }
                }
                this.value = newValue;
                this.updateVersion();
                this.notify();
            }
        }
    };

    function getBody(fn) {
        var entire = fn.toString();
        return entire.substring(entire.indexOf('{}') + 1, entire.lastIndexOf('}'));
    }
    //如果不存在三目,if,方法
    var instability = /(\?|if\b|\(.+\))/;

    function __create(o) {
        var __ = function __() {};
        __.prototype = o;
        return new __();
    }

    function __extends(child, parent) {
        if (typeof parent === 'function') {
            var proto = child.prototype = __create(parent.prototype);
            proto.constructor = child;
        }
    }
    var Computed = function (_super) {
        __extends(Computed, _super);

        function Computed(name, options, vm) {
            //构造函数
            _super.call(this, name, undefined, vm);
            delete options.get;
            delete options.set;

            avalon.mix(this, options);
            this.deps = {};
            this.type = 'computed';
            this.depsVersion = {};
            this.isComputed = true;
            this.trackAndCompute();
            if (!('isStable' in this)) {
                this.isStable = !instability.test(getBody(this.getter));
            }
        }
        var cp = Computed.prototype;
        cp.trackAndCompute = function () {
            if (this.isStable && this.depsCount > 0) {
                this.getValue();
            } else {
                collectDeps(this, this.getValue.bind(this));
            }
        };

        cp.getValue = function () {
            return this.value = this.getter.call(this.vm);
        };

        cp.schedule = function () {
            var observers = this.observers;
            var i = observers.length;
            while (i--) {
                var d = observers[i];
                if (d.schedule) {
                    d.schedule();
                }
            }
        };

        cp.shouldCompute = function () {
            if (this.isStable) {
                //如果变动因子确定,那么只比较变动因子的版本
                var toComputed = false;
                for (var i in this.deps) {
                    if (this.deps[i].version !== this.depsVersion[i]) {
                        toComputed = true;
                        this.deps[i].version = this.depsVersion[i];
                    }
                }
                return toComputed;
            }
            return true;
        };
        cp.set = function () {
            if (this.setter) {
                avalon.transaction(this.setter, this.vm, arguments);
            }
        };
        cp.get = function () {

            //当被设置了就不稳定,当它被访问了一次就是稳定
            this.collect();

            if (this.shouldCompute()) {
                this.trackAndCompute();
                // console.log('computed 2 分支')
                this.updateVersion();
                //  this.reportChanged()
            }

            //下面这一行好像没用
            return this.value;
        };
        return Computed;
    }(Mutation);

    /**
     * 这里放置ViewModel模块的共用方法
     * avalon.define: 全框架最重要的方法,生成用户VM
     * IProxy, 基本用户数据产生的一个数据对象,基于$model与vmodel之间的形态
     * modelFactory: 生成用户VM
     * canHijack: 判定此属性是否该被劫持,加入数据监听与分发的的逻辑
     * createProxy: listFactory与modelFactory的封装
     * createAccessor: 实现数据监听与分发的重要对象
     * itemFactory: ms-for循环中产生的代理VM的生成工厂
     * fuseFactory: 两个ms-controller间产生的代理VM的生成工厂
     */

    avalon.define = function (definition) {
        var $id = definition.$id;
        if (!$id) {
            avalon.error('vm.$id must be specified');
        }
        if (avalon.vmodels[$id]) {
            avalon.warn('error:[' + $id + '] had defined!');
        }
        var vm = platform.modelFactory(definition);
        return avalon.vmodels[$id] = vm;
    };

    /**
     * 在未来的版本,avalon改用Proxy来创建VM,因此
     */

    function IProxy(definition, dd) {
        avalon.mix(this, definition);
        avalon.mix(this, $$skipArray);
        this.$hashcode = avalon.makeHashCode('$');
        this.$id = this.$id || this.$hashcode;
        this.$events = {
            __dep__: dd || new Mutation(this.$id)
        };
        if (avalon.config.inProxyMode) {
            delete this.$mutations;
            this.$accessors = {};
            this.$computed = {};
            this.$track = '';
        } else {
            this.$accessors = {
                $model: modelAccessor
            };
        }
        if (dd === void 0) {
            this.$watch = platform.watchFactory(this.$events);
            this.$fire = platform.fireFactory(this.$events);
        } else {
            delete this.$watch;
            delete this.$fire;
        }
    }

    platform.modelFactory = function modelFactory(definition, dd) {
        var $computed = definition.$computed || {};
        delete definition.$computed;
        var core = new IProxy(definition, dd);
        var $accessors = core.$accessors;
        var keys = [];

        platform.hideProperty(core, '$mutations', {});

        for (var key in definition) {
            if (key in $$skipArray) continue;
            var val = definition[key];
            keys.push(key);
            if (canHijack(key, val)) {
                $accessors[key] = createAccessor(key, val);
            }
        }
        for (var _key in $computed) {
            if (_key in $$skipArray) continue;
            var val = $computed[_key];
            if (typeof val === 'function') {
                val = {
                    get: val
                };
            }
            if (val && val.get) {
                val.getter = val.get;
                val.setter = val.set;
                avalon.Array.ensure(keys, _key);
                $accessors[_key] = createAccessor(_key, val, true);
            }
        }
        //将系统API以unenumerable形式加入vm,
        //添加用户的其他不可监听属性或方法
        //重写$track
        //并在IE6-8中增添加不存在的hasOwnPropert方法
        var vm = platform.createViewModel(core, $accessors, core);
        platform.afterCreate(vm, core, keys, !dd);
        return vm;
    };
    var $proxyItemBackdoorMap = {};

    function canHijack(key, val, $proxyItemBackdoor) {
        if (key in $$skipArray) return false;
        if (key.charAt(0) === '$') {
            if ($proxyItemBackdoor) {
                if (!$proxyItemBackdoorMap[key]) {
                    $proxyItemBackdoorMap[key] = 1;
                    avalon.warn('ms-for\u4E2D\u7684\u53D8\u91CF' + key + '\u4E0D\u518D\u5EFA\u8BAE\u4EE5$\u4E3A\u524D\u7F00');
                }
                return true;
            }
            return false;
        }
        if (val == null) {
            avalon.warn('定义vmodel时' + key + '的属性值不能为null undefine');
            return true;
        }
        if (/error|date|function|regexp/.test(avalon.type(val))) {
            return false;
        }
        return !(val && val.nodeName && val.nodeType);
    }

    function createProxy(target, dd) {
        if (target && target.$events) {
            return target;
        }
        var vm;
        if (Array.isArray(target)) {
            vm = platform.listFactory(target, false, dd);
        } else if (isObject(target)) {
            vm = platform.modelFactory(target, dd);
        }
        return vm;
    }

    platform.createProxy = createProxy;

    platform.itemFactory = function itemFactory(before, after) {
        var keyMap = before.$model;
        var core = new IProxy(keyMap);
        var state = avalon.shadowCopy(core.$accessors, before.$accessors); //防止互相污染
        var data = after.data;
        //core是包含系统属性的对象
        //keyMap是不包含系统属性的对象, keys
        for (var key in data) {
            var val = keyMap[key] = core[key] = data[key];
            state[key] = createAccessor(key, val);
        }
        var keys = Object.keys(keyMap);
        var vm = platform.createViewModel(core, state, core);
        platform.afterCreate(vm, core, keys);
        return vm;
    };

    function createAccessor(key, val, isComputed) {
        var mutation = null;
        var Accessor = isComputed ? Computed : Mutation;
        return {
            get: function Getter() {
                if (!mutation) {
                    mutation = new Accessor(key, val, this);
                }
                return mutation.get();
            },
            set: function Setter(newValue) {
                if (!mutation) {
                    mutation = new Accessor(key, val, this);
                }
                mutation.set(newValue);
            },
            enumerable: true,
            configurable: true
        };
    }

    platform.fuseFactory = function fuseFactory(before, after) {
        var keyMap = avalon.mix(before.$model, after.$model);
        var core = new IProxy(avalon.mix(keyMap, {
            $id: before.$id + after.$id
        }));
        var state = avalon.mix(core.$accessors, before.$accessors, after.$accessors); //防止互相污染

        var keys = Object.keys(keyMap);
        //将系统API以unenumerable形式加入vm,并在IE6-8中添加hasOwnPropert方法
        var vm = platform.createViewModel(core, state, core);
        platform.afterCreate(vm, core, keys, false);
        return vm;
    };

    function toJson(val) {
        var xtype = avalon.type(val);
        if (xtype === 'array') {
            var array = [];
            for (var i = 0; i < val.length; i++) {
                array[i] = toJson(val[i]);
            }
            return array;
        } else if (xtype === 'object') {
            if (typeof val.$track === 'string') {
                var obj = {};
                var arr = val.$track.match(/[^☥]+/g) || [];
                arr.forEach(function (i) {
                    var value = val[i];
                    obj[i] = value && value.$events ? toJson(value) : value;
                });
                return obj;
            }
        }
        return val;
    }

    var modelAccessor = {
        get: function get() {
            return toJson(this);
        },
        set: avalon.noop,
        enumerable: false,
        configurable: true
    };

    platform.toJson = toJson;
    platform.modelAccessor = modelAccessor;

    var _splice = ap.splice;
    var __array__ = {
        set: function set(index, val) {
            if (index >>> 0 === index && this[index] !== val) {
                if (index > this.length) {
                    throw Error(index + 'set方法的第一个参数不能大于原数组长度');
                }
                this.splice(index, 1, val);
            }
        },
        toJSON: function toJSON() {
            //为了解决IE6-8的解决,通过此方法显式地求取数组的$model
            return this.$model = platform.toJson(this);
        },
        contains: function contains(el) {
            //判定是否包含
            return this.indexOf(el) !== -1;
        },
        ensure: function ensure(el) {
            if (!this.contains(el)) {
                //只有不存在才push
                this.push(el);
                return true;
            }
            return false;
        },
        pushArray: function pushArray(arr) {
            return this.push.apply(this, arr);
        },
        remove: function remove(el) {
            //移除第一个等于给定值的元素
            return this.removeAt(this.indexOf(el));
        },
        removeAt: function removeAt(index) {
            //移除指定索引上的元素
            if (index >>> 0 === index) {
                return this.splice(index, 1);
            }
            return [];
        },
        clear: function clear() {
            this.removeAll();
            return this;
        },
        removeAll: function removeAll(all) {
            //移除N个元素
            var size = this.length;
            var eliminate = Array.isArray(all) ? function (el) {
                return all.indexOf(el) !== -1;
            } : typeof all === 'function' ? all : false;

            if (eliminate) {
                for (var i = this.length - 1; i >= 0; i--) {
                    if (eliminate(this[i], i)) {
                        _splice.call(this, i, 1);
                    }
                }
            } else {
                _splice.call(this, 0, this.length);
            }
            this.toJSON();
            this.$events.__dep__.notify();
        }
    };
    function hijackMethods(array) {
        for (var i in __array__) {
            platform.hideProperty(array, i, __array__[i]);
        }
    }
    var __method__ = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

    __method__.forEach(function (method) {
        var original = ap[method];
        __array__[method] = function () {
            // 继续尝试劫持数组元素的属性
            var core = this.$events;

            var args = platform.listFactory(arguments, true, core.__dep__);
            var result = original.apply(this, args);

            this.toJSON();
            core.__dep__.notify(method);
            return result;
        };
    });

    function listFactory(array, stop, dd) {
        if (!stop) {
            hijackMethods(array);
            if (modern) {
                Object.defineProperty(array, '$model', platform.modelAccessor);
            }
            platform.hideProperty(array, '$hashcode', avalon.makeHashCode('$'));
            platform.hideProperty(array, '$events', { __dep__: dd || new Mutation() });
        }
        var _dd = array.$events && array.$events.__dep__;
        for (var i = 0, n = array.length; i < n; i++) {
            var item = array[i];
            if (isObject(item)) {
                array[i] = platform.createProxy(item, _dd);
            }
        }
        return array;
    }

    platform.listFactory = listFactory;

    //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
    //标准浏览器使用__defineGetter__, __defineSetter__实现
    var canHideProperty = true;
    try {
        Object.defineProperty({}, '_', {
            value: 'x'
        });
        delete $$skipArray.$vbsetter;
        delete $$skipArray.$vbthis;
    } catch (e) {
        /* istanbul ignore next*/
        canHideProperty = false;
    }

    var protectedVB = { $vbthis: 1, $vbsetter: 1 };
    /* istanbul ignore next */
    function hideProperty(host, name, value) {
        if (canHideProperty) {
            Object.defineProperty(host, name, {
                value: value,
                writable: true,
                enumerable: false,
                configurable: true
            });
        } else if (!protectedVB[name]) {
            /* istanbul ignore next */
            host[name] = value;
        }
    }

    function watchFactory(core) {
        return function $watch(expr, callback, deep) {
            var w = new Action(core.__proxy__, {
                deep: deep,
                type: 'user',
                expr: expr
            }, callback);
            if (!core[expr]) {
                core[expr] = [w];
            } else {
                core[expr].push(w);
            }

            return function () {
                w.dispose();
                avalon.Array.remove(core[expr], w);
                if (core[expr].length === 0) {
                    delete core[expr];
                }
            };
        };
    }

    function fireFactory(core) {
        return function $fire(expr, a) {
            var list = core[expr];
            if (Array.isArray(list)) {
                for (var i = 0, w; w = list[i++];) {
                    w.callback.call(w.vm, a, w.value, w.expr);
                }
            }
        };
    }

    function wrapIt(str) {
        return '☥' + str + '☥';
    }

    function afterCreate(vm, core, keys, bindThis) {
        var ac = vm.$accessors;
        //隐藏系统属性
        for (var key in $$skipArray) {
            if (avalon.msie < 9 && core[key] === void 0) continue;
            hideProperty(vm, key, core[key]);
        }
        //为不可监听的属性或方法赋值
        for (var i = 0; i < keys.length; i++) {
            var _key2 = keys[i];
            if (!(_key2 in ac)) {
                if (bindThis && typeof core[_key2] === 'function') {
                    vm[_key2] = core[_key2].bind(vm);
                    continue;
                }
                vm[_key2] = core[_key2];
            }
        }
        vm.$track = keys.join('☥');

        function hasOwnKey(key) {
            return wrapIt(vm.$track).indexOf(wrapIt(key)) > -1;
        }
        if (avalon.msie < 9) {
            vm.hasOwnProperty = hasOwnKey;
        }
        vm.$events.__proxy__ = vm;
    }

    platform.hideProperty = hideProperty;
    platform.fireFactory = fireFactory;
    platform.watchFactory = watchFactory;
    platform.afterCreate = afterCreate;

    var createViewModel = Object.defineProperties;
    var defineProperty;

    var timeBucket = new Date() - 0;
    /* istanbul ignore if*/
    if (!canHideProperty) {
        if ('__defineGetter__' in avalon) {
            defineProperty = function defineProperty(obj, prop, desc) {
                if ('value' in desc) {
                    obj[prop] = desc.value;
                }
                if ('get' in desc) {
                    obj.__defineGetter__(prop, desc.get);
                }
                if ('set' in desc) {
                    obj.__defineSetter__(prop, desc.set);
                }
                return obj;
            };
            createViewModel = function createViewModel(obj, descs) {
                for (var prop in descs) {
                    if (descs.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, descs[prop]);
                    }
                }
                return obj;
            };
        }
        /* istanbul ignore if*/
        if (msie < 9) {
            var VBClassPool = {};
            window.execScript([// jshint ignore:line
            'Function parseVB(code)', '\tExecuteGlobal(code)', 'End Function' //转换一段文本为VB代码
            ].join('\n'), 'VBScript');

            var VBMediator = function VBMediator(instance, accessors, name, value) {
                // jshint ignore:line
                var accessor = accessors[name];
                if (arguments.length === 4) {
                    accessor.set.call(instance, value);
                } else {
                    return accessor.get.call(instance);
                }
            };
            createViewModel = function createViewModel(name, accessors, properties) {
                // jshint ignore:line
                var buffer = [];
                buffer.push('\tPrivate [$vbsetter]', '\tPublic  [$accessors]', '\tPublic Default Function [$vbthis](ac' + timeBucket + ', s' + timeBucket + ')', '\t\tSet  [$accessors] = ac' + timeBucket + ': set [$vbsetter] = s' + timeBucket, '\t\tSet  [$vbthis]    = Me', //链式调用
                '\tEnd Function');
                //添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
                var uniq = {
                    $vbthis: true,
                    $vbsetter: true,
                    $accessors: true
                };
                for (name in $$skipArray) {
                    if (!uniq[name]) {
                        buffer.push('\tPublic [' + name + ']');
                        uniq[name] = true;
                    }
                }
                //添加访问器属性 
                for (name in accessors) {
                    if (uniq[name]) {
                        continue;
                    }
                    uniq[name] = true;
                    buffer.push(
                    //由于不知对方会传入什么,因此set, let都用上
                    '\tPublic Property Let [' + name + '](val' + timeBucket + ')', //setter
                    '\t\tCall [$vbsetter](Me, [$accessors], "' + name + '", val' + timeBucket + ')', '\tEnd Property', '\tPublic Property Set [' + name + '](val' + timeBucket + ')', //setter
                    '\t\tCall [$vbsetter](Me, [$accessors], "' + name + '", val' + timeBucket + ')', '\tEnd Property', '\tPublic Property Get [' + name + ']', //getter
                    '\tOn Error Resume Next', //必须优先使用set语句,否则它会误将数组当字符串返回
                    '\t\tSet[' + name + '] = [$vbsetter](Me, [$accessors],"' + name + '")', '\tIf Err.Number <> 0 Then', '\t\t[' + name + '] = [$vbsetter](Me, [$accessors],"' + name + '")', '\tEnd If', '\tOn Error Goto 0', '\tEnd Property');
                }

                for (name in properties) {
                    if (!uniq[name]) {
                        uniq[name] = true;
                        buffer.push('\tPublic [' + name + ']');
                    }
                }

                buffer.push('\tPublic [hasOwnProperty]');
                buffer.push('End Class');
                var body = buffer.join('\r\n');
                var className = VBClassPool[body];
                if (!className) {
                    className = avalon.makeHashCode('VBClass');
                    window.parseVB('Class ' + className + body);
                    window.parseVB(['Function ' + className + 'Factory(acc, vbm)', //创建实例并传入两个关键的参数
                    '\tDim o', '\tSet o = (New ' + className + ')(acc, vbm)', '\tSet ' + className + 'Factory = o', 'End Function'].join('\r\n'));
                    VBClassPool[body] = className;
                }
                var ret = window[className + 'Factory'](accessors, VBMediator); //得到其产品
                return ret; //得到其产品
            };
        }
    }

    platform.createViewModel = createViewModel;

    var impDir = avalon.directive('important', {
        priority: 1,
        getScope: function getScope(name, scope) {
            var v = avalon.vmodels[name];
            if (v) return v;
            throw 'error! no vmodel called ' + name;
        },
        update: function update(node, attrName, $id) {
            if (!avalon.inBrowser) return;
            var dom = avalon.vdom(node, 'toDOM');
            if (dom.nodeType === 1) {
                dom.removeAttribute(attrName);
                avalon(dom).removeClass('ms-controller');
            }
            var vm = avalon.vmodels[$id];
            if (vm) {
                vm.$element = dom;
                vm.$render = this;
                vm.$fire('onReady');
                delete vm.$events.onReady;
            }
        }
    });

    var impCb = impDir.update;

    avalon.directive('controller', {
        priority: 2,
        getScope: function getScope(name, scope) {
            var v = avalon.vmodels[name];
            if (v) {
                v.$render = this;
                if (scope && scope !== v) {
                    return platform.fuseFactory(scope, v);
                }
                return v;
            }
            return scope;
        },
        update: impCb
    });

    avalon.directive('skip', {
        delay: true
    });

    var arrayWarn = {};
    var cssDir = avalon.directive('css', {
        diff: function diff(newVal, oldVal) {
            if (Object(newVal) === newVal) {
                newVal = platform.toJson(newVal); //安全的遍历VBscript
                if (Array.isArray(newVal)) {
                    //转换成对象
                    var b = {};
                    newVal.forEach(function (el) {
                        el && avalon.shadowCopy(b, el);
                    });
                    newVal = b;
                    if (!arrayWarn[this.type]) {
                        avalon.warn('ms-' + this.type + '指令的值不建议使用数组形式了！');
                        arrayWarn[this.type] = 1;
                    }
                }

                var hasChange = false;
                var patch = {};
                if (!oldVal) {
                    //如果一开始为空
                    patch = newVal;
                    hasChange = true;
                } else {
                    if (this.deep) {
                        var deep = typeof this.deep === 'number' ? this.deep : 6;
                        for (var i in newVal) {
                            //diff差异点  
                            if (!deepEquals(newVal[i], oldVal[i], 4)) {
                                this.value = newVal;
                                return true;
                            }
                            patch[i] = newVal[i];
                        }
                    } else {
                        for (var _i3 in newVal) {
                            //diff差异点
                            if (newVal[_i3] !== oldVal[_i3]) {
                                hasChange = true;
                            }
                            patch[_i3] = newVal[_i3];
                        }
                    }

                    for (var _i4 in oldVal) {
                        if (!(_i4 in patch)) {
                            hasChange = true;
                            patch[_i4] = '';
                        }
                    }
                }
                if (hasChange) {
                    this.value = patch;
                    return true;
                }
            }
            return false;
        },
        update: function update(vdom, value) {

            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                var wrap = avalon(dom);
                for (var name in value) {
                    wrap.css(name, value[name]);
                }
            }
        }
    });

    var cssDiff = cssDir.diff;

    function getEnumerableKeys(obj) {
        var res = [];
        for (var key in obj) {
            res.push(key);
        }return res;
    }

    function deepEquals(a, b, level) {
        if (level === 0) return a === b;
        if (a === null && b === null) return true;
        if (a === undefined && b === undefined) return true;
        var aIsArray = Array.isArray(a);
        if (aIsArray !== Array.isArray(b)) {
            return false;
        }
        if (aIsArray) {
            return equalArray(a, b, level);
        } else if (typeof a === "object" && typeof b === "object") {
            return equalObject(a, b, level);
        }
        return a === b;
    }

    function equalArray(a, b, level) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            try {
                if (!deepEquals(a[i], b[i], level - 1)) {
                    return false;
                }
            } catch (noThisPropError) {
                return false;
            }
        }
        return true;
    }

    function equalObject(a, b, level) {
        if (a === null || b === null) return false;
        if (getEnumerableKeys(a).length !== getEnumerableKeys(b).length) return false;
        for (var prop in a) {
            if (!(prop in b)) return false;
            try {
                if (!deepEquals(a[prop], b[prop], level - 1)) {
                    return false;
                }
            } catch (noThisPropError) {
                return false;
            }
        }
        return true;
    }

    /**
     * ------------------------------------------------------------
     * 检测浏览器对CSS动画的支持与API名
     * ------------------------------------------------------------
     */

    var checker = {
        TransitionEvent: 'transitionend',
        WebKitTransitionEvent: 'webkitTransitionEnd',
        OTransitionEvent: 'oTransitionEnd',
        otransitionEvent: 'otransitionEnd'
    };
    var css3 = void 0;
    var tran = void 0;
    var ani = void 0;
    var name$2 = void 0;
    var animationEndEvent = void 0;
    var transitionEndEvent = void 0;
    var transition = false;
    var animation = false;
    //有的浏览器同时支持私有实现与标准写法，比如webkit支持前两种，Opera支持1、3、4
    for (name$2 in checker) {
        if (window$1[name$2]) {
            tran = checker[name$2];
            break;
        }
        /* istanbul ignore next */
        try {
            var a = document.createEvent(name$2);
            tran = checker[name$2];
            break;
        } catch (e) {}
    }
    if (typeof tran === 'string') {
        transition = css3 = true;
        transitionEndEvent = tran;
    }

    //animationend有两个可用形态
    //IE10+, Firefox 16+ & Opera 12.1+: animationend
    //Chrome/Safari: webkitAnimationEnd
    //http://blogs.msdn.com/b/davrous/archive/2011/12/06/introduction-to-css3-animat ions.aspx
    //IE10也可以使用MSAnimationEnd监听，但是回调里的事件 type依然为animationend
    //  el.addEventListener('MSAnimationEnd', function(e) {
    //     alert(e.type)// animationend！！！
    // })
    checker = {
        'AnimationEvent': 'animationend',
        'WebKitAnimationEvent': 'webkitAnimationEnd'
    };
    for (name$2 in checker) {
        if (window$1[name$2]) {
            ani = checker[name$2];
            break;
        }
    }
    if (typeof ani === 'string') {
        animation = css3 = true;
        animationEndEvent = ani;
    }

    var effectDir = avalon.directive('effect', {
        priority: 5,
        diff: function diff(effect) {
            var vdom = this.node;
            if (typeof effect === 'string') {
                this.value = effect = {
                    is: effect
                };
                avalon.warn('ms-effect的指令值不再支持字符串,必须是一个对象');
            }
            this.value = vdom.effect = effect;
            var ok = cssDiff.call(this, effect, this.oldValue);
            var me = this;
            if (ok) {
                setTimeout(function () {
                    vdom.animating = true;
                    effectDir.update.call(me, vdom, vdom.effect);
                });
                vdom.animating = false;
                return true;
            }
            return false;
        },

        update: function update(vdom, change, opts) {
            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                //要求配置对象必须指定is属性，action必须是布尔或enter,leave,move
                var option = change || opts;
                var is = option.is;

                var globalOption = avalon.effects[is];
                if (!globalOption) {
                    //如果没有定义特效
                    avalon.warn(is + ' effect is undefined');
                    return;
                }
                var finalOption = {};
                var action = actionMaps[option.action];
                if (typeof Effect.prototype[action] !== 'function') {
                    avalon.warn('action is undefined');
                    return;
                }
                //必须预定义特效

                var effect = new avalon.Effect(dom);
                avalon.mix(finalOption, globalOption, option, { action: action });

                if (finalOption.queue) {
                    animationQueue.push(function () {
                        effect[action](finalOption);
                    });
                    callNextAnimation();
                } else {

                    effect[action](finalOption);
                }
                return true;
            }
        }
    });

    var move = 'move';
    var leave = 'leave';
    var enter = 'enter';
    var actionMaps = {
        'true': enter,
        'false': leave,
        enter: enter,
        leave: leave,
        move: move,
        'undefined': enter
    };

    var animationQueue = [];
    function callNextAnimation() {
        var fn = animationQueue[0];
        if (fn) {
            fn();
        }
    }

    avalon.effects = {};
    avalon.effect = function (name, opts) {
        var definition = avalon.effects[name] = opts || {};
        if (css3 && definition.css !== false) {
            patchObject(definition, 'enterClass', name + '-enter');
            patchObject(definition, 'enterActiveClass', definition.enterClass + '-active');
            patchObject(definition, 'leaveClass', name + '-leave');
            patchObject(definition, 'leaveActiveClass', definition.leaveClass + '-active');
        }
        return definition;
    };

    function patchObject(obj, name, value) {
        if (!obj[name]) {
            obj[name] = value;
        }
    }

    var Effect = function Effect(dom) {
        this.dom = dom;
    };

    avalon.Effect = Effect;

    Effect.prototype = {
        enter: createAction('Enter'),
        leave: createAction('Leave'),
        move: createAction('Move')
    };

    function execHooks(options, name, el) {
        var fns = [].concat(options[name]);
        for (var i = 0, fn; fn = fns[i++];) {
            if (typeof fn === 'function') {
                fn(el);
            }
        }
    }
    var staggerCache = new Cache(128);

    function createAction(action) {
        var lower = action.toLowerCase();
        return function (option) {
            var dom = this.dom;
            var elem = avalon(dom);
            //处理与ms-for指令相关的stagger
            //========BEGIN=====
            var staggerTime = isFinite(option.stagger) ? option.stagger * 1000 : 0;
            if (staggerTime) {
                if (option.staggerKey) {
                    var stagger = staggerCache.get(option.staggerKey) || staggerCache.put(option.staggerKey, {
                        count: 0,
                        items: 0
                    });
                    stagger.count++;
                    stagger.items++;
                }
            }
            var staggerIndex = stagger && stagger.count || 0;
            //=======END==========
            var stopAnimationID;
            var animationDone = function animationDone(e) {
                var isOk = e !== false;
                if (--dom.__ms_effect_ === 0) {
                    avalon.unbind(dom, transitionEndEvent);
                    avalon.unbind(dom, animationEndEvent);
                }
                clearTimeout(stopAnimationID);
                var dirWord = isOk ? 'Done' : 'Abort';
                execHooks(option, 'on' + action + dirWord, dom);
                if (stagger) {
                    if (--stagger.items === 0) {
                        stagger.count = 0;
                    }
                }
                if (option.queue) {
                    animationQueue.shift();
                    callNextAnimation();
                }
            };
            //执行开始前的钩子
            execHooks(option, 'onBefore' + action, dom);

            if (option[lower]) {
                //使用JS方式执行动画
                option[lower](dom, function (ok) {
                    animationDone(ok !== false);
                });
            } else if (css3) {
                //使用CSS3方式执行动画
                elem.addClass(option[lower + 'Class']);
                elem.removeClass(getNeedRemoved(option, lower));

                if (!dom.__ms_effect_) {
                    //绑定动画结束事件
                    elem.bind(transitionEndEvent, animationDone);
                    elem.bind(animationEndEvent, animationDone);
                    dom.__ms_effect_ = 1;
                } else {
                    dom.__ms_effect_++;
                }
                setTimeout(function () {
                    //用xxx-active代替xxx类名的方式 触发CSS3动画
                    var time = avalon.root.offsetWidth === NaN;
                    elem.addClass(option[lower + 'ActiveClass']);
                    //计算动画时长
                    time = getAnimationTime(dom);
                    if (!time === 0) {
                        //立即结束动画
                        animationDone(false);
                    } else if (!staggerTime) {
                        //如果动画超出时长还没有调用结束事件,这可能是元素被移除了
                        //如果强制结束动画
                        stopAnimationID = setTimeout(function () {
                            animationDone(false);
                        }, time + 32);
                    }
                }, 17 + staggerTime * staggerIndex); // = 1000/60
            }
        };
    }

    avalon.applyEffect = function (dom, vdom, opts) {
        var cb = opts.cb;
        var curEffect = vdom.effect;
        if (curEffect && dom && dom.nodeType === 1) {
            var hook = opts.hook;
            var old = curEffect[hook];
            if (cb) {
                if (Array.isArray(old)) {
                    old.push(cb);
                } else if (old) {
                    curEffect[hook] = [old, cb];
                } else {
                    curEffect[hook] = [cb];
                }
            }
            getAction(opts);
            avalon.directives.effect.update(vdom, curEffect, avalon.shadowCopy({}, opts));
        } else if (cb) {
            cb(dom);
        }
    };
    /**
     * 获取方向
     */
    function getAction(opts) {
        if (!opts.action) {
            return opts.action = opts.hook.replace(/^on/, '').replace(/Done$/, '').toLowerCase();
        }
    }
    /**
     * 需要移除的类名
     */
    function getNeedRemoved(options, name) {
        var name = name === 'leave' ? 'enter' : 'leave';
        return Array(name + 'Class', name + 'ActiveClass').map(function (cls) {
            return options[cls];
        }).join(' ');
    }
    /**
     * 计算动画长度
     */
    var transitionDuration = avalon.cssName('transition-duration');
    var animationDuration = avalon.cssName('animation-duration');
    var rsecond = /\d+s$/;
    function toMillisecond(str) {
        var ratio = rsecond.test(str) ? 1000 : 1;
        return parseFloat(str) * ratio;
    }

    function getAnimationTime(dom) {
        var computedStyles = window$1.getComputedStyle(dom, null);
        var tranDuration = computedStyles[transitionDuration];
        var animDuration = computedStyles[animationDuration];
        return toMillisecond(tranDuration) || toMillisecond(animDuration);
    }
    /**
     * 
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="dist/avalon.js"></script>
            <script>
                avalon.effect('animate')
                var vm = avalon.define({
                    $id: 'ani',
                    a: true
                })
            </script>
            <style>
                .animate-enter, .animate-leave{
                    width:100px;
                    height:100px;
                    background: #29b6f6;
                    transition:all 2s;
                    -moz-transition: all 2s; 
                    -webkit-transition: all 2s;
                    -o-transition:all 2s;
                }  
                .animate-enter-active, .animate-leave{
                    width:300px;
                    height:300px;
                }
                .animate-leave-active{
                    width:100px;
                    height:100px;
                }
            </style>
        </head>
        <body>
            <div :controller='ani' >
                <p><input type='button' value='click' :click='@a =!@a'></p>
                <div :effect="{is:'animate',action:@a}"></div>
            </div>
    </body>
    </html>
     * 
     */

    var none = 'none';
    function parseDisplay(elem, val) {
        //用于取得此类标签的默认display值
        var doc = elem.ownerDocument;
        var nodeName = elem.nodeName;
        var key = '_' + nodeName;
        if (!parseDisplay[key]) {
            var temp = doc.body.appendChild(doc.createElement(nodeName));
            val = avalon.css(temp, 'display');
            doc.body.removeChild(temp);
            if (val === none) {
                val = 'block';
            }
            parseDisplay[key] = val;
        }
        return parseDisplay[key];
    }

    avalon.parseDisplay = parseDisplay;
    avalon.directive('visible', {
        diff: function diff(newVal, oldVal) {
            var n = !!newVal;
            if (oldVal === void 0 || n !== oldVal) {
                this.value = n;
                return true;
            }
        },
        ready: true,
        update: function update(vdom, show) {
            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                var display = dom.style.display;
                var value;
                if (show) {
                    if (display === none) {
                        value = vdom.displayValue;
                        if (!value) {
                            dom.style.display = '';
                            if (dom.style.cssText === '') {
                                dom.removeAttribute('style');
                            }
                        }
                    }
                    if (dom.style.display === '' && avalon(dom).css('display') === none &&
                    // fix firefox BUG,必须挂到页面上
                    avalon.contains(dom.ownerDocument, dom)) {
                        value = parseDisplay(dom);
                    }
                } else {

                    if (display !== none) {
                        value = none;
                        vdom.displayValue = display;
                    }
                }
                var cb = function cb() {
                    if (value !== void 0) {
                        dom.style.display = value;
                    }
                };

                avalon.applyEffect(dom, vdom, {
                    hook: show ? 'onEnterDone' : 'onLeaveDone',
                    cb: cb
                });
            }
        }
    });

    avalon.directive('text', {
        delay: true,
        init: function init() {

            var node = this.node;
            if (node.isVoidTag) {
                avalon.error('自闭合元素不能使用ms-text');
            }
            var child = { nodeName: '#text', nodeValue: this.getValue() };
            node.children.splice(0, node.children.length, child);
            if (inBrowser) {
                avalon.clearHTML(node.dom);
                node.dom.appendChild(avalon.vdom(child, 'toDOM'));
            }
            this.node = child;
            var type = 'expr';
            this.type = this.name = type;
            var directive$$1 = avalon.directives[type];
            var me = this;
            this.callback = function (value) {
                directive$$1.update.call(me, me.node, value);
            };
        }
    });

    avalon.directive('expr', {
        update: function update(vdom, value) {
            value = value == null || value === '' ? '\u200B' : value;
            vdom.nodeValue = value;
            //https://github.com/RubyLouvre/avalon/issues/1834
            if (vdom.dom) vdom.dom.data = value;
        }
    });

    avalon.directive('attr', {
        diff: cssDiff,
        update: function update(vdom, value) {
            var props = vdom.props;
            for (var i in value) {
                if (!!value[i] === false) {
                    delete props[i];
                } else {
                    props[i] = value[i];
                }
            }
            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                updateAttrs(dom, value);
            }
        }
    });

    avalon.directive('html', {

        update: function update(vdom, value) {
            this.beforeDispose();

            this.innerRender = avalon.scan('<div class="ms-html-container">' + value + '</div>', this.vm, function () {
                var oldRoot = this.root;
                if (vdom.children) vdom.children.length = 0;
                vdom.children = oldRoot.children;
                this.root = vdom;
                if (vdom.dom) avalon.clearHTML(vdom.dom);
            });
        },
        beforeDispose: function beforeDispose() {
            if (this.innerRender) {
                this.innerRender.dispose();
            }
        },
        delay: true
    });

    avalon.directive('if', {
        delay: true,
        priority: 5,
        init: function init() {
            this.placeholder = createAnchor('if');
            var props = this.node.props;
            delete props['ms-if'];
            delete props[':if'];
            this.fragment = avalon.vdom(this.node, 'toHTML');
        },
        diff: function diff(newVal, oldVal) {
            var n = !!newVal;
            if (oldVal === void 0 || n !== oldVal) {
                this.value = n;
                return true;
            }
        },
        update: function update(vdom, value) {
            if (this.isShow === void 0 && value) {
                continueScan(this, vdom);
                return;
            }
            this.isShow = value;
            var placeholder = this.placeholder;

            if (value) {
                var p = placeholder.parentNode;
                continueScan(this, vdom);
                p && p.replaceChild(vdom.dom, placeholder);
            } else {
                //移除DOM
                this.beforeDispose();
                vdom.nodeValue = 'if';
                vdom.nodeName = '#comment';
                delete vdom.children;
                var dom = vdom.dom;
                var p = dom && dom.parentNode;
                vdom.dom = placeholder;
                if (p) {
                    p.replaceChild(placeholder, dom);
                }
            }
        },
        beforeDispose: function beforeDispose() {
            if (this.innerRender) {
                this.innerRender.dispose();
            }
        }
    });

    function continueScan(instance, vdom) {
        var innerRender = instance.innerRender = avalon.scan(instance.fragment, instance.vm);
        avalon.shadowCopy(vdom, innerRender.root);
        delete vdom.nodeValue;
    }

    avalon.directive('on', {
        beforeInit: function beforeInit() {
            this.getter = avalon.noop;
        },
        init: function init() {
            var vdom = this.node;
            var underline = this.name.replace('ms-on-', 'e').replace('-', '_');
            var uuid = underline + '_' + this.expr.replace(/\s/g, '').replace(/[^$a-z]/ig, function (e) {
                return e.charCodeAt(0);
            });
            var fn = avalon.eventListeners[uuid];
            if (!fn) {
                var arr = addScope(this.expr);
                var body = arr[0],
                    filters = arr[1];
                body = makeHandle(body);

                if (filters) {
                    filters = filters.replace(/__value__/g, '$event');
                    filters += '\nif($event.$return){\n\treturn;\n}';
                }
                var ret = ['try{', '\tvar __vmodel__ = this;', '\t' + filters, '\treturn ' + body, '}catch(e){avalon.log(e, "in on dir")}'].filter(function (el) {
                    return (/\S/.test(el)
                    );
                });
                fn = new Function('$event', ret.join('\n'));
                fn.uuid = uuid;
                avalon.eventListeners[uuid] = fn;
            }

            var dom = avalon.vdom(vdom, 'toDOM');
            dom._ms_context_ = this.vm;

            this.eventType = this.param.replace(/\-(\d)$/, '');
            delete this.param;
            avalon(dom).bind(this.eventType, fn);
        },

        beforeDispose: function beforeDispose() {
            avalon(this.node.dom).unbind(this.eventType);
        }
    });

    var rforAs = /\s+as\s+([$\w]+)/;
    var rident = /^[$a-zA-Z_][$a-zA-Z0-9_]*$/;
    var rinvalid = /^(null|undefined|NaN|window|this|\$index|\$id)$/;
    var rargs = /[$\w_]+/g;
    avalon.directive('for', {
        delay: true,
        priority: 3,
        beforeInit: function beforeInit() {
            var str = this.expr,
                asName;
            str = str.replace(rforAs, function (a, b) {
                /* istanbul ignore if */
                if (!rident.test(b) || rinvalid.test(b)) {
                    avalon.error('alias ' + b + ' is invalid --- must be a valid JS identifier which is not a reserved name.');
                } else {
                    asName = b;
                }
                return '';
            });

            var arr = str.split(' in ');
            var kv = arr[0].match(rargs);
            if (kv.length === 1) {
                //确保avalon._each的回调有三个参数
                kv.unshift('$key');
            }
            this.expr = arr[1];
            this.keyName = kv[0];
            this.valName = kv[1];
            this.signature = avalon.makeHashCode('for');
            if (asName) {
                this.asName = asName;
            }

            delete this.param;
        },
        init: function init() {
            var cb = this.userCb;
            if (typeof cb === 'string' && cb) {
                var arr = addScope(cb, 'for');
                var body = makeHandle(arr[0]);
                this.userCb = new Function('$event', 'var __vmodel__ = this\nreturn ' + body);
            }
            this.node.forDir = this; //暴露给component/index.js中的resetParentChildren方法使用
            this.fragment = ['<div>', this.fragment, '<!--', this.signature, '--></div>'].join('');
            this.cache = {};
        },
        diff: function diff(newVal, oldVal) {
            /* istanbul ignore if */
            if (this.updating) {
                return;
            }
            this.updating = true;
            var traceIds = createFragments(this, newVal);

            if (this.oldTrackIds === void 0) return true;

            if (this.oldTrackIds !== traceIds) {
                this.oldTrackIds = traceIds;
                return true;
            }
        },
        update: function update() {

            if (!this.preFragments) {
                this.fragments = this.fragments || [];
                mountList(this);
            } else {
                diffList(this);
                updateList(this);
            }

            if (this.userCb) {
                var me = this;
                setTimeout(function () {
                    me.userCb.call(me.vm, {
                        type: 'rendered',
                        target: me.begin.dom,
                        signature: me.signature
                    });
                }, 0);
            }
            delete this.updating;
        },
        beforeDispose: function beforeDispose() {
            this.fragments.forEach(function (el) {
                el.dispose();
            });
        }
    });

    function getTraceKey(item) {
        var type = typeof item;
        return item && type === 'object' ? item.$hashcode : type + ':' + item;
    }

    //创建一组fragment的虚拟DOM
    function createFragments(instance, obj) {
        if (isObject(obj)) {
            var array = Array.isArray(obj);
            var ids = [];
            var fragments = [],
                i = 0;

            instance.isArray = array;
            if (instance.fragments) {
                instance.preFragments = instance.fragments;
                avalon.each(obj, function (key, value) {
                    var k = array ? getTraceKey(value) : key;

                    fragments.push({
                        key: k,
                        val: value,
                        index: i++
                    });
                    ids.push(k);
                });
                instance.fragments = fragments;
            } else {
                avalon.each(obj, function (key, value) {
                    if (!(key in $$skipArray)) {
                        var k = array ? getTraceKey(value) : key;
                        fragments.push(new VFragment([], k, value, i++));
                        ids.push(k);
                    }
                });
                instance.fragments = fragments;
            }
            return ids.join(';;');
        } else {
            return NaN;
        }
    }

    function mountList(instance) {
        var args = instance.fragments.map(function (fragment, index) {
            FragmentDecorator(fragment, instance, index);
            saveInCache(instance.cache, fragment);
            return fragment;
        });
        var list = instance.parentChildren;
        var i = list.indexOf(instance.begin);
        list.splice.apply(list, [i + 1, 0].concat(args));
    }

    function diffList(instance) {
        var cache = instance.cache;
        var newCache = {};
        var fuzzy = [];
        var list = instance.preFragments;

        list.forEach(function (el) {
            el._dispose = true;
        });

        instance.fragments.forEach(function (c, index) {
            var fragment = isInCache(cache, c.key);
            //取出之前的文档碎片
            if (fragment) {
                delete fragment._dispose;
                fragment.oldIndex = fragment.index;
                fragment.index = index; // 相当于 c.index

                resetVM(fragment.vm, instance.keyName);
                fragment.vm[instance.valName] = c.val;
                fragment.vm[instance.keyName] = instance.isArray ? index : fragment.key;
                saveInCache(newCache, fragment);
            } else {
                //如果找不到就进行模糊搜索
                fuzzy.push(c);
            }
        });
        fuzzy.forEach(function (c) {
            var fragment = fuzzyMatchCache(cache, c.key);
            if (fragment) {
                //重复利用
                fragment.oldIndex = fragment.index;
                fragment.key = c.key;
                var val = fragment.val = c.val;
                var index = fragment.index = c.index;

                fragment.vm[instance.valName] = val;
                fragment.vm[instance.keyName] = instance.isArray ? index : fragment.key;
                delete fragment._dispose;
            } else {

                c = new VFragment([], c.key, c.val, c.index);
                fragment = FragmentDecorator(c, instance, c.index);
                list.push(fragment);
            }
            saveInCache(newCache, fragment);
        });

        instance.fragments = list;
        list.sort(function (a, b) {
            return a.index - b.index;
        });
        instance.cache = newCache;
    }

    function resetVM(vm, a, b) {
        if (avalon.config.inProxyMode) {
            vm.$accessors[a].value = NaN;
        } else {
            vm.$accessors[a].set(NaN);
        }
    }

    function updateList(instance) {
        var before = instance.begin.dom;
        var parent = before.parentNode;
        var list = instance.fragments;
        var end = instance.end.dom;
        for (var i = 0, item; item = list[i]; i++) {
            if (item._dispose) {
                list.splice(i, 1);
                i--;
                item.dispose();
                continue;
            }
            if (item.oldIndex !== item.index) {
                var f = item.toFragment();
                var isEnd = before.nextSibling === null;
                parent.insertBefore(f, before.nextSibling);
                if (isEnd && !parent.contains(end)) {
                    parent.insertBefore(end, before.nextSibling);
                }
            }
            before = item.split;
        }
        var ch = instance.parentChildren;
        var startIndex = ch.indexOf(instance.begin);
        var endIndex = ch.indexOf(instance.end);

        list.splice.apply(ch, [startIndex + 1, endIndex - startIndex].concat(list));
    }

    /**
     * 
     * @param {type} fragment
     * @param {type} this
     * @param {type} index
     * @returns { key, val, index, oldIndex, this, dom, split, vm}
     */
    function FragmentDecorator(fragment, instance, index) {
        var data = {};
        data[instance.keyName] = instance.isArray ? index : fragment.key;
        data[instance.valName] = fragment.val;
        if (instance.asName) {
            data[instance.asName] = instance.value;
        }
        var vm = fragment.vm = platform.itemFactory(instance.vm, {
            data: data
        });
        if (instance.isArray) {
            vm.$watch(instance.valName, function (a) {
                if (instance.value && instance.value.set) {
                    instance.value.set(vm[instance.keyName], a);
                }
            });
        } else {
            vm.$watch(instance.valName, function (a) {
                instance.value[fragment.key] = a;
            });
        }

        fragment.index = index;
        fragment.innerRender = avalon.scan(instance.fragment, vm, function () {
            var oldRoot = this.root;
            ap.push.apply(fragment.children, oldRoot.children);
            this.root = fragment;
        });
        return fragment;
    }
    // 新位置: 旧位置
    function isInCache(cache, id) {
        var c = cache[id];
        if (c) {
            var arr = c.arr;
            /* istanbul ignore if*/
            if (arr) {
                var r = arr.pop();
                if (!arr.length) {
                    c.arr = 0;
                }
                return r;
            }
            delete cache[id];
            return c;
        }
    }
    //[1,1,1] number1 number1_ number1__
    function saveInCache(cache, component) {
        var trackId = component.key;
        if (!cache[trackId]) {
            cache[trackId] = component;
        } else {
            var c = cache[trackId];
            var arr = c.arr || (c.arr = []);
            arr.push(component);
        }
    }

    function fuzzyMatchCache(cache) {
        var key;
        for (var id in cache) {
            var key = id;
            break;
        }
        if (key) {
            return isInCache(cache, key);
        }
    }

    //根据VM的属性值或表达式的值切换类名，ms-class='xxx yyy zzz:flag'
    //http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
    function classNames() {
        var classes = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            var argType = typeof arg;
            if (argType === 'string' || argType === 'number' || arg === true) {
                classes.push(arg);
            } else if (Array.isArray(arg)) {
                classes.push(classNames.apply(null, arg));
            } else if (argType === 'object') {
                for (var key in arg) {
                    if (arg.hasOwnProperty(key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
        }

        return classes.join(' ');
    }

    avalon.directive('class', {
        diff: function diff(newVal, oldVal) {
            var type = this.type;
            var vdom = this.node;
            var classEvent = vdom.classEvent || {};
            if (type === 'hover') {
                //在移出移入时切换类名
                classEvent.mouseenter = activateClass;
                classEvent.mouseleave = abandonClass;
            } else if (type === 'active') {
                //在获得焦点时切换类名
                classEvent.tabIndex = vdom.props.tabindex || -1;
                classEvent.mousedown = activateClass;
                classEvent.mouseup = abandonClass;
                classEvent.mouseleave = abandonClass;
            }
            vdom.classEvent = classEvent;

            var className = classNames(newVal);

            if (typeof oldVal === void 0 || oldVal !== className) {
                this.value = className;

                vdom['change-' + type] = className;
                return true;
            }
        },
        update: function update(vdom, value) {
            var dom = vdom.dom;
            if (dom && dom.nodeType == 1) {

                var dirType = this.type;
                var change = 'change-' + dirType;
                var classEvent = vdom.classEvent;
                if (classEvent) {
                    for (var i in classEvent) {
                        if (i === 'tabIndex') {
                            dom[i] = classEvent[i];
                        } else {
                            avalon.bind(dom, i, classEvent[i]);
                        }
                    }
                    vdom.classEvent = {};
                }
                var names = ['class', 'hover', 'active'];
                names.forEach(function (type) {
                    if (dirType !== type) return;
                    if (type === 'class') {
                        dom && setClass(dom, value);
                    } else {
                        var oldClass = dom.getAttribute(change);
                        if (oldClass) {
                            avalon(dom).removeClass(oldClass);
                        }
                        var name = 'change-' + type;
                        dom.setAttribute(name, value);
                    }
                });
            }
        }
    });

    directives.active = directives.hover = directives['class'];

    var classMap = {
        mouseenter: 'change-hover',
        mouseleave: 'change-hover',
        mousedown: 'change-active',
        mouseup: 'change-active'
    };

    function activateClass(e) {
        var elem = e.target;
        avalon(elem).addClass(elem.getAttribute(classMap[e.type]) || '');
    }

    function abandonClass(e) {
        var elem = e.target;
        var name = classMap[e.type];
        avalon(elem).removeClass(elem.getAttribute(name) || '');
        if (name !== 'change-active') {
            avalon(elem).removeClass(elem.getAttribute('change-active') || '');
        }
    }

    function setClass(dom, neo) {
        var old = dom.getAttribute('change-class');
        if (old !== neo) {
            avalon(dom).removeClass(old).addClass(neo);
            dom.setAttribute('change-class', neo);
        }
    }

    getLongID(activateClass);
    getLongID(abandonClass);

    function lookupOption(vdom, values) {
        vdom.children && vdom.children.forEach(function (el) {
            if (el.nodeName === 'option') {
                setOption(el, values);
            } else {
                lookupOption(el, values);
            }
        });
    }

    function setOption(vdom, values) {
        var props = vdom.props;
        if (!('disabled' in props)) {
            var value = getOptionValue(vdom, props);
            value = String(value || '').trim();
            props.selected = values.indexOf(value) !== -1;

            if (vdom.dom) {
                vdom.dom.selected = props.selected;
                var v = vdom.dom.selected; //必须加上这个,防止移出节点selected失效
            }
        }
    }

    function getOptionValue(vdom, props) {
        if (props && 'value' in props) {
            return props.value + '';
        }
        var arr = [];
        vdom.children.forEach(function (el) {
            if (el.nodeName === '#text') {
                arr.push(el.nodeValue);
            } else if (el.nodeName === '#document-fragment') {
                arr.push(getOptionValue(el));
            }
        });
        return arr.join('');
    }

    function getSelectedValue(vdom, arr) {
        vdom.children.forEach(function (el) {
            if (el.nodeName === 'option') {
                if (el.props.selected === true) arr.push(getOptionValue(el, el.props));
            } else if (el.children) {
                getSelectedValue(el, arr);
            }
        });
        return arr;
    }

    var updateDataActions = {
        input: function input(prop) {
            //处理单个value值处理
            var field = this;
            prop = prop || 'value';
            var dom = field.dom;
            var rawValue = dom[prop];
            var parsedValue = field.parseValue(rawValue);

            //有时候parse后一致,vm不会改变,但input里面的值
            field.value = rawValue;
            field.setValue(parsedValue);
            duplexCb(field);
            var pos = field.pos;
            /* istanbul ignore if */
            if (dom.caret) {
                field.setCaret(dom, pos);
            }
            //vm.aaa = '1234567890'
            //处理 <input ms-duplex='@aaa|limitBy(8)'/>{{@aaa}} 这种格式化同步不一致的情况 
        },
        radio: function radio() {
            var field = this;
            if (field.isChecked) {
                var val = !field.value;
                field.setValue(val);
                duplexCb(field);
            } else {
                updateDataActions.input.call(field);
                field.value = NaN;
            }
        },
        checkbox: function checkbox() {
            var field = this;
            var array = field.value;
            if (!Array.isArray(array)) {
                avalon.warn('ms-duplex应用于checkbox上要对应一个数组');
                array = [array];
            }
            var method = field.dom.checked ? 'ensure' : 'remove';
            if (array[method]) {
                var val = field.parseValue(field.dom.value);
                array[method](val);
                duplexCb(field);
            }
            this.__test__ = array;
        },
        select: function select() {
            var field = this;
            var val = avalon(field.dom).val(); //字符串或字符串数组
            if (val + '' !== this.value + '') {
                if (Array.isArray(val)) {
                    //转换布尔数组或其他
                    val = val.map(function (v) {
                        return field.parseValue(v);
                    });
                } else {
                    val = field.parseValue(val);
                }
                field.setValue(val);
                duplexCb(field);
            }
        },
        contenteditable: function contenteditable() {
            updateDataActions.input.call(this, 'innerHTML');
        }
    };

    function duplexCb(field) {
        if (field.userCb) {
            field.userCb.call(field.vm, {
                type: 'changed',
                target: field.dom
            });
        }
    }

    function updateDataHandle(event) {
        var elem = this;
        var field = elem._ms_duplex_;
        if (elem.composing) {
            //防止onpropertychange引发爆栈
            return;
        }
        if (elem.value === field.value) {
            return;
        }
        /* istanbul ignore if*/
        if (elem.caret) {
            try {
                var pos = field.getCaret(elem);
                field.pos = pos;
            } catch (e) {}
        }
        /* istanbul ignore if*/
        if (field.debounceTime > 4) {
            var timestamp = new Date();
            var left = timestamp - field.time || 0;
            field.time = timestamp;
            /* istanbul ignore if*/
            if (left >= field.debounceTime) {
                updateDataActions[field.dtype].call(field);
                /* istanbul ignore else*/
            } else {
                clearTimeout(field.debounceID);
                field.debounceID = setTimeout(function () {
                    updateDataActions[field.dtype].call(field);
                }, left);
            }
        } else {
            updateDataActions[field.dtype].call(field);
        }
    }

    var rchangeFilter = /\|\s*change\b/;
    var rdebounceFilter = /\|\s*debounce(?:\(([^)]+)\))?/;
    function duplexBeforeInit() {
        var expr = this.expr;
        if (rchangeFilter.test(expr)) {
            this.isChanged = true;
            expr = expr.replace(rchangeFilter, '');
        }
        var match = expr.match(rdebounceFilter);
        if (match) {
            expr = expr.replace(rdebounceFilter, '');
            if (!this.isChanged) {
                this.debounceTime = parseInt(match[1], 10) || 300;
            }
        }
        this.expr = expr;
    }
    function duplexInit() {
        var expr = this.expr;
        var node = this.node;
        var etype = node.props.type;
        this.parseValue = parseValue;
        //处理数据转换器
        var parsers = this.param,
            dtype;
        var isChecked = false;
        parsers = parsers ? parsers.split('-').map(function (a) {
            if (a === 'checked') {
                isChecked = true;
            }
            return a;
        }) : [];
        node.duplex = this;
        if (rcheckedType.test(etype) && isChecked) {
            //如果是radio, checkbox,判定用户使用了checked格式函数没有
            parsers = [];
            dtype = 'radio';
            this.isChecked = isChecked;
        }
        this.parsers = parsers;
        if (!/input|textarea|select/.test(node.nodeName)) {
            if ('contenteditable' in node.props) {
                dtype = 'contenteditable';
            }
        } else if (!dtype) {
            dtype = node.nodeName === 'select' ? 'select' : etype === 'checkbox' ? 'checkbox' : etype === 'radio' ? 'radio' : 'input';
        }
        this.dtype = dtype;

        //判定是否使用了 change debounce 过滤器
        // this.isChecked = /boolean/.test(parsers)
        if (dtype !== 'input' && dtype !== 'contenteditable') {
            delete this.isChange;
            delete this.debounceTime;
        } else if (!this.isChecked) {
            this.isString = true;
        }

        var cb = node.props['data-duplex-changed'];
        if (cb) {
            var arr = addScope(cb, 'xx');
            var body = makeHandle(arr[0]);
            this.userCb = new Function('$event', 'var __vmodel__ = this\nreturn ' + body);
        }
    }
    function duplexDiff(newVal, oldVal) {
        if (Array.isArray(newVal)) {
            if (newVal + '' !== this.compareVal) {
                this.compareVal = newVal + '';
                return true;
            }
        } else {
            newVal = this.parseValue(newVal);
            if (!this.isChecked) {
                this.value = newVal += '';
            }
            if (newVal !== this.compareVal) {
                this.compareVal = newVal;
                return true;
            }
        }
    }

    function duplexBind(vdom, addEvent) {
        var dom = vdom.dom;
        this.dom = dom;
        this.vdom = vdom;
        this.duplexCb = updateDataHandle;
        dom._ms_duplex_ = this;
        //绑定事件
        addEvent(dom, this);
    }

    var valueHijack = true;
    try {
        //#272 IE9-IE11, firefox
        var setters = {};
        var aproto = HTMLInputElement.prototype;
        var bproto = HTMLTextAreaElement.prototype;
        var newSetter = function newSetter(value) {
            // jshint ignore:line
            setters[this.tagName].call(this, value);
            var data = this._ms_duplex_;
            if (!this.caret && data && data.isString) {
                data.duplexCb.call(this, { type: 'setter' });
            }
        };
        var inputProto = HTMLInputElement.prototype;
        Object.getOwnPropertyNames(inputProto); //故意引发IE6-8等浏览器报错
        setters['INPUT'] = Object.getOwnPropertyDescriptor(aproto, 'value').set;

        Object.defineProperty(aproto, 'value', {
            set: newSetter
        });
        setters['TEXTAREA'] = Object.getOwnPropertyDescriptor(bproto, 'value').set;
        Object.defineProperty(bproto, 'value', {
            set: newSetter
        });
        valueHijack = false;
    } catch (e) {
        //在chrome 43中 ms-duplex终于不需要使用定时器实现双向绑定了
        // http://updates.html5rocks.com/2015/04/DOM-attributes-now-on-the-prototype
        // https://docs.google.com/document/d/1jwA8mtClwxI-QJuHT7872Z0pxpZz8PBkf2bGAbsUtqs/edit?pli=1
    }

    function parseValue(val) {
        for (var i = 0, k; k = this.parsers[i++];) {
            var fn = avalon.parsers[k];
            if (fn) {
                val = fn.call(this, val);
            }
        }
        return val;
    }

    var updateView = {
        input: function input() {
            //处理单个value值处理
            var vdom = this.node;
            var value = this.value + '';
            vdom.dom.value = vdom.props.value = value;
        },
        updateChecked: function updateChecked(vdom, checked) {
            if (vdom.dom) {
                vdom.dom.defaultChecked = vdom.dom.checked = checked;
            }
        },
        radio: function radio() {
            //处理单个checked属性
            var node = this.node;
            var nodeValue = node.props.value;
            var checked;
            if (this.isChecked) {
                checked = !!this.value;
            } else {
                checked = this.value + '' === nodeValue;
            }
            node.props.checked = checked;
            updateView.updateChecked(node, checked);
        },
        checkbox: function checkbox() {
            //处理多个checked属性
            var node = this.node;
            var props = node.props;
            var value = props.value + '';
            var values = [].concat(this.value);
            var checked = values.some(function (el) {
                return el + '' === value;
            });

            props.defaultChecked = props.checked = checked;
            updateView.updateChecked(node, checked);
        },
        select: function select() {
            //处理子级的selected属性
            var a = Array.isArray(this.value) ? this.value.map(String) : this.value + '';
            lookupOption(this.node, a);
        },
        contenteditable: function contenteditable() {
            //处理单个innerHTML 

            var vnodes = fromString(this.value);
            var fragment = createFragment();
            for (var i = 0, el; el = vnodes[i++];) {
                var child = avalon.vdom(el, 'toDOM');
                fragment.appendChild(child);
            }
            avalon.clearHTML(this.dom).appendChild(fragment);
            var list = this.node.children;
            list.length = 0;
            Array.prototype.push.apply(list, vnodes);

            this.duplexCb.call(this.dom);
        }
    };

    /* 
     * 通过绑定事件同步vmodel
     * 总共有三种方式同步视图
     * 1. 各种事件 input, change, click, propertychange, keydown...
     * 2. value属性重写
     * 3. 定时器轮询
     */

    function updateDataEvents(dom, data) {
        var events = {};
        //添加需要监听的事件
        switch (data.dtype) {
            case 'radio':
            case 'checkbox':
                events.click = updateDataHandle;
                break;
            case 'select':
                events.change = updateDataHandle;
                break;
            case 'contenteditable':
                /* istanbul ignore if */
                if (data.isChanged) {
                    events.blur = updateDataHandle;
                    /* istanbul ignore else */
                } else {
                    /* istanbul ignore if*/

                    if (avalon.modern) {
                        if (window$1.webkitURL) {
                            // http://code.metager.de/source/xref/WebKit/LayoutTests/fast/events/
                            // https://bugs.webkit.org/show_bug.cgi?id=110742
                            events.webkitEditableContentChanged = updateDataHandle;
                        } else if (window$1.MutationEvent) {
                            events.DOMCharacterDataModified = updateDataHandle;
                        }
                        events.input = updateDataHandle;
                        /* istanbul ignore else */
                    } else {
                        events.keydown = updateModelKeyDown;
                        events.paste = updateModelDelay;
                        events.cut = updateModelDelay;
                        events.focus = closeComposition;
                        events.blur = openComposition;
                    }
                }
                break;
            case 'input':
                /* istanbul ignore if */
                if (data.isChanged) {
                    events.change = updateDataHandle;
                    /* istanbul ignore else */
                } else {
                    //http://www.cnblogs.com/rubylouvre/archive/2013/02/17/2914604.html
                    //http://www.matts411.com/post/internet-explorer-9-oninput/
                    if (msie < 10) {
                        //IE6-8的propertychange有问题,第一次用JS修改值时不会触发,而且你是全部清空value也不会触发
                        //IE9的propertychange不支持自动完成,退格,删除,复制,贴粘,剪切或点击右边的小X的清空操作
                        events.propertychange = updateModelHack;
                        events.paste = updateModelDelay;
                        events.cut = updateModelDelay;
                        //IE9在第一次删除字符时不会触发oninput
                        events.keyup = updateModelKeyDown;
                    } else {
                        events.input = updateDataHandle;
                        events.compositionstart = openComposition;
                        //微软拼音输入法的问题需要在compositionend事件中处理
                        events.compositionend = closeComposition;
                        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
                        //处理低版本的标准浏览器,通过Int8Array进行区分
                        if (!/\[native code\]/.test(window$1.Int8Array)) {
                            events.keydown = updateModelKeyDown; //safari < 5 opera < 11
                            events.paste = updateModelDelay; //safari < 5
                            events.cut = updateModelDelay; //safari < 5 
                            if (window$1.netscape) {
                                // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
                                events.DOMAutoComplete = updateDataHandle;
                            }
                        }
                    }
                }
                break;
        }

        if (/password|text/.test(dom.type)) {
            events.focus = openCaret; //判定是否使用光标修正功能 
            events.blur = closeCaret;
            data.getCaret = getCaret;
            data.setCaret = setCaret;
        }

        for (var name in events) {
            avalon.bind(dom, name, events[name]);
        }
    }

    function updateModelHack(e) {
        if (e.propertyName === 'value') {
            updateDataHandle.call(this, e);
        }
    }

    function updateModelDelay(e) {
        var elem = this;
        setTimeout(function () {
            updateDataHandle.call(elem, e);
        }, 0);
    }

    function openCaret() {
        this.caret = true;
    }
    /* istanbul ignore next */
    function closeCaret() {
        this.caret = false;
    }
    /* istanbul ignore next */
    function openComposition() {
        this.composing = true;
    }
    /* istanbul ignore next */
    function closeComposition(e) {
        this.composing = false;
        updateModelDelay.call(this, e);
    }
    /* istanbul ignore next */
    function updateModelKeyDown(e) {
        var key = e.keyCode;
        // ignore
        //    command            modifiers                   arrows
        if (key === 91 || 15 < key && key < 19 || 37 <= key && key <= 40) return;
        updateDataHandle.call(this, e);
    }

    getShortID(openCaret);
    getShortID(closeCaret);
    getShortID(openComposition);
    getShortID(closeComposition);
    getShortID(updateDataHandle);
    getShortID(updateModelHack);
    getShortID(updateModelDelay);
    getShortID(updateModelKeyDown);

    //IE6-8要处理光标时需要异步
    var mayBeAsync = function mayBeAsync(fn) {
        setTimeout(fn, 0);
    };
    /* istanbul ignore next */
    function setCaret(target, cursorPosition) {
        var range$$1;
        if (target.createTextRange) {
            mayBeAsync(function () {
                target.focus();
                range$$1 = target.createTextRange();
                range$$1.collapse(true);
                range$$1.moveEnd('character', cursorPosition);
                range$$1.moveStart('character', cursorPosition);
                range$$1.select();
            });
        } else {
            target.focus();
            if (target.selectionStart !== undefined) {
                target.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    }
    /* istanbul ignore next*/
    function getCaret(target) {
        var start = 0;
        var normalizedValue;
        var range$$1;
        var textInputRange;
        var len;
        var endRange;

        if (target.selectionStart + target.selectionEnd > -1) {
            start = target.selectionStart;
        } else {
            range$$1 = document$1.selection.createRange();

            if (range$$1 && range$$1.parentElement() === target) {
                len = target.value.length;
                normalizedValue = target.value.replace(/\r\n/g, '\n');

                textInputRange = target.createTextRange();
                textInputRange.moveToBookmark(range$$1.getBookmark());

                endRange = target.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                    start = len;
                } else {
                    start = -textInputRange.moveStart('character', -len);
                    start += normalizedValue.slice(0, start).split('\n').length - 1;
                }
            }
        }

        return start;
    }

    avalon.directive('duplex', {
        priority: 9999999,
        beforeInit: duplexBeforeInit,
        init: duplexInit,
        diff: duplexDiff,
        update: function update(vdom, value) {
            if (!this.dom) {
                duplexBind.call(this, vdom, updateDataEvents);
            }
            //如果不支持input.value的Object.defineProperty的属性支持,
            //需要通过轮询同步, chrome 42及以下版本需要这个hack
            pollValue.call(this, avalon.msie, valueHijack);
            //更新视图

            updateView[this.dtype].call(this);
        }
    });

    function pollValue(isIE, valueHijack$$1) {
        var dom = this.dom;
        if (this.isString && valueHijack$$1 && !isIE && !dom.valueHijack) {
            dom.valueHijack = updateDataHandle;
            var intervalID = setInterval(function () {
                if (!avalon.contains(avalon.root, dom)) {
                    clearInterval(intervalID);
                } else {
                    dom.valueHijack({ type: 'poll' });
                }
            }, 30);
            return intervalID;
        }
    }
    avalon.__pollValue = pollValue; //export to test
    /* istanbul ignore if */
    if (avalon.msie < 8) {
        var oldUpdate = updateView.updateChecked;
        updateView.updateChecked = function (vdom, checked) {
            var dom = vdom.dom;
            if (dom) {
                setTimeout(function () {
                    oldUpdate(vdom, checked);
                    dom.firstCheckedIt = 1;
                }, dom.firstCheckedIt ? 31 : 16);
                //IE6,7 checkbox, radio是使用defaultChecked控制选中状态，
                //并且要先设置defaultChecked后设置checked
                //并且必须设置延迟(因为必须插入DOM树才生效)
            }
        };
    }

    avalon.directive('rules', {
        diff: function diff(rules) {
            if (isObject(rules)) {
                var vdom = this.node;
                vdom.rules = platform.toJson(rules);
                return true;
            }
        }
    });
    function isRegExp(value) {
        return avalon.type(value) === 'regexp';
    }
    var rmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i;
    var rurl = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
    function isCorrectDate(value) {
        if (typeof value === "string" && value) {
            //是字符串但不能是空字符
            var arr = value.split("-"); //可以被-切成3份，并且第1个是4个字符
            if (arr.length === 3 && arr[0].length === 4) {
                var year = ~~arr[0]; //全部转换为非负整数
                var month = ~~arr[1] - 1;
                var date = ~~arr[2];
                var d = new Date(year, month, date);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === date;
            }
        }
        return false;
    }
    //https://github.com/adform/validator.js/blob/master/validator.js
    avalon.shadowCopy(avalon.validators, {
        pattern: {
            message: '必须匹配{{pattern}}这样的格式',
            get: function get(value, field, next) {
                var elem = field.dom;
                var data = field.data;
                if (!isRegExp(data.pattern)) {
                    var h5pattern = elem.getAttribute("pattern");
                    data.pattern = new RegExp('^(?:' + h5pattern + ')$');
                }
                next(data.pattern.test(value));
                return value;
            }
        },
        digits: {
            message: '必须整数',
            get: function get(value, field, next) {
                //整数
                next(/^\-?\d+$/.test(value));
                return value;
            }
        },
        number: {
            message: '必须数字',
            get: function get(value, field, next) {
                //数值
                next(!!value && isFinite(value)); // isFinite('') --> true
                return value;
            }
        },
        norequired: {
            message: '',
            get: function get(value, field, next) {
                next(true);
                return value;
            }
        },
        required: {
            message: '必须填写',
            get: function get(value, field, next) {
                next(value !== '');
                return value;
            }
        },
        equalto: {
            message: '密码输入不一致',
            get: function get(value, field, next) {
                var id = String(field.data.equalto);
                var other = avalon(document.getElementById(id)).val() || "";
                next(value === other);
                return value;
            }
        },
        date: {
            message: '日期格式不正确',
            get: function get(value, field, next) {
                var data = field.data;
                if (isRegExp(data.date)) {
                    next(data.date.test(value));
                } else {
                    next(isCorrectDate(value));
                }
                return value;
            }
        },
        url: {
            message: 'URL格式不正确',
            get: function get(value, field, next) {
                next(rurl.test(value));
                return value;
            }
        },
        email: {
            message: 'email格式不正确',
            get: function get(value, field, next) {
                next(rmail.test(value));
                return value;
            }
        },
        minlength: {
            message: '最少输入{{minlength}}个字',
            get: function get(value, field, next) {
                var num = parseInt(field.data.minlength, 10);
                next(value.length >= num);
                return value;
            }
        },
        maxlength: {
            message: '最多输入{{maxlength}}个字',
            get: function get(value, field, next) {
                var num = parseInt(field.data.maxlength, 10);
                next(value.length <= num);
                return value;
            }
        },
        min: {
            message: '输入值不能小于{{min}}',
            get: function get(value, field, next) {
                var num = parseInt(field.data.min, 10);
                next(parseFloat(value) >= num);
                return value;
            }
        },
        max: {
            message: '输入值不能大于{{max}}',
            get: function get(value, field, next) {
                var num = parseInt(field.data.max, 10);
                next(parseFloat(value) <= num);
                return value;
            }
        },
        chs: {
            message: '必须是中文字符',
            get: function get(value, field, next) {
                next(/^[\u4e00-\u9fa5]+$/.test(value));
                return value;
            }
        }
    });

    var valiDir = avalon.directive('validate', {
        diff: function diff(validator) {
            var vdom = this.node;
            if (vdom.validator) {
                return;
            }
            if (isObject(validator)) {
                //注意，这个Form标签的虚拟DOM有两个验证对象
                //一个是vmValidator，它是用户VM上的那个原始子对象，也是一个VM
                //一个是validator，它是vmValidator.$model， 这是为了防止IE6－8添加子属性时添加的hack
                //也可以称之为safeValidate
                vdom.vmValidator = validator;
                validator = platform.toJson(validator);
                validator.vdom = vdom;
                vdom.validator = validator;
                for (var name in valiDir.defaults) {
                    if (!validator.hasOwnProperty(name)) {
                        validator[name] = valiDir.defaults[name];
                    }
                }
                validator.fields = validator.fields || [];
                return true;
            }
        },
        update: function update(vdom) {

            var validator = vdom.validator;
            var dom = validator.dom = vdom.dom;
            dom._ms_validate_ = validator;
            var fields = validator.fields;
            collectFeild(vdom.children, fields, validator);
            avalon.bind(document, 'focusin', function (e) {
                var dom = e.target;
                var duplex = dom._ms_duplex_;
                var vdom = (duplex || {}).vdom;
                if (duplex && vdom.rules && !duplex.validator) {
                    if (avalon.Array.ensure(fields, duplex)) {
                        bindValidateEvent(duplex, validator);
                    }
                }
            });

            //为了方便用户手动执行验证，我们需要为原始vmValidate上添加一个onManual方法
            var v = vdom.vmValidator;
            try {
                v.onManual = onManual;
            } catch (e) {}
            delete vdom.vmValidator;

            dom.setAttribute('novalidate', 'novalidate');

            function onManual() {
                valiDir.validateAll.call(validator, validator.onValidateAll);
            }
            /* istanbul ignore if */
            if (validator.validateAllInSubmit) {
                avalon.bind(dom, 'submit', function (e) {
                    e.preventDefault();
                    onManual();
                });
            }
        },
        validateAll: function validateAll(callback) {
            var validator = this;
            var vdom = this.vdom;
            var fields = validator.fields = [];
            collectFeild(vdom.children, fields, validator);
            var fn = typeof callback === 'function' ? callback : validator.onValidateAll;
            var promises = validator.fields.filter(function (field) {
                var el = field.dom;
                return el && !el.disabled && validator.dom.contains(el);
            }).map(function (field) {
                return valiDir.validate(field, true);
            });
            var uniq = {};
            return Promise.all(promises).then(function (array) {
                var reasons = array.concat.apply([], array);
                if (validator.deduplicateInValidateAll) {

                    reasons = reasons.filter(function (reason) {
                        var el = reason.element;
                        var uuid = el.uniqueID || (el.uniqueID = setTimeout('1'));

                        if (uniq[uuid]) {
                            return false;
                        } else {
                            return uniq[uuid] = true;
                        }
                    });
                }
                fn.call(validator.dom, reasons); //这里只放置未通过验证的组件
            });
        },

        validate: function validate(field, isValidateAll, event) {
            var promises = [];
            var value = field.value;
            var elem = field.dom;

            /* istanbul ignore if */
            if (typeof Promise !== 'function') {
                //avalon-promise不支持phantomjs
                avalon.warn('浏览器不支持原生Promise,请下载并<script src=url>引入\nhttps://github.com/RubyLouvre/avalon/blob/master/test/promise.js');
            }
            /* istanbul ignore if */
            if (elem.disabled) return;
            var rules = field.vdom.rules;
            var ngs = [],
                isOk = true;
            if (!(rules.norequired && value === '')) {
                for (var ruleName in rules) {
                    var ruleValue = rules[ruleName];
                    if (ruleValue === false) continue;
                    var hook = avalon.validators[ruleName];
                    var resolve;
                    promises.push(new Promise(function (a, b) {
                        resolve = a;
                    }));
                    var next = function next(a) {
                        var reason = {
                            element: elem,
                            data: field.data,
                            message: elem.getAttribute('data-' + ruleName + '-message') || elem.getAttribute('data-message') || hook.message,
                            validateRule: ruleName,
                            getMessage: getMessage
                        };
                        if (a) {
                            resolve(true);
                        } else {
                            isOk = false;
                            ngs.push(reason);
                            resolve(false);
                        }
                    };
                    field.data = {};
                    field.data[ruleName] = ruleValue;
                    hook.get(value, field, next);
                }
            }

            //如果promises不为空，说明经过验证拦截器
            return Promise.all(promises).then(function (array) {
                if (!isValidateAll) {
                    var validator = field.validator;
                    if (isOk) {
                        validator.onSuccess.call(elem, [{
                            data: field.data,
                            element: elem
                        }], event);
                    } else {
                        validator.onError.call(elem, ngs, event);
                    }
                    validator.onComplete.call(elem, ngs, event);
                }
                return ngs;
            });
        }
    });

    function collectFeild(nodes, fields, validator) {
        for (var i = 0, vdom; vdom = nodes[i++];) {
            var duplex = vdom.rules && vdom.duplex;
            if (duplex) {
                fields.push(duplex);
                bindValidateEvent(duplex, validator);
            } else if (vdom.children) {
                collectFeild(vdom.children, fields, validator);
            } else if (Array.isArray(vdom)) {
                collectFeild(vdom, fields, validator);
            }
        }
    }

    function bindValidateEvent(field, validator) {

        var node = field.dom;
        if (field.validator) {
            return;
        }
        field.validator = validator;
        /* istanbul ignore if */
        if (validator.validateInKeyup && !field.isChanged && !field.debounceTime) {
            avalon.bind(node, 'keyup', function (e) {
                validator.validate(field, 0, e);
            });
        }
        /* istanbul ignore if */
        if (validator.validateInBlur) {
            avalon.bind(node, 'blur', function (e) {
                validator.validate(field, 0, e);
            });
        }
        /* istanbul ignore if */
        if (validator.resetInFocus) {
            avalon.bind(node, 'focus', function (e) {
                validator.onReset.call(node, e, field);
            });
        }
    }
    var rformat = /\\?{{([^{}]+)\}}/gm;

    function getMessage() {
        var data = this.data || {};
        return this.message.replace(rformat, function (_, name) {
            return data[name] == null ? '' : data[name];
        });
    }
    valiDir.defaults = {
        validate: valiDir.validate,
        onError: avalon.noop,
        onSuccess: avalon.noop,
        onComplete: avalon.noop,
        onManual: avalon.noop,
        onReset: avalon.noop,
        onValidateAll: avalon.noop,
        validateInBlur: true, //@config {Boolean} true，在blur事件中进行验证,触发onSuccess, onError, onComplete回调
        validateInKeyup: true, //@config {Boolean} true，在keyup事件中进行验证,触发onSuccess, onError, onComplete回调
        validateAllInSubmit: true, //@config {Boolean} true，在submit事件中执行onValidateAll回调
        resetInFocus: true, //@config {Boolean} true，在focus事件中执行onReset回调,
        deduplicateInValidateAll: false //@config {Boolean} false，在validateAll回调中对reason数组根据元素节点进行去重
    };

    /**
     * 一个directive装饰器
     * @returns {directive}
     */
    // DirectiveDecorator(scope, binding, vdom, this)
    // Decorator(vm, options, callback)
    function Directive(vm, binding, vdom, render) {
        var type = binding.type;
        var decorator = avalon.directives[type];
        if (inBrowser) {
            var dom = avalon.vdom(vdom, 'toDOM');
            if (dom.nodeType === 1) {
                dom.removeAttribute(binding.attrName);
            }
            vdom.dom = dom;
        }
        var callback = decorator.update ? function (value) {
            if (!render.mount && /css|visible|duplex/.test(type)) {
                render.callbacks.push(function () {
                    decorator.update.call(directive$$1, directive$$1.node, value);
                });
            } else {
                decorator.update.call(directive$$1, directive$$1.node, value);
            }
        } : avalon.noop;
        for (var key in decorator) {
            binding[key] = decorator[key];
        }
        binding.node = vdom;
        var directive$$1 = new Action(vm, binding, callback);
        if (directive$$1.init) {
            //这里可能会重写node, callback, type, name
            directive$$1.init();
        }
        directive$$1.update();
        return directive$$1;
    }

    var eventMap = avalon.oneObject('animationend,blur,change,input,' + 'click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,' + 'mouseleave,mousemove,mouseout,mouseover,mouseup,scan,scroll,submit', 'on');
    function parseAttributes(dirs, tuple) {
        var node = tuple[0],
            uniq = {},
            bindings = [];
        var hasIf = false;
        for (var name in dirs) {
            var value = dirs[name];
            var arr = name.split('-');
            // ms-click
            if (name in node.props) {
                var attrName = name;
            } else {
                attrName = ':' + name.slice(3);
            }
            if (eventMap[arr[1]]) {
                arr.splice(1, 0, 'on');
            }
            //ms-on-click
            if (arr[1] === 'on') {
                arr[3] = parseFloat(arr[3]) || 0;
            }

            var type = arr[1];
            if (type === 'controller' || type === 'important') continue;
            if (directives[type]) {

                var binding = {
                    type: type,
                    param: arr[2],
                    attrName: attrName,
                    name: arr.join('-'),
                    expr: value,
                    priority: directives[type].priority || type.charCodeAt(0) * 100
                };
                if (type === 'if') {
                    hasIf = true;
                }
                if (type === 'on') {
                    binding.priority += arr[3];
                }
                if (!uniq[binding.name]) {
                    uniq[binding.name] = value;
                    bindings.push(binding);
                    if (type === 'for') {
                        return [avalon.mix(binding, tuple[3])];
                    }
                }
            }
        }
        bindings.sort(byPriority);

        if (hasIf) {
            var ret = [];
            for (var i = 0, el; el = bindings[i++];) {
                ret.push(el);
                if (el.type === 'if') {
                    return ret;
                }
            }
        }
        return bindings;
    }
    function byPriority(a, b) {
        return a.priority - b.priority;
    }

    var rimprovePriority = /[+-\?]/;
    var rinnerValue = /__value__\)$/;
    function parseInterpolate(dir) {
        var rlineSp = /\n\r?/g;
        var str = dir.nodeValue.trim().replace(rlineSp, '');
        var tokens = [];
        do {
            //aaa{{@bbb}}ccc
            var index = str.indexOf(config.openTag);
            index = index === -1 ? str.length : index;
            var value = str.slice(0, index);
            if (/\S/.test(value)) {
                tokens.push(avalon.quote(avalon._decode(value)));
            }
            str = str.slice(index + config.openTag.length);
            if (str) {
                index = str.indexOf(config.closeTag);
                var value = str.slice(0, index);
                var expr = avalon.unescapeHTML(value);
                if (/\|\s*\w/.test(expr)) {
                    //如果存在过滤器，优化干掉
                    var arr = addScope(expr, 'expr');
                    if (arr[1]) {
                        expr = arr[1].replace(rinnerValue, arr[0] + ')');
                    }
                }
                if (rimprovePriority) {
                    expr = '(' + expr + ')';
                }
                tokens.push(expr);

                str = str.slice(index + config.closeTag.length);
            }
        } while (str.length);
        return [{
            expr: tokens.join('+'),
            name: 'expr',
            type: 'expr'
        }];
    }

    function getChildren(arr) {
        var count = 0;
        for (var i = 0, el; el = arr[i++];) {
            if (el.nodeName === '#document-fragment') {
                count += getChildren(el.children);
            } else {
                count += 1;
            }
        }
        return count;
    }
    function groupTree(parent, children) {
        children && children.forEach(function (vdom) {
            if (!vdom) return;
            var vlength = vdom.children && getChildren(vdom.children);
            if (vdom.nodeName === '#document-fragment') {
                var dom = createFragment();
            } else {
                dom = avalon.vdom(vdom, 'toDOM');
                var domlength = dom.childNodes && dom.childNodes.length;
                if (domlength && vlength && domlength > vlength) {
                    if (!appendChildMayThrowError[dom.nodeName]) {
                        avalon.clearHTML(dom);
                    }
                }
            }
            if (vlength) {
                groupTree(dom, vdom.children);
                if (vdom.nodeName === 'select') {
                    var values = [];
                    getSelectedValue(vdom, values);
                    lookupOption(vdom, values);
                }
            }
            //高级版本可以尝试 querySelectorAll

            try {
                if (!appendChildMayThrowError[parent.nodeName]) {
                    parent.appendChild(dom);
                }
            } catch (e) {}
        });
    }

    function dumpTree(elem) {
        var firstChild;
        while (firstChild = elem.firstChild) {
            if (firstChild.nodeType === 1) {
                dumpTree(firstChild);
            }
            elem.removeChild(firstChild);
        }
    }

    function getRange(childNodes, node) {
        var i = childNodes.indexOf(node) + 1;
        var deep = 1,
            nodes = [],
            end;
        nodes.start = i;
        while (node = childNodes[i++]) {
            nodes.push(node);
            if (node.nodeName === '#comment') {
                if (startWith(node.nodeValue, 'ms-for:')) {
                    deep++;
                } else if (node.nodeValue === 'ms-for-end:') {
                    deep--;
                    if (deep === 0) {
                        end = node;
                        nodes.pop();
                        break;
                    }
                }
            }
        }
        nodes.end = end;
        return nodes;
    }

    function startWith(long, short) {
        return long.indexOf(short) === 0;
    }

    var appendChildMayThrowError = {
        '#text': 1,
        '#comment': 1,
        script: 1,
        style: 1,
        noscript: 1
    };

    /**
     * 生成一个渲染器,并作为它第一个遇到的ms-controller对应的VM的$render属性
     * @param {String|DOM} node
     * @param {ViewModel|Undefined} vm
     * @param {Function|Undefined} beforeReady
     * @returns {Render}
     */
    avalon.scan = function (node, vm, beforeReady) {
        return new Render(node, vm, beforeReady || avalon.noop);
    };

    /**
     * avalon.scan 的内部实现
     */
    function Render(node, vm, beforeReady) {
        this.root = node; //如果传入的字符串,确保只有一个标签作为根节点
        this.vm = vm;
        this.beforeReady = beforeReady;
        this.bindings = []; //收集待加工的绑定属性
        this.callbacks = [];
        this.directives = [];
        this.init();
    }

    Render.prototype = {
        /**
         * 开始扫描指定区域
         * 收集绑定属性
         * 生成指令并建立与VM的关联
         */
        init: function init() {
            var vnodes;
            if (this.root && this.root.nodeType > 0) {
                vnodes = fromDOM(this.root); //转换虚拟DOM
                //将扫描区域的每一个节点与其父节点分离,更少指令对DOM操作时,对首屏输出造成的频繁重绘
                dumpTree(this.root);
            } else if (typeof this.root === 'string') {
                vnodes = fromString(this.root); //转换虚拟DOM
            } else {
                return avalon.warn('avalon.scan first argument must element or HTML string');
            }

            this.root = vnodes[0];
            this.vnodes = vnodes;
            this.scanChildren(vnodes, this.vm, true);
        },
        scanChildren: function scanChildren(children, scope, isRoot) {
            for (var i = 0; i < children.length; i++) {
                var vdom = children[i];
                switch (vdom.nodeName) {
                    case '#text':
                        scope && this.scanText(vdom, scope);
                        break;
                    case '#comment':
                        scope && this.scanComment(vdom, scope, children);
                        break;
                    case '#document-fragment':
                        this.scanChildren(vdom.children, scope, false);
                        break;
                    default:
                        this.scanTag(vdom, scope, children, false);
                        break;
                }
            }
            if (isRoot) {
                this.complete();
            }
        },


        /**
         * 从文本节点获取指令
         * @param {type} vdom 
         * @param {type} scope
         * @returns {undefined}
         */
        scanText: function scanText(vdom, scope) {
            if (config.rexpr.test(vdom.nodeValue)) {
                this.bindings.push([vdom, scope, {
                    nodeValue: vdom.nodeValue
                }]);
            }
        },


        /**
         * 从注释节点获取指令
         * @param {type} vdom 
         * @param {type} scope
         * @param {type} parentChildren
         * @returns {undefined}
         */
        scanComment: function scanComment(vdom, scope, parentChildren) {
            if (startWith(vdom.nodeValue, 'ms-for:')) {
                this.getForBinding(vdom, scope, parentChildren);
            }
        },


        /**
         * 从元素节点的nodeName与属性中获取指令
         * @param {type} vdom 
         * @param {type} scope
         * @param {type} parentChildren
         * @param {type} isRoot 用于执行complete方法
         * @returns {undefined}
         */
        scanTag: function scanTag(vdom, scope, parentChildren, isRoot) {
            var dirs = {},
                attrs = vdom.props,
                hasDir,
                hasFor;
            for (var attr in attrs) {
                var value = attrs[attr];
                var oldName = attr;
                if (attr.charAt(0) === ':') {
                    attr = 'ms-' + attr.slice(1);
                }
                if (startWith(attr, 'ms-')) {
                    dirs[attr] = value;
                    var type = attr.match(/\w+/g)[1];
                    type = eventMap[type] || type;
                    if (!directives[type]) {
                        avalon.warn(attr + ' has not registered!');
                    }
                    hasDir = true;
                }
                if (attr === 'ms-for') {
                    hasFor = value;
                    delete attrs[oldName];
                }
            }
            var $id = dirs['ms-important'] || dirs['ms-controller'];
            if ($id) {
                /**
                 * 后端渲染
                 * serverTemplates后端给avalon添加的对象,里面都是模板,
                 * 将原来后端渲染好的区域再还原成原始样子,再被扫描
                 */
                var templateCaches = avalon.serverTemplates;
                var temp = templateCaches && templateCaches[$id];
                if (temp) {
                    avalon.log('前端再次渲染后端传过来的模板');
                    var node = fromString(tmpl)[0];
                    for (var i in node) {
                        vdom[i] = node[i];
                    }
                    delete templateCaches[$id];
                    this.scanTag(vdom, scope, parentChildren, isRoot);
                    return;
                }
                //推算出指令类型
                var type = dirs['ms-important'] === $id ? 'important' : 'controller';
                //推算出用户定义时属性名,是使用ms-属性还是:属性
                var attrName = 'ms-' + type in attrs ? 'ms-' + type : ':' + type;

                if (inBrowser) {
                    delete attrs[attrName];
                }
                var dir = directives[type];
                scope = dir.getScope.call(this, $id, scope);
                if (!scope) {
                    return;
                } else {
                    var clazz = attrs['class'];
                    if (clazz) {
                        attrs['class'] = (' ' + clazz + ' ').replace(' ms-controller ', '').trim();
                    }
                }
                var render = this;
                scope.$render = render;
                this.callbacks.push(function () {
                    //用于删除ms-controller
                    dir.update.call(render, vdom, attrName, $id);
                });
            }
            if (hasFor) {
                if (vdom.dom) {
                    vdom.dom.removeAttribute(oldName);
                }
                return this.getForBindingByElement(vdom, scope, parentChildren, hasFor);
            }

            if (/^ms\-/.test(vdom.nodeName)) {
                attrs.is = vdom.nodeName;
            }

            if (attrs['is']) {
                if (!dirs['ms-widget']) {
                    dirs['ms-widget'] = '{}';
                }
                hasDir = true;
            }
            if (hasDir) {
                this.bindings.push([vdom, scope, dirs]);
            }
            var children = vdom.children;
            //如果存在子节点,并且不是容器元素(script, stype, textarea, xmp...)
            if (!orphanTag[vdom.nodeName] && children && children.length && !delayCompileNodes(dirs)) {
                this.scanChildren(children, scope, false);
            }
        },


        /**
         * 将绑定属性转换为指令
         * 执行各种回调与优化指令
         * @returns {undefined}
         */
        complete: function complete() {
            this.yieldDirectives();
            this.beforeReady();
            if (inBrowser) {
                var root$$1 = this.root;
                if (inBrowser) {
                    var rootDom = avalon.vdom(root$$1, 'toDOM');
                    groupTree(rootDom, root$$1.children);
                }
            }

            this.mount = true;
            var fn;
            while (fn = this.callbacks.pop()) {
                fn();
            }
            this.optimizeDirectives();
        },


        /**
         * 将收集到的绑定属性进行深加工,最后转换指令
         * @returns {Array<tuple>}
         */
        yieldDirectives: function yieldDirectives() {
            var tuple;
            while (tuple = this.bindings.shift()) {
                var vdom = tuple[0],
                    scope = tuple[1],
                    dirs = tuple[2],
                    bindings = [];
                if ('nodeValue' in dirs) {
                    bindings = parseInterpolate(dirs);
                } else if (!('ms-skip' in dirs)) {
                    bindings = parseAttributes(dirs, tuple);
                }
                for (var i = 0, binding; binding = bindings[i++];) {
                    var dir = directives[binding.type];
                    if (!inBrowser && /on|duplex|active|hover/.test(binding.type)) {
                        continue;
                    }
                    if (dir.beforeInit) {
                        dir.beforeInit.call(binding);
                    }

                    var directive$$1 = new Directive(scope, binding, vdom, this);
                    this.directives.push(directive$$1);
                }
            }
        },


        /**
         * 修改指令的update与callback方法,让它们以后执行时更加高效
         * @returns {undefined}
         */
        optimizeDirectives: function optimizeDirectives() {
            for (var i = 0, el; el = this.directives[i++];) {
                el.callback = directives[el.type].update;
                el.update = newUpdate;
                el._isScheduled = false;
            }
        },

        update: function update() {
            for (var i = 0, el; el = this.directives[i++];) {
                el.update();
            }
        },

        /**
         * 销毁所有指令
         * @returns {undefined}
         */
        dispose: function dispose() {
            var list = this.directives || [];
            for (var i = 0, el; el = list[i++];) {
                el.dispose();
            }
            //防止其他地方的this.innerRender && this.innerRender.dispose报错
            for (var _i5 in this) {
                if (_i5 !== 'dispose') delete this[_i5];
            }
        },


        /**
         * 将循环区域转换为for指令
         * @param {type} begin 注释节点
         * @param {type} scope
         * @param {type} parentChildren
         * @param {type} userCb 循环结束回调
         * @returns {undefined}
         */
        getForBinding: function getForBinding(begin, scope, parentChildren, userCb) {
            var expr = begin.nodeValue.replace('ms-for:', '').trim();
            begin.nodeValue = 'ms-for:' + expr;
            var nodes = getRange(parentChildren, begin);
            var end = nodes.end;
            var fragment = avalon.vdom(nodes, 'toHTML');
            parentChildren.splice(nodes.start, nodes.length);
            begin.props = {};
            this.bindings.push([begin, scope, {
                'ms-for': expr
            }, {
                begin: begin,
                end: end,
                expr: expr,
                userCb: userCb,
                fragment: fragment,
                parentChildren: parentChildren
            }]);
        },


        /**
         * 在带ms-for元素节点旁添加两个注释节点,组成循环区域
         * @param {type} vdom
         * @param {type} scope
         * @param {type} parentChildren
         * @param {type} expr
         * @returns {undefined}
         */
        getForBindingByElement: function getForBindingByElement(vdom, scope, parentChildren, expr) {
            var index = parentChildren.indexOf(vdom); //原来带ms-for的元素节点
            var props = vdom.props;
            var begin = {
                nodeName: '#comment',
                nodeValue: 'ms-for:' + expr
            };
            if (props.slot) {
                begin.slot = props.slot;
                delete props.slot;
            }
            var end = {
                nodeName: '#comment',
                nodeValue: 'ms-for-end:'
            };
            parentChildren.splice(index, 1, begin, vdom, end);
            this.getForBinding(begin, scope, parentChildren, props['data-for-rendered']);
        }
    };
    var viewID;

    function newUpdate() {
        var oldVal = this.beforeUpdate();
        var newVal = this.value = this.get();
        if (this.callback && this.diff(newVal, oldVal)) {
            this.callback(this.node, this.value);
            var vm = this.vm;
            var $render = vm.$render;
            var list = vm.$events['onViewChange'];
            /* istanbul ignore if */
            if (list && $render && $render.root && !avalon.viewChanging) {
                if (viewID) {
                    clearTimeout(viewID);
                    viewID = null;
                }
                viewID = setTimeout(function () {
                    list.forEach(function (el) {
                        el.callback.call(vm, {
                            type: 'viewchange',
                            target: $render.root,
                            vmodel: vm
                        });
                    });
                });
            }
        }
        this._isScheduled = false;
    }

    var events = 'onInit,onReady,onViewChange,onDispose,onEnter,onLeave';
    var componentEvents = avalon.oneObject(events);

    function toObject(value) {
        var value = platform.toJson(value);
        if (Array.isArray(value)) {
            var v = {};
            value.forEach(function (el) {
                el && avalon.shadowCopy(v, el);
            });
            return v;
        }
        return value;
    }
    var componentQueue = [];
    avalon.directive('widget', {
        delay: true,
        priority: 4,
        deep: true,
        init: function init() {
            //cached属性必须定义在组件容器里面,不是template中
            var vdom = this.node;
            this.cacheVm = !!vdom.props.cached;
            if (vdom.dom && vdom.nodeName === '#comment') {
                var comment = vdom.dom;
            }
            var oldValue = this.getValue();
            var value = toObject(oldValue);
            //外部VM与内部VM
            // ＝＝＝创建组件的VM＝＝BEGIN＝＝＝
            var is = vdom.props.is || value.is;
            this.is = is;
            var component = avalon.components[is];
            //外部传入的总大于内部
            if (!('fragment' in this)) {
                if (!vdom.isVoidTag) {
                    //提取组件容器内部的东西作为模板
                    var text = vdom.children[0];
                    if (text && text.nodeValue) {
                        this.fragment = text.nodeValue;
                    } else {
                        this.fragment = avalon.vdom(vdom.children, 'toHTML');
                    }
                } else {
                    this.fragment = false;
                }
            }
            //如果组件还没有注册，那么将原元素变成一个占位用的注释节点
            if (!component) {
                this.readyState = 0;
                vdom.nodeName = '#comment';
                vdom.nodeValue = 'unresolved component placeholder';
                delete vdom.dom;
                avalon.Array.ensure(componentQueue, this);
                return;
            }

            //如果是非空元素，比如说xmp, ms-*, template
            var id = value.id || value.$id;
            var hasCache = avalon.vmodels[id];
            var fromCache = false;
            // this.readyState = 1
            if (hasCache) {
                comVm = hasCache;
                this.comVm = comVm;
                replaceRoot(this, comVm.$render);
                fromCache = true;
            } else {
                if (typeof component === 'function') {
                    component = new component(value);
                }
                var comVm = createComponentVm(component, value, is);
                this.readyState = 1;
                fireComponentHook(comVm, vdom, 'Init');
                this.comVm = comVm;

                // ＝＝＝创建组件的VM＝＝END＝＝＝
                var innerRender = avalon.scan(component.template, comVm);
                comVm.$render = innerRender;
                replaceRoot(this, innerRender);
                var nodesWithSlot = [];
                var directives$$1 = [];
                if (this.fragment || component.soleSlot) {
                    var curVM = this.fragment ? this.vm : comVm;
                    var curText = this.fragment || '{{##' + component.soleSlot + '}}';
                    var childBoss = avalon.scan('<div>' + curText + '</div>', curVM, function () {
                        nodesWithSlot = this.root.children;
                    });
                    directives$$1 = childBoss.directives;
                    this.childBoss = childBoss;
                    for (var i in childBoss) {
                        delete childBoss[i];
                    }
                }
                Array.prototype.push.apply(innerRender.directives, directives$$1);

                var arraySlot = [],
                    objectSlot = {};
                //从用户写的元素内部 收集要移动到 新创建的组件内部的元素
                if (component.soleSlot) {
                    arraySlot = nodesWithSlot;
                } else {
                    nodesWithSlot.forEach(function (el, i) {
                        //要求带slot属性
                        if (el.slot) {
                            var nodes = getRange(nodesWithSlot, el);
                            nodes.push(nodes.end);
                            nodes.unshift(el);
                            objectSlot[el.slot] = nodes;
                        } else if (el.props) {
                            var name = el.props.slot;
                            if (name) {
                                delete el.props.slot;
                                if (Array.isArray(objectSlot[name])) {
                                    objectSlot[name].push(el);
                                } else {
                                    objectSlot[name] = [el];
                                }
                            }
                        }
                    });
                }
                //将原来元素的所有孩子，全部移动新的元素的第一个slot的位置上
                if (component.soleSlot) {
                    insertArraySlot(innerRender.vnodes, arraySlot);
                } else {
                    insertObjectSlot(innerRender.vnodes, objectSlot);
                }
            }

            if (comment) {
                var dom = avalon.vdom(vdom, 'toDOM');
                comment.parentNode.replaceChild(dom, comment);
                comVm.$element = innerRender.root.dom = dom;
                delete this.reInit;
            }

            //处理DOM节点

            dumpTree(vdom.dom);
            comVm.$element = vdom.dom;
            groupTree(vdom.dom, vdom.children);
            if (fromCache) {
                fireComponentHook(comVm, vdom, 'Enter');
            } else {
                fireComponentHook(comVm, vdom, 'Ready');
            }
        },
        diff: function diff(newVal, oldVal) {
            if (cssDiff.call(this, newVal, oldVal)) {
                return true;
            }
        },

        update: function update(vdom, value) {
            //this.oldValue = value //★★防止递归

            switch (this.readyState) {
                case 0:
                    if (this.reInit) {
                        this.init();
                        this.readyState++;
                    }
                    break;
                case 1:
                    this.readyState++;
                    break;
                default:
                    this.readyState++;
                    var comVm = this.comVm;
                    avalon.viewChanging = true;
                    avalon.transaction(function () {
                        for (var i in value) {
                            if (comVm.hasOwnProperty(i)) {
                                if (Array.isArray(value[i])) {
                                    comVm[i] = value[i].concat();
                                } else {
                                    comVm[i] = value[i];
                                }
                            }
                        }
                    });

                    //要保证要先触发孩子的ViewChange 然后再到它自己的ViewChange
                    fireComponentHook(comVm, vdom, 'ViewChange');
                    delete avalon.viewChanging;
                    break;
            }
            this.value = avalon.mix(true, {}, value);
        },
        beforeDispose: function beforeDispose() {
            var comVm = this.comVm;
            if (!this.cacheVm) {
                fireComponentHook(comVm, this.node, 'Dispose');
                comVm.$hashcode = false;
                delete avalon.vmodels[comVm.$id];
                this.innerRender && this.innerRender.dispose();
            } else {
                fireComponentHook(comVm, this.node, 'Leave');
            }
        }
    });

    function replaceRoot(instance, innerRender) {
        instance.innerRender = innerRender;
        var root$$1 = innerRender.root;
        var vdom = instance.node;
        var slot = vdom.props.slot;
        for (var i in root$$1) {
            vdom[i] = root$$1[i];
        }
        if (vdom.props && slot) {
            vdom.props.slot = slot;
        }
        innerRender.root = vdom;
        innerRender.vnodes[0] = vdom;
    }

    function fireComponentHook(vm, vdom, name) {
        var list = vm.$events['on' + name];
        if (list) {
            list.forEach(function (el) {
                setTimeout(function () {
                    el.callback.call(vm, {
                        type: name.toLowerCase(),
                        target: vdom.dom,
                        vmodel: vm
                    });
                }, 0);
            });
        }
    }

    function createComponentVm(component, value, is) {
        var hooks = [];
        var defaults = component.defaults;
        collectHooks(defaults, hooks);
        collectHooks(value, hooks);
        var obj = {};
        for (var i in defaults) {
            var val = value[i];
            if (val == null) {
                obj[i] = defaults[i];
            } else {
                obj[i] = val;
            }
        }
        obj.$id = value.id || value.$id || avalon.makeHashCode(is);
        delete obj.id;
        var def = avalon.mix(true, {}, obj);
        var vm = avalon.define(def);
        hooks.forEach(function (el) {
            vm.$watch(el.type, el.cb);
        });
        return vm;
    }

    function collectHooks(a, list) {
        for (var i in a) {
            if (componentEvents[i]) {
                if (typeof a[i] === 'function' && i.indexOf('on') === 0) {
                    list.unshift({
                        type: i,
                        cb: a[i]
                    });
                }
                //delete a[i] 这里不能删除,会导致再次切换时没有onReady
            }
        }
    }

    function resetParentChildren(nodes, arr) {
        var dir = arr && arr[0] && arr[0].forDir;
        if (dir) {
            dir.parentChildren = nodes;
        }
    }

    function insertArraySlot(nodes, arr) {
        for (var i = 0, el; el = nodes[i]; i++) {
            if (el.nodeName === 'slot') {
                resetParentChildren(nodes, arr);
                nodes.splice.apply(nodes, [i, 1].concat(arr));
                break;
            } else if (el.children) {
                insertArraySlot(el.children, arr);
            }
        }
    }

    function insertObjectSlot(nodes, obj) {
        for (var i = 0, el; el = nodes[i]; i++) {
            if (el.nodeName === 'slot') {
                var name = el.props.name;
                resetParentChildren(nodes, obj[name]);
                nodes.splice.apply(nodes, [i, 1].concat(obj[name]));
                continue;
            } else if (el.children) {
                insertObjectSlot(el.children, obj);
            }
        }
    }

    avalon.components = {};
    avalon.component = function (name, component) {

        component.extend = componentExtend;
        return addToQueue(name, component);
    };
    function addToQueue(name, component) {
        avalon.components[name] = component;
        for (var el, i = 0; el = componentQueue[i]; i++) {
            if (el.is === name) {
                componentQueue.splice(i, 1);
                el.reInit = true;
                delete el.value;
                el.update();
                i--;
            }
        }
        return component;
    }

    function componentExtend(child) {
        var name = child.displayName;
        delete child.displayName;
        var obj = { defaults: avalon.mix(true, {}, this.defaults, child.defaults) };
        if (child.soleSlot) {
            obj.soleSlot = child.soleSlot;
        }
        obj.template = child.template || this.template;
        return avalon.component(name, obj);
    }

    return avalon;
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__,
    __webpack_require__(0)
], __WEBPACK_AMD_DEFINE_RESULT__ = function(require, avalon2) {
    'use strict';
    let vm = avalon2.define({
        $id: "tab1",
        name: "富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善1",
    });

    function getHtml() {
        return "<div ms-controller='tab1'>" +
            "<div>{{@name}}</div>" +
            "</div>";
    }
    return getHtml();
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * 
	 * version 1.0
	 * built in 2015.11.19
	 * 
	 * v0.9.6
	 * 修正gasAttribute typo
	 * 修正mmHistory document.write BUG
	 * 
	 * 
	 */

	var mmHistory = __webpack_require__(6)
	var storage = __webpack_require__(7)

	function Router() {
	    this.rules = []
	}


	var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g
	Router.prototype = storage
	avalon.mix(storage, {
	    error: function (callback) {
	        this.errorback = callback
	    },
	    _pathToRegExp: function (pattern, opts) {
	        var keys = opts.keys = [],
	                //      segments = opts.segments = [],
	                compiled = '^', last = 0, m, name, regexp, segment;

	        while ((m = placeholder.exec(pattern))) {
	            name = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
	            regexp = m[4] || (m[1] == '*' ? '.*' : 'string')
	            segment = pattern.substring(last, m.index);
	            var type = this.$types[regexp]
	            var key = {
	                name: name
	            }
	            if (type) {
	                regexp = type.pattern
	                key.decode = type.decode
	            }
	            keys.push(key)
	            compiled += quoteRegExp(segment, regexp, false)
	            //  segments.push(segment)
	            last = placeholder.lastIndex
	        }
	        segment = pattern.substring(last);
	        compiled += quoteRegExp(segment) + (opts.strict ? opts.last : "\/?") + '$';
	        var sensitive = typeof opts.caseInsensitive === "boolean" ? opts.caseInsensitive : true
	        //  segments.push(segment);
	        opts.regexp = new RegExp(compiled, sensitive ? 'i' : undefined);
	        return opts

	    },
	    //添加一个路由规则
	    add: function (path, callback, opts) {
	        var array = this.rules
	        if (path.charAt(0) !== "/") {
	            avalon.error("avalon.router.add的第一个参数必须以/开头")
	        }
	        opts = opts || {}
	        opts.callback = callback
	        if (path.length > 2 && path.charAt(path.length - 1) === "/") {
	            path = path.slice(0, -1)
	            opts.last = "/"
	        }
	        avalon.Array.ensure(array, this._pathToRegExp(path, opts))
	    },
	    //判定当前URL与已有状态对象的路由规则是否符合
	    route: function (path, query) {
	        path = path.trim()
	        var rules = this.rules
	        for (var i = 0, el; el = rules[i++]; ) {
	            var args = path.match(el.regexp)
	            if (args) {
	                el.query = query || {}
	                el.path = path
	                el.params = {}
	                var keys = el.keys
	                args.shift()
	                if (keys.length) {
	                    this._parseArgs(args, el)
	                }
	                return  el.callback.apply(el, args)
	            }
	        }
	        if (this.errorback) {
	            this.errorback()
	        }
	    },
	    _parseArgs: function (match, stateObj) {
	        var keys = stateObj.keys
	        for (var j = 0, jn = keys.length; j < jn; j++) {
	            var key = keys[j]
	            var value = match[j] || ''
	            if (typeof key.decode === 'function') {//在这里尝试转换参数的类型
	                var val = key.decode(value)
	            } else {
	                try {
	                    val = JSON.parse(value)
	                } catch (e) {
	                    val = value
	                }
	            }
	            match[j] = stateObj.params[key.name] = val
	        }
	    },
	    /*
	     *  @interface avalon.router.navigate 设置历史(改变URL)
	     *  @param hash 访问的url hash   
	     */
	    navigate: function (hash, mode) {
	        var parsed = parseQuery(hash)
	        var newHash = this.route(parsed.path, parsed.query)
	        if(isLegalPath(newHash)){
	            hash = newHash
	        }
	        //保存到本地储存或cookie
	        avalon.router.setLastPath(hash)
	        // 模式0, 不改变URL, 不产生历史实体, 执行回调
	        // 模式1, 改变URL, 不产生历史实体,   执行回调
	        // 模式2, 改变URL, 产生历史实体,    执行回调
	        if (mode === 1) {
	          
	            avalon.history.setHash(hash, true)
	        } else if (mode === 2) {
	            avalon.history.setHash(hash)
	        }
	        return hash
	    },
	    /*
	     *  @interface avalon.router.when 配置重定向规则
	     *  @param path 被重定向的表达式，可以是字符串或者数组
	     *  @param redirect 重定向的表示式或者url
	     */
	    when: function (path, redirect) {
	        var me = this,
	                path = path instanceof Array ? path : [path]
	        avalon.each(path, function (index, p) {
	            me.add(p, function () {
	                var info = me.urlFormate(redirect, this.params, this.query)
	                me.navigate(info.path + info.query)
	            })
	        })
	        return this
	    },
	    urlFormate: function (url, params, query) {
	        var query = query ? queryToString(query) : "",
	                hash = url.replace(placeholder, function (mat) {
	                    var key = mat.replace(/[\{\}]/g, '').split(":")
	                    key = key[0] ? key[0] : key[1]
	                    return params[key] !== undefined ? params[key] : ''
	                }).replace(/^\//g, '')
	        return {
	            path: hash,
	            query: query
	        }
	    },
	    /* *
	     `'/hello/'` - 匹配'/hello/'或'/hello'
	     `'/user/:id'` - 匹配 '/user/bob' 或 '/user/1234!!!' 或 '/user/' 但不匹配 '/user' 与 '/user/bob/details'
	     `'/user/{id}'` - 同上
	     `'/user/{id:[^/]*}'` - 同上
	     `'/user/{id:[0-9a-fA-F]{1,8}}'` - 要求ID匹配/[0-9a-fA-F]{1,8}/这个子正则
	     `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
	     path into the parameter 'path'.
	     `'/files/*path'` - ditto.
	     */
	    // avalon.router.get("/ddd/:dddID/",callback)
	    // avalon.router.get("/ddd/{dddID}/",callback)
	    // avalon.router.get("/ddd/{dddID:[0-9]{4}}/",callback)
	    // avalon.router.get("/ddd/{dddID:int}/",callback)
	    // 我们甚至可以在这里添加新的类型，avalon.router.$type.d4 = { pattern: '[0-9]{4}', decode: Number}
	    // avalon.router.get("/ddd/{dddID:d4}/",callback)
	    $types: {
	        date: {
	            pattern: "[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])",
	            decode: function (val) {
	                return new Date(val.replace(/\-/g, "/"))
	            }
	        },
	        string: {
	            pattern: "[^\\/]*",
	            decode: function (val) {
	                return val;
	            }
	        },
	        bool: {
	            decode: function (val) {
	                return parseInt(val, 10) === 0 ? false : true;
	            },
	            pattern: "0|1"
	        },
	        'int': {
	            decode: function (val) {
	                return parseInt(val, 10);
	            },
	            pattern: "\\d+"
	        }
	    }
	})


	module.exports = avalon.router = new Router


	function parseQuery(url) {
	    var array = url.split("?"), query = {}, path = array[0], querystring = array[1]
	    if (querystring) {
	        var seg = querystring.split("&"),
	                len = seg.length, i = 0, s;
	        for (; i < len; i++) {
	            if (!seg[i]) {
	                continue
	            }
	            s = seg[i].split("=")
	            query[decodeURIComponent(s[0])] = decodeURIComponent(s[1])
	        }
	    }
	    return {
	        path: path,
	        query: query
	    }
	}
	function isLegalPath(path){
	    if(path === '/')
	        return true
	    if(typeof path === 'string' && path.length > 1 && path.charAt(0) === '/'){
	        return true
	    }
	}

	function queryToString(obj) {
	    if (typeof obj === 'string')
	        return obj
	    var str = []
	    for (var i in obj) {
	        if (i === "query")
	            continue
	        str.push(i + '=' + encodeURIComponent(obj[i]))
	    }
	    return str.length ? '?' + str.join("&") : ''
	}


	function quoteRegExp(string, pattern, isOptional) {
	    var result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
	    if (!pattern)
	        return result;
	    var flag = isOptional ? '?' : '';
	    return result + flag + '(' + pattern + ')' + flag;
	}


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ function(module, exports) {

	/*!
	 * mmHistory
	 * 用于监听地址栏的变化
	 * https://github.com/flatiron/director/blob/master/lib/director/browser.js
	 * https://github.com/visionmedia/page.js/blob/master/page.js
	 */

	var location = document.location
	var oldIE = avalon.msie <= 7
	var supportPushState = !!(window.history.pushState)
	var supportHashChange = !!("onhashchange" in window && (!window.VBArray || !oldIE))
	var defaults = {
	    root: "/",
	    html5: false,
	    hashPrefix: "!",
	    iframeID: null, //IE6-7，如果有在页面写死了一个iframe，这样似乎刷新的时候不会丢掉之前的历史
	    interval: 50, //IE6-7,使用轮询，这是其时间时隔,
	    autoScroll: false
	}
	var mmHistory = {
	    hash: getHash(location.href),
	    check: function() {
	        var h = getHash(location.href)
	        if (h !== this.hash) {
	            this.hash = h
	            this.onHashChanged()
	        }
	    },
	    start: function(options) {
	        if (this.started)
	            throw new Error('avalon.history has already been started')
	        this.started = true
	            //监听模式
	        if (typeof options === 'boolean') {
	            options = {
	                html5: options
	            }
	        }

	        options = avalon.mix({}, defaults, options || {})
	        if (options.fireAnchor) {
	            options.autoScroll = true
	        }
	        var rootPath = options.root
	        if (!/^\//.test(rootPath)) {
	            avalon.error('root配置项必须以/字符开始, 以非/字符结束')
	        }
	        if (rootPath.length > 1) {
	            options.root = rootPath.replace(/\/$/, '')
	        }
	        var html5Mode = options.html5
	        this.options = options
	        this.mode = html5Mode ? "popstate" : "hashchange"
	        if (!supportPushState) {
	            if (html5Mode) {
	                avalon.warn("浏览器不支持HTML5 pushState，平稳退化到onhashchange!")
	            }
	            this.mode = "hashchange"
	        }
	        if (!supportHashChange) {
	            this.mode = "iframepoll"
	        }
	        avalon.log('avalon run mmHistory in the ', this.mode, 'mode')
	            // 支持popstate 就监听popstate
	            // 支持hashchange 就监听hashchange(IE8,IE9,FF3)
	            // 否则的话只能每隔一段时间进行检测了(IE6, IE7)
	        switch (this.mode) {
	            case "popstate":
	                // At least for now HTML5 history is available for 'modern' browsers only
	                // There is an old bug in Chrome that causes onpopstate to fire even
	                // upon initial page load. Since the handler is run manually in init(),
	                // this would cause Chrome to run it twise. Currently the only
	                // workaround seems to be to set the handler after the initial page load
	                // http://code.google.com/p/chromium/issues/detail?id=63040
	                setTimeout(function() {
	                    window.onpopstate = mmHistory.onHashChanged
	                }, 500)
	                break
	            case "hashchange":
	                window.onhashchange = mmHistory.onHashChanged
	                break
	            case "iframepoll":
	                //也有人这样玩 http://www.cnblogs.com/meteoric_cry/archive/2011/01/11/1933164.html
	                avalon.ready(function() {
	                    var iframe = document.createElement('iframe')
	                    iframe.id = options.iframeID
	                    iframe.style.display = 'none'
	                    document.body.appendChild(iframe)
	                    mmHistory.iframe = iframe
	                    mmHistory.writeFrame('')
	                    if (avalon.msie) {
	                        function onPropertyChange() {
	                            if (event.propertyName === 'location') {
	                                mmHistory.check()
	                            }
	                        }
	                        document.attachEvent('onpropertychange', onPropertyChange)
	                        mmHistory.onPropertyChange = onPropertyChange
	                    }

	                    mmHistory.intervalID = window.setInterval(function() {
	                        mmHistory.check()
	                    }, options.interval)

	                })
	                break
	        }
	        //页面加载时触发onHashChanged
	        this.onHashChanged()
	    },
	    stop: function() {
	        switch (this.mode) {
	            case "popstate":
	                window.onpopstate = avalon.noop
	                break
	            case "hashchange":
	                window.onhashchange = avalon.noop
	                break
	            case "iframepoll":
	                if (this.iframe) {
	                    document.body.removeChild(this.iframe)
	                    this.iframe = null
	                }
	                if (this.onPropertyChange) {
	                    document.detachEvent('onpropertychange', this.onPropertyChange)
	                }
	                clearInterval(this.intervalID)
	                break
	        }
	        this.started = false
	    },
	    setHash: function(s, replace) {
	        switch (this.mode) {
	            case 'iframepoll':
	                if (replace) {
	                    var iframe = this.iframe
	                    if (iframe) {
	                        //contentWindow 兼容各个浏览器，可取得子窗口的 window 对象。
	                        //contentDocument Firefox 支持，> ie8 的ie支持。可取得子窗口的 document 对象。
	                        iframe.contentWindow._hash = s
	                    }
	                } else {
	                    this.writeFrame(s)
	                }
	                break
	            case 'popstate':
	                var path = (this.options.root + '/' + s).replace(/\/+/g, '/')
	                var method = replace ? 'replaceState' : 'pushState'
	                history[method]({}, document.title, path)
	                    // 手动触发onpopstate event
	                this.onHashChanged()
	                break
	            default:
	                //http://stackoverflow.com/questions/9235304/how-to-replace-the-location-hash-and-only-keep-the-last-history-entry
	                var newHash = this.options.hashPrefix + s
	                if (replace && location.hash !== newHash) {
	                    history.back()
	                }
	                location.hash = newHash
	                break
	        }
	    },
	    writeFrame: function(s) {
	        // IE support...
	        var f = mmHistory.iframe
	        var d = f.contentDocument || f.contentWindow.document
	        d.open()
	        var end ="/script"
	        d.write("<script>_hash = '" + s + "'; onload = parent.avalon.history.syncHash;<"+end+">")
	        d.close()
	    },
	    syncHash: function() {
	        // IE support...
	        var s = this._hash
	        if (s !== getHash(location.href)) {
	            location.hash = s
	        }
	        return this
	    },

	    getPath: function() {
	        var path = location.pathname.replace(this.options.root, '')
	        if (path.charAt(0) !== '/') {
	            path = '/' + path
	        }
	        return path
	    },
	    onHashChanged: function(hash, clickMode) {
	        if (!clickMode) {
	            hash = mmHistory.mode === 'popstate' ? mmHistory.getPath() :
	                location.href.replace(/.*#!?/, '')
	        }
	        hash = decodeURIComponent(hash)
	        hash = hash.charAt(0) === '/' ? hash : '/' + hash
	        if (hash !== mmHistory.hash) {
	            mmHistory.hash = hash

	            if (avalon.router) { //即mmRouter
	                hash = avalon.router.navigate(hash, 0)
	            }

	            if (clickMode) {
	                mmHistory.setHash(hash)
	            }
	            if (clickMode && mmHistory.options.autoScroll) {
	                autoScroll(hash.slice(1))
	            }
	        }

	    }
	}

	function getHash(path) {
	    // IE6直接用location.hash取hash，可能会取少一部分内容
	    // 比如 http://www.cnblogs.com/rubylouvre#stream/xxxxx?lang=zh_c
	    // ie6 => location.hash = #stream/xxxxx
	    // 其他浏览器 => location.hash = #stream/xxxxx?lang=zh_c
	    // firefox 会自作多情对hash进行decodeURIComponent
	    // 又比如 http://www.cnblogs.com/rubylouvre/#!/home/q={%22thedate%22:%2220121010~20121010%22}
	    // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
	    // 其他浏览器 => #!/home/q={%22thedate%22:%2220121010~20121010%22}
	    var index = path.indexOf("#")
	    if (index === -1) {
	        return ''
	    }
	    return decodeURI(path.slice(index))
	}



	//劫持页面上所有点击事件，如果事件源来自链接或其内部，
	//并且它不会跳出本页，并且以"#/"或"#!/"开头，那么触发updateLocation方法
	avalon.bind(document, "click", function(e) {
	    //https://github.com/asual/jquery-address/blob/master/src/jquery.address.js
	    //https://github.com/angular/angular.js/blob/master/src/ng/location.js
	    //下面十种情况将阻止进入路由系列
	    //1. 路由器没有启动
	    if (!mmHistory.started) {
	        return
	    }
	    //2. 不是左键点击或使用组合键
	    if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2 ) {
	        return
	    }
	    //3. 此事件已经被阻止
	    if (e.returnValue === false) {
	        return
	    }
	    //4. 目标元素不A标签,或不在A标签之内
	    var el = e.path ? e.path[0] : (e.target || e.srcElement || {})
	    while (el.nodeName !== "A") {
	        el = el.parentNode
	        if (!el || el.tagName === "BODY") {
	            return
	        }
	    }
	    //5. 没有定义href属性或在hash模式下,只有一个#
	    //IE6/7直接用getAttribute返回完整路径
	    var href = el.getAttribute('href', 2) || el.getAttribute("xlink:href") || ''
	    if (href.slice(0, 2) !== '#!') {
	        return
	    }

	    //6. 目标链接是用于下载资源或指向外部
	    if (el.getAttribute('download') != null || el.getAttribute('rel') === 'external')
	        return

	    //7. 只是邮箱地址
	    if (href.indexOf('mailto:') > -1) {
	        return
	    }
	    //8. 目标链接要新开窗口
	    if (el.target && el.target !== '_self') {
	        return
	    }

	    e.preventDefault()
	        //终于达到目的地
	    mmHistory.onHashChanged(href.replace('#!', ''), true)

	})

	//得到页面第一个符合条件的A标签
	function getFirstAnchor(name) {
	    var list = document.getElementsByTagName('A')
	    for (var i = 0, el; el = list[i++];) {
	        if (el.name === name) {
	            return el
	        }
	    }
	}

	function getOffset(elem) {
	    var position = avalon(elem).css('position'),
	        offset
	    if (position !== 'fixed') {
	        offset = 0
	    } else {
	        offset = elem.getBoundingClientRect().bottom
	    }

	    return offset
	}

	function autoScroll(hash) {
	    //取得页面拥有相同ID的元素
	    var elem = document.getElementById(hash)
	    if (!elem) {
	        //取得页面拥有相同name的A元素
	        elem = getFirstAnchor(hash)
	    }
	    if (elem) {
	        elem.scrollIntoView()
	        var offset = getOffset(elem)
	        if (offset) {
	            var elemTop = elem.getBoundingClientRect().top
	            window.scrollBy(0, elemTop - offset.top)
	        }
	    } else {
	        window.scrollTo(0, 0)
	    }
	}


	module.exports = avalon.history = mmHistory


/***/ },
/* 7 */
/***/ function(module, exports) {

	
	function supportLocalStorage() {
	    try {//看是否支持localStorage
	        localStorage.setItem("avalon", 1)
	        localStorage.removeItem("avalon")
	        return true
	    } catch (e) {
	        return false
	    }
	}
	function escapeCookie(value) {
	    return String(value).replace(/[,;"\\=\s%]/g, function (character) {
	        return encodeURIComponent(character)
	    });
	}
	var ret = {}
	if (supportLocalStorage()) {
	    ret.getLastPath = function () {
	        return localStorage.getItem('msLastPath')
	    }
	    var cookieID
	    ret.setLastPath = function (path) {
	        if (cookieID) {
	            clearTimeout(cookieID)
	            cookieID = null
	        }
	        localStorage.setItem("msLastPath", path)
	        cookieID = setTimeout(function () {//模拟过期时间
	            localStorage.removItem("msLastPath")
	        }, 1000 * 60 * 60 * 24)
	    }
	} else {

	    ret.getLastPath = function () {
	        return getCookie.getItem('msLastPath')
	    }
	    ret.setLastPath = function (path) {
	        setCookie('msLastPath', path)
	    }
	    function setCookie(key, value) {
	        var date = new Date()//将date设置为1天以后的时间 
	        date.setTime(date.getTime() + 1000 * 60 * 60 * 24)
	        document.cookie = escapeCookie(key) + '=' + escapeCookie(value) + ';expires=' + date.toGMTString()
	    }
	    function getCookie(name) {
	        var m = String(document.cookie).match(new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')) || ["", ""]
	        return decodeURIComponent(m[1])
	    }
	}

	module.exports = ret

/***/ }
/******/ ]);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var avalon = __webpack_require__(0)
__webpack_require__(2)
let vm = avalon.define({
    $id: "app",
    age: 18,
    html: "<h1>hello world</h1>",
    showLog: function() {
        vm.age += 10;
        console.log("this is log");

    }
});
// console.log(avalon, avalon.router, avalon.router.add)
avalon.router.add("/aaa", function(a) {
    vm.currPath = this.path
        // this里面能拿到如下东西:
        // path: 路径
        // query: 一个对象，就是？后面的东西转换成的对象
        // params: 一个对象， 我们在定义路由规则时，那些以冒号开始的参数组成的对象
});
avalon.router.add("/tab1", function() {
    // vm.html = require("./js/tab1/tab1.html");
    vm.html = __webpack_require__(1);
});
avalon.router.add("/tab2", function() {
    vm.html = "<h1>tab2</h1>"
});
avalon.router.add("/tab3", function() {
    vm.html = "<h1>tab3</h1>"
});
//启动路由监听
avalon.history.start({
    root: "/avalonTest/"
});
// debugger;/
avalon.scan();

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgODVkNTc2YmZkODllZjQ0NWI2NjUiLCJ3ZWJwYWNrOi8vLy4vfi9hdmFsb24yL2Rpc3QvYXZhbG9uLmpzIiwid2VicGFjazovLy8uL2pzL3RhYjEvdGFiMS5qcyIsIndlYnBhY2s6Ly8vLi9+L21tUm91dGVyL2Rpc3QvbW1Sb3V0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ2hFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtB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RUFBRTtBQUM5UTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLEVBQUU7QUFDOUM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQ0FBa0MsV0FBVztBQUM3QyxrQ0FBa0M7QUFDbEMsNENBQTRDO0FBQzVDLDRCQUE0QixxQkFBcUI7QUFDakQsNEJBQTRCLHFCQUFxQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakYscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSw0REFBNEQ7QUFDNUQsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQ7QUFDbkQsdURBQXVEO0FBQ3ZELG1EQUFtRDtBQUNuRDtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUMsNENBQTRDO0FBQzVDLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixPQUFPO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBLHlDQUF5QyxPQUFPO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLGlCQUFpQjtBQUNoRDtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMEJBQTBCO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGtCQUFrQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJDQUEyQyx1QkFBdUIsdUJBQXVCLHNCQUFzQix1QkFBdUI7QUFDdEk7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLG9DQUFvQztBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQyxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSx1Q0FBdUMsMkJBQTJCO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDLE9BQU87QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7OztBQUdUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTOzs7QUFHVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBNkI7O0FBRTdCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7OztBQUdUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOzs7QUFHVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QixxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrREFBa0QsNkJBQTZCO0FBQy9FO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7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LGVBQWU7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixpQkFBaUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrRUFBK0U7QUFDL0UsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLFFBQVE7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwrREFBK0QsaUJBQWlCOztBQUVoRjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSxpQkFBaUI7O0FBRWpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwyQkFBMkIsZUFBZTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQSxpQkFBaUIsbUNBQW1DO0FBQ3BEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakYsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEM7QUFDQTtBQUNBO0FBQ0EsaUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQix1QkFBdUI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFD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Q2pCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxpQkFBaUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMEJBQTBCLHVCQUF1QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQSwrQkFBK0Isa0JBQWtCO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0VBQWdFO0FBQ2hFLDREQUE0RDtBQUM1RCwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUNBQXFDO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixxQ0FBcUMsZUFBZTtBQUNwRDtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLElBQUk7QUFDaEQ7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsU0FBUztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRDtBQUNqRDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLDRCQUE0QixXQUFXO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSw0QkFBNEIsV0FBVztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsK0JBQStCLEtBQUs7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLCtCQUErQixLQUFLO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsZ0RBQWdEO0FBQ2hELGFBQWE7QUFDYixTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsS0FBSzs7QUFFTDtBQUNBLDZCQUE2QixtQkFBbUI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0Esd0JBQXdCLEtBQUssTUFBTTs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLFFBQVE7QUFDakQsMENBQTBDLFFBQVE7QUFDbEQsOENBQThDLFFBQVE7QUFDdEQsdUNBQXVDLFFBQVE7QUFDL0MsbURBQW1ELFFBQVE7QUFDM0Q7O0FBRUE7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsK0JBQStCLG9CQUFvQjtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE1BQU07QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0EsMkJBQTJCLGVBQWU7QUFDMUM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsV0FBVztBQUMxQixlQUFlLG9CQUFvQjtBQUNuQyxlQUFlLG1CQUFtQjtBQUNsQyxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQTtBQUNBLGFBQWE7QUFDYiwrQ0FBK0M7QUFDL0MsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsMkJBQTJCLHFCQUFxQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7OztBQUdUO0FBQ0E7QUFDQSxtQkFBbUIsS0FBSztBQUN4QixtQkFBbUIsS0FBSztBQUN4QixxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLFNBQVM7OztBQUdUO0FBQ0E7QUFDQSxtQkFBbUIsS0FBSztBQUN4QixtQkFBbUIsS0FBSztBQUN4QixtQkFBbUIsS0FBSztBQUN4QixxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7OztBQUdUO0FBQ0E7QUFDQSxtQkFBbUIsS0FBSztBQUN4QixtQkFBbUIsS0FBSztBQUN4QixtQkFBbUIsS0FBSztBQUN4QixtQkFBbUIsS0FBSztBQUN4QixxQkFBcUI7QUFDckI7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJDQUEyQztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7O0FBR1Q7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7O0FBR1Q7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0Esd0NBQXdDLHlCQUF5QjtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7OztBQUdUO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLCtCQUErQiwyQkFBMkI7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0EsK0JBQStCLDJCQUEyQjtBQUMxRDtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixnQkFBZ0I7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7O0FBR1Q7QUFDQTtBQUNBLG1CQUFtQixLQUFLO0FBQ3hCLG1CQUFtQixLQUFLO0FBQ3hCLG1CQUFtQixLQUFLO0FBQ3hCLG1CQUFtQixLQUFLO0FBQ3hCLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTOzs7QUFHVDtBQUNBO0FBQ0EsbUJBQW1CLEtBQUs7QUFDeEIsbUJBQW1CLEtBQUs7QUFDeEIsbUJBQW1CLEtBQUs7QUFDeEIsbUJBQW1CLEtBQUs7QUFDeEIscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCw4QkFBOEI7QUFDcEY7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7O0FBRXJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUMsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwyQkFBMkIsZUFBZTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJCQUEyQixlQUFl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QTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1QyIsImZpbGUiOiJib3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDMpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDg1ZDU3NmJmZDg5ZWY0NDViNjY1IiwiLyohXG5idWlsdCBpbiAyMDE3LTEtNDoxMzo0IHZlcnNpb24gMi4yLjQgYnkg5Y+45b6S5q2j576OXG5odHRwczovL2dpdGh1Yi5jb20vUnVieUxvdXZyZS9hdmFsb24vdHJlZS8yLjIuM1xuXG7kv67mraNJReS4iyBvcmRlckJ5IEJVR1xu5pu05pS55LiL6L29UHJvbWlzZeeahOaPkOekulxu5L+u5aSNYXZhbG9uLm1vZGVybiDlnKhQcm94eSDmqKHlvI/kuIvkvb/nlKhtcy1mb3Ig5b6q546v5a+56LGh5pe25Ye66ZSZ55qEQlVHXG7kv67lpI1lZmZlY3TlhoXpg6jkvKDlj4IgQlVHXG7ph43mnoRtcy12YWxpZGF0ZeeahOe7keWumuS6i+S7tueahOacuuWItlxuXG4qLyhmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOiBnbG9iYWwuYXZhbG9uID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciB3aW4gPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnID8gZ2xvYmFsIDoge307XG5cbiAgICB2YXIgaW5Ccm93c2VyID0gISF3aW4ubG9jYXRpb24gJiYgd2luLm5hdmlnYXRvcjtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cbiAgICB2YXIgZG9jdW1lbnQkMSA9IGluQnJvd3NlciA/IHdpbi5kb2N1bWVudCA6IHtcbiAgICAgICAgY3JlYXRlRWxlbWVudDogT2JqZWN0LFxuICAgICAgICBjcmVhdGVFbGVtZW50TlM6IE9iamVjdCxcbiAgICAgICAgZG9jdW1lbnRFbGVtZW50OiAneHgnLFxuICAgICAgICBjb250YWluczogQm9vbGVhblxuICAgIH07XG4gICAgdmFyIHJvb3QgPSBpbkJyb3dzZXIgPyBkb2N1bWVudCQxLmRvY3VtZW50RWxlbWVudCA6IHtcbiAgICAgICAgb3V0ZXJIVE1MOiAneCdcbiAgICB9O1xuXG4gICAgdmFyIHZlcnNpb25zID0ge1xuICAgICAgICBvYmplY3RvYmplY3Q6IDcsIC8vSUU3LThcbiAgICAgICAgb2JqZWN0dW5kZWZpbmVkOiA2LCAvL0lFNlxuICAgICAgICB1bmRlZmluZWRmdW5jdGlvbjogTmFOLCAvLyBvdGhlciBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgdW5kZWZpbmVkb2JqZWN0OiBOYU4gfTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbiAgICB2YXIgbXNpZSA9IGRvY3VtZW50JDEuZG9jdW1lbnRNb2RlIHx8IHZlcnNpb25zW3R5cGVvZiBkb2N1bWVudCQxLmFsbCArIHR5cGVvZiBYTUxIdHRwUmVxdWVzdF07XG5cbiAgICB2YXIgbW9kZXJuID0gL05hTnx1bmRlZmluZWQvLnRlc3QobXNpZSkgfHwgbXNpZSA+IDg7XG5cbiAgICAvKlxuICAgICBodHRwczovL2dpdGh1Yi5jb20vcnNtcy9qcy1scnVcbiAgICAgZW50cnkgICAgICAgICAgICAgZW50cnkgICAgICAgICAgICAgZW50cnkgICAgICAgICAgICAgZW50cnkgICAgICAgIFxuICAgICBfX19fX18gICAgICAgICAgICBfX19fX18gICAgICAgICAgICBfX19fX18gICAgICAgICAgICBfX19fX18gICAgICAgXG4gICAgIHwgaGVhZCB8Lm5ld2VyID0+IHwgICAgICB8Lm5ld2VyID0+IHwgICAgICB8Lm5ld2VyID0+IHwgdGFpbCB8ICAgICAgXG4gICAgIHwgIEEgICB8ICAgICAgICAgIHwgIEIgICB8ICAgICAgICAgIHwgIEMgICB8ICAgICAgICAgIHwgIEQgICB8ICAgICAgXG4gICAgIHxfX19fX198IDw9IG9sZGVyLnxfX19fX198IDw9IG9sZGVyLnxfX19fX198IDw9IG9sZGVyLnxfX19fX198ICAgICAgXG4gICAgIFxuICAgICByZW1vdmVkICA8LS0gIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICA8LS0gIDwtLSAgYWRkZWQgXG4gICAgICovXG4gICAgZnVuY3Rpb24gQ2FjaGUobWF4TGVuZ3RoKSB7XG4gICAgICAgIC8vIOagh+ivhuW9k+WJjee8k+WtmOaVsOe7hOeahOWkp+Wwj1xuICAgICAgICB0aGlzLnNpemUgPSAwO1xuICAgICAgICAvLyDmoIfor4bnvJPlrZjmlbDnu4Tog73ovr7liLDnmoTmnIDlpKfplb/luqZcbiAgICAgICAgdGhpcy5saW1pdCA9IG1heExlbmd0aDtcbiAgICAgICAgLy8gIGhlYWTvvIjmnIDkuI3luLjnlKjnmoTpobnvvInvvIx0YWls77yI5pyA5bi455So55qE6aG577yJ5YWo6YOo5Yid5aeL5YyW5Li6dW5kZWZpbmVkXG5cbiAgICAgICAgdGhpcy5oZWFkID0gdGhpcy50YWlsID0gdm9pZCAwO1xuICAgICAgICB0aGlzLl9rZXltYXAgPSB7fTtcbiAgICB9XG5cbiAgICBDYWNoZS5wcm90b3R5cGUgPSB7XG4gICAgICAgIHB1dDogZnVuY3Rpb24gcHV0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBlbnRyeSA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9rZXltYXBba2V5XSA9IGVudHJ5O1xuICAgICAgICAgICAgaWYgKHRoaXMudGFpbCkge1xuICAgICAgICAgICAgICAgIC8vIOWmguaenOWtmOWcqHRhaWzvvIjnvJPlrZjmlbDnu4TnmoTplb/luqbkuI3kuLow77yJ77yM5bCGdGFpbOaMh+WQkeaWsOeahCBlbnRyeVxuICAgICAgICAgICAgICAgIHRoaXMudGFpbC5uZXdlciA9IGVudHJ5O1xuICAgICAgICAgICAgICAgIGVudHJ5Lm9sZGVyID0gdGhpcy50YWlsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpznvJPlrZjmlbDnu4TnmoTplb/luqbkuLow77yM5bCGaGVhZOaMh+WQkeaWsOeahGVudHJ5XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkID0gZW50cnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhaWwgPSBlbnRyeTtcbiAgICAgICAgICAgIC8vIOWmguaenOe8k+WtmOaVsOe7hOi+vuWIsOS4iumZkO+8jOWImeWFiOWIoOmZpCBoZWFkIOaMh+WQkeeahOe8k+WtmOWvueixoVxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAodGhpcy5zaXplID09PSB0aGlzLmxpbWl0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGlmdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNpemUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2hpZnQ6IGZ1bmN0aW9uIHNoaWZ0KCkge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHZhciBlbnRyeSA9IHRoaXMuaGVhZDtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgLy8g5Yig6ZmkIGhlYWQg77yM5bm25pS55Y+Y5oyH5ZCRXG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5ld2VyO1xuICAgICAgICAgICAgICAgIC8vIOWQjOatpeabtOaWsCBfa2V5bWFwIOmHjOmdoueahOWxnuaAp+WAvFxuICAgICAgICAgICAgICAgIHRoaXMuaGVhZC5vbGRlciA9IGVudHJ5Lm5ld2VyID0gZW50cnkub2xkZXIgPSB0aGlzLl9rZXltYXBbZW50cnkua2V5XSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fa2V5bWFwW2VudHJ5LmtleV07IC8vIzEwMjlcbiAgICAgICAgICAgICAgICAvLyDlkIzmraXmm7TmlrAg57yT5a2Y5pWw57uE55qE6ZW/5bqmXG4gICAgICAgICAgICAgICAgdGhpcy5zaXplLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgICAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy5fa2V5bWFwW2tleV07XG4gICAgICAgICAgICAvLyDlpoLmnpzmn6Xmib7kuI3liLDlkKvmnIlga2V5YOi/meS4quWxnuaAp+eahOe8k+WtmOWvueixoVxuICAgICAgICAgICAgaWYgKGVudHJ5ID09PSB2b2lkIDApIHJldHVybjtcbiAgICAgICAgICAgIC8vIOWmguaenOafpeaJvuWIsOeahOe8k+WtmOWvueixoeW3sue7j+aYryB0YWlsICjmnIDov5Hkvb/nlKjov4fnmoQpXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmIChlbnRyeSA9PT0gdGhpcy50YWlsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudHJ5LnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSEVBRC0tLS0tLS0tLS0tLS0tVEFJTFxuICAgICAgICAgICAgLy8gICA8Lm9sZGVyICAgLm5ld2VyPlxuICAgICAgICAgICAgLy8gIDwtLS0gYWRkIGRpcmVjdGlvbiAtLVxuICAgICAgICAgICAgLy8gICBBICBCICBDICA8RD4gIEVcbiAgICAgICAgICAgIGlmIChlbnRyeS5uZXdlcikge1xuICAgICAgICAgICAgICAgIC8vIOWkhOeQhiBuZXdlciDmjIflkJFcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkgPT09IHRoaXMuaGVhZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmn6Xmib7liLDnmoTnvJPlrZjlr7nosaHmmK8gaGVhZCAo5pyA6L+R5pyA5bCR5L2/55So6L+H55qEKVxuICAgICAgICAgICAgICAgICAgICAvLyDliJnlsIYgaGVhZCDmjIflkJHljp8gaGVhZCDnmoQgbmV3ZXIg5omA5oyH5ZCR55qE57yT5a2Y5a+56LGhXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGVhZCA9IGVudHJ5Lm5ld2VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlsIbmiYDmn6Xmib7nmoTnvJPlrZjlr7nosaHnmoTkuIvkuIDnuqfnmoQgb2xkZXIg5oyH5ZCR5omA5p+l5om+55qE57yT5a2Y5a+56LGh55qEb2xkZXLmiYDmjIflkJHnmoTlgLxcbiAgICAgICAgICAgICAgICAvLyDkvovlpoLvvJpBIEIgQyBEIEVcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmn6Xmib7liLDnmoTmmK9E77yM6YKj5LmI5bCGReaMh+WQkUPvvIzkuI3lho3mjIflkJFEXG4gICAgICAgICAgICAgICAgZW50cnkubmV3ZXIub2xkZXIgPSBlbnRyeS5vbGRlcjsgLy8gQyA8LS0gRS5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbnRyeS5vbGRlcikge1xuICAgICAgICAgICAgICAgIC8vIOWkhOeQhiBvbGRlciDmjIflkJFcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmn6Xmib7liLDnmoTmmK9E77yM6YKj5LmIQ+aMh+WQkUXvvIzkuI3lho3mjIflkJFEXG4gICAgICAgICAgICAgICAgZW50cnkub2xkZXIubmV3ZXIgPSBlbnRyeS5uZXdlcjsgLy8gQy4gLS0+IEVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWkhOeQhuaJgOafpeaJvuWIsOeahOWvueixoeeahCBuZXdlciDku6Xlj4ogb2xkZXIg5oyH5ZCRXG4gICAgICAgICAgICBlbnRyeS5uZXdlciA9IHZvaWQgMDsgLy8gRCAtLXhcbiAgICAgICAgICAgIC8vIG9sZGVy5oyH5ZCR5LmL5YmN5L2/55So6L+H55qE5Y+Y6YeP77yM5Y2zROaMh+WQkUVcbiAgICAgICAgICAgIGVudHJ5Lm9sZGVyID0gdGhpcy50YWlsOyAvLyBELiAtLT4gRVxuICAgICAgICAgICAgaWYgKHRoaXMudGFpbCkge1xuICAgICAgICAgICAgICAgIC8vIOWwhkXnmoRuZXdlcuaMh+WQkURcbiAgICAgICAgICAgICAgICB0aGlzLnRhaWwubmV3ZXIgPSBlbnRyeTsgLy8gRS4gPC0tIERcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOaUueWPmCB0YWlsIOS4ukQgXG4gICAgICAgICAgICB0aGlzLnRhaWwgPSBlbnRyeTtcbiAgICAgICAgICAgIHJldHVybiBlbnRyeS52YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVsYXlDb21waWxlID0ge307XG5cbiAgICB2YXIgZGlyZWN0aXZlcyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gZGlyZWN0aXZlKG5hbWUsIG9wdHMpIHtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZXNbbmFtZV0pIHtcbiAgICAgICAgICAgIGF2YWxvbi53YXJuKG5hbWUsICdkaXJlY3RpdmUgaGF2ZSBkZWZpbmVkISAnKTtcbiAgICAgICAgfVxuICAgICAgICBkaXJlY3RpdmVzW25hbWVdID0gb3B0cztcbiAgICAgICAgaWYgKCFvcHRzLnVwZGF0ZSkge1xuICAgICAgICAgICAgb3B0cy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0cy5kZWxheSkge1xuICAgICAgICAgICAgZGVsYXlDb21waWxlW25hbWVdID0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0cztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxheUNvbXBpbGVOb2RlcyhkaXJzKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gZGVsYXlDb21waWxlKSB7XG4gICAgICAgICAgICBpZiAoJ21zLScgKyBpIGluIGRpcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB3aW5kb3ckMSA9IHdpbjtcbiAgICBmdW5jdGlvbiBhdmFsb24oZWwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBhdmFsb24uaW5pdChlbCk7XG4gICAgfVxuXG4gICAgYXZhbG9uLmluaXQgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdGhpc1swXSA9IHRoaXMuZWxlbWVudCA9IGVsO1xuICAgIH07XG5cbiAgICBhdmFsb24uZm4gPSBhdmFsb24ucHJvdG90eXBlID0gYXZhbG9uLmluaXQucHJvdG90eXBlO1xuXG4gICAgZnVuY3Rpb24gc2hhZG93Q29weShkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgZGVzdGluYXRpb25bcHJvcGVydHldID0gc291cmNlW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdGluYXRpb247XG4gICAgfVxuICAgIHZhciByd29yZCA9IC9bXiwgXSsvZztcbiAgICB2YXIgcm5vd2hpdGUgPSAvXFxTKy9nOyAvL+WtmOWcqOmdnuepuuWtl+esplxuICAgIHZhciBwbGF0Zm9ybSA9IHt9OyAvL+eUqOS6juaUvue9ruW5s+WPsOW3ruW8gueahOaWueazleS4juWxnuaAp1xuXG5cbiAgICBmdW5jdGlvbiBvbmVPYmplY3QoYXJyYXksIHZhbCkge1xuICAgICAgICBpZiAodHlwZW9mIGFycmF5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYXJyYXkgPSBhcnJheS5tYXRjaChyd29yZCkgfHwgW107XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgdmFsdWUgPSB2YWwgIT09IHZvaWQgMCA/IHZhbCA6IDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJyYXkubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRbYXJyYXlbaV1dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB2YXIgb3AgPSBPYmplY3QucHJvdG90eXBlO1xuICAgIGZ1bmN0aW9uIHF1b3RlKHN0cikge1xuICAgICAgICByZXR1cm4gYXZhbG9uLl9xdW90ZShzdHIpO1xuICAgIH1cbiAgICB2YXIgaW5zcGVjdCA9IG9wLnRvU3RyaW5nO1xuICAgIHZhciBvaGFzT3duID0gb3AuaGFzT3duUHJvcGVydHk7XG4gICAgdmFyIGFwID0gQXJyYXkucHJvdG90eXBlO1xuXG4gICAgdmFyIGhhc0NvbnNvbGUgPSB0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCc7XG4gICAgYXZhbG9uLmNvbmZpZyA9IHsgZGVidWc6IHRydWUgfTtcbiAgICBmdW5jdGlvbiBsb2coKSB7XG4gICAgICAgIGlmIChoYXNDb25zb2xlICYmIGF2YWxvbi5jb25maWcuZGVidWcpIHtcbiAgICAgICAgICAgIEZ1bmN0aW9uLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gd2FybigpIHtcbiAgICAgICAgaWYgKGhhc0NvbnNvbGUgJiYgYXZhbG9uLmNvbmZpZy5kZWJ1Zykge1xuICAgICAgICAgICAgdmFyIG1ldGhvZCA9IGNvbnNvbGUud2FybiB8fCBjb25zb2xlLmxvZztcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9xaWFuZzEwNi5pdGV5ZS5jb20vYmxvZy8xNzIxNDI1XG4gICAgICAgICAgICBGdW5jdGlvbi5hcHBseS5jYWxsKG1ldGhvZCwgY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlcnJvcihzdHIsIGUpIHtcbiAgICAgICAgdGhyb3cgKGUgfHwgRXJyb3IpKHN0cik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIGZ1bmN0aW9uIGlzT2JqZWN0KGEpIHtcbiAgICAgICAgcmV0dXJuIGEgIT09IG51bGwgJiYgdHlwZW9mIGEgPT09ICdvYmplY3QnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgICAgICAgLy8g55So5LqO55Sf5oiQ5pW05pWw5pWw57uEXG4gICAgICAgIHN0ZXAgfHwgKHN0ZXAgPSAxKTtcbiAgICAgICAgaWYgKGVuZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBlbmQgPSBzdGFydCB8fCAwO1xuICAgICAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKChlbmQgLSBzdGFydCkgLyBzdGVwKSksXG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBzdGFydDtcbiAgICAgICAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB2YXIgcmh5cGhlbiA9IC8oW2EtelxcZF0pKFtBLVpdKykvZztcbiAgICBmdW5jdGlvbiBoeXBoZW4odGFyZ2V0KSB7XG4gICAgICAgIC8v6L2s5o2i5Li66L+e5a2X56ym57q/6aOO5qC8XG4gICAgICAgIHJldHVybiB0YXJnZXQucmVwbGFjZShyaHlwaGVuLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIHZhciByY2FtZWxpemUgPSAvWy1fXVteLV9dL2c7XG4gICAgZnVuY3Rpb24gY2FtZWxpemUodGFyZ2V0KSB7XG4gICAgICAgIC8v5o+Q5YmN5Yik5pat77yM5o+Q6auYZ2V0U3R5bGXnrYnnmoTmlYjnjodcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgdGFyZ2V0LmluZGV4T2YoJy0nKSA8IDAgJiYgdGFyZ2V0LmluZGV4T2YoJ18nKSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgLy/ovazmjaLkuLrpqbzls7Dpo47moLxcbiAgICAgICAgcmV0dXJuIHRhcmdldC5yZXBsYWNlKHJjYW1lbGl6ZSwgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDEpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBfc2xpY2UgPSBhcC5zbGljZTtcbiAgICBmdW5jdGlvbiBzbGljZShub2Rlcywgc3RhcnQsIGVuZCkge1xuICAgICAgICByZXR1cm4gX3NsaWNlLmNhbGwobm9kZXMsIHN0YXJ0LCBlbmQpO1xuICAgIH1cblxuICAgIHZhciByaGFzaGNvZGUgPSAvXFxkXFwuXFxkezR9LztcbiAgICAvL+eUn+aIkFVVSUQgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZC1pbi1qYXZhc2NyaXB0XG4gICAgZnVuY3Rpb24gbWFrZUhhc2hDb2RlKHByZWZpeCkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgICAgIHByZWZpeCA9IHByZWZpeCB8fCAnYXZhbG9uJztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgICAgICByZXR1cm4gU3RyaW5nKE1hdGgucmFuZG9tKCkgKyBNYXRoLnJhbmRvbSgpKS5yZXBsYWNlKHJoYXNoY29kZSwgcHJlZml4KTtcbiAgICB9XG4gICAgLy/nlJ/miJDkuovku7blm57osIPnmoRVVUlEKOeUqOaIt+mAmui/h21zLW9u5oyH5LukKVxuICAgIGZ1bmN0aW9uIGdldExvbmdJRChmbikge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICByZXR1cm4gZm4udXVpZCB8fCAoZm4udXVpZCA9IG1ha2VIYXNoQ29kZSgnZScpKTtcbiAgICB9XG4gICAgdmFyIFVVSUQgPSAxO1xuICAgIC8v55Sf5oiQ5LqL5Lu25Zue6LCD55qEVVVJRCjnlKjmiLfpgJrov4dhdmFsb24uYmluZClcbiAgICBmdW5jdGlvbiBnZXRTaG9ydElEKGZuKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHJldHVybiBmbi51dWlkIHx8IChmbi51dWlkID0gJ18nICsgKytVVUlEKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzY2FwZSA9IC9bLS4qKz9eJHt9KCl8W1xcXVxcL1xcXFxdL2c7XG4gICAgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHRhcmdldCkge1xuICAgICAgICAvL2h0dHA6Ly9zdGV2ZW5sZXZpdGhhbi5jb20vcmVnZXgveHJlZ2V4cC9cbiAgICAgICAgLy/lsIblrZfnrKbkuLLlronlhajmoLzlvI/ljJbkuLrmraPliJnooajovr7lvI/nmoTmupDnoIFcbiAgICAgICAgcmV0dXJuICh0YXJnZXQgKyAnJykucmVwbGFjZShyZXNjYXBlLCAnXFxcXCQmJyk7XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50SG9va3MgPSB7fTtcbiAgICB2YXIgZXZlbnRMaXN0ZW5lcnMgPSB7fTtcbiAgICB2YXIgdmFsaWRhdG9ycyA9IHt9O1xuICAgIHZhciBjc3NIb29rcyA9IHt9O1xuXG4gICAgd2luZG93JDEuYXZhbG9uID0gYXZhbG9uO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlRnJhZ21lbnQoKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQkMS5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgfVxuXG4gICAgdmFyIHJlbnRpdGllcyA9IC8mW2EtejAtOSNdezIsMTB9Oy87XG4gICAgdmFyIHRlbXAgPSBkb2N1bWVudCQxLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHNoYWRvd0NvcHkoYXZhbG9uLCB7XG4gICAgICAgIEFycmF5OiB7XG4gICAgICAgICAgICBtZXJnZTogZnVuY3Rpb24gbWVyZ2UodGFyZ2V0LCBvdGhlcikge1xuICAgICAgICAgICAgICAgIC8v5ZCI5bm25Lik5Liq5pWw57uEIGF2YWxvbjLmlrDlop5cbiAgICAgICAgICAgICAgICB0YXJnZXQucHVzaC5hcHBseSh0YXJnZXQsIG90aGVyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnN1cmU6IGZ1bmN0aW9uIGVuc3VyZSh0YXJnZXQsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvL+WPquacieW9k+WJjeaVsOe7hOS4jeWtmOWcqOatpOWFg+e0oOaXtuWPqua3u+WKoOWug1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZihpdGVtKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVBdDogZnVuY3Rpb24gcmVtb3ZlQXQodGFyZ2V0LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIC8v56e76Zmk5pWw57uE5Lit5oyH5a6a5L2N572u55qE5YWD57Sg77yM6L+U5Zue5biD5bCU6KGo56S65oiQ5Yqf5LiO5ZCmXG4gICAgICAgICAgICAgICAgcmV0dXJuICEhdGFyZ2V0LnNwbGljZShpbmRleCwgMSkubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKHRhcmdldCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIC8v56e76Zmk5pWw57uE5Lit56ys5LiA5Liq5Yy56YWN5Lyg5Y+C55qE6YKj5Liq5YWD57Sg77yM6L+U5Zue5biD5bCU6KGo56S65oiQ5Yqf5LiO5ZCmXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGFyZ2V0LmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgaWYgKH5pbmRleCkgcmV0dXJuIGF2YWxvbi5BcnJheS5yZW1vdmVBdCh0YXJnZXQsIGluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGV2YWx1YXRvclBvb2w6IG5ldyBDYWNoZSg4ODgpLFxuICAgICAgICBwYXJzZXJzOiB7XG4gICAgICAgICAgICBudW1iZXI6IGZ1bmN0aW9uIG51bWJlcihhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPT09ICcnID8gJycgOiBwYXJzZUZsb2F0KGEpIHx8IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RyaW5nOiBmdW5jdGlvbiBzdHJpbmcoYSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhID09PSBudWxsIHx8IGEgPT09IHZvaWQgMCA/ICcnIDogYSArICcnO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiYm9vbGVhblwiOiBmdW5jdGlvbiBib29sZWFuKGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoYSA9PT0gJycpIHJldHVybiBhO1xuICAgICAgICAgICAgICAgIHJldHVybiBhID09PSAndHJ1ZScgfHwgYSA9PT0gJzEnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfZGVjb2RlOiBmdW5jdGlvbiBfZGVjb2RlKHN0cikge1xuICAgICAgICAgICAgaWYgKHJlbnRpdGllcy50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgICAgICB0ZW1wLmlubmVySFRNTCA9IHN0cjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcC5pbm5lclRleHQgfHwgdGVtcC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vPT09PT09PT09PT09PT0gY29uZmlnID09PT09PT09PT09PVxuICAgIGZ1bmN0aW9uIGNvbmZpZyhzZXR0aW5ncykge1xuICAgICAgICBmb3IgKHZhciBwIGluIHNldHRpbmdzKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gc2V0dGluZ3NbcF07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy5wbHVnaW5zW3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLnBsdWdpbnNbcF0odmFsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uZmlnW3BdID0gdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhciBwbHVnaW5zID0ge1xuICAgICAgICBpbnRlcnBvbGF0ZTogZnVuY3Rpb24gaW50ZXJwb2xhdGUoYXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBvcGVuVGFnID0gYXJyYXlbMF07XG4gICAgICAgICAgICB2YXIgY2xvc2VUYWcgPSBhcnJheVsxXTtcbiAgICAgICAgICAgIGlmIChvcGVuVGFnID09PSBjbG9zZVRhZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignaW50ZXJwb2xhdGUgb3BlblRhZyBjYW5ub3QgZXF1YWwgdG8gY2xvc2VUYWcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdHIgPSBvcGVuVGFnICsgJ3Rlc3QnICsgY2xvc2VUYWc7XG5cbiAgICAgICAgICAgIGlmICgvWzw+XS8udGVzdChzdHIpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdpbnRlcnBvbGF0ZSBjYW5ub3QgY29udGFpbnMgXCI8XCIgb3IgXCI+XCInKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uZmlnLm9wZW5UYWcgPSBvcGVuVGFnO1xuICAgICAgICAgICAgY29uZmlnLmNsb3NlVGFnID0gY2xvc2VUYWc7XG4gICAgICAgICAgICB2YXIgbyA9IGVzY2FwZVJlZ0V4cChvcGVuVGFnKTtcbiAgICAgICAgICAgIHZhciBjID0gZXNjYXBlUmVnRXhwKGNsb3NlVGFnKTtcblxuICAgICAgICAgICAgY29uZmlnLnJ0ZXh0ID0gbmV3IFJlZ0V4cChvICsgJyguKz8pJyArIGMsICdnJyk7XG4gICAgICAgICAgICBjb25maWcucmV4cHIgPSBuZXcgUmVnRXhwKG8gKyAnKFtcXFxcc1xcXFxTXSopJyArIGMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBjcmVhdGVBbmNob3Iobm9kZVZhbHVlKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudCQxLmNyZWF0ZUNvbW1lbnQobm9kZVZhbHVlKTtcbiAgICB9XG4gICAgY29uZmlnLnBsdWdpbnMgPSBwbHVnaW5zO1xuICAgIGNvbmZpZyh7XG4gICAgICAgIGludGVycG9sYXRlOiBbJ3t7JywgJ319J10sXG4gICAgICAgIGRlYnVnOiB0cnVlXG4gICAgfSk7XG4gICAgLy89PT09PT09PT09PT0gIGNvbmZpZyA9PT09PT09PT09PT1cblxuICAgIHNoYWRvd0NvcHkoYXZhbG9uLCB7XG4gICAgICAgIHNoYWRvd0NvcHk6IHNoYWRvd0NvcHksXG5cbiAgICAgICAgb25lT2JqZWN0OiBvbmVPYmplY3QsXG4gICAgICAgIGluc3BlY3Q6IGluc3BlY3QsXG4gICAgICAgIG9oYXNPd246IG9oYXNPd24sXG4gICAgICAgIHJ3b3JkOiByd29yZCxcbiAgICAgICAgdmVyc2lvbjogXCIyLjIuNFwiLFxuICAgICAgICB2bW9kZWxzOiB7fSxcblxuICAgICAgICBkaXJlY3RpdmVzOiBkaXJlY3RpdmVzLFxuICAgICAgICBkaXJlY3RpdmU6IGRpcmVjdGl2ZSxcblxuICAgICAgICBldmVudEhvb2tzOiBldmVudEhvb2tzLFxuICAgICAgICBldmVudExpc3RlbmVyczogZXZlbnRMaXN0ZW5lcnMsXG4gICAgICAgIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnMsXG4gICAgICAgIGNzc0hvb2tzOiBjc3NIb29rcyxcblxuICAgICAgICBsb2c6IGxvZyxcbiAgICAgICAgbm9vcDogbm9vcCxcbiAgICAgICAgd2Fybjogd2FybixcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcblxuICAgICAgICBtb2Rlcm46IG1vZGVybixcbiAgICAgICAgbXNpZTogbXNpZSxcbiAgICAgICAgcm9vdDogcm9vdCxcbiAgICAgICAgZG9jdW1lbnQ6IGRvY3VtZW50JDEsXG4gICAgICAgIHdpbmRvdzogd2luZG93JDEsXG4gICAgICAgIGluQnJvd3NlcjogaW5Ccm93c2VyLFxuXG4gICAgICAgIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgICAgICAgcmFuZ2U6IHJhbmdlLFxuICAgICAgICBzbGljZTogc2xpY2UsXG4gICAgICAgIGh5cGhlbjogaHlwaGVuLFxuICAgICAgICBjYW1lbGl6ZTogY2FtZWxpemUsXG4gICAgICAgIGVzY2FwZVJlZ0V4cDogZXNjYXBlUmVnRXhwLFxuICAgICAgICBxdW90ZTogcXVvdGUsXG5cbiAgICAgICAgbWFrZUhhc2hDb2RlOiBtYWtlSGFzaENvZGVcblxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICog5q2k5qih5Z2X55So5LqO5L+u5aSN6K+t6KiA55qE5bqV5bGC57y66Zm3XG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOYXRpdmUoZm4pIHtcbiAgICAgICAgcmV0dXJuICgvXFxbbmF0aXZlIGNvZGVcXF0vLnRlc3QoZm4pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICBpZiAoIWlzTmF0aXZlKCflj7jlvpLmraPnvo4nLnRyaW0pKSB7XG4gICAgICAgIHZhciBydHJpbSA9IC9eW1xcc1xcdUZFRkZcXHhBMF0rfFtcXHNcXHVGRUZGXFx4QTBdKyQvZztcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS50cmltID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZShydHJpbSwgJycpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoIU9iamVjdC5jcmVhdGUpIHtcbiAgICAgICAgT2JqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEYoKSB7fVxuXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT2JqZWN0LmNyZWF0ZSBpbXBsZW1lbnRhdGlvbiBvbmx5IGFjY2VwdHMgb25lIHBhcmFtZXRlci4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBvO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRigpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSgpO1xuICAgIH1cbiAgICB2YXIgaGFzRG9udEVudW1CdWcgPSAhe1xuICAgICAgICAndG9TdHJpbmcnOiBudWxsXG4gICAgfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgICB2YXIgaGFzUHJvdG9FbnVtQnVnID0gZnVuY3Rpb24gKCkge30ucHJvcGVydHlJc0VudW1lcmFibGUoJ3Byb3RvdHlwZScpO1xuICAgIHZhciBkb250RW51bXMgPSBbJ3RvU3RyaW5nJywgJ3RvTG9jYWxlU3RyaW5nJywgJ3ZhbHVlT2YnLCAnaGFzT3duUHJvcGVydHknLCAnaXNQcm90b3R5cGVPZicsICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICdjb25zdHJ1Y3RvciddO1xuICAgIHZhciBkb250RW51bXNMZW5ndGggPSBkb250RW51bXMubGVuZ3RoO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgaWYgKCFpc05hdGl2ZShPYmplY3Qua2V5cykpIHtcbiAgICAgICAgT2JqZWN0LmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICAgICAgICAvL2VjbWEyNjJ2NSAxNS4yLjMuMTRcbiAgICAgICAgICAgIHZhciB0aGVLZXlzID0gW107XG4gICAgICAgICAgICB2YXIgc2tpcFByb3RvID0gaGFzUHJvdG9FbnVtQnVnICYmIHR5cGVvZiBvYmplY3QgPT09ICdmdW5jdGlvbic7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdCA9PT0gJ3N0cmluZycgfHwgb2JqZWN0ICYmIG9iamVjdC5jYWxsZWUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB0aGVLZXlzLnB1c2goU3RyaW5nKGkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHNraXBQcm90byAmJiBuYW1lID09PSAncHJvdG90eXBlJykgJiYgb2hhc093bi5jYWxsKG9iamVjdCwgbmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZUtleXMucHVzaChTdHJpbmcobmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGFzRG9udEVudW1CdWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgICAgICAgc2tpcENvbnN0cnVjdG9yID0gY3RvciAmJiBjdG9yLnByb3RvdHlwZSA9PT0gb2JqZWN0O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZG9udEVudW1zTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRvbnRFbnVtID0gZG9udEVudW1zW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShza2lwQ29uc3RydWN0b3IgJiYgZG9udEVudW0gPT09ICdjb25zdHJ1Y3RvcicpICYmIG9oYXNPd24uY2FsbChvYmplY3QsIGRvbnRFbnVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlS2V5cy5wdXNoKGRvbnRFbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGVLZXlzO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgIGlmICghaXNOYXRpdmUoQXJyYXkuaXNBcnJheSkpIHtcbiAgICAgICAgQXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgaWYgKCFpc05hdGl2ZShpc05hdGl2ZS5iaW5kKSkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIgJiYgc2NvcGUgPT09IHZvaWQgMCkgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB2YXIgZm4gPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFyZ3YgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gW10sXG4gICAgICAgICAgICAgICAgICAgIGk7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8IGFyZ3YubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGFyZ3ZbaV0pO1xuICAgICAgICAgICAgICAgIH1mb3IgKGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICAgICAgICAgIH1yZXR1cm4gZm4uYXBwbHkoc2NvcGUsIGFyZ3MpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy9odHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy96aC1DTi9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9zbGljZVxuICAgIC8qKlxuICAgICAqIFNoaW0gZm9yIFwiZml4aW5nXCIgSUUncyBsYWNrIG9mIHN1cHBvcnQgKElFIDwgOSkgZm9yIGFwcGx5aW5nIHNsaWNlXG4gICAgICogb24gaG9zdCBvYmplY3RzIGxpa2UgTmFtZWROb2RlTWFwLCBOb2RlTGlzdCwgYW5kIEhUTUxDb2xsZWN0aW9uXG4gICAgICogKHRlY2huaWNhbGx5LCBzaW5jZSBob3N0IG9iamVjdHMgaGF2ZSBiZWVuIGltcGxlbWVudGF0aW9uLWRlcGVuZGVudCxcbiAgICAgKiBhdCBsZWFzdCBiZWZvcmUgRVM2LCBJRSBoYXNuJ3QgbmVlZGVkIHRvIHdvcmsgdGhpcyB3YXkpLlxuICAgICAqIEFsc28gd29ya3Mgb24gc3RyaW5ncywgZml4ZXMgSUUgPCA5IHRvIGFsbG93IGFuIGV4cGxpY2l0IHVuZGVmaW5lZFxuICAgICAqIGZvciB0aGUgMm5kIGFyZ3VtZW50IChhcyBpbiBGaXJlZm94KSwgYW5kIHByZXZlbnRzIGVycm9ycyB3aGVuXG4gICAgICogY2FsbGVkIG9uIG90aGVyIERPTSBvYmplY3RzLlxuICAgICAqL1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gQ2FuJ3QgYmUgdXNlZCB3aXRoIERPTSBlbGVtZW50cyBpbiBJRSA8IDlcbiAgICAgICAgX3NsaWNlLmNhbGwoYXZhbG9uLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBGYWlscyBpbiBJRSA8IDlcbiAgICAgICAgLy8gVGhpcyB3aWxsIHdvcmsgZm9yIGdlbnVpbmUgYXJyYXlzLCBhcnJheS1saWtlIG9iamVjdHMsXG4gICAgICAgIC8vIE5hbWVkTm9kZU1hcCAoYXR0cmlidXRlcywgZW50aXRpZXMsIG5vdGF0aW9ucyksXG4gICAgICAgIC8vIE5vZGVMaXN0IChlLmcuLCBnZXRFbGVtZW50c0J5VGFnTmFtZSksIEhUTUxDb2xsZWN0aW9uIChlLmcuLCBjaGlsZE5vZGVzKSxcbiAgICAgICAgLy8gYW5kIHdpbGwgbm90IGZhaWwgb24gb3RoZXIgRE9NIG9iamVjdHMgKGFzIGRvIERPTSBlbGVtZW50cyBpbiBJRSA8IDkpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICAgICAgYXAuc2xpY2UgPSBmdW5jdGlvbiAoYmVnaW4sIGVuZCkge1xuICAgICAgICAgICAgLy8gSUUgPCA5IGdldHMgdW5oYXBweSB3aXRoIGFuIHVuZGVmaW5lZCBlbmQgYXJndW1lbnRcbiAgICAgICAgICAgIGVuZCA9IHR5cGVvZiBlbmQgIT09ICd1bmRlZmluZWQnID8gZW5kIDogdGhpcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIEZvciBuYXRpdmUgQXJyYXkgb2JqZWN0cywgd2UgdXNlIHRoZSBuYXRpdmUgc2xpY2UgZnVuY3Rpb25cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9zbGljZS5jYWxsKHRoaXMsIGJlZ2luLCBlbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3IgYXJyYXkgbGlrZSBvYmplY3Qgd2UgaGFuZGxlIGl0IG91cnNlbHZlcy5cbiAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgIGNsb25lZCA9IFtdLFxuICAgICAgICAgICAgICAgIHNpemUsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBuZWdhdGl2ZSB2YWx1ZSBmb3IgXCJiZWdpblwiXG4gICAgICAgICAgICB2YXIgc3RhcnQgPSBiZWdpbiB8fCAwO1xuICAgICAgICAgICAgc3RhcnQgPSBzdGFydCA+PSAwID8gc3RhcnQgOiBsZW4gKyBzdGFydDtcblxuICAgICAgICAgICAgLy8gSGFuZGxlIG5lZ2F0aXZlIHZhbHVlIGZvciBcImVuZFwiXG4gICAgICAgICAgICB2YXIgdXBUbyA9IGVuZCA/IGVuZCA6IGxlbjtcbiAgICAgICAgICAgIGlmIChlbmQgPCAwKSB7XG4gICAgICAgICAgICAgICAgdXBUbyA9IGxlbiArIGVuZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWN0dWFsIGV4cGVjdGVkIHNpemUgb2YgdGhlIHNsaWNlXG4gICAgICAgICAgICBzaXplID0gdXBUbyAtIHN0YXJ0O1xuXG4gICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcbiAgICAgICAgICAgICAgICBjbG9uZWQgPSBuZXcgQXJyYXkoc2l6ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhckF0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lZFtpXSA9IHRoaXMuY2hhckF0KHN0YXJ0ICsgaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZWRbaV0gPSB0aGlzW3N0YXJ0ICsgaV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjbG9uZWQ7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICBmdW5jdGlvbiBpdGVyYXRvcih2YXJzLCBib2R5LCByZXQpIHtcbiAgICAgICAgdmFyIGZ1biA9ICdmb3IodmFyICcgKyB2YXJzICsgJ2k9MCxuID0gdGhpcy5sZW5ndGg7IGkgPCBuOyBpKyspeycgKyBib2R5LnJlcGxhY2UoJ18nLCAnKChpIGluIHRoaXMpICYmIGZuLmNhbGwoc2NvcGUsdGhpc1tpXSxpLHRoaXMpKScpICsgJ30nICsgcmV0O1xuICAgICAgICAvKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG4gICAgICAgIHJldHVybiBGdW5jdGlvbignZm4sc2NvcGUnLCBmdW4pO1xuICAgICAgICAvKiBqc2hpbnQgaWdub3JlOmVuZCAqL1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgIGlmICghaXNOYXRpdmUoYXAubWFwKSkge1xuICAgICAgICBhdmFsb24uc2hhZG93Q29weShhcCwge1xuICAgICAgICAgICAgLy/lrprkvY3mk43kvZzvvIzov5Tlm57mlbDnu4TkuK3nrKzkuIDkuKrnrYnkuo7nu5nlrprlj4LmlbDnmoTlhYPntKDnmoTntKLlvJXlgLzjgIJcbiAgICAgICAgICAgIGluZGV4T2Y6IGZ1bmN0aW9uIGluZGV4T2YoaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbiA9IHRoaXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBpID0gfn5pbmRleDtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IDApIGkgKz0gbjtcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfXJldHVybiAtMTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvL+WumuS9jeaTjeS9nO+8jOWQjOS4iu+8jOS4jei/h+aYr+S7juWQjumBjeWOhuOAglxuICAgICAgICAgICAgbGFzdEluZGV4T2Y6IGZ1bmN0aW9uIGxhc3RJbmRleE9mKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSB0aGlzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgaSA9IGluZGV4ID09IG51bGwgPyBuIC0gMSA6IGluZGV4O1xuICAgICAgICAgICAgICAgIGlmIChpIDwgMCkgaSA9IE1hdGgubWF4KDAsIG4gKyBpKTtcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1yZXR1cm4gLTE7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy/ov63ku6Pmk43kvZzvvIzlsIbmlbDnu4TnmoTlhYPntKDmjKjkuKrlhL/kvKDlhaXkuIDkuKrlh73mlbDkuK3miafooYzjgIJQcm90b3R5cGUuanPnmoTlr7nlupTlkI3lrZfkuLplYWNo44CCXG4gICAgICAgICAgICBmb3JFYWNoOiBpdGVyYXRvcignJywgJ18nLCAnJyksXG4gICAgICAgICAgICAvL+i/reS7o+exuyDlnKjmlbDnu4TkuK3nmoTmr4/kuKrpobnkuIrov5DooYzkuIDkuKrlh73mlbDvvIzlpoLmnpzmraTlh73mlbDnmoTlgLzkuLrnnJ/vvIzliJnmraTlhYPntKDkvZzkuLrmlrDmlbDnu4TnmoTlhYPntKDmlLbpm4botbfmnaXvvIzlubbov5Tlm57mlrDmlbDnu4RcbiAgICAgICAgICAgIGZpbHRlcjogaXRlcmF0b3IoJ3I9W10saj0wLCcsICdpZihfKXJbaisrXT10aGlzW2ldJywgJ3JldHVybiByJyksXG4gICAgICAgICAgICAvL+aUtumbhuaTjeS9nO+8jOWwhuaVsOe7hOeahOWFg+e0oOaMqOS4quWEv+S8oOWFpeS4gOS4quWHveaVsOS4reaJp+ihjO+8jOeEtuWQjuaKiuWug+S7rOeahOi/lOWbnuWAvOe7hOaIkOS4gOS4quaWsOaVsOe7hOi/lOWbnuOAglByb3RvdHlwZS5qc+eahOWvueW6lOWQjeWtl+S4umNvbGxlY3TjgIJcbiAgICAgICAgICAgIG1hcDogaXRlcmF0b3IoJ3I9W10sJywgJ3JbaV09XycsICdyZXR1cm4gcicpLFxuICAgICAgICAgICAgLy/lj6ropoHmlbDnu4TkuK3mnInkuIDkuKrlhYPntKDmu6HotrPmnaHku7bvvIjmlL7ov5vnu5nlrprlh73mlbDov5Tlm550cnVl77yJ77yM6YKj5LmI5a6D5bCx6L+U5ZuedHJ1ZeOAglByb3RvdHlwZS5qc+eahOWvueW6lOWQjeWtl+S4umFueeOAglxuICAgICAgICAgICAgc29tZTogaXRlcmF0b3IoJycsICdpZihfKXJldHVybiB0cnVlJywgJ3JldHVybiBmYWxzZScpLFxuICAgICAgICAgICAgLy/lj6rmnInmlbDnu4TkuK3nmoTlhYPntKDpg73mu6HotrPmnaHku7bvvIjmlL7ov5vnu5nlrprlh73mlbDov5Tlm550cnVl77yJ77yM5a6D5omN6L+U5ZuedHJ1ZeOAglByb3RvdHlwZS5qc+eahOWvueW6lOWQjeWtl+S4umFsbOOAglxuICAgICAgICAgICAgZXZlcnk6IGl0ZXJhdG9yKCcnLCAnaWYoIV8pcmV0dXJuIGZhbHNlJywgJ3JldHVybiB0cnVlJylcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy/ov5nph4zmlL7nva7lrZjlnKjlvILorq7nmoTmlrnms5VcbiAgICB2YXIgY29tcGFjZVF1b3RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9qc29uMy9ibG9iL21hc3Rlci9saWIvanNvbjMuanNcbiAgICAgICAgdmFyIEVzY2FwZXMgPSB7XG4gICAgICAgICAgICA5MjogXCJcXFxcXFxcXFwiLFxuICAgICAgICAgICAgMzQ6ICdcXFxcXCInLFxuICAgICAgICAgICAgODogXCJcXFxcYlwiLFxuICAgICAgICAgICAgMTI6IFwiXFxcXGZcIixcbiAgICAgICAgICAgIDEwOiBcIlxcXFxuXCIsXG4gICAgICAgICAgICAxMzogXCJcXFxcclwiLFxuICAgICAgICAgICAgOTogXCJcXFxcdFwiXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxlYWRpbmdaZXJvZXMgPSAnMDAwMDAwJztcbiAgICAgICAgdmFyIHRvUGFkZGVkU3RyaW5nID0gZnVuY3Rpb24gdG9QYWRkZWRTdHJpbmcod2lkdGgsIHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gKGxlYWRpbmdaZXJvZXMgKyAodmFsdWUgfHwgMCkpLnNsaWNlKC13aWR0aCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB1bmljb2RlUHJlZml4ID0gJ1xcXFx1MDAnO1xuICAgICAgICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICB2YXIgY2hhckNvZGUgPSBjaGFyYWN0ZXIuY2hhckNvZGVBdCgwKSxcbiAgICAgICAgICAgICAgICBlc2NhcGVkID0gRXNjYXBlc1tjaGFyQ29kZV07XG4gICAgICAgICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlc2NhcGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuaWNvZGVQcmVmaXggKyB0b1BhZGRlZFN0cmluZygyLCBjaGFyQ29kZS50b1N0cmluZygxNikpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVFc2NhcGUgPSAvW1xceDAwLVxceDFmXFx4MjJcXHg1Y10vZztcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJlRXNjYXBlLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuICdcIicgKyAocmVFc2NhcGUudGVzdCh2YWx1ZSkgPyBTdHJpbmcodmFsdWUpLnJlcGxhY2UocmVFc2NhcGUsIGVzY2FwZUNoYXIpIDogdmFsdWUpICsgJ1wiJztcbiAgICAgICAgfTtcbiAgICB9KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXZhbG9uLl9xdW90ZSA9IEpTT04uc3RyaW5naWZ5O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG4gICAgICAgIGF2YWxvbi5fcXVvdGUgPSBjb21wYWNlUXVvdGU7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzMnR5cGUgPSB7fTtcbiAgICAnQm9vbGVhbiBOdW1iZXIgU3RyaW5nIEZ1bmN0aW9uIEFycmF5IERhdGUgUmVnRXhwIE9iamVjdCBFcnJvcicucmVwbGFjZShhdmFsb24ucndvcmQsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGNsYXNzMnR5cGVbJ1tvYmplY3QgJyArIG5hbWUgKyAnXSddID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH0pO1xuXG4gICAgYXZhbG9uLnR5cGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIC8v5Y+W5b6X55uu5qCH55qE57G75Z6LXG4gICAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhvYmopO1xuICAgICAgICB9XG4gICAgICAgIC8vIOaXqeacn+eahHdlYmtpdOWGheaguOa1j+iniOWZqOWunueOsOS6huW3suW6n+W8g+eahGVjbWEyNjJ2NOagh+WHhu+8jOWPr+S7peWwhuato+WImeWtl+mdoumHj+W9k+S9nOWHveaVsOS9v+eUqO+8jOWboOatpHR5cGVvZuWcqOWIpOWumuato+WImeaXtuS8mui/lOWbnmZ1bmN0aW9uXG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nID8gY2xhc3MydHlwZVtpbnNwZWN0LmNhbGwob2JqKV0gfHwgJ29iamVjdCcgOiB0eXBlb2Ygb2JqO1xuICAgIH07XG5cbiAgICB2YXIgcmZ1bmN0aW9uID0gL15cXHMqXFxiZnVuY3Rpb25cXGIvO1xuXG4gICAgYXZhbG9uLmlzRnVuY3Rpb24gPSAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi90eXBlb2YgYWxlcnQgPT09ICdvYmplY3QnID8gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIHJmdW5jdGlvbi50ZXN0KGZuICsgJycpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSA6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gaW5zcGVjdC5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuXG4gICAgLy8g5Yip55SoSUU2Nzggd2luZG93ID09IGRvY3VtZW505Li6dHJ1ZSxkb2N1bWVudCA9PSB3aW5kb3fnq5/nhLbkuLpmYWxzZeeahOelnuWlh+eJueaAp1xuICAgIC8vIOagh+WHhua1j+iniOWZqOWPiklFOe+8jElFMTDnrYnkvb/nlKgg5q2j5YiZ5qOA5rWLXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBpc1dpbmRvd0NvbXBhY3Qob2JqKSB7XG4gICAgICAgIGlmICghb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iaiA9PSBvYmouZG9jdW1lbnQgJiYgb2JqLmRvY3VtZW50ICE9IG9iajsgLy9qc2hpbnQgaWdub3JlOmxpbmVcbiAgICB9XG5cbiAgICB2YXIgcndpbmRvdyA9IC9eXFxbb2JqZWN0ICg/OldpbmRvd3xET01XaW5kb3d8Z2xvYmFsKVxcXSQvO1xuXG4gICAgZnVuY3Rpb24gaXNXaW5kb3dNb2Rlcm4ob2JqKSB7XG4gICAgICAgIHJldHVybiByd2luZG93LnRlc3QoaW5zcGVjdC5jYWxsKG9iaikpO1xuICAgIH1cblxuICAgIGF2YWxvbi5pc1dpbmRvdyA9IGlzV2luZG93TW9kZXJuKGF2YWxvbi53aW5kb3cpID8gaXNXaW5kb3dNb2Rlcm4gOiBpc1dpbmRvd0NvbXBhY3Q7XG5cbiAgICB2YXIgZW51O1xuICAgIHZhciBlbnVtZXJhdGVCVUc7XG4gICAgZm9yIChlbnUgaW4gYXZhbG9uKHt9KSkge1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBlbnVtZXJhdGVCVUcgPSBlbnUgIT09ICcwJzsgLy9JRTbkuIvkuLp0cnVlLCDlhbbku5bkuLpmYWxzZVxuXG4gICAgLyrliKTlrprmmK/lkKbmmK/kuIDkuKrmnLTntKDnmoRqYXZhc2NyaXB05a+56LGh77yIT2JqZWN077yJ77yM5LiN5pivRE9N5a+56LGh77yM5LiN5pivQk9N5a+56LGh77yM5LiN5piv6Ieq5a6a5LmJ57G755qE5a6e5L6LKi9cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGlzUGxhaW5PYmplY3RDb21wYWN0KG9iaiwga2V5KSB7XG4gICAgICAgIGlmICghb2JqIHx8IGF2YWxvbi50eXBlKG9iaikgIT09ICdvYmplY3QnIHx8IG9iai5ub2RlVHlwZSB8fCBhdmFsb24uaXNXaW5kb3cob2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvL0lF5YaF572u5a+56LGh5rKh5pyJY29uc3RydWN0b3JcbiAgICAgICAgICAgIGlmIChvYmouY29uc3RydWN0b3IgJiYgIW9oYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpICYmICFvaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpc1ZCc2NyaXB0ID0gb2JqLiR2YnRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vSUU4IDnkvJrlnKjov5nph4zmipvplJlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKGVudW1lcmF0ZUJVRykge1xuICAgICAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9oYXNPd24uY2FsbChvYmosIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7fVxuICAgICAgICByZXR1cm4ga2V5ID09PSB1bmRlZmluZWQkMSB8fCBvaGFzT3duLmNhbGwob2JqLCBrZXkpO1xuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gaXNQbGFpbk9iamVjdE1vZGVybihvYmopIHtcbiAgICAgICAgLy8g566A5Y2V55qEIHR5cGVvZiBvYmogPT09ICdvYmplY3Qn5qOA5rWL77yM5Lya6Ie05L2/55SoaXNQbGFpbk9iamVjdCh3aW5kb3cp5Zyob3BlcmHkuIvpgJrkuI3ov4dcbiAgICAgICAgcmV0dXJuIGluc3BlY3QuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJyAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uaXNQbGFpbk9iamVjdCA9IC9cXFtuYXRpdmUgY29kZVxcXS8udGVzdChPYmplY3QuZ2V0UHJvdG90eXBlT2YpID8gaXNQbGFpbk9iamVjdE1vZGVybiA6IGlzUGxhaW5PYmplY3RDb21wYWN0O1xuXG4gICAgdmFyIHJjYW5NaXggPSAvb2JqZWN0fGZ1bmN0aW9uLztcblxuICAgIC8v5LiOalF1ZXJ5LmV4dGVuZOaWueazle+8jOWPr+eUqOS6jua1heaLt+i0ne+8jOa3seaLt+i0nVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXZhbG9uLm1peCA9IGF2YWxvbi5mbi5taXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgIGlzRGVlcCA9IGZhbHNlLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBhcnJheSA9IFtdO1xuICAgICAgICBpZiAoYXJndW1lbnRzWzBdID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpc0RlZXAgPSB0cnVlO1xuICAgICAgICAgICAgaSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgLy/lsIbmiYDmnInpnZ7nqbrlr7nosaHlj5jmiJDnqbrlr7nosaFcbiAgICAgICAgZm9yICg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbCA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGVsID0gZWwgJiYgcmNhbk1peC50ZXN0KHR5cGVvZiBlbCkgPyBlbCA6IHt9O1xuICAgICAgICAgICAgYXJyYXkucHVzaChlbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgYXJyYXkudW5zaGlmdCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5uZXJFeHRlbmQoaXNEZWVwLCBhcnJheSk7XG4gICAgfTtcbiAgICB2YXIgdW5kZWZpbmVkJDE7XG5cbiAgICBmdW5jdGlvbiBpbm5lckV4dGVuZChpc0RlZXAsIGFycmF5KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBhcnJheVswXSxcbiAgICAgICAgICAgIGNvcHlJc0FycmF5LFxuICAgICAgICAgICAgY2xvbmUsXG4gICAgICAgICAgICBuYW1lO1xuICAgICAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8v5Y+q5aSE55CG6Z2e56m65Y+C5pWwXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IGFycmF5W2ldO1xuICAgICAgICAgICAgdmFyIG5vQ2xvbmVBcnJheU1ldGhvZCA9IEFycmF5LmlzQXJyYXkob3B0aW9ucyk7XG4gICAgICAgICAgICBmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChub0Nsb25lQXJyYXlNZXRob2QgJiYgIW9wdGlvbnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzcmMgPSB0YXJnZXRbbmFtZV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3B5ID0gb3B0aW9uc1tuYW1lXTsgLy/lvZNvcHRpb25z5Li6VkJT5a+56LGh5pe25oql6ZSZXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDpmLLmraLnjq/lvJXnlKhcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBjb3B5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNEZWVwICYmIGNvcHkgJiYgKGF2YWxvbi5pc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IEFycmF5LmlzQXJyYXkoY29weSkpKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3B5SXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weUlzQXJyYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lID0gc3JjICYmIEFycmF5LmlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUgPSBzcmMgJiYgYXZhbG9uLmlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gaW5uZXJFeHRlbmQoaXNEZWVwLCBbY2xvbmUsIGNvcHldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvcHkgIT09IHVuZGVmaW5lZCQxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSA9IGNvcHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgdmFyIHJhcnJheWxpa2UgPSAvKEFycmF5fExpc3R8Q29sbGVjdGlvbnxNYXB8QXJndW1lbnRzKVxcXSQvO1xuICAgIC8q5Yik5a6a5piv5ZCm57G75pWw57uE77yM5aaC6IqC54K56ZuG5ZCI77yM57qv5pWw57uE77yMYXJndW1lbnRz5LiO5oul5pyJ6Z2e6LSf5pW05pWw55qEbGVuZ3Ro5bGe5oCn55qE57qvSlPlr7nosaEqL1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gaXNBcnJheUxpa2Uob2JqKSB7XG4gICAgICAgIGlmICghb2JqKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBuID0gb2JqLmxlbmd0aDtcbiAgICAgICAgaWYgKG4gPT09IG4gPj4+IDApIHtcbiAgICAgICAgICAgIC8v5qOA5rWLbGVuZ3Ro5bGe5oCn5piv5ZCm5Li66Z2e6LSf5pW05pWwXG4gICAgICAgICAgICB2YXIgdHlwZSA9IGluc3BlY3QuY2FsbChvYmopO1xuICAgICAgICAgICAgaWYgKHJhcnJheWxpa2UudGVzdCh0eXBlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqLCAnbGVuZ3RoJykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5piv5Y6f55Sf5a+56LGhXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZnVuY3Rpb24udGVzdChvYmouaXRlbSB8fCBvYmouY2FsbGVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy9JReeahE5vZGVMaXN055u05o6l5oqb6ZSZXG4gICAgICAgICAgICAgICAgcmV0dXJuICFvYmoud2luZG93OyAvL0lFNi04IHdpbmRvd1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhdmFsb24uZWFjaCA9IGZ1bmN0aW9uIChvYmosIGZuKSB7XG4gICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICAgIC8v5o6S6ZmkbnVsbCwgdW5kZWZpbmVkXG4gICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG4gPSBvYmoubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmbihpLCBvYmpbaV0pID09PSBmYWxzZSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkgJiYgZm4oaSwgb2JqW2ldKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgd2VsY29tZUludHJvID0gW1wiJWNhdmFsb24uanMgJWNcIiArIGF2YWxvbi52ZXJzaW9uICsgXCIgJWNpbiBkZWJ1ZyBtb2RlLCAlY21vcmUuLi5cIiwgXCJjb2xvcjogcmdiKDExNCwgMTU3LCA1Mik7IGZvbnQtd2VpZ2h0OiBub3JtYWw7XCIsIFwiY29sb3I6IHJnYig4NSwgODUsIDg1KTsgZm9udC13ZWlnaHQ6IG5vcm1hbDtcIiwgXCJjb2xvcjogcmdiKDg1LCA4NSwgODUpOyBmb250LXdlaWdodDogbm9ybWFsO1wiLCBcImNvbG9yOiByZ2IoODIsIDE0MCwgMjI0KTsgZm9udC13ZWlnaHQ6IG5vcm1hbDsgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XCJdO1xuICAgICAgICB2YXIgd2VsY29tZU1lc3NhZ2UgPSBcIllvdSdyZSBydW5uaW5nIGF2YWxvbiBpbiBkZWJ1ZyBtb2RlIC0gbWVzc2FnZXMgd2lsbCBiZSBwcmludGVkIHRvIHRoZSBjb25zb2xlIHRvIGhlbHAgeW91IGZpeCBwcm9ibGVtcyBhbmQgb3B0aW1pc2UgeW91ciBhcHBsaWNhdGlvbi5cXG5cXG5cIiArICdUbyBkaXNhYmxlIGRlYnVnIG1vZGUsIGFkZCB0aGlzIGxpbmUgYXQgdGhlIHN0YXJ0IG9mIHlvdXIgYXBwOlxcblxcbiAgYXZhbG9uLmNvbmZpZyh7ZGVidWc6IGZhbHNlfSk7XFxuXFxuJyArICdEZWJ1ZyBtb2RlIGFsc28gYXV0b21hdGljYWxseSBzaHV0IGRvd24gYW1pY2FibHkgd2hlbiB5b3VyIGFwcCBpcyBtaW5pZmllZC5cXG5cXG4nICsgXCJHZXQgaGVscCBhbmQgc3VwcG9ydDpcXG4gIGh0dHBzOi8vc2VnbWVudGZhdWx0LmNvbS90L2F2YWxvblxcbiAgaHR0cDovL2F2YWxvbmpzLmNvZGluZy5tZS9cXG4gIGh0dHA6Ly93d3cuYmFpZHUteC5jb20vP3E9YXZhbG9uanNcXG4gIGh0dHA6Ly93d3cuYXZhbG9uLm9yZy5jbi9cXG5cXG5Gb3VuZCBhIGJ1Zz8gUmFpc2UgYW4gaXNzdWU6XFxuICBodHRwczovL2dpdGh1Yi5jb20vUnVieUxvdXZyZS9hdmFsb24vaXNzdWVzXFxuXFxuXCI7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHZhciBjb24gPSBjb25zb2xlO1xuICAgICAgICAgICAgdmFyIG1ldGhvZCA9IGNvbi5ncm91cENvbGxhcHNlZCB8fCBjb24ubG9nO1xuICAgICAgICAgICAgRnVuY3Rpb24uYXBwbHkuY2FsbChtZXRob2QsIGNvbiwgd2VsY29tZUludHJvKTtcbiAgICAgICAgICAgIGNvbi5sb2cod2VsY29tZU1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZCAhPT0gY29uc29sZS5sb2cpIHtcbiAgICAgICAgICAgICAgICBjb24uZ3JvdXBFbmQod2VsY29tZUludHJvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBmdW5jdGlvbiB0b0ZpeGVkRml4KG4sIHByZWMpIHtcbiAgICAgICAgdmFyIGsgPSBNYXRoLnBvdygxMCwgcHJlYyk7XG4gICAgICAgIHJldHVybiAnJyArIChNYXRoLnJvdW5kKG4gKiBrKSAvIGspLnRvRml4ZWQocHJlYyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG51bWJlckZpbHRlcihudW1iZXIsIGRlY2ltYWxzLCBwb2ludCwgdGhvdXNhbmRzKSB7XG4gICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL3R4Z3J1cHBpL251bWJlcl9mb3JtYXRcbiAgICAgICAgLy9mb3JtIGh0dHA6Ly9waHBqcy5vcmcvZnVuY3Rpb25zL251bWJlcl9mb3JtYXQvXG4gICAgICAgIC8vbnVtYmVyIOW/hemcgO+8jOimgeagvOW8j+WMlueahOaVsOWtl1xuICAgICAgICAvL2RlY2ltYWxzIOWPr+mAie+8jOinhOWumuWkmuWwkeS4quWwj+aVsOS9jeOAglxuICAgICAgICAvL3BvaW50IOWPr+mAie+8jOinhOWumueUqOS9nOWwj+aVsOeCueeahOWtl+espuS4su+8iOm7mOiupOS4uiAuIO+8ieOAglxuICAgICAgICAvL3Rob3VzYW5kcyDlj6/pgInvvIzop4TlrprnlKjkvZzljYPkvY3liIbpmpTnrKbnmoTlrZfnrKbkuLLvvIjpu5jorqTkuLogLCDvvInvvIzlpoLmnpzorr7nva7kuobor6Xlj4LmlbDvvIzpgqPkuYjmiYDmnInlhbbku5blj4LmlbDpg73mmK/lv4XpnIDnmoTjgIJcbiAgICAgICAgbnVtYmVyID0gKG51bWJlciArICcnKS5yZXBsYWNlKC9bXjAtOStcXC1FZS5dL2csICcnKTtcbiAgICAgICAgdmFyIG4gPSAhaXNGaW5pdGUoK251bWJlcikgPyAwIDogK251bWJlcixcbiAgICAgICAgICAgIHByZWMgPSAhaXNGaW5pdGUoK2RlY2ltYWxzKSA/IDMgOiBNYXRoLmFicyhkZWNpbWFscyksXG4gICAgICAgICAgICBzZXAgPSB0eXBlb2YgdGhvdXNhbmRzID09PSAnc3RyaW5nJyA/IHRob3VzYW5kcyA6IFwiLFwiLFxuICAgICAgICAgICAgZGVjID0gcG9pbnQgfHwgXCIuXCIsXG4gICAgICAgICAgICBzID0gJyc7XG5cbiAgICAgICAgLy8gRml4IGZvciBJRSBwYXJzZUZsb2F0KDAuNTUpLnRvRml4ZWQoMCkgPSAwO1xuICAgICAgICBzID0gKHByZWMgPyB0b0ZpeGVkRml4KG4sIHByZWMpIDogJycgKyBNYXRoLnJvdW5kKG4pKS5zcGxpdCgnLicpO1xuICAgICAgICBpZiAoc1swXS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICBzWzBdID0gc1swXS5yZXBsYWNlKC9cXEIoPz0oPzpcXGR7M30pKyg/IVxcZCkpL2csIHNlcCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqIC8v5aW95YOP5rKh5pyJ55SoXG4gICAgICAgICB2YXIgczEgPSBzWzFdIHx8ICcnXG4gICAgICAgIFxuICAgICAgICAgIGlmIChzMS5sZW5ndGggPCBwcmVjKSB7XG4gICAgICAgICAgICAgICAgICBzMSArPSBuZXcgQXJyYXkocHJlYyAtIHNbMV0ubGVuZ3RoICsgMSkuam9pbignMCcpXG4gICAgICAgICAgICAgICAgICBzWzFdID0gczFcbiAgICAgICAgICB9XG4gICAgICAgICAgKiovXG4gICAgICAgIHJldHVybiBzLmpvaW4oZGVjKTtcbiAgICB9XG5cbiAgICB2YXIgcnNjcmlwdHMgPSAvPHNjcmlwdFtePl0qPihbXFxTXFxzXSo/KTxcXC9zY3JpcHRcXHMqPi9naW07XG4gICAgdmFyIHJvbiA9IC9cXHMrKG9uW149XFxzXSspKD86PShcIlteXCJdKlwifCdbXiddKid8W15cXHM+XSspKT8vZztcbiAgICB2YXIgcm9wZW4gPSAvPFxcdytcXGIoPzooW1wiJ10pW15cIl0qPyhcXDEpfFtePl0pKj4vaWc7XG4gICAgdmFyIHJzYW5pdGl6ZSA9IHtcbiAgICAgICAgYTogL1xcYihocmVmKVxcPShcImphdmFzY3JpcHRbXlwiXSpcInwnamF2YXNjcmlwdFteJ10qJykvaWcsXG4gICAgICAgIGltZzogL1xcYihzcmMpXFw9KFwiamF2YXNjcmlwdFteXCJdKlwifCdqYXZhc2NyaXB0W14nXSonKS9pZyxcbiAgICAgICAgZm9ybTogL1xcYihhY3Rpb24pXFw9KFwiamF2YXNjcmlwdFteXCJdKlwifCdqYXZhc2NyaXB0W14nXSonKS9pZ1xuICAgIH07XG5cbiAgICAvL2h0dHBzOi8vd3d3Lm93YXNwLm9yZy9pbmRleC5waHAvWFNTX0ZpbHRlcl9FdmFzaW9uX0NoZWF0X1NoZWV0XG4gICAgLy8gICAgPGEgaHJlZj1cImphdmFzYyZOZXdMaW5lO3JpcHQmY29sb247YWxlcnQoJ1hTUycpXCI+Y2hyb21lPC9hPiBcbiAgICAvLyAgICA8YSBocmVmPVwiZGF0YTp0ZXh0L2h0bWw7YmFzZTY0LCBQR2x0WnlCemNtTTllQ0J2Ym1WeWNtOXlQV0ZzWlhKMEtERXBQZz09XCI+Y2hyb21lPC9hPlxuICAgIC8vICAgIDxhIGhyZWY9XCJqYXZcdGFzY3JpcHQ6YWxlcnQoJ1hTUycpO1wiPklFNjdjaHJvbWU8L2E+XG4gICAgLy8gICAgPGEgaHJlZj1cImphdiYjeDA5O2FzY3JpcHQ6YWxlcnQoJ1hTUycpO1wiPklFNjdjaHJvbWU8L2E+XG4gICAgLy8gICAgPGEgaHJlZj1cImphdiYjeDBBO2FzY3JpcHQ6YWxlcnQoJ1hTUycpO1wiPklFNjdjaHJvbWU8L2E+XG4gICAgZnVuY3Rpb24gc2FuaXRpemVGaWx0ZXIoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyc2NyaXB0cywgXCJcIikucmVwbGFjZShyb3BlbiwgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IGEudG9Mb3dlckNhc2UoKS5tYXRjaCgvPChcXHcrKVxccy8pO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgLy/lpITnkIZh5qCH562+55qEaHJlZuWxnuaAp++8jGltZ+agh+etvueahHNyY+WxnuaAp++8jGZvcm3moIfnrb7nmoRhY3Rpb27lsZ7mgKdcbiAgICAgICAgICAgICAgICB2YXIgcmVnID0gcnNhbml0aXplW21hdGNoWzFdXTtcbiAgICAgICAgICAgICAgICBpZiAocmVnKSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBhLnJlcGxhY2UocmVnLCBmdW5jdGlvbiAocywgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBxdW90ZSA9IHZhbHVlLmNoYXJBdCgwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuYW1lICsgXCI9XCIgKyBxdW90ZSArIFwiamF2YXNjcmlwdDp2b2lkKDApXCIgKyBxdW90ZTsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhLnJlcGxhY2Uocm9uLCBcIiBcIikucmVwbGFjZSgvXFxzKy9nLCBcIiBcIik7IC8v56e76Zmkb25YWFjkuovku7ZcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgJ3l5eXknOiA0IGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHllYXIgKGUuZy4gQUQgMSA9PiAwMDAxLCBBRCAyMDEwID0+IDIwMTApXG4gICAgICd5eSc6IDIgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgeWVhciwgcGFkZGVkICgwMC05OSkuIChlLmcuIEFEIDIwMDEgPT4gMDEsIEFEIDIwMTAgPT4gMTApXG4gICAgICd5JzogMSBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB5ZWFyLCBlLmcuIChBRCAxID0+IDEsIEFEIDE5OSA9PiAxOTkpXG4gICAgICdNTU1NJzogTW9udGggaW4geWVhciAoSmFudWFyeS1EZWNlbWJlcilcbiAgICAgJ01NTSc6IE1vbnRoIGluIHllYXIgKEphbi1EZWMpXG4gICAgICdNTSc6IE1vbnRoIGluIHllYXIsIHBhZGRlZCAoMDEtMTIpXG4gICAgICdNJzogTW9udGggaW4geWVhciAoMS0xMilcbiAgICAgJ2RkJzogRGF5IGluIG1vbnRoLCBwYWRkZWQgKDAxLTMxKVxuICAgICAnZCc6IERheSBpbiBtb250aCAoMS0zMSlcbiAgICAgJ0VFRUUnOiBEYXkgaW4gV2VlaywoU3VuZGF5LVNhdHVyZGF5KVxuICAgICAnRUVFJzogRGF5IGluIFdlZWssIChTdW4tU2F0KVxuICAgICAnSEgnOiBIb3VyIGluIGRheSwgcGFkZGVkICgwMC0yMylcbiAgICAgJ0gnOiBIb3VyIGluIGRheSAoMC0yMylcbiAgICAgJ2hoJzogSG91ciBpbiBhbS9wbSwgcGFkZGVkICgwMS0xMilcbiAgICAgJ2gnOiBIb3VyIGluIGFtL3BtLCAoMS0xMilcbiAgICAgJ21tJzogTWludXRlIGluIGhvdXIsIHBhZGRlZCAoMDAtNTkpXG4gICAgICdtJzogTWludXRlIGluIGhvdXIgKDAtNTkpXG4gICAgICdzcyc6IFNlY29uZCBpbiBtaW51dGUsIHBhZGRlZCAoMDAtNTkpXG4gICAgICdzJzogU2Vjb25kIGluIG1pbnV0ZSAoMC01OSlcbiAgICAgJ2EnOiBhbS9wbSBtYXJrZXJcbiAgICAgJ1onOiA0IGRpZ2l0ICgrc2lnbikgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRpbWV6b25lIG9mZnNldCAoLTEyMDAtKzEyMDApXG4gICAgIGZvcm1hdCBzdHJpbmcgY2FuIGFsc28gYmUgb25lIG9mIHRoZSBmb2xsb3dpbmcgcHJlZGVmaW5lZCBsb2NhbGl6YWJsZSBmb3JtYXRzOlxuICAgICBcbiAgICAgJ21lZGl1bSc6IGVxdWl2YWxlbnQgdG8gJ01NTSBkLCB5IGg6bW06c3MgYScgZm9yIGVuX1VTIGxvY2FsZSAoZS5nLiBTZXAgMywgMjAxMCAxMjowNTowOCBwbSlcbiAgICAgJ3Nob3J0JzogZXF1aXZhbGVudCB0byAnTS9kL3l5IGg6bW0gYScgZm9yIGVuX1VTIGxvY2FsZSAoZS5nLiA5LzMvMTAgMTI6MDUgcG0pXG4gICAgICdmdWxsRGF0ZSc6IGVxdWl2YWxlbnQgdG8gJ0VFRUUsIE1NTU0gZCx5JyBmb3IgZW5fVVMgbG9jYWxlIChlLmcuIEZyaWRheSwgU2VwdGVtYmVyIDMsIDIwMTApXG4gICAgICdsb25nRGF0ZSc6IGVxdWl2YWxlbnQgdG8gJ01NTU0gZCwgeScgZm9yIGVuX1VTIGxvY2FsZSAoZS5nLiBTZXB0ZW1iZXIgMywgMjAxMFxuICAgICAnbWVkaXVtRGF0ZSc6IGVxdWl2YWxlbnQgdG8gJ01NTSBkLCB5JyBmb3IgZW5fVVMgbG9jYWxlIChlLmcuIFNlcCAzLCAyMDEwKVxuICAgICAnc2hvcnREYXRlJzogZXF1aXZhbGVudCB0byAnTS9kL3l5JyBmb3IgZW5fVVMgbG9jYWxlIChlLmcuIDkvMy8xMClcbiAgICAgJ21lZGl1bVRpbWUnOiBlcXVpdmFsZW50IHRvICdoOm1tOnNzIGEnIGZvciBlbl9VUyBsb2NhbGUgKGUuZy4gMTI6MDU6MDggcG0pXG4gICAgICdzaG9ydFRpbWUnOiBlcXVpdmFsZW50IHRvICdoOm1tIGEnIGZvciBlbl9VUyBsb2NhbGUgKGUuZy4gMTI6MDUgcG0pXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiB0b0ludChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0ciwgMTApIHx8IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFkTnVtYmVyKG51bSwgZGlnaXRzLCB0cmltKSB7XG4gICAgICAgIHZhciBuZWcgPSAnJztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICAgICAgaWYgKG51bSA8IDApIHtcbiAgICAgICAgICAgIG5lZyA9ICctJztcbiAgICAgICAgICAgIG51bSA9IC1udW07XG4gICAgICAgIH1cbiAgICAgICAgbnVtID0gJycgKyBudW07XG4gICAgICAgIHdoaWxlIChudW0ubGVuZ3RoIDwgZGlnaXRzKSB7XG4gICAgICAgICAgICBudW0gPSAnMCcgKyBudW07XG4gICAgICAgIH1pZiAodHJpbSkgbnVtID0gbnVtLnN1YnN0cihudW0ubGVuZ3RoIC0gZGlnaXRzKTtcbiAgICAgICAgcmV0dXJuIG5lZyArIG51bTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXRlR2V0dGVyKG5hbWUsIHNpemUsIG9mZnNldCwgdHJpbSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGVbXCJnZXRcIiArIG5hbWVdKCk7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ID4gMCB8fCB2YWx1ZSA+IC1vZmZzZXQpIHZhbHVlICs9IG9mZnNldDtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMCAmJiBvZmZzZXQgPT09IC0xMikge1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDEyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBhZE51bWJlcih2YWx1ZSwgc2l6ZSwgdHJpbSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGF0ZVN0ckdldHRlcihuYW1lLCBzaG9ydEZvcm0pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlLCBmb3JtYXRzKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBkYXRlW1wiZ2V0XCIgKyBuYW1lXSgpO1xuICAgICAgICAgICAgdmFyIGdldCA9IChzaG9ydEZvcm0gPyBcIlNIT1JUXCIgKyBuYW1lIDogbmFtZSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRzW2dldF1bdmFsdWVdO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRpbWVab25lR2V0dGVyKGRhdGUpIHtcbiAgICAgICAgdmFyIHpvbmUgPSAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgICAgdmFyIHBhZGRlZFpvbmUgPSB6b25lID49IDAgPyBcIitcIiA6IFwiXCI7XG4gICAgICAgIHBhZGRlZFpvbmUgKz0gcGFkTnVtYmVyKE1hdGhbem9uZSA+IDAgPyBcImZsb29yXCIgOiBcImNlaWxcIl0oem9uZSAvIDYwKSwgMikgKyBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMik7XG4gICAgICAgIHJldHVybiBwYWRkZWRab25lO1xuICAgIH1cbiAgICAvL+WPluW+l+S4iuWNiOS4i+WNiFxuICAgIGZ1bmN0aW9uIGFtcG1HZXR0ZXIoZGF0ZSwgZm9ybWF0cykge1xuICAgICAgICByZXR1cm4gZGF0ZS5nZXRIb3VycygpIDwgMTIgPyBmb3JtYXRzLkFNUE1TWzBdIDogZm9ybWF0cy5BTVBNU1sxXTtcbiAgICB9XG4gICAgdmFyIERBVEVfRk9STUFUUyA9IHtcbiAgICAgICAgeXl5eTogZGF0ZUdldHRlcihcIkZ1bGxZZWFyXCIsIDQpLFxuICAgICAgICB5eTogZGF0ZUdldHRlcihcIkZ1bGxZZWFyXCIsIDIsIDAsIHRydWUpLFxuICAgICAgICB5OiBkYXRlR2V0dGVyKFwiRnVsbFllYXJcIiwgMSksXG4gICAgICAgIE1NTU06IGRhdGVTdHJHZXR0ZXIoXCJNb250aFwiKSxcbiAgICAgICAgTU1NOiBkYXRlU3RyR2V0dGVyKFwiTW9udGhcIiwgdHJ1ZSksXG4gICAgICAgIE1NOiBkYXRlR2V0dGVyKFwiTW9udGhcIiwgMiwgMSksXG4gICAgICAgIE06IGRhdGVHZXR0ZXIoXCJNb250aFwiLCAxLCAxKSxcbiAgICAgICAgZGQ6IGRhdGVHZXR0ZXIoXCJEYXRlXCIsIDIpLFxuICAgICAgICBkOiBkYXRlR2V0dGVyKFwiRGF0ZVwiLCAxKSxcbiAgICAgICAgSEg6IGRhdGVHZXR0ZXIoXCJIb3Vyc1wiLCAyKSxcbiAgICAgICAgSDogZGF0ZUdldHRlcihcIkhvdXJzXCIsIDEpLFxuICAgICAgICBoaDogZGF0ZUdldHRlcihcIkhvdXJzXCIsIDIsIC0xMiksXG4gICAgICAgIGg6IGRhdGVHZXR0ZXIoXCJIb3Vyc1wiLCAxLCAtMTIpLFxuICAgICAgICBtbTogZGF0ZUdldHRlcihcIk1pbnV0ZXNcIiwgMiksXG4gICAgICAgIG06IGRhdGVHZXR0ZXIoXCJNaW51dGVzXCIsIDEpLFxuICAgICAgICBzczogZGF0ZUdldHRlcihcIlNlY29uZHNcIiwgMiksXG4gICAgICAgIHM6IGRhdGVHZXR0ZXIoXCJTZWNvbmRzXCIsIDEpLFxuICAgICAgICBzc3M6IGRhdGVHZXR0ZXIoXCJNaWxsaXNlY29uZHNcIiwgMyksXG4gICAgICAgIEVFRUU6IGRhdGVTdHJHZXR0ZXIoXCJEYXlcIiksXG4gICAgICAgIEVFRTogZGF0ZVN0ckdldHRlcihcIkRheVwiLCB0cnVlKSxcbiAgICAgICAgYTogYW1wbUdldHRlcixcbiAgICAgICAgWjogdGltZVpvbmVHZXR0ZXJcbiAgICB9O1xuICAgIHZhciByZGF0ZUZvcm1hdCA9IC8oKD86W155TWRIaG1zYVpFJ10rKXwoPzonKD86W14nXXwnJykqJyl8KD86RSt8eSt8TSt8ZCt8SCt8aCt8bSt8cyt8YXxaKSkoLiopLztcbiAgICB2YXIgcmFzcG5ldGpzb24gPSAvXlxcL0RhdGVcXCgoXFxkKylcXClcXC8kLztcbiAgICBmdW5jdGlvbiBkYXRlRmlsdGVyKGRhdGUsIGZvcm1hdCkge1xuICAgICAgICB2YXIgbG9jYXRlID0gZGF0ZUZpbHRlci5sb2NhdGUsXG4gICAgICAgICAgICB0ZXh0ID0gXCJcIixcbiAgICAgICAgICAgIHBhcnRzID0gW10sXG4gICAgICAgICAgICBmbixcbiAgICAgICAgICAgIG1hdGNoO1xuICAgICAgICBmb3JtYXQgPSBmb3JtYXQgfHwgXCJtZWRpdW1EYXRlXCI7XG4gICAgICAgIGZvcm1hdCA9IGxvY2F0ZVtmb3JtYXRdIHx8IGZvcm1hdDtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAoL15cXGQrJC8udGVzdChkYXRlKSkge1xuICAgICAgICAgICAgICAgIGRhdGUgPSB0b0ludChkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmFzcG5ldGpzb24udGVzdChkYXRlKSkge1xuICAgICAgICAgICAgICAgIGRhdGUgPSArUmVnRXhwLiQxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJpbURhdGUgPSBkYXRlLnRyaW0oKTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZUFycmF5ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDBdO1xuICAgICAgICAgICAgICAgIHZhciBvRGF0ZSA9IG5ldyBEYXRlKDApO1xuICAgICAgICAgICAgICAgIC8v5Y+W5b6X5bm05pyI5pelXG4gICAgICAgICAgICAgICAgdHJpbURhdGUgPSB0cmltRGF0ZS5yZXBsYWNlKC9eKFxcZCspXFxEKFxcZCspXFxEKFxcZCspLywgZnVuY3Rpb24gKF8sIGEsIGIsIGMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gYy5sZW5ndGggPT09IDQgPyBbYywgYSwgYl0gOiBbYSwgYiwgY107XG4gICAgICAgICAgICAgICAgICAgIGRhdGVBcnJheVswXSA9IHRvSW50KGFycmF5WzBdKTsgLy/lubRcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFycmF5WzFdID0gdG9JbnQoYXJyYXlbMV0pIC0gMTsgLy/mnIhcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFycmF5WzJdID0gdG9JbnQoYXJyYXlbMl0pOyAvL+aXpVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZVNldHRlciA9IG9EYXRlLnNldEZ1bGxZZWFyO1xuICAgICAgICAgICAgICAgIHZhciB0aW1lU2V0dGVyID0gb0RhdGUuc2V0SG91cnM7XG4gICAgICAgICAgICAgICAgdHJpbURhdGUgPSB0cmltRGF0ZS5yZXBsYWNlKC9bVFxcc10oXFxkKyk6KFxcZCspOj8oXFxkKyk/XFwuPyhcXGQpPy8sIGZ1bmN0aW9uIChfLCBhLCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVBcnJheVszXSA9IHRvSW50KGEpOyAvL+Wwj+aXtlxuICAgICAgICAgICAgICAgICAgICBkYXRlQXJyYXlbNF0gPSB0b0ludChiKTsgLy/liIbpkp9cbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFycmF5WzVdID0gdG9JbnQoYyk7IC8v56eSXG4gICAgICAgICAgICAgICAgICAgIGlmIChkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL+avq+enklxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUFycmF5WzZdID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KFwiMC5cIiArIGQpICogMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIHR6SG91ciA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHR6TWluID0gMDtcbiAgICAgICAgICAgICAgICB0cmltRGF0ZSA9IHRyaW1EYXRlLnJlcGxhY2UoL1p8KFsrLV0pKFxcZFxcZCk6PyhcXGRcXGQpLywgZnVuY3Rpb24gKHosIHN5bWJvbCwgYywgZCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRlU2V0dGVyID0gb0RhdGUuc2V0VVRDRnVsbFllYXI7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVTZXR0ZXIgPSBvRGF0ZS5zZXRVVENIb3VycztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN5bWJvbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHpIb3VyID0gdG9JbnQoc3ltYm9sICsgYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ek1pbiA9IHRvSW50KHN5bWJvbCArIGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGRhdGVBcnJheVszXSAtPSB0ekhvdXI7XG4gICAgICAgICAgICAgICAgZGF0ZUFycmF5WzRdIC09IHR6TWluO1xuICAgICAgICAgICAgICAgIGRhdGVTZXR0ZXIuYXBwbHkob0RhdGUsIGRhdGVBcnJheS5zbGljZSgwLCAzKSk7XG4gICAgICAgICAgICAgICAgdGltZVNldHRlci5hcHBseShvRGF0ZSwgZGF0ZUFycmF5LnNsaWNlKDMpKTtcbiAgICAgICAgICAgICAgICBkYXRlID0gb0RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGZvcm1hdCkge1xuICAgICAgICAgICAgbWF0Y2ggPSByZGF0ZUZvcm1hdC5leGVjKGZvcm1hdCk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgcGFydHMgPSBwYXJ0cy5jb25jYXQobWF0Y2guc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgIGZvcm1hdCA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJ0cy5wdXNoKGZvcm1hdCk7XG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgZm4gPSBEQVRFX0ZPUk1BVFNbdmFsdWVdO1xuICAgICAgICAgICAgdGV4dCArPSBmbiA/IGZuKGRhdGUsIGxvY2F0ZSkgOiB2YWx1ZS5yZXBsYWNlKC8oXid8JyQpL2csIFwiXCIpLnJlcGxhY2UoLycnL2csIFwiJ1wiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIHZhciBsb2NhdGUgPSB7XG4gICAgICAgIEFNUE1TOiB7XG4gICAgICAgICAgICAwOiAn5LiK5Y2IJyxcbiAgICAgICAgICAgIDE6ICfkuIvljYgnXG4gICAgICAgIH0sXG4gICAgICAgIERBWToge1xuICAgICAgICAgICAgMDogJ+aYn+acn+aXpScsXG4gICAgICAgICAgICAxOiAn5pif5pyf5LiAJyxcbiAgICAgICAgICAgIDI6ICfmmJ/mnJ/kuownLFxuICAgICAgICAgICAgMzogJ+aYn+acn+S4iScsXG4gICAgICAgICAgICA0OiAn5pif5pyf5ZubJyxcbiAgICAgICAgICAgIDU6ICfmmJ/mnJ/kupQnLFxuICAgICAgICAgICAgNjogJ+aYn+acn+WFrSdcbiAgICAgICAgfSxcbiAgICAgICAgTU9OVEg6IHtcbiAgICAgICAgICAgIDA6ICcx5pyIJyxcbiAgICAgICAgICAgIDE6ICcy5pyIJyxcbiAgICAgICAgICAgIDI6ICcz5pyIJyxcbiAgICAgICAgICAgIDM6ICc05pyIJyxcbiAgICAgICAgICAgIDQ6ICc15pyIJyxcbiAgICAgICAgICAgIDU6ICc25pyIJyxcbiAgICAgICAgICAgIDY6ICc35pyIJyxcbiAgICAgICAgICAgIDc6ICc45pyIJyxcbiAgICAgICAgICAgIDg6ICc55pyIJyxcbiAgICAgICAgICAgIDk6ICcxMOaciCcsXG4gICAgICAgICAgICAxMDogJzEx5pyIJyxcbiAgICAgICAgICAgIDExOiAnMTLmnIgnXG4gICAgICAgIH0sXG4gICAgICAgIFNIT1JUREFZOiB7XG4gICAgICAgICAgICAnMCc6ICflkajml6UnLFxuICAgICAgICAgICAgJzEnOiAn5ZGo5LiAJyxcbiAgICAgICAgICAgICcyJzogJ+WRqOS6jCcsXG4gICAgICAgICAgICAnMyc6ICflkajkuIknLFxuICAgICAgICAgICAgJzQnOiAn5ZGo5ZubJyxcbiAgICAgICAgICAgICc1JzogJ+WRqOS6lCcsXG4gICAgICAgICAgICAnNic6ICflkajlha0nXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bGxEYXRlOiAneeW5tE3mnIhk5pelRUVFRScsXG4gICAgICAgIGxvbmdEYXRlOiAneeW5tE3mnIhk5pelJyxcbiAgICAgICAgbWVkaXVtOiAneXl5eS1NLWQgSDptbTpzcycsXG4gICAgICAgIG1lZGl1bURhdGU6ICd5eXl5LU0tZCcsXG4gICAgICAgIG1lZGl1bVRpbWU6ICdIOm1tOnNzJyxcbiAgICAgICAgJ3Nob3J0JzogJ3l5LU0tZCBhaDptbScsXG4gICAgICAgIHNob3J0RGF0ZTogJ3l5LU0tZCcsXG4gICAgICAgIHNob3J0VGltZTogJ2FoOm1tJ1xuICAgIH07XG4gICAgbG9jYXRlLlNIT1JUTU9OVEggPSBsb2NhdGUuTU9OVEg7XG4gICAgZGF0ZUZpbHRlci5sb2NhdGUgPSBsb2NhdGU7XG5cbiAgICAvKipcbiAgICAkJHNraXBBcnJheTrmmK/ns7vnu5/nuqfpgJrnlKjnmoTkuI3lj6/nm5HlkKzlsZ7mgKdcbiAgICAkc2tpcEFycmF5OiDmmK/lvZPliY3lr7nosaHnibnmnInnmoTkuI3lj6/nm5HlkKzlsZ7mgKdcbiAgICBcbiAgICAg5LiN5ZCM54K55pivXG4gICAgICQkc2tpcEFycmF56KKraGFzT3duUHJvcGVydHnlkI7ov5Tlm55mYWxzZVxuICAgICAkc2tpcEFycmF56KKraGFzT3duUHJvcGVydHnlkI7ov5Tlm550cnVlXG4gICAgICovXG4gICAgdmFyIGZhbHN5O1xuICAgIHZhciAkJHNraXBBcnJheSA9IHtcbiAgICAgICAgJGlkOiBmYWxzeSxcbiAgICAgICAgJHJlbmRlcjogZmFsc3ksXG4gICAgICAgICR0cmFjazogZmFsc3ksXG4gICAgICAgICRlbGVtZW50OiBmYWxzeSxcbiAgICAgICAgJGNvbXB1dGVkOiBmYWxzeSxcbiAgICAgICAgJHdhdGNoOiBmYWxzeSxcbiAgICAgICAgJGZpcmU6IGZhbHN5LFxuICAgICAgICAkZXZlbnRzOiBmYWxzeSxcbiAgICAgICAgJGFjY2Vzc29yczogZmFsc3ksXG4gICAgICAgICRoYXNoY29kZTogZmFsc3ksXG4gICAgICAgICRtdXRhdGlvbnM6IGZhbHN5LFxuICAgICAgICAkdmJ0aGlzOiBmYWxzeSxcbiAgICAgICAgJHZic2V0dGVyOiBmYWxzeVxuICAgIH07XG5cbiAgICAvKlxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9odWZ5aGFuZy9vcmRlckJ5L2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4gICAgKi9cblxuICAgIGZ1bmN0aW9uIG9yZGVyQnkoYXJyYXksIGJ5LCBkZWNlbmQpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBhdmFsb24udHlwZShhcnJheSk7XG4gICAgICAgIGlmICh0eXBlICE9PSAnYXJyYXknICYmIHR5cGUgIT09ICdvYmplY3QnKSB0aHJvdyAnb3JkZXJCeeWPquiDveWkhOeQhuWvueixoeaIluaVsOe7hCc7XG4gICAgICAgIHZhciBjcml0ZXJpYSA9IHR5cGVvZiBieSA9PSAnc3RyaW5nJyA/IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsICYmIGVsW2J5XTtcbiAgICAgICAgfSA6IHR5cGVvZiBieSA9PT0gJ2Z1bmN0aW9uJyA/IGJ5IDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBtYXBwaW5nID0ge307XG4gICAgICAgIHZhciB0ZW1wID0gW107XG4gICAgICAgIF9fcmVwZWF0KGFycmF5LCBBcnJheS5pc0FycmF5KGFycmF5KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IGFycmF5W2tleV07XG4gICAgICAgICAgICB2YXIgayA9IGNyaXRlcmlhKHZhbCwga2V5KTtcbiAgICAgICAgICAgIGlmIChrIGluIG1hcHBpbmcpIHtcbiAgICAgICAgICAgICAgICBtYXBwaW5nW2tdLnB1c2goa2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwcGluZ1trXSA9IFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVtcC5wdXNoKGspO1xuICAgICAgICB9KTtcblxuICAgICAgICB0ZW1wLnNvcnQoKTtcbiAgICAgICAgaWYgKGRlY2VuZCA8IDApIHtcbiAgICAgICAgICAgIHRlbXAucmV2ZXJzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfYXJyYXkgPSB0eXBlID09PSAnYXJyYXknO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gX2FycmF5ID8gW10gOiB7fTtcbiAgICAgICAgcmV0dXJuIHJlY292ZXJ5KHRhcmdldCwgdGVtcCwgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBtYXBwaW5nW2tdLnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAoX2FycmF5KSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnB1c2goYXJyYXlba2V5XSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gYXJyYXlba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX19yZXBlYXQoYXJyYXksIGlzQXJyYXkkJDEsIGNiKSB7XG4gICAgICAgIGlmIChpc0FycmF5JCQxKSB7XG4gICAgICAgICAgICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uICh2YWwsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2IoaW5kZXgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFycmF5LiR0cmFjayA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGFycmF5LiR0cmFjay5yZXBsYWNlKC9bXuKYpV0rL2csIGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgY2Ioayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJyYXkuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZpbHRlckJ5KGFycmF5LCBzZWFyY2gpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBhdmFsb24udHlwZShhcnJheSk7XG4gICAgICAgIGlmICh0eXBlICE9PSAnYXJyYXknICYmIHR5cGUgIT09ICdvYmplY3QnKSB0aHJvdyAnZmlsdGVyQnnlj6rog73lpITnkIblr7nosaHmiJbmlbDnu4QnO1xuICAgICAgICB2YXIgYXJncyA9IGF2YWxvbi5zbGljZShhcmd1bWVudHMsIDIpO1xuICAgICAgICB2YXIgc3R5cGUgPSBhdmFsb24udHlwZShzZWFyY2gpO1xuICAgICAgICBpZiAoc3R5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhciBjcml0ZXJpYSA9IHNlYXJjaDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHlwZSA9PT0gJ3N0cmluZycgfHwgc3R5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoYXZhbG9uLmVzY2FwZVJlZ0V4cChzZWFyY2gpLCAnaScpO1xuICAgICAgICAgICAgICAgIGNyaXRlcmlhID0gZnVuY3Rpb24gY3JpdGVyaWEoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZy50ZXN0KGVsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBpc0FycmF5JCQxID0gdHlwZSA9PT0gJ2FycmF5JztcbiAgICAgICAgdmFyIHRhcmdldCA9IGlzQXJyYXkkJDEgPyBbXSA6IHt9O1xuICAgICAgICBfX3JlcGVhdChhcnJheSwgaXNBcnJheSQkMSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IGFycmF5W2tleV07XG4gICAgICAgICAgICBpZiAoY3JpdGVyaWEuYXBwbHkodmFsLCBbdmFsLCBpbmRleF0uY29uY2F0KGFyZ3MpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5JCQxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5wdXNoKHZhbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VsZWN0QnkoZGF0YSwgYXJyYXksIGRlZmF1bHRzKSB7XG4gICAgICAgIGlmIChhdmFsb24uaXNPYmplY3QoZGF0YSkgJiYgIUFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBbXTtcbiAgICAgICAgICAgIHJldHVybiByZWNvdmVyeSh0YXJnZXQsIGFycmF5LCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5wdXNoKGRhdGEuaGFzT3duUHJvcGVydHkobmFtZSkgPyBkYXRhW25hbWVdIDogZGVmYXVsdHMgPyBkZWZhdWx0c1tuYW1lXSA6ICcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW1pdEJ5KGlucHV0LCBsaW1pdCwgYmVnaW4pIHtcbiAgICAgICAgdmFyIHR5cGUgPSBhdmFsb24udHlwZShpbnB1dCk7XG4gICAgICAgIGlmICh0eXBlICE9PSAnYXJyYXknICYmIHR5cGUgIT09ICdvYmplY3QnKSB0aHJvdyAnbGltaXRCeeWPquiDveWkhOeQhuWvueixoeaIluaVsOe7hCc7XG4gICAgICAgIC8v5b+F6aG75piv5pWw5YC8XG4gICAgICAgIGlmICh0eXBlb2YgbGltaXQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgICAgLy/kuI3og73kuLpOYU5cbiAgICAgICAgaWYgKGxpbWl0ICE9PSBsaW1pdCkge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgICAgICB9XG4gICAgICAgIC8v5bCG55uu5qCH6L2s5o2i5Li65pWw57uEXG4gICAgICAgIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaW5wdXQgPSBjb252ZXJ0QXJyYXkoaW5wdXQsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbiA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgbGltaXQgPSBNYXRoLmZsb29yKE1hdGgubWluKG4sIGxpbWl0KSk7XG4gICAgICAgIGJlZ2luID0gdHlwZW9mIGJlZ2luID09PSAnbnVtYmVyJyA/IGJlZ2luIDogMDtcbiAgICAgICAgaWYgKGJlZ2luIDwgMCkge1xuICAgICAgICAgICAgYmVnaW4gPSBNYXRoLm1heCgwLCBuICsgYmVnaW4pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSBiZWdpbjsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSBsaW1pdCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YS5wdXNoKGlucHV0W2ldKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaXNBcnJheSQkMSA9IHR5cGUgPT09ICdhcnJheSc7XG4gICAgICAgIGlmIChpc0FycmF5JCQxKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGFyZ2V0ID0ge307XG4gICAgICAgIHJldHVybiByZWNvdmVyeSh0YXJnZXQsIGRhdGEsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgdGFyZ2V0W2VsLmtleV0gPSBlbC52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVjb3ZlcnkocmV0LCBhcnJheSwgY2FsbGJhY2spIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcnJheS5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGFycmF5W2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIC8vQ2hyb21l6LC35q2M5rWP6KeI5Zmo5LitanPku6PnoIFBcnJheS5zb3J05o6S5bqP55qEYnVn5Lmx5bqP6Kej5Yaz5Yqe5rOVXG4gICAgLy9odHRwOi8vd3d3LmNuYmxvZ3MuY29tL3l6ZW5nL3AvMzk0OTE4Mi5odG1sXG4gICAgZnVuY3Rpb24gY29udmVydEFycmF5KGFycmF5LCBpc0FycmF5JCQxKSB7XG4gICAgICAgIHZhciByZXQgPSBbXSxcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICBfX3JlcGVhdChhcnJheSwgaXNBcnJheSQkMSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0W2ldID0ge1xuICAgICAgICAgICAgICAgIG9sZEluZGV4OiBpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBhcnJheVtrZXldLFxuICAgICAgICAgICAgICAgIGtleToga2V5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRGaWx0ZXJzID0ge1xuICAgICAgICBzdG9wOiBmdW5jdGlvbiBzdG9wKGUpIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmVudDogZnVuY3Rpb24gcHJldmVudChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIGtleXMgPSB7XG4gICAgICAgIGVzYzogMjcsXG4gICAgICAgIHRhYjogOSxcbiAgICAgICAgZW50ZXI6IDEzLFxuICAgICAgICBzcGFjZTogMzIsXG4gICAgICAgIGRlbDogNDYsXG4gICAgICAgIHVwOiAzOCxcbiAgICAgICAgbGVmdDogMzcsXG4gICAgICAgIHJpZ2h0OiAzOSxcbiAgICAgICAgZG93bjogNDBcbiAgICB9O1xuICAgIGZvciAodmFyIG5hbWUkMSBpbiBrZXlzKSB7XG4gICAgICAgIChmdW5jdGlvbiAoZmlsdGVyLCBrZXkpIHtcbiAgICAgICAgICAgIGV2ZW50RmlsdGVyc1tmaWx0ZXJdID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCAhPT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGUuJHJldHVybiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkobmFtZSQxLCBrZXlzW25hbWUkMV0pO1xuICAgIH1cblxuICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL3RlcHBlaXMvaHRtbHNwZWNpYWxjaGFyc1xuICAgIGZ1bmN0aW9uIGVzY2FwZUZpbHRlcihzdHIpIHtcbiAgICAgICAgaWYgKHN0ciA9PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgICAgICAgcmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbiAgICB9XG5cbiAgICB2YXIgZmlsdGVycyA9IGF2YWxvbi5maWx0ZXJzID0ge307XG5cbiAgICBhdmFsb24uY29tcG9zZUZpbHRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYXJyOyBhcnIgPSBhcmdzW2krK107KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBhcnJbMF07XG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlciA9IGF2YWxvbi5maWx0ZXJzW25hbWVdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyclswXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBmaWx0ZXIuYXBwbHkoMCwgYXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGF2YWxvbi5lc2NhcGVIdG1sID0gZXNjYXBlRmlsdGVyO1xuXG4gICAgYXZhbG9uLm1peChmaWx0ZXJzLCB7XG4gICAgICAgIHVwcGVyY2FzZTogZnVuY3Rpb24gdXBwZXJjYXNlKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhzdHIpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGxvd2VyY2FzZTogZnVuY3Rpb24gbG93ZXJjYXNlKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhzdHIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHRydW5jYXRlOiBmdW5jdGlvbiB0cnVuY2F0ZShzdHIsIGxlbmd0aCwgZW5kKSB7XG4gICAgICAgICAgICAvL2xlbmd0aO+8jOaWsOWtl+espuS4sumVv+W6pu+8jHRydW5jYXRpb27vvIzmlrDlrZfnrKbkuLLnmoTnu5PlsL7nmoTlrZfmrrUs6L+U5Zue5paw5a2X56ym5LiyXG4gICAgICAgICAgICBpZiAoIXN0cikge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgICAgICAgICAgaWYgKGlzTmFOKGxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICBsZW5ndGggPSAzMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09IFwic3RyaW5nXCIgPyBlbmQgOiBcIi4uLlwiO1xuICAgICAgICAgICAgcmV0dXJuIHN0ci5sZW5ndGggPiBsZW5ndGggPyBzdHIuc2xpY2UoMCwgbGVuZ3RoIC0gZW5kLmxlbmd0aCkgKyBlbmQgOiAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSovXG4gICAgICAgICAgICBzdHI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FtZWxpemU6IGF2YWxvbi5jYW1lbGl6ZSxcbiAgICAgICAgZGF0ZTogZGF0ZUZpbHRlcixcbiAgICAgICAgZXNjYXBlOiBlc2NhcGVGaWx0ZXIsXG4gICAgICAgIHNhbml0aXplOiBzYW5pdGl6ZUZpbHRlcixcbiAgICAgICAgbnVtYmVyOiBudW1iZXJGaWx0ZXIsXG4gICAgICAgIGN1cnJlbmN5OiBmdW5jdGlvbiBjdXJyZW5jeShhbW91bnQsIHN5bWJvbCwgZnJhY3Rpb25TaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gKHN5bWJvbCB8fCAnXFx4QTUnKSArIG51bWJlckZpbHRlcihhbW91bnQsIGlzRmluaXRlKGZyYWN0aW9uU2l6ZSkgPyAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSovZnJhY3Rpb25TaXplIDogMik7XG4gICAgICAgIH1cbiAgICB9LCB7IGZpbHRlckJ5OiBmaWx0ZXJCeSwgb3JkZXJCeTogb3JkZXJCeSwgc2VsZWN0Qnk6IHNlbGVjdEJ5LCBsaW1pdEJ5OiBsaW1pdEJ5IH0sIGV2ZW50RmlsdGVycyk7XG5cbiAgICB2YXIgcmNoZWNrZWRUeXBlID0gL14oPzpjaGVja2JveHxyYWRpbykkLztcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gZml4RWxlbWVudChkZXN0LCBzcmMpIHtcbiAgICAgICAgaWYgKGRlc3Qubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9kZU5hbWUgPSBkZXN0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKG5vZGVOYW1lID09PSBcInNjcmlwdFwiKSB7XG4gICAgICAgICAgICBpZiAoZGVzdC50ZXh0ICE9PSBzcmMudGV4dCkge1xuICAgICAgICAgICAgICAgIGRlc3QudHlwZSA9IFwibm9leGVjXCI7XG4gICAgICAgICAgICAgICAgZGVzdC50ZXh0ID0gc3JjLnRleHQ7XG4gICAgICAgICAgICAgICAgZGVzdC50eXBlID0gc3JjLnR5cGUgfHwgXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChub2RlTmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBzcmMuY2hpbGROb2RlcztcbiAgICAgICAgICAgIGlmIChkZXN0LmNoaWxkTm9kZXMubGVuZ3RoICE9PSBwYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmNsZWFySFRNTChkZXN0KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gcGFyYW1zW2krK107KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc3QuYXBwZW5kQ2hpbGQoZWwuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZU5hbWUgPT09ICdpbnB1dCcgJiYgcmNoZWNrZWRUeXBlLnRlc3Qoc3JjLm5vZGVOYW1lKSkge1xuXG4gICAgICAgICAgICBkZXN0LmRlZmF1bHRDaGVja2VkID0gZGVzdC5jaGVja2VkID0gc3JjLmNoZWNrZWQ7XG4gICAgICAgICAgICBpZiAoZGVzdC52YWx1ZSAhPT0gc3JjLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZGVzdC52YWx1ZSA9IHNyYy52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChub2RlTmFtZSA9PT0gJ29wdGlvbicpIHtcbiAgICAgICAgICAgIGRlc3QuZGVmYXVsdFNlbGVjdGVkID0gZGVzdC5zZWxlY3RlZCA9IHNyYy5kZWZhdWx0U2VsZWN0ZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZU5hbWUgPT09ICdpbnB1dCcgfHwgbm9kZU5hbWUgPT09ICd0ZXh0YXJlYScpIHtcbiAgICAgICAgICAgIGRlc3QuZGVmYXVsdFZhbHVlID0gc3JjLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gZ2V0QWxsKGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lICE9PSAndW5kZWZpbmVkJyA/IGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKSA6IHR5cGVvZiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwgIT09ICd1bmRlZmluZWQnID8gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKCcqJykgOiBbXTtcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGZpeENsb25lKHNyYykge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gc3JjLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgLy9odHRwOi8vd3d3Lm15ZXhjZXB0aW9uLmNuL3dlYi82NjU2MTMuaHRtbFxuICAgICAgICAvLyB0YXJnZXQuZXhwYW5kbyA9IG51bGxcbiAgICAgICAgdmFyIHQgPSBnZXRBbGwodGFyZ2V0KTtcbiAgICAgICAgdmFyIHMgPSBnZXRBbGwoc3JjKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmaXhFbGVtZW50KHRbaV0sIHNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBmaXhDb250YWlucyhyb290LCBlbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9JRTYtOCzmuLjnprvkuo5ET03moJHlpJbnmoTmlofmnKzoioLngrnvvIzorr/pl65wYXJlbnROb2Rl5pyJ5pe25Lya5oqb6ZSZXG4gICAgICAgICAgICB3aGlsZSAoZWwgPSBlbC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsID09PSByb290KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGF2YWxvbi5jb250YWlucyA9IGZpeENvbnRhaW5zO1xuXG4gICAgYXZhbG9uLmNsb25lTm9kZSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIHJldHVybiBhLmNsb25lTm9kZSh0cnVlKTtcbiAgICB9O1xuXG4gICAgLy9JRTYtMTHnmoTmlofmoaPlr7nosaHmsqHmnIljb250YWluc1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gc2hpbUhhY2soKSB7XG4gICAgICAgIGlmIChtc2llIDwgMTApIHtcbiAgICAgICAgICAgIGF2YWxvbi5jbG9uZU5vZGUgPSBmaXhDbG9uZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRvY3VtZW50JDEuY29udGFpbnMpIHtcbiAgICAgICAgICAgIGRvY3VtZW50JDEuY29udGFpbnMgPSBmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaXhDb250YWlucyhkb2N1bWVudCQxLCBiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF2YWxvbi5tb2Rlcm4pIHtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQkMS5jcmVhdGVUZXh0Tm9kZSgneCcpLmNvbnRhaW5zKSB7XG4gICAgICAgICAgICAgICAgTm9kZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9JRTYtOOayoeaciU5vZGXlr7nosaFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpeENvbnRhaW5zKHRoaXMsIGNoaWxkKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vZmlyZWZveCDliLAxMeaXtuaJjeaciW91dGVySFRNTFxuICAgICAgICBmdW5jdGlvbiBmaXhGRihwcm9wLCBjYikge1xuICAgICAgICAgICAgaWYgKCEocHJvcCBpbiByb290KSAmJiBIVE1MRWxlbWVudC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXykge1xuICAgICAgICAgICAgICAgIEhUTUxFbGVtZW50LnByb3RvdHlwZS5fX2RlZmluZUdldHRlcl9fKHByb3AsIGNiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaXhGRignb3V0ZXJIVE1MJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50JDEuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpeEZGKCdjaGlsZHJlbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IHRoaXMuY2hpbGROb2Rlc1tpKytdOykge1xuICAgICAgICAgICAgICAgIGlmIChlbC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgICAgIH0pO1xuICAgICAgICBmaXhGRignaW5uZXJUZXh0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy9maXJlZm94NDUrLCBjaHJvbWU0KyBodHRwOi8vY2FuaXVzZS5jb20vI2ZlYXQ9aW5uZXJ0ZXh0XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZXh0Q29udGVudDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgICBzaGltSGFjaygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIENsYXNzTGlzdChub2RlKSB7XG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgfVxuXG4gICAgQ2xhc3NMaXN0LnByb3RvdHlwZSA9IHtcbiAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICB2YXIgY2xzID0gbm9kZS5jbGFzc05hbWU7XG4gICAgICAgICAgICB2YXIgc3RyID0gdHlwZW9mIGNscyA9PT0gJ3N0cmluZycgPyBjbHMgOiBjbHMuYmFzZVZhbDtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IHN0ci5tYXRjaChybm93aGl0ZSk7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaC5qb2luKCcgJykgOiAnJztcbiAgICAgICAgfSxcbiAgICAgICAgY29udGFpbnM6IGZ1bmN0aW9uIGNvbnRhaW5zKGNscykge1xuICAgICAgICAgICAgcmV0dXJuICgnICcgKyB0aGlzICsgJyAnKS5pbmRleE9mKCcgJyArIGNscyArICcgJykgPiAtMTtcbiAgICAgICAgfSxcbiAgICAgICAgYWRkOiBmdW5jdGlvbiBhZGQoY2xzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnMoY2xzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0KHRoaXMgKyAnICcgKyBjbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShjbHMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCgnICcgKyB0aGlzICsgJyAnKS5yZXBsYWNlKCcgJyArIGNscyArICcgJywgJyAnKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KGNscykge1xuICAgICAgICAgICAgY2xzID0gY2xzLnRyaW0oKTtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBub2RlLmNsYXNzTmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAvL1NWR+WFg+e0oOeahGNsYXNzTmFtZeaYr+S4gOS4quWvueixoSBTVkdBbmltYXRlZFN0cmluZyB7IGJhc2VWYWw9JycsIGFuaW1WYWw9Jyd977yM5Y+q6IO96YCa6L+Hc2V0L2dldEF0dHJpYnV0ZeaTjeS9nFxuICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNscyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGUuY2xhc3NOYW1lID0gY2xzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjbHMpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vdG9nZ2xl5a2Y5Zyo54mI5pys5beu5byC77yM5Zug5q2k5LiN5L2/55So5a6DXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY2xhc3NMaXN0RmFjdG9yeShub2RlKSB7XG4gICAgICAgIGlmICghKCdjbGFzc0xpc3QnIGluIG5vZGUpKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdCA9IG5ldyBDbGFzc0xpc3Qobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGUuY2xhc3NMaXN0O1xuICAgIH1cblxuICAgICdhZGQscmVtb3ZlJy5yZXBsYWNlKHJ3b3JkLCBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIGF2YWxvbi5mblttZXRob2QgKyAnQ2xhc3MnXSA9IGZ1bmN0aW9uIChjbHMpIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHRoaXNbMF0gfHwge307XG4gICAgICAgICAgICAvL2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL3poLUNOL2RvY3MvTW96aWxsYS9GaXJlZm94L1JlbGVhc2VzLzI2XG4gICAgICAgICAgICBpZiAoY2xzICYmIHR5cGVvZiBjbHMgPT09ICdzdHJpbmcnICYmIGVsLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgY2xzLnJlcGxhY2Uocm5vd2hpdGUsIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTGlzdEZhY3RvcnkoZWwpW21ldGhvZF0oYyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGF2YWxvbi5zaGFkb3dDb3B5KGF2YWxvbi5mbiwge1xuICAgICAgICBoYXNDbGFzczogZnVuY3Rpb24gaGFzQ2xhc3MoY2xzKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSB0aGlzWzBdIHx8IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGVsLm5vZGVUeXBlID09PSAxICYmIGNsYXNzTGlzdEZhY3RvcnkoZWwpLmNvbnRhaW5zKGNscyk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvZ2dsZUNsYXNzOiBmdW5jdGlvbiB0b2dnbGVDbGFzcyh2YWx1ZSwgc3RhdGVWYWwpIHtcbiAgICAgICAgICAgIHZhciBpc0Jvb2wgPSB0eXBlb2Ygc3RhdGVWYWwgPT09ICdib29sZWFuJztcbiAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICBTdHJpbmcodmFsdWUpLnJlcGxhY2Uocm5vd2hpdGUsIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gaXNCb29sID8gc3RhdGVWYWwgOiAhbWUuaGFzQ2xhc3MoYyk7XG4gICAgICAgICAgICAgICAgbWVbc3RhdGUgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgcHJvcE1hcCA9IHsgLy/kuI3op4TliJnnmoTlsZ7mgKflkI3mmKDlsIRcbiAgICAgICAgJ2FjY2VwdC1jaGFyc2V0JzogJ2FjY2VwdENoYXJzZXQnLFxuICAgICAgICAnY2hhcic6ICdjaCcsXG4gICAgICAgIGNoYXJvZmY6ICdjaE9mZicsXG4gICAgICAgICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAgICAgICAnZm9yJzogJ2h0bWxGb3InLFxuICAgICAgICAnaHR0cC1lcXVpdic6ICdodHRwRXF1aXYnXG4gICAgfTtcbiAgICAvKlxuICAgIGNvbnRlbnRlZGl0YWJsZeS4jeaYr+W4g+WwlOWxnuaAp1xuICAgIGh0dHA6Ly93d3cuemhhbmd4aW54dS5jb20vd29yZHByZXNzLzIwMTYvMDEvY29udGVudGVkaXRhYmxlLXBsYWludGV4dC1vbmx5L1xuICAgIGNvbnRlbnRlZGl0YWJsZT0nJ1xuICAgIGNvbnRlbnRlZGl0YWJsZT0nZXZlbnRzJ1xuICAgIGNvbnRlbnRlZGl0YWJsZT0nY2FyZXQnXG4gICAgY29udGVudGVkaXRhYmxlPSdwbGFpbnRleHQtb25seSdcbiAgICBjb250ZW50ZWRpdGFibGU9J3RydWUnXG4gICAgY29udGVudGVkaXRhYmxlPSdmYWxzZSdcbiAgICAgKi9cbiAgICB2YXIgYm9vbHMgPSBbJ2F1dG9mb2N1cyxhdXRvcGxheSxhc3luYyxhbGxvd1RyYW5zcGFyZW5jeSxjaGVja2VkLGNvbnRyb2xzJywgJ2RlY2xhcmUsZGlzYWJsZWQsZGVmZXIsZGVmYXVsdENoZWNrZWQsZGVmYXVsdFNlbGVjdGVkLCcsICdpc01hcCxsb29wLG11bHRpcGxlLG5vSHJlZixub1Jlc2l6ZSxub1NoYWRlJywgJ29wZW4scmVhZE9ubHksc2VsZWN0ZWQnXS5qb2luKCcsJyk7XG5cbiAgICBib29scy5yZXBsYWNlKC9cXHcrL2csIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHByb3BNYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IG5hbWU7XG4gICAgfSk7XG5cbiAgICB2YXIgYW5vbWFseSA9IFsnYWNjZXNzS2V5LGJnQ29sb3IsY2VsbFBhZGRpbmcsY2VsbFNwYWNpbmcsY29kZUJhc2UsY29kZVR5cGUsY29sU3BhbicsICdkYXRlVGltZSxkZWZhdWx0VmFsdWUsY29udGVudEVkaXRhYmxlLGZyYW1lQm9yZGVyLGxvbmdEZXNjLG1heExlbmd0aCwnICsgJ21hcmdpbldpZHRoLG1hcmdpbkhlaWdodCxyb3dTcGFuLHRhYkluZGV4LHVzZU1hcCx2U3BhY2UsdmFsdWVUeXBlLHZBbGlnbiddLmpvaW4oJywnKTtcblxuICAgIGFub21hbHkucmVwbGFjZSgvXFx3Ky9nLCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBwcm9wTWFwW25hbWUudG9Mb3dlckNhc2UoKV0gPSBuYW1lO1xuICAgIH0pO1xuXG4gICAgLy9tb2R1bGUuZXhwb3J0cyA9IHByb3BNYXBcblxuICAgIGZ1bmN0aW9uIGlzVk1MKHNyYykge1xuICAgICAgICB2YXIgbm9kZU5hbWUgPSBzcmMubm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZSAmJiAhIXNyYy5zY29wZU5hbWUgJiYgc3JjLm91dGVyVGV4dCA9PT0gJyc7XG4gICAgfVxuXG4gICAgdmFyIHJ2YWxpZGNoYXJzID0gL15bXFxdLDp7fVxcc10qJC87XG4gICAgdmFyIHJ2YWxpZGJyYWNlcyA9IC8oPzpefDp8LCkoPzpcXHMqXFxbKSsvZztcbiAgICB2YXIgcnZhbGlkZXNjYXBlID0gL1xcXFwoPzpbXCJcXFxcXFwvYmZucnRdfHVbXFxkYS1mQS1GXXs0fSkvZztcbiAgICB2YXIgcnZhbGlkdG9rZW5zID0gL1wiW15cIlxcXFxcXHJcXG5dKlwifHRydWV8ZmFsc2V8bnVsbHwtPyg/OlxcZCtcXC58KVxcZCsoPzpbZUVdWystXT9cXGQrfCkvZztcblxuICAgIGZ1bmN0aW9uIGNvbXBhY3RQYXJzZUpTT04oZGF0YSkge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBkYXRhID0gZGF0YS50cmltKCk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChydmFsaWRjaGFycy50ZXN0KGRhdGEucmVwbGFjZShydmFsaWRlc2NhcGUsICdAJykucmVwbGFjZShydmFsaWR0b2tlbnMsICddJykucmVwbGFjZShydmFsaWRicmFjZXMsICcnKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbigncmV0dXJuICcgKyBkYXRhKSgpOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ0ludmFsaWQgSlNPTjogWycgKyBkYXRhICsgJ10nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICB2YXIgcnN2ZyA9IC9eXFxbb2JqZWN0IFNWR1xcdypFbGVtZW50XFxdJC87XG4gICAgdmFyIHJhbXAgPSAvJmFtcDsvZztcbiAgICBmdW5jdGlvbiB1cGRhdGVBdHRycyhub2RlLCBhdHRycykge1xuICAgICAgICBmb3IgKHZhciBhdHRyTmFtZSBpbiBhdHRycykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gYXR0cnNbYXR0ck5hbWVdO1xuICAgICAgICAgICAgICAgIC8vIOWkhOeQhui3r+W+hOWxnuaAp1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG5cbiAgICAgICAgICAgICAgICAvL+WkhOeQhkhUTUw1IGRhdGEtKuWxnuaApyBTVkdcbiAgICAgICAgICAgICAgICBpZiAoYXR0ck5hbWUuaW5kZXhPZignZGF0YS0nKSA9PT0gMCB8fCByc3ZnLnRlc3Qobm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIHZhbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3BOYW1lID0gcHJvcE1hcFthdHRyTmFtZV0gfHwgYXR0ck5hbWU7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG5vZGVbcHJvcE5hbWVdID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wTmFtZSA9PT0gJ2NoZWNrZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kZWZhdWx0Q2hlY2tlZCA9ICEhdmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSAhIXZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5biD5bCU5bGe5oCn5b+F6aG75L2/55SoZWwueHh4ID0gdHJ1ZXxmYWxzZeaWueW8j+iuvuWAvFxuICAgICAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzkuLpmYWxzZSwgSUXlhajns7vliJfkuIvnm7jlvZPkuo5zZXRBdHRyaWJ1dGUoeHh4LCcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5Lya5b2x5ZON5Yiw5qC35byPLOmcgOimgei/m+S4gOatpeWkhOeQhlxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v56e76Zmk5bGe5oCnXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShwcm9wTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL0lFNuS4rWNsYXNzTmFtbWUsIGh0bWxGb3LnrYnml6Dms5Xmo4DmtYvlroPku6zkuLrlhoXlu7rlsZ7mgKfjgIBcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWxvbi5tc2llIDwgOCAmJiAvW0EtWl0vLnRlc3QocHJvcE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9IHZhbCArICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9TVkflj6rog73kvb/nlKhzZXRBdHRyaWJ1dGUoeHh4LCB5eXkpLCBWTUzlj6rog73kvb/nlKhub2RlLnh4eCA9IHl5eSAsXG4gICAgICAgICAgICAgICAgICAgIC8vSFRNTOeahOWbuuacieWxnuaAp+W/hemhu25vZGUueHh4ID0geXl5XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHZhciBpc0lubmF0ZSA9ICFhdmFsb24ubW9kZXJuICYmIGlzVk1MKG5vZGUpID8gdHJ1ZSA6IGlzSW5uYXRlUHJvcHMobm9kZS5ub2RlTmFtZSwgYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJbm5hdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyTmFtZSA9PT0gJ2hyZWYnIHx8IGF0dHJOYW1lID09PSAnc3JjJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdmFsb24ubXNpZSA8IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gU3RyaW5nKHZhbCkucmVwbGFjZShyYW1wLCAnJicpOyAvL+WkhOeQhklFNjfoh6rliqjovazkuYnnmoTpl67pophcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9IHZhbCArICcnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8g5a+56LGh5LiN5pSv5oyB5q2k5bGe5oCn5oiW5pa55rOVIHNyYyBodHRwczovL2dpdGh1Yi5jb20vZWNvbWZlL3pyZW5kZXIgXG4gICAgICAgICAgICAgICAgLy8g5pyq55+l5ZCN56ew44CCXFwvblxuICAgICAgICAgICAgICAgIC8vIGUubWVzc2FnZeWkp+amgui/meagtyzpnIDopoF0cmltXG4gICAgICAgICAgICAgICAgLy9JRTYtOCzlhYPntKDoioLngrnkuI3mlK/mjIHlhbbku5blhYPntKDoioLngrnnmoTlhoXnva7lsZ7mgKcs5aaCc3JjLCBocmVmLCBmb3JcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGF2YWxvbi5sb2coU3RyaW5nKGUubWVzc2FnZSkudHJpbSgpLCBhdHRyTmFtZSwgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaW5uYXRlTWFwID0ge307XG5cbiAgICBmdW5jdGlvbiBpc0lubmF0ZVByb3BzKG5vZGVOYW1lLCBhdHRyTmFtZSkge1xuICAgICAgICB2YXIga2V5ID0gbm9kZU5hbWUgKyBcIjpcIiArIGF0dHJOYW1lO1xuICAgICAgICBpZiAoa2V5IGluIGlubmF0ZU1hcCkge1xuICAgICAgICAgICAgcmV0dXJuIGlubmF0ZU1hcFtrZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbm5hdGVNYXBba2V5XSA9IGF0dHJOYW1lIGluIGRvY3VtZW50JDEuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGF2YWxvbi5wYXJzZUpTT04gPSBKU09OLnBhcnNlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgYXZhbG9uLnBhcnNlSlNPTiA9IGNvbXBhY3RQYXJzZUpTT047XG4gICAgfVxuXG4gICAgYXZhbG9uLmZuLmF0dHIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXNbMF0uc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0uZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjc3NNYXAgPSB7XG4gICAgICAgICdmbG9hdCc6ICdjc3NGbG9hdCdcbiAgICB9O1xuICAgIGF2YWxvbi5jc3NOdW1iZXIgPSBvbmVPYmplY3QoJ2FuaW1hdGlvbkl0ZXJhdGlvbkNvdW50LGNvbHVtbkNvdW50LG9yZGVyLGZsZXgsZmxleEdyb3csZmxleFNocmluayxmaWxsT3BhY2l0eSxmb250V2VpZ2h0LGxpbmVIZWlnaHQsb3BhY2l0eSxvcnBoYW5zLHdpZG93cyx6SW5kZXgsem9vbScpO1xuICAgIHZhciBwcmVmaXhlcyA9IFsnJywgJy13ZWJraXQtJywgJy1vLScsICctbW96LScsICctbXMtJ107XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uY3NzTmFtZSA9IGZ1bmN0aW9uIChuYW1lLCBob3N0LCBjYW1lbENhc2UpIHtcbiAgICAgICAgaWYgKGNzc01hcFtuYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIGNzc01hcFtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBob3N0ID0gaG9zdCB8fCBhdmFsb24ucm9vdC5zdHlsZSB8fCB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwcmVmaXhlcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIGNhbWVsQ2FzZSA9IGF2YWxvbi5jYW1lbGl6ZShwcmVmaXhlc1tpXSArIG5hbWUpO1xuICAgICAgICAgICAgaWYgKGNhbWVsQ2FzZSBpbiBob3N0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNzc01hcFtuYW1lXSA9IGNhbWVsQ2FzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXZhbG9uLmNzcyA9IGZ1bmN0aW9uIChub2RlLCBuYW1lLCB2YWx1ZSwgZm4pIHtcbiAgICAgICAgLy/or7vlhpnliKDpmaTlhYPntKDoioLngrnnmoTmoLflvI9cbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBhdmFsb24pIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3AgPSBhdmFsb24uY2FtZWxpemUobmFtZSk7XG4gICAgICAgIG5hbWUgPSBhdmFsb24uY3NzTmFtZShwcm9wKSB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovcHJvcDtcbiAgICAgICAgaWYgKHZhbHVlID09PSB2b2lkIDAgfHwgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIC8v6I635Y+W5qC35byPXG4gICAgICAgICAgICBmbiA9IGNzc0hvb2tzW3Byb3AgKyAnOmdldCddIHx8IGNzc0hvb2tzWydAOmdldCddO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdiYWNrZ3JvdW5kJykge1xuICAgICAgICAgICAgICAgIG5hbWUgPSAnYmFja2dyb3VuZENvbG9yJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2YWwgPSBmbihub2RlLCBuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSA/IHBhcnNlRmxvYXQodmFsKSB8fCAwIDogdmFsO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgLy/or7fpmaTmoLflvI9cbiAgICAgICAgICAgIG5vZGUuc3R5bGVbbmFtZV0gPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v6K6+572u5qC35byPXG4gICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNGaW5pdGUodmFsdWUpICYmICFhdmFsb24uY3NzTnVtYmVyW3Byb3BdKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ3B4JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuID0gY3NzSG9va3NbcHJvcCArICc6c2V0J10gfHwgY3NzSG9va3NbJ0A6c2V0J107XG4gICAgICAgICAgICBmbihub2RlLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXZhbG9uLmZuLmNzcyA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAoYXZhbG9uLmlzUGxhaW5PYmplY3QobmFtZSkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gbmFtZSkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5jc3ModGhpcywgaSwgbmFtZVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcmV0ID0gYXZhbG9uLmNzcyh0aGlzLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldCAhPT0gdm9pZCAwID8gcmV0IDogdGhpcztcbiAgICB9O1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXZhbG9uLmZuLnBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb2Zmc2V0UGFyZW50LFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgZWxlbSA9IHRoaXNbMF0sXG4gICAgICAgICAgICBwYXJlbnRPZmZzZXQgPSB7XG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICghZWxlbSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudE9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvZmZzZXRQYXJlbnQgPSB0aGlzLm9mZnNldFBhcmVudCgpOyAvL+W+l+WIsOecn+ato+eahG9mZnNldFBhcmVudFxuICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5vZmZzZXQoKTsgLy8g5b6X5Yiw5q2j56Gu55qEb2Zmc2V0UGFyZW50XG4gICAgICAgICAgICBpZiAob2Zmc2V0UGFyZW50WzBdLnRhZ05hbWUgIT09ICdIVE1MJykge1xuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldCA9IG9mZnNldFBhcmVudC5vZmZzZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmVudE9mZnNldC50b3AgKz0gYXZhbG9uLmNzcyhvZmZzZXRQYXJlbnRbMF0sICdib3JkZXJUb3BXaWR0aCcsIHRydWUpO1xuICAgICAgICAgICAgcGFyZW50T2Zmc2V0LmxlZnQgKz0gYXZhbG9uLmNzcyhvZmZzZXRQYXJlbnRbMF0sICdib3JkZXJMZWZ0V2lkdGgnLCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gU3VidHJhY3Qgb2Zmc2V0UGFyZW50IHNjcm9sbCBwb3NpdGlvbnNcbiAgICAgICAgICAgIHBhcmVudE9mZnNldC50b3AgLT0gb2Zmc2V0UGFyZW50LnNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgcGFyZW50T2Zmc2V0LmxlZnQgLT0gb2Zmc2V0UGFyZW50LnNjcm9sbExlZnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wIC0gcGFyZW50T2Zmc2V0LnRvcCAtIGF2YWxvbi5jc3MoZWxlbSwgJ21hcmdpblRvcCcsIHRydWUpLFxuICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgLSBwYXJlbnRPZmZzZXQubGVmdCAtIGF2YWxvbi5jc3MoZWxlbSwgJ21hcmdpbkxlZnQnLCB0cnVlKVxuICAgICAgICB9O1xuICAgIH07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uZm4ub2Zmc2V0UGFyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb2Zmc2V0UGFyZW50ID0gdGhpc1swXS5vZmZzZXRQYXJlbnQ7XG4gICAgICAgIHdoaWxlIChvZmZzZXRQYXJlbnQgJiYgYXZhbG9uLmNzcyhvZmZzZXRQYXJlbnQsICdwb3NpdGlvbicpID09PSAnc3RhdGljJykge1xuICAgICAgICAgICAgb2Zmc2V0UGFyZW50ID0gb2Zmc2V0UGFyZW50Lm9mZnNldFBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXZhbG9uKG9mZnNldFBhcmVudCB8fCBhdmFsb24ucm9vdCk7XG4gICAgfTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgY3NzSG9va3NbJ0A6c2V0J10gPSBmdW5jdGlvbiAobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vbm9kZS5zdHlsZS53aWR0aCA9IE5hTjtub2RlLnN0eWxlLndpZHRoID0gJ3h4eHh4eHgnO1xuICAgICAgICAgICAgLy9ub2RlLnN0eWxlLndpZHRoID0gdW5kZWZpbmUg5Zyo5pen5byPSUXkuIvkvJrmipvlvILluLhcbiAgICAgICAgICAgIG5vZGUuc3R5bGVbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9O1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgY3NzSG9va3NbJ0A6Z2V0J10gPSBmdW5jdGlvbiAobm9kZSwgbmFtZSkge1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUuc3R5bGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0Q29tcHV0ZWRTdHlsZeimgeaxguS8oOWFpeS4gOS4quiKgueCuSAnICsgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJldCxcbiAgICAgICAgICAgIHN0eWxlcyA9IHdpbmRvdyQxLmdldENvbXB1dGVkU3R5bGUobm9kZSwgbnVsbCk7XG4gICAgICAgIGlmIChzdHlsZXMpIHtcbiAgICAgICAgICAgIHJldCA9IG5hbWUgPT09ICdmaWx0ZXInID8gc3R5bGVzLmdldFByb3BlcnR5VmFsdWUobmFtZSkgOiBzdHlsZXNbbmFtZV07XG4gICAgICAgICAgICBpZiAocmV0ID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldCA9IG5vZGUuc3R5bGVbbmFtZV07IC8v5YW25LuW5rWP6KeI5Zmo6ZyA6KaB5oiR5Lus5omL5Yqo5Y+W5YaF6IGU5qC35byPXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuXG4gICAgY3NzSG9va3NbJ29wYWNpdHk6Z2V0J10gPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICB2YXIgcmV0ID0gY3NzSG9va3NbJ0A6Z2V0J10obm9kZSwgJ29wYWNpdHknKTtcbiAgICAgICAgcmV0dXJuIHJldCA9PT0gJycgPyAnMScgOiByZXQ7XG4gICAgfTtcblxuICAgICd0b3AsbGVmdCcucmVwbGFjZShhdmFsb24ucndvcmQsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGNzc0hvb2tzW25hbWUgKyAnOmdldCddID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBjb21wdXRlZCA9IGNzc0hvb2tzWydAOmdldCddKG5vZGUsIG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuICgvcHgkLy50ZXN0KGNvbXB1dGVkKSA/IGNvbXB1dGVkIDogYXZhbG9uKG5vZGUpLnBvc2l0aW9uKClbbmFtZV0gKyAncHgnXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgdmFyIGNzc1Nob3cgPSB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICB2aXNpYmlsaXR5OiAnaGlkZGVuJyxcbiAgICAgICAgZGlzcGxheTogJ2Jsb2NrJ1xuICAgIH07XG5cbiAgICB2YXIgcmRpc3BsYXlzd2FwID0gL14obm9uZXx0YWJsZSg/IS1jW2VhXSkuKykvO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gc2hvd0hpZGRlbihub2RlLCBhcnJheSkge1xuICAgICAgICAvL2h0dHA6Ly93d3cuY25ibG9ncy5jb20vcnVieWxvdXZyZS9hcmNoaXZlLzIwMTIvMTAvMjcvMjc0MjUyOS5odG1sXG4gICAgICAgIGlmIChub2RlLm9mZnNldFdpZHRoIDw9IDApIHtcbiAgICAgICAgICAgIC8vb3BlcmEub2Zmc2V0V2lkdGjlj6/og73lsI/kuo4wXG4gICAgICAgICAgICBpZiAocmRpc3BsYXlzd2FwLnRlc3QoY3NzSG9va3NbJ0A6Z2V0J10obm9kZSwgJ2Rpc3BsYXknKSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0ge1xuICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIGNzc1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW25hbWVdID0gbm9kZS5zdHlsZVtuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHlsZVtuYW1lXSA9IGNzc1Nob3dbbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFycmF5LnB1c2gob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICBpZiAocGFyZW50ICYmIHBhcmVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNob3dIaWRkZW4ocGFyZW50LCBhcnJheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgIGF2YWxvbi5lYWNoKHtcbiAgICAgICAgV2lkdGg6ICd3aWR0aCcsXG4gICAgICAgIEhlaWdodDogJ2hlaWdodCdcbiAgICB9LCBmdW5jdGlvbiAobmFtZSwgbWV0aG9kKSB7XG4gICAgICAgIHZhciBjbGllbnRQcm9wID0gJ2NsaWVudCcgKyBuYW1lLFxuICAgICAgICAgICAgc2Nyb2xsUHJvcCA9ICdzY3JvbGwnICsgbmFtZSxcbiAgICAgICAgICAgIG9mZnNldFByb3AgPSAnb2Zmc2V0JyArIG5hbWU7XG4gICAgICAgIGNzc0hvb2tzW21ldGhvZCArICc6Z2V0J10gPSBmdW5jdGlvbiAobm9kZSwgd2hpY2gsIG92ZXJyaWRlKSB7XG4gICAgICAgICAgICB2YXIgYm94U2l6aW5nID0gLTQ7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG92ZXJyaWRlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGJveFNpemluZyA9IG92ZXJyaWRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpY2ggPSBuYW1lID09PSAnV2lkdGgnID8gWydMZWZ0JywgJ1JpZ2h0J10gOiBbJ1RvcCcsICdCb3R0b20nXTtcbiAgICAgICAgICAgIHZhciByZXQgPSBub2RlW29mZnNldFByb3BdOyAvLyBib3JkZXItYm94IDBcbiAgICAgICAgICAgIGlmIChib3hTaXppbmcgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAvLyBtYXJnaW4tYm94IDJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0ICsgYXZhbG9uLmNzcyhub2RlLCAnbWFyZ2luJyArIHdoaWNoWzBdLCB0cnVlKSArIGF2YWxvbi5jc3Mobm9kZSwgJ21hcmdpbicgKyB3aGljaFsxXSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYm94U2l6aW5nIDwgMCkge1xuICAgICAgICAgICAgICAgIC8vIHBhZGRpbmctYm94ICAtMlxuICAgICAgICAgICAgICAgIHJldCA9IHJldCAtIGF2YWxvbi5jc3Mobm9kZSwgJ2JvcmRlcicgKyB3aGljaFswXSArICdXaWR0aCcsIHRydWUpIC0gYXZhbG9uLmNzcyhub2RlLCAnYm9yZGVyJyArIHdoaWNoWzFdICsgJ1dpZHRoJywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYm94U2l6aW5nID09PSAtNCkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnRlbnQtYm94IC00XG4gICAgICAgICAgICAgICAgcmV0ID0gcmV0IC0gYXZhbG9uLmNzcyhub2RlLCAncGFkZGluZycgKyB3aGljaFswXSwgdHJ1ZSkgLSBhdmFsb24uY3NzKG5vZGUsICdwYWRkaW5nJyArIHdoaWNoWzFdLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG4gICAgICAgIGNzc0hvb2tzW21ldGhvZCArICcmZ2V0J10gPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgdmFyIGhpZGRlbiA9IFtdO1xuICAgICAgICAgICAgc2hvd0hpZGRlbihub2RlLCBoaWRkZW4pO1xuICAgICAgICAgICAgdmFyIHZhbCA9IGNzc0hvb2tzW21ldGhvZCArICc6Z2V0J10obm9kZSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgb2JqOyBvYmogPSBoaWRkZW5baSsrXTspIHtcbiAgICAgICAgICAgICAgICBub2RlID0gb2JqLm5vZGU7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmpbbl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnN0eWxlW25dID0gb2JqW25dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfTtcbiAgICAgICAgYXZhbG9uLmZuW21ldGhvZF0gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIC8v5Lya5b+96KeG5YW2ZGlzcGxheVxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzWzBdO1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5zZXRUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5Y+W5b6X56qX5Y+j5bC65a+4XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlWydpbm5lcicgKyBuYW1lXSB8fCBub2RlLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudFtjbGllbnRQcm9wXSB8fCBub2RlLmRvY3VtZW50LmJvZHlbY2xpZW50UHJvcF07IC8vSUU25LiL5YmN5Lik5Liq5YiG5Yir5Li6dW5kZWZpbmVkLDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lj5blvpfpobXpnaLlsLrlr7hcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRvYyA9IG5vZGUuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAvL0ZGIGNocm9tZSAgICBodG1sLnNjcm9sbEhlaWdodDwgYm9keS5zY3JvbGxIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgLy9JRSDmoIflh4bmqKHlvI8gOiBodG1sLnNjcm9sbEhlaWdodD4gYm9keS5zY3JvbGxIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgLy9JRSDmgKrlvILmqKHlvI8gOiBodG1sLnNjcm9sbEhlaWdodCDmnIDlpKfnrYnkuo7lj6/op4bnqpflj6PlpJrkuIDngrnvvJ9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KG5vZGUuYm9keVtzY3JvbGxQcm9wXSwgZG9jW3Njcm9sbFByb3BdLCBub2RlLmJvZHlbb2Zmc2V0UHJvcF0sIGRvY1tvZmZzZXRQcm9wXSwgZG9jW2NsaWVudFByb3BdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNzc0hvb2tzW21ldGhvZCArICcmZ2V0J10obm9kZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyhtZXRob2QsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgYXZhbG9uLmZuWydpbm5lcicgKyBuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjc3NIb29rc1ttZXRob2QgKyAnOmdldCddKHRoaXNbMF0sIHZvaWQgMCwgLTIpO1xuICAgICAgICB9O1xuICAgICAgICBhdmFsb24uZm5bJ291dGVyJyArIG5hbWVdID0gZnVuY3Rpb24gKGluY2x1ZGVNYXJnaW4pIHtcbiAgICAgICAgICAgIHJldHVybiBjc3NIb29rc1ttZXRob2QgKyAnOmdldCddKHRoaXNbMF0sIHZvaWQgMCwgaW5jbHVkZU1hcmdpbiA9PT0gdHJ1ZSA/IDIgOiAwKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGdldFdpbmRvdyhub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlLndpbmRvdyB8fCBub2RlLmRlZmF1bHRWaWV3IHx8IG5vZGUucGFyZW50V2luZG93IHx8IGZhbHNlO1xuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChtc2llIDwgOSkge1xuICAgICAgICBjc3NNYXBbJ2Zsb2F0J10gPSAnc3R5bGVGbG9hdCc7XG4gICAgICAgIHZhciBybnVtbm9ucHggPSAvXi0/KD86XFxkKlxcLik/XFxkKyg/IXB4KVteXFxkXFxzXSskL2k7XG4gICAgICAgIHZhciBycG9zaXRpb24gPSAvXih0b3B8cmlnaHR8Ym90dG9tfGxlZnQpJC87XG4gICAgICAgIHZhciByYWxwaGEgPSAvYWxwaGFcXChbXildK1xcKS9pO1xuICAgICAgICB2YXIgcm9wYWN0aXkgPSAvKG9wYWNpdHl8XFxkKFxcZHxcXC4pKikvZztcbiAgICAgICAgdmFyIGllOCA9IG1zaWUgPT09IDg7XG4gICAgICAgIHZhciBzYWxwaGEgPSAnRFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQWxwaGEnO1xuICAgICAgICB2YXIgYm9yZGVyID0ge1xuICAgICAgICAgICAgdGhpbjogaWU4ID8gJzFweCcgOiAnMnB4JyxcbiAgICAgICAgICAgIG1lZGl1bTogaWU4ID8gJzNweCcgOiAnNHB4JyxcbiAgICAgICAgICAgIHRoaWNrOiBpZTggPyAnNXB4JyA6ICc2cHgnXG4gICAgICAgIH07XG4gICAgICAgIGNzc0hvb2tzWydAOmdldCddID0gZnVuY3Rpb24gKG5vZGUsIG5hbWUpIHtcbiAgICAgICAgICAgIC8v5Y+W5b6X57K+56Gu5YC877yM5LiN6L+H5a6D5pyJ5Y+v6IO95piv5bimZW0scGMsbW0scHQsJeetieWNleS9jVxuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHlsZSA9IG5vZGUuY3VycmVudFN0eWxlO1xuICAgICAgICAgICAgdmFyIHJldCA9IGN1cnJlbnRTdHlsZVtuYW1lXTtcbiAgICAgICAgICAgIGlmIChybnVtbm9ucHgudGVzdChyZXQpICYmICFycG9zaXRpb24udGVzdChyZXQpKSB7XG4gICAgICAgICAgICAgICAgLy/ikaDvvIzkv53lrZjljp/mnInnmoRzdHlsZS5sZWZ0LCBydW50aW1lU3R5bGUubGVmdCxcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBub2RlLnN0eWxlLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gc3R5bGUubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgcnNMZWZ0ID0gbm9kZS5ydW50aW1lU3R5bGUubGVmdDtcbiAgICAgICAgICAgICAgICAvL+KRoeeUseS6juKRouWkhOeahHN0eWxlLmxlZnQgPSB4eHjkvJrlvbHlk43liLBjdXJyZW50U3R5bGUubGVmdO+8jFxuICAgICAgICAgICAgICAgIC8v5Zug5q2k5oqK5a6DY3VycmVudFN0eWxlLmxlZnTmlL7liLBydW50aW1lU3R5bGUubGVmdO+8jFxuICAgICAgICAgICAgICAgIC8vcnVudGltZVN0eWxlLmxlZnTmi6XmnInmnIDpq5jkvJjlhYjnuqfvvIzkuI3kvJpzdHlsZS5sZWZ05b2x5ZONXG4gICAgICAgICAgICAgICAgbm9kZS5ydW50aW1lU3R5bGUubGVmdCA9IGN1cnJlbnRTdHlsZS5sZWZ0O1xuICAgICAgICAgICAgICAgIC8v4pGi5bCG57K+56Gu5YC86LWL57uZ5Yiwc3R5bGUubGVmdO+8jOeEtuWQjumAmui/h0lF55qE5Y+m5LiA5Liq56eB5pyJ5bGe5oCnIHN0eWxlLnBpeGVsTGVmdFxuICAgICAgICAgICAgICAgIC8v5b6X5Yiw5Y2V5L2N5Li6cHjnmoTnu5PmnpzvvJtmb250U2l6ZeeahOWIhuaUr+ingWh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0Lzc2MFxuICAgICAgICAgICAgICAgIHN0eWxlLmxlZnQgPSBuYW1lID09PSAnZm9udFNpemUnID8gJzFlbScgOiByZXQgfHwgMDtcbiAgICAgICAgICAgICAgICByZXQgPSBzdHlsZS5waXhlbExlZnQgKyAncHgnO1xuICAgICAgICAgICAgICAgIC8v4pGj6L+Y5Y6fIHN0eWxlLmxlZnTvvIxydW50aW1lU3R5bGUubGVmdFxuICAgICAgICAgICAgICAgIHN0eWxlLmxlZnQgPSBsZWZ0O1xuICAgICAgICAgICAgICAgIG5vZGUucnVudGltZVN0eWxlLmxlZnQgPSByc0xlZnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmV0ID09PSAnbWVkaXVtJykge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoJ1dpZHRoJywgJ1N0eWxlJyk7XG4gICAgICAgICAgICAgICAgLy9ib3JkZXIgd2lkdGgg6buY6K6k5YC85Li6bWVkaXVt77yM5Y2z5L2/5YW25Li6MCdcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFN0eWxlW25hbWVdID09PSAnbm9uZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0ID0gJzBweCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldCA9PT0gJycgPyAnYXV0bycgOiBib3JkZXJbcmV0XSB8fCByZXQ7XG4gICAgICAgIH07XG4gICAgICAgIGNzc0hvb2tzWydvcGFjaXR5OnNldCddID0gZnVuY3Rpb24gKG5vZGUsIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBub2RlLnN0eWxlO1xuXG4gICAgICAgICAgICB2YXIgb3BhY2l0eSA9IE51bWJlcih2YWx1ZSkgPD0gMSA/ICdhbHBoYShvcGFjaXR5PScgKyB2YWx1ZSAqIDEwMCArICcpJyA6ICcnO1xuICAgICAgICAgICAgdmFyIGZpbHRlciA9IHN0eWxlLmZpbHRlciB8fCAnJztcbiAgICAgICAgICAgIHN0eWxlLnpvb20gPSAxO1xuICAgICAgICAgICAgLy/kuI3og73kvb/nlKjku6XkuIvmlrnlvI/orr7nva7pgI/mmI7luqZcbiAgICAgICAgICAgIC8vbm9kZS5maWx0ZXJzLmFscGhhLm9wYWNpdHkgPSB2YWx1ZSAqIDEwMFxuICAgICAgICAgICAgc3R5bGUuZmlsdGVyID0gKHJhbHBoYS50ZXN0KGZpbHRlcikgPyBmaWx0ZXIucmVwbGFjZShyYWxwaGEsIG9wYWNpdHkpIDogZmlsdGVyICsgJyAnICsgb3BhY2l0eSkudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAoIXN0eWxlLmZpbHRlcikge1xuICAgICAgICAgICAgICAgIHN0eWxlLnJlbW92ZUF0dHJpYnV0ZSgnZmlsdGVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNzc0hvb2tzWydvcGFjaXR5OmdldCddID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IG5vZGUuc3R5bGUuZmlsdGVyLm1hdGNoKHJvcGFjdGl5KSB8fCBbXTtcbiAgICAgICAgICAgIHZhciByZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBtYXRjaFtpKytdOykge1xuICAgICAgICAgICAgICAgIGlmIChlbCA9PT0gJ29wYWNpdHknKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsIC8gMTAwICsgJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICcxJzsgLy/noa7kv53ov5Tlm57nmoTmmK/lrZfnrKbkuLJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5mbi5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8v5Y+W5b6X6Led56a76aG16Z2i5bem5Y+z6KeS55qE5Z2Q5qCHXG4gICAgICAgIHZhciBub2RlID0gdGhpc1swXSxcbiAgICAgICAgICAgIGJveCA9IHtcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFub2RlIHx8ICFub2RlLnRhZ05hbWUgfHwgIW5vZGUub3duZXJEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGJveDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZG9jID0gbm9kZS5vd25lckRvY3VtZW50O1xuICAgICAgICB2YXIgYm9keSA9IGRvYy5ib2R5O1xuICAgICAgICB2YXIgcm9vdCQkMSA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHZhciB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdztcbiAgICAgICAgaWYgKCFhdmFsb24uY29udGFpbnMocm9vdCQkMSwgbm9kZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBib3g7XG4gICAgICAgIH1cbiAgICAgICAgLy9odHRwOi8vaGtvbS5ibG9nMS5mYzIuY29tLz9tb2RlPW0mbm89NzUwIGJvZHnnmoTlgY/np7vph4/mmK/kuI3ljIXlkKttYXJnaW7nmoRcbiAgICAgICAgLy/miJHku6zlj6/ku6XpgJrov4dnZXRCb3VuZGluZ0NsaWVudFJlY3TmnaXojrflvpflhYPntKDnm7jlr7nkuo5jbGllbnTnmoRyZWN0LlxuICAgICAgICAvL2h0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzNjQzMy5hc3B4XG4gICAgICAgIGlmIChub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCkge1xuICAgICAgICAgICAgYm94ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTsgLy8gQmxhY2tCZXJyeSA1LCBpT1MgMyAob3JpZ2luYWwgaVBob25lKVxuICAgICAgICB9XG4gICAgICAgIC8vY2hyb21lL0lFNjogYm9keS5zY3JvbGxUb3AsIGZpcmVmb3gvb3RoZXI6IHJvb3Quc2Nyb2xsVG9wXG4gICAgICAgIHZhciBjbGllbnRUb3AgPSByb290JCQxLmNsaWVudFRvcCB8fCBib2R5LmNsaWVudFRvcCxcbiAgICAgICAgICAgIGNsaWVudExlZnQgPSByb290JCQxLmNsaWVudExlZnQgfHwgYm9keS5jbGllbnRMZWZ0LFxuICAgICAgICAgICAgc2Nyb2xsVG9wID0gTWF0aC5tYXgod2luLnBhZ2VZT2Zmc2V0IHx8IDAsIHJvb3QkJDEuc2Nyb2xsVG9wLCBib2R5LnNjcm9sbFRvcCksXG4gICAgICAgICAgICBzY3JvbGxMZWZ0ID0gTWF0aC5tYXgod2luLnBhZ2VYT2Zmc2V0IHx8IDAsIHJvb3QkJDEuc2Nyb2xsTGVmdCwgYm9keS5zY3JvbGxMZWZ0KTtcbiAgICAgICAgLy8g5oqK5rua5Yqo6Led56a75Yqg5YiwbGVmdCx0b3DkuK3ljrvjgIJcbiAgICAgICAgLy8gSUXkuIDkupvniYjmnKzkuK3kvJroh6rliqjkuLpIVE1M5YWD57Sg5Yqg5LiKMnB455qEYm9yZGVy77yM5oiR5Lus6ZyA6KaB5Y675o6J5a6DXG4gICAgICAgIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMzU2NChWUy44NSkuYXNweFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiBib3gudG9wICsgc2Nyb2xsVG9wIC0gY2xpZW50VG9wLFxuICAgICAgICAgICAgbGVmdDogYm94LmxlZnQgKyBzY3JvbGxMZWZ0IC0gY2xpZW50TGVmdFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvL+eUn+aIkGF2YWxvbi5mbi5zY3JvbGxMZWZ0LCBhdmFsb24uZm4uc2Nyb2xsVG9w5pa55rOVXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uZWFjaCh7XG4gICAgICAgIHNjcm9sbExlZnQ6ICdwYWdlWE9mZnNldCcsXG4gICAgICAgIHNjcm9sbFRvcDogJ3BhZ2VZT2Zmc2V0J1xuICAgIH0sIGZ1bmN0aW9uIChtZXRob2QsIHByb3ApIHtcbiAgICAgICAgYXZhbG9uLmZuW21ldGhvZF0gPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXNbMF0gfHwge307XG4gICAgICAgICAgICB2YXIgd2luID0gZ2V0V2luZG93KG5vZGUpO1xuICAgICAgICAgICAgdmFyIHJvb3QkJDEgPSBhdmFsb24ucm9vdDtcbiAgICAgICAgICAgIHZhciB0b3AgPSBtZXRob2QgPT09ICdzY3JvbGxUb3AnO1xuICAgICAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbiA/IHByb3AgaW4gd2luID8gd2luW3Byb3BdIDogcm9vdCQkMVttZXRob2RdIDogbm9kZVttZXRob2RdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAod2luKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbi5zY3JvbGxUbyghdG9wID8gdmFsIDogYXZhbG9uKHdpbikuc2Nyb2xsTGVmdCgpLCB0b3AgPyB2YWwgOiBhdmFsb24od2luKS5zY3JvbGxUb3AoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVttZXRob2RdID0gdmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGdldER1cGxleFR5cGUoZWxlbSkge1xuICAgICAgICB2YXIgcmV0ID0gZWxlbS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChyZXQgPT09ICdpbnB1dCcpIHtcbiAgICAgICAgICAgIHJldHVybiByY2hlY2tlZFR5cGUudGVzdChlbGVtLnR5cGUpID8gJ2NoZWNrZWQnIDogZWxlbS50eXBlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSUU2LzcvOOS4re+8jOWmguaenG9wdGlvbuayoeaciXZhbHVl5YC877yM6YKj5LmI5bCG6L+U5Zue56m65a2X56ym5Liy44CCXG4gICAgICogSUU5L0ZpcmVmb3gvU2FmYXJpL0Nocm9tZS9PcGVyYSDkuK3lhYjlj5ZvcHRpb27nmoR2YWx1ZeWAvO+8jOWmguaenOayoeaciXZhbHVl5bGe5oCn77yM5YiZ5Y+Wb3B0aW9u55qEaW5uZXJUZXh05YC844CCXG4gICAgICogSUUxMeWPilczQ++8jOWmguaenOayoeacieaMh+WumnZhbHVl77yM6YKj5LmIbm9kZS52YWx1Zem7mOiupOS4um5vZGUudGV4dO+8iOWtmOWcqHRyaW3kvZzvvInvvIzkvYZJRTktMTDliJnmmK/lj5Zpbm5lckhUTUwo5rKhdHJpbeaTjeS9nClcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIGdldE9wdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZSAmJiBub2RlLmhhc0F0dHJpYnV0ZSgndmFsdWUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUuZ2V0QXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhdHRyID0gbm9kZS5nZXRBdHRyaWJ1dGVOb2RlKCd2YWx1ZScpO1xuICAgICAgICBpZiAoYXR0ciAmJiBhdHRyLnNwZWNpZmllZCkge1xuICAgICAgICAgICAgcmV0dXJuIGF0dHIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGUuaW5uZXJIVE1MLnRyaW0oKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsSG9va3MgPSB7XG4gICAgICAgICdvcHRpb246Z2V0JzogbXNpZSA/IGdldE9wdGlvbiA6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS52YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgJ3NlbGVjdDpnZXQnOiBmdW5jdGlvbiBzZWxlY3RHZXQobm9kZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBvcHRpb24sXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IG5vZGUub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBpbmRleCA9IG5vZGUuc2VsZWN0ZWRJbmRleCxcbiAgICAgICAgICAgICAgICBnZXR0ZXIgPSB2YWxIb29rc1snb3B0aW9uOmdldCddLFxuICAgICAgICAgICAgICAgIG9uZSA9IG5vZGUudHlwZSA9PT0gJ3NlbGVjdC1vbmUnIHx8IGluZGV4IDwgMCxcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBvbmUgPyBudWxsIDogW10sXG4gICAgICAgICAgICAgICAgbWF4ID0gb25lID8gaW5kZXggKyAxIDogb3B0aW9ucy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaSA9IGluZGV4IDwgMCA/IG1heCA6IG9uZSA/IGluZGV4IDogMDtcbiAgICAgICAgICAgIGZvciAoOyBpIDwgbWF4OyBpKyspIHtcbiAgICAgICAgICAgICAgICBvcHRpb24gPSBvcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgIC8vSUU2LTnlnKhyZXNldOWQjuS4jeS8muaUueWPmHNlbGVjdGVk77yM6ZyA6KaB5pS555SoaSA9PT0gaW5kZXjliKTlrppcbiAgICAgICAgICAgICAgICAvL+aIkeS7rOi/h+a7pOaJgOaciWRpc2FibGVk55qEb3B0aW9u5YWD57Sg77yM5L2G5Zyoc2FmYXJpNeS4i++8jFxuICAgICAgICAgICAgICAgIC8v5aaC5p6c6K6+572ub3B0Z3JvdXDkuLpkaXNhYmxl77yM6YKj5LmI5YW25omA5pyJ5a2p5a2Q6YO9ZGlzYWJsZVxuICAgICAgICAgICAgICAgIC8v5Zug5q2k5b2T5LiA5Liq5YWD57Sg5Li6ZGlzYWJsZe+8jOmcgOimgeajgOa1i+WFtuaYr+WQpuaYvuW8j+iuvue9ruS6hmRpc2FibGXlj4rlhbbniLboioLngrnnmoRkaXNhYmxl5oOF5Ya1XG4gICAgICAgICAgICAgICAgaWYgKChvcHRpb24uc2VsZWN0ZWQgfHwgaSA9PT0gaW5kZXgpICYmICFvcHRpb24uZGlzYWJsZWQgJiYgKCFvcHRpb24ucGFyZW50Tm9kZS5kaXNhYmxlZCB8fCBvcHRpb24ucGFyZW50Tm9kZS50YWdOYW1lICE9PSAnT1BUR1JPVVAnKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGdldHRlcihvcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAob25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy/mlLbpm4bmiYDmnIlzZWxlY3RlZOWAvOe7hOaIkOaVsOe7hOi/lOWbnlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfSxcbiAgICAgICAgJ3NlbGVjdDpzZXQnOiBmdW5jdGlvbiBzZWxlY3RTZXQobm9kZSwgdmFsdWVzLCBvcHRpb25TZXQpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZXMpOyAvL+W8uuWItui9rOaNouS4uuaVsOe7hFxuICAgICAgICAgICAgdmFyIGdldHRlciA9IHZhbEhvb2tzWydvcHRpb246Z2V0J107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gbm9kZS5vcHRpb25zW2krK107KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLnNlbGVjdGVkID0gdmFsdWVzLmluZGV4T2YoZ2V0dGVyKGVsKSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25TZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9uU2V0KSB7XG4gICAgICAgICAgICAgICAgbm9kZS5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXZhbG9uLmZuLnZhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXNbMF07XG4gICAgICAgIGlmIChub2RlICYmIG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBnZXQgPSBhcmd1bWVudHMubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgdmFyIGFjY2VzcyA9IGdldCA/ICc6Z2V0JyA6ICc6c2V0JztcbiAgICAgICAgICAgIHZhciBmbiA9IHZhbEhvb2tzW2dldER1cGxleFR5cGUobm9kZSkgKyBhY2Nlc3NdO1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IGZuKG5vZGUsIHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChub2RlLnZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXHIvZywgJycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldCA/IHZhbCA6IHRoaXM7XG4gICAgfTtcblxuICAgIC8qIFxuICAgICAqIOWwhuimgeajgOa1i+eahOWtl+espuS4sueahOWtl+espuS4suabv+aNouaIkD8/MTIz6L+Z5qC355qE5qC85byPXG4gICAgICovXG4gICAgdmFyIHN0cmluZ051bSA9IDA7XG4gICAgdmFyIHN0cmluZ1Bvb2wgPSB7XG4gICAgICAgIG1hcDoge31cbiAgICB9O1xuICAgIHZhciByZmlsbCA9IC9cXD9cXD9cXGQrL2c7XG4gICAgZnVuY3Rpb24gZGlnKGEpIHtcbiAgICAgICAgdmFyIGtleSA9ICc/PycgKyBzdHJpbmdOdW0rKztcbiAgICAgICAgc3RyaW5nUG9vbC5tYXBba2V5XSA9IGE7XG4gICAgICAgIHJldHVybiBrZXkgKyAnICc7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZpbGwoYSkge1xuICAgICAgICB2YXIgdmFsID0gc3RyaW5nUG9vbC5tYXBbYV07XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsZWFyU3RyaW5nKHN0cikge1xuICAgICAgICB2YXIgYXJyYXkgPSByZWFkU3RyaW5nKHN0cik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJyYXkubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShhcnJheVtpXSwgZGlnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRTdHJpbmcoc3RyKSB7XG4gICAgICAgIHZhciBlbmQsXG4gICAgICAgICAgICBzID0gMDtcbiAgICAgICAgdmFyIHJldCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHN0ci5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjID0gc3RyLmNoYXJBdChpKTtcbiAgICAgICAgICAgIGlmICghZW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKGMgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IFwiJ1wiO1xuICAgICAgICAgICAgICAgICAgICBzID0gaTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09ICdcIicpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gJ1wiJztcbiAgICAgICAgICAgICAgICAgICAgcyA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoYyA9PT0gZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKHN0ci5zbGljZShzLCBpICsgMSkpO1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICB2YXIgdm9pZFRhZyA9IHtcbiAgICAgICAgYXJlYTogMSxcbiAgICAgICAgYmFzZTogMSxcbiAgICAgICAgYmFzZWZvbnQ6IDEsXG4gICAgICAgIGJnc291bmQ6IDEsXG4gICAgICAgIGJyOiAxLFxuICAgICAgICBjb2w6IDEsXG4gICAgICAgIGNvbW1hbmQ6IDEsXG4gICAgICAgIGVtYmVkOiAxLFxuICAgICAgICBmcmFtZTogMSxcbiAgICAgICAgaHI6IDEsXG4gICAgICAgIGltZzogMSxcbiAgICAgICAgaW5wdXQ6IDEsXG4gICAgICAgIGtleWdlbjogMSxcbiAgICAgICAgbGluazogMSxcbiAgICAgICAgbWV0YTogMSxcbiAgICAgICAgcGFyYW06IDEsXG4gICAgICAgIHNvdXJjZTogMSxcbiAgICAgICAgdHJhY2s6IDEsXG4gICAgICAgIHdicjogMVxuICAgIH07XG5cbiAgICB2YXIgb3JwaGFuVGFnID0ge1xuICAgICAgICBzY3JpcHQ6IDEsXG4gICAgICAgIHN0eWxlOiAxLFxuICAgICAgICB0ZXh0YXJlYTogMSxcbiAgICAgICAgeG1wOiAxLFxuICAgICAgICBub3NjcmlwdDogMSxcbiAgICAgICAgdGVtcGxhdGU6IDFcbiAgICB9O1xuXG4gICAgLyogXG4gICAgICogIOatpOaooeWdl+WPqueUqOS6juaWh+acrOi9rOiZmuaLn0RPTSwgXG4gICAgICogIOWboOS4uuWcqOecn+Wunua1j+iniOWZqOS8muWvueaIkeS7rOeahEhUTUzlgZrmm7TlpJrlpITnkIYsXG4gICAgICogIOWmgiwg5re75Yqg6aKd5aSW5bGe5oCnLCDmlLnlj5jnu5PmnoRcbiAgICAgKiAg5q2k5qih5Z2X5bCx5piv55So5LqO5qih5ouf6L+Z5Lqb6KGM5Li6XG4gICAgICovXG4gICAgZnVuY3Rpb24gbWFrZU9ycGhhbihub2RlLCBub2RlTmFtZSwgaW5uZXJIVE1MKSB7XG4gICAgICAgIHN3aXRjaCAobm9kZU5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0eWxlJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjcmlwdCc6XG4gICAgICAgICAgICBjYXNlICdub3NjcmlwdCc6XG4gICAgICAgICAgICBjYXNlICd0ZW1wbGF0ZSc6XG4gICAgICAgICAgICBjYXNlICd4bXAnOlxuICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4gPSBbe1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogJyN0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVZhbHVlOiBpbm5lckhUTUxcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgICAgICAgICAgICB2YXIgcHJvcHMgPSBub2RlLnByb3BzO1xuICAgICAgICAgICAgICAgIHByb3BzLnR5cGUgPSBub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBwcm9wcy52YWx1ZSA9IGlubmVySFRNTDtcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuID0gW3tcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6ICcjdGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIG5vZGVWYWx1ZTogaW5uZXJIVE1MXG4gICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvcHRpb24nOlxuICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4gPSBbe1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogJyN0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVZhbHVlOiB0cmltSFRNTChpbm5lckhUTUwpXG4gICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL+S4k+mXqOeUqOS6juWkhOeQhm9wdGlvbuagh+etvumHjOmdoueahOagh+etvlxuICAgIHZhciBydHJpbUhUTUwgPSAvPFxcdysoXFxzKyhcIlteXCJdKlwifCdbXiddKid8W14+XSkrKT8+fDxcXC9cXHcrPi9naTtcbiAgICBmdW5jdGlvbiB0cmltSFRNTCh2KSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcodikucmVwbGFjZShydHJpbUhUTUwsICcnKS50cmltKCk7XG4gICAgfVxuXG4gICAgLy93aWRnZXQgcnVsZSBkdXBsZXggdmFsaWRhdGVcblxuICAgIC8v5aaC5p6c55u05o6l5bCGdHLlhYPntKDlhpl0YWJsZeS4i+mdoizpgqPkuYjmtY/op4jlmajlsIblsIblroPku6wo55u46YK755qE6YKj5Yeg5LiqKSzmlL7liLDkuIDkuKrliqjmgIHliJvlu7rnmoR0Ym9keeW6leS4i1xuICAgIGZ1bmN0aW9uIG1ha2VUYm9keShub2Rlcykge1xuICAgICAgICB2YXIgdGJvZHksXG4gICAgICAgICAgICBuZWVkQWRkVGJvZHkgPSBmYWxzZSxcbiAgICAgICAgICAgIGNvdW50ID0gMCxcbiAgICAgICAgICAgIHN0YXJ0ID0gMCxcbiAgICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKCF0Ym9keSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAndHInKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5pS26ZuGdHLlj4p0cuS4pOaXgeeahOazqOmHiuiKgueCuVxuICAgICAgICAgICAgICAgICAgICB0Ym9keSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiAndGJvZHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRib2R5LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIG5lZWRBZGRUYm9keSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFydCA9PT0gMCkgc3RhcnQgPSBpO1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IHRib2R5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgIT09ICd0cicgJiYgbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICB0Ym9keSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRib2R5LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmVlZEFkZFRib2R5KSB7XG4gICAgICAgICAgICBmb3IgKGkgPSBzdGFydDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChub2Rlc1tpXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlRE9NTmVzdGluZyhwYXJlbnQsIGNoaWxkKSB7XG5cbiAgICAgICAgdmFyIHBhcmVudFRhZyA9IHBhcmVudC5ub2RlTmFtZTtcbiAgICAgICAgdmFyIHRhZyA9IGNoaWxkLm5vZGVOYW1lO1xuICAgICAgICB2YXIgcGFyZW50Q2hpbGQgPSBuZXN0T2JqZWN0W3BhcmVudFRhZ107XG4gICAgICAgIGlmIChwYXJlbnRDaGlsZCkge1xuICAgICAgICAgICAgaWYgKHBhcmVudFRhZyA9PT0gJ3AnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBOZXN0Q2hpbGRbdGFnXSkge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24ud2FybignUCBlbGVtZW50IGNhbiBub3QgIGFkZCB0aGVzZSBjaGlsZGxyZW46XFxuJyArIE9iamVjdC5rZXlzKHBOZXN0Q2hpbGQpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXBhcmVudENoaWxkW3RhZ10pIHtcbiAgICAgICAgICAgICAgICBhdmFsb24ud2FybihwYXJlbnRUYWcudG9VcHBlckNhc2UoKSArICdlbGVtZW50IG9ubHkgYWRkIHRoZXNlIGNoaWxkcmVuOlxcbicgKyBPYmplY3Qua2V5cyhwYXJlbnRDaGlsZCkgKyAnXFxuYnV0IHlvdSBhZGQgJyArIHRhZy50b1VwcGVyQ2FzZSgpICsgJyAhIScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlT2JqZWN0KHN0cikge1xuICAgICAgICByZXR1cm4gb25lT2JqZWN0KHN0ciArICcsdGVtcGxhdGUsI2RvY3VtZW50LWZyYWdtZW50LCNjb21tZW50Jyk7XG4gICAgfVxuICAgIHZhciBwTmVzdENoaWxkID0gb25lT2JqZWN0KCdkaXYsdWwsb2wsZGwsdGFibGUsaDEsaDIsaDMsaDQsaDUsaDYsZm9ybSxmaWVsZHNldCcpO1xuICAgIHZhciB0TmVzdENoaWxkID0gbWFrZU9iamVjdCgndHIsc3R5bGUsc2NyaXB0Jyk7XG4gICAgdmFyIG5lc3RPYmplY3QgPSB7XG4gICAgICAgIHA6IHBOZXN0Q2hpbGQsXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbnNlbGVjdFxuICAgICAgICBzZWxlY3Q6IG1ha2VPYmplY3QoJ29wdGlvbixvcHRncm91cCwjdGV4dCcpLFxuICAgICAgICBvcHRncm91cDogbWFrZU9iamVjdCgnb3B0aW9uLCN0ZXh0JyksXG4gICAgICAgIG9wdGlvbjogbWFrZU9iamVjdCgnI3RleHQnKSxcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjcGFyc2luZy1tYWluLWludGRcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjcGFyc2luZy1tYWluLWluY2FwdGlvblxuICAgICAgICAvLyBObyBzcGVjaWFsIGJlaGF2aW9yIHNpbmNlIHRoZXNlIHJ1bGVzIGZhbGwgYmFjayB0byBcImluIGJvZHlcIiBtb2RlIGZvclxuICAgICAgICAvLyBhbGwgZXhjZXB0IHNwZWNpYWwgdGFibGUgbm9kZXMgd2hpY2ggY2F1c2UgYmFkIHBhcnNpbmcgYmVoYXZpb3IgYW55d2F5LlxuXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbnRyXG4gICAgICAgIHRyOiBtYWtlT2JqZWN0KCd0aCx0ZCxzdHlsZSxzY3JpcHQnKSxcblxuICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNwYXJzaW5nLW1haW4taW50Ym9keVxuICAgICAgICB0Ym9keTogdE5lc3RDaGlsZCxcbiAgICAgICAgdGZvb3Q6IHROZXN0Q2hpbGQsXG4gICAgICAgIHRoZWFkOiB0TmVzdENoaWxkLFxuICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNwYXJzaW5nLW1haW4taW5jb2xncm91cFxuICAgICAgICBjb2xncm91cDogbWFrZU9iamVjdCgnY29sJyksXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbnRhYmxlXG4gICAgICAgIC8vIHRhYmxlOiBvbmVPYmplY3QoJ2NhcHRpb24sY29sZ3JvdXAsdGJvZHksdGhlYWQsdGZvb3Qsc3R5bGUsc2NyaXB0LHRlbXBsYXRlLCNkb2N1bWVudC1mcmFnbWVudCcpLFxuICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNwYXJzaW5nLW1haW4taW5oZWFkXG4gICAgICAgIGhlYWQ6IG1ha2VPYmplY3QoJ2Jhc2UsYmFzZWZvbnQsYmdzb3VuZCxsaW5rLHN0eWxlLHNjcmlwdCxtZXRhLHRpdGxlLG5vc2NyaXB0LG5vZnJhbWVzJyksXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3NlbWFudGljcy5odG1sI3RoZS1odG1sLWVsZW1lbnRcbiAgICAgICAgaHRtbDogb25lT2JqZWN0KCdoZWFkLGJvZHknKVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKiBhdmFsb24yLjEuMeeahOaWsOW8j2xleGVyXG4gICAgICog5bCG5a2X56ym5Liy5Y+Y5oiQ5LiA5Liq6Jma5oufRE9N5qCRLOaWueS+v+S7peWQjui/m+S4gOatpeWPmOaIkOaooeadv+WHveaVsFxuICAgICAqIOatpOmYtuauteWPquS8mueUn+aIkFZFbGVtZW50LFZUZXh0LFZDb21tZW50XG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICovXG4gICAgZnVuY3Rpb24gbm9tYWxTdHJpbmcoc3RyKSB7XG4gICAgICAgIHJldHVybiBhdmFsb24udW5lc2NhcGVIVE1MKHN0ci5yZXBsYWNlKHJmaWxsLCBmaWxsKSk7XG4gICAgfVxuICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL3J2aXNjb21pL3RydW5rOC9ibG9iL21hc3Rlci90cnVuazguanNcblxuICAgIHZhciByb3BlblRhZyA9IC9ePChbLUEtWmEtejAtOV9dKylcXHMqKFtePl0qPykoXFwvPyk+LztcbiAgICB2YXIgcmVuZFRhZyA9IC9ePFxcLyhbXj5dKyk+LztcbiAgICB2YXIgcnRhZ1N0YXJ0ID0gL1tcXCFcXC9hLXpdL2k7IC8v6Zet5qCH562+55qE56ys5LiA5Liq5a2X56ymLOW8gOagh+etvueahOesrOS4gOS4quiLseaWhyzms6jph4roioLngrnnmoQhXG4gICAgdmFyIHJsaW5lU3AgPSAvXFxcXG5cXHMqL2c7XG4gICAgdmFyIHJhdHRycyA9IC8oW149XFxzXSspKD86XFxzKj1cXHMqKFxcUyspKT8vO1xuXG4gICAgdmFyIHJjb250ZW50ID0gL1xcUy87IC8v5Yik5a6a6YeM6Z2i5pyJ5rKh5pyJ5YaF5a65XG4gICAgZnVuY3Rpb24gZnJvbVN0cmluZyhzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZyb20oc3RyKTtcbiAgICB9XG4gICAgYXZhbG9uLmxleGVyID0gZnJvbVN0cmluZztcblxuICAgIHZhciBzdHJDYWNoZSA9IG5ldyBDYWNoZSgxMDApO1xuXG4gICAgZnVuY3Rpb24gQVNUKCkge31cbiAgICBBU1QucHJvdG90eXBlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KHN0cikge1xuICAgICAgICAgICAgdGhpcy5yZXQgPSBbXTtcbiAgICAgICAgICAgIHZhciBzdGFjayA9IFtdO1xuICAgICAgICAgICAgc3RhY2subGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICAgICAgICAgICAgdGhpcy5zdHIgPSBzdHI7XG4gICAgICAgIH0sXG4gICAgICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgICAgICAgdmFyIGJyZWFrSW5kZXggPSA5OTk5OTk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgdGhpcy50cnlHZW5UZXh0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cnlHZW5Db21tZW50KCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cnlHZW5PcGVuVGFnKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cnlHZW5DbG9zZVRhZygpO1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlIHx8IC0tYnJlYWtJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAndGFibGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWtlVGJvZHkobm9kZS5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUuZW5kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKHRoaXMuc3RyLmxlbmd0aCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZml4UG9zOiBmdW5jdGlvbiBmaXhQb3Moc3RyLCBpKSB7XG4gICAgICAgICAgICB2YXIgdHJ5Q291bnQgPSBzdHIubGVuZ3RoIC0gaTtcbiAgICAgICAgICAgIHdoaWxlICh0cnlDb3VudC0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFydGFnU3RhcnQudGVzdChzdHIuY2hhckF0KGkgKyAxKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaSA9IHN0ci5pbmRleE9mKCc8JywgaSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cnlDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGkgPSBzdHIubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0sXG4gICAgICAgIHRyeUdlblRleHQ6IGZ1bmN0aW9uIHRyeUdlblRleHQoKSB7XG4gICAgICAgICAgICB2YXIgc3RyID0gdGhpcy5zdHI7XG4gICAgICAgICAgICBpZiAoc3RyLmNoYXJBdCgwKSAhPT0gJzwnKSB7XG4gICAgICAgICAgICAgICAgLy/lpITnkIbmlofmnKzoioLngrlcbiAgICAgICAgICAgICAgICB2YXIgaSA9IHN0ci5pbmRleE9mKCc8Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSBzdHIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXJ0YWdTdGFydC50ZXN0KHN0ci5jaGFyQXQoaSArIDEpKSkge1xuICAgICAgICAgICAgICAgICAgICAvL+WkhOeQhmDlhoXlrrkyIHt7IChpZHgxIDwgPCA8ICAxID8gJ3JlZCcgOiAnYmx1ZScgKSArIGEgfX0gYCDnmoTmg4XlhrUgXG4gICAgICAgICAgICAgICAgICAgIGkgPSB0aGlzLmZpeFBvcyhzdHIsIGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbm9kZVZhbHVlID0gc3RyLnNsaWNlKDAsIGkpLnJlcGxhY2UocmZpbGwsIGZpbGwpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RyID0gc3RyLnNsaWNlKGkpO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6ICcjdGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIG5vZGVWYWx1ZTogbm9kZVZhbHVlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAocmNvbnRlbnQudGVzdChub2RlVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ5R2VuQ2hpbGRyZW4oKTsgLy/kuI3mlLbpm4bnqbrnmb3oioLngrlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRyeUdlbkNvbW1lbnQ6IGZ1bmN0aW9uIHRyeUdlbkNvbW1lbnQoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdHIgPSB0aGlzLnN0cjtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IHN0ci5pbmRleE9mKCc8IS0tJyk7IC8v5aSE55CG5rOo6YeK6IqC54K5XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IHN0ci5pbmRleE9mKCctLT4nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGwgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFsb24uZXJyb3IoJ+azqOmHiuiKgueCueayoeaciemXreWQiCcgKyBzdHIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlVmFsdWUgPSBzdHIuc2xpY2UoNCwgbCkucmVwbGFjZShyZmlsbCwgZmlsbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RyID0gc3RyLnNsaWNlKGwgKyAzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6ICcjY29tbWVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVmFsdWU6IG5vZGVWYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyeUdlbkNoaWxkcmVuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0cnlHZW5PcGVuVGFnOiBmdW5jdGlvbiB0cnlHZW5PcGVuVGFnKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RyID0gdGhpcy5zdHI7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gc3RyLm1hdGNoKHJvcGVuVGFnKTsgLy/lpITnkIblhYPntKDoioLngrnlvIDlp4vpg6jliIZcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVOYW1lID0gbWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoL15bQS1aXS8udGVzdChub2RlTmFtZSkgJiYgYXZhbG9uLmNvbXBvbmVudHNbbm9kZU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5pcyA9IG5vZGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzVm9pZFRhZyA9ICEhdm9pZFRhZ1tub2RlTmFtZV0gfHwgbWF0Y2hbM10gPT09ICdcXC8nO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiBub2RlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVm9pZFRhZzogaXNWb2lkVGFnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuUHJvcHMoYXR0cnMsIG5vZGUucHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ5R2VuQ2hpbGRyZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1ZvaWRUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcnBoYW5UYWdbbm9kZU5hbWVdIHx8IG5vZGVOYW1lID09PSAnb3B0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHN0ci5pbmRleE9mKCc8LycgKyBub2RlTmFtZSArICc+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlubmVySFRNTCA9IHN0ci5zbGljZSgwLCBpbmRleCkudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFrZU9ycGhhbihub2RlLCBub2RlTmFtZSwgbm9tYWxTdHJpbmcoaW5uZXJIVE1MKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHIgPSBzdHI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0cnlHZW5DbG9zZVRhZzogZnVuY3Rpb24gdHJ5R2VuQ2xvc2VUYWcoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdHIgPSB0aGlzLnN0cjtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBzdHIubWF0Y2gocmVuZFRhZyk7IC8v5aSE55CG5YWD57Sg6IqC54K557uT5p2f6YOo5YiGXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlTmFtZSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0ID0gdGhpcy5zdGFjay5sYXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgICAgICAgICAgICAgIGlmICghbGFzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhbG9uLmVycm9yKG1hdGNoWzBdICsgJ+WJjemdoue8uuWwkTwnICsgbm9kZU5hbWUgKyAnPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UqL1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxhc3Qubm9kZU5hbWUgIT09IG5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyTXNnID0gbGFzdC5ub2RlTmFtZSArICfmsqHmnInpl63lkIgs6K+35rOo5oSP5bGe5oCn55qE5byV5Y+3JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFsb24uZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHIgPSBzdHIuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRyeUdlbkNoaWxkcmVuOiBmdW5jdGlvbiB0cnlHZW5DaGlsZHJlbigpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgdmFyIHAgPSB0aGlzLnN0YWNrLmxhc3QoKTtcbiAgICAgICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGVET01OZXN0aW5nKHAsIG5vZGUpO1xuICAgICAgICAgICAgICAgIHAuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXQucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2VuUHJvcHM6IGZ1bmN0aW9uIGdlblByb3BzKGF0dHJzLCBwcm9wcykge1xuXG4gICAgICAgICAgICB3aGlsZSAoYXR0cnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gcmF0dHJzLmV4ZWMoYXR0cnMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGFyclsxXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gYXJyWzJdIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBhdHRycyA9IGF0dHJzLnJlcGxhY2UoYXJyWzBdLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9odHRwczovL2dpdGh1Yi5jb20vUnVieUxvdXZyZS9hdmFsb24vaXNzdWVzLzE4NDRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCc/PycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBub21hbFN0cmluZyh2YWx1ZSkucmVwbGFjZShybGluZVNwLCAnJykuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghKG5hbWUgaW4gcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciB2ZG9tQXN0ID0gbmV3IEFTVCgpO1xuXG4gICAgZnVuY3Rpb24gZnJvbShzdHIpIHtcbiAgICAgICAgdmFyIGNhY2hlS2V5ID0gc3RyO1xuICAgICAgICB2YXIgY2FjaGVkID0gc3RyQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGF2YWxvbi5taXgodHJ1ZSwgW10sIGNhY2hlZCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyaW5nUG9vbC5tYXAgPSB7fTtcbiAgICAgICAgc3RyID0gY2xlYXJTdHJpbmcoc3RyKTtcblxuICAgICAgICB2ZG9tQXN0LmluaXQoc3RyKTtcbiAgICAgICAgdmFyIHJldCA9IHZkb21Bc3QuZ2VuKCk7XG4gICAgICAgIHN0ckNhY2hlLnB1dChjYWNoZUtleSwgYXZhbG9uLm1peCh0cnVlLCBbXSwgcmV0KSk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgdmFyIHJodG1sID0gLzx8JiM/XFx3KzsvO1xuICAgIHZhciBodG1sQ2FjaGUgPSBuZXcgQ2FjaGUoMTI4KTtcbiAgICB2YXIgcnhodG1sID0gLzwoPyFhcmVhfGJyfGNvbHxlbWJlZHxocnxpbWd8aW5wdXR8bGlua3xtZXRhfHBhcmFtKSgoW1xcdzpdKylbXj5dKilcXC8+L2lnO1xuXG4gICAgYXZhbG9uLnBhcnNlSFRNTCA9IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgIHZhciBmcmFnbWVudCA9IGNyZWF0ZUZyYWdtZW50KCk7XG4gICAgICAgIC8v5aSE55CG6Z2e5a2X56ym5LiyXG4gICAgICAgIGlmICh0eXBlb2YgaHRtbCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICAgICAgfVxuICAgICAgICAvL+WkhOeQhumdnkhUTUzlrZfnrKbkuLJcbiAgICAgICAgaWYgKCFyaHRtbC50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQkMS5jcmVhdGVUZXh0Tm9kZShodG1sKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UocnhodG1sLCAnPCQxPjwvJDI+JykudHJpbSgpO1xuICAgICAgICB2YXIgaGFzQ2FjaGUgPSBodG1sQ2FjaGUuZ2V0KGh0bWwpO1xuICAgICAgICBpZiAoaGFzQ2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiBhdmFsb24uY2xvbmVOb2RlKGhhc0NhY2hlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdm5vZGVzID0gZnJvbVN0cmluZyhodG1sKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IHZub2Rlc1tpKytdOykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gYXZhbG9uLnZkb20oZWwsICd0b0RPTScpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChodG1sLmxlbmd0aCA8IDEwMjQpIHtcbiAgICAgICAgICAgIGh0bWxDYWNoZS5wdXQoaHRtbCwgZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9O1xuXG4gICAgYXZhbG9uLmlubmVySFRNTCA9IGZ1bmN0aW9uIChub2RlLCBodG1sKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSBhdmFsb24ucGFyc2VIVE1MKGh0bWwpO1xuICAgICAgICB0aGlzLmNsZWFySFRNTChub2RlKTtcbiAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChwYXJzZWQpO1xuICAgIH07XG5cbiAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9rYXJsb2VzcGlyaXR1L2VzY2FwZWh0bWxlbnQvYmxvYi9tYXN0ZXIvaW5kZXguanNcbiAgICBhdmFsb24udW5lc2NhcGVIVE1MID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyhodG1sKS5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJykucmVwbGFjZSgvJiMzOTsvZywgJ1xcJycpLnJlcGxhY2UoLyZsdDsvZywgJzwnKS5yZXBsYWNlKC8mZ3Q7L2csICc+JykucmVwbGFjZSgvJmFtcDsvZywgJyYnKTtcbiAgICB9O1xuXG4gICAgYXZhbG9uLmNsZWFySFRNTCA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHdoaWxlIChub2RlLmxhc3RDaGlsZCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChub2RlLmxhc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcblxuICAgIC8vaHR0cDovL3d3dy5mZWllc29mdC5jb20vaHRtbC9ldmVudHMuaHRtbFxuICAgIC8vaHR0cDovL3NlZ21lbnRmYXVsdC5jb20vcS8xMDEwMDAwMDAwNjg3OTc3L2EtMTAyMDAwMDAwMDY4ODc1N1xuICAgIHZhciBjYW5CdWJibGVVcCA9IHtcbiAgICAgICAgY2xpY2s6IHRydWUsXG4gICAgICAgIGRibGNsaWNrOiB0cnVlLFxuICAgICAgICBrZXlkb3duOiB0cnVlLFxuICAgICAgICBrZXlwcmVzczogdHJ1ZSxcbiAgICAgICAga2V5dXA6IHRydWUsXG4gICAgICAgIG1vdXNlZG93bjogdHJ1ZSxcbiAgICAgICAgbW91c2Vtb3ZlOiB0cnVlLFxuICAgICAgICBtb3VzZXVwOiB0cnVlLFxuICAgICAgICBtb3VzZW92ZXI6IHRydWUsXG4gICAgICAgIG1vdXNlb3V0OiB0cnVlLFxuICAgICAgICB3aGVlbDogdHJ1ZSxcbiAgICAgICAgbW91c2V3aGVlbDogdHJ1ZSxcbiAgICAgICAgaW5wdXQ6IHRydWUsXG4gICAgICAgIGNoYW5nZTogdHJ1ZSxcbiAgICAgICAgYmVmb3JlaW5wdXQ6IHRydWUsXG4gICAgICAgIGNvbXBvc2l0aW9uc3RhcnQ6IHRydWUsXG4gICAgICAgIGNvbXBvc2l0aW9udXBkYXRlOiB0cnVlLFxuICAgICAgICBjb21wb3NpdGlvbmVuZDogdHJ1ZSxcbiAgICAgICAgc2VsZWN0OiB0cnVlLFxuICAgICAgICAvL2h0dHA6Ly9ibG9nLmNzZG4ubmV0L2xlZV9tYWdudW0vYXJ0aWNsZS9kZXRhaWxzLzE3NzYxNDQxXG4gICAgICAgIGN1dDogdHJ1ZSxcbiAgICAgICAgY29weTogdHJ1ZSxcbiAgICAgICAgcGFzdGU6IHRydWUsXG4gICAgICAgIGJlZm9yZWN1dDogdHJ1ZSxcbiAgICAgICAgYmVmb3JlY29weTogdHJ1ZSxcbiAgICAgICAgYmVmb3JlcGFzdGU6IHRydWUsXG4gICAgICAgIGZvY3VzaW46IHRydWUsXG4gICAgICAgIGZvY3Vzb3V0OiB0cnVlLFxuICAgICAgICBET01Gb2N1c0luOiB0cnVlLFxuICAgICAgICBET01Gb2N1c091dDogdHJ1ZSxcbiAgICAgICAgRE9NQWN0aXZhdGU6IHRydWUsXG4gICAgICAgIGRyYWdlbmQ6IHRydWUsXG4gICAgICAgIGRhdGFzZXRjaGFuZ2VkOiB0cnVlXG4gICAgfTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIHZhciBoYWNrU2FmYXJpID0gYXZhbG9uLm1vZGVybiAmJiBkb2N1bWVudCQxLm9udG91Y2hzdGFydDtcblxuICAgIC8v5re75YqgZm4uYmluZCwgZm4udW5iaW5kLCBiaW5kLCB1bmJpbmRcbiAgICBhdmFsb24uZm4uYmluZCA9IGZ1bmN0aW9uICh0eXBlLCBmbiwgcGhhc2UpIHtcbiAgICAgICAgaWYgKHRoaXNbMF0pIHtcbiAgICAgICAgICAgIC8v5q2k5pa55rOV5LiN5Lya6ZO+XG4gICAgICAgICAgICByZXR1cm4gYXZhbG9uLmJpbmQodGhpc1swXSwgdHlwZSwgZm4sIHBoYXNlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhdmFsb24uZm4udW5iaW5kID0gZnVuY3Rpb24gKHR5cGUsIGZuLCBwaGFzZSkge1xuICAgICAgICBpZiAodGhpc1swXSkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBfc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXNbMF0pO1xuICAgICAgICAgICAgYXZhbG9uLnVuYmluZC5hcHBseSgwLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyrnu5Hlrprkuovku7YqL1xuICAgIGF2YWxvbi5iaW5kID0gZnVuY3Rpb24gKGVsZW0sIHR5cGUsIGZuKSB7XG4gICAgICAgIGlmIChlbGVtLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBlbGVtLmdldEF0dHJpYnV0ZSgnYXZhbG9uLWV2ZW50cycpIHx8ICcnO1xuICAgICAgICAgICAgLy/lpoLmnpzmmK/kvb/nlKhtcy1vbi0q57uR5a6a55qE5Zue6LCDLOWFtnV1aWTmoLzlvI/kuLplMTIxMjIzMjQsXG4gICAgICAgICAgICAvL+WmguaenOaYr+S9v+eUqGJpbmTmlrnms5Xnu5HlrprnmoTlm57osIMs5YW2dXVpZOagvOW8j+S4ul8xMlxuICAgICAgICAgICAgdmFyIHV1aWQgPSBnZXRTaG9ydElEKGZuKTtcbiAgICAgICAgICAgIHZhciBob29rID0gZXZlbnRIb29rc1t0eXBlXTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjbGljaycgJiYgaGFja1NhZmFyaSkge1xuICAgICAgICAgICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhdmFsb24ubm9vcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmIChob29rKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IGhvb2sudHlwZSB8fCB0eXBlO1xuICAgICAgICAgICAgICAgIGlmIChob29rLmZpeCkge1xuICAgICAgICAgICAgICAgICAgICBmbiA9IGhvb2suZml4KGVsZW0sIGZuKTtcbiAgICAgICAgICAgICAgICAgICAgZm4udXVpZCA9IHV1aWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGtleSA9IHR5cGUgKyAnOicgKyB1dWlkO1xuICAgICAgICAgICAgYXZhbG9uLmV2ZW50TGlzdGVuZXJzW2ZuLnV1aWRdID0gZm47XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKHR5cGUgKyAnOicpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8v5ZCM5LiA56eN5LqL5Lu25Y+q57uR5a6a5LiA5qyhXG4gICAgICAgICAgICAgICAgaWYgKGNhbkJ1YmJsZVVwW3R5cGVdIHx8IGF2YWxvbi5tb2Rlcm4gJiYgZm9jdXNCbHVyW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlRXZlbnQodHlwZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLl9uYXRpdmVCaW5kKGVsZW0sIHR5cGUsIGRpc3BhdGNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIga2V5cyA9IHZhbHVlLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmIChrZXlzWzBdID09PSAnJykge1xuICAgICAgICAgICAgICAgIGtleXMuc2hpZnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChrZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICBzZXRFdmVudElkKGVsZW0sIGtleXMuam9pbignLCcpKTtcbiAgICAgICAgICAgICAgICAvL+WwhuS7pOeJjOaUvui/m2F2YWxvbi1ldmVudHPlsZ7mgKfkuK1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICB2YXIgY2IgPSBmdW5jdGlvbiBjYihlKSB7XG4gICAgICAgICAgICAgICAgZm4uY2FsbChlbGVtLCBuZXcgYXZFdmVudChlKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBhdmFsb24uX25hdGl2ZUJpbmQoZWxlbSwgdHlwZSwgY2IpO1xuICAgICAgICAgICAgcmV0dXJuIGNiO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNldEV2ZW50SWQobm9kZSwgdmFsdWUpIHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2F2YWxvbi1ldmVudHMnLCB2YWx1ZSk7XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXZhbG9uLnVuYmluZCA9IGZ1bmN0aW9uIChlbGVtLCB0eXBlLCBmbikge1xuICAgICAgICBpZiAoZWxlbS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2F2YWxvbi1ldmVudHMnKSB8fCAnJztcbiAgICAgICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLl9uYXRpdmVVbkJpbmQoZWxlbSwgdHlwZSwgZGlzcGF0Y2gpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtLnJlbW92ZUF0dHJpYnV0ZSgnYXZhbG9uLWV2ZW50cycpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQoJywnKS5maWx0ZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ci5pbmRleE9mKHR5cGUgKyAnOicpID09PSAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICBzZXRFdmVudElkKGVsZW0sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlYXJjaCA9IHR5cGUgKyAnOicgKyBmbi51dWlkO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KCcsJykuZmlsdGVyKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHIgIT09IHNlYXJjaDtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICBzZXRFdmVudElkKGVsZW0sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF2YWxvbi5ldmVudExpc3RlbmVyc1tmbi51dWlkXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdmFsb24uX25hdGl2ZVVuQmluZChlbGVtLCB0eXBlLCBmbik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHR5cGVSZWdFeHAgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGNvbGxlY3RIYW5kbGVycyhlbGVtLCB0eXBlLCBoYW5kbGVycykge1xuICAgICAgICB2YXIgdmFsdWUgPSBlbGVtLmdldEF0dHJpYnV0ZSgnYXZhbG9uLWV2ZW50cycpO1xuICAgICAgICBpZiAodmFsdWUgJiYgKGVsZW0uZGlzYWJsZWQgIT09IHRydWUgfHwgdHlwZSAhPT0gJ2NsaWNrJykpIHtcbiAgICAgICAgICAgIHZhciB1dWlkcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHJlZyA9IHR5cGVSZWdFeHBbdHlwZV0gfHwgKHR5cGVSZWdFeHBbdHlwZV0gPSBuZXcgUmVnRXhwKFwiXFxcXGJcIiArIHR5cGUgKyAnXFxcXDooW14sXFxcXHNdKyknLCAnZycpKTtcbiAgICAgICAgICAgIHZhbHVlLnJlcGxhY2UocmVnLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHV1aWRzLnB1c2goYik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh1dWlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbTogZWxlbSxcbiAgICAgICAgICAgICAgICAgICAgdXVpZHM6IHV1aWRzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICAgICAgdmFyIGcgPSBhdmFsb24uZ2VzdHVyZUV2ZW50cyB8fCB7fTtcbiAgICAgICAgaWYgKGVsZW0gJiYgZWxlbS5nZXRBdHRyaWJ1dGUgJiYgKGNhbkJ1YmJsZVVwW3R5cGVdIHx8IGdbdHlwZV0pKSB7XG4gICAgICAgICAgICBjb2xsZWN0SGFuZGxlcnMoZWxlbSwgdHlwZSwgaGFuZGxlcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJoYW5kbGVIYXNWbSA9IC9eZS87XG5cbiAgICBmdW5jdGlvbiBkaXNwYXRjaChldmVudCkge1xuICAgICAgICBldmVudCA9IG5ldyBhdkV2ZW50KGV2ZW50KTtcbiAgICAgICAgdmFyIHR5cGUgPSBldmVudC50eXBlO1xuICAgICAgICB2YXIgZWxlbSA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgdmFyIGhhbmRsZXJzID0gW107XG4gICAgICAgIGNvbGxlY3RIYW5kbGVycyhlbGVtLCB0eXBlLCBoYW5kbGVycyk7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICB1dWlkLFxuICAgICAgICAgICAgaGFuZGxlcjtcbiAgICAgICAgd2hpbGUgKChoYW5kbGVyID0gaGFuZGxlcnNbaSsrXSkgJiYgIWV2ZW50LmNhbmNlbEJ1YmJsZSkge1xuICAgICAgICAgICAgdmFyIGhvc3QgPSBldmVudC5jdXJyZW50VGFyZ2V0ID0gaGFuZGxlci5lbGVtO1xuICAgICAgICAgICAgaiA9IDA7XG4gICAgICAgICAgICB3aGlsZSAodXVpZCA9IGhhbmRsZXIudXVpZHNbaisrXSkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5zdG9wSW1tZWRpYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZm4gPSBhdmFsb24uZXZlbnRMaXN0ZW5lcnNbdXVpZF07XG4gICAgICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IHJoYW5kbGVIYXNWbS50ZXN0KHV1aWQpID8gaGFuZGxlci5lbGVtLl9tc19jb250ZXh0XyA6IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2bSAmJiB2bS4kaGFzaGNvZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhbG9uLnVuYmluZChlbGVtLCB0eXBlLCBmbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJldCA9IGZuLmNhbGwodm0gfHwgZWxlbSwgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZm9jdXNCbHVyID0ge1xuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgYmx1cjogdHJ1ZVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBkZWxlZ2F0ZUV2ZW50KHR5cGUpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcm9vdC5nZXRBdHRyaWJ1dGUoJ2RlbGVnYXRlLWV2ZW50cycpIHx8ICcnO1xuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vSUU2LTjkvJrlpJrmrKHnu5HlrprlkIznp43nsbvlnovnmoTlkIzkuIDkuKrlh73mlbAs5YW25LuW5ri46KeI5Zmo5LiN5LyaXG4gICAgICAgICAgICB2YXIgYXJyID0gdmFsdWUubWF0Y2goYXZhbG9uLnJ3b3JkKSB8fCBbXTtcbiAgICAgICAgICAgIGFyci5wdXNoKHR5cGUpO1xuICAgICAgICAgICAgcm9vdC5zZXRBdHRyaWJ1dGUoJ2RlbGVnYXRlLWV2ZW50cycsIGFyci5qb2luKCcsJykpO1xuICAgICAgICAgICAgYXZhbG9uLl9uYXRpdmVCaW5kKHJvb3QsIHR5cGUsIGRpc3BhdGNoLCAhIWZvY3VzQmx1clt0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZXZlbnRQcm90byA9IHtcbiAgICAgICAgd2Via2l0TW92ZW1lbnRZOiAxLFxuICAgICAgICB3ZWJraXRNb3ZlbWVudFg6IDEsXG4gICAgICAgIGtleUxvY2F0aW9uOiAxLFxuICAgICAgICBmaXhFdmVudDogZnVuY3Rpb24gZml4RXZlbnQoKSB7fSxcbiAgICAgICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KCkge1xuICAgICAgICAgICAgdmFyIGUgPSB0aGlzLm9yaWdpbmFsRXZlbnQgfHwge307XG4gICAgICAgICAgICBlLnJldHVyblZhbHVlID0gdGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG1vZGVybiAmJiBlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzdG9wUHJvcGFnYXRpb246IGZ1bmN0aW9uIHN0b3BQcm9wYWdhdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBlID0gdGhpcy5vcmlnaW5hbEV2ZW50IHx8IHt9O1xuICAgICAgICAgICAgZS5jYW5jZWxCdWJibGUgPSB0aGlzLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgICAgICAgICBpZiAobW9kZXJuICYmIGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uOiBmdW5jdGlvbiBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5zdG9wSW1tZWRpYXRlID0gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdbb2JqZWN0IEV2ZW50XSc7IC8vIzE2MTlcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBhdkV2ZW50KGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSBpbiBldmVudCkge1xuICAgICAgICAgICAgaWYgKCFldmVudFByb3RvW2ldKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tpXSA9IGV2ZW50W2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gZXZlbnQuc3JjRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG4gICAgICAgIHRoaXMuZml4RXZlbnQoKTtcbiAgICAgICAgdGhpcy50aW1lU3RhbXAgPSBuZXcgRGF0ZSgpIC0gMDtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEV2ZW50ID0gZXZlbnQ7XG4gICAgfVxuICAgIGF2RXZlbnQucHJvdG90eXBlID0gZXZlbnRQcm90bztcbiAgICAvL+mSiOWvuWZpcmVmb3gsIGNocm9tZeS/ruato21vdXNlZW50ZXIsIG1vdXNlbGVhdmVcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoISgnb25tb3VzZWVudGVyJyBpbiByb290KSkge1xuICAgICAgICBhdmFsb24uZWFjaCh7XG4gICAgICAgICAgICBtb3VzZWVudGVyOiAnbW91c2VvdmVyJyxcbiAgICAgICAgICAgIG1vdXNlbGVhdmU6ICdtb3VzZW91dCdcbiAgICAgICAgfSwgZnVuY3Rpb24gKG9yaWdUeXBlLCBmaXhUeXBlKSB7XG4gICAgICAgICAgICBldmVudEhvb2tzW29yaWdUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBmaXhUeXBlLFxuICAgICAgICAgICAgICAgIGZpeDogZnVuY3Rpb24gZml4KGVsZW0sIGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHQgPSBlLnJlbGF0ZWRUYXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXQgfHwgdCAhPT0gZWxlbSAmJiAhKGVsZW0uY29tcGFyZURvY3VtZW50UG9zaXRpb24odCkgJiAxNikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudHlwZSA9IG9yaWdUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvL+mSiOWvuUlFOSssIHczY+S/ruato2FuaW1hdGlvbmVuZFxuICAgIGF2YWxvbi5lYWNoKHtcbiAgICAgICAgQW5pbWF0aW9uRXZlbnQ6ICdhbmltYXRpb25lbmQnLFxuICAgICAgICBXZWJLaXRBbmltYXRpb25FdmVudDogJ3dlYmtpdEFuaW1hdGlvbkVuZCdcbiAgICB9LCBmdW5jdGlvbiAoY29uc3RydWN0LCBmaXhUeXBlKSB7XG4gICAgICAgIGlmICh3aW5kb3ckMVtjb25zdHJ1Y3RdICYmICFldmVudEhvb2tzLmFuaW1hdGlvbmVuZCkge1xuICAgICAgICAgICAgZXZlbnRIb29rcy5hbmltYXRpb25lbmQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogZml4VHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCEoXCJvbm1vdXNld2hlZWxcIiBpbiBkb2N1bWVudCQxKSkge1xuICAgICAgICAvKiBJRTYtMTEgY2hyb21lIG1vdXNld2hlZWwgd2hlZWxEZXRsYSDkuIsgLTEyMCDkuIogMTIwXG4gICAgICAgICBmaXJlZm94IERPTU1vdXNlU2Nyb2xsIGRldGFpbCDkuIszIOS4ii0zXG4gICAgICAgICBmaXJlZm94IHdoZWVsIGRldGxhWSDkuIszIOS4ii0zXG4gICAgICAgICBJRTktMTEgd2hlZWwgZGVsdGFZIOS4izQwIOS4ii00MFxuICAgICAgICAgY2hyb21lIHdoZWVsIGRlbHRhWSDkuIsxMDAg5LiKLTEwMCAqL1xuICAgICAgICB2YXIgZml4V2hlZWxUeXBlID0gZG9jdW1lbnQkMS5vbndoZWVsICE9PSB2b2lkIDAgPyAnd2hlZWwnIDogJ0RPTU1vdXNlU2Nyb2xsJztcbiAgICAgICAgdmFyIGZpeFdoZWVsRGVsdGEgPSBmaXhXaGVlbFR5cGUgPT09ICd3aGVlbCcgPyAnZGVsdGFZJyA6ICdkZXRhaWwnO1xuICAgICAgICBldmVudEhvb2tzLm1vdXNld2hlZWwgPSB7XG4gICAgICAgICAgICB0eXBlOiBmaXhXaGVlbFR5cGUsXG4gICAgICAgICAgICBmaXg6IGZ1bmN0aW9uIGZpeChlbGVtLCBmbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsdGEgPSBlW2ZpeFdoZWVsRGVsdGFdID4gMCA/IC0xMjAgOiAxMjA7XG4gICAgICAgICAgICAgICAgICAgIGUud2hlZWxEZWx0YSA9IH5+ZWxlbS5fbXNfd2hlZWxfICsgZGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIGVsZW0uX21zX3doZWVsXyA9IGUud2hlZWxEZWx0YVkgPSBlLndoZWVsRGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIGUud2hlZWxEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgJ3R5cGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdtb3VzZXdoZWVsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIW1vZGVybikge1xuICAgICAgICBkZWxldGUgY2FuQnViYmxlVXAuY2hhbmdlO1xuICAgICAgICBkZWxldGUgY2FuQnViYmxlVXAuc2VsZWN0O1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5fbmF0aXZlQmluZCA9IG1vZGVybiA/IGZ1bmN0aW9uIChlbCwgdHlwZSwgZm4sIGNhcHR1cmUpIHtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgISFjYXB0dXJlKTtcbiAgICB9IDogZnVuY3Rpb24gKGVsLCB0eXBlLCBmbikge1xuICAgICAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICAgIH07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uX25hdGl2ZVVuQmluZCA9IG1vZGVybiA/IGZ1bmN0aW9uIChlbCwgdHlwZSwgZm4sIGEpIHtcbiAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgISFhKTtcbiAgICB9IDogZnVuY3Rpb24gKGVsLCB0eXBlLCBmbikge1xuICAgICAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICAgIH07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uZmlyZURvbSA9IGZ1bmN0aW9uIChlbGVtLCB0eXBlLCBvcHRzKSB7XG4gICAgICAgIGlmIChkb2N1bWVudCQxLmNyZWF0ZUV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgaGFja0V2ZW50ID0gZG9jdW1lbnQkMS5jcmVhdGVFdmVudCgnRXZlbnRzJyk7XG4gICAgICAgICAgICBoYWNrRXZlbnQuaW5pdEV2ZW50KHR5cGUsIHRydWUsIHRydWUsIG9wdHMpO1xuICAgICAgICAgICAgYXZhbG9uLnNoYWRvd0NvcHkoaGFja0V2ZW50LCBvcHRzKTtcbiAgICAgICAgICAgIGVsZW0uZGlzcGF0Y2hFdmVudChoYWNrRXZlbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJvb3QuY29udGFpbnMoZWxlbSkpIHtcbiAgICAgICAgICAgIC8vSUU2LTjop6blj5Hkuovku7blv4Xpobvkv53or4HlnKhET03moJHkuK0s5ZCm5YiZ5oqlJ1NDUklQVDE2Mzg5OiDmnKrmjIfmmI7nmoTplJnor68nXG4gICAgICAgICAgICBoYWNrRXZlbnQgPSBkb2N1bWVudCQxLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICAgICAgICBpZiAob3B0cykgYXZhbG9uLnNoYWRvd0NvcHkoaGFja0V2ZW50LCBvcHRzKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZWxlbS5maXJlRXZlbnQoJ29uJyArIHR5cGUsIGhhY2tFdmVudCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmxvZygnZmlyZURvbScsIHR5cGUsICdhcmdzIGVycm9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHJtb3VzZUV2ZW50ID0gL14oPzptb3VzZXxjb250ZXh0bWVudXxkcmFnKXxjbGljay87XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdkV2ZW50LnByb3RvdHlwZS5maXhFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcztcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09IG51bGwgJiYgZXZlbnQudHlwZS5pbmRleE9mKCdrZXknKSA9PT0gMCkge1xuICAgICAgICAgICAgZXZlbnQud2hpY2ggPSBldmVudC5jaGFyQ29kZSAhPSBudWxsID8gZXZlbnQuY2hhckNvZGUgOiBldmVudC5rZXlDb2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChybW91c2VFdmVudC50ZXN0KGV2ZW50LnR5cGUpICYmICEoJ3BhZ2VYJyBpbiBldmVudCkpIHtcbiAgICAgICAgICAgIHZhciBET0MgPSBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCB8fCBkb2N1bWVudCQxO1xuICAgICAgICAgICAgdmFyIGJveCA9IERPQy5jb21wYXRNb2RlID09PSAnQmFja0NvbXBhdCcgPyBET0MuYm9keSA6IERPQy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgICAgICBldmVudC5wYWdlWCA9IGV2ZW50LmNsaWVudFggKyAoYm94LnNjcm9sbExlZnQgPj4gMCkgLSAoYm94LmNsaWVudExlZnQgPj4gMCk7XG4gICAgICAgICAgICBldmVudC5wYWdlWSA9IGV2ZW50LmNsaWVudFkgKyAoYm94LnNjcm9sbFRvcCA+PiAwKSAtIChib3guY2xpZW50VG9wID4+IDApO1xuICAgICAgICAgICAgZXZlbnQud2hlZWxEZWx0YVkgPSB+fmV2ZW50LndoZWVsRGVsdGE7XG4gICAgICAgICAgICBldmVudC53aGVlbERlbHRhWCA9IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy/pkojlr7lJRTYtOOS/ruato2lucHV0XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCEoJ29uaW5wdXQnIGluIGRvY3VtZW50JDEuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSkpIHtcbiAgICAgICAgZXZlbnRIb29rcy5pbnB1dCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdwcm9wZXJ0eWNoYW5nZScsXG4gICAgICAgICAgICBmaXg6IGZ1bmN0aW9uIGZpeChlbGVtLCBmbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5wcm9wZXJ0eU5hbWUgPT09ICd2YWx1ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudHlwZSA9ICdpbnB1dCc7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHJlYWR5TGlzdCA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZmlyZVJlYWR5KGZuKSB7XG4gICAgICAgIGF2YWxvbi5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUgKGZuID0gcmVhZHlMaXN0LnNoaWZ0KCkpIHtcbiAgICAgICAgICAgIGZuKGF2YWxvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhdmFsb24ucmVhZHkgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmVhZHlMaXN0LnB1c2goZm4pO1xuICAgICAgICBpZiAoYXZhbG9uLmlzUmVhZHkpIHtcbiAgICAgICAgICAgIGZpcmVSZWFkeSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGF2YWxvbi5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF2YWxvbi5zY2FuICYmIGF2YWxvbi5zY2FuKGRvY3VtZW50JDEuYm9keSk7XG4gICAgfSk7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGJvb3RzdHJhcCgpIHtcbiAgICAgICAgZnVuY3Rpb24gZG9TY3JvbGxDaGVjaygpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy9JReS4i+mAmui/h2RvU2Nyb2xsQ2hlY2vmo4DmtYtET03moJHmmK/lkKblu7rlroxcbiAgICAgICAgICAgICAgICByb290LmRvU2Nyb2xsKCdsZWZ0Jyk7XG4gICAgICAgICAgICAgICAgZmlyZVJlYWR5KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChkb1Njcm9sbENoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZG9jdW1lbnQkMS5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZpcmVSZWFkeSk7IC8v5aaC5p6c5ZyoZG9tUmVhZHnkuYvlpJbliqDovb1cbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudCQxLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50JDEuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZpcmVSZWFkeSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50JDEuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIC8v5b+F6aG75Lyg5YWl5LiJ5Liq5Y+C5pWw77yM5ZCm5YiZ5ZyoZmlyZWZveDQtMjbkuK3miqXplJlcbiAgICAgICAgICAgIC8vY2F1Z2h0IGV4Y2VwdGlvbjogW0V4Y2VwdGlvbi4uLiBcIk5vdCBlbm91Z2ggYXJndW1lbnRzXCIgIG5zcmVzdWx0OiBcIjB4XG4gICAgICAgICAgICBkb2N1bWVudCQxLmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50JDEucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgICAgICAgICBmaXJlUmVhZHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzVG9wID0gd2luZG93JDEuZnJhbWVFbGVtZW50ID09PSBudWxsO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIGlmIChyb290LmRvU2Nyb2xsICYmIGlzVG9wICYmIHdpbmRvdyQxLmV4dGVybmFsKSB7XG4gICAgICAgICAgICAgICAgLy9maXggSUUgaWZyYW1lIEJVR1xuICAgICAgICAgICAgICAgIGRvU2Nyb2xsQ2hlY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF2YWxvbi5iaW5kKHdpbmRvdyQxLCAnbG9hZCcsIGZpcmVSZWFkeSk7XG4gICAgfVxuICAgIGlmIChpbkJyb3dzZXIpIHtcbiAgICAgICAgYm9vdHN0cmFwKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIERPTSBBcGlcbiAgICAgKiBzaGltLGNsYXNzLGRhdGEsY3NzLHZhbCxodG1sLGV2ZW50LHJlYWR5ICBcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIGZyb21ET00oZG9tKSB7XG4gICAgICAgIHJldHVybiBbZnJvbSQxKGRvbSldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZyb20kMShub2RlKSB7XG4gICAgICAgIHZhciB0eXBlID0gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJyN0ZXh0JzpcbiAgICAgICAgICAgIGNhc2UgJyNjb21tZW50JzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZG9tOiBub2RlLFxuICAgICAgICAgICAgICAgICAgICBub2RlVmFsdWU6IG5vZGUubm9kZVZhbHVlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdmFyIHByb3BzID0gbWFya1Byb3BzKG5vZGUsIG5vZGUuYXR0cmlidXRlcyB8fCBbXSk7XG4gICAgICAgICAgICAgICAgdmFyIHZub2RlID0ge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZG9tOiBub2RlLFxuICAgICAgICAgICAgICAgICAgICBpc1ZvaWRUYWc6ICEhdm9pZFRhZ1t0eXBlXSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHByb3BzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ29wdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/ljbPkvr/kvaDorr7nva7kuoZvcHRpb24uc2VsZWN0ZWQgPSB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAvL29wdGlvbi5hdHRyaWJ1dGVz5Lmf5om+5LiN5Yiwc2VsZWN0ZWTlsZ7mgKdcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuc2VsZWN0ZWQgPSBub2RlLnNlbGVjdGVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3JwaGFuVGFnW3R5cGVdIHx8IHR5cGUgPT09ICdvcHRpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VPcnBoYW4odm5vZGUsIHR5cGUsIG5vZGUudGV4dCB8fCBub2RlLmlubmVySFRNTCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmNoaWxkTm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bm9kZS5jaGlsZHJlblswXS5kb20gPSBub2RlLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF2bm9kZS5pc1ZvaWRUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IG5vZGUuY2hpbGROb2Rlc1tpKytdOykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gZnJvbSQxKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgvXFxTLy50ZXN0KGNoaWxkLm5vZGVWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bm9kZS5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdm5vZGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmZvcm1FbGVtZW50ID0gL2lucHV0fHRleHRhcmVhfHNlbGVjdC9pO1xuXG4gICAgZnVuY3Rpb24gbWFya1Byb3BzKG5vZGUsIGF0dHJzKSB7XG4gICAgICAgIHZhciByZXQgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhdHRycy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdHRyID0gYXR0cnNbaV07XG4gICAgICAgICAgICBpZiAoYXR0ci5zcGVjaWZpZWQpIHtcbiAgICAgICAgICAgICAgICAvL0lFNi055LiN5Lya5bCG5bGe5oCn5ZCN5Y+Y5bCP5YaZLOavlOWmguWug+S8muWwhueUqOaIt+eahGNvbnRlbnRlZGl0YWJsZeWPmOaIkGNvbnRlbnRFZGl0YWJsZVxuICAgICAgICAgICAgICAgIHJldFthdHRyLm5hbWUudG9Mb3dlckNhc2UoKV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZm9ybUVsZW1lbnQudGVzdChub2RlLm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgcmV0LnR5cGUgPSBub2RlLnR5cGU7XG4gICAgICAgICAgICB2YXIgYSA9IG5vZGUuZ2V0QXR0cmlidXRlTm9kZSgndmFsdWUnKTtcbiAgICAgICAgICAgIGlmIChhICYmIC9cXFMvLnRlc3QoYS52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvL0lFNiw35Lit5peg5rOV5Y+W5b6XY2hlY2tib3gscmFkaW/nmoR2YWx1ZVxuICAgICAgICAgICAgICAgIHJldC52YWx1ZSA9IGEudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0eWxlID0gbm9kZS5zdHlsZS5jc3NUZXh0O1xuICAgICAgICBpZiAoc3R5bGUpIHtcbiAgICAgICAgICAgIHJldC5zdHlsZSA9IHN0eWxlO1xuICAgICAgICB9XG4gICAgICAgIC8v57G75ZCNID0g5Y676YeNKOmdmeaAgeexu+WQjSvliqjmgIHnsbvlkI0rIGhvdmVy57G75ZCNPyArIGFjdGl2Zeexu+WQjSlcbiAgICAgICAgaWYgKHJldC50eXBlID09PSAnc2VsZWN0LW9uZScpIHtcbiAgICAgICAgICAgIHJldC5zZWxlY3RlZEluZGV4ID0gbm9kZS5zZWxlY3RlZEluZGV4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gVlRleHQodGV4dCkge1xuICAgICAgICB0aGlzLm5vZGVOYW1lID0gJyN0ZXh0JztcbiAgICAgICAgdGhpcy5ub2RlVmFsdWUgPSB0ZXh0O1xuICAgIH1cblxuICAgIFZUZXh0LnByb3RvdHlwZSA9IHtcbiAgICAgICAgY29uc3RydWN0b3I6IFZUZXh0LFxuICAgICAgICB0b0RPTTogZnVuY3Rpb24gdG9ET00oKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgICAgICAgICAgaWYgKHRoaXMuZG9tKSByZXR1cm4gdGhpcy5kb207XG4gICAgICAgICAgICB2YXIgdiA9IGF2YWxvbi5fZGVjb2RlKHRoaXMubm9kZVZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRvbSA9IGRvY3VtZW50JDEuY3JlYXRlVGV4dE5vZGUodik7XG4gICAgICAgIH0sXG4gICAgICAgIHRvSFRNTDogZnVuY3Rpb24gdG9IVE1MKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZVZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIFZDb21tZW50KHRleHQpIHtcbiAgICAgICAgdGhpcy5ub2RlTmFtZSA9ICcjY29tbWVudCc7XG4gICAgICAgIHRoaXMubm9kZVZhbHVlID0gdGV4dDtcbiAgICB9XG4gICAgVkNvbW1lbnQucHJvdG90eXBlID0ge1xuICAgICAgICBjb25zdHJ1Y3RvcjogVkNvbW1lbnQsXG4gICAgICAgIHRvRE9NOiBmdW5jdGlvbiB0b0RPTSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRvbSkgcmV0dXJuIHRoaXMuZG9tO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tID0gZG9jdW1lbnQkMS5jcmVhdGVDb21tZW50KHRoaXMubm9kZVZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9IVE1MOiBmdW5jdGlvbiB0b0hUTUwoKSB7XG4gICAgICAgICAgICByZXR1cm4gJzwhLS0nICsgdGhpcy5ub2RlVmFsdWUgKyAnLS0+JztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBWRWxlbWVudCh0eXBlLCBwcm9wcywgY2hpbGRyZW4sIGlzVm9pZFRhZykge1xuICAgICAgICB0aGlzLm5vZGVOYW1lID0gdHlwZTtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHRoaXMuaXNWb2lkVGFnID0gaXNWb2lkVGFnO1xuICAgIH1cbiAgICBWRWxlbWVudC5wcm90b3R5cGUgPSB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiBWRWxlbWVudCxcbiAgICAgICAgdG9ET006IGZ1bmN0aW9uIHRvRE9NKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZG9tKSByZXR1cm4gdGhpcy5kb207XG4gICAgICAgICAgICB2YXIgZG9tLFxuICAgICAgICAgICAgICAgIHRhZ05hbWUgPSB0aGlzLm5vZGVOYW1lO1xuICAgICAgICAgICAgaWYgKGF2YWxvbi5tb2Rlcm4gJiYgc3ZnVGFnc1t0YWdOYW1lXSkge1xuICAgICAgICAgICAgICAgIGRvbSA9IGNyZWF0ZVNWRyh0YWdOYW1lKTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFhdmFsb24ubW9kZXJuICYmIChWTUxUYWdzW3RhZ05hbWVdIHx8IHJ2bWwudGVzdCh0YWdOYW1lKSkpIHtcbiAgICAgICAgICAgICAgICBkb20gPSBjcmVhdGVWTUwodGFnTmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50JDEuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHByb3BzID0gdGhpcy5wcm9wcyB8fCB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wcykge1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoc2tpcEZhbHNlQW5kRnVuY3Rpb24odmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3BlY2FsQXR0cnNbaV0gJiYgYXZhbG9uLm1zaWUgPCA4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjYWxBdHRyc1tpXShkb20sIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb20uc2V0QXR0cmlidXRlKGksIHZhbCArICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjID0gdGhpcy5jaGlsZHJlbiB8fCBbXTtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IGNbMF0gPyBjWzBdLm5vZGVWYWx1ZSA6ICcnO1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2NyaXB0JzpcbiAgICAgICAgICAgICAgICAgICAgZG9tLnR5cGUgPSAnbm9leGVjJztcbiAgICAgICAgICAgICAgICAgICAgZG9tLnRleHQgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbS5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgICAgICAgICAgZG9tLnR5cGUgPSBwcm9wcy50eXBlIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdub3NjcmlwdCc6XG4gICAgICAgICAgICAgICAgICAgIGRvbS50ZXh0Q29udGVudCA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3N0eWxlJzpcbiAgICAgICAgICAgICAgICBjYXNlICd4bXAnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RlbXBsYXRlJzpcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbS5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFja0lFKGRvbSwgdGhpcy5ub2RlTmFtZSwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ29wdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIC8vSUU2LTgs5Li6b3B0aW9u5re75Yqg5paH5pys5a2Q6IqC54K5LOS4jeS8muWQjOatpeWIsHRleHTlsZ7mgKfkuK1cbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1zaWUgPCA5KSBkb20udGV4dCA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1ZvaWRUYWcgJiYgdGhpcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjICYmIGRvbS5hcHBlbmRDaGlsZChhdmFsb24udmRvbShjLCAndG9ET00nKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRvbSA9IGRvbTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXG4gICAgICAgIHRvSFRNTDogZnVuY3Rpb24gdG9IVE1MKCkge1xuICAgICAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICAgICAgdmFyIHByb3BzID0gdGhpcy5wcm9wcyB8fCB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gcHJvcHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gcHJvcHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHNraXBGYWxzZUFuZEZ1bmN0aW9uKHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goaSArICc9JyArIGF2YWxvbi5xdW90ZShwcm9wc1tpXSArICcnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyID0gYXJyLmxlbmd0aCA/ICcgJyArIGFyci5qb2luKCcgJykgOiAnJztcbiAgICAgICAgICAgIHZhciBzdHIgPSAnPCcgKyB0aGlzLm5vZGVOYW1lICsgYXJyO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNWb2lkVGFnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ciArICcvPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHIgKz0gJz4nO1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gdGhpcy5jaGlsZHJlbi5tYXAoZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbCA/IGF2YWxvbi52ZG9tKGVsLCAndG9IVE1MJykgOiAnJztcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHIgKyAnPC8nICsgdGhpcy5ub2RlTmFtZSArICc+JztcbiAgICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gaGFja0lFKGRvbSwgbm9kZU5hbWUsIHRlbXBsYXRlKSB7XG4gICAgICAgIHN3aXRjaCAobm9kZU5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0eWxlJzpcbiAgICAgICAgICAgICAgICBkb20uc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgICAgICAgICAgICAgZG9tLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAneG1wJzogLy9JRTYtOCxYTVDlhYPntKDph4zpnaLlj6rog73mnInmlofmnKzoioLngrks5LiN6IO95L2/55SoaW5uZXJIVE1MXG4gICAgICAgICAgICBjYXNlICdub3NjcmlwdCc6XG4gICAgICAgICAgICAgICAgZG9tLnRleHRDb250ZW50ID0gdGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc2tpcEZhbHNlQW5kRnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gYSAhPT0gZmFsc2UgJiYgT2JqZWN0KGEpICE9PSBhO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHZhciBzcGVjYWxBdHRycyA9IHtcbiAgICAgICAgXCJjbGFzc1wiOiBmdW5jdGlvbiBfY2xhc3MoZG9tLCB2YWwpIHtcbiAgICAgICAgICAgIGRvbS5jbGFzc05hbWUgPSB2YWw7XG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlOiBmdW5jdGlvbiBzdHlsZShkb20sIHZhbCkge1xuICAgICAgICAgICAgZG9tLnN0eWxlLmNzc1RleHQgPSB2YWw7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6IGZ1bmN0aW9uIHR5cGUoZG9tLCB2YWwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy90ZXh0YXJlYSxidXR0b24g5YWD57Sg5ZyoSUU2LDforr7nva4gdHlwZSDlsZ7mgKfkvJrmipvplJlcbiAgICAgICAgICAgICAgICBkb20udHlwZSA9IHZhbDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH0sXG4gICAgICAgICdmb3InOiBmdW5jdGlvbiBfZm9yKGRvbSwgdmFsKSB7XG4gICAgICAgICAgICBkb20uc2V0QXR0cmlidXRlKCdmb3InLCB2YWwpO1xuICAgICAgICAgICAgZG9tLmh0bWxGb3IgPSB2YWw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlU1ZHKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50JDEuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHR5cGUpO1xuICAgIH1cbiAgICB2YXIgc3ZnVGFncyA9IGF2YWxvbi5vbmVPYmplY3QoJ2NpcmNsZSxkZWZzLGVsbGlwc2UsaW1hZ2UsbGluZSwnICsgJ3BhdGgscG9seWdvbixwb2x5bGluZSxyZWN0LHN5bWJvbCx0ZXh0LHVzZSxnLHN2ZycpO1xuXG4gICAgdmFyIHJ2bWwgPSAvXlxcdytcXDpcXHcrLztcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgZnVuY3Rpb24gY3JlYXRlVk1MKHR5cGUpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50JDEuc3R5bGVTaGVldHMubGVuZ3RoIDwgMzEpIHtcbiAgICAgICAgICAgIGRvY3VtZW50JDEuY3JlYXRlU3R5bGVTaGVldCgpLmFkZFJ1bGUoXCIucnZtbFwiLCBcImJlaGF2aW9yOnVybCgjZGVmYXVsdCNWTUwpXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbm8gbW9yZSByb29tLCBhZGQgdG8gdGhlIGV4aXN0aW5nIG9uZVxuICAgICAgICAgICAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxMTk0JTI4VlMuODUlMjkuYXNweFxuICAgICAgICAgICAgZG9jdW1lbnQkMS5zdHlsZVNoZWV0c1swXS5hZGRSdWxlKFwiLnJ2bWxcIiwgXCJiZWhhdmlvcjp1cmwoI2RlZmF1bHQjVk1MKVwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJyID0gdHlwZS5zcGxpdCgnOicpO1xuICAgICAgICBpZiAoYXJyLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgYXJyLnVuc2hpZnQoJ3YnKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGFnID0gYXJyWzFdO1xuICAgICAgICB2YXIgbnMgPSBhcnJbMF07XG4gICAgICAgIGlmICghZG9jdW1lbnQkMS5uYW1lc3BhY2VzW25zXSkge1xuICAgICAgICAgICAgZG9jdW1lbnQkMS5uYW1lc3BhY2VzLmFkZChucywgXCJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOnZtbFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQkMS5jcmVhdGVFbGVtZW50KCc8JyArIG5zICsgJzonICsgdGFnICsgJyBjbGFzcz1cInJ2bWxcIj4nKTtcbiAgICB9XG5cbiAgICB2YXIgVk1MVGFncyA9IGF2YWxvbi5vbmVPYmplY3QoJ3NoYXBlLGxpbmUscG9seWxpbmUscmVjdCxyb3VuZHJlY3Qsb3ZhbCxhcmMsJyArICdjdXJ2ZSxiYWNrZ3JvdW5kLGltYWdlLHNoYXBldHlwZSxncm91cCxmaWxsLCcgKyAnc3Ryb2tlLHNoYWRvdywgZXh0cnVzaW9uLCB0ZXh0Ym94LCBpbWFnZWRhdGEsIHRleHRwYXRoJyk7XG5cbiAgICBmdW5jdGlvbiBWRnJhZ21lbnQoY2hpbGRyZW4sIGtleSwgdmFsLCBpbmRleCkge1xuICAgICAgICB0aGlzLm5vZGVOYW1lID0gJyNkb2N1bWVudC1mcmFnbWVudCc7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgICAgIHRoaXMudmFsID0gdmFsO1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgICB9XG4gICAgVkZyYWdtZW50LnByb3RvdHlwZSA9IHtcbiAgICAgICAgY29uc3RydWN0b3I6IFZGcmFnbWVudCxcbiAgICAgICAgdG9ET006IGZ1bmN0aW9uIHRvRE9NKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZG9tKSByZXR1cm4gdGhpcy5kb207XG4gICAgICAgICAgICB2YXIgZiA9IHRoaXMudG9GcmFnbWVudCgpO1xuICAgICAgICAgICAgLy9JRTYtMTEgZG9jbWVudC1mcmFnbWVudOmDveayoeaciWNoaWxkcmVu5bGe5oCnIFxuICAgICAgICAgICAgdGhpcy5zcGxpdCA9IGYubGFzdENoaWxkO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tID0gZjtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgICAgIHRoaXMudG9GcmFnbWVudCgpO1xuICAgICAgICAgICAgdGhpcy5pbm5lclJlbmRlciAmJiB0aGlzLmlubmVyUmVuZGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIHRoaXNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0b0ZyYWdtZW50OiBmdW5jdGlvbiB0b0ZyYWdtZW50KCkge1xuICAgICAgICAgICAgdmFyIGYgPSBjcmVhdGVGcmFnbWVudCgpO1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmLmFwcGVuZENoaWxkKGF2YWxvbi52ZG9tKGVsLCAndG9ET00nKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICB9LFxuICAgICAgICB0b0hUTUw6IGZ1bmN0aW9uIHRvSFRNTCgpIHtcbiAgICAgICAgICAgIHZhciBjID0gdGhpcy5jaGlsZHJlbjtcbiAgICAgICAgICAgIHJldHVybiBjLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXZhbG9uLnZkb20oZWwsICd0b0hUTUwnKTtcbiAgICAgICAgICAgIH0pLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOiZmuaLn0RPTeeahDTlpKfmnoTpgKDlmahcbiAgICAgKi9cbiAgICBhdmFsb24ubWl4KGF2YWxvbiwge1xuICAgICAgICBWVGV4dDogVlRleHQsXG4gICAgICAgIFZDb21tZW50OiBWQ29tbWVudCxcbiAgICAgICAgVkVsZW1lbnQ6IFZFbGVtZW50LFxuICAgICAgICBWRnJhZ21lbnQ6IFZGcmFnbWVudFxuICAgIH0pO1xuXG4gICAgdmFyIGNvbnN0TmFtZU1hcCA9IHtcbiAgICAgICAgJyN0ZXh0JzogJ1ZUZXh0JyxcbiAgICAgICAgJyNkb2N1bWVudC1mcmFnbWVudCc6ICdWRnJhZ21lbnQnLFxuICAgICAgICAnI2NvbW1lbnQnOiAnVkNvbW1lbnQnXG4gICAgfTtcblxuICAgIHZhciB2ZG9tID0gYXZhbG9uLnZkb21BZGFwdG9yID0gYXZhbG9uLnZkb20gPSBmdW5jdGlvbiAob2JqLCBtZXRob2QpIHtcbiAgICAgICAgaWYgKCFvYmopIHtcbiAgICAgICAgICAgIC8vb2Jq5ZyobXMtZm9y5b6q546v6YeM6Z2i5Y+v6IO95pivbnVsbFxuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZCA9PT0gXCJ0b0hUTUxcIiA/ICcnIDogY3JlYXRlRnJhZ21lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9kZU5hbWUgPSBvYmoubm9kZU5hbWU7XG4gICAgICAgIGlmICghbm9kZU5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgYXZhbG9uLlZGcmFnbWVudChvYmopW21ldGhvZF0oKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29uc3ROYW1lID0gY29uc3ROYW1lTWFwW25vZGVOYW1lXSB8fCAnVkVsZW1lbnQnO1xuICAgICAgICByZXR1cm4gYXZhbG9uW2NvbnN0TmFtZV0ucHJvdG90eXBlW21ldGhvZF0uY2FsbChvYmopO1xuICAgIH07XG5cbiAgICBhdmFsb24uZG9taXplID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgcmV0dXJuIGF2YWxvbi52ZG9tKGEsICd0b0RPTScpO1xuICAgIH07XG5cbiAgICBhdmFsb24ucGVuZGluZ0FjdGlvbnMgPSBbXTtcbiAgICBhdmFsb24udW5pcUFjdGlvbnMgPSB7fTtcbiAgICBhdmFsb24uaW5UcmFuc2FjdGlvbiA9IDA7XG4gICAgY29uZmlnLnRyYWNrRGVwcyA9IGZhbHNlO1xuICAgIGF2YWxvbi50cmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGNvbmZpZy50cmFja0RlcHMpIHtcbiAgICAgICAgICAgIGF2YWxvbi5sb2cuYXBwbHkoYXZhbG9uLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJhdGNoIGlzIGEgcHNldWRvdHJhbnNhY3Rpb24sIGp1c3QgZm9yIHB1cnBvc2VzIG9mIG1lbW9pemluZyBDb21wdXRlZFZhbHVlcyB3aGVuIG5vdGhpbmcgZWxzZSBkb2VzLlxuICAgICAqIER1cmluZyBhIGJhdGNoIGBvbkJlY29tZVVub2JzZXJ2ZWRgIHdpbGwgYmUgY2FsbGVkIGF0IG1vc3Qgb25jZSBwZXIgb2JzZXJ2YWJsZS5cbiAgICAgKiBBdm9pZHMgdW5uZWNlc3NhcnkgcmVjYWxjdWxhdGlvbnMuXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBydW5BY3Rpb25zKCkge1xuICAgICAgICBpZiAoYXZhbG9uLmlzUnVubmluZ0FjdGlvbnMgPT09IHRydWUgfHwgYXZhbG9uLmluVHJhbnNhY3Rpb24gPiAwKSByZXR1cm47XG4gICAgICAgIGF2YWxvbi5pc1J1bm5pbmdBY3Rpb25zID0gdHJ1ZTtcbiAgICAgICAgdmFyIHRhc2tzID0gYXZhbG9uLnBlbmRpbmdBY3Rpb25zLnNwbGljZSgwLCBhdmFsb24ucGVuZGluZ0FjdGlvbnMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHRhc2s7IHRhc2sgPSB0YXNrc1tpKytdOykge1xuICAgICAgICAgICAgdGFzay51cGRhdGUoKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdmFsb24udW5pcUFjdGlvbnNbdGFzay51dWlkXTtcbiAgICAgICAgfVxuICAgICAgICBhdmFsb24uaXNSdW5uaW5nQWN0aW9ucyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZUNoYW5nZWQodGFyZ2V0KSB7XG4gICAgICAgIHZhciBsaXN0ID0gdGFyZ2V0Lm9ic2VydmVycztcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IGxpc3RbaSsrXTspIHtcbiAgICAgICAgICAgIGVsLnNjaGVkdWxlKCk7IC8v6YCa55+lYWN0aW9uLCBjb21wdXRlZOWBmuWug+S7rOivpeWBmueahOS6i1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy/lsIboh6rlt7HmipvliLDluILlnLrkuIrljZZcbiAgICBmdW5jdGlvbiByZXBvcnRPYnNlcnZlZCh0YXJnZXQpIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IGF2YWxvbi50cmFja2luZ0FjdGlvbiB8fCBudWxsO1xuICAgICAgICBpZiAoYWN0aW9uICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIGF2YWxvbi50cmFjaygn5b6B5pS25YiwJywgdGFyZ2V0LmV4cHIpO1xuICAgICAgICAgICAgYWN0aW9uLm1hcElEc1t0YXJnZXQudXVpZF0gPSB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdGFyZ2V0U3RhY2sgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGNvbGxlY3REZXBzKGFjdGlvbiwgZ2V0dGVyKSB7XG4gICAgICAgIGlmICghYWN0aW9uLm9ic2VydmVycykgcmV0dXJuO1xuICAgICAgICB2YXIgcHJlQWN0aW9uID0gYXZhbG9uLnRyYWNraW5nQWN0aW9uO1xuICAgICAgICBpZiAocHJlQWN0aW9uKSB7XG4gICAgICAgICAgICB0YXJnZXRTdGFjay5wdXNoKHByZUFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgYXZhbG9uLnRyYWNraW5nQWN0aW9uID0gYWN0aW9uO1xuICAgICAgICBhdmFsb24udHJhY2soJ+OAkGFjdGlvbuOAkScsIGFjdGlvbi50eXBlLCBhY3Rpb24uZXhwciwgJ+W8gOWni+W+geaUtuS+nei1lumhuScpO1xuICAgICAgICAvL+WkmuS4qm9ic2VydmXmjIHmnInlkIzkuIDkuKphY3Rpb25cbiAgICAgICAgYWN0aW9uLm1hcElEcyA9IHt9OyAvL+mHjeaWsOaUtumbhuS+nei1llxuICAgICAgICB2YXIgaGFzRXJyb3IgPSB0cnVlLFxuICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0gZ2V0dGVyLmNhbGwoYWN0aW9uKTtcbiAgICAgICAgICAgIGhhc0Vycm9yID0gZmFsc2U7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoaGFzRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24ud2FybignY29sbGVjdERlcHMgZmFpbCcsIGdldHRlciArICcnKTtcbiAgICAgICAgICAgICAgICBhY3Rpb24ubWFwSURzID0ge307XG4gICAgICAgICAgICAgICAgYXZhbG9uLnRyYWNraW5nQWN0aW9uID0gcHJlQWN0aW9uO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL8Kg56Gu5L+d5a6D5oC75piv5Li6bnVsbFxuICAgICAgICAgICAgICAgIGF2YWxvbi50cmFja2luZ0FjdGlvbiA9IHRhcmdldFN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0RGVwcyhhY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0RGVwcyhhY3Rpb24pIHtcbiAgICAgICAgdmFyIHByZXYgPSBhY3Rpb24ub2JzZXJ2ZXJzLFxuICAgICAgICAgICAgY3VyciA9IFtdLFxuICAgICAgICAgICAgY2hlY2tlZCA9IHt9LFxuICAgICAgICAgICAgaWRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgaW4gYWN0aW9uLm1hcElEcykge1xuICAgICAgICAgICAgdmFyIGRlcCA9IGFjdGlvbi5tYXBJRHNbaV07XG4gICAgICAgICAgICBpZiAoIWRlcC5pc0FjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmICghZGVwLm9ic2VydmVycykge1xuICAgICAgICAgICAgICAgICAgICAvL+WmguaenOWug+W3sue7j+iiq+mUgOavgVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYWN0aW9uLm1hcElEc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkcy5wdXNoKGRlcC51dWlkKTtcbiAgICAgICAgICAgICAgICBjdXJyLnB1c2goZGVwKTtcbiAgICAgICAgICAgICAgICBjaGVja2VkW2RlcC51dWlkXSA9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGRlcC5sYXN0QWNjZXNzZWRCeSA9PT0gYWN0aW9uLnV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlcC5sYXN0QWNjZXNzZWRCeSA9IGFjdGlvbi51dWlkO1xuICAgICAgICAgICAgICAgIGF2YWxvbi5BcnJheS5lbnN1cmUoZGVwLm9ic2VydmVycywgYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgaWRzID0gaWRzLnNvcnQoKS5qb2luKCcsJyk7XG4gICAgICAgIGlmIChpZHMgPT09IGFjdGlvbi5pZHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb24uaWRzID0gaWRzO1xuICAgICAgICBpZiAoIWFjdGlvbi5pc0NvbXB1dGVkKSB7XG4gICAgICAgICAgICBhY3Rpb24ub2JzZXJ2ZXJzID0gY3VycjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdGlvbi5kZXBzQ291bnQgPSBjdXJyLmxlbmd0aDtcbiAgICAgICAgICAgIGFjdGlvbi5kZXBzID0gYXZhbG9uLm1peCh7fSwgYWN0aW9uLm1hcElEcyk7XG4gICAgICAgICAgICBhY3Rpb24uZGVwc1ZlcnNpb24gPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pIGluIGFjdGlvbi5tYXBJRHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2RlcCA9IGFjdGlvbi5tYXBJRHNbX2ldO1xuICAgICAgICAgICAgICAgIGFjdGlvbi5kZXBzVmVyc2lvbltfZGVwLnV1aWRdID0gX2RlcC52ZXJzaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgX2kyID0gMCwgX2RlcDI7IF9kZXAyID0gcHJldltfaTIrK107KSB7XG4gICAgICAgICAgICBpZiAoIWNoZWNrZWRbX2RlcDIudXVpZF0pIHtcbiAgICAgICAgICAgICAgICBhdmFsb24uQXJyYXkucmVtb3ZlKF9kZXAyLm9ic2VydmVycywgYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zYWN0aW9uKGFjdGlvbiwgdGhpc0FyZywgYXJncykge1xuICAgICAgICBhcmdzID0gYXJncyB8fCBbXTtcbiAgICAgICAgdmFyIG5hbWUgPSAndHJhbnNhY3Rpb24gJyArIChhY3Rpb24ubmFtZSB8fCBhY3Rpb24uZGlzcGxheU5hbWUgfHwgJ25vb3AnKTtcbiAgICAgICAgdHJhbnNhY3Rpb25TdGFydChuYW1lKTtcbiAgICAgICAgdmFyIHJlcyA9IGFjdGlvbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgdHJhbnNhY3Rpb25FbmQobmFtZSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGF2YWxvbi50cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uO1xuXG4gICAgZnVuY3Rpb24gdHJhbnNhY3Rpb25TdGFydChuYW1lKSB7XG4gICAgICAgIGF2YWxvbi5pblRyYW5zYWN0aW9uICs9IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNhY3Rpb25FbmQobmFtZSkge1xuICAgICAgICBpZiAoLS1hdmFsb24uaW5UcmFuc2FjdGlvbiA9PT0gMCkge1xuICAgICAgICAgICAgYXZhbG9uLmlzUnVubmluZ0FjdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIHJ1bkFjdGlvbnMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBrZXlNYXAgPSBhdmFsb24ub25lT2JqZWN0KFwiYnJlYWssY2FzZSxjYXRjaCxjb250aW51ZSxkZWJ1Z2dlcixkZWZhdWx0LGRlbGV0ZSxkbyxlbHNlLGZhbHNlLFwiICsgXCJmaW5hbGx5LGZvcixmdW5jdGlvbixpZixpbixpbnN0YW5jZW9mLG5ldyxudWxsLHJldHVybixzd2l0Y2gsdGhpcyxcIiArIFwidGhyb3csdHJ1ZSx0cnksdHlwZW9mLHZhcix2b2lkLHdoaWxlLHdpdGgsXCIgKyAvKiDlhbPplK7lrZcqL1xuICAgIFwiYWJzdHJhY3QsYm9vbGVhbixieXRlLGNoYXIsY2xhc3MsY29uc3QsZG91YmxlLGVudW0sZXhwb3J0LGV4dGVuZHMsXCIgKyBcImZpbmFsLGZsb2F0LGdvdG8saW1wbGVtZW50cyxpbXBvcnQsaW50LGludGVyZmFjZSxsb25nLG5hdGl2ZSxcIiArIFwicGFja2FnZSxwcml2YXRlLHByb3RlY3RlZCxwdWJsaWMsc2hvcnQsc3RhdGljLHN1cGVyLHN5bmNocm9uaXplZCxcIiArIFwidGhyb3dzLHRyYW5zaWVudCx2b2xhdGlsZVwiKTtcblxuICAgIHZhciBza2lwTWFwID0gYXZhbG9uLm1peCh7XG4gICAgICAgIE1hdGg6IDEsXG4gICAgICAgIERhdGU6IDEsXG4gICAgICAgICRldmVudDogMSxcbiAgICAgICAgd2luZG93OiAxLFxuICAgICAgICBfX3Ztb2RlbF9fOiAxLFxuICAgICAgICBhdmFsb246IDFcbiAgICB9LCBrZXlNYXApO1xuXG4gICAgdmFyIHJ2bUtleSA9IC8oXnxbXlxcd1xcdTAwYzAtXFx1RkZGRl9dKShAfCMjKSg/PVskXFx3XSkvZztcbiAgICB2YXIgcnVzZWxlc3NTcCA9IC9cXHMqKFxcLnxcXHwpXFxzKi9nO1xuICAgIHZhciByc2hvcnRDaXJjdWl0ID0gL1xcfFxcfC9nO1xuICAgIHZhciBicmFja2V0cyA9IC9cXCgoW14pXSopXFwpLztcbiAgICB2YXIgcnBpcGVsaW5lID0gL1xcfCg/PVxcP1xcPykvO1xuICAgIHZhciBycmVnZXhwID0gLyhefFteL10pXFwvKD8hXFwvKShcXFsuKz9dfFxcXFwufFteL1xcXFxcXHJcXG5dKStcXC9bZ2lteXVdezAsNX0oPz1cXHMqKCR8W1xcclxcbiwuO30pXSkpL2c7XG4gICAgdmFyIHJvYmplY3RQcm9wID0gL1xcLltcXHdcXC5cXCRdKy9nOyAvL+WvueixoeeahOWxnuaApyBlbC54eHgg5Lit55qEeHh4XG4gICAgdmFyIHJvYmplY3RLZXkgPSAvKFxce3xcXCwpXFxzKihbXFwkXFx3XSspXFxzKjovZzsgLy/lr7nosaHnmoTplK7lkI3kuI7lhpLlj7cge3h4eDoxLHl5eTogMn3kuK3nmoR4eHgsIHl5eVxuICAgIHZhciByZmlsdGVyTmFtZSA9IC9cXHwoXFx3KykvZztcbiAgICB2YXIgcmxvY2FsVmFyID0gL1skYS16QS1aX11bJGEtekEtWjAtOV9dKi9nO1xuXG4gICAgdmFyIGV4cHJDYWNoZSA9IG5ldyBDYWNoZSgzMDApO1xuXG4gICAgZnVuY3Rpb24gYWRkU2NvcGVGb3JMb2NhbChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJvYmplY3RQcm9wLCBkaWcpLnJlcGxhY2UocmxvY2FsVmFyLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGlmICghc2tpcE1hcFtlbF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJfX3Ztb2RlbF9fLlwiICsgZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZFNjb3BlKGV4cHIsIHR5cGUpIHtcbiAgICAgICAgdmFyIGNhY2hlS2V5ID0gZXhwciArICc6JyArIHR5cGU7XG4gICAgICAgIHZhciBjYWNoZSA9IGV4cHJDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgICAgICBpZiAoY2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZS5zbGljZSgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0cmluZ1Bvb2wubWFwID0ge307XG4gICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL1J1YnlMb3V2cmUvYXZhbG9uL2lzc3Vlcy8xODQ5XG4gICAgICAgIHZhciBpbnB1dCA9IGV4cHIucmVwbGFjZShycmVnZXhwLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGIgKyBkaWcoYS5zbGljZShiLmxlbmd0aCkpO1xuICAgICAgICB9KTsgLy/np7vpmaTmiYDmnInmraPliJlcbiAgICAgICAgaW5wdXQgPSBjbGVhclN0cmluZyhpbnB1dCk7IC8v56e76Zmk5omA5pyJ5a2X56ym5LiyXG4gICAgICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZShyc2hvcnRDaXJjdWl0LCBkaWcpLiAvL+enu+mZpOaJgOacieefrei3r+i/kOeul+esplxuICAgICAgICByZXBsYWNlKHJ1c2VsZXNzU3AsICckMScpLiAvL+enu+mZpC585Lik56uv56m655m9XG5cbiAgICAgICAgcmVwbGFjZShyb2JqZWN0S2V5LCBmdW5jdGlvbiAoXywgYSwgYikge1xuICAgICAgICAgICAgLy/np7vpmaTmiYDmnInplK7lkI1cbiAgICAgICAgICAgIHJldHVybiBhICsgZGlnKGIpICsgJzonOyAvL+avlOWmgiBtcy13aWRnZXQ9XCJbe2lzOidtcy1hZGRyZXNzLXdyYXAnLCAkaWQ6J2FkZHJlc3MnfV1cIui/meagt+aegeerr+eahOaDheWGtSBcbiAgICAgICAgfSkucmVwbGFjZShydm1LZXksICckMV9fdm1vZGVsX18uJykuIC8v6L2s5o2iQOS4jiMj5Li6X192bW9kZWxfX1xuICAgICAgICByZXBsYWNlKHJmaWx0ZXJOYW1lLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgLy/np7vpmaTmiYDmnInov4fmu6TlmajnmoTlkI3lrZdcbiAgICAgICAgICAgIHJldHVybiAnfCcgKyBkaWcoYik7XG4gICAgICAgIH0pO1xuICAgICAgICBpbnB1dCA9IGFkZFNjb3BlRm9yTG9jYWwoaW5wdXQpOyAvL+WcqOacrOWcsOWPmOmHj+WJjea3u+WKoF9fdm1vZGVsX19cblxuICAgICAgICB2YXIgZmlsdGVycyA9IGlucHV0LnNwbGl0KHJwaXBlbGluZSk7IC8v5qC55o2u566h6YGT56ym5YiH5Ymy6KGo6L6+5byPXG4gICAgICAgIHZhciBib2R5ID0gZmlsdGVycy5zaGlmdCgpLnJlcGxhY2UocmZpbGwsIGZpbGwpLnRyaW0oKTtcbiAgICAgICAgaWYgKC9cXD9cXD9cXGQvLnRlc3QoYm9keSkpIHtcbiAgICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UocmZpbGwsIGZpbGwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgZmlsdGVycyA9IGZpbHRlcnMubWFwKGZ1bmN0aW9uIChmaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnJhY2tldEFyZ3MgPSAnJztcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBmaWx0ZXIucmVwbGFjZShicmFja2V0cywgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9cXFMvLnRlc3QoYikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYWNrZXRBcmdzICs9ICcsJyArIGI7IC8v6L+Y5Y6f5a2X56ym5LiyLOato+WImSznn63ot6/ov5DnrpfnrKZcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGFyZyA9ICdbJyArIGF2YWxvbi5xdW90ZShmaWx0ZXIudHJpbSgpKSArIGJyYWNrZXRBcmdzICsgJ10nO1xuICAgICAgICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZpbHRlcnMgPSAnYXZhbG9uLmNvbXBvc2VGaWx0ZXJzKCcgKyBmaWx0ZXJzICsgJykoX192YWx1ZV9fKSc7XG4gICAgICAgICAgICBmaWx0ZXJzID0gZmlsdGVycy5yZXBsYWNlKHJmaWxsLCBmaWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbHRlcnMgPSAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXhwckNhY2hlLnB1dChjYWNoZUtleSwgW2JvZHksIGZpbHRlcnNdKTtcbiAgICB9XG4gICAgdmFyIHJoYW5kbGVOYW1lID0gL15fX3Ztb2RlbF9fXFwuWyRcXHdcXC5dKyQvO1xuICAgIHZhciByZml4SUU2NzggPSAvX192bW9kZWxfX1xcLihbXihdKylcXCgoW14pXSopXFwpLztcbiAgICBmdW5jdGlvbiBtYWtlSGFuZGxlKGJvZHkpIHtcbiAgICAgICAgaWYgKHJoYW5kbGVOYW1lLnRlc3QoYm9keSkpIHtcbiAgICAgICAgICAgIGJvZHkgPSBib2R5ICsgJygkZXZlbnQpJztcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKG1zaWUgPCA5KSB7XG4gICAgICAgICAgICBib2R5ID0gYm9keS5yZXBsYWNlKHJmaXhJRTY3OCwgZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ19fdm1vZGVsX18uJyArIGIgKyAnLmNhbGwoX192bW9kZWxfXycgKyAoL1xcUy8udGVzdChjKSA/ICcsJyArIGMgOiAnJykgKyAnKSc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlR2V0dGVyKGV4cHIsIHR5cGUpIHtcbiAgICAgICAgdmFyIGFyciA9IGFkZFNjb3BlKGV4cHIsIHR5cGUpLFxuICAgICAgICAgICAgYm9keTtcbiAgICAgICAgaWYgKCFhcnJbMV0pIHtcbiAgICAgICAgICAgIGJvZHkgPSBhcnJbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gYXJyWzFdLnJlcGxhY2UoL19fdmFsdWVfX1xcKSQvLCBhcnJbMF0gKyAnKScpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfX3Ztb2RlbF9fJywgJ3JldHVybiAnICsgYm9keSArICc7Jyk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBhdmFsb24ubG9nKCdwYXJzZSBnZXR0ZXI6IFsnLCBleHByLCBib2R5LCAnXWVycm9yJyk7XG4gICAgICAgICAgICByZXR1cm4gYXZhbG9uLm5vb3A7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnlJ/miJDooajovr7lvI/orr7lgLzlh73mlbBcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBleHByXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlU2V0dGVyKGV4cHIsIHR5cGUpIHtcbiAgICAgICAgdmFyIGFyciA9IGFkZFNjb3BlKGV4cHIsIHR5cGUpO1xuICAgICAgICB2YXIgYm9keSA9ICd0cnl7ICcgKyBhcnJbMF0gKyAnID0gX192YWx1ZV9ffWNhdGNoKGUpe30nO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbignX192bW9kZWxfXycsICdfX3ZhbHVlX18nLCBib2R5ICsgJzsnKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGF2YWxvbi5sb2coJ3BhcnNlIHNldHRlcjogJywgZXhwciwgJyBlcnJvcicpO1xuICAgICAgICAgICAgcmV0dXJuIGF2YWxvbi5ub29wO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFjdGlvblVVSUQgPSAxO1xuICAgIC8v6ZyA6KaB6YeN5p6EXG4gICAgZnVuY3Rpb24gQWN0aW9uKHZtLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChwcm90ZWN0ZWRNZW5iZXJzW2ldICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tpXSA9IG9wdGlvbnNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZtID0gdm07XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzID0gW107XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy51dWlkID0gKythY3Rpb25VVUlEO1xuICAgICAgICB0aGlzLmlkcyA9ICcnO1xuICAgICAgICB0aGlzLm1hcElEcyA9IHt9OyAvL+i/meS4queUqOS6juWOu+mHjVxuICAgICAgICB0aGlzLmlzQWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgdmFyIGV4cHIgPSB0aGlzLmV4cHI7XG4gICAgICAgIC8vIOe8k+WtmOWPluWAvOWHveaVsFxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZ2V0dGVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLmdldHRlciA9IGNyZWF0ZUdldHRlcihleHByLCB0aGlzLnR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOe8k+WtmOiuvuWAvOWHveaVsO+8iOWPjOWQkeaVsOaNrue7keWumu+8iVxuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZHVwbGV4Jykge1xuICAgICAgICAgICAgdGhpcy5zZXR0ZXIgPSBjcmVhdGVTZXR0ZXIoZXhwciwgdGhpcy50eXBlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyDnvJPlrZjooajovr7lvI/ml6flgLxcbiAgICAgICAgdGhpcy52YWx1ZSA9IE5hTjtcbiAgICAgICAgLy8g6KGo6L6+5byP5Yid5aeL5YC8ICYg5o+Q5Y+W5L6d6LWWXG4gICAgICAgIGlmICghdGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5nZXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEFjdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbiBnZXRWYWx1ZSgpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXMudm07XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldHRlci5jYWxsKHNjb3BlLCBzY29wZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmxvZyh0aGlzLmdldHRlciArICcgZXhlYyBlcnJvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXRWYWx1ZTogZnVuY3Rpb24gc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXMudm07XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRlci5jYWxsKHNjb3BlLCBzY29wZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLy8gZ2V0IC0tPiBnZXRWYWx1ZSAtLT4gZ2V0dGVyXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KGZuKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9ICdhY3Rpb24gdHJhY2sgJyArIHRoaXMudHlwZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZGVlcCkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5kZWVwQ29sbGVjdCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3REZXBzKHRoaXMsIHRoaXMuZ2V0VmFsdWUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVlcCAmJiBhdmFsb24uZGVlcENvbGxlY3QpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24uZGVlcENvbGxlY3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOabtOaWsOinhuWbvuWJjeS/neWtmOWOn+acieeahHZhbHVlXG4gICAgICAgICAqL1xuICAgICAgICBiZWZvcmVVcGRhdGU6IGZ1bmN0aW9uIGJlZm9yZVVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHZhciB2ID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9sZFZhbHVlID0gdiAmJiB2LiRldmVudHMgPyB2LiRtb2RlbCA6IHY7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGFyZ3MsIHV1aWQpIHtcbiAgICAgICAgICAgIHZhciBvbGRWYWwgPSB0aGlzLmJlZm9yZVVwZGF0ZSgpO1xuICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IHRoaXMudmFsdWUgPSB0aGlzLmdldCgpO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFjaztcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0aGlzLmRpZmYobmV3VmFsLCBvbGRWYWwsIGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLnZtLCB0aGlzLnZhbHVlLCBvbGRWYWwsIHRoaXMuZXhwcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9pc1NjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBzY2hlZHVsZTogZnVuY3Rpb24gc2NoZWR1bGUoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU2NoZWR1bGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICghYXZhbG9uLnVuaXFBY3Rpb25zW3RoaXMudXVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLnVuaXFBY3Rpb25zW3RoaXMudXVpZF0gPSAxO1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24ucGVuZGluZ0FjdGlvbnMucHVzaCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBydW5BY3Rpb25zKCk7IC8v6L+Z6YeM5Lya6L+Y5Y6fX2lzU2NoZWR1bGVkXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlRGVwZW5kczogZnVuY3Rpb24gcmVtb3ZlRGVwZW5kcygpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24gKGRlcGVuZCkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5BcnJheS5yZW1vdmUoZGVwZW5kLm9ic2VydmVycywgc2VsZik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmr5TovoPkuKTkuKrorqHnrpflgLzmmK/lkKYs5LiA6Ie0LOWcqGZvciwgY2xhc3PnrYnog73lpI3mnYLmlbDmja7nsbvlnovnmoTmjIfku6TkuK0s5a6D5Lus5Lya6YeN5YaZZGlmZuWkjeazlVxuICAgICAgICAgKi9cbiAgICAgICAgZGlmZjogZnVuY3Rpb24gZGlmZihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYSAhPT0gYjtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDplIDmr4HmjIfku6RcbiAgICAgICAgICovXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uIGRpc3Bvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRGVwZW5kcygpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlRGlzcG9zZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmVmb3JlRGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHByb3RlY3RlZE1lbmJlcnMgPSB7XG4gICAgICAgIHZtOiAxLFxuICAgICAgICBjYWxsYmFjazogMSxcblxuICAgICAgICBvYnNlcnZlcnM6IDEsXG4gICAgICAgIG9sZFZhbHVlOiAxLFxuICAgICAgICB2YWx1ZTogMSxcbiAgICAgICAgZ2V0VmFsdWU6IDEsXG4gICAgICAgIHNldFZhbHVlOiAxLFxuICAgICAgICBnZXQ6IDEsXG5cbiAgICAgICAgcmVtb3ZlRGVwZW5kczogMSxcbiAgICAgICAgYmVmb3JlVXBkYXRlOiAxLFxuICAgICAgICB1cGRhdGU6IDEsXG4gICAgICAgIC8vZGlmZlxuICAgICAgICAvL2dldHRlclxuICAgICAgICAvL3NldHRlclxuICAgICAgICAvL2V4cHJcbiAgICAgICAgLy92ZG9tXG4gICAgICAgIC8vdHlwZTogXCJmb3JcIlxuICAgICAgICAvL25hbWU6IFwibXMtZm9yXCJcbiAgICAgICAgLy9hdHRyTmFtZTogXCI6Zm9yXCJcbiAgICAgICAgLy9wYXJhbTogXCJjbGlja1wiXG4gICAgICAgIC8vYmVmb3JlRGlzcG9zZVxuICAgICAgICBkaXNwb3NlOiAxXG4gICAgfTtcblxuICAgIC8qKlxuICAgICogXG4gICAgIOS4jkNvbXB1dGVk562J5YWx5LqrVVVJRFxuICAgICovXG4gICAgdmFyIG9iaWQgPSAxO1xuICAgIGZ1bmN0aW9uIE11dGF0aW9uKGV4cHIsIHZhbHVlLCB2bSkge1xuICAgICAgICAvL+aehOmAoOWHveaVsFxuICAgICAgICB0aGlzLmV4cHIgPSBleHByO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZFZtID0gcGxhdGZvcm0uY3JlYXRlUHJveHkodmFsdWUsIHRoaXMpO1xuICAgICAgICAgICAgaWYgKGNoaWxkVm0pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNoaWxkVm07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnZtID0gdm07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2bS4kbXV0YXRpb25zW2V4cHJdID0gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoaWdub3JlSUUpIHt9XG4gICAgICAgIHRoaXMudXVpZCA9ICsrb2JpZDtcbiAgICAgICAgdGhpcy51cGRhdGVWZXJzaW9uKCk7XG4gICAgICAgIHRoaXMubWFwSURzID0ge307XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzID0gW107XG4gICAgfVxuXG4gICAgTXV0YXRpb24ucHJvdG90eXBlID0ge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIGlmIChhdmFsb24udHJhY2tpbmdBY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3QoKTsgLy/ooqvmlLbpm4ZcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRPYiA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkT2IgJiYgY2hpbGRPYi4kZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkT2IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE9iLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLiRldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS4kZXZlbnRzLl9fZGVwX18uY29sbGVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF2YWxvbi5kZWVwQ29sbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGNoaWxkT2IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRPYi5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2xsZWN0SXQgPSBjaGlsZE9iW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbGxlY3Q6IGZ1bmN0aW9uIGNvbGxlY3QoKSB7XG4gICAgICAgICAgICBhdmFsb24udHJhY2sobmFtZSwgJ+iiq+aUtumbhicpO1xuICAgICAgICAgICAgcmVwb3J0T2JzZXJ2ZWQodGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZVZlcnNpb246IGZ1bmN0aW9uIHVwZGF0ZVZlcnNpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnZlcnNpb24gPSBNYXRoLnJhbmRvbSgpICsgTWF0aC5yYW5kb20oKTtcbiAgICAgICAgfSxcbiAgICAgICAgbm90aWZ5OiBmdW5jdGlvbiBub3RpZnkoKSB7XG4gICAgICAgICAgICB0cmFuc2FjdGlvblN0YXJ0KCk7XG4gICAgICAgICAgICBwcm9wYWdhdGVDaGFuZ2VkKHRoaXMpO1xuICAgICAgICAgICAgdHJhbnNhY3Rpb25FbmQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICBpZiAobmV3VmFsdWUgIT09IG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF2YWxvbi5pc09iamVjdChuZXdWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhhc2ggPSBvbGRWYWx1ZSAmJiBvbGRWYWx1ZS4kaGFzaGNvZGU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZFZNID0gcGxhdGZvcm0uY3JlYXRlUHJveHkobmV3VmFsdWUsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRWTSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFZNLiRoYXNoY29kZSA9IGhhc2g7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IGNoaWxkVk07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVmVyc2lvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0Qm9keShmbikge1xuICAgICAgICB2YXIgZW50aXJlID0gZm4udG9TdHJpbmcoKTtcbiAgICAgICAgcmV0dXJuIGVudGlyZS5zdWJzdHJpbmcoZW50aXJlLmluZGV4T2YoJ3t9JykgKyAxLCBlbnRpcmUubGFzdEluZGV4T2YoJ30nKSk7XG4gICAgfVxuICAgIC8v5aaC5p6c5LiN5a2Y5Zyo5LiJ55uuLGlmLOaWueazlVxuICAgIHZhciBpbnN0YWJpbGl0eSA9IC8oXFw/fGlmXFxifFxcKC4rXFwpKS87XG5cbiAgICBmdW5jdGlvbiBfX2NyZWF0ZShvKSB7XG4gICAgICAgIHZhciBfXyA9IGZ1bmN0aW9uIF9fKCkge307XG4gICAgICAgIF9fLnByb3RvdHlwZSA9IG87XG4gICAgICAgIHJldHVybiBuZXcgX18oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfX2V4dGVuZHMoY2hpbGQsIHBhcmVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFyIHByb3RvID0gY2hpbGQucHJvdG90eXBlID0gX19jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG4gICAgICAgICAgICBwcm90by5jb25zdHJ1Y3RvciA9IGNoaWxkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBDb21wdXRlZCA9IGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKENvbXB1dGVkLCBfc3VwZXIpO1xuXG4gICAgICAgIGZ1bmN0aW9uIENvbXB1dGVkKG5hbWUsIG9wdGlvbnMsIHZtKSB7XG4gICAgICAgICAgICAvL+aehOmAoOWHveaVsFxuICAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcywgbmFtZSwgdW5kZWZpbmVkLCB2bSk7XG4gICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5nZXQ7XG4gICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5zZXQ7XG5cbiAgICAgICAgICAgIGF2YWxvbi5taXgodGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLmRlcHMgPSB7fTtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdjb21wdXRlZCc7XG4gICAgICAgICAgICB0aGlzLmRlcHNWZXJzaW9uID0ge307XG4gICAgICAgICAgICB0aGlzLmlzQ29tcHV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy50cmFja0FuZENvbXB1dGUoKTtcbiAgICAgICAgICAgIGlmICghKCdpc1N0YWJsZScgaW4gdGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3RhYmxlID0gIWluc3RhYmlsaXR5LnRlc3QoZ2V0Qm9keSh0aGlzLmdldHRlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBjcCA9IENvbXB1dGVkLnByb3RvdHlwZTtcbiAgICAgICAgY3AudHJhY2tBbmRDb21wdXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNTdGFibGUgJiYgdGhpcy5kZXBzQ291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0RGVwcyh0aGlzLCB0aGlzLmdldFZhbHVlLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNwLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUgPSB0aGlzLmdldHRlci5jYWxsKHRoaXMudm0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNwLnNjaGVkdWxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVycyA9IHRoaXMub2JzZXJ2ZXJzO1xuICAgICAgICAgICAgdmFyIGkgPSBvYnNlcnZlcnMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIHZhciBkID0gb2JzZXJ2ZXJzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChkLnNjaGVkdWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGQuc2NoZWR1bGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY3Auc2hvdWxkQ29tcHV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzU3RhYmxlKSB7XG4gICAgICAgICAgICAgICAgLy/lpoLmnpzlj5jliqjlm6DlrZDnoa7lrpos6YKj5LmI5Y+q5q+U6L6D5Y+Y5Yqo5Zug5a2Q55qE54mI5pysXG4gICAgICAgICAgICAgICAgdmFyIHRvQ29tcHV0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMuZGVwcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kZXBzW2ldLnZlcnNpb24gIT09IHRoaXMuZGVwc1ZlcnNpb25baV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvQ29tcHV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBzW2ldLnZlcnNpb24gPSB0aGlzLmRlcHNWZXJzaW9uW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0b0NvbXB1dGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIGNwLnNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRlcikge1xuICAgICAgICAgICAgICAgIGF2YWxvbi50cmFuc2FjdGlvbih0aGlzLnNldHRlciwgdGhpcy52bSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY3AuZ2V0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvL+W9k+iiq+iuvue9ruS6huWwseS4jeeos+WumizlvZPlroPooqvorr/pl67kuobkuIDmrKHlsLHmmK/nqLPlrppcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zaG91bGRDb21wdXRlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNrQW5kQ29tcHV0ZSgpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjb21wdXRlZCAyIOWIhuaUrycpXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWZXJzaW9uKCk7XG4gICAgICAgICAgICAgICAgLy8gIHRoaXMucmVwb3J0Q2hhbmdlZCgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v5LiL6Z2i6L+Z5LiA6KGM5aW95YOP5rKh55SoXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIENvbXB1dGVkO1xuICAgIH0oTXV0YXRpb24pO1xuXG4gICAgLyoqXG4gICAgICog6L+Z6YeM5pS+572uVmlld01vZGVs5qih5Z2X55qE5YWx55So5pa55rOVXG4gICAgICogYXZhbG9uLmRlZmluZTog5YWo5qGG5p625pyA6YeN6KaB55qE5pa55rOVLOeUn+aIkOeUqOaIt1ZNXG4gICAgICogSVByb3h5LCDln7rmnKznlKjmiLfmlbDmja7kuqfnlJ/nmoTkuIDkuKrmlbDmja7lr7nosaEs5Z+65LqOJG1vZGVs5LiOdm1vZGVs5LmL6Ze055qE5b2i5oCBXG4gICAgICogbW9kZWxGYWN0b3J5OiDnlJ/miJDnlKjmiLdWTVxuICAgICAqIGNhbkhpamFjazog5Yik5a6a5q2k5bGe5oCn5piv5ZCm6K+l6KKr5Yqr5oyBLOWKoOWFpeaVsOaNruebkeWQrOS4juWIhuWPkeeahOeahOmAu+i+kVxuICAgICAqIGNyZWF0ZVByb3h5OiBsaXN0RmFjdG9yeeS4jm1vZGVsRmFjdG9yeeeahOWwgeijhVxuICAgICAqIGNyZWF0ZUFjY2Vzc29yOiDlrp7njrDmlbDmja7nm5HlkKzkuI7liIblj5HnmoTph43opoHlr7nosaFcbiAgICAgKiBpdGVtRmFjdG9yeTogbXMtZm9y5b6q546v5Lit5Lqn55Sf55qE5Luj55CGVk3nmoTnlJ/miJDlt6XljoJcbiAgICAgKiBmdXNlRmFjdG9yeTog5Lik5LiqbXMtY29udHJvbGxlcumXtOS6p+eUn+eahOS7o+eQhlZN55qE55Sf5oiQ5bel5Y6CXG4gICAgICovXG5cbiAgICBhdmFsb24uZGVmaW5lID0gZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICAgICAgdmFyICRpZCA9IGRlZmluaXRpb24uJGlkO1xuICAgICAgICBpZiAoISRpZCkge1xuICAgICAgICAgICAgYXZhbG9uLmVycm9yKCd2bS4kaWQgbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXZhbG9uLnZtb2RlbHNbJGlkXSkge1xuICAgICAgICAgICAgYXZhbG9uLndhcm4oJ2Vycm9yOlsnICsgJGlkICsgJ10gaGFkIGRlZmluZWQhJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZtID0gcGxhdGZvcm0ubW9kZWxGYWN0b3J5KGRlZmluaXRpb24pO1xuICAgICAgICByZXR1cm4gYXZhbG9uLnZtb2RlbHNbJGlkXSA9IHZtO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDlnKjmnKrmnaXnmoTniYjmnKwsYXZhbG9u5pS555SoUHJveHnmnaXliJvlu7pWTSzlm6DmraRcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIElQcm94eShkZWZpbml0aW9uLCBkZCkge1xuICAgICAgICBhdmFsb24ubWl4KHRoaXMsIGRlZmluaXRpb24pO1xuICAgICAgICBhdmFsb24ubWl4KHRoaXMsICQkc2tpcEFycmF5KTtcbiAgICAgICAgdGhpcy4kaGFzaGNvZGUgPSBhdmFsb24ubWFrZUhhc2hDb2RlKCckJyk7XG4gICAgICAgIHRoaXMuJGlkID0gdGhpcy4kaWQgfHwgdGhpcy4kaGFzaGNvZGU7XG4gICAgICAgIHRoaXMuJGV2ZW50cyA9IHtcbiAgICAgICAgICAgIF9fZGVwX186IGRkIHx8IG5ldyBNdXRhdGlvbih0aGlzLiRpZClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGF2YWxvbi5jb25maWcuaW5Qcm94eU1vZGUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLiRtdXRhdGlvbnM7XG4gICAgICAgICAgICB0aGlzLiRhY2Nlc3NvcnMgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuJGNvbXB1dGVkID0ge307XG4gICAgICAgICAgICB0aGlzLiR0cmFjayA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kYWNjZXNzb3JzID0ge1xuICAgICAgICAgICAgICAgICRtb2RlbDogbW9kZWxBY2Nlc3NvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGQgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgdGhpcy4kd2F0Y2ggPSBwbGF0Zm9ybS53YXRjaEZhY3RvcnkodGhpcy4kZXZlbnRzKTtcbiAgICAgICAgICAgIHRoaXMuJGZpcmUgPSBwbGF0Zm9ybS5maXJlRmFjdG9yeSh0aGlzLiRldmVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuJHdhdGNoO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuJGZpcmU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGF0Zm9ybS5tb2RlbEZhY3RvcnkgPSBmdW5jdGlvbiBtb2RlbEZhY3RvcnkoZGVmaW5pdGlvbiwgZGQpIHtcbiAgICAgICAgdmFyICRjb21wdXRlZCA9IGRlZmluaXRpb24uJGNvbXB1dGVkIHx8IHt9O1xuICAgICAgICBkZWxldGUgZGVmaW5pdGlvbi4kY29tcHV0ZWQ7XG4gICAgICAgIHZhciBjb3JlID0gbmV3IElQcm94eShkZWZpbml0aW9uLCBkZCk7XG4gICAgICAgIHZhciAkYWNjZXNzb3JzID0gY29yZS4kYWNjZXNzb3JzO1xuICAgICAgICB2YXIga2V5cyA9IFtdO1xuXG4gICAgICAgIHBsYXRmb3JtLmhpZGVQcm9wZXJ0eShjb3JlLCAnJG11dGF0aW9ucycsIHt9KTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuICAgICAgICAgICAgaWYgKGtleSBpbiAkJHNraXBBcnJheSkgY29udGludWU7XG4gICAgICAgICAgICB2YXIgdmFsID0gZGVmaW5pdGlvbltrZXldO1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICBpZiAoY2FuSGlqYWNrKGtleSwgdmFsKSkge1xuICAgICAgICAgICAgICAgICRhY2Nlc3NvcnNba2V5XSA9IGNyZWF0ZUFjY2Vzc29yKGtleSwgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBfa2V5IGluICRjb21wdXRlZCkge1xuICAgICAgICAgICAgaWYgKF9rZXkgaW4gJCRza2lwQXJyYXkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdmFyIHZhbCA9ICRjb21wdXRlZFtfa2V5XTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdmFsID0ge1xuICAgICAgICAgICAgICAgICAgICBnZXQ6IHZhbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmFsICYmIHZhbC5nZXQpIHtcbiAgICAgICAgICAgICAgICB2YWwuZ2V0dGVyID0gdmFsLmdldDtcbiAgICAgICAgICAgICAgICB2YWwuc2V0dGVyID0gdmFsLnNldDtcbiAgICAgICAgICAgICAgICBhdmFsb24uQXJyYXkuZW5zdXJlKGtleXMsIF9rZXkpO1xuICAgICAgICAgICAgICAgICRhY2Nlc3NvcnNbX2tleV0gPSBjcmVhdGVBY2Nlc3Nvcihfa2V5LCB2YWwsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8v5bCG57O757ufQVBJ5LuldW5lbnVtZXJhYmxl5b2i5byP5Yqg5YWldm0sXG4gICAgICAgIC8v5re75Yqg55So5oi355qE5YW25LuW5LiN5Y+v55uR5ZCs5bGe5oCn5oiW5pa55rOVXG4gICAgICAgIC8v6YeN5YaZJHRyYWNrXG4gICAgICAgIC8v5bm25ZyoSUU2LTjkuK3lop7mt7vliqDkuI3lrZjlnKjnmoRoYXNPd25Qcm9wZXJ05pa55rOVXG4gICAgICAgIHZhciB2bSA9IHBsYXRmb3JtLmNyZWF0ZVZpZXdNb2RlbChjb3JlLCAkYWNjZXNzb3JzLCBjb3JlKTtcbiAgICAgICAgcGxhdGZvcm0uYWZ0ZXJDcmVhdGUodm0sIGNvcmUsIGtleXMsICFkZCk7XG4gICAgICAgIHJldHVybiB2bTtcbiAgICB9O1xuICAgIHZhciAkcHJveHlJdGVtQmFja2Rvb3JNYXAgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGNhbkhpamFjayhrZXksIHZhbCwgJHByb3h5SXRlbUJhY2tkb29yKSB7XG4gICAgICAgIGlmIChrZXkgaW4gJCRza2lwQXJyYXkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGtleS5jaGFyQXQoMCkgPT09ICckJykge1xuICAgICAgICAgICAgaWYgKCRwcm94eUl0ZW1CYWNrZG9vcikge1xuICAgICAgICAgICAgICAgIGlmICghJHByb3h5SXRlbUJhY2tkb29yTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgJHByb3h5SXRlbUJhY2tkb29yTWFwW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24ud2FybignbXMtZm9yXFx1NEUyRFxcdTc2ODRcXHU1M0Q4XFx1OTFDRicgKyBrZXkgKyAnXFx1NEUwRFxcdTUxOERcXHU1RUZBXFx1OEJBRVxcdTRFRTUkXFx1NEUzQVxcdTUyNERcXHU3RjAwJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXZhbG9uLndhcm4oJ+WumuS5iXZtb2RlbOaXticgKyBrZXkgKyAn55qE5bGe5oCn5YC85LiN6IO95Li6bnVsbCB1bmRlZmluZScpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9lcnJvcnxkYXRlfGZ1bmN0aW9ufHJlZ2V4cC8udGVzdChhdmFsb24udHlwZSh2YWwpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhKHZhbCAmJiB2YWwubm9kZU5hbWUgJiYgdmFsLm5vZGVUeXBlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVQcm94eSh0YXJnZXQsIGRkKSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0LiRldmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZtO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0YXJnZXQpKSB7XG4gICAgICAgICAgICB2bSA9IHBsYXRmb3JtLmxpc3RGYWN0b3J5KHRhcmdldCwgZmFsc2UsIGRkKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICB2bSA9IHBsYXRmb3JtLm1vZGVsRmFjdG9yeSh0YXJnZXQsIGRkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm07XG4gICAgfVxuXG4gICAgcGxhdGZvcm0uY3JlYXRlUHJveHkgPSBjcmVhdGVQcm94eTtcblxuICAgIHBsYXRmb3JtLml0ZW1GYWN0b3J5ID0gZnVuY3Rpb24gaXRlbUZhY3RvcnkoYmVmb3JlLCBhZnRlcikge1xuICAgICAgICB2YXIga2V5TWFwID0gYmVmb3JlLiRtb2RlbDtcbiAgICAgICAgdmFyIGNvcmUgPSBuZXcgSVByb3h5KGtleU1hcCk7XG4gICAgICAgIHZhciBzdGF0ZSA9IGF2YWxvbi5zaGFkb3dDb3B5KGNvcmUuJGFjY2Vzc29ycywgYmVmb3JlLiRhY2Nlc3NvcnMpOyAvL+mYsuatouS6kuebuOaxoeafk1xuICAgICAgICB2YXIgZGF0YSA9IGFmdGVyLmRhdGE7XG4gICAgICAgIC8vY29yZeaYr+WMheWQq+ezu+e7n+WxnuaAp+eahOWvueixoVxuICAgICAgICAvL2tleU1hcOaYr+S4jeWMheWQq+ezu+e7n+WxnuaAp+eahOWvueixoSwga2V5c1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IGtleU1hcFtrZXldID0gY29yZVtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICAgICAgc3RhdGVba2V5XSA9IGNyZWF0ZUFjY2Vzc29yKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGtleU1hcCk7XG4gICAgICAgIHZhciB2bSA9IHBsYXRmb3JtLmNyZWF0ZVZpZXdNb2RlbChjb3JlLCBzdGF0ZSwgY29yZSk7XG4gICAgICAgIHBsYXRmb3JtLmFmdGVyQ3JlYXRlKHZtLCBjb3JlLCBrZXlzKTtcbiAgICAgICAgcmV0dXJuIHZtO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVBY2Nlc3NvcihrZXksIHZhbCwgaXNDb21wdXRlZCkge1xuICAgICAgICB2YXIgbXV0YXRpb24gPSBudWxsO1xuICAgICAgICB2YXIgQWNjZXNzb3IgPSBpc0NvbXB1dGVkID8gQ29tcHV0ZWQgOiBNdXRhdGlvbjtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gR2V0dGVyKCkge1xuICAgICAgICAgICAgICAgIGlmICghbXV0YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb24gPSBuZXcgQWNjZXNzb3Ioa2V5LCB2YWwsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbXV0YXRpb24uZ2V0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiBTZXR0ZXIobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW11dGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG11dGF0aW9uID0gbmV3IEFjY2Vzc29yKGtleSwgdmFsLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbXV0YXRpb24uc2V0KG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcGxhdGZvcm0uZnVzZUZhY3RvcnkgPSBmdW5jdGlvbiBmdXNlRmFjdG9yeShiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgIHZhciBrZXlNYXAgPSBhdmFsb24ubWl4KGJlZm9yZS4kbW9kZWwsIGFmdGVyLiRtb2RlbCk7XG4gICAgICAgIHZhciBjb3JlID0gbmV3IElQcm94eShhdmFsb24ubWl4KGtleU1hcCwge1xuICAgICAgICAgICAgJGlkOiBiZWZvcmUuJGlkICsgYWZ0ZXIuJGlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgdmFyIHN0YXRlID0gYXZhbG9uLm1peChjb3JlLiRhY2Nlc3NvcnMsIGJlZm9yZS4kYWNjZXNzb3JzLCBhZnRlci4kYWNjZXNzb3JzKTsgLy/pmLLmraLkupLnm7jmsaHmn5NcblxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGtleU1hcCk7XG4gICAgICAgIC8v5bCG57O757ufQVBJ5LuldW5lbnVtZXJhYmxl5b2i5byP5Yqg5YWldm0s5bm25ZyoSUU2LTjkuK3mt7vliqBoYXNPd25Qcm9wZXJ05pa55rOVXG4gICAgICAgIHZhciB2bSA9IHBsYXRmb3JtLmNyZWF0ZVZpZXdNb2RlbChjb3JlLCBzdGF0ZSwgY29yZSk7XG4gICAgICAgIHBsYXRmb3JtLmFmdGVyQ3JlYXRlKHZtLCBjb3JlLCBrZXlzLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB2bTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdG9Kc29uKHZhbCkge1xuICAgICAgICB2YXIgeHR5cGUgPSBhdmFsb24udHlwZSh2YWwpO1xuICAgICAgICBpZiAoeHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHRvSnNvbih2YWxbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICB9IGVsc2UgaWYgKHh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWwuJHRyYWNrID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gdmFsLiR0cmFjay5tYXRjaCgvW17imKVdKy9nKSB8fCBbXTtcbiAgICAgICAgICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgIG9ialtpXSA9IHZhbHVlICYmIHZhbHVlLiRldmVudHMgPyB0b0pzb24odmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIHZhciBtb2RlbEFjY2Vzc29yID0ge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0b0pzb24odGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogYXZhbG9uLm5vb3AsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9O1xuXG4gICAgcGxhdGZvcm0udG9Kc29uID0gdG9Kc29uO1xuICAgIHBsYXRmb3JtLm1vZGVsQWNjZXNzb3IgPSBtb2RlbEFjY2Vzc29yO1xuXG4gICAgdmFyIF9zcGxpY2UgPSBhcC5zcGxpY2U7XG4gICAgdmFyIF9fYXJyYXlfXyA9IHtcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoaW5kZXgsIHZhbCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID4+PiAwID09PSBpbmRleCAmJiB0aGlzW2luZGV4XSAhPT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoaW5kZXggKyAnc2V05pa55rOV55qE56ys5LiA5Liq5Y+C5pWw5LiN6IO95aSn5LqO5Y6f5pWw57uE6ZW/5bqmJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxLCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0b0pTT046IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICAgICAgICAgIC8v5Li65LqG6Kej5YazSUU2LTjnmoTop6PlhrMs6YCa6L+H5q2k5pa55rOV5pi+5byP5Zyw5rGC5Y+W5pWw57uE55qEJG1vZGVsXG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kbW9kZWwgPSBwbGF0Zm9ybS50b0pzb24odGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRhaW5zOiBmdW5jdGlvbiBjb250YWlucyhlbCkge1xuICAgICAgICAgICAgLy/liKTlrprmmK/lkKbljIXlkKtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluZGV4T2YoZWwpICE9PSAtMTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5zdXJlOiBmdW5jdGlvbiBlbnN1cmUoZWwpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbCkpIHtcbiAgICAgICAgICAgICAgICAvL+WPquacieS4jeWtmOWcqOaJjXB1c2hcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoQXJyYXk6IGZ1bmN0aW9uIHB1c2hBcnJheShhcnIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnB1c2guYXBwbHkodGhpcywgYXJyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoZWwpIHtcbiAgICAgICAgICAgIC8v56e76Zmk56ys5LiA5Liq562J5LqO57uZ5a6a5YC855qE5YWD57SgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVBdCh0aGlzLmluZGV4T2YoZWwpKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlQXQ6IGZ1bmN0aW9uIHJlbW92ZUF0KGluZGV4KSB7XG4gICAgICAgICAgICAvL+enu+mZpOaMh+Wumue0ouW8leS4iueahOWFg+e0oFxuICAgICAgICAgICAgaWYgKGluZGV4ID4+PiAwID09PSBpbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlQWxsOiBmdW5jdGlvbiByZW1vdmVBbGwoYWxsKSB7XG4gICAgICAgICAgICAvL+enu+mZpE7kuKrlhYPntKBcbiAgICAgICAgICAgIHZhciBzaXplID0gdGhpcy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZWxpbWluYXRlID0gQXJyYXkuaXNBcnJheShhbGwpID8gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsbC5pbmRleE9mKGVsKSAhPT0gLTE7XG4gICAgICAgICAgICB9IDogdHlwZW9mIGFsbCA9PT0gJ2Z1bmN0aW9uJyA/IGFsbCA6IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoZWxpbWluYXRlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsaW1pbmF0ZSh0aGlzW2ldLCBpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3NwbGljZS5jYWxsKHRoaXMsIGksIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfc3BsaWNlLmNhbGwodGhpcywgMCwgdGhpcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50b0pTT04oKTtcbiAgICAgICAgICAgIHRoaXMuJGV2ZW50cy5fX2RlcF9fLm5vdGlmeSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBoaWphY2tNZXRob2RzKGFycmF5KSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gX19hcnJheV9fKSB7XG4gICAgICAgICAgICBwbGF0Zm9ybS5oaWRlUHJvcGVydHkoYXJyYXksIGksIF9fYXJyYXlfX1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIF9fbWV0aG9kX18gPSBbJ3B1c2gnLCAncG9wJywgJ3NoaWZ0JywgJ3Vuc2hpZnQnLCAnc3BsaWNlJywgJ3NvcnQnLCAncmV2ZXJzZSddO1xuXG4gICAgX19tZXRob2RfXy5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsID0gYXBbbWV0aG9kXTtcbiAgICAgICAgX19hcnJheV9fW21ldGhvZF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyDnu6fnu63lsJ3or5XliqvmjIHmlbDnu4TlhYPntKDnmoTlsZ7mgKdcbiAgICAgICAgICAgIHZhciBjb3JlID0gdGhpcy4kZXZlbnRzO1xuXG4gICAgICAgICAgICB2YXIgYXJncyA9IHBsYXRmb3JtLmxpc3RGYWN0b3J5KGFyZ3VtZW50cywgdHJ1ZSwgY29yZS5fX2RlcF9fKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcblxuICAgICAgICAgICAgdGhpcy50b0pTT04oKTtcbiAgICAgICAgICAgIGNvcmUuX19kZXBfXy5ub3RpZnkobWV0aG9kKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBsaXN0RmFjdG9yeShhcnJheSwgc3RvcCwgZGQpIHtcbiAgICAgICAgaWYgKCFzdG9wKSB7XG4gICAgICAgICAgICBoaWphY2tNZXRob2RzKGFycmF5KTtcbiAgICAgICAgICAgIGlmIChtb2Rlcm4pIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXJyYXksICckbW9kZWwnLCBwbGF0Zm9ybS5tb2RlbEFjY2Vzc29yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXRmb3JtLmhpZGVQcm9wZXJ0eShhcnJheSwgJyRoYXNoY29kZScsIGF2YWxvbi5tYWtlSGFzaENvZGUoJyQnKSk7XG4gICAgICAgICAgICBwbGF0Zm9ybS5oaWRlUHJvcGVydHkoYXJyYXksICckZXZlbnRzJywgeyBfX2RlcF9fOiBkZCB8fCBuZXcgTXV0YXRpb24oKSB9KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX2RkID0gYXJyYXkuJGV2ZW50cyAmJiBhcnJheS4kZXZlbnRzLl9fZGVwX187XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJyYXkubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBwbGF0Zm9ybS5jcmVhdGVQcm94eShpdGVtLCBfZGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG5cbiAgICBwbGF0Zm9ybS5saXN0RmFjdG9yeSA9IGxpc3RGYWN0b3J5O1xuXG4gICAgLy/lpoLmnpzmtY/op4jlmajkuI3mlK/mjIFlY21hMjYydjXnmoRPYmplY3QuZGVmaW5lUHJvcGVydGllc+aIluiAheWtmOWcqEJVR++8jOavlOWmgklFOFxuICAgIC8v5qCH5YeG5rWP6KeI5Zmo5L2/55SoX19kZWZpbmVHZXR0ZXJfXywgX19kZWZpbmVTZXR0ZXJfX+WunueOsFxuICAgIHZhciBjYW5IaWRlUHJvcGVydHkgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ18nLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ3gnXG4gICAgICAgIH0pO1xuICAgICAgICBkZWxldGUgJCRza2lwQXJyYXkuJHZic2V0dGVyO1xuICAgICAgICBkZWxldGUgJCRza2lwQXJyYXkuJHZidGhpcztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICAgICAgY2FuSGlkZVByb3BlcnR5ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHByb3RlY3RlZFZCID0geyAkdmJ0aGlzOiAxLCAkdmJzZXR0ZXI6IDEgfTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGhpZGVQcm9wZXJ0eShob3N0LCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAoY2FuSGlkZVByb3BlcnR5KSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaG9zdCwgbmFtZSwge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKCFwcm90ZWN0ZWRWQltuYW1lXSkge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIGhvc3RbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhdGNoRmFjdG9yeShjb3JlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAkd2F0Y2goZXhwciwgY2FsbGJhY2ssIGRlZXApIHtcbiAgICAgICAgICAgIHZhciB3ID0gbmV3IEFjdGlvbihjb3JlLl9fcHJveHlfXywge1xuICAgICAgICAgICAgICAgIGRlZXA6IGRlZXAsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgIGV4cHI6IGV4cHJcbiAgICAgICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmICghY29yZVtleHByXSkge1xuICAgICAgICAgICAgICAgIGNvcmVbZXhwcl0gPSBbd107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvcmVbZXhwcl0ucHVzaCh3KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3LmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICBhdmFsb24uQXJyYXkucmVtb3ZlKGNvcmVbZXhwcl0sIHcpO1xuICAgICAgICAgICAgICAgIGlmIChjb3JlW2V4cHJdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29yZVtleHByXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpcmVGYWN0b3J5KGNvcmUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICRmaXJlKGV4cHIsIGEpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gY29yZVtleHByXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGxpc3QpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHc7IHcgPSBsaXN0W2krK107KSB7XG4gICAgICAgICAgICAgICAgICAgIHcuY2FsbGJhY2suY2FsbCh3LnZtLCBhLCB3LnZhbHVlLCB3LmV4cHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3cmFwSXQoc3RyKSB7XG4gICAgICAgIHJldHVybiAn4pilJyArIHN0ciArICfimKUnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFmdGVyQ3JlYXRlKHZtLCBjb3JlLCBrZXlzLCBiaW5kVGhpcykge1xuICAgICAgICB2YXIgYWMgPSB2bS4kYWNjZXNzb3JzO1xuICAgICAgICAvL+makOiXj+ezu+e7n+WxnuaAp1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gJCRza2lwQXJyYXkpIHtcbiAgICAgICAgICAgIGlmIChhdmFsb24ubXNpZSA8IDkgJiYgY29yZVtrZXldID09PSB2b2lkIDApIGNvbnRpbnVlO1xuICAgICAgICAgICAgaGlkZVByb3BlcnR5KHZtLCBrZXksIGNvcmVba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgLy/kuLrkuI3lj6/nm5HlkKznmoTlsZ7mgKfmiJbmlrnms5XotYvlgLxcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2tleTIgPSBrZXlzW2ldO1xuICAgICAgICAgICAgaWYgKCEoX2tleTIgaW4gYWMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJpbmRUaGlzICYmIHR5cGVvZiBjb3JlW19rZXkyXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICB2bVtfa2V5Ml0gPSBjb3JlW19rZXkyXS5iaW5kKHZtKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZtW19rZXkyXSA9IGNvcmVbX2tleTJdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZtLiR0cmFjayA9IGtleXMuam9pbign4pilJyk7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFzT3duS2V5KGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHdyYXBJdCh2bS4kdHJhY2spLmluZGV4T2Yod3JhcEl0KGtleSkpID4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF2YWxvbi5tc2llIDwgOSkge1xuICAgICAgICAgICAgdm0uaGFzT3duUHJvcGVydHkgPSBoYXNPd25LZXk7XG4gICAgICAgIH1cbiAgICAgICAgdm0uJGV2ZW50cy5fX3Byb3h5X18gPSB2bTtcbiAgICB9XG5cbiAgICBwbGF0Zm9ybS5oaWRlUHJvcGVydHkgPSBoaWRlUHJvcGVydHk7XG4gICAgcGxhdGZvcm0uZmlyZUZhY3RvcnkgPSBmaXJlRmFjdG9yeTtcbiAgICBwbGF0Zm9ybS53YXRjaEZhY3RvcnkgPSB3YXRjaEZhY3Rvcnk7XG4gICAgcGxhdGZvcm0uYWZ0ZXJDcmVhdGUgPSBhZnRlckNyZWF0ZTtcblxuICAgIHZhciBjcmVhdGVWaWV3TW9kZWwgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcztcbiAgICB2YXIgZGVmaW5lUHJvcGVydHk7XG5cbiAgICB2YXIgdGltZUJ1Y2tldCA9IG5ldyBEYXRlKCkgLSAwO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgaWYgKCFjYW5IaWRlUHJvcGVydHkpIHtcbiAgICAgICAgaWYgKCdfX2RlZmluZUdldHRlcl9fJyBpbiBhdmFsb24pIHtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wLCBkZXNjKSB7XG4gICAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gZGVzYykge1xuICAgICAgICAgICAgICAgICAgICBvYmpbcHJvcF0gPSBkZXNjLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYykge1xuICAgICAgICAgICAgICAgICAgICBvYmouX19kZWZpbmVHZXR0ZXJfXyhwcm9wLCBkZXNjLmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5fX2RlZmluZVNldHRlcl9fKHByb3AsIGRlc2Muc2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjcmVhdGVWaWV3TW9kZWwgPSBmdW5jdGlvbiBjcmVhdGVWaWV3TW9kZWwob2JqLCBkZXNjcykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gZGVzY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2NzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIGRlc2NzW3Byb3BdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgICAgICBpZiAobXNpZSA8IDkpIHtcbiAgICAgICAgICAgIHZhciBWQkNsYXNzUG9vbCA9IHt9O1xuICAgICAgICAgICAgd2luZG93LmV4ZWNTY3JpcHQoWy8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgJ0Z1bmN0aW9uIHBhcnNlVkIoY29kZSknLCAnXFx0RXhlY3V0ZUdsb2JhbChjb2RlKScsICdFbmQgRnVuY3Rpb24nIC8v6L2s5o2i5LiA5q615paH5pys5Li6VkLku6PnoIFcbiAgICAgICAgICAgIF0uam9pbignXFxuJyksICdWQlNjcmlwdCcpO1xuXG4gICAgICAgICAgICB2YXIgVkJNZWRpYXRvciA9IGZ1bmN0aW9uIFZCTWVkaWF0b3IoaW5zdGFuY2UsIGFjY2Vzc29ycywgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgICAgICAgICB2YXIgYWNjZXNzb3IgPSBhY2Nlc3NvcnNbbmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgYWNjZXNzb3Iuc2V0LmNhbGwoaW5zdGFuY2UsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjZXNzb3IuZ2V0LmNhbGwoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjcmVhdGVWaWV3TW9kZWwgPSBmdW5jdGlvbiBjcmVhdGVWaWV3TW9kZWwobmFtZSwgYWNjZXNzb3JzLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IFtdO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoKCdcXHRQcml2YXRlIFskdmJzZXR0ZXJdJywgJ1xcdFB1YmxpYyAgWyRhY2Nlc3NvcnNdJywgJ1xcdFB1YmxpYyBEZWZhdWx0IEZ1bmN0aW9uIFskdmJ0aGlzXShhYycgKyB0aW1lQnVja2V0ICsgJywgcycgKyB0aW1lQnVja2V0ICsgJyknLCAnXFx0XFx0U2V0ICBbJGFjY2Vzc29yc10gPSBhYycgKyB0aW1lQnVja2V0ICsgJzogc2V0IFskdmJzZXR0ZXJdID0gcycgKyB0aW1lQnVja2V0LCAnXFx0XFx0U2V0ICBbJHZidGhpc10gICAgPSBNZScsIC8v6ZO+5byP6LCD55SoXG4gICAgICAgICAgICAgICAgJ1xcdEVuZCBGdW5jdGlvbicpO1xuICAgICAgICAgICAgICAgIC8v5re75Yqg5pmu6YCa5bGe5oCnLOWboOS4ulZCU2NyaXB05a+56LGh5LiN6IO95YOPSlPpgqPmoLfpmo/mhI/lop7liKDlsZ7mgKfvvIzlv4XpobvlnKjov5nph4zpooTlhYjlrprkuYnlpb1cbiAgICAgICAgICAgICAgICB2YXIgdW5pcSA9IHtcbiAgICAgICAgICAgICAgICAgICAgJHZidGhpczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJHZic2V0dGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAkYWNjZXNzb3JzOiB0cnVlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmb3IgKG5hbWUgaW4gJCRza2lwQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1bmlxW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIucHVzaCgnXFx0UHVibGljIFsnICsgbmFtZSArICddJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1bmlxW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL+a3u+WKoOiuv+mXruWZqOWxnuaApyBcbiAgICAgICAgICAgICAgICBmb3IgKG5hbWUgaW4gYWNjZXNzb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmlxW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB1bmlxW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC8v55Sx5LqO5LiN55+l5a+55pa55Lya5Lyg5YWl5LuA5LmILOWboOatpHNldCwgbGV06YO955So5LiKXG4gICAgICAgICAgICAgICAgICAgICdcXHRQdWJsaWMgUHJvcGVydHkgTGV0IFsnICsgbmFtZSArICddKHZhbCcgKyB0aW1lQnVja2V0ICsgJyknLCAvL3NldHRlclxuICAgICAgICAgICAgICAgICAgICAnXFx0XFx0Q2FsbCBbJHZic2V0dGVyXShNZSwgWyRhY2Nlc3NvcnNdLCBcIicgKyBuYW1lICsgJ1wiLCB2YWwnICsgdGltZUJ1Y2tldCArICcpJywgJ1xcdEVuZCBQcm9wZXJ0eScsICdcXHRQdWJsaWMgUHJvcGVydHkgU2V0IFsnICsgbmFtZSArICddKHZhbCcgKyB0aW1lQnVja2V0ICsgJyknLCAvL3NldHRlclxuICAgICAgICAgICAgICAgICAgICAnXFx0XFx0Q2FsbCBbJHZic2V0dGVyXShNZSwgWyRhY2Nlc3NvcnNdLCBcIicgKyBuYW1lICsgJ1wiLCB2YWwnICsgdGltZUJ1Y2tldCArICcpJywgJ1xcdEVuZCBQcm9wZXJ0eScsICdcXHRQdWJsaWMgUHJvcGVydHkgR2V0IFsnICsgbmFtZSArICddJywgLy9nZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgJ1xcdE9uIEVycm9yIFJlc3VtZSBOZXh0JywgLy/lv4XpobvkvJjlhYjkvb/nlKhzZXTor63lj6Us5ZCm5YiZ5a6D5Lya6K+v5bCG5pWw57uE5b2T5a2X56ym5Liy6L+U5ZueXG4gICAgICAgICAgICAgICAgICAgICdcXHRcXHRTZXRbJyArIG5hbWUgKyAnXSA9IFskdmJzZXR0ZXJdKE1lLCBbJGFjY2Vzc29yc10sXCInICsgbmFtZSArICdcIiknLCAnXFx0SWYgRXJyLk51bWJlciA8PiAwIFRoZW4nLCAnXFx0XFx0WycgKyBuYW1lICsgJ10gPSBbJHZic2V0dGVyXShNZSwgWyRhY2Nlc3NvcnNdLFwiJyArIG5hbWUgKyAnXCIpJywgJ1xcdEVuZCBJZicsICdcXHRPbiBFcnJvciBHb3RvIDAnLCAnXFx0RW5kIFByb3BlcnR5Jyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChuYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1bmlxW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1bmlxW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoKCdcXHRQdWJsaWMgWycgKyBuYW1lICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoKCdcXHRQdWJsaWMgW2hhc093blByb3BlcnR5XScpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoKCdFbmQgQ2xhc3MnKTtcbiAgICAgICAgICAgICAgICB2YXIgYm9keSA9IGJ1ZmZlci5qb2luKCdcXHJcXG4nKTtcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gVkJDbGFzc1Bvb2xbYm9keV07XG4gICAgICAgICAgICAgICAgaWYgKCFjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gYXZhbG9uLm1ha2VIYXNoQ29kZSgnVkJDbGFzcycpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucGFyc2VWQignQ2xhc3MgJyArIGNsYXNzTmFtZSArIGJvZHkpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucGFyc2VWQihbJ0Z1bmN0aW9uICcgKyBjbGFzc05hbWUgKyAnRmFjdG9yeShhY2MsIHZibSknLCAvL+WIm+W7uuWunuS+i+W5tuS8oOWFpeS4pOS4quWFs+mUrueahOWPguaVsFxuICAgICAgICAgICAgICAgICAgICAnXFx0RGltIG8nLCAnXFx0U2V0IG8gPSAoTmV3ICcgKyBjbGFzc05hbWUgKyAnKShhY2MsIHZibSknLCAnXFx0U2V0ICcgKyBjbGFzc05hbWUgKyAnRmFjdG9yeSA9IG8nLCAnRW5kIEZ1bmN0aW9uJ10uam9pbignXFxyXFxuJykpO1xuICAgICAgICAgICAgICAgICAgICBWQkNsYXNzUG9vbFtib2R5XSA9IGNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJldCA9IHdpbmRvd1tjbGFzc05hbWUgKyAnRmFjdG9yeSddKGFjY2Vzc29ycywgVkJNZWRpYXRvcik7IC8v5b6X5Yiw5YW25Lqn5ZOBXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDsgLy/lvpfliLDlhbbkuqflk4FcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGF0Zm9ybS5jcmVhdGVWaWV3TW9kZWwgPSBjcmVhdGVWaWV3TW9kZWw7XG5cbiAgICB2YXIgaW1wRGlyID0gYXZhbG9uLmRpcmVjdGl2ZSgnaW1wb3J0YW50Jywge1xuICAgICAgICBwcmlvcml0eTogMSxcbiAgICAgICAgZ2V0U2NvcGU6IGZ1bmN0aW9uIGdldFNjb3BlKG5hbWUsIHNjb3BlKSB7XG4gICAgICAgICAgICB2YXIgdiA9IGF2YWxvbi52bW9kZWxzW25hbWVdO1xuICAgICAgICAgICAgaWYgKHYpIHJldHVybiB2O1xuICAgICAgICAgICAgdGhyb3cgJ2Vycm9yISBubyB2bW9kZWwgY2FsbGVkICcgKyBuYW1lO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShub2RlLCBhdHRyTmFtZSwgJGlkKSB7XG4gICAgICAgICAgICBpZiAoIWF2YWxvbi5pbkJyb3dzZXIpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBkb20gPSBhdmFsb24udmRvbShub2RlLCAndG9ET00nKTtcbiAgICAgICAgICAgIGlmIChkb20ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBkb20ucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgICAgICAgICAgICBhdmFsb24oZG9tKS5yZW1vdmVDbGFzcygnbXMtY29udHJvbGxlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZtID0gYXZhbG9uLnZtb2RlbHNbJGlkXTtcbiAgICAgICAgICAgIGlmICh2bSkge1xuICAgICAgICAgICAgICAgIHZtLiRlbGVtZW50ID0gZG9tO1xuICAgICAgICAgICAgICAgIHZtLiRyZW5kZXIgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZtLiRmaXJlKCdvblJlYWR5Jyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHZtLiRldmVudHMub25SZWFkeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGltcENiID0gaW1wRGlyLnVwZGF0ZTtcblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ2NvbnRyb2xsZXInLCB7XG4gICAgICAgIHByaW9yaXR5OiAyLFxuICAgICAgICBnZXRTY29wZTogZnVuY3Rpb24gZ2V0U2NvcGUobmFtZSwgc2NvcGUpIHtcbiAgICAgICAgICAgIHZhciB2ID0gYXZhbG9uLnZtb2RlbHNbbmFtZV07XG4gICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgIHYuJHJlbmRlciA9IHRoaXM7XG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlICYmIHNjb3BlICE9PSB2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwbGF0Zm9ybS5mdXNlRmFjdG9yeShzY29wZSwgdik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGltcENiXG4gICAgfSk7XG5cbiAgICBhdmFsb24uZGlyZWN0aXZlKCdza2lwJywge1xuICAgICAgICBkZWxheTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgdmFyIGFycmF5V2FybiA9IHt9O1xuICAgIHZhciBjc3NEaXIgPSBhdmFsb24uZGlyZWN0aXZlKCdjc3MnLCB7XG4gICAgICAgIGRpZmY6IGZ1bmN0aW9uIGRpZmYobmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QobmV3VmFsKSA9PT0gbmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsID0gcGxhdGZvcm0udG9Kc29uKG5ld1ZhbCk7IC8v5a6J5YWo55qE6YGN5Y6GVkJzY3JpcHRcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShuZXdWYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v6L2s5o2i5oiQ5a+56LGhXG4gICAgICAgICAgICAgICAgICAgIHZhciBiID0ge307XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbC5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwgJiYgYXZhbG9uLnNoYWRvd0NvcHkoYiwgZWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsID0gYjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcnJheVdhcm5bdGhpcy50eXBlXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oJ21zLScgKyB0aGlzLnR5cGUgKyAn5oyH5Luk55qE5YC85LiN5bu66K6u5L2/55So5pWw57uE5b2i5byP5LqG77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheVdhcm5bdGhpcy50eXBlXSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgaGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGNoID0ge307XG4gICAgICAgICAgICAgICAgaWYgKCFvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzkuIDlvIDlp4vkuLrnqbpcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2ggPSBuZXdWYWw7XG4gICAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlZXAgPSB0eXBlb2YgdGhpcy5kZWVwID09PSAnbnVtYmVyJyA/IHRoaXMuZGVlcCA6IDY7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIG5ld1ZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZGlmZuW3ruW8gueCuSAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWxzKG5ld1ZhbFtpXSwgb2xkVmFsW2ldLCA0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gbmV3VmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hbaV0gPSBuZXdWYWxbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaTMgaW4gbmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9kaWZm5beu5byC54K5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbFtfaTNdICE9PSBvbGRWYWxbX2kzXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaFtfaTNdID0gbmV3VmFsW19pM107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaTQgaW4gb2xkVmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShfaTQgaW4gcGF0Y2gpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaFtfaTRdID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gcGF0Y2g7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSwgdmFsdWUpIHtcblxuICAgICAgICAgICAgdmFyIGRvbSA9IHZkb20uZG9tO1xuICAgICAgICAgICAgaWYgKGRvbSAmJiBkb20ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgd3JhcCA9IGF2YWxvbihkb20pO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JhcC5jc3MobmFtZSwgdmFsdWVbbmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGNzc0RpZmYgPSBjc3NEaXIuZGlmZjtcblxuICAgIGZ1bmN0aW9uIGdldEVudW1lcmFibGVLZXlzKG9iaikge1xuICAgICAgICB2YXIgcmVzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKGtleSk7XG4gICAgICAgIH1yZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlZXBFcXVhbHMoYSwgYiwgbGV2ZWwpIHtcbiAgICAgICAgaWYgKGxldmVsID09PSAwKSByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgaWYgKGEgPT09IG51bGwgJiYgYiA9PT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgdmFyIGFJc0FycmF5ID0gQXJyYXkuaXNBcnJheShhKTtcbiAgICAgICAgaWYgKGFJc0FycmF5ICE9PSBBcnJheS5pc0FycmF5KGIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFJc0FycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWxBcnJheShhLCBiLCBsZXZlbCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGEgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBlcXVhbE9iamVjdChhLCBiLCBsZXZlbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXF1YWxBcnJheShhLCBiLCBsZXZlbCkge1xuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWxzKGFbaV0sIGJbaV0sIGxldmVsIC0gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKG5vVGhpc1Byb3BFcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlcXVhbE9iamVjdChhLCBiLCBsZXZlbCkge1xuICAgICAgICBpZiAoYSA9PT0gbnVsbCB8fCBiID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChnZXRFbnVtZXJhYmxlS2V5cyhhKS5sZW5ndGggIT09IGdldEVudW1lcmFibGVLZXlzKGIpLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIGEpIHtcbiAgICAgICAgICAgIGlmICghKHByb3AgaW4gYikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWxzKGFbcHJvcF0sIGJbcHJvcF0sIGxldmVsIC0gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKG5vVGhpc1Byb3BFcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKiDmo4DmtYvmtY/op4jlmajlr7lDU1PliqjnlLvnmoTmlK/mjIHkuI5BUEnlkI1cbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKi9cblxuICAgIHZhciBjaGVja2VyID0ge1xuICAgICAgICBUcmFuc2l0aW9uRXZlbnQ6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgV2ViS2l0VHJhbnNpdGlvbkV2ZW50OiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAgIE9UcmFuc2l0aW9uRXZlbnQ6ICdvVHJhbnNpdGlvbkVuZCcsXG4gICAgICAgIG90cmFuc2l0aW9uRXZlbnQ6ICdvdHJhbnNpdGlvbkVuZCdcbiAgICB9O1xuICAgIHZhciBjc3MzID0gdm9pZCAwO1xuICAgIHZhciB0cmFuID0gdm9pZCAwO1xuICAgIHZhciBhbmkgPSB2b2lkIDA7XG4gICAgdmFyIG5hbWUkMiA9IHZvaWQgMDtcbiAgICB2YXIgYW5pbWF0aW9uRW5kRXZlbnQgPSB2b2lkIDA7XG4gICAgdmFyIHRyYW5zaXRpb25FbmRFdmVudCA9IHZvaWQgMDtcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIHZhciBhbmltYXRpb24gPSBmYWxzZTtcbiAgICAvL+acieeahOa1j+iniOWZqOWQjOaXtuaUr+aMgeengeacieWunueOsOS4juagh+WHhuWGmeazle+8jOavlOWmgndlYmtpdOaUr+aMgeWJjeS4pOenje+8jE9wZXJh5pSv5oyBMeOAgTPjgIE0XG4gICAgZm9yIChuYW1lJDIgaW4gY2hlY2tlcikge1xuICAgICAgICBpZiAod2luZG93JDFbbmFtZSQyXSkge1xuICAgICAgICAgICAgdHJhbiA9IGNoZWNrZXJbbmFtZSQyXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KG5hbWUkMik7XG4gICAgICAgICAgICB0cmFuID0gY2hlY2tlcltuYW1lJDJdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdHJhbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHJhbnNpdGlvbiA9IGNzczMgPSB0cnVlO1xuICAgICAgICB0cmFuc2l0aW9uRW5kRXZlbnQgPSB0cmFuO1xuICAgIH1cblxuICAgIC8vYW5pbWF0aW9uZW5k5pyJ5Lik5Liq5Y+v55So5b2i5oCBXG4gICAgLy9JRTEwKywgRmlyZWZveCAxNisgJiBPcGVyYSAxMi4xKzogYW5pbWF0aW9uZW5kXG4gICAgLy9DaHJvbWUvU2FmYXJpOiB3ZWJraXRBbmltYXRpb25FbmRcbiAgICAvL2h0dHA6Ly9ibG9ncy5tc2RuLmNvbS9iL2RhdnJvdXMvYXJjaGl2ZS8yMDExLzEyLzA2L2ludHJvZHVjdGlvbi10by1jc3MzLWFuaW1hdCBpb25zLmFzcHhcbiAgICAvL0lFMTDkuZ/lj6/ku6Xkvb/nlKhNU0FuaW1hdGlvbkVuZOebkeWQrO+8jOS9huaYr+Wbnuiwg+mHjOeahOS6i+S7tiB0eXBl5L6d54S25Li6YW5pbWF0aW9uZW5kXG4gICAgLy8gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ01TQW5pbWF0aW9uRW5kJywgZnVuY3Rpb24oZSkge1xuICAgIC8vICAgICBhbGVydChlLnR5cGUpLy8gYW5pbWF0aW9uZW5k77yB77yB77yBXG4gICAgLy8gfSlcbiAgICBjaGVja2VyID0ge1xuICAgICAgICAnQW5pbWF0aW9uRXZlbnQnOiAnYW5pbWF0aW9uZW5kJyxcbiAgICAgICAgJ1dlYktpdEFuaW1hdGlvbkV2ZW50JzogJ3dlYmtpdEFuaW1hdGlvbkVuZCdcbiAgICB9O1xuICAgIGZvciAobmFtZSQyIGluIGNoZWNrZXIpIHtcbiAgICAgICAgaWYgKHdpbmRvdyQxW25hbWUkMl0pIHtcbiAgICAgICAgICAgIGFuaSA9IGNoZWNrZXJbbmFtZSQyXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYW5pID09PSAnc3RyaW5nJykge1xuICAgICAgICBhbmltYXRpb24gPSBjc3MzID0gdHJ1ZTtcbiAgICAgICAgYW5pbWF0aW9uRW5kRXZlbnQgPSBhbmk7XG4gICAgfVxuXG4gICAgdmFyIGVmZmVjdERpciA9IGF2YWxvbi5kaXJlY3RpdmUoJ2VmZmVjdCcsIHtcbiAgICAgICAgcHJpb3JpdHk6IDUsXG4gICAgICAgIGRpZmY6IGZ1bmN0aW9uIGRpZmYoZWZmZWN0KSB7XG4gICAgICAgICAgICB2YXIgdmRvbSA9IHRoaXMubm9kZTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZWZmZWN0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBlZmZlY3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlzOiBlZmZlY3RcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKCdtcy1lZmZlY3TnmoTmjIfku6TlgLzkuI3lho3mlK/mjIHlrZfnrKbkuLIs5b+F6aG75piv5LiA5Liq5a+56LGhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmRvbS5lZmZlY3QgPSBlZmZlY3Q7XG4gICAgICAgICAgICB2YXIgb2sgPSBjc3NEaWZmLmNhbGwodGhpcywgZWZmZWN0LCB0aGlzLm9sZFZhbHVlKTtcbiAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmRvbS5hbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBlZmZlY3REaXIudXBkYXRlLmNhbGwobWUsIHZkb20sIHZkb20uZWZmZWN0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2ZG9tLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZkb20sIGNoYW5nZSwgb3B0cykge1xuICAgICAgICAgICAgdmFyIGRvbSA9IHZkb20uZG9tO1xuICAgICAgICAgICAgaWYgKGRvbSAmJiBkb20ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvL+imgeaxgumFjee9ruWvueixoeW/hemhu+aMh+Wummlz5bGe5oCn77yMYWN0aW9u5b+F6aG75piv5biD5bCU5oiWZW50ZXIsbGVhdmUsbW92ZVxuICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBjaGFuZ2UgfHwgb3B0cztcbiAgICAgICAgICAgICAgICB2YXIgaXMgPSBvcHRpb24uaXM7XG5cbiAgICAgICAgICAgICAgICB2YXIgZ2xvYmFsT3B0aW9uID0gYXZhbG9uLmVmZmVjdHNbaXNdO1xuICAgICAgICAgICAgICAgIGlmICghZ2xvYmFsT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5rKh5pyJ5a6a5LmJ54m55pWIXG4gICAgICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKGlzICsgJyBlZmZlY3QgaXMgdW5kZWZpbmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGZpbmFsT3B0aW9uID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGFjdGlvbiA9IGFjdGlvbk1hcHNbb3B0aW9uLmFjdGlvbl07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBFZmZlY3QucHJvdG90eXBlW2FjdGlvbl0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oJ2FjdGlvbiBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL+W/hemhu+mihOWumuS5ieeJueaViFxuXG4gICAgICAgICAgICAgICAgdmFyIGVmZmVjdCA9IG5ldyBhdmFsb24uRWZmZWN0KGRvbSk7XG4gICAgICAgICAgICAgICAgYXZhbG9uLm1peChmaW5hbE9wdGlvbiwgZ2xvYmFsT3B0aW9uLCBvcHRpb24sIHsgYWN0aW9uOiBhY3Rpb24gfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmluYWxPcHRpb24ucXVldWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uUXVldWUucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZmZlY3RbYWN0aW9uXShmaW5hbE9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjYWxsTmV4dEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0W2FjdGlvbl0oZmluYWxPcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIG1vdmUgPSAnbW92ZSc7XG4gICAgdmFyIGxlYXZlID0gJ2xlYXZlJztcbiAgICB2YXIgZW50ZXIgPSAnZW50ZXInO1xuICAgIHZhciBhY3Rpb25NYXBzID0ge1xuICAgICAgICAndHJ1ZSc6IGVudGVyLFxuICAgICAgICAnZmFsc2UnOiBsZWF2ZSxcbiAgICAgICAgZW50ZXI6IGVudGVyLFxuICAgICAgICBsZWF2ZTogbGVhdmUsXG4gICAgICAgIG1vdmU6IG1vdmUsXG4gICAgICAgICd1bmRlZmluZWQnOiBlbnRlclxuICAgIH07XG5cbiAgICB2YXIgYW5pbWF0aW9uUXVldWUgPSBbXTtcbiAgICBmdW5jdGlvbiBjYWxsTmV4dEFuaW1hdGlvbigpIHtcbiAgICAgICAgdmFyIGZuID0gYW5pbWF0aW9uUXVldWVbMF07XG4gICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGF2YWxvbi5lZmZlY3RzID0ge307XG4gICAgYXZhbG9uLmVmZmVjdCA9IGZ1bmN0aW9uIChuYW1lLCBvcHRzKSB7XG4gICAgICAgIHZhciBkZWZpbml0aW9uID0gYXZhbG9uLmVmZmVjdHNbbmFtZV0gPSBvcHRzIHx8IHt9O1xuICAgICAgICBpZiAoY3NzMyAmJiBkZWZpbml0aW9uLmNzcyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHBhdGNoT2JqZWN0KGRlZmluaXRpb24sICdlbnRlckNsYXNzJywgbmFtZSArICctZW50ZXInKTtcbiAgICAgICAgICAgIHBhdGNoT2JqZWN0KGRlZmluaXRpb24sICdlbnRlckFjdGl2ZUNsYXNzJywgZGVmaW5pdGlvbi5lbnRlckNsYXNzICsgJy1hY3RpdmUnKTtcbiAgICAgICAgICAgIHBhdGNoT2JqZWN0KGRlZmluaXRpb24sICdsZWF2ZUNsYXNzJywgbmFtZSArICctbGVhdmUnKTtcbiAgICAgICAgICAgIHBhdGNoT2JqZWN0KGRlZmluaXRpb24sICdsZWF2ZUFjdGl2ZUNsYXNzJywgZGVmaW5pdGlvbi5sZWF2ZUNsYXNzICsgJy1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcGF0Y2hPYmplY3Qob2JqLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAoIW9ialtuYW1lXSkge1xuICAgICAgICAgICAgb2JqW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgRWZmZWN0ID0gZnVuY3Rpb24gRWZmZWN0KGRvbSkge1xuICAgICAgICB0aGlzLmRvbSA9IGRvbTtcbiAgICB9O1xuXG4gICAgYXZhbG9uLkVmZmVjdCA9IEVmZmVjdDtcblxuICAgIEVmZmVjdC5wcm90b3R5cGUgPSB7XG4gICAgICAgIGVudGVyOiBjcmVhdGVBY3Rpb24oJ0VudGVyJyksXG4gICAgICAgIGxlYXZlOiBjcmVhdGVBY3Rpb24oJ0xlYXZlJyksXG4gICAgICAgIG1vdmU6IGNyZWF0ZUFjdGlvbignTW92ZScpXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGV4ZWNIb29rcyhvcHRpb25zLCBuYW1lLCBlbCkge1xuICAgICAgICB2YXIgZm5zID0gW10uY29uY2F0KG9wdGlvbnNbbmFtZV0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgZm47IGZuID0gZm5zW2krK107KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgZm4oZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBzdGFnZ2VyQ2FjaGUgPSBuZXcgQ2FjaGUoMTI4KTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFjdGlvbihhY3Rpb24pIHtcbiAgICAgICAgdmFyIGxvd2VyID0gYWN0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZG9tID0gdGhpcy5kb207XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGF2YWxvbihkb20pO1xuICAgICAgICAgICAgLy/lpITnkIbkuI5tcy1mb3LmjIfku6Tnm7jlhbPnmoRzdGFnZ2VyXG4gICAgICAgICAgICAvLz09PT09PT09QkVHSU49PT09PVxuICAgICAgICAgICAgdmFyIHN0YWdnZXJUaW1lID0gaXNGaW5pdGUob3B0aW9uLnN0YWdnZXIpID8gb3B0aW9uLnN0YWdnZXIgKiAxMDAwIDogMDtcbiAgICAgICAgICAgIGlmIChzdGFnZ2VyVGltZSkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb24uc3RhZ2dlcktleSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhZ2dlciA9IHN0YWdnZXJDYWNoZS5nZXQob3B0aW9uLnN0YWdnZXJLZXkpIHx8IHN0YWdnZXJDYWNoZS5wdXQob3B0aW9uLnN0YWdnZXJLZXksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IDBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YWdnZXIuY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgc3RhZ2dlci5pdGVtcysrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdGFnZ2VySW5kZXggPSBzdGFnZ2VyICYmIHN0YWdnZXIuY291bnQgfHwgMDtcbiAgICAgICAgICAgIC8vPT09PT09PUVORD09PT09PT09PT1cbiAgICAgICAgICAgIHZhciBzdG9wQW5pbWF0aW9uSUQ7XG4gICAgICAgICAgICB2YXIgYW5pbWF0aW9uRG9uZSA9IGZ1bmN0aW9uIGFuaW1hdGlvbkRvbmUoZSkge1xuICAgICAgICAgICAgICAgIHZhciBpc09rID0gZSAhPT0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKC0tZG9tLl9fbXNfZWZmZWN0XyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24udW5iaW5kKGRvbSwgdHJhbnNpdGlvbkVuZEV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLnVuYmluZChkb20sIGFuaW1hdGlvbkVuZEV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHN0b3BBbmltYXRpb25JRCk7XG4gICAgICAgICAgICAgICAgdmFyIGRpcldvcmQgPSBpc09rID8gJ0RvbmUnIDogJ0Fib3J0JztcbiAgICAgICAgICAgICAgICBleGVjSG9va3Mob3B0aW9uLCAnb24nICsgYWN0aW9uICsgZGlyV29yZCwgZG9tKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhZ2dlcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoLS1zdGFnZ2VyLml0ZW1zID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFnZ2VyLmNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uLnF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvblF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0QW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8v5omn6KGM5byA5aeL5YmN55qE6ZKp5a2QXG4gICAgICAgICAgICBleGVjSG9va3Mob3B0aW9uLCAnb25CZWZvcmUnICsgYWN0aW9uLCBkb20pO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9uW2xvd2VyXSkge1xuICAgICAgICAgICAgICAgIC8v5L2/55SoSlPmlrnlvI/miafooYzliqjnlLtcbiAgICAgICAgICAgICAgICBvcHRpb25bbG93ZXJdKGRvbSwgZnVuY3Rpb24gKG9rKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkRvbmUob2sgIT09IGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3NzMykge1xuICAgICAgICAgICAgICAgIC8v5L2/55SoQ1NTM+aWueW8j+aJp+ihjOWKqOeUu1xuICAgICAgICAgICAgICAgIGVsZW0uYWRkQ2xhc3Mob3B0aW9uW2xvd2VyICsgJ0NsYXNzJ10pO1xuICAgICAgICAgICAgICAgIGVsZW0ucmVtb3ZlQ2xhc3MoZ2V0TmVlZFJlbW92ZWQob3B0aW9uLCBsb3dlcikpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFkb20uX19tc19lZmZlY3RfKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v57uR5a6a5Yqo55S757uT5p2f5LqL5Lu2XG4gICAgICAgICAgICAgICAgICAgIGVsZW0uYmluZCh0cmFuc2l0aW9uRW5kRXZlbnQsIGFuaW1hdGlvbkRvbmUpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtLmJpbmQoYW5pbWF0aW9uRW5kRXZlbnQsIGFuaW1hdGlvbkRvbmUpO1xuICAgICAgICAgICAgICAgICAgICBkb20uX19tc19lZmZlY3RfID0gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkb20uX19tc19lZmZlY3RfKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvL+eUqHh4eC1hY3RpdmXku6Pmm794eHjnsbvlkI3nmoTmlrnlvI8g6Kem5Y+RQ1NTM+WKqOeUu1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IGF2YWxvbi5yb290Lm9mZnNldFdpZHRoID09PSBOYU47XG4gICAgICAgICAgICAgICAgICAgIGVsZW0uYWRkQ2xhc3Mob3B0aW9uW2xvd2VyICsgJ0FjdGl2ZUNsYXNzJ10pO1xuICAgICAgICAgICAgICAgICAgICAvL+iuoeeul+WKqOeUu+aXtumVv1xuICAgICAgICAgICAgICAgICAgICB0aW1lID0gZ2V0QW5pbWF0aW9uVGltZShkb20pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRpbWUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v56uL5Y2z57uT5p2f5Yqo55S7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25Eb25lKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc3RhZ2dlclRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5Yqo55S76LaF5Ye65pe26ZW/6L+Y5rKh5pyJ6LCD55So57uT5p2f5LqL5Lu2LOi/meWPr+iDveaYr+WFg+e0oOiiq+enu+mZpOS6hlxuICAgICAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzlvLrliLbnu5PmnZ/liqjnlLtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BBbmltYXRpb25JRCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkRvbmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGltZSArIDMyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDE3ICsgc3RhZ2dlclRpbWUgKiBzdGFnZ2VySW5kZXgpOyAvLyA9IDEwMDAvNjBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhdmFsb24uYXBwbHlFZmZlY3QgPSBmdW5jdGlvbiAoZG9tLCB2ZG9tLCBvcHRzKSB7XG4gICAgICAgIHZhciBjYiA9IG9wdHMuY2I7XG4gICAgICAgIHZhciBjdXJFZmZlY3QgPSB2ZG9tLmVmZmVjdDtcbiAgICAgICAgaWYgKGN1ckVmZmVjdCAmJiBkb20gJiYgZG9tLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG9wdHMuaG9vaztcbiAgICAgICAgICAgIHZhciBvbGQgPSBjdXJFZmZlY3RbaG9va107XG4gICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZC5wdXNoKGNiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9sZCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJFZmZlY3RbaG9va10gPSBbb2xkLCBjYl07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyRWZmZWN0W2hvb2tdID0gW2NiXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXRBY3Rpb24ob3B0cyk7XG4gICAgICAgICAgICBhdmFsb24uZGlyZWN0aXZlcy5lZmZlY3QudXBkYXRlKHZkb20sIGN1ckVmZmVjdCwgYXZhbG9uLnNoYWRvd0NvcHkoe30sIG9wdHMpKTtcbiAgICAgICAgfSBlbHNlIGlmIChjYikge1xuICAgICAgICAgICAgY2IoZG9tKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICog6I635Y+W5pa55ZCRXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QWN0aW9uKG9wdHMpIHtcbiAgICAgICAgaWYgKCFvcHRzLmFjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG9wdHMuYWN0aW9uID0gb3B0cy5ob29rLnJlcGxhY2UoL15vbi8sICcnKS5yZXBsYWNlKC9Eb25lJC8sICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmcgOimgeenu+mZpOeahOexu+WQjVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldE5lZWRSZW1vdmVkKG9wdGlvbnMsIG5hbWUpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBuYW1lID09PSAnbGVhdmUnID8gJ2VudGVyJyA6ICdsZWF2ZSc7XG4gICAgICAgIHJldHVybiBBcnJheShuYW1lICsgJ0NsYXNzJywgbmFtZSArICdBY3RpdmVDbGFzcycpLm1hcChmdW5jdGlvbiAoY2xzKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uc1tjbHNdO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiuoeeul+WKqOeUu+mVv+W6plxuICAgICAqL1xuICAgIHZhciB0cmFuc2l0aW9uRHVyYXRpb24gPSBhdmFsb24uY3NzTmFtZSgndHJhbnNpdGlvbi1kdXJhdGlvbicpO1xuICAgIHZhciBhbmltYXRpb25EdXJhdGlvbiA9IGF2YWxvbi5jc3NOYW1lKCdhbmltYXRpb24tZHVyYXRpb24nKTtcbiAgICB2YXIgcnNlY29uZCA9IC9cXGQrcyQvO1xuICAgIGZ1bmN0aW9uIHRvTWlsbGlzZWNvbmQoc3RyKSB7XG4gICAgICAgIHZhciByYXRpbyA9IHJzZWNvbmQudGVzdChzdHIpID8gMTAwMCA6IDE7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0cikgKiByYXRpbztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRBbmltYXRpb25UaW1lKGRvbSkge1xuICAgICAgICB2YXIgY29tcHV0ZWRTdHlsZXMgPSB3aW5kb3ckMS5nZXRDb21wdXRlZFN0eWxlKGRvbSwgbnVsbCk7XG4gICAgICAgIHZhciB0cmFuRHVyYXRpb24gPSBjb21wdXRlZFN0eWxlc1t0cmFuc2l0aW9uRHVyYXRpb25dO1xuICAgICAgICB2YXIgYW5pbUR1cmF0aW9uID0gY29tcHV0ZWRTdHlsZXNbYW5pbWF0aW9uRHVyYXRpb25dO1xuICAgICAgICByZXR1cm4gdG9NaWxsaXNlY29uZCh0cmFuRHVyYXRpb24pIHx8IHRvTWlsbGlzZWNvbmQoYW5pbUR1cmF0aW9uKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogXG4gICAgPCFET0NUWVBFIGh0bWw+XG4gICAgPGh0bWw+XG4gICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cIlVURi04XCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFwiPlxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCJkaXN0L2F2YWxvbi5qc1wiPjwvc2NyaXB0PlxuICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICBhdmFsb24uZWZmZWN0KCdhbmltYXRlJylcbiAgICAgICAgICAgICAgICB2YXIgdm0gPSBhdmFsb24uZGVmaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgJGlkOiAnYW5pJyxcbiAgICAgICAgICAgICAgICAgICAgYTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICAgICAuYW5pbWF0ZS1lbnRlciwgLmFuaW1hdGUtbGVhdmV7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOjEwMHB4O1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6MTAwcHg7XG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICMyOWI2ZjY7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246YWxsIDJzO1xuICAgICAgICAgICAgICAgICAgICAtbW96LXRyYW5zaXRpb246IGFsbCAyczsgXG4gICAgICAgICAgICAgICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogYWxsIDJzO1xuICAgICAgICAgICAgICAgICAgICAtby10cmFuc2l0aW9uOmFsbCAycztcbiAgICAgICAgICAgICAgICB9ICBcbiAgICAgICAgICAgICAgICAuYW5pbWF0ZS1lbnRlci1hY3RpdmUsIC5hbmltYXRlLWxlYXZle1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDozMDBweDtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OjMwMHB4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAuYW5pbWF0ZS1sZWF2ZS1hY3RpdmV7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOjEwMHB4O1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6MTAwcHg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgIDxkaXYgOmNvbnRyb2xsZXI9J2FuaScgPlxuICAgICAgICAgICAgICAgIDxwPjxpbnB1dCB0eXBlPSdidXR0b24nIHZhbHVlPSdjbGljaycgOmNsaWNrPSdAYSA9IUBhJz48L3A+XG4gICAgICAgICAgICAgICAgPGRpdiA6ZWZmZWN0PVwie2lzOidhbmltYXRlJyxhY3Rpb246QGF9XCI+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICA8L2JvZHk+XG4gICAgPC9odG1sPlxuICAgICAqIFxuICAgICAqL1xuXG4gICAgdmFyIG5vbmUgPSAnbm9uZSc7XG4gICAgZnVuY3Rpb24gcGFyc2VEaXNwbGF5KGVsZW0sIHZhbCkge1xuICAgICAgICAvL+eUqOS6juWPluW+l+atpOexu+agh+etvueahOm7mOiupGRpc3BsYXnlgLxcbiAgICAgICAgdmFyIGRvYyA9IGVsZW0ub3duZXJEb2N1bWVudDtcbiAgICAgICAgdmFyIG5vZGVOYW1lID0gZWxlbS5ub2RlTmFtZTtcbiAgICAgICAgdmFyIGtleSA9ICdfJyArIG5vZGVOYW1lO1xuICAgICAgICBpZiAoIXBhcnNlRGlzcGxheVtrZXldKSB7XG4gICAgICAgICAgICB2YXIgdGVtcCA9IGRvYy5ib2R5LmFwcGVuZENoaWxkKGRvYy5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKSk7XG4gICAgICAgICAgICB2YWwgPSBhdmFsb24uY3NzKHRlbXAsICdkaXNwbGF5Jyk7XG4gICAgICAgICAgICBkb2MuYm9keS5yZW1vdmVDaGlsZCh0ZW1wKTtcbiAgICAgICAgICAgIGlmICh2YWwgPT09IG5vbmUpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAnYmxvY2snO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyc2VEaXNwbGF5W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnNlRGlzcGxheVtrZXldO1xuICAgIH1cblxuICAgIGF2YWxvbi5wYXJzZURpc3BsYXkgPSBwYXJzZURpc3BsYXk7XG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgndmlzaWJsZScsIHtcbiAgICAgICAgZGlmZjogZnVuY3Rpb24gZGlmZihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICAgICAgdmFyIG4gPSAhIW5ld1ZhbDtcbiAgICAgICAgICAgIGlmIChvbGRWYWwgPT09IHZvaWQgMCB8fCBuICE9PSBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVhZHk6IHRydWUsXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZkb20sIHNob3cpIHtcbiAgICAgICAgICAgIHZhciBkb20gPSB2ZG9tLmRvbTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgZG9tLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3BsYXkgPSBkb20uc3R5bGUuZGlzcGxheTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXkgPT09IG5vbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmRvbS5kaXNwbGF5VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9tLnN0eWxlLmNzc1RleHQgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb20uc3R5bGUuZGlzcGxheSA9PT0gJycgJiYgYXZhbG9uKGRvbSkuY3NzKCdkaXNwbGF5JykgPT09IG5vbmUgJiZcbiAgICAgICAgICAgICAgICAgICAgLy8gZml4IGZpcmVmb3ggQlVHLOW/hemhu+aMguWIsOmhtemdouS4ilxuICAgICAgICAgICAgICAgICAgICBhdmFsb24uY29udGFpbnMoZG9tLm93bmVyRG9jdW1lbnQsIGRvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcGFyc2VEaXNwbGF5KGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5ICE9PSBub25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG5vbmU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZG9tLmRpc3BsYXlWYWx1ZSA9IGRpc3BsYXk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGNiID0gZnVuY3Rpb24gY2IoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb20uc3R5bGUuZGlzcGxheSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGF2YWxvbi5hcHBseUVmZmVjdChkb20sIHZkb20sIHtcbiAgICAgICAgICAgICAgICAgICAgaG9vazogc2hvdyA/ICdvbkVudGVyRG9uZScgOiAnb25MZWF2ZURvbmUnLFxuICAgICAgICAgICAgICAgICAgICBjYjogY2JcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgndGV4dCcsIHtcbiAgICAgICAgZGVsYXk6IHRydWUsXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgaWYgKG5vZGUuaXNWb2lkVGFnKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmVycm9yKCfoh6rpl63lkIjlhYPntKDkuI3og73kvb/nlKhtcy10ZXh0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSB7IG5vZGVOYW1lOiAnI3RleHQnLCBub2RlVmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSB9O1xuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5zcGxpY2UoMCwgbm9kZS5jaGlsZHJlbi5sZW5ndGgsIGNoaWxkKTtcbiAgICAgICAgICAgIGlmIChpbkJyb3dzZXIpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24uY2xlYXJIVE1MKG5vZGUuZG9tKTtcbiAgICAgICAgICAgICAgICBub2RlLmRvbS5hcHBlbmRDaGlsZChhdmFsb24udmRvbShjaGlsZCwgJ3RvRE9NJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ub2RlID0gY2hpbGQ7XG4gICAgICAgICAgICB2YXIgdHlwZSA9ICdleHByJztcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHRoaXMubmFtZSA9IHR5cGU7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlJCQxID0gYXZhbG9uLmRpcmVjdGl2ZXNbdHlwZV07XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZSQkMS51cGRhdGUuY2FsbChtZSwgbWUubm9kZSwgdmFsdWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnZXhwcicsIHtcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycgPyAnXFx1MjAwQicgOiB2YWx1ZTtcbiAgICAgICAgICAgIHZkb20ubm9kZVZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9SdWJ5TG91dnJlL2F2YWxvbi9pc3N1ZXMvMTgzNFxuICAgICAgICAgICAgaWYgKHZkb20uZG9tKSB2ZG9tLmRvbS5kYXRhID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ2F0dHInLCB7XG4gICAgICAgIGRpZmY6IGNzc0RpZmYsXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZkb20sIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSB2ZG9tLnByb3BzO1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghIXZhbHVlW2ldID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcHJvcHNbaV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNbaV0gPSB2YWx1ZVtpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9tID0gdmRvbS5kb207XG4gICAgICAgICAgICBpZiAoZG9tICYmIGRvbS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUF0dHJzKGRvbSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBhdmFsb24uZGlyZWN0aXZlKCdodG1sJywge1xuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZkb20sIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmJlZm9yZURpc3Bvc2UoKTtcblxuICAgICAgICAgICAgdGhpcy5pbm5lclJlbmRlciA9IGF2YWxvbi5zY2FuKCc8ZGl2IGNsYXNzPVwibXMtaHRtbC1jb250YWluZXJcIj4nICsgdmFsdWUgKyAnPC9kaXY+JywgdGhpcy52bSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBvbGRSb290ID0gdGhpcy5yb290O1xuICAgICAgICAgICAgICAgIGlmICh2ZG9tLmNoaWxkcmVuKSB2ZG9tLmNoaWxkcmVuLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgdmRvbS5jaGlsZHJlbiA9IG9sZFJvb3QuY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgdGhpcy5yb290ID0gdmRvbTtcbiAgICAgICAgICAgICAgICBpZiAodmRvbS5kb20pIGF2YWxvbi5jbGVhckhUTUwodmRvbS5kb20pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGJlZm9yZURpc3Bvc2U6IGZ1bmN0aW9uIGJlZm9yZURpc3Bvc2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbm5lclJlbmRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXJSZW5kZXIuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZWxheTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnaWYnLCB7XG4gICAgICAgIGRlbGF5OiB0cnVlLFxuICAgICAgICBwcmlvcml0eTogNSxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgIHRoaXMucGxhY2Vob2xkZXIgPSBjcmVhdGVBbmNob3IoJ2lmJyk7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSB0aGlzLm5vZGUucHJvcHM7XG4gICAgICAgICAgICBkZWxldGUgcHJvcHNbJ21zLWlmJ107XG4gICAgICAgICAgICBkZWxldGUgcHJvcHNbJzppZiddO1xuICAgICAgICAgICAgdGhpcy5mcmFnbWVudCA9IGF2YWxvbi52ZG9tKHRoaXMubm9kZSwgJ3RvSFRNTCcpO1xuICAgICAgICB9LFxuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgICAgICB2YXIgbiA9ICEhbmV3VmFsO1xuICAgICAgICAgICAgaWYgKG9sZFZhbCA9PT0gdm9pZCAwIHx8IG4gIT09IG9sZFZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBuO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2ZG9tLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNTaG93ID09PSB2b2lkIDAgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZVNjYW4odGhpcywgdmRvbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5pc1Nob3cgPSB2YWx1ZTtcbiAgICAgICAgICAgIHZhciBwbGFjZWhvbGRlciA9IHRoaXMucGxhY2Vob2xkZXI7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBwID0gcGxhY2Vob2xkZXIucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZVNjYW4odGhpcywgdmRvbSk7XG4gICAgICAgICAgICAgICAgcCAmJiBwLnJlcGxhY2VDaGlsZCh2ZG9tLmRvbSwgcGxhY2Vob2xkZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL+enu+mZpERPTVxuICAgICAgICAgICAgICAgIHRoaXMuYmVmb3JlRGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIHZkb20ubm9kZVZhbHVlID0gJ2lmJztcbiAgICAgICAgICAgICAgICB2ZG9tLm5vZGVOYW1lID0gJyNjb21tZW50JztcbiAgICAgICAgICAgICAgICBkZWxldGUgdmRvbS5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICB2YXIgZG9tID0gdmRvbS5kb207XG4gICAgICAgICAgICAgICAgdmFyIHAgPSBkb20gJiYgZG9tLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgdmRvbS5kb20gPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgICAgICAgICBpZiAocCkge1xuICAgICAgICAgICAgICAgICAgICBwLnJlcGxhY2VDaGlsZChwbGFjZWhvbGRlciwgZG9tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGJlZm9yZURpc3Bvc2U6IGZ1bmN0aW9uIGJlZm9yZURpc3Bvc2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbm5lclJlbmRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXJSZW5kZXIuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBjb250aW51ZVNjYW4oaW5zdGFuY2UsIHZkb20pIHtcbiAgICAgICAgdmFyIGlubmVyUmVuZGVyID0gaW5zdGFuY2UuaW5uZXJSZW5kZXIgPSBhdmFsb24uc2NhbihpbnN0YW5jZS5mcmFnbWVudCwgaW5zdGFuY2Uudm0pO1xuICAgICAgICBhdmFsb24uc2hhZG93Q29weSh2ZG9tLCBpbm5lclJlbmRlci5yb290KTtcbiAgICAgICAgZGVsZXRlIHZkb20ubm9kZVZhbHVlO1xuICAgIH1cblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ29uJywge1xuICAgICAgICBiZWZvcmVJbml0OiBmdW5jdGlvbiBiZWZvcmVJbml0KCkge1xuICAgICAgICAgICAgdGhpcy5nZXR0ZXIgPSBhdmFsb24ubm9vcDtcbiAgICAgICAgfSxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgIHZhciB2ZG9tID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgdmFyIHVuZGVybGluZSA9IHRoaXMubmFtZS5yZXBsYWNlKCdtcy1vbi0nLCAnZScpLnJlcGxhY2UoJy0nLCAnXycpO1xuICAgICAgICAgICAgdmFyIHV1aWQgPSB1bmRlcmxpbmUgKyAnXycgKyB0aGlzLmV4cHIucmVwbGFjZSgvXFxzL2csICcnKS5yZXBsYWNlKC9bXiRhLXpdL2lnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBmbiA9IGF2YWxvbi5ldmVudExpc3RlbmVyc1t1dWlkXTtcbiAgICAgICAgICAgIGlmICghZm4pIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gYWRkU2NvcGUodGhpcy5leHByKTtcbiAgICAgICAgICAgICAgICB2YXIgYm9keSA9IGFyclswXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycyA9IGFyclsxXTtcbiAgICAgICAgICAgICAgICBib2R5ID0gbWFrZUhhbmRsZShib2R5KTtcblxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMgPSBmaWx0ZXJzLnJlcGxhY2UoL19fdmFsdWVfXy9nLCAnJGV2ZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMgKz0gJ1xcbmlmKCRldmVudC4kcmV0dXJuKXtcXG5cXHRyZXR1cm47XFxufSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZXQgPSBbJ3RyeXsnLCAnXFx0dmFyIF9fdm1vZGVsX18gPSB0aGlzOycsICdcXHQnICsgZmlsdGVycywgJ1xcdHJldHVybiAnICsgYm9keSwgJ31jYXRjaChlKXthdmFsb24ubG9nKGUsIFwiaW4gb24gZGlyXCIpfSddLmZpbHRlcihmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgvXFxTLy50ZXN0KGVsKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZuID0gbmV3IEZ1bmN0aW9uKCckZXZlbnQnLCByZXQuam9pbignXFxuJykpO1xuICAgICAgICAgICAgICAgIGZuLnV1aWQgPSB1dWlkO1xuICAgICAgICAgICAgICAgIGF2YWxvbi5ldmVudExpc3RlbmVyc1t1dWlkXSA9IGZuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZG9tID0gYXZhbG9uLnZkb20odmRvbSwgJ3RvRE9NJyk7XG4gICAgICAgICAgICBkb20uX21zX2NvbnRleHRfID0gdGhpcy52bTtcblxuICAgICAgICAgICAgdGhpcy5ldmVudFR5cGUgPSB0aGlzLnBhcmFtLnJlcGxhY2UoL1xcLShcXGQpJC8sICcnKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtO1xuICAgICAgICAgICAgYXZhbG9uKGRvbSkuYmluZCh0aGlzLmV2ZW50VHlwZSwgZm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJlZm9yZURpc3Bvc2U6IGZ1bmN0aW9uIGJlZm9yZURpc3Bvc2UoKSB7XG4gICAgICAgICAgICBhdmFsb24odGhpcy5ub2RlLmRvbSkudW5iaW5kKHRoaXMuZXZlbnRUeXBlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHJmb3JBcyA9IC9cXHMrYXNcXHMrKFskXFx3XSspLztcbiAgICB2YXIgcmlkZW50ID0gL15bJGEtekEtWl9dWyRhLXpBLVowLTlfXSokLztcbiAgICB2YXIgcmludmFsaWQgPSAvXihudWxsfHVuZGVmaW5lZHxOYU58d2luZG93fHRoaXN8XFwkaW5kZXh8XFwkaWQpJC87XG4gICAgdmFyIHJhcmdzID0gL1skXFx3X10rL2c7XG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnZm9yJywge1xuICAgICAgICBkZWxheTogdHJ1ZSxcbiAgICAgICAgcHJpb3JpdHk6IDMsXG4gICAgICAgIGJlZm9yZUluaXQ6IGZ1bmN0aW9uIGJlZm9yZUluaXQoKSB7XG4gICAgICAgICAgICB2YXIgc3RyID0gdGhpcy5leHByLFxuICAgICAgICAgICAgICAgIGFzTmFtZTtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKHJmb3JBcywgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoIXJpZGVudC50ZXN0KGIpIHx8IHJpbnZhbGlkLnRlc3QoYikpIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLmVycm9yKCdhbGlhcyAnICsgYiArICcgaXMgaW52YWxpZCAtLS0gbXVzdCBiZSBhIHZhbGlkIEpTIGlkZW50aWZpZXIgd2hpY2ggaXMgbm90IGEgcmVzZXJ2ZWQgbmFtZS4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhc05hbWUgPSBiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGFyciA9IHN0ci5zcGxpdCgnIGluICcpO1xuICAgICAgICAgICAgdmFyIGt2ID0gYXJyWzBdLm1hdGNoKHJhcmdzKTtcbiAgICAgICAgICAgIGlmIChrdi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvL+ehruS/nWF2YWxvbi5fZWFjaOeahOWbnuiwg+acieS4ieS4quWPguaVsFxuICAgICAgICAgICAgICAgIGt2LnVuc2hpZnQoJyRrZXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZXhwciA9IGFyclsxXTtcbiAgICAgICAgICAgIHRoaXMua2V5TmFtZSA9IGt2WzBdO1xuICAgICAgICAgICAgdGhpcy52YWxOYW1lID0ga3ZbMV07XG4gICAgICAgICAgICB0aGlzLnNpZ25hdHVyZSA9IGF2YWxvbi5tYWtlSGFzaENvZGUoJ2ZvcicpO1xuICAgICAgICAgICAgaWYgKGFzTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXNOYW1lID0gYXNOYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5wYXJhbTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgIHZhciBjYiA9IHRoaXMudXNlckNiO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYiA9PT0gJ3N0cmluZycgJiYgY2IpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gYWRkU2NvcGUoY2IsICdmb3InKTtcbiAgICAgICAgICAgICAgICB2YXIgYm9keSA9IG1ha2VIYW5kbGUoYXJyWzBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJDYiA9IG5ldyBGdW5jdGlvbignJGV2ZW50JywgJ3ZhciBfX3Ztb2RlbF9fID0gdGhpc1xcbnJldHVybiAnICsgYm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm5vZGUuZm9yRGlyID0gdGhpczsgLy/mmrTpnLLnu5ljb21wb25lbnQvaW5kZXguanPkuK3nmoRyZXNldFBhcmVudENoaWxkcmVu5pa55rOV5L2/55SoXG4gICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gWyc8ZGl2PicsIHRoaXMuZnJhZ21lbnQsICc8IS0tJywgdGhpcy5zaWduYXR1cmUsICctLT48L2Rpdj4nXS5qb2luKCcnKTtcbiAgICAgICAgICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlmZjogZnVuY3Rpb24gZGlmZihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIHRyYWNlSWRzID0gY3JlYXRlRnJhZ21lbnRzKHRoaXMsIG5ld1ZhbCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYWNrSWRzID09PSB2b2lkIDApIHJldHVybiB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFja0lkcyAhPT0gdHJhY2VJZHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYWNrSWRzID0gdHJhY2VJZHM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMucHJlRnJhZ21lbnRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudHMgPSB0aGlzLmZyYWdtZW50cyB8fCBbXTtcbiAgICAgICAgICAgICAgICBtb3VudExpc3QodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpZmZMaXN0KHRoaXMpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3QodGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnVzZXJDYikge1xuICAgICAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lLnVzZXJDYi5jYWxsKG1lLnZtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncmVuZGVyZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBtZS5iZWdpbi5kb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduYXR1cmU6IG1lLnNpZ25hdHVyZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnVwZGF0aW5nO1xuICAgICAgICB9LFxuICAgICAgICBiZWZvcmVEaXNwb3NlOiBmdW5jdGlvbiBiZWZvcmVEaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5mcmFnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICBlbC5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0VHJhY2VLZXkoaXRlbSkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBpdGVtO1xuICAgICAgICByZXR1cm4gaXRlbSAmJiB0eXBlID09PSAnb2JqZWN0JyA/IGl0ZW0uJGhhc2hjb2RlIDogdHlwZSArICc6JyArIGl0ZW07XG4gICAgfVxuXG4gICAgLy/liJvlu7rkuIDnu4RmcmFnbWVudOeahOiZmuaLn0RPTVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZyYWdtZW50cyhpbnN0YW5jZSwgb2JqKSB7XG4gICAgICAgIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSBBcnJheS5pc0FycmF5KG9iaik7XG4gICAgICAgICAgICB2YXIgaWRzID0gW107XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnRzID0gW10sXG4gICAgICAgICAgICAgICAgaSA9IDA7XG5cbiAgICAgICAgICAgIGluc3RhbmNlLmlzQXJyYXkgPSBhcnJheTtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5mcmFnbWVudHMpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wcmVGcmFnbWVudHMgPSBpbnN0YW5jZS5mcmFnbWVudHM7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmVhY2gob2JqLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgayA9IGFycmF5ID8gZ2V0VHJhY2VLZXkodmFsdWUpIDoga2V5O1xuXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogayxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogaSsrXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZHMucHVzaChrKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5mcmFnbWVudHMgPSBmcmFnbWVudHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5lYWNoKG9iaiwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluICQkc2tpcEFycmF5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGsgPSBhcnJheSA/IGdldFRyYWNlS2V5KHZhbHVlKSA6IGtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50cy5wdXNoKG5ldyBWRnJhZ21lbnQoW10sIGssIHZhbHVlLCBpKyspKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkcy5wdXNoKGspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuZnJhZ21lbnRzID0gZnJhZ21lbnRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGlkcy5qb2luKCc7OycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdW50TGlzdChpbnN0YW5jZSkge1xuICAgICAgICB2YXIgYXJncyA9IGluc3RhbmNlLmZyYWdtZW50cy5tYXAoZnVuY3Rpb24gKGZyYWdtZW50LCBpbmRleCkge1xuICAgICAgICAgICAgRnJhZ21lbnREZWNvcmF0b3IoZnJhZ21lbnQsIGluc3RhbmNlLCBpbmRleCk7XG4gICAgICAgICAgICBzYXZlSW5DYWNoZShpbnN0YW5jZS5jYWNoZSwgZnJhZ21lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGxpc3QgPSBpbnN0YW5jZS5wYXJlbnRDaGlsZHJlbjtcbiAgICAgICAgdmFyIGkgPSBsaXN0LmluZGV4T2YoaW5zdGFuY2UuYmVnaW4pO1xuICAgICAgICBsaXN0LnNwbGljZS5hcHBseShsaXN0LCBbaSArIDEsIDBdLmNvbmNhdChhcmdzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlmZkxpc3QoaW5zdGFuY2UpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gaW5zdGFuY2UuY2FjaGU7XG4gICAgICAgIHZhciBuZXdDYWNoZSA9IHt9O1xuICAgICAgICB2YXIgZnV6enkgPSBbXTtcbiAgICAgICAgdmFyIGxpc3QgPSBpbnN0YW5jZS5wcmVGcmFnbWVudHM7XG5cbiAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgZWwuX2Rpc3Bvc2UgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpbnN0YW5jZS5mcmFnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoYywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudCA9IGlzSW5DYWNoZShjYWNoZSwgYy5rZXkpO1xuICAgICAgICAgICAgLy/lj5blh7rkuYvliY3nmoTmlofmoaPnoo7niYdcbiAgICAgICAgICAgIGlmIChmcmFnbWVudCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBmcmFnbWVudC5fZGlzcG9zZTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5vbGRJbmRleCA9IGZyYWdtZW50LmluZGV4O1xuICAgICAgICAgICAgICAgIGZyYWdtZW50LmluZGV4ID0gaW5kZXg7IC8vIOebuOW9k+S6jiBjLmluZGV4XG5cbiAgICAgICAgICAgICAgICByZXNldFZNKGZyYWdtZW50LnZtLCBpbnN0YW5jZS5rZXlOYW1lKTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudC52bVtpbnN0YW5jZS52YWxOYW1lXSA9IGMudmFsO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50LnZtW2luc3RhbmNlLmtleU5hbWVdID0gaW5zdGFuY2UuaXNBcnJheSA/IGluZGV4IDogZnJhZ21lbnQua2V5O1xuICAgICAgICAgICAgICAgIHNhdmVJbkNhY2hlKG5ld0NhY2hlLCBmcmFnbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v5aaC5p6c5om+5LiN5Yiw5bCx6L+b6KGM5qih57OK5pCc57SiXG4gICAgICAgICAgICAgICAgZnV6enkucHVzaChjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZ1enp5LmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudCA9IGZ1enp5TWF0Y2hDYWNoZShjYWNoZSwgYy5rZXkpO1xuICAgICAgICAgICAgaWYgKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgLy/ph43lpI3liKnnlKhcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5vbGRJbmRleCA9IGZyYWdtZW50LmluZGV4O1xuICAgICAgICAgICAgICAgIGZyYWdtZW50LmtleSA9IGMua2V5O1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBmcmFnbWVudC52YWwgPSBjLnZhbDtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBmcmFnbWVudC5pbmRleCA9IGMuaW5kZXg7XG5cbiAgICAgICAgICAgICAgICBmcmFnbWVudC52bVtpbnN0YW5jZS52YWxOYW1lXSA9IHZhbDtcbiAgICAgICAgICAgICAgICBmcmFnbWVudC52bVtpbnN0YW5jZS5rZXlOYW1lXSA9IGluc3RhbmNlLmlzQXJyYXkgPyBpbmRleCA6IGZyYWdtZW50LmtleTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZnJhZ21lbnQuX2Rpc3Bvc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgYyA9IG5ldyBWRnJhZ21lbnQoW10sIGMua2V5LCBjLnZhbCwgYy5pbmRleCk7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSBGcmFnbWVudERlY29yYXRvcihjLCBpbnN0YW5jZSwgYy5pbmRleCk7XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKGZyYWdtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNhdmVJbkNhY2hlKG5ld0NhY2hlLCBmcmFnbWVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluc3RhbmNlLmZyYWdtZW50cyA9IGxpc3Q7XG4gICAgICAgIGxpc3Quc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgaW5zdGFuY2UuY2FjaGUgPSBuZXdDYWNoZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldFZNKHZtLCBhLCBiKSB7XG4gICAgICAgIGlmIChhdmFsb24uY29uZmlnLmluUHJveHlNb2RlKSB7XG4gICAgICAgICAgICB2bS4kYWNjZXNzb3JzW2FdLnZhbHVlID0gTmFOO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdm0uJGFjY2Vzc29yc1thXS5zZXQoTmFOKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUxpc3QoaW5zdGFuY2UpIHtcbiAgICAgICAgdmFyIGJlZm9yZSA9IGluc3RhbmNlLmJlZ2luLmRvbTtcbiAgICAgICAgdmFyIHBhcmVudCA9IGJlZm9yZS5wYXJlbnROb2RlO1xuICAgICAgICB2YXIgbGlzdCA9IGluc3RhbmNlLmZyYWdtZW50cztcbiAgICAgICAgdmFyIGVuZCA9IGluc3RhbmNlLmVuZC5kb207XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpdGVtOyBpdGVtID0gbGlzdFtpXTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5fZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICBpdGVtLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpdGVtLm9sZEluZGV4ICE9PSBpdGVtLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSBpdGVtLnRvRnJhZ21lbnQoKTtcbiAgICAgICAgICAgICAgICB2YXIgaXNFbmQgPSBiZWZvcmUubmV4dFNpYmxpbmcgPT09IG51bGw7XG4gICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShmLCBiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgIGlmIChpc0VuZCAmJiAhcGFyZW50LmNvbnRhaW5zKGVuZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShlbmQsIGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmVmb3JlID0gaXRlbS5zcGxpdDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2ggPSBpbnN0YW5jZS5wYXJlbnRDaGlsZHJlbjtcbiAgICAgICAgdmFyIHN0YXJ0SW5kZXggPSBjaC5pbmRleE9mKGluc3RhbmNlLmJlZ2luKTtcbiAgICAgICAgdmFyIGVuZEluZGV4ID0gY2guaW5kZXhPZihpbnN0YW5jZS5lbmQpO1xuXG4gICAgICAgIGxpc3Quc3BsaWNlLmFwcGx5KGNoLCBbc3RhcnRJbmRleCArIDEsIGVuZEluZGV4IC0gc3RhcnRJbmRleF0uY29uY2F0KGxpc3QpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGZyYWdtZW50XG4gICAgICogQHBhcmFtIHt0eXBlfSB0aGlzXG4gICAgICogQHBhcmFtIHt0eXBlfSBpbmRleFxuICAgICAqIEByZXR1cm5zIHsga2V5LCB2YWwsIGluZGV4LCBvbGRJbmRleCwgdGhpcywgZG9tLCBzcGxpdCwgdm19XG4gICAgICovXG4gICAgZnVuY3Rpb24gRnJhZ21lbnREZWNvcmF0b3IoZnJhZ21lbnQsIGluc3RhbmNlLCBpbmRleCkge1xuICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICBkYXRhW2luc3RhbmNlLmtleU5hbWVdID0gaW5zdGFuY2UuaXNBcnJheSA/IGluZGV4IDogZnJhZ21lbnQua2V5O1xuICAgICAgICBkYXRhW2luc3RhbmNlLnZhbE5hbWVdID0gZnJhZ21lbnQudmFsO1xuICAgICAgICBpZiAoaW5zdGFuY2UuYXNOYW1lKSB7XG4gICAgICAgICAgICBkYXRhW2luc3RhbmNlLmFzTmFtZV0gPSBpbnN0YW5jZS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdm0gPSBmcmFnbWVudC52bSA9IHBsYXRmb3JtLml0ZW1GYWN0b3J5KGluc3RhbmNlLnZtLCB7XG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5zdGFuY2UuaXNBcnJheSkge1xuICAgICAgICAgICAgdm0uJHdhdGNoKGluc3RhbmNlLnZhbE5hbWUsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLnZhbHVlICYmIGluc3RhbmNlLnZhbHVlLnNldCkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS52YWx1ZS5zZXQodm1baW5zdGFuY2Uua2V5TmFtZV0sIGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdm0uJHdhdGNoKGluc3RhbmNlLnZhbE5hbWUsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UudmFsdWVbZnJhZ21lbnQua2V5XSA9IGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyYWdtZW50LmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGZyYWdtZW50LmlubmVyUmVuZGVyID0gYXZhbG9uLnNjYW4oaW5zdGFuY2UuZnJhZ21lbnQsIHZtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgb2xkUm9vdCA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgIGFwLnB1c2guYXBwbHkoZnJhZ21lbnQuY2hpbGRyZW4sIG9sZFJvb3QuY2hpbGRyZW4pO1xuICAgICAgICAgICAgdGhpcy5yb290ID0gZnJhZ21lbnQ7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfVxuICAgIC8vIOaWsOS9jee9rjog5pen5L2N572uXG4gICAgZnVuY3Rpb24gaXNJbkNhY2hlKGNhY2hlLCBpZCkge1xuICAgICAgICB2YXIgYyA9IGNhY2hlW2lkXTtcbiAgICAgICAgaWYgKGMpIHtcbiAgICAgICAgICAgIHZhciBhcnIgPSBjLmFycjtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgICAgICBpZiAoYXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBhcnIucG9wKCk7XG4gICAgICAgICAgICAgICAgaWYgKCFhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGMuYXJyID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgY2FjaGVbaWRdO1xuICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9bMSwxLDFdIG51bWJlcjEgbnVtYmVyMV8gbnVtYmVyMV9fXG4gICAgZnVuY3Rpb24gc2F2ZUluQ2FjaGUoY2FjaGUsIGNvbXBvbmVudCkge1xuICAgICAgICB2YXIgdHJhY2tJZCA9IGNvbXBvbmVudC5rZXk7XG4gICAgICAgIGlmICghY2FjaGVbdHJhY2tJZF0pIHtcbiAgICAgICAgICAgIGNhY2hlW3RyYWNrSWRdID0gY29tcG9uZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGMgPSBjYWNoZVt0cmFja0lkXTtcbiAgICAgICAgICAgIHZhciBhcnIgPSBjLmFyciB8fCAoYy5hcnIgPSBbXSk7XG4gICAgICAgICAgICBhcnIucHVzaChjb21wb25lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnV6enlNYXRjaENhY2hlKGNhY2hlKSB7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAodmFyIGlkIGluIGNhY2hlKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gaWQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gaXNJbkNhY2hlKGNhY2hlLCBrZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy/moLnmja5WTeeahOWxnuaAp+WAvOaIluihqOi+vuW8j+eahOWAvOWIh+aNouexu+WQje+8jG1zLWNsYXNzPSd4eHggeXl5IHp6ejpmbGFnJ1xuICAgIC8vaHR0cDovL3d3dy5jbmJsb2dzLmNvbS9ydWJ5bG91dnJlL2FyY2hpdmUvMjAxMi8xMi8xNy8yODE4NTQwLmh0bWxcbiAgICBmdW5jdGlvbiBjbGFzc05hbWVzKCkge1xuICAgICAgICB2YXIgY2xhc3NlcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIHZhciBhcmdUeXBlID0gdHlwZW9mIGFyZztcbiAgICAgICAgICAgIGlmIChhcmdUeXBlID09PSAnc3RyaW5nJyB8fCBhcmdUeXBlID09PSAnbnVtYmVyJyB8fCBhcmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goYXJnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ1R5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGFyZykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJnLmhhc093blByb3BlcnR5KGtleSkgJiYgYXJnW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNsYXNzZXMuam9pbignICcpO1xuICAgIH1cblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ2NsYXNzJywge1xuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IHRoaXMudHlwZTtcbiAgICAgICAgICAgIHZhciB2ZG9tID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgdmFyIGNsYXNzRXZlbnQgPSB2ZG9tLmNsYXNzRXZlbnQgfHwge307XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2hvdmVyJykge1xuICAgICAgICAgICAgICAgIC8v5Zyo56e75Ye656e75YWl5pe25YiH5o2i57G75ZCNXG4gICAgICAgICAgICAgICAgY2xhc3NFdmVudC5tb3VzZWVudGVyID0gYWN0aXZhdGVDbGFzcztcbiAgICAgICAgICAgICAgICBjbGFzc0V2ZW50Lm1vdXNlbGVhdmUgPSBhYmFuZG9uQ2xhc3M7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhY3RpdmUnKSB7XG4gICAgICAgICAgICAgICAgLy/lnKjojrflvpfnhKbngrnml7bliIfmjaLnsbvlkI1cbiAgICAgICAgICAgICAgICBjbGFzc0V2ZW50LnRhYkluZGV4ID0gdmRvbS5wcm9wcy50YWJpbmRleCB8fCAtMTtcbiAgICAgICAgICAgICAgICBjbGFzc0V2ZW50Lm1vdXNlZG93biA9IGFjdGl2YXRlQ2xhc3M7XG4gICAgICAgICAgICAgICAgY2xhc3NFdmVudC5tb3VzZXVwID0gYWJhbmRvbkNsYXNzO1xuICAgICAgICAgICAgICAgIGNsYXNzRXZlbnQubW91c2VsZWF2ZSA9IGFiYW5kb25DbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZkb20uY2xhc3NFdmVudCA9IGNsYXNzRXZlbnQ7XG5cbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKG5ld1ZhbCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2xkVmFsID09PSB2b2lkIDAgfHwgb2xkVmFsICE9PSBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gY2xhc3NOYW1lO1xuXG4gICAgICAgICAgICAgICAgdmRvbVsnY2hhbmdlLScgKyB0eXBlXSA9IGNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkb20gPSB2ZG9tLmRvbTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgZG9tLm5vZGVUeXBlID09IDEpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaXJUeXBlID0gdGhpcy50eXBlO1xuICAgICAgICAgICAgICAgIHZhciBjaGFuZ2UgPSAnY2hhbmdlLScgKyBkaXJUeXBlO1xuICAgICAgICAgICAgICAgIHZhciBjbGFzc0V2ZW50ID0gdmRvbS5jbGFzc0V2ZW50O1xuICAgICAgICAgICAgICAgIGlmIChjbGFzc0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gY2xhc3NFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09ICd0YWJJbmRleCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21baV0gPSBjbGFzc0V2ZW50W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFsb24uYmluZChkb20sIGksIGNsYXNzRXZlbnRbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZkb20uY2xhc3NFdmVudCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbmFtZXMgPSBbJ2NsYXNzJywgJ2hvdmVyJywgJ2FjdGl2ZSddO1xuICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpclR5cGUgIT09IHR5cGUpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbSAmJiBzZXRDbGFzcyhkb20sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRDbGFzcyA9IGRvbS5nZXRBdHRyaWJ1dGUoY2hhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGRDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWxvbihkb20pLnJlbW92ZUNsYXNzKG9sZENsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gJ2NoYW5nZS0nICsgdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRpcmVjdGl2ZXMuYWN0aXZlID0gZGlyZWN0aXZlcy5ob3ZlciA9IGRpcmVjdGl2ZXNbJ2NsYXNzJ107XG5cbiAgICB2YXIgY2xhc3NNYXAgPSB7XG4gICAgICAgIG1vdXNlZW50ZXI6ICdjaGFuZ2UtaG92ZXInLFxuICAgICAgICBtb3VzZWxlYXZlOiAnY2hhbmdlLWhvdmVyJyxcbiAgICAgICAgbW91c2Vkb3duOiAnY2hhbmdlLWFjdGl2ZScsXG4gICAgICAgIG1vdXNldXA6ICdjaGFuZ2UtYWN0aXZlJ1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBhY3RpdmF0ZUNsYXNzKGUpIHtcbiAgICAgICAgdmFyIGVsZW0gPSBlLnRhcmdldDtcbiAgICAgICAgYXZhbG9uKGVsZW0pLmFkZENsYXNzKGVsZW0uZ2V0QXR0cmlidXRlKGNsYXNzTWFwW2UudHlwZV0pIHx8ICcnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhYmFuZG9uQ2xhc3MoZSkge1xuICAgICAgICB2YXIgZWxlbSA9IGUudGFyZ2V0O1xuICAgICAgICB2YXIgbmFtZSA9IGNsYXNzTWFwW2UudHlwZV07XG4gICAgICAgIGF2YWxvbihlbGVtKS5yZW1vdmVDbGFzcyhlbGVtLmdldEF0dHJpYnV0ZShuYW1lKSB8fCAnJyk7XG4gICAgICAgIGlmIChuYW1lICE9PSAnY2hhbmdlLWFjdGl2ZScpIHtcbiAgICAgICAgICAgIGF2YWxvbihlbGVtKS5yZW1vdmVDbGFzcyhlbGVtLmdldEF0dHJpYnV0ZSgnY2hhbmdlLWFjdGl2ZScpIHx8ICcnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldENsYXNzKGRvbSwgbmVvKSB7XG4gICAgICAgIHZhciBvbGQgPSBkb20uZ2V0QXR0cmlidXRlKCdjaGFuZ2UtY2xhc3MnKTtcbiAgICAgICAgaWYgKG9sZCAhPT0gbmVvKSB7XG4gICAgICAgICAgICBhdmFsb24oZG9tKS5yZW1vdmVDbGFzcyhvbGQpLmFkZENsYXNzKG5lbyk7XG4gICAgICAgICAgICBkb20uc2V0QXR0cmlidXRlKCdjaGFuZ2UtY2xhc3MnLCBuZW8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0TG9uZ0lEKGFjdGl2YXRlQ2xhc3MpO1xuICAgIGdldExvbmdJRChhYmFuZG9uQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gbG9va3VwT3B0aW9uKHZkb20sIHZhbHVlcykge1xuICAgICAgICB2ZG9tLmNoaWxkcmVuICYmIHZkb20uY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGlmIChlbC5ub2RlTmFtZSA9PT0gJ29wdGlvbicpIHtcbiAgICAgICAgICAgICAgICBzZXRPcHRpb24oZWwsIHZhbHVlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvb2t1cE9wdGlvbihlbCwgdmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0T3B0aW9uKHZkb20sIHZhbHVlcykge1xuICAgICAgICB2YXIgcHJvcHMgPSB2ZG9tLnByb3BzO1xuICAgICAgICBpZiAoISgnZGlzYWJsZWQnIGluIHByb3BzKSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZ2V0T3B0aW9uVmFsdWUodmRvbSwgcHJvcHMpO1xuICAgICAgICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUgfHwgJycpLnRyaW0oKTtcbiAgICAgICAgICAgIHByb3BzLnNlbGVjdGVkID0gdmFsdWVzLmluZGV4T2YodmFsdWUpICE9PSAtMTtcblxuICAgICAgICAgICAgaWYgKHZkb20uZG9tKSB7XG4gICAgICAgICAgICAgICAgdmRvbS5kb20uc2VsZWN0ZWQgPSBwcm9wcy5zZWxlY3RlZDtcbiAgICAgICAgICAgICAgICB2YXIgdiA9IHZkb20uZG9tLnNlbGVjdGVkOyAvL+W/hemhu+WKoOS4iui/meS4qizpmLLmraLnp7vlh7roioLngrlzZWxlY3RlZOWkseaViFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0T3B0aW9uVmFsdWUodmRvbSwgcHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3BzICYmICd2YWx1ZScgaW4gcHJvcHMpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wcy52YWx1ZSArICcnO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcnIgPSBbXTtcbiAgICAgICAgdmRvbS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goZWwubm9kZVZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWwubm9kZU5hbWUgPT09ICcjZG9jdW1lbnQtZnJhZ21lbnQnKSB7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goZ2V0T3B0aW9uVmFsdWUoZWwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcnIuam9pbignJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRWYWx1ZSh2ZG9tLCBhcnIpIHtcbiAgICAgICAgdmRvbS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSAnb3B0aW9uJykge1xuICAgICAgICAgICAgICAgIGlmIChlbC5wcm9wcy5zZWxlY3RlZCA9PT0gdHJ1ZSkgYXJyLnB1c2goZ2V0T3B0aW9uVmFsdWUoZWwsIGVsLnByb3BzKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgZ2V0U2VsZWN0ZWRWYWx1ZShlbCwgYXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuXG4gICAgdmFyIHVwZGF0ZURhdGFBY3Rpb25zID0ge1xuICAgICAgICBpbnB1dDogZnVuY3Rpb24gaW5wdXQocHJvcCkge1xuICAgICAgICAgICAgLy/lpITnkIbljZXkuKp2YWx1ZeWAvOWkhOeQhlxuICAgICAgICAgICAgdmFyIGZpZWxkID0gdGhpcztcbiAgICAgICAgICAgIHByb3AgPSBwcm9wIHx8ICd2YWx1ZSc7XG4gICAgICAgICAgICB2YXIgZG9tID0gZmllbGQuZG9tO1xuICAgICAgICAgICAgdmFyIHJhd1ZhbHVlID0gZG9tW3Byb3BdO1xuICAgICAgICAgICAgdmFyIHBhcnNlZFZhbHVlID0gZmllbGQucGFyc2VWYWx1ZShyYXdWYWx1ZSk7XG5cbiAgICAgICAgICAgIC8v5pyJ5pe25YCZcGFyc2XlkI7kuIDoh7Qsdm3kuI3kvJrmlLnlj5gs5L2GaW5wdXTph4zpnaLnmoTlgLxcbiAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gcmF3VmFsdWU7XG4gICAgICAgICAgICBmaWVsZC5zZXRWYWx1ZShwYXJzZWRWYWx1ZSk7XG4gICAgICAgICAgICBkdXBsZXhDYihmaWVsZCk7XG4gICAgICAgICAgICB2YXIgcG9zID0gZmllbGQucG9zO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAoZG9tLmNhcmV0KSB7XG4gICAgICAgICAgICAgICAgZmllbGQuc2V0Q2FyZXQoZG9tLCBwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy92bS5hYWEgPSAnMTIzNDU2Nzg5MCdcbiAgICAgICAgICAgIC8v5aSE55CGIDxpbnB1dCBtcy1kdXBsZXg9J0BhYWF8bGltaXRCeSg4KScvPnt7QGFhYX19IOi/meenjeagvOW8j+WMluWQjOatpeS4jeS4gOiHtOeahOaDheWGtSBcbiAgICAgICAgfSxcbiAgICAgICAgcmFkaW86IGZ1bmN0aW9uIHJhZGlvKCkge1xuICAgICAgICAgICAgdmFyIGZpZWxkID0gdGhpcztcbiAgICAgICAgICAgIGlmIChmaWVsZC5pc0NoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gIWZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgICAgIGZpZWxkLnNldFZhbHVlKHZhbCk7XG4gICAgICAgICAgICAgICAgZHVwbGV4Q2IoZmllbGQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVEYXRhQWN0aW9ucy5pbnB1dC5jYWxsKGZpZWxkKTtcbiAgICAgICAgICAgICAgICBmaWVsZC52YWx1ZSA9IE5hTjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2hlY2tib3g6IGZ1bmN0aW9uIGNoZWNrYm94KCkge1xuICAgICAgICAgICAgdmFyIGZpZWxkID0gdGhpcztcbiAgICAgICAgICAgIHZhciBhcnJheSA9IGZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFycmF5KSkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKCdtcy1kdXBsZXjlupTnlKjkuo5jaGVja2JveOS4iuimgeWvueW6lOS4gOS4quaVsOe7hCcpO1xuICAgICAgICAgICAgICAgIGFycmF5ID0gW2FycmF5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtZXRob2QgPSBmaWVsZC5kb20uY2hlY2tlZCA/ICdlbnN1cmUnIDogJ3JlbW92ZSc7XG4gICAgICAgICAgICBpZiAoYXJyYXlbbWV0aG9kXSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBmaWVsZC5wYXJzZVZhbHVlKGZpZWxkLmRvbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgYXJyYXlbbWV0aG9kXSh2YWwpO1xuICAgICAgICAgICAgICAgIGR1cGxleENiKGZpZWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX190ZXN0X18gPSBhcnJheTtcbiAgICAgICAgfSxcbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiBzZWxlY3QoKSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHZhbCA9IGF2YWxvbihmaWVsZC5kb20pLnZhbCgpOyAvL+Wtl+espuS4suaIluWtl+espuS4suaVsOe7hFxuICAgICAgICAgICAgaWYgKHZhbCArICcnICE9PSB0aGlzLnZhbHVlICsgJycpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v6L2s5o2i5biD5bCU5pWw57uE5oiW5YW25LuWXG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IHZhbC5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZC5wYXJzZVZhbHVlKHYpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWwgPSBmaWVsZC5wYXJzZVZhbHVlKHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpZWxkLnNldFZhbHVlKHZhbCk7XG4gICAgICAgICAgICAgICAgZHVwbGV4Q2IoZmllbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50ZWRpdGFibGU6IGZ1bmN0aW9uIGNvbnRlbnRlZGl0YWJsZSgpIHtcbiAgICAgICAgICAgIHVwZGF0ZURhdGFBY3Rpb25zLmlucHV0LmNhbGwodGhpcywgJ2lubmVySFRNTCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGR1cGxleENiKGZpZWxkKSB7XG4gICAgICAgIGlmIChmaWVsZC51c2VyQ2IpIHtcbiAgICAgICAgICAgIGZpZWxkLnVzZXJDYi5jYWxsKGZpZWxkLnZtLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NoYW5nZWQnLFxuICAgICAgICAgICAgICAgIHRhcmdldDogZmllbGQuZG9tXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZURhdGFIYW5kbGUoZXZlbnQpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzO1xuICAgICAgICB2YXIgZmllbGQgPSBlbGVtLl9tc19kdXBsZXhfO1xuICAgICAgICBpZiAoZWxlbS5jb21wb3NpbmcpIHtcbiAgICAgICAgICAgIC8v6Ziy5q2ib25wcm9wZXJ0eWNoYW5nZeW8leWPkeeIhuagiFxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtLnZhbHVlID09PSBmaWVsZC52YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgIGlmIChlbGVtLmNhcmV0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBwb3MgPSBmaWVsZC5nZXRDYXJldChlbGVtKTtcbiAgICAgICAgICAgICAgICBmaWVsZC5wb3MgPSBwb3M7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgIGlmIChmaWVsZC5kZWJvdW5jZVRpbWUgPiA0KSB7XG4gICAgICAgICAgICB2YXIgdGltZXN0YW1wID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHZhciBsZWZ0ID0gdGltZXN0YW1wIC0gZmllbGQudGltZSB8fCAwO1xuICAgICAgICAgICAgZmllbGQudGltZSA9IHRpbWVzdGFtcDtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgICAgICBpZiAobGVmdCA+PSBmaWVsZC5kZWJvdW5jZVRpbWUpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVEYXRhQWN0aW9uc1tmaWVsZC5kdHlwZV0uY2FsbChmaWVsZCk7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UqL1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZmllbGQuZGVib3VuY2VJRCk7XG4gICAgICAgICAgICAgICAgZmllbGQuZGVib3VuY2VJRCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVEYXRhQWN0aW9uc1tmaWVsZC5kdHlwZV0uY2FsbChmaWVsZCk7XG4gICAgICAgICAgICAgICAgfSwgbGVmdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cGRhdGVEYXRhQWN0aW9uc1tmaWVsZC5kdHlwZV0uY2FsbChmaWVsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmNoYW5nZUZpbHRlciA9IC9cXHxcXHMqY2hhbmdlXFxiLztcbiAgICB2YXIgcmRlYm91bmNlRmlsdGVyID0gL1xcfFxccypkZWJvdW5jZSg/OlxcKChbXildKylcXCkpPy87XG4gICAgZnVuY3Rpb24gZHVwbGV4QmVmb3JlSW5pdCgpIHtcbiAgICAgICAgdmFyIGV4cHIgPSB0aGlzLmV4cHI7XG4gICAgICAgIGlmIChyY2hhbmdlRmlsdGVyLnRlc3QoZXhwcikpIHtcbiAgICAgICAgICAgIHRoaXMuaXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGV4cHIgPSBleHByLnJlcGxhY2UocmNoYW5nZUZpbHRlciwgJycpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtYXRjaCA9IGV4cHIubWF0Y2gocmRlYm91bmNlRmlsdGVyKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBleHByID0gZXhwci5yZXBsYWNlKHJkZWJvdW5jZUZpbHRlciwgJycpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVib3VuY2VUaW1lID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKSB8fCAzMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHByID0gZXhwcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gZHVwbGV4SW5pdCgpIHtcbiAgICAgICAgdmFyIGV4cHIgPSB0aGlzLmV4cHI7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlO1xuICAgICAgICB2YXIgZXR5cGUgPSBub2RlLnByb3BzLnR5cGU7XG4gICAgICAgIHRoaXMucGFyc2VWYWx1ZSA9IHBhcnNlVmFsdWU7XG4gICAgICAgIC8v5aSE55CG5pWw5o2u6L2s5o2i5ZmoXG4gICAgICAgIHZhciBwYXJzZXJzID0gdGhpcy5wYXJhbSxcbiAgICAgICAgICAgIGR0eXBlO1xuICAgICAgICB2YXIgaXNDaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHBhcnNlcnMgPSBwYXJzZXJzID8gcGFyc2Vycy5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgaWYgKGEgPT09ICdjaGVja2VkJykge1xuICAgICAgICAgICAgICAgIGlzQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgbm9kZS5kdXBsZXggPSB0aGlzO1xuICAgICAgICBpZiAocmNoZWNrZWRUeXBlLnRlc3QoZXR5cGUpICYmIGlzQ2hlY2tlZCkge1xuICAgICAgICAgICAgLy/lpoLmnpzmmK9yYWRpbywgY2hlY2tib3gs5Yik5a6a55So5oi35L2/55So5LqGY2hlY2tlZOagvOW8j+WHveaVsOayoeaciVxuICAgICAgICAgICAgcGFyc2VycyA9IFtdO1xuICAgICAgICAgICAgZHR5cGUgPSAncmFkaW8nO1xuICAgICAgICAgICAgdGhpcy5pc0NoZWNrZWQgPSBpc0NoZWNrZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXJzZXJzID0gcGFyc2VycztcbiAgICAgICAgaWYgKCEvaW5wdXR8dGV4dGFyZWF8c2VsZWN0Ly50ZXN0KG5vZGUubm9kZU5hbWUpKSB7XG4gICAgICAgICAgICBpZiAoJ2NvbnRlbnRlZGl0YWJsZScgaW4gbm9kZS5wcm9wcykge1xuICAgICAgICAgICAgICAgIGR0eXBlID0gJ2NvbnRlbnRlZGl0YWJsZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWR0eXBlKSB7XG4gICAgICAgICAgICBkdHlwZSA9IG5vZGUubm9kZU5hbWUgPT09ICdzZWxlY3QnID8gJ3NlbGVjdCcgOiBldHlwZSA9PT0gJ2NoZWNrYm94JyA/ICdjaGVja2JveCcgOiBldHlwZSA9PT0gJ3JhZGlvJyA/ICdyYWRpbycgOiAnaW5wdXQnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHR5cGUgPSBkdHlwZTtcblxuICAgICAgICAvL+WIpOWumuaYr+WQpuS9v+eUqOS6hiBjaGFuZ2UgZGVib3VuY2Ug6L+H5ruk5ZmoXG4gICAgICAgIC8vIHRoaXMuaXNDaGVja2VkID0gL2Jvb2xlYW4vLnRlc3QocGFyc2VycylcbiAgICAgICAgaWYgKGR0eXBlICE9PSAnaW5wdXQnICYmIGR0eXBlICE9PSAnY29udGVudGVkaXRhYmxlJykge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuaXNDaGFuZ2U7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kZWJvdW5jZVRpbWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNDaGVja2VkKSB7XG4gICAgICAgICAgICB0aGlzLmlzU3RyaW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjYiA9IG5vZGUucHJvcHNbJ2RhdGEtZHVwbGV4LWNoYW5nZWQnXTtcbiAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICB2YXIgYXJyID0gYWRkU2NvcGUoY2IsICd4eCcpO1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBtYWtlSGFuZGxlKGFyclswXSk7XG4gICAgICAgICAgICB0aGlzLnVzZXJDYiA9IG5ldyBGdW5jdGlvbignJGV2ZW50JywgJ3ZhciBfX3Ztb2RlbF9fID0gdGhpc1xcbnJldHVybiAnICsgYm9keSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZHVwbGV4RGlmZihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShuZXdWYWwpKSB7XG4gICAgICAgICAgICBpZiAobmV3VmFsICsgJycgIT09IHRoaXMuY29tcGFyZVZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcGFyZVZhbCA9IG5ld1ZhbCArICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3VmFsID0gdGhpcy5wYXJzZVZhbHVlKG5ld1ZhbCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNDaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5ld1ZhbCArPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXdWYWwgIT09IHRoaXMuY29tcGFyZVZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcGFyZVZhbCA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGR1cGxleEJpbmQodmRvbSwgYWRkRXZlbnQpIHtcbiAgICAgICAgdmFyIGRvbSA9IHZkb20uZG9tO1xuICAgICAgICB0aGlzLmRvbSA9IGRvbTtcbiAgICAgICAgdGhpcy52ZG9tID0gdmRvbTtcbiAgICAgICAgdGhpcy5kdXBsZXhDYiA9IHVwZGF0ZURhdGFIYW5kbGU7XG4gICAgICAgIGRvbS5fbXNfZHVwbGV4XyA9IHRoaXM7XG4gICAgICAgIC8v57uR5a6a5LqL5Lu2XG4gICAgICAgIGFkZEV2ZW50KGRvbSwgdGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlSGlqYWNrID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICAvLyMyNzIgSUU5LUlFMTEsIGZpcmVmb3hcbiAgICAgICAgdmFyIHNldHRlcnMgPSB7fTtcbiAgICAgICAgdmFyIGFwcm90byA9IEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlO1xuICAgICAgICB2YXIgYnByb3RvID0gSFRNTFRleHRBcmVhRWxlbWVudC5wcm90b3R5cGU7XG4gICAgICAgIHZhciBuZXdTZXR0ZXIgPSBmdW5jdGlvbiBuZXdTZXR0ZXIodmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgc2V0dGVyc1t0aGlzLnRhZ05hbWVdLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLl9tc19kdXBsZXhfO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNhcmV0ICYmIGRhdGEgJiYgZGF0YS5pc1N0cmluZykge1xuICAgICAgICAgICAgICAgIGRhdGEuZHVwbGV4Q2IuY2FsbCh0aGlzLCB7IHR5cGU6ICdzZXR0ZXInIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgaW5wdXRQcm90byA9IEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlO1xuICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhpbnB1dFByb3RvKTsgLy/mlYXmhI/lvJXlj5FJRTYtOOetiea1j+iniOWZqOaKpemUmVxuICAgICAgICBzZXR0ZXJzWydJTlBVVCddID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihhcHJvdG8sICd2YWx1ZScpLnNldDtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXByb3RvLCAndmFsdWUnLCB7XG4gICAgICAgICAgICBzZXQ6IG5ld1NldHRlclxuICAgICAgICB9KTtcbiAgICAgICAgc2V0dGVyc1snVEVYVEFSRUEnXSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYnByb3RvLCAndmFsdWUnKS5zZXQ7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicHJvdG8sICd2YWx1ZScsIHtcbiAgICAgICAgICAgIHNldDogbmV3U2V0dGVyXG4gICAgICAgIH0pO1xuICAgICAgICB2YWx1ZUhpamFjayA9IGZhbHNlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy/lnKhjaHJvbWUgNDPkuK0gbXMtZHVwbGV457uI5LqO5LiN6ZyA6KaB5L2/55So5a6a5pe25Zmo5a6e546w5Y+M5ZCR57uR5a6a5LqGXG4gICAgICAgIC8vIGh0dHA6Ly91cGRhdGVzLmh0bWw1cm9ja3MuY29tLzIwMTUvMDQvRE9NLWF0dHJpYnV0ZXMtbm93LW9uLXRoZS1wcm90b3R5cGVcbiAgICAgICAgLy8gaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xandBOG10Q2x3eEktUUp1SFQ3ODcyWjBweHBaejhQQmtmMmJHQWJzVXRxcy9lZGl0P3BsaT0xXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2YWwpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGs7IGsgPSB0aGlzLnBhcnNlcnNbaSsrXTspIHtcbiAgICAgICAgICAgIHZhciBmbiA9IGF2YWxvbi5wYXJzZXJzW2tdO1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgdmFsID0gZm4uY2FsbCh0aGlzLCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgdmFyIHVwZGF0ZVZpZXcgPSB7XG4gICAgICAgIGlucHV0OiBmdW5jdGlvbiBpbnB1dCgpIHtcbiAgICAgICAgICAgIC8v5aSE55CG5Y2V5LiqdmFsdWXlgLzlpITnkIZcbiAgICAgICAgICAgIHZhciB2ZG9tID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZSArICcnO1xuICAgICAgICAgICAgdmRvbS5kb20udmFsdWUgPSB2ZG9tLnByb3BzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZUNoZWNrZWQ6IGZ1bmN0aW9uIHVwZGF0ZUNoZWNrZWQodmRvbSwgY2hlY2tlZCkge1xuICAgICAgICAgICAgaWYgKHZkb20uZG9tKSB7XG4gICAgICAgICAgICAgICAgdmRvbS5kb20uZGVmYXVsdENoZWNrZWQgPSB2ZG9tLmRvbS5jaGVja2VkID0gY2hlY2tlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmFkaW86IGZ1bmN0aW9uIHJhZGlvKCkge1xuICAgICAgICAgICAgLy/lpITnkIbljZXkuKpjaGVja2Vk5bGe5oCnXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZTtcbiAgICAgICAgICAgIHZhciBub2RlVmFsdWUgPSBub2RlLnByb3BzLnZhbHVlO1xuICAgICAgICAgICAgdmFyIGNoZWNrZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0NoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICBjaGVja2VkID0gISF0aGlzLnZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGVja2VkID0gdGhpcy52YWx1ZSArICcnID09PSBub2RlVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlLnByb3BzLmNoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgICAgICAgdXBkYXRlVmlldy51cGRhdGVDaGVja2VkKG5vZGUsIGNoZWNrZWQpO1xuICAgICAgICB9LFxuICAgICAgICBjaGVja2JveDogZnVuY3Rpb24gY2hlY2tib3goKSB7XG4gICAgICAgICAgICAvL+WkhOeQhuWkmuS4qmNoZWNrZWTlsZ7mgKdcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgdmFyIHByb3BzID0gbm9kZS5wcm9wcztcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHByb3BzLnZhbHVlICsgJyc7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gW10uY29uY2F0KHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgdmFyIGNoZWNrZWQgPSB2YWx1ZXMuc29tZShmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWwgKyAnJyA9PT0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcHJvcHMuZGVmYXVsdENoZWNrZWQgPSBwcm9wcy5jaGVja2VkID0gY2hlY2tlZDtcbiAgICAgICAgICAgIHVwZGF0ZVZpZXcudXBkYXRlQ2hlY2tlZChub2RlLCBjaGVja2VkKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiBzZWxlY3QoKSB7XG4gICAgICAgICAgICAvL+WkhOeQhuWtkOe6p+eahHNlbGVjdGVk5bGe5oCnXG4gICAgICAgICAgICB2YXIgYSA9IEFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkgPyB0aGlzLnZhbHVlLm1hcChTdHJpbmcpIDogdGhpcy52YWx1ZSArICcnO1xuICAgICAgICAgICAgbG9va3VwT3B0aW9uKHRoaXMubm9kZSwgYSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRlZGl0YWJsZTogZnVuY3Rpb24gY29udGVudGVkaXRhYmxlKCkge1xuICAgICAgICAgICAgLy/lpITnkIbljZXkuKppbm5lckhUTUwgXG5cbiAgICAgICAgICAgIHZhciB2bm9kZXMgPSBmcm9tU3RyaW5nKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgdmFyIGZyYWdtZW50ID0gY3JlYXRlRnJhZ21lbnQoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSB2bm9kZXNbaSsrXTspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBhdmFsb24udmRvbShlbCwgJ3RvRE9NJyk7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXZhbG9uLmNsZWFySFRNTCh0aGlzLmRvbSkuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICAgICAgdmFyIGxpc3QgPSB0aGlzLm5vZGUuY2hpbGRyZW47XG4gICAgICAgICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShsaXN0LCB2bm9kZXMpO1xuXG4gICAgICAgICAgICB0aGlzLmR1cGxleENiLmNhbGwodGhpcy5kb20pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qIFxuICAgICAqIOmAmui/h+e7keWumuS6i+S7tuWQjOatpXZtb2RlbFxuICAgICAqIOaAu+WFseacieS4ieenjeaWueW8j+WQjOatpeinhuWbvlxuICAgICAqIDEuIOWQhOenjeS6i+S7tiBpbnB1dCwgY2hhbmdlLCBjbGljaywgcHJvcGVydHljaGFuZ2UsIGtleWRvd24uLi5cbiAgICAgKiAyLiB2YWx1ZeWxnuaAp+mHjeWGmVxuICAgICAqIDMuIOWumuaXtuWZqOi9ruivolxuICAgICAqL1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlRGF0YUV2ZW50cyhkb20sIGRhdGEpIHtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHt9O1xuICAgICAgICAvL+a3u+WKoOmcgOimgeebkeWQrOeahOS6i+S7tlxuICAgICAgICBzd2l0Y2ggKGRhdGEuZHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICAgICAgICBldmVudHMuY2xpY2sgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICAgICAgICBldmVudHMuY2hhbmdlID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnRlZGl0YWJsZSc6XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaXNDaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cy5ibHVyID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmFsb24ubW9kZXJuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93JDEud2Via2l0VVJMKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaHR0cDovL2NvZGUubWV0YWdlci5kZS9zb3VyY2UveHJlZi9XZWJLaXQvTGF5b3V0VGVzdHMvZmFzdC9ldmVudHMvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTExMDc0MlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy53ZWJraXRFZGl0YWJsZUNvbnRlbnRDaGFuZ2VkID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93JDEuTXV0YXRpb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5ET01DaGFyYWN0ZXJEYXRhTW9kaWZpZWQgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmlucHV0ID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMua2V5ZG93biA9IHVwZGF0ZU1vZGVsS2V5RG93bjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5wYXN0ZSA9IHVwZGF0ZU1vZGVsRGVsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuY3V0ID0gdXBkYXRlTW9kZWxEZWxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5mb2N1cyA9IGNsb3NlQ29tcG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuYmx1ciA9IG9wZW5Db21wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5pc0NoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmNoYW5nZSA9IHVwZGF0ZURhdGFIYW5kbGU7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9odHRwOi8vd3d3LmNuYmxvZ3MuY29tL3J1Ynlsb3V2cmUvYXJjaGl2ZS8yMDEzLzAyLzE3LzI5MTQ2MDQuaHRtbFxuICAgICAgICAgICAgICAgICAgICAvL2h0dHA6Ly93d3cubWF0dHM0MTEuY29tL3Bvc3QvaW50ZXJuZXQtZXhwbG9yZXItOS1vbmlucHV0L1xuICAgICAgICAgICAgICAgICAgICBpZiAobXNpZSA8IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL0lFNi0455qEcHJvcGVydHljaGFuZ2XmnInpl67popgs56ys5LiA5qyh55SoSlPkv67mlLnlgLzml7bkuI3kvJrop6blj5Es6ICM5LiU5L2g5piv5YWo6YOo5riF56m6dmFsdWXkuZ/kuI3kvJrop6blj5FcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSUU555qEcHJvcGVydHljaGFuZ2XkuI3mlK/mjIHoh6rliqjlrozmiJAs6YCA5qC8LOWIoOmZpCzlpI3liLYs6LS057KYLOWJquWIh+aIlueCueWHu+WPs+i+ueeahOWwj1jnmoTmuIXnqbrmk43kvZxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5wcm9wZXJ0eWNoYW5nZSA9IHVwZGF0ZU1vZGVsSGFjaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5wYXN0ZSA9IHVwZGF0ZU1vZGVsRGVsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuY3V0ID0gdXBkYXRlTW9kZWxEZWxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSUU55Zyo56ys5LiA5qyh5Yig6Zmk5a2X56ym5pe25LiN5Lya6Kem5Y+Rb25pbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmtleXVwID0gdXBkYXRlTW9kZWxLZXlEb3duO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmlucHV0ID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5jb21wb3NpdGlvbnN0YXJ0ID0gb3BlbkNvbXBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/lvq7ova/mi7zpn7PovpPlhaXms5XnmoTpl67popjpnIDopoHlnKhjb21wb3NpdGlvbmVuZOS6i+S7tuS4reWkhOeQhlxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmNvbXBvc2l0aW9uZW5kID0gY2xvc2VDb21wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvVHlwZWRBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgLy/lpITnkIbkvY7niYjmnKznmoTmoIflh4bmtY/op4jlmags6YCa6L+HSW50OEFycmF56L+b6KGM5Yy65YiGXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIS9cXFtuYXRpdmUgY29kZVxcXS8udGVzdCh3aW5kb3ckMS5JbnQ4QXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmtleWRvd24gPSB1cGRhdGVNb2RlbEtleURvd247IC8vc2FmYXJpIDwgNSBvcGVyYSA8IDExXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnBhc3RlID0gdXBkYXRlTW9kZWxEZWxheTsgLy9zYWZhcmkgPCA1XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmN1dCA9IHVwZGF0ZU1vZGVsRGVsYXk7IC8vc2FmYXJpIDwgNSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93JDEubmV0c2NhcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCA8PSAzLjYgZG9lc24ndCBmaXJlIHRoZSAnaW5wdXQnIGV2ZW50IHdoZW4gdGV4dCBpcyBmaWxsZWQgaW4gdGhyb3VnaCBhdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLkRPTUF1dG9Db21wbGV0ZSA9IHVwZGF0ZURhdGFIYW5kbGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKC9wYXNzd29yZHx0ZXh0Ly50ZXN0KGRvbS50eXBlKSkge1xuICAgICAgICAgICAgZXZlbnRzLmZvY3VzID0gb3BlbkNhcmV0OyAvL+WIpOWumuaYr+WQpuS9v+eUqOWFieagh+S/ruato+WKn+iDvSBcbiAgICAgICAgICAgIGV2ZW50cy5ibHVyID0gY2xvc2VDYXJldDtcbiAgICAgICAgICAgIGRhdGEuZ2V0Q2FyZXQgPSBnZXRDYXJldDtcbiAgICAgICAgICAgIGRhdGEuc2V0Q2FyZXQgPSBzZXRDYXJldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICBhdmFsb24uYmluZChkb20sIG5hbWUsIGV2ZW50c1tuYW1lXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVNb2RlbEhhY2soZSkge1xuICAgICAgICBpZiAoZS5wcm9wZXJ0eU5hbWUgPT09ICd2YWx1ZScpIHtcbiAgICAgICAgICAgIHVwZGF0ZURhdGFIYW5kbGUuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU1vZGVsRGVsYXkoZSkge1xuICAgICAgICB2YXIgZWxlbSA9IHRoaXM7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdXBkYXRlRGF0YUhhbmRsZS5jYWxsKGVsZW0sIGUpO1xuICAgICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvcGVuQ2FyZXQoKSB7XG4gICAgICAgIHRoaXMuY2FyZXQgPSB0cnVlO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGNsb3NlQ2FyZXQoKSB7XG4gICAgICAgIHRoaXMuY2FyZXQgPSBmYWxzZTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBvcGVuQ29tcG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMuY29tcG9zaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBjbG9zZUNvbXBvc2l0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5jb21wb3NpbmcgPSBmYWxzZTtcbiAgICAgICAgdXBkYXRlTW9kZWxEZWxheS5jYWxsKHRoaXMsIGUpO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIHVwZGF0ZU1vZGVsS2V5RG93bihlKSB7XG4gICAgICAgIHZhciBrZXkgPSBlLmtleUNvZGU7XG4gICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAvLyAgICBjb21tYW5kICAgICAgICAgICAgbW9kaWZpZXJzICAgICAgICAgICAgICAgICAgIGFycm93c1xuICAgICAgICBpZiAoa2V5ID09PSA5MSB8fCAxNSA8IGtleSAmJiBrZXkgPCAxOSB8fCAzNyA8PSBrZXkgJiYga2V5IDw9IDQwKSByZXR1cm47XG4gICAgICAgIHVwZGF0ZURhdGFIYW5kbGUuY2FsbCh0aGlzLCBlKTtcbiAgICB9XG5cbiAgICBnZXRTaG9ydElEKG9wZW5DYXJldCk7XG4gICAgZ2V0U2hvcnRJRChjbG9zZUNhcmV0KTtcbiAgICBnZXRTaG9ydElEKG9wZW5Db21wb3NpdGlvbik7XG4gICAgZ2V0U2hvcnRJRChjbG9zZUNvbXBvc2l0aW9uKTtcbiAgICBnZXRTaG9ydElEKHVwZGF0ZURhdGFIYW5kbGUpO1xuICAgIGdldFNob3J0SUQodXBkYXRlTW9kZWxIYWNrKTtcbiAgICBnZXRTaG9ydElEKHVwZGF0ZU1vZGVsRGVsYXkpO1xuICAgIGdldFNob3J0SUQodXBkYXRlTW9kZWxLZXlEb3duKTtcblxuICAgIC8vSUU2LTjopoHlpITnkIblhYnmoIfml7bpnIDopoHlvILmraVcbiAgICB2YXIgbWF5QmVBc3luYyA9IGZ1bmN0aW9uIG1heUJlQXN5bmMoZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIHNldENhcmV0KHRhcmdldCwgY3Vyc29yUG9zaXRpb24pIHtcbiAgICAgICAgdmFyIHJhbmdlJCQxO1xuICAgICAgICBpZiAodGFyZ2V0LmNyZWF0ZVRleHRSYW5nZSkge1xuICAgICAgICAgICAgbWF5QmVBc3luYyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UkJDEgPSB0YXJnZXQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UkJDEuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmFuZ2UkJDEubW92ZUVuZCgnY2hhcmFjdGVyJywgY3Vyc29yUG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIHJhbmdlJCQxLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgY3Vyc29yUG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIHJhbmdlJCQxLnNlbGVjdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQuZm9jdXMoKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQuc2VsZWN0aW9uU3RhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5zZXRTZWxlY3Rpb25SYW5nZShjdXJzb3JQb3NpdGlvbiwgY3Vyc29yUG9zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICBmdW5jdGlvbiBnZXRDYXJldCh0YXJnZXQpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gMDtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICAgICAgdmFyIHJhbmdlJCQxO1xuICAgICAgICB2YXIgdGV4dElucHV0UmFuZ2U7XG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciBlbmRSYW5nZTtcblxuICAgICAgICBpZiAodGFyZ2V0LnNlbGVjdGlvblN0YXJ0ICsgdGFyZ2V0LnNlbGVjdGlvbkVuZCA+IC0xKSB7XG4gICAgICAgICAgICBzdGFydCA9IHRhcmdldC5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhbmdlJCQxID0gZG9jdW1lbnQkMS5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcblxuICAgICAgICAgICAgaWYgKHJhbmdlJCQxICYmIHJhbmdlJCQxLnBhcmVudEVsZW1lbnQoKSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgbGVuID0gdGFyZ2V0LnZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSB0YXJnZXQudmFsdWUucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcblxuICAgICAgICAgICAgICAgIHRleHRJbnB1dFJhbmdlID0gdGFyZ2V0LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHRleHRJbnB1dFJhbmdlLm1vdmVUb0Jvb2ttYXJrKHJhbmdlJCQxLmdldEJvb2ttYXJrKCkpO1xuXG4gICAgICAgICAgICAgICAgZW5kUmFuZ2UgPSB0YXJnZXQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICAgICAgZW5kUmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dFJhbmdlLmNvbXBhcmVFbmRQb2ludHMoJ1N0YXJ0VG9FbmQnLCBlbmRSYW5nZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGxlbjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IC10ZXh0SW5wdXRSYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC1sZW4pO1xuICAgICAgICAgICAgICAgICAgICBzdGFydCArPSBub3JtYWxpemVkVmFsdWUuc2xpY2UoMCwgc3RhcnQpLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdGFydDtcbiAgICB9XG5cbiAgICBhdmFsb24uZGlyZWN0aXZlKCdkdXBsZXgnLCB7XG4gICAgICAgIHByaW9yaXR5OiA5OTk5OTk5LFxuICAgICAgICBiZWZvcmVJbml0OiBkdXBsZXhCZWZvcmVJbml0LFxuICAgICAgICBpbml0OiBkdXBsZXhJbml0LFxuICAgICAgICBkaWZmOiBkdXBsZXhEaWZmLFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2ZG9tLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRvbSkge1xuICAgICAgICAgICAgICAgIGR1cGxleEJpbmQuY2FsbCh0aGlzLCB2ZG9tLCB1cGRhdGVEYXRhRXZlbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v5aaC5p6c5LiN5pSv5oyBaW5wdXQudmFsdWXnmoRPYmplY3QuZGVmaW5lUHJvcGVydHnnmoTlsZ7mgKfmlK/mjIEsXG4gICAgICAgICAgICAvL+mcgOimgemAmui/h+i9ruivouWQjOatpSwgY2hyb21lIDQy5Y+K5Lul5LiL54mI5pys6ZyA6KaB6L+Z5LiqaGFja1xuICAgICAgICAgICAgcG9sbFZhbHVlLmNhbGwodGhpcywgYXZhbG9uLm1zaWUsIHZhbHVlSGlqYWNrKTtcbiAgICAgICAgICAgIC8v5pu05paw6KeG5Zu+XG5cbiAgICAgICAgICAgIHVwZGF0ZVZpZXdbdGhpcy5kdHlwZV0uY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcG9sbFZhbHVlKGlzSUUsIHZhbHVlSGlqYWNrJCQxKSB7XG4gICAgICAgIHZhciBkb20gPSB0aGlzLmRvbTtcbiAgICAgICAgaWYgKHRoaXMuaXNTdHJpbmcgJiYgdmFsdWVIaWphY2skJDEgJiYgIWlzSUUgJiYgIWRvbS52YWx1ZUhpamFjaykge1xuICAgICAgICAgICAgZG9tLnZhbHVlSGlqYWNrID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghYXZhbG9uLmNvbnRhaW5zKGF2YWxvbi5yb290LCBkb20pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tLnZhbHVlSGlqYWNrKHsgdHlwZTogJ3BvbGwnIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDMwKTtcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbElEO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF2YWxvbi5fX3BvbGxWYWx1ZSA9IHBvbGxWYWx1ZTsgLy9leHBvcnQgdG8gdGVzdFxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChhdmFsb24ubXNpZSA8IDgpIHtcbiAgICAgICAgdmFyIG9sZFVwZGF0ZSA9IHVwZGF0ZVZpZXcudXBkYXRlQ2hlY2tlZDtcbiAgICAgICAgdXBkYXRlVmlldy51cGRhdGVDaGVja2VkID0gZnVuY3Rpb24gKHZkb20sIGNoZWNrZWQpIHtcbiAgICAgICAgICAgIHZhciBkb20gPSB2ZG9tLmRvbTtcbiAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkVXBkYXRlKHZkb20sIGNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICBkb20uZmlyc3RDaGVja2VkSXQgPSAxO1xuICAgICAgICAgICAgICAgIH0sIGRvbS5maXJzdENoZWNrZWRJdCA/IDMxIDogMTYpO1xuICAgICAgICAgICAgICAgIC8vSUU2LDcgY2hlY2tib3gsIHJhZGlv5piv5L2/55SoZGVmYXVsdENoZWNrZWTmjqfliLbpgInkuK3nirbmgIHvvIxcbiAgICAgICAgICAgICAgICAvL+W5tuS4lOimgeWFiOiuvue9rmRlZmF1bHRDaGVja2Vk5ZCO6K6+572uY2hlY2tlZFxuICAgICAgICAgICAgICAgIC8v5bm25LiU5b+F6aG76K6+572u5bu26L+fKOWboOS4uuW/hemhu+aPkuWFpURPTeagkeaJjeeUn+aViClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhdmFsb24uZGlyZWN0aXZlKCdydWxlcycsIHtcbiAgICAgICAgZGlmZjogZnVuY3Rpb24gZGlmZihydWxlcykge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHJ1bGVzKSkge1xuICAgICAgICAgICAgICAgIHZhciB2ZG9tID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgICAgIHZkb20ucnVsZXMgPSBwbGF0Zm9ybS50b0pzb24ocnVsZXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gaXNSZWdFeHAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGF2YWxvbi50eXBlKHZhbHVlKSA9PT0gJ3JlZ2V4cCc7XG4gICAgfVxuICAgIHZhciBybWFpbCA9IC9eXFx3KyhbLSsuXVxcdyspKkBcXHcrKFstLl1cXHcrKSpcXC5cXHcrKFstLl1cXHcrKSokL2k7XG4gICAgdmFyIHJ1cmwgPSAvXihmdHB8aHR0cHxodHRwcyk6XFwvXFwvKFxcdys6ezAsMX1cXHcqQCk/KFxcUyspKDpbMC05XSspPyhcXC98XFwvKFtcXHcjITouPys9JiVAIVxcLVxcL10pKT8kLztcbiAgICBmdW5jdGlvbiBpc0NvcnJlY3REYXRlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIC8v5piv5a2X56ym5Liy5L2G5LiN6IO95piv56m65a2X56ymXG4gICAgICAgICAgICB2YXIgYXJyID0gdmFsdWUuc3BsaXQoXCItXCIpOyAvL+WPr+S7peiiqy3liIfmiJAz5Lu977yM5bm25LiU56ysMeS4quaYrzTkuKrlrZfnrKZcbiAgICAgICAgICAgIGlmIChhcnIubGVuZ3RoID09PSAzICYmIGFyclswXS5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICB2YXIgeWVhciA9IH5+YXJyWzBdOyAvL+WFqOmDqOi9rOaNouS4uumdnui0n+aVtOaVsFxuICAgICAgICAgICAgICAgIHZhciBtb250aCA9IH5+YXJyWzFdIC0gMTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IH5+YXJyWzJdO1xuICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkLmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiYgZC5nZXRNb250aCgpID09PSBtb250aCAmJiBkLmdldERhdGUoKSA9PT0gZGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2FkZm9ybS92YWxpZGF0b3IuanMvYmxvYi9tYXN0ZXIvdmFsaWRhdG9yLmpzXG4gICAgYXZhbG9uLnNoYWRvd0NvcHkoYXZhbG9uLnZhbGlkYXRvcnMsIHtcbiAgICAgICAgcGF0dGVybjoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+W/hemhu+WMuemFjXt7cGF0dGVybn196L+Z5qC355qE5qC85byPJyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtID0gZmllbGQuZG9tO1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZmllbGQuZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmVnRXhwKGRhdGEucGF0dGVybikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGg1cGF0dGVybiA9IGVsZW0uZ2V0QXR0cmlidXRlKFwicGF0dGVyblwiKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wYXR0ZXJuID0gbmV3IFJlZ0V4cCgnXig/OicgKyBoNXBhdHRlcm4gKyAnKSQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV4dChkYXRhLnBhdHRlcm4udGVzdCh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGlnaXRzOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAn5b+F6aG75pW05pWwJyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIC8v5pW05pWwXG4gICAgICAgICAgICAgICAgbmV4dCgvXlxcLT9cXGQrJC8udGVzdCh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbnVtYmVyOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAn5b+F6aG75pWw5a2XJyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIC8v5pWw5YC8XG4gICAgICAgICAgICAgICAgbmV4dCghIXZhbHVlICYmIGlzRmluaXRlKHZhbHVlKSk7IC8vIGlzRmluaXRlKCcnKSAtLT4gdHJ1ZVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbm9yZXF1aXJlZDoge1xuICAgICAgICAgICAgbWVzc2FnZTogJycsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh2YWx1ZSwgZmllbGQsIG5leHQpIHtcbiAgICAgICAgICAgICAgICBuZXh0KHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICflv4XpobvloavlhpknLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgbmV4dCh2YWx1ZSAhPT0gJycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXF1YWx0bzoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+Wvhueggei+k+WFpeS4jeS4gOiHtCcsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh2YWx1ZSwgZmllbGQsIG5leHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBTdHJpbmcoZmllbGQuZGF0YS5lcXVhbHRvKTtcbiAgICAgICAgICAgICAgICB2YXIgb3RoZXIgPSBhdmFsb24oZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpKS52YWwoKSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIG5leHQodmFsdWUgPT09IG90aGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICfml6XmnJ/moLzlvI/kuI3mraPnoa4nLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBmaWVsZC5kYXRhO1xuICAgICAgICAgICAgICAgIGlmIChpc1JlZ0V4cChkYXRhLmRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoZGF0YS5kYXRlLnRlc3QodmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KGlzQ29ycmVjdERhdGUodmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cmw6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdVUkzmoLzlvI/kuI3mraPnoa4nLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgbmV4dChydXJsLnRlc3QodmFsdWUpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVtYWlsOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAnZW1haWzmoLzlvI/kuI3mraPnoa4nLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgbmV4dChybWFpbC50ZXN0KHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtaW5sZW5ndGg6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICfmnIDlsJHovpPlhaV7e21pbmxlbmd0aH195Liq5a2XJyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBudW0gPSBwYXJzZUludChmaWVsZC5kYXRhLm1pbmxlbmd0aCwgMTApO1xuICAgICAgICAgICAgICAgIG5leHQodmFsdWUubGVuZ3RoID49IG51bSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtYXhsZW5ndGg6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICfmnIDlpJrovpPlhaV7e21heGxlbmd0aH195Liq5a2XJyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBudW0gPSBwYXJzZUludChmaWVsZC5kYXRhLm1heGxlbmd0aCwgMTApO1xuICAgICAgICAgICAgICAgIG5leHQodmFsdWUubGVuZ3RoIDw9IG51bSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtaW46IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICfovpPlhaXlgLzkuI3og73lsI/kuo57e21pbn19JyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBudW0gPSBwYXJzZUludChmaWVsZC5kYXRhLm1pbiwgMTApO1xuICAgICAgICAgICAgICAgIG5leHQocGFyc2VGbG9hdCh2YWx1ZSkgPj0gbnVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1heDoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+i+k+WFpeWAvOS4jeiDveWkp+S6jnt7bWF4fX0nLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGZpZWxkLmRhdGEubWF4LCAxMCk7XG4gICAgICAgICAgICAgICAgbmV4dChwYXJzZUZsb2F0KHZhbHVlKSA8PSBudW0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2hzOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAn5b+F6aG75piv5Lit5paH5a2X56ymJyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIG5leHQoL15bXFx1NGUwMC1cXHU5ZmE1XSskLy50ZXN0KHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgdmFsaURpciA9IGF2YWxvbi5kaXJlY3RpdmUoJ3ZhbGlkYXRlJywge1xuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKHZhbGlkYXRvcikge1xuICAgICAgICAgICAgdmFyIHZkb20gPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICBpZiAodmRvbS52YWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QodmFsaWRhdG9yKSkge1xuICAgICAgICAgICAgICAgIC8v5rOo5oSP77yM6L+Z5LiqRm9ybeagh+etvueahOiZmuaLn0RPTeacieS4pOS4qumqjOivgeWvueixoVxuICAgICAgICAgICAgICAgIC8v5LiA5Liq5pivdm1WYWxpZGF0b3LvvIzlroPmmK/nlKjmiLdWTeS4iueahOmCo+S4quWOn+Wni+WtkOWvueixoe+8jOS5n+aYr+S4gOS4qlZNXG4gICAgICAgICAgICAgICAgLy/kuIDkuKrmmK92YWxpZGF0b3LvvIzlroPmmK92bVZhbGlkYXRvci4kbW9kZWzvvIwg6L+Z5piv5Li65LqG6Ziy5q2iSUU277yNOOa3u+WKoOWtkOWxnuaAp+aXtua3u+WKoOeahGhhY2tcbiAgICAgICAgICAgICAgICAvL+S5n+WPr+S7peensOS5i+S4unNhZmVWYWxpZGF0ZVxuICAgICAgICAgICAgICAgIHZkb20udm1WYWxpZGF0b3IgPSB2YWxpZGF0b3I7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yID0gcGxhdGZvcm0udG9Kc29uKHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yLnZkb20gPSB2ZG9tO1xuICAgICAgICAgICAgICAgIHZkb20udmFsaWRhdG9yID0gdmFsaWRhdG9yO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsaURpci5kZWZhdWx0cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yW25hbWVdID0gdmFsaURpci5kZWZhdWx0c1tuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IuZmllbGRzID0gdmFsaWRhdG9yLmZpZWxkcyB8fCBbXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSkge1xuXG4gICAgICAgICAgICB2YXIgdmFsaWRhdG9yID0gdmRvbS52YWxpZGF0b3I7XG4gICAgICAgICAgICB2YXIgZG9tID0gdmFsaWRhdG9yLmRvbSA9IHZkb20uZG9tO1xuICAgICAgICAgICAgZG9tLl9tc192YWxpZGF0ZV8gPSB2YWxpZGF0b3I7XG4gICAgICAgICAgICB2YXIgZmllbGRzID0gdmFsaWRhdG9yLmZpZWxkcztcbiAgICAgICAgICAgIGNvbGxlY3RGZWlsZCh2ZG9tLmNoaWxkcmVuLCBmaWVsZHMsIHZhbGlkYXRvcik7XG4gICAgICAgICAgICBhdmFsb24uYmluZChkb2N1bWVudCwgJ2ZvY3VzaW4nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBkb20gPSBlLnRhcmdldDtcbiAgICAgICAgICAgICAgICB2YXIgZHVwbGV4ID0gZG9tLl9tc19kdXBsZXhfO1xuICAgICAgICAgICAgICAgIHZhciB2ZG9tID0gKGR1cGxleCB8fCB7fSkudmRvbTtcbiAgICAgICAgICAgICAgICBpZiAoZHVwbGV4ICYmIHZkb20ucnVsZXMgJiYgIWR1cGxleC52YWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWxvbi5BcnJheS5lbnN1cmUoZmllbGRzLCBkdXBsZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kVmFsaWRhdGVFdmVudChkdXBsZXgsIHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy/kuLrkuobmlrnkvr/nlKjmiLfmiYvliqjmiafooYzpqozor4HvvIzmiJHku6zpnIDopoHkuLrljp/lp4t2bVZhbGlkYXRl5LiK5re75Yqg5LiA5Liqb25NYW51YWzmlrnms5VcbiAgICAgICAgICAgIHZhciB2ID0gdmRvbS52bVZhbGlkYXRvcjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdi5vbk1hbnVhbCA9IG9uTWFudWFsO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIGRlbGV0ZSB2ZG9tLnZtVmFsaWRhdG9yO1xuXG4gICAgICAgICAgICBkb20uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgJ25vdmFsaWRhdGUnKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gb25NYW51YWwoKSB7XG4gICAgICAgICAgICAgICAgdmFsaURpci52YWxpZGF0ZUFsbC5jYWxsKHZhbGlkYXRvciwgdmFsaWRhdG9yLm9uVmFsaWRhdGVBbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAodmFsaWRhdG9yLnZhbGlkYXRlQWxsSW5TdWJtaXQpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24uYmluZChkb20sICdzdWJtaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9uTWFudWFsKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQWxsOiBmdW5jdGlvbiB2YWxpZGF0ZUFsbChjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHZhbGlkYXRvciA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgdmRvbSA9IHRoaXMudmRvbTtcbiAgICAgICAgICAgIHZhciBmaWVsZHMgPSB2YWxpZGF0b3IuZmllbGRzID0gW107XG4gICAgICAgICAgICBjb2xsZWN0RmVpbGQodmRvbS5jaGlsZHJlbiwgZmllbGRzLCB2YWxpZGF0b3IpO1xuICAgICAgICAgICAgdmFyIGZuID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiB2YWxpZGF0b3Iub25WYWxpZGF0ZUFsbDtcbiAgICAgICAgICAgIHZhciBwcm9taXNlcyA9IHZhbGlkYXRvci5maWVsZHMuZmlsdGVyKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIHZhciBlbCA9IGZpZWxkLmRvbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWwgJiYgIWVsLmRpc2FibGVkICYmIHZhbGlkYXRvci5kb20uY29udGFpbnMoZWwpO1xuICAgICAgICAgICAgfSkubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxpRGlyLnZhbGlkYXRlKGZpZWxkLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHVuaXEgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhc29ucyA9IGFycmF5LmNvbmNhdC5hcHBseShbXSwgYXJyYXkpO1xuICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0b3IuZGVkdXBsaWNhdGVJblZhbGlkYXRlQWxsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVhc29ucyA9IHJlYXNvbnMuZmlsdGVyKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IHJlYXNvbi5lbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHV1aWQgPSBlbC51bmlxdWVJRCB8fCAoZWwudW5pcXVlSUQgPSBzZXRUaW1lb3V0KCcxJykpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodW5pcVt1dWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuaXFbdXVpZF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm4uY2FsbCh2YWxpZGF0b3IuZG9tLCByZWFzb25zKTsgLy/ov5nph4zlj6rmlL7nva7mnKrpgJrov4fpqozor4HnmoTnu4Tku7ZcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlOiBmdW5jdGlvbiB2YWxpZGF0ZShmaWVsZCwgaXNWYWxpZGF0ZUFsbCwgZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZmllbGQudmFsdWU7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGZpZWxkLmRvbTtcblxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAodHlwZW9mIFByb21pc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAvL2F2YWxvbi1wcm9taXNl5LiN5pSv5oyBcGhhbnRvbWpzXG4gICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oJ+a1j+iniOWZqOS4jeaUr+aMgeWOn+eUn1Byb21pc2Us6K+35LiL6L295bm2PHNjcmlwdCBzcmM9dXJsPuW8leWFpVxcbmh0dHBzOi8vZ2l0aHViLmNvbS9SdWJ5TG91dnJlL2F2YWxvbi9ibG9iL21hc3Rlci90ZXN0L3Byb21pc2UuanMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGVsZW0uZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBydWxlcyA9IGZpZWxkLnZkb20ucnVsZXM7XG4gICAgICAgICAgICB2YXIgbmdzID0gW10sXG4gICAgICAgICAgICAgICAgaXNPayA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIShydWxlcy5ub3JlcXVpcmVkICYmIHZhbHVlID09PSAnJykpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBydWxlTmFtZSBpbiBydWxlcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZVZhbHVlID0gcnVsZXNbcnVsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZVZhbHVlID09PSBmYWxzZSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBob29rID0gYXZhbG9uLnZhbGlkYXRvcnNbcnVsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzb2x2ZTtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSA9IGE7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBmdW5jdGlvbiBuZXh0KGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFzb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmaWVsZC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBydWxlTmFtZSArICctbWVzc2FnZScpIHx8IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW1lc3NhZ2UnKSB8fCBob29rLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGVSdWxlOiBydWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRNZXNzYWdlOiBnZXRNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc09rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmdzLnB1c2gocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQuZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBmaWVsZC5kYXRhW3J1bGVOYW1lXSA9IHJ1bGVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaG9vay5nZXQodmFsdWUsIGZpZWxkLCBuZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v5aaC5p6ccHJvbWlzZXPkuI3kuLrnqbrvvIzor7TmmI7nu4/ov4fpqozor4Hmi6bmiKrlmahcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRhdGVBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbGlkYXRvciA9IGZpZWxkLnZhbGlkYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzT2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvci5vblN1Y2Nlc3MuY2FsbChlbGVtLCBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZpZWxkLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbVxuICAgICAgICAgICAgICAgICAgICAgICAgfV0sIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvci5vbkVycm9yLmNhbGwoZWxlbSwgbmdzLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yLm9uQ29tcGxldGUuY2FsbChlbGVtLCBuZ3MsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ncztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBjb2xsZWN0RmVpbGQobm9kZXMsIGZpZWxkcywgdmFsaWRhdG9yKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCB2ZG9tOyB2ZG9tID0gbm9kZXNbaSsrXTspIHtcbiAgICAgICAgICAgIHZhciBkdXBsZXggPSB2ZG9tLnJ1bGVzICYmIHZkb20uZHVwbGV4O1xuICAgICAgICAgICAgaWYgKGR1cGxleCkge1xuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKGR1cGxleCk7XG4gICAgICAgICAgICAgICAgYmluZFZhbGlkYXRlRXZlbnQoZHVwbGV4LCB2YWxpZGF0b3IpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2ZG9tLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdEZlaWxkKHZkb20uY2hpbGRyZW4sIGZpZWxkcywgdmFsaWRhdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2ZG9tKSkge1xuICAgICAgICAgICAgICAgIGNvbGxlY3RGZWlsZCh2ZG9tLCBmaWVsZHMsIHZhbGlkYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiaW5kVmFsaWRhdGVFdmVudChmaWVsZCwgdmFsaWRhdG9yKSB7XG5cbiAgICAgICAgdmFyIG5vZGUgPSBmaWVsZC5kb207XG4gICAgICAgIGlmIChmaWVsZC52YWxpZGF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmaWVsZC52YWxpZGF0b3IgPSB2YWxpZGF0b3I7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAodmFsaWRhdG9yLnZhbGlkYXRlSW5LZXl1cCAmJiAhZmllbGQuaXNDaGFuZ2VkICYmICFmaWVsZC5kZWJvdW5jZVRpbWUpIHtcbiAgICAgICAgICAgIGF2YWxvbi5iaW5kKG5vZGUsICdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRlKGZpZWxkLCAwLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAodmFsaWRhdG9yLnZhbGlkYXRlSW5CbHVyKSB7XG4gICAgICAgICAgICBhdmFsb24uYmluZChub2RlLCAnYmx1cicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRlKGZpZWxkLCAwLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAodmFsaWRhdG9yLnJlc2V0SW5Gb2N1cykge1xuICAgICAgICAgICAgYXZhbG9uLmJpbmQobm9kZSwgJ2ZvY3VzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3Iub25SZXNldC5jYWxsKG5vZGUsIGUsIGZpZWxkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciByZm9ybWF0ID0gL1xcXFw/e3soW157fV0rKVxcfX0vZ207XG5cbiAgICBmdW5jdGlvbiBnZXRNZXNzYWdlKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSB8fCB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZS5yZXBsYWNlKHJmb3JtYXQsIGZ1bmN0aW9uIChfLCBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YVtuYW1lXSA9PSBudWxsID8gJycgOiBkYXRhW25hbWVdO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdmFsaURpci5kZWZhdWx0cyA9IHtcbiAgICAgICAgdmFsaWRhdGU6IHZhbGlEaXIudmFsaWRhdGUsXG4gICAgICAgIG9uRXJyb3I6IGF2YWxvbi5ub29wLFxuICAgICAgICBvblN1Y2Nlc3M6IGF2YWxvbi5ub29wLFxuICAgICAgICBvbkNvbXBsZXRlOiBhdmFsb24ubm9vcCxcbiAgICAgICAgb25NYW51YWw6IGF2YWxvbi5ub29wLFxuICAgICAgICBvblJlc2V0OiBhdmFsb24ubm9vcCxcbiAgICAgICAgb25WYWxpZGF0ZUFsbDogYXZhbG9uLm5vb3AsXG4gICAgICAgIHZhbGlkYXRlSW5CbHVyOiB0cnVlLCAvL0Bjb25maWcge0Jvb2xlYW59IHRydWXvvIzlnKhibHVy5LqL5Lu25Lit6L+b6KGM6aqM6K+BLOinpuWPkW9uU3VjY2Vzcywgb25FcnJvciwgb25Db21wbGV0ZeWbnuiwg1xuICAgICAgICB2YWxpZGF0ZUluS2V5dXA6IHRydWUsIC8vQGNvbmZpZyB7Qm9vbGVhbn0gdHJ1Ze+8jOWcqGtleXVw5LqL5Lu25Lit6L+b6KGM6aqM6K+BLOinpuWPkW9uU3VjY2Vzcywgb25FcnJvciwgb25Db21wbGV0ZeWbnuiwg1xuICAgICAgICB2YWxpZGF0ZUFsbEluU3VibWl0OiB0cnVlLCAvL0Bjb25maWcge0Jvb2xlYW59IHRydWXvvIzlnKhzdWJtaXTkuovku7bkuK3miafooYxvblZhbGlkYXRlQWxs5Zue6LCDXG4gICAgICAgIHJlc2V0SW5Gb2N1czogdHJ1ZSwgLy9AY29uZmlnIHtCb29sZWFufSB0cnVl77yM5ZyoZm9jdXPkuovku7bkuK3miafooYxvblJlc2V05Zue6LCDLFxuICAgICAgICBkZWR1cGxpY2F0ZUluVmFsaWRhdGVBbGw6IGZhbHNlIC8vQGNvbmZpZyB7Qm9vbGVhbn0gZmFsc2XvvIzlnKh2YWxpZGF0ZUFsbOWbnuiwg+S4reWvuXJlYXNvbuaVsOe7hOagueaNruWFg+e0oOiKgueCuei/m+ihjOWOu+mHjVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDkuIDkuKpkaXJlY3RpdmXoo4XppbDlmahcbiAgICAgKiBAcmV0dXJucyB7ZGlyZWN0aXZlfVxuICAgICAqL1xuICAgIC8vIERpcmVjdGl2ZURlY29yYXRvcihzY29wZSwgYmluZGluZywgdmRvbSwgdGhpcylcbiAgICAvLyBEZWNvcmF0b3Iodm0sIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgIGZ1bmN0aW9uIERpcmVjdGl2ZSh2bSwgYmluZGluZywgdmRvbSwgcmVuZGVyKSB7XG4gICAgICAgIHZhciB0eXBlID0gYmluZGluZy50eXBlO1xuICAgICAgICB2YXIgZGVjb3JhdG9yID0gYXZhbG9uLmRpcmVjdGl2ZXNbdHlwZV07XG4gICAgICAgIGlmIChpbkJyb3dzZXIpIHtcbiAgICAgICAgICAgIHZhciBkb20gPSBhdmFsb24udmRvbSh2ZG9tLCAndG9ET00nKTtcbiAgICAgICAgICAgIGlmIChkb20ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBkb20ucmVtb3ZlQXR0cmlidXRlKGJpbmRpbmcuYXR0ck5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmRvbS5kb20gPSBkb207XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gZGVjb3JhdG9yLnVwZGF0ZSA/IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFyZW5kZXIubW91bnQgJiYgL2Nzc3x2aXNpYmxlfGR1cGxleC8udGVzdCh0eXBlKSkge1xuICAgICAgICAgICAgICAgIHJlbmRlci5jYWxsYmFja3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29yYXRvci51cGRhdGUuY2FsbChkaXJlY3RpdmUkJDEsIGRpcmVjdGl2ZSQkMS5ub2RlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlY29yYXRvci51cGRhdGUuY2FsbChkaXJlY3RpdmUkJDEsIGRpcmVjdGl2ZSQkMS5ub2RlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gOiBhdmFsb24ubm9vcDtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGRlY29yYXRvcikge1xuICAgICAgICAgICAgYmluZGluZ1trZXldID0gZGVjb3JhdG9yW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgYmluZGluZy5ub2RlID0gdmRvbTtcbiAgICAgICAgdmFyIGRpcmVjdGl2ZSQkMSA9IG5ldyBBY3Rpb24odm0sIGJpbmRpbmcsIGNhbGxiYWNrKTtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZSQkMS5pbml0KSB7XG4gICAgICAgICAgICAvL+i/memHjOWPr+iDveS8mumHjeWGmW5vZGUsIGNhbGxiYWNrLCB0eXBlLCBuYW1lXG4gICAgICAgICAgICBkaXJlY3RpdmUkJDEuaW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIGRpcmVjdGl2ZSQkMS51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZSQkMTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRNYXAgPSBhdmFsb24ub25lT2JqZWN0KCdhbmltYXRpb25lbmQsYmx1cixjaGFuZ2UsaW5wdXQsJyArICdjbGljayxkYmxjbGljayxmb2N1cyxrZXlkb3duLGtleXByZXNzLGtleXVwLG1vdXNlZG93bixtb3VzZWVudGVyLCcgKyAnbW91c2VsZWF2ZSxtb3VzZW1vdmUsbW91c2VvdXQsbW91c2VvdmVyLG1vdXNldXAsc2NhbixzY3JvbGwsc3VibWl0JywgJ29uJyk7XG4gICAgZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGVzKGRpcnMsIHR1cGxlKSB7XG4gICAgICAgIHZhciBub2RlID0gdHVwbGVbMF0sXG4gICAgICAgICAgICB1bmlxID0ge30sXG4gICAgICAgICAgICBiaW5kaW5ncyA9IFtdO1xuICAgICAgICB2YXIgaGFzSWYgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBkaXJzKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBkaXJzW25hbWVdO1xuICAgICAgICAgICAgdmFyIGFyciA9IG5hbWUuc3BsaXQoJy0nKTtcbiAgICAgICAgICAgIC8vIG1zLWNsaWNrXG4gICAgICAgICAgICBpZiAobmFtZSBpbiBub2RlLnByb3BzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF0dHJOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXR0ck5hbWUgPSAnOicgKyBuYW1lLnNsaWNlKDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50TWFwW2FyclsxXV0pIHtcbiAgICAgICAgICAgICAgICBhcnIuc3BsaWNlKDEsIDAsICdvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9tcy1vbi1jbGlja1xuICAgICAgICAgICAgaWYgKGFyclsxXSA9PT0gJ29uJykge1xuICAgICAgICAgICAgICAgIGFyclszXSA9IHBhcnNlRmxvYXQoYXJyWzNdKSB8fCAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdHlwZSA9IGFyclsxXTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnY29udHJvbGxlcicgfHwgdHlwZSA9PT0gJ2ltcG9ydGFudCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGRpcmVjdGl2ZXNbdHlwZV0pIHtcblxuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogYXJyWzJdLFxuICAgICAgICAgICAgICAgICAgICBhdHRyTmFtZTogYXR0ck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGFyci5qb2luKCctJyksXG4gICAgICAgICAgICAgICAgICAgIGV4cHI6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogZGlyZWN0aXZlc1t0eXBlXS5wcmlvcml0eSB8fCB0eXBlLmNoYXJDb2RlQXQoMCkgKiAxMDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnaWYnKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc0lmID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZy5wcmlvcml0eSArPSBhcnJbM107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghdW5pcVtiaW5kaW5nLm5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHVuaXFbYmluZGluZy5uYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBiaW5kaW5ncy5wdXNoKGJpbmRpbmcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2ZvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbYXZhbG9uLm1peChiaW5kaW5nLCB0dXBsZVszXSldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJpbmRpbmdzLnNvcnQoYnlQcmlvcml0eSk7XG5cbiAgICAgICAgaWYgKGhhc0lmKSB7XG4gICAgICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gYmluZGluZ3NbaSsrXTspIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgaWYgKGVsLnR5cGUgPT09ICdpZicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJpbmRpbmdzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBieVByaW9yaXR5KGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgIH1cblxuICAgIHZhciByaW1wcm92ZVByaW9yaXR5ID0gL1srLVxcP10vO1xuICAgIHZhciByaW5uZXJWYWx1ZSA9IC9fX3ZhbHVlX19cXCkkLztcbiAgICBmdW5jdGlvbiBwYXJzZUludGVycG9sYXRlKGRpcikge1xuICAgICAgICB2YXIgcmxpbmVTcCA9IC9cXG5cXHI/L2c7XG4gICAgICAgIHZhciBzdHIgPSBkaXIubm9kZVZhbHVlLnRyaW0oKS5yZXBsYWNlKHJsaW5lU3AsICcnKTtcbiAgICAgICAgdmFyIHRva2VucyA9IFtdO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICAvL2FhYXt7QGJiYn19Y2NjXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBzdHIuaW5kZXhPZihjb25maWcub3BlblRhZyk7XG4gICAgICAgICAgICBpbmRleCA9IGluZGV4ID09PSAtMSA/IHN0ci5sZW5ndGggOiBpbmRleDtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHN0ci5zbGljZSgwLCBpbmRleCk7XG4gICAgICAgICAgICBpZiAoL1xcUy8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaChhdmFsb24ucXVvdGUoYXZhbG9uLl9kZWNvZGUodmFsdWUpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoaW5kZXggKyBjb25maWcub3BlblRhZy5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKHN0cikge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gc3RyLmluZGV4T2YoY29uZmlnLmNsb3NlVGFnKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBzdHIuc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHZhciBleHByID0gYXZhbG9uLnVuZXNjYXBlSFRNTCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKC9cXHxcXHMqXFx3Ly50ZXN0KGV4cHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5a2Y5Zyo6L+H5ruk5Zmo77yM5LyY5YyW5bmy5o6JXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnIgPSBhZGRTY29wZShleHByLCAnZXhwcicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByID0gYXJyWzFdLnJlcGxhY2UocmlubmVyVmFsdWUsIGFyclswXSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJpbXByb3ZlUHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwciA9ICcoJyArIGV4cHIgKyAnKSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKGV4cHIpO1xuXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKGluZGV4ICsgY29uZmlnLmNsb3NlVGFnLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKHN0ci5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIGV4cHI6IHRva2Vucy5qb2luKCcrJyksXG4gICAgICAgICAgICBuYW1lOiAnZXhwcicsXG4gICAgICAgICAgICB0eXBlOiAnZXhwcidcbiAgICAgICAgfV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2hpbGRyZW4oYXJyKSB7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBhcnJbaSsrXTspIHtcbiAgICAgICAgICAgIGlmIChlbC5ub2RlTmFtZSA9PT0gJyNkb2N1bWVudC1mcmFnbWVudCcpIHtcbiAgICAgICAgICAgICAgICBjb3VudCArPSBnZXRDaGlsZHJlbihlbC5jaGlsZHJlbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgICBmdW5jdGlvbiBncm91cFRyZWUocGFyZW50LCBjaGlsZHJlbikge1xuICAgICAgICBjaGlsZHJlbiAmJiBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uICh2ZG9tKSB7XG4gICAgICAgICAgICBpZiAoIXZkb20pIHJldHVybjtcbiAgICAgICAgICAgIHZhciB2bGVuZ3RoID0gdmRvbS5jaGlsZHJlbiAmJiBnZXRDaGlsZHJlbih2ZG9tLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGlmICh2ZG9tLm5vZGVOYW1lID09PSAnI2RvY3VtZW50LWZyYWdtZW50Jykge1xuICAgICAgICAgICAgICAgIHZhciBkb20gPSBjcmVhdGVGcmFnbWVudCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb20gPSBhdmFsb24udmRvbSh2ZG9tLCAndG9ET00nKTtcbiAgICAgICAgICAgICAgICB2YXIgZG9tbGVuZ3RoID0gZG9tLmNoaWxkTm9kZXMgJiYgZG9tLmNoaWxkTm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGlmIChkb21sZW5ndGggJiYgdmxlbmd0aCAmJiBkb21sZW5ndGggPiB2bGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXBwZW5kQ2hpbGRNYXlUaHJvd0Vycm9yW2RvbS5ub2RlTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWxvbi5jbGVhckhUTUwoZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2bGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBUcmVlKGRvbSwgdmRvbS5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgaWYgKHZkb20ubm9kZU5hbWUgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZ2V0U2VsZWN0ZWRWYWx1ZSh2ZG9tLCB2YWx1ZXMpO1xuICAgICAgICAgICAgICAgICAgICBsb29rdXBPcHRpb24odmRvbSwgdmFsdWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+mrmOe6p+eJiOacrOWPr+S7peWwneivlSBxdWVyeVNlbGVjdG9yQWxsXG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhcHBlbmRDaGlsZE1heVRocm93RXJyb3JbcGFyZW50Lm5vZGVOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZG9tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkdW1wVHJlZShlbGVtKSB7XG4gICAgICAgIHZhciBmaXJzdENoaWxkO1xuICAgICAgICB3aGlsZSAoZmlyc3RDaGlsZCA9IGVsZW0uZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0Q2hpbGQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBkdW1wVHJlZShmaXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW0ucmVtb3ZlQ2hpbGQoZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSYW5nZShjaGlsZE5vZGVzLCBub2RlKSB7XG4gICAgICAgIHZhciBpID0gY2hpbGROb2Rlcy5pbmRleE9mKG5vZGUpICsgMTtcbiAgICAgICAgdmFyIGRlZXAgPSAxLFxuICAgICAgICAgICAgbm9kZXMgPSBbXSxcbiAgICAgICAgICAgIGVuZDtcbiAgICAgICAgbm9kZXMuc3RhcnQgPSBpO1xuICAgICAgICB3aGlsZSAobm9kZSA9IGNoaWxkTm9kZXNbaSsrXSkge1xuICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAnI2NvbW1lbnQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0V2l0aChub2RlLm5vZGVWYWx1ZSwgJ21zLWZvcjonKSkge1xuICAgICAgICAgICAgICAgICAgICBkZWVwKys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVWYWx1ZSA9PT0gJ21zLWZvci1lbmQ6Jykge1xuICAgICAgICAgICAgICAgICAgICBkZWVwLS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWVwID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2Rlcy5lbmQgPSBlbmQ7XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydFdpdGgobG9uZywgc2hvcnQpIHtcbiAgICAgICAgcmV0dXJuIGxvbmcuaW5kZXhPZihzaG9ydCkgPT09IDA7XG4gICAgfVxuXG4gICAgdmFyIGFwcGVuZENoaWxkTWF5VGhyb3dFcnJvciA9IHtcbiAgICAgICAgJyN0ZXh0JzogMSxcbiAgICAgICAgJyNjb21tZW50JzogMSxcbiAgICAgICAgc2NyaXB0OiAxLFxuICAgICAgICBzdHlsZTogMSxcbiAgICAgICAgbm9zY3JpcHQ6IDFcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog55Sf5oiQ5LiA5Liq5riy5p+T5ZmoLOW5tuS9nOS4uuWug+esrOS4gOS4qumBh+WIsOeahG1zLWNvbnRyb2xsZXLlr7nlupTnmoRWTeeahCRyZW5kZXLlsZ7mgKdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xET019IG5vZGVcbiAgICAgKiBAcGFyYW0ge1ZpZXdNb2RlbHxVbmRlZmluZWR9IHZtXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxVbmRlZmluZWR9IGJlZm9yZVJlYWR5XG4gICAgICogQHJldHVybnMge1JlbmRlcn1cbiAgICAgKi9cbiAgICBhdmFsb24uc2NhbiA9IGZ1bmN0aW9uIChub2RlLCB2bSwgYmVmb3JlUmVhZHkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZW5kZXIobm9kZSwgdm0sIGJlZm9yZVJlYWR5IHx8IGF2YWxvbi5ub29wKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogYXZhbG9uLnNjYW4g55qE5YaF6YOo5a6e546wXG4gICAgICovXG4gICAgZnVuY3Rpb24gUmVuZGVyKG5vZGUsIHZtLCBiZWZvcmVSZWFkeSkge1xuICAgICAgICB0aGlzLnJvb3QgPSBub2RlOyAvL+WmguaenOS8oOWFpeeahOWtl+espuS4siznoa7kv53lj6rmnInkuIDkuKrmoIfnrb7kvZzkuLrmoLnoioLngrlcbiAgICAgICAgdGhpcy52bSA9IHZtO1xuICAgICAgICB0aGlzLmJlZm9yZVJlYWR5ID0gYmVmb3JlUmVhZHk7XG4gICAgICAgIHRoaXMuYmluZGluZ3MgPSBbXTsgLy/mlLbpm4blvoXliqDlt6XnmoTnu5HlrprlsZ7mgKdcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gW107XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIFJlbmRlci5wcm90b3R5cGUgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlvIDlp4vmiavmj4/mjIflrprljLrln59cbiAgICAgICAgICog5pS26ZuG57uR5a6a5bGe5oCnXG4gICAgICAgICAqIOeUn+aIkOaMh+S7pOW5tuW7uueri+S4jlZN55qE5YWz6IGUXG4gICAgICAgICAqL1xuICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgdmFyIHZub2RlcztcbiAgICAgICAgICAgIGlmICh0aGlzLnJvb3QgJiYgdGhpcy5yb290Lm5vZGVUeXBlID4gMCkge1xuICAgICAgICAgICAgICAgIHZub2RlcyA9IGZyb21ET00odGhpcy5yb290KTsgLy/ovazmjaLomZrmi59ET01cbiAgICAgICAgICAgICAgICAvL+WwhuaJq+aPj+WMuuWfn+eahOavj+S4gOS4quiKgueCueS4juWFtueItuiKgueCueWIhuemuyzmm7TlsJHmjIfku6Tlr7lET03mk43kvZzml7Ys5a+56aaW5bGP6L6T5Ye66YCg5oiQ55qE6aKR57mB6YeN57uYXG4gICAgICAgICAgICAgICAgZHVtcFRyZWUodGhpcy5yb290KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucm9vdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2bm9kZXMgPSBmcm9tU3RyaW5nKHRoaXMucm9vdCk7IC8v6L2s5o2i6Jma5oufRE9NXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBhdmFsb24ud2FybignYXZhbG9uLnNjYW4gZmlyc3QgYXJndW1lbnQgbXVzdCBlbGVtZW50IG9yIEhUTUwgc3RyaW5nJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHZub2Rlc1swXTtcbiAgICAgICAgICAgIHRoaXMudm5vZGVzID0gdm5vZGVzO1xuICAgICAgICAgICAgdGhpcy5zY2FuQ2hpbGRyZW4odm5vZGVzLCB0aGlzLnZtLCB0cnVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2NhbkNoaWxkcmVuOiBmdW5jdGlvbiBzY2FuQ2hpbGRyZW4oY2hpbGRyZW4sIHNjb3BlLCBpc1Jvb3QpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdmRvbSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodmRvbS5ub2RlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICcjdGV4dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZSAmJiB0aGlzLnNjYW5UZXh0KHZkb20sIHNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICcjY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZSAmJiB0aGlzLnNjYW5Db21tZW50KHZkb20sIHNjb3BlLCBjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnI2RvY3VtZW50LWZyYWdtZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhbkNoaWxkcmVuKHZkb20uY2hpbGRyZW4sIHNjb3BlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhblRhZyh2ZG9tLCBzY29wZSwgY2hpbGRyZW4sIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5paH5pys6IqC54K56I635Y+W5oyH5LukXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gdmRvbSBcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBzY29wZVxuICAgICAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgc2NhblRleHQ6IGZ1bmN0aW9uIHNjYW5UZXh0KHZkb20sIHNjb3BlKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLnJleHByLnRlc3QodmRvbS5ub2RlVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5wdXNoKFt2ZG9tLCBzY29wZSwge1xuICAgICAgICAgICAgICAgICAgICBub2RlVmFsdWU6IHZkb20ubm9kZVZhbHVlXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juazqOmHiuiKgueCueiOt+WPluaMh+S7pFxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHZkb20gXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gc2NvcGVcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBwYXJlbnRDaGlsZHJlblxuICAgICAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgc2NhbkNvbW1lbnQ6IGZ1bmN0aW9uIHNjYW5Db21tZW50KHZkb20sIHNjb3BlLCBwYXJlbnRDaGlsZHJlbikge1xuICAgICAgICAgICAgaWYgKHN0YXJ0V2l0aCh2ZG9tLm5vZGVWYWx1ZSwgJ21zLWZvcjonKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Rm9yQmluZGluZyh2ZG9tLCBzY29wZSwgcGFyZW50Q2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWFg+e0oOiKgueCueeahG5vZGVOYW1l5LiO5bGe5oCn5Lit6I635Y+W5oyH5LukXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gdmRvbSBcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBzY29wZVxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHBhcmVudENoaWxkcmVuXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gaXNSb290IOeUqOS6juaJp+ihjGNvbXBsZXRl5pa55rOVXG4gICAgICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICBzY2FuVGFnOiBmdW5jdGlvbiBzY2FuVGFnKHZkb20sIHNjb3BlLCBwYXJlbnRDaGlsZHJlbiwgaXNSb290KSB7XG4gICAgICAgICAgICB2YXIgZGlycyA9IHt9LFxuICAgICAgICAgICAgICAgIGF0dHJzID0gdmRvbS5wcm9wcyxcbiAgICAgICAgICAgICAgICBoYXNEaXIsXG4gICAgICAgICAgICAgICAgaGFzRm9yO1xuICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBhdHRycykge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGF0dHJzW2F0dHJdO1xuICAgICAgICAgICAgICAgIHZhciBvbGROYW1lID0gYXR0cjtcbiAgICAgICAgICAgICAgICBpZiAoYXR0ci5jaGFyQXQoMCkgPT09ICc6Jykge1xuICAgICAgICAgICAgICAgICAgICBhdHRyID0gJ21zLScgKyBhdHRyLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RhcnRXaXRoKGF0dHIsICdtcy0nKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJzW2F0dHJdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gYXR0ci5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IGV2ZW50TWFwW3R5cGVdIHx8IHR5cGU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGlyZWN0aXZlc1t0eXBlXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oYXR0ciArICcgaGFzIG5vdCByZWdpc3RlcmVkIScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGhhc0RpciA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhdHRyID09PSAnbXMtZm9yJykge1xuICAgICAgICAgICAgICAgICAgICBoYXNGb3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJzW29sZE5hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciAkaWQgPSBkaXJzWydtcy1pbXBvcnRhbnQnXSB8fCBkaXJzWydtcy1jb250cm9sbGVyJ107XG4gICAgICAgICAgICBpZiAoJGlkKSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICog5ZCO56uv5riy5p+TXG4gICAgICAgICAgICAgICAgICogc2VydmVyVGVtcGxhdGVz5ZCO56uv57uZYXZhbG9u5re75Yqg55qE5a+56LGhLOmHjOmdoumDveaYr+aooeadvyxcbiAgICAgICAgICAgICAgICAgKiDlsIbljp/mnaXlkI7nq6/muLLmn5Plpb3nmoTljLrln5/lho3ov5jljp/miJDljp/lp4vmoLflrZAs5YaN6KKr5omr5o+PXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlQ2FjaGVzID0gYXZhbG9uLnNlcnZlclRlbXBsYXRlcztcbiAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRlbXBsYXRlQ2FjaGVzICYmIHRlbXBsYXRlQ2FjaGVzWyRpZF07XG4gICAgICAgICAgICAgICAgaWYgKHRlbXApIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLmxvZygn5YmN56uv5YaN5qyh5riy5p+T5ZCO56uv5Lyg6L+H5p2l55qE5qih5p2/Jyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gZnJvbVN0cmluZyh0bXBsKVswXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZG9tW2ldID0gbm9kZVtpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGVtcGxhdGVDYWNoZXNbJGlkXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FuVGFnKHZkb20sIHNjb3BlLCBwYXJlbnRDaGlsZHJlbiwgaXNSb290KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL+aOqOeul+WHuuaMh+S7pOexu+Wei1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gZGlyc1snbXMtaW1wb3J0YW50J10gPT09ICRpZCA/ICdpbXBvcnRhbnQnIDogJ2NvbnRyb2xsZXInO1xuICAgICAgICAgICAgICAgIC8v5o6o566X5Ye655So5oi35a6a5LmJ5pe25bGe5oCn5ZCNLOaYr+S9v+eUqG1zLeWxnuaAp+i/mOaYrzrlsZ7mgKdcbiAgICAgICAgICAgICAgICB2YXIgYXR0ck5hbWUgPSAnbXMtJyArIHR5cGUgaW4gYXR0cnMgPyAnbXMtJyArIHR5cGUgOiAnOicgKyB0eXBlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cnNbYXR0ck5hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZGlyID0gZGlyZWN0aXZlc1t0eXBlXTtcbiAgICAgICAgICAgICAgICBzY29wZSA9IGRpci5nZXRTY29wZS5jYWxsKHRoaXMsICRpZCwgc2NvcGUpO1xuICAgICAgICAgICAgICAgIGlmICghc2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjbGF6eiA9IGF0dHJzWydjbGFzcyddO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2xhenopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzWydjbGFzcyddID0gKCcgJyArIGNsYXp6ICsgJyAnKS5yZXBsYWNlKCcgbXMtY29udHJvbGxlciAnLCAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZW5kZXIgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRyZW5kZXIgPSByZW5kZXI7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v55So5LqO5Yig6ZmkbXMtY29udHJvbGxlclxuICAgICAgICAgICAgICAgICAgICBkaXIudXBkYXRlLmNhbGwocmVuZGVyLCB2ZG9tLCBhdHRyTmFtZSwgJGlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoYXNGb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAodmRvbS5kb20pIHtcbiAgICAgICAgICAgICAgICAgICAgdmRvbS5kb20ucmVtb3ZlQXR0cmlidXRlKG9sZE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGb3JCaW5kaW5nQnlFbGVtZW50KHZkb20sIHNjb3BlLCBwYXJlbnRDaGlsZHJlbiwgaGFzRm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKC9ebXNcXC0vLnRlc3QodmRvbS5ub2RlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBhdHRycy5pcyA9IHZkb20ubm9kZU5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhdHRyc1snaXMnXSkge1xuICAgICAgICAgICAgICAgIGlmICghZGlyc1snbXMtd2lkZ2V0J10pIHtcbiAgICAgICAgICAgICAgICAgICAgZGlyc1snbXMtd2lkZ2V0J10gPSAne30nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYXNEaXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0Rpcikge1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZGluZ3MucHVzaChbdmRvbSwgc2NvcGUsIGRpcnNdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHZkb20uY2hpbGRyZW47XG4gICAgICAgICAgICAvL+WmguaenOWtmOWcqOWtkOiKgueCuSzlubbkuJTkuI3mmK/lrrnlmajlhYPntKAoc2NyaXB0LCBzdHlwZSwgdGV4dGFyZWEsIHhtcC4uLilcbiAgICAgICAgICAgIGlmICghb3JwaGFuVGFnW3Zkb20ubm9kZU5hbWVdICYmIGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCAmJiAhZGVsYXlDb21waWxlTm9kZXMoZGlycykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjYW5DaGlsZHJlbihjaGlsZHJlbiwgc2NvcGUsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlsIbnu5HlrprlsZ7mgKfovazmjaLkuLrmjIfku6RcbiAgICAgICAgICog5omn6KGM5ZCE56eN5Zue6LCD5LiO5LyY5YyW5oyH5LukXG4gICAgICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICAgICAgICB0aGlzLnlpZWxkRGlyZWN0aXZlcygpO1xuICAgICAgICAgICAgdGhpcy5iZWZvcmVSZWFkeSgpO1xuICAgICAgICAgICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgIHZhciByb290JCQxID0gdGhpcy5yb290O1xuICAgICAgICAgICAgICAgIGlmIChpbkJyb3dzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvb3REb20gPSBhdmFsb24udmRvbShyb290JCQxLCAndG9ET00nKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBUcmVlKHJvb3REb20sIHJvb3QkJDEuY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5tb3VudCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgZm47XG4gICAgICAgICAgICB3aGlsZSAoZm4gPSB0aGlzLmNhbGxiYWNrcy5wb3AoKSkge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9wdGltaXplRGlyZWN0aXZlcygpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWwhuaUtumbhuWIsOeahOe7keWumuWxnuaAp+i/m+ihjOa3seWKoOW3pSzmnIDlkI7ovazmjaLmjIfku6RcbiAgICAgICAgICogQHJldHVybnMge0FycmF5PHR1cGxlPn1cbiAgICAgICAgICovXG4gICAgICAgIHlpZWxkRGlyZWN0aXZlczogZnVuY3Rpb24geWllbGREaXJlY3RpdmVzKCkge1xuICAgICAgICAgICAgdmFyIHR1cGxlO1xuICAgICAgICAgICAgd2hpbGUgKHR1cGxlID0gdGhpcy5iaW5kaW5ncy5zaGlmdCgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZkb20gPSB0dXBsZVswXSxcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUgPSB0dXBsZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgZGlycyA9IHR1cGxlWzJdLFxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5ncyA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICgnbm9kZVZhbHVlJyBpbiBkaXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzID0gcGFyc2VJbnRlcnBvbGF0ZShkaXJzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEoJ21zLXNraXAnIGluIGRpcnMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzID0gcGFyc2VBdHRyaWJ1dGVzKGRpcnMsIHR1cGxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGJpbmRpbmc7IGJpbmRpbmcgPSBiaW5kaW5nc1tpKytdOykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyID0gZGlyZWN0aXZlc1tiaW5kaW5nLnR5cGVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWluQnJvd3NlciAmJiAvb258ZHVwbGV4fGFjdGl2ZXxob3Zlci8udGVzdChiaW5kaW5nLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlyLmJlZm9yZUluaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpci5iZWZvcmVJbml0LmNhbGwoYmluZGluZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlJCQxID0gbmV3IERpcmVjdGl2ZShzY29wZSwgYmluZGluZywgdmRvbSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy5wdXNoKGRpcmVjdGl2ZSQkMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS/ruaUueaMh+S7pOeahHVwZGF0ZeS4jmNhbGxiYWNr5pa55rOVLOiuqeWug+S7rOS7peWQjuaJp+ihjOaXtuabtOWKoOmrmOaViFxuICAgICAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgb3B0aW1pemVEaXJlY3RpdmVzOiBmdW5jdGlvbiBvcHRpbWl6ZURpcmVjdGl2ZXMoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gdGhpcy5kaXJlY3RpdmVzW2krK107KSB7XG4gICAgICAgICAgICAgICAgZWwuY2FsbGJhY2sgPSBkaXJlY3RpdmVzW2VsLnR5cGVdLnVwZGF0ZTtcbiAgICAgICAgICAgICAgICBlbC51cGRhdGUgPSBuZXdVcGRhdGU7XG4gICAgICAgICAgICAgICAgZWwuX2lzU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gdGhpcy5kaXJlY3RpdmVzW2krK107KSB7XG4gICAgICAgICAgICAgICAgZWwudXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOmUgOavgeaJgOacieaMh+S7pFxuICAgICAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gdGhpcy5kaXJlY3RpdmVzIHx8IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IGxpc3RbaSsrXTspIHtcbiAgICAgICAgICAgICAgICBlbC5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+mYsuatouWFtuS7luWcsOaWueeahHRoaXMuaW5uZXJSZW5kZXIgJiYgdGhpcy5pbm5lclJlbmRlci5kaXNwb3Nl5oql6ZSZXG4gICAgICAgICAgICBmb3IgKHZhciBfaTUgaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGlmIChfaTUgIT09ICdkaXNwb3NlJykgZGVsZXRlIHRoaXNbX2k1XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlsIblvqrnjq/ljLrln5/ovazmjaLkuLpmb3LmjIfku6RcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBiZWdpbiDms6jph4roioLngrlcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBzY29wZVxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHBhcmVudENoaWxkcmVuXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gdXNlckNiIOW+queOr+e7k+adn+Wbnuiwg1xuICAgICAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Rm9yQmluZGluZzogZnVuY3Rpb24gZ2V0Rm9yQmluZGluZyhiZWdpbiwgc2NvcGUsIHBhcmVudENoaWxkcmVuLCB1c2VyQ2IpIHtcbiAgICAgICAgICAgIHZhciBleHByID0gYmVnaW4ubm9kZVZhbHVlLnJlcGxhY2UoJ21zLWZvcjonLCAnJykudHJpbSgpO1xuICAgICAgICAgICAgYmVnaW4ubm9kZVZhbHVlID0gJ21zLWZvcjonICsgZXhwcjtcbiAgICAgICAgICAgIHZhciBub2RlcyA9IGdldFJhbmdlKHBhcmVudENoaWxkcmVuLCBiZWdpbik7XG4gICAgICAgICAgICB2YXIgZW5kID0gbm9kZXMuZW5kO1xuICAgICAgICAgICAgdmFyIGZyYWdtZW50ID0gYXZhbG9uLnZkb20obm9kZXMsICd0b0hUTUwnKTtcbiAgICAgICAgICAgIHBhcmVudENoaWxkcmVuLnNwbGljZShub2Rlcy5zdGFydCwgbm9kZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIGJlZ2luLnByb3BzID0ge307XG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLnB1c2goW2JlZ2luLCBzY29wZSwge1xuICAgICAgICAgICAgICAgICdtcy1mb3InOiBleHByXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgYmVnaW46IGJlZ2luLFxuICAgICAgICAgICAgICAgIGVuZDogZW5kLFxuICAgICAgICAgICAgICAgIGV4cHI6IGV4cHIsXG4gICAgICAgICAgICAgICAgdXNlckNiOiB1c2VyQ2IsXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQ6IGZyYWdtZW50LFxuICAgICAgICAgICAgICAgIHBhcmVudENoaWxkcmVuOiBwYXJlbnRDaGlsZHJlblxuICAgICAgICAgICAgfV0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOW4pm1zLWZvcuWFg+e0oOiKgueCueaXgea3u+WKoOS4pOS4quazqOmHiuiKgueCuSznu4TmiJDlvqrnjq/ljLrln59cbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSB2ZG9tXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gc2NvcGVcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBwYXJlbnRDaGlsZHJlblxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IGV4cHJcbiAgICAgICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgICAgICovXG4gICAgICAgIGdldEZvckJpbmRpbmdCeUVsZW1lbnQ6IGZ1bmN0aW9uIGdldEZvckJpbmRpbmdCeUVsZW1lbnQodmRvbSwgc2NvcGUsIHBhcmVudENoaWxkcmVuLCBleHByKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBwYXJlbnRDaGlsZHJlbi5pbmRleE9mKHZkb20pOyAvL+WOn+adpeW4pm1zLWZvcueahOWFg+e0oOiKgueCuVxuICAgICAgICAgICAgdmFyIHByb3BzID0gdmRvbS5wcm9wcztcbiAgICAgICAgICAgIHZhciBiZWdpbiA9IHtcbiAgICAgICAgICAgICAgICBub2RlTmFtZTogJyNjb21tZW50JyxcbiAgICAgICAgICAgICAgICBub2RlVmFsdWU6ICdtcy1mb3I6JyArIGV4cHJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocHJvcHMuc2xvdCkge1xuICAgICAgICAgICAgICAgIGJlZ2luLnNsb3QgPSBwcm9wcy5zbG90O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBwcm9wcy5zbG90O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGVuZCA9IHtcbiAgICAgICAgICAgICAgICBub2RlTmFtZTogJyNjb21tZW50JyxcbiAgICAgICAgICAgICAgICBub2RlVmFsdWU6ICdtcy1mb3ItZW5kOidcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwYXJlbnRDaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEsIGJlZ2luLCB2ZG9tLCBlbmQpO1xuICAgICAgICAgICAgdGhpcy5nZXRGb3JCaW5kaW5nKGJlZ2luLCBzY29wZSwgcGFyZW50Q2hpbGRyZW4sIHByb3BzWydkYXRhLWZvci1yZW5kZXJlZCddKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIHZpZXdJRDtcblxuICAgIGZ1bmN0aW9uIG5ld1VwZGF0ZSgpIHtcbiAgICAgICAgdmFyIG9sZFZhbCA9IHRoaXMuYmVmb3JlVXBkYXRlKCk7XG4gICAgICAgIHZhciBuZXdWYWwgPSB0aGlzLnZhbHVlID0gdGhpcy5nZXQoKTtcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2sgJiYgdGhpcy5kaWZmKG5ld1ZhbCwgb2xkVmFsKSkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm5vZGUsIHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgdmFyIHZtID0gdGhpcy52bTtcbiAgICAgICAgICAgIHZhciAkcmVuZGVyID0gdm0uJHJlbmRlcjtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gdm0uJGV2ZW50c1snb25WaWV3Q2hhbmdlJ107XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmIChsaXN0ICYmICRyZW5kZXIgJiYgJHJlbmRlci5yb290ICYmICFhdmFsb24udmlld0NoYW5naW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZpZXdJRCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodmlld0lEKTtcbiAgICAgICAgICAgICAgICAgICAgdmlld0lEID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmlld0lEID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNhbGxiYWNrLmNhbGwodm0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmlld2NoYW5nZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiAkcmVuZGVyLnJvb3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm1vZGVsOiB2bVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50cyA9ICdvbkluaXQsb25SZWFkeSxvblZpZXdDaGFuZ2Usb25EaXNwb3NlLG9uRW50ZXIsb25MZWF2ZSc7XG4gICAgdmFyIGNvbXBvbmVudEV2ZW50cyA9IGF2YWxvbi5vbmVPYmplY3QoZXZlbnRzKTtcblxuICAgIGZ1bmN0aW9uIHRvT2JqZWN0KHZhbHVlKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBsYXRmb3JtLnRvSnNvbih2YWx1ZSk7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgdmFyIHYgPSB7fTtcbiAgICAgICAgICAgIHZhbHVlLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgZWwgJiYgYXZhbG9uLnNoYWRvd0NvcHkodiwgZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHZhciBjb21wb25lbnRRdWV1ZSA9IFtdO1xuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ3dpZGdldCcsIHtcbiAgICAgICAgZGVsYXk6IHRydWUsXG4gICAgICAgIHByaW9yaXR5OiA0LFxuICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgLy9jYWNoZWTlsZ7mgKflv4XpobvlrprkuYnlnKjnu4Tku7blrrnlmajph4zpnaIs5LiN5pivdGVtcGxhdGXkuK1cbiAgICAgICAgICAgIHZhciB2ZG9tID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgdGhpcy5jYWNoZVZtID0gISF2ZG9tLnByb3BzLmNhY2hlZDtcbiAgICAgICAgICAgIGlmICh2ZG9tLmRvbSAmJiB2ZG9tLm5vZGVOYW1lID09PSAnI2NvbW1lbnQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbW1lbnQgPSB2ZG9tLmRvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRvT2JqZWN0KG9sZFZhbHVlKTtcbiAgICAgICAgICAgIC8v5aSW6YOoVk3kuI7lhoXpg6hWTVxuICAgICAgICAgICAgLy8g77yd77yd77yd5Yib5bu657uE5Lu255qEVk3vvJ3vvJ1CRUdJTu+8ne+8ne+8nVxuICAgICAgICAgICAgdmFyIGlzID0gdmRvbS5wcm9wcy5pcyB8fCB2YWx1ZS5pcztcbiAgICAgICAgICAgIHRoaXMuaXMgPSBpcztcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBhdmFsb24uY29tcG9uZW50c1tpc107XG4gICAgICAgICAgICAvL+WklumDqOS8oOWFpeeahOaAu+Wkp+S6juWGhemDqFxuICAgICAgICAgICAgaWYgKCEoJ2ZyYWdtZW50JyBpbiB0aGlzKSkge1xuICAgICAgICAgICAgICAgIGlmICghdmRvbS5pc1ZvaWRUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/mj5Dlj5bnu4Tku7blrrnlmajlhoXpg6jnmoTkuJzopb/kvZzkuLrmqKHmnb9cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRleHQgPSB2ZG9tLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lm5vZGVWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudCA9IHRleHQubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudCA9IGF2YWxvbi52ZG9tKHZkb20uY2hpbGRyZW4sICd0b0hUTUwnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhZ21lbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+WmguaenOe7hOS7tui/mOayoeacieazqOWGjO+8jOmCo+S5iOWwhuWOn+WFg+e0oOWPmOaIkOS4gOS4quWNoOS9jeeUqOeahOazqOmHiuiKgueCuVxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgIHZkb20ubm9kZU5hbWUgPSAnI2NvbW1lbnQnO1xuICAgICAgICAgICAgICAgIHZkb20ubm9kZVZhbHVlID0gJ3VucmVzb2x2ZWQgY29tcG9uZW50IHBsYWNlaG9sZGVyJztcbiAgICAgICAgICAgICAgICBkZWxldGUgdmRvbS5kb207XG4gICAgICAgICAgICAgICAgYXZhbG9uLkFycmF5LmVuc3VyZShjb21wb25lbnRRdWV1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+WmguaenOaYr+mdnuepuuWFg+e0oO+8jOavlOWmguivtHhtcCwgbXMtKiwgdGVtcGxhdGVcbiAgICAgICAgICAgIHZhciBpZCA9IHZhbHVlLmlkIHx8IHZhbHVlLiRpZDtcbiAgICAgICAgICAgIHZhciBoYXNDYWNoZSA9IGF2YWxvbi52bW9kZWxzW2lkXTtcbiAgICAgICAgICAgIHZhciBmcm9tQ2FjaGUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHRoaXMucmVhZHlTdGF0ZSA9IDFcbiAgICAgICAgICAgIGlmIChoYXNDYWNoZSkge1xuICAgICAgICAgICAgICAgIGNvbVZtID0gaGFzQ2FjaGU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21WbSA9IGNvbVZtO1xuICAgICAgICAgICAgICAgIHJlcGxhY2VSb290KHRoaXMsIGNvbVZtLiRyZW5kZXIpO1xuICAgICAgICAgICAgICAgIGZyb21DYWNoZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcG9uZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgY29tVm0gPSBjcmVhdGVDb21wb25lbnRWbShjb21wb25lbnQsIHZhbHVlLCBpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gMTtcbiAgICAgICAgICAgICAgICBmaXJlQ29tcG9uZW50SG9vayhjb21WbSwgdmRvbSwgJ0luaXQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbVZtID0gY29tVm07XG5cbiAgICAgICAgICAgICAgICAvLyDvvJ3vvJ3vvJ3liJvlu7rnu4Tku7bnmoRWTe+8ne+8nUVORO+8ne+8ne+8nVxuICAgICAgICAgICAgICAgIHZhciBpbm5lclJlbmRlciA9IGF2YWxvbi5zY2FuKGNvbXBvbmVudC50ZW1wbGF0ZSwgY29tVm0pO1xuICAgICAgICAgICAgICAgIGNvbVZtLiRyZW5kZXIgPSBpbm5lclJlbmRlcjtcbiAgICAgICAgICAgICAgICByZXBsYWNlUm9vdCh0aGlzLCBpbm5lclJlbmRlcik7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGVzV2l0aFNsb3QgPSBbXTtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlcyQkMSA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZyYWdtZW50IHx8IGNvbXBvbmVudC5zb2xlU2xvdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyVk0gPSB0aGlzLmZyYWdtZW50ID8gdGhpcy52bSA6IGNvbVZtO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyVGV4dCA9IHRoaXMuZnJhZ21lbnQgfHwgJ3t7IyMnICsgY29tcG9uZW50LnNvbGVTbG90ICsgJ319JztcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkQm9zcyA9IGF2YWxvbi5zY2FuKCc8ZGl2PicgKyBjdXJUZXh0ICsgJzwvZGl2PicsIGN1clZNLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1dpdGhTbG90ID0gdGhpcy5yb290LmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlcyQkMSA9IGNoaWxkQm9zcy5kaXJlY3RpdmVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkQm9zcyA9IGNoaWxkQm9zcztcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBjaGlsZEJvc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjaGlsZEJvc3NbaV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaW5uZXJSZW5kZXIuZGlyZWN0aXZlcywgZGlyZWN0aXZlcyQkMSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgYXJyYXlTbG90ID0gW10sXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFNsb3QgPSB7fTtcbiAgICAgICAgICAgICAgICAvL+S7jueUqOaIt+WGmeeahOWFg+e0oOWGhemDqCDmlLbpm4bopoHnp7vliqjliLAg5paw5Yib5bu655qE57uE5Lu25YaF6YOo55qE5YWD57SgXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5zb2xlU2xvdCkge1xuICAgICAgICAgICAgICAgICAgICBhcnJheVNsb3QgPSBub2Rlc1dpdGhTbG90O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzV2l0aFNsb3QuZm9yRWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v6KaB5rGC5bimc2xvdOWxnuaAp1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsLnNsb3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSBnZXRSYW5nZShub2Rlc1dpdGhTbG90LCBlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2Rlcy5lbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnVuc2hpZnQoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFNsb3RbZWwuc2xvdF0gPSBub2RlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZWwucHJvcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGVsLnByb3BzLnNsb3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGVsLnByb3BzLnNsb3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iamVjdFNsb3RbbmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RTbG90W25hbWVdLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0U2xvdFtuYW1lXSA9IFtlbF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL+WwhuWOn+adpeWFg+e0oOeahOaJgOacieWtqeWtkO+8jOWFqOmDqOenu+WKqOaWsOeahOWFg+e0oOeahOesrOS4gOS4qnNsb3TnmoTkvY3nva7kuIpcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnNvbGVTbG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGluc2VydEFycmF5U2xvdChpbm5lclJlbmRlci52bm9kZXMsIGFycmF5U2xvdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0T2JqZWN0U2xvdChpbm5lclJlbmRlci52bm9kZXMsIG9iamVjdFNsb3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZG9tID0gYXZhbG9uLnZkb20odmRvbSwgJ3RvRE9NJyk7XG4gICAgICAgICAgICAgICAgY29tbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChkb20sIGNvbW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbVZtLiRlbGVtZW50ID0gaW5uZXJSZW5kZXIucm9vdC5kb20gPSBkb207XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMucmVJbml0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+WkhOeQhkRPTeiKgueCuVxuXG4gICAgICAgICAgICBkdW1wVHJlZSh2ZG9tLmRvbSk7XG4gICAgICAgICAgICBjb21WbS4kZWxlbWVudCA9IHZkb20uZG9tO1xuICAgICAgICAgICAgZ3JvdXBUcmVlKHZkb20uZG9tLCB2ZG9tLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICBmaXJlQ29tcG9uZW50SG9vayhjb21WbSwgdmRvbSwgJ0VudGVyJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcmVDb21wb25lbnRIb29rKGNvbVZtLCB2ZG9tLCAnUmVhZHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGlmZjogZnVuY3Rpb24gZGlmZihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICAgICAgaWYgKGNzc0RpZmYuY2FsbCh0aGlzLCBuZXdWYWwsIG9sZFZhbCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2ZG9tLCB2YWx1ZSkge1xuICAgICAgICAgICAgLy90aGlzLm9sZFZhbHVlID0gdmFsdWUgLy/imIXimIXpmLLmraLpgJLlvZJcblxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnJlYWR5U3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlSW5pdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSsrO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUrKztcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbVZtID0gdGhpcy5jb21WbTtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLnZpZXdDaGFuZ2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGF2YWxvbi50cmFuc2FjdGlvbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbVZtLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tVm1baV0gPSB2YWx1ZVtpXS5jb25jYXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbVZtW2ldID0gdmFsdWVbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8v6KaB5L+d6K+B6KaB5YWI6Kem5Y+R5a2p5a2Q55qEVmlld0NoYW5nZSDnhLblkI7lho3liLDlroPoh6rlt7HnmoRWaWV3Q2hhbmdlXG4gICAgICAgICAgICAgICAgICAgIGZpcmVDb21wb25lbnRIb29rKGNvbVZtLCB2ZG9tLCAnVmlld0NoYW5nZScpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXZhbG9uLnZpZXdDaGFuZ2luZztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gYXZhbG9uLm1peCh0cnVlLCB7fSwgdmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBiZWZvcmVEaXNwb3NlOiBmdW5jdGlvbiBiZWZvcmVEaXNwb3NlKCkge1xuICAgICAgICAgICAgdmFyIGNvbVZtID0gdGhpcy5jb21WbTtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYWNoZVZtKSB7XG4gICAgICAgICAgICAgICAgZmlyZUNvbXBvbmVudEhvb2soY29tVm0sIHRoaXMubm9kZSwgJ0Rpc3Bvc2UnKTtcbiAgICAgICAgICAgICAgICBjb21WbS4kaGFzaGNvZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXZhbG9uLnZtb2RlbHNbY29tVm0uJGlkXTtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyUmVuZGVyICYmIHRoaXMuaW5uZXJSZW5kZXIuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlQ29tcG9uZW50SG9vayhjb21WbSwgdGhpcy5ub2RlLCAnTGVhdmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcmVwbGFjZVJvb3QoaW5zdGFuY2UsIGlubmVyUmVuZGVyKSB7XG4gICAgICAgIGluc3RhbmNlLmlubmVyUmVuZGVyID0gaW5uZXJSZW5kZXI7XG4gICAgICAgIHZhciByb290JCQxID0gaW5uZXJSZW5kZXIucm9vdDtcbiAgICAgICAgdmFyIHZkb20gPSBpbnN0YW5jZS5ub2RlO1xuICAgICAgICB2YXIgc2xvdCA9IHZkb20ucHJvcHMuc2xvdDtcbiAgICAgICAgZm9yICh2YXIgaSBpbiByb290JCQxKSB7XG4gICAgICAgICAgICB2ZG9tW2ldID0gcm9vdCQkMVtpXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmRvbS5wcm9wcyAmJiBzbG90KSB7XG4gICAgICAgICAgICB2ZG9tLnByb3BzLnNsb3QgPSBzbG90O1xuICAgICAgICB9XG4gICAgICAgIGlubmVyUmVuZGVyLnJvb3QgPSB2ZG9tO1xuICAgICAgICBpbm5lclJlbmRlci52bm9kZXNbMF0gPSB2ZG9tO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpcmVDb21wb25lbnRIb29rKHZtLCB2ZG9tLCBuYW1lKSB7XG4gICAgICAgIHZhciBsaXN0ID0gdm0uJGV2ZW50c1snb24nICsgbmFtZV07XG4gICAgICAgIGlmIChsaXN0KSB7XG4gICAgICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNhbGxiYWNrLmNhbGwodm0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IG5hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogdmRvbS5kb20sXG4gICAgICAgICAgICAgICAgICAgICAgICB2bW9kZWw6IHZtXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRWbShjb21wb25lbnQsIHZhbHVlLCBpcykge1xuICAgICAgICB2YXIgaG9va3MgPSBbXTtcbiAgICAgICAgdmFyIGRlZmF1bHRzID0gY29tcG9uZW50LmRlZmF1bHRzO1xuICAgICAgICBjb2xsZWN0SG9va3MoZGVmYXVsdHMsIGhvb2tzKTtcbiAgICAgICAgY29sbGVjdEhvb2tzKHZhbHVlLCBob29rcyk7XG4gICAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBkZWZhdWx0cykge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHZhbHVlW2ldO1xuICAgICAgICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2JqW2ldID0gZGVmYXVsdHNbaV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9ialtpXSA9IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvYmouJGlkID0gdmFsdWUuaWQgfHwgdmFsdWUuJGlkIHx8IGF2YWxvbi5tYWtlSGFzaENvZGUoaXMpO1xuICAgICAgICBkZWxldGUgb2JqLmlkO1xuICAgICAgICB2YXIgZGVmID0gYXZhbG9uLm1peCh0cnVlLCB7fSwgb2JqKTtcbiAgICAgICAgdmFyIHZtID0gYXZhbG9uLmRlZmluZShkZWYpO1xuICAgICAgICBob29rcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgdm0uJHdhdGNoKGVsLnR5cGUsIGVsLmNiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2bTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb2xsZWN0SG9va3MoYSwgbGlzdCkge1xuICAgICAgICBmb3IgKHZhciBpIGluIGEpIHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnRFdmVudHNbaV0pIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFbaV0gPT09ICdmdW5jdGlvbicgJiYgaS5pbmRleE9mKCdvbicpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2I6IGFbaV1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vZGVsZXRlIGFbaV0g6L+Z6YeM5LiN6IO95Yig6ZmkLOS8muWvvOiHtOWGjeasoeWIh+aNouaXtuayoeaciW9uUmVhZHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0UGFyZW50Q2hpbGRyZW4obm9kZXMsIGFycikge1xuICAgICAgICB2YXIgZGlyID0gYXJyICYmIGFyclswXSAmJiBhcnJbMF0uZm9yRGlyO1xuICAgICAgICBpZiAoZGlyKSB7XG4gICAgICAgICAgICBkaXIucGFyZW50Q2hpbGRyZW4gPSBub2RlcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2VydEFycmF5U2xvdChub2RlcywgYXJyKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBub2Rlc1tpXTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZWwubm9kZU5hbWUgPT09ICdzbG90Jykge1xuICAgICAgICAgICAgICAgIHJlc2V0UGFyZW50Q2hpbGRyZW4obm9kZXMsIGFycik7XG4gICAgICAgICAgICAgICAgbm9kZXMuc3BsaWNlLmFwcGx5KG5vZGVzLCBbaSwgMV0uY29uY2F0KGFycikpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGluc2VydEFycmF5U2xvdChlbC5jaGlsZHJlbiwgYXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2VydE9iamVjdFNsb3Qobm9kZXMsIG9iaikge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gbm9kZXNbaV07IGkrKykge1xuICAgICAgICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSAnc2xvdCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGVsLnByb3BzLm5hbWU7XG4gICAgICAgICAgICAgICAgcmVzZXRQYXJlbnRDaGlsZHJlbihub2Rlcywgb2JqW25hbWVdKTtcbiAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UuYXBwbHkobm9kZXMsIFtpLCAxXS5jb25jYXQob2JqW25hbWVdKSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgaW5zZXJ0T2JqZWN0U2xvdChlbC5jaGlsZHJlbiwgb2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGF2YWxvbi5jb21wb25lbnRzID0ge307XG4gICAgYXZhbG9uLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChuYW1lLCBjb21wb25lbnQpIHtcblxuICAgICAgICBjb21wb25lbnQuZXh0ZW5kID0gY29tcG9uZW50RXh0ZW5kO1xuICAgICAgICByZXR1cm4gYWRkVG9RdWV1ZShuYW1lLCBjb21wb25lbnQpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gYWRkVG9RdWV1ZShuYW1lLCBjb21wb25lbnQpIHtcbiAgICAgICAgYXZhbG9uLmNvbXBvbmVudHNbbmFtZV0gPSBjb21wb25lbnQ7XG4gICAgICAgIGZvciAodmFyIGVsLCBpID0gMDsgZWwgPSBjb21wb25lbnRRdWV1ZVtpXTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZWwuaXMgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRRdWV1ZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgZWwucmVJbml0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZWwudmFsdWU7XG4gICAgICAgICAgICAgICAgZWwudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcG9uZW50RXh0ZW5kKGNoaWxkKSB7XG4gICAgICAgIHZhciBuYW1lID0gY2hpbGQuZGlzcGxheU5hbWU7XG4gICAgICAgIGRlbGV0ZSBjaGlsZC5kaXNwbGF5TmFtZTtcbiAgICAgICAgdmFyIG9iaiA9IHsgZGVmYXVsdHM6IGF2YWxvbi5taXgodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIGNoaWxkLmRlZmF1bHRzKSB9O1xuICAgICAgICBpZiAoY2hpbGQuc29sZVNsb3QpIHtcbiAgICAgICAgICAgIG9iai5zb2xlU2xvdCA9IGNoaWxkLnNvbGVTbG90O1xuICAgICAgICB9XG4gICAgICAgIG9iai50ZW1wbGF0ZSA9IGNoaWxkLnRlbXBsYXRlIHx8IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIHJldHVybiBhdmFsb24uY29tcG9uZW50KG5hbWUsIG9iaik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF2YWxvbjtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hdmFsb24yL2Rpc3QvYXZhbG9uLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImRlZmluZShbXG4gICAgJ3JlcXVpcmUnLFxuICAgICdhdmFsb24yJ1xuXSwgZnVuY3Rpb24ocmVxdWlyZSwgYXZhbG9uMikge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBsZXQgdm0gPSBhdmFsb24yLmRlZmluZSh7XG4gICAgICAgICRpZDogXCJ0YWIxXCIsXG4gICAgICAgIG5hbWU6IFwi5a+M5by644CB5rCR5Li744CB5paH5piO44CB5ZKM6LCQ44CB6Ieq55Sx44CB5bmz562J44CB5YWs5q2j44CB5rOV5rK744CB54ix5Zu944CB5pWs5Lia44CB6K+a5L+h44CB5Y+L5ZaEMVwiLFxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0SHRtbCgpIHtcbiAgICAgICAgcmV0dXJuIFwiPGRpdiBtcy1jb250cm9sbGVyPSd0YWIxJz5cIiArXG4gICAgICAgICAgICBcIjxkaXY+e3tAbmFtZX19PC9kaXY+XCIgK1xuICAgICAgICAgICAgXCI8L2Rpdj5cIjtcbiAgICB9XG4gICAgcmV0dXJuIGdldEh0bWwoKTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvdGFiMS90YWIxLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHQvKlxuXHQgKiBcblx0ICogdmVyc2lvbiAxLjBcblx0ICogYnVpbHQgaW4gMjAxNS4xMS4xOVxuXHQgKiBcblx0ICogdjAuOS42XG5cdCAqIOS/ruato2dhc0F0dHJpYnV0ZSB0eXBvXG5cdCAqIOS/ruato21tSGlzdG9yeSBkb2N1bWVudC53cml0ZSBCVUdcblx0ICogXG5cdCAqIFxuXHQgKi9cblxuXHR2YXIgbW1IaXN0b3J5ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg2KVxuXHR2YXIgc3RvcmFnZSA9IF9fd2VicGFja19yZXF1aXJlX18oNylcblxuXHRmdW5jdGlvbiBSb3V0ZXIoKSB7XG5cdCAgICB0aGlzLnJ1bGVzID0gW11cblx0fVxuXG5cblx0dmFyIHBsYWNlaG9sZGVyID0gLyhbOipdKShcXHcrKXxcXHsoXFx3KykoPzpcXDooKD86W157fVxcXFxdK3xcXFxcLnxcXHsoPzpbXnt9XFxcXF0rfFxcXFwuKSpcXH0pKykpP1xcfS9nXG5cdFJvdXRlci5wcm90b3R5cGUgPSBzdG9yYWdlXG5cdGF2YWxvbi5taXgoc3RvcmFnZSwge1xuXHQgICAgZXJyb3I6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXHQgICAgICAgIHRoaXMuZXJyb3JiYWNrID0gY2FsbGJhY2tcblx0ICAgIH0sXG5cdCAgICBfcGF0aFRvUmVnRXhwOiBmdW5jdGlvbiAocGF0dGVybiwgb3B0cykge1xuXHQgICAgICAgIHZhciBrZXlzID0gb3B0cy5rZXlzID0gW10sXG5cdCAgICAgICAgICAgICAgICAvLyAgICAgIHNlZ21lbnRzID0gb3B0cy5zZWdtZW50cyA9IFtdLFxuXHQgICAgICAgICAgICAgICAgY29tcGlsZWQgPSAnXicsIGxhc3QgPSAwLCBtLCBuYW1lLCByZWdleHAsIHNlZ21lbnQ7XG5cblx0ICAgICAgICB3aGlsZSAoKG0gPSBwbGFjZWhvbGRlci5leGVjKHBhdHRlcm4pKSkge1xuXHQgICAgICAgICAgICBuYW1lID0gbVsyXSB8fCBtWzNdOyAvLyBJRVs3OF0gcmV0dXJucyAnJyBmb3IgdW5tYXRjaGVkIGdyb3VwcyBpbnN0ZWFkIG9mIG51bGxcblx0ICAgICAgICAgICAgcmVnZXhwID0gbVs0XSB8fCAobVsxXSA9PSAnKicgPyAnLionIDogJ3N0cmluZycpXG5cdCAgICAgICAgICAgIHNlZ21lbnQgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0LCBtLmluZGV4KTtcblx0ICAgICAgICAgICAgdmFyIHR5cGUgPSB0aGlzLiR0eXBlc1tyZWdleHBdXG5cdCAgICAgICAgICAgIHZhciBrZXkgPSB7XG5cdCAgICAgICAgICAgICAgICBuYW1lOiBuYW1lXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgaWYgKHR5cGUpIHtcblx0ICAgICAgICAgICAgICAgIHJlZ2V4cCA9IHR5cGUucGF0dGVyblxuXHQgICAgICAgICAgICAgICAga2V5LmRlY29kZSA9IHR5cGUuZGVjb2RlXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAga2V5cy5wdXNoKGtleSlcblx0ICAgICAgICAgICAgY29tcGlsZWQgKz0gcXVvdGVSZWdFeHAoc2VnbWVudCwgcmVnZXhwLCBmYWxzZSlcblx0ICAgICAgICAgICAgLy8gIHNlZ21lbnRzLnB1c2goc2VnbWVudClcblx0ICAgICAgICAgICAgbGFzdCA9IHBsYWNlaG9sZGVyLmxhc3RJbmRleFxuXHQgICAgICAgIH1cblx0ICAgICAgICBzZWdtZW50ID0gcGF0dGVybi5zdWJzdHJpbmcobGFzdCk7XG5cdCAgICAgICAgY29tcGlsZWQgKz0gcXVvdGVSZWdFeHAoc2VnbWVudCkgKyAob3B0cy5zdHJpY3QgPyBvcHRzLmxhc3QgOiBcIlxcLz9cIikgKyAnJCc7XG5cdCAgICAgICAgdmFyIHNlbnNpdGl2ZSA9IHR5cGVvZiBvcHRzLmNhc2VJbnNlbnNpdGl2ZSA9PT0gXCJib29sZWFuXCIgPyBvcHRzLmNhc2VJbnNlbnNpdGl2ZSA6IHRydWVcblx0ICAgICAgICAvLyAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcblx0ICAgICAgICBvcHRzLnJlZ2V4cCA9IG5ldyBSZWdFeHAoY29tcGlsZWQsIHNlbnNpdGl2ZSA/ICdpJyA6IHVuZGVmaW5lZCk7XG5cdCAgICAgICAgcmV0dXJuIG9wdHNcblxuXHQgICAgfSxcblx0ICAgIC8v5re75Yqg5LiA5Liq6Lev55Sx6KeE5YiZXG5cdCAgICBhZGQ6IGZ1bmN0aW9uIChwYXRoLCBjYWxsYmFjaywgb3B0cykge1xuXHQgICAgICAgIHZhciBhcnJheSA9IHRoaXMucnVsZXNcblx0ICAgICAgICBpZiAocGF0aC5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XG5cdCAgICAgICAgICAgIGF2YWxvbi5lcnJvcihcImF2YWxvbi5yb3V0ZXIuYWRk55qE56ys5LiA5Liq5Y+C5pWw5b+F6aG75LulL+W8gOWktFwiKVxuXHQgICAgICAgIH1cblx0ICAgICAgICBvcHRzID0gb3B0cyB8fCB7fVxuXHQgICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFja1xuXHQgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+IDIgJiYgcGF0aC5jaGFyQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gXCIvXCIpIHtcblx0ICAgICAgICAgICAgcGF0aCA9IHBhdGguc2xpY2UoMCwgLTEpXG5cdCAgICAgICAgICAgIG9wdHMubGFzdCA9IFwiL1wiXG5cdCAgICAgICAgfVxuXHQgICAgICAgIGF2YWxvbi5BcnJheS5lbnN1cmUoYXJyYXksIHRoaXMuX3BhdGhUb1JlZ0V4cChwYXRoLCBvcHRzKSlcblx0ICAgIH0sXG5cdCAgICAvL+WIpOWumuW9k+WJjVVSTOS4juW3suacieeKtuaAgeWvueixoeeahOi3r+eUseinhOWImeaYr+WQpuespuWQiFxuXHQgICAgcm91dGU6IGZ1bmN0aW9uIChwYXRoLCBxdWVyeSkge1xuXHQgICAgICAgIHBhdGggPSBwYXRoLnRyaW0oKVxuXHQgICAgICAgIHZhciBydWxlcyA9IHRoaXMucnVsZXNcblx0ICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gcnVsZXNbaSsrXTsgKSB7XG5cdCAgICAgICAgICAgIHZhciBhcmdzID0gcGF0aC5tYXRjaChlbC5yZWdleHApXG5cdCAgICAgICAgICAgIGlmIChhcmdzKSB7XG5cdCAgICAgICAgICAgICAgICBlbC5xdWVyeSA9IHF1ZXJ5IHx8IHt9XG5cdCAgICAgICAgICAgICAgICBlbC5wYXRoID0gcGF0aFxuXHQgICAgICAgICAgICAgICAgZWwucGFyYW1zID0ge31cblx0ICAgICAgICAgICAgICAgIHZhciBrZXlzID0gZWwua2V5c1xuXHQgICAgICAgICAgICAgICAgYXJncy5zaGlmdCgpXG5cdCAgICAgICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGgpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJzZUFyZ3MoYXJncywgZWwpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gIGVsLmNhbGxiYWNrLmFwcGx5KGVsLCBhcmdzKVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfVxuXHQgICAgICAgIGlmICh0aGlzLmVycm9yYmFjaykge1xuXHQgICAgICAgICAgICB0aGlzLmVycm9yYmFjaygpXG5cdCAgICAgICAgfVxuXHQgICAgfSxcblx0ICAgIF9wYXJzZUFyZ3M6IGZ1bmN0aW9uIChtYXRjaCwgc3RhdGVPYmopIHtcblx0ICAgICAgICB2YXIga2V5cyA9IHN0YXRlT2JqLmtleXNcblx0ICAgICAgICBmb3IgKHZhciBqID0gMCwgam4gPSBrZXlzLmxlbmd0aDsgaiA8IGpuOyBqKyspIHtcblx0ICAgICAgICAgICAgdmFyIGtleSA9IGtleXNbal1cblx0ICAgICAgICAgICAgdmFyIHZhbHVlID0gbWF0Y2hbal0gfHwgJydcblx0ICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkuZGVjb2RlID09PSAnZnVuY3Rpb24nKSB7Ly/lnKjov5nph4zlsJ3or5XovazmjaLlj4LmlbDnmoTnsbvlnotcblx0ICAgICAgICAgICAgICAgIHZhciB2YWwgPSBrZXkuZGVjb2RlKHZhbHVlKVxuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgICAgICB2YWwgPSBKU09OLnBhcnNlKHZhbHVlKVxuXHQgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhbCA9IHZhbHVlXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgbWF0Y2hbal0gPSBzdGF0ZU9iai5wYXJhbXNba2V5Lm5hbWVdID0gdmFsXG5cdCAgICAgICAgfVxuXHQgICAgfSxcblx0ICAgIC8qXG5cdCAgICAgKiAgQGludGVyZmFjZSBhdmFsb24ucm91dGVyLm5hdmlnYXRlIOiuvue9ruWOhuWPsijmlLnlj5hVUkwpXG5cdCAgICAgKiAgQHBhcmFtIGhhc2gg6K6/6Zeu55qEdXJsIGhhc2ggICBcblx0ICAgICAqL1xuXHQgICAgbmF2aWdhdGU6IGZ1bmN0aW9uIChoYXNoLCBtb2RlKSB7XG5cdCAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlUXVlcnkoaGFzaClcblx0ICAgICAgICB2YXIgbmV3SGFzaCA9IHRoaXMucm91dGUocGFyc2VkLnBhdGgsIHBhcnNlZC5xdWVyeSlcblx0ICAgICAgICBpZihpc0xlZ2FsUGF0aChuZXdIYXNoKSl7XG5cdCAgICAgICAgICAgIGhhc2ggPSBuZXdIYXNoXG5cdCAgICAgICAgfVxuXHQgICAgICAgIC8v5L+d5a2Y5Yiw5pys5Zyw5YKo5a2Y5oiWY29va2llXG5cdCAgICAgICAgYXZhbG9uLnJvdXRlci5zZXRMYXN0UGF0aChoYXNoKVxuXHQgICAgICAgIC8vIOaooeW8jzAsIOS4jeaUueWPmFVSTCwg5LiN5Lqn55Sf5Y6G5Y+y5a6e5L2TLCDmiafooYzlm57osINcblx0ICAgICAgICAvLyDmqKHlvI8xLCDmlLnlj5hVUkwsIOS4jeS6p+eUn+WOhuWPsuWunuS9kywgICDmiafooYzlm57osINcblx0ICAgICAgICAvLyDmqKHlvI8yLCDmlLnlj5hVUkwsIOS6p+eUn+WOhuWPsuWunuS9kywgICAg5omn6KGM5Zue6LCDXG5cdCAgICAgICAgaWYgKG1vZGUgPT09IDEpIHtcblx0ICAgICAgICAgIFxuXHQgICAgICAgICAgICBhdmFsb24uaGlzdG9yeS5zZXRIYXNoKGhhc2gsIHRydWUpXG5cdCAgICAgICAgfSBlbHNlIGlmIChtb2RlID09PSAyKSB7XG5cdCAgICAgICAgICAgIGF2YWxvbi5oaXN0b3J5LnNldEhhc2goaGFzaClcblx0ICAgICAgICB9XG5cdCAgICAgICAgcmV0dXJuIGhhc2hcblx0ICAgIH0sXG5cdCAgICAvKlxuXHQgICAgICogIEBpbnRlcmZhY2UgYXZhbG9uLnJvdXRlci53aGVuIOmFjee9rumHjeWumuWQkeinhOWImVxuXHQgICAgICogIEBwYXJhbSBwYXRoIOiiq+mHjeWumuWQkeeahOihqOi+vuW8j++8jOWPr+S7peaYr+Wtl+espuS4suaIluiAheaVsOe7hFxuXHQgICAgICogIEBwYXJhbSByZWRpcmVjdCDph43lrprlkJHnmoTooajnpLrlvI/miJbogIV1cmxcblx0ICAgICAqL1xuXHQgICAgd2hlbjogZnVuY3Rpb24gKHBhdGgsIHJlZGlyZWN0KSB7XG5cdCAgICAgICAgdmFyIG1lID0gdGhpcyxcblx0ICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoIGluc3RhbmNlb2YgQXJyYXkgPyBwYXRoIDogW3BhdGhdXG5cdCAgICAgICAgYXZhbG9uLmVhY2gocGF0aCwgZnVuY3Rpb24gKGluZGV4LCBwKSB7XG5cdCAgICAgICAgICAgIG1lLmFkZChwLCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IG1lLnVybEZvcm1hdGUocmVkaXJlY3QsIHRoaXMucGFyYW1zLCB0aGlzLnF1ZXJ5KVxuXHQgICAgICAgICAgICAgICAgbWUubmF2aWdhdGUoaW5mby5wYXRoICsgaW5mby5xdWVyeSlcblx0ICAgICAgICAgICAgfSlcblx0ICAgICAgICB9KVxuXHQgICAgICAgIHJldHVybiB0aGlzXG5cdCAgICB9LFxuXHQgICAgdXJsRm9ybWF0ZTogZnVuY3Rpb24gKHVybCwgcGFyYW1zLCBxdWVyeSkge1xuXHQgICAgICAgIHZhciBxdWVyeSA9IHF1ZXJ5ID8gcXVlcnlUb1N0cmluZyhxdWVyeSkgOiBcIlwiLFxuXHQgICAgICAgICAgICAgICAgaGFzaCA9IHVybC5yZXBsYWNlKHBsYWNlaG9sZGVyLCBmdW5jdGlvbiAobWF0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IG1hdC5yZXBsYWNlKC9bXFx7XFx9XS9nLCAnJykuc3BsaXQoXCI6XCIpXG5cdCAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5WzBdID8ga2V5WzBdIDoga2V5WzFdXG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtc1trZXldICE9PSB1bmRlZmluZWQgPyBwYXJhbXNba2V5XSA6ICcnXG5cdCAgICAgICAgICAgICAgICB9KS5yZXBsYWNlKC9eXFwvL2csICcnKVxuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIHBhdGg6IGhhc2gsXG5cdCAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeVxuXHQgICAgICAgIH1cblx0ICAgIH0sXG5cdCAgICAvKiAqXG5cdCAgICAgYCcvaGVsbG8vJ2AgLSDljLnphY0nL2hlbGxvLyfmiJYnL2hlbGxvJ1xuXHQgICAgIGAnL3VzZXIvOmlkJ2AgLSDljLnphY0gJy91c2VyL2JvYicg5oiWICcvdXNlci8xMjM0ISEhJyDmiJYgJy91c2VyLycg5L2G5LiN5Yy56YWNICcvdXNlcicg5LiOICcvdXNlci9ib2IvZGV0YWlscydcblx0ICAgICBgJy91c2VyL3tpZH0nYCAtIOWQjOS4ilxuXHQgICAgIGAnL3VzZXIve2lkOlteL10qfSdgIC0g5ZCM5LiKXG5cdCAgICAgYCcvdXNlci97aWQ6WzAtOWEtZkEtRl17MSw4fX0nYCAtIOimgeaxgklE5Yy56YWNL1swLTlhLWZBLUZdezEsOH0v6L+Z5Liq5a2Q5q2j5YiZXG5cdCAgICAgYCcvZmlsZXMve3BhdGg6Lip9J2AgLSBNYXRjaGVzIGFueSBVUkwgc3RhcnRpbmcgd2l0aCAnL2ZpbGVzLycgYW5kIGNhcHR1cmVzIHRoZSByZXN0IG9mIHRoZVxuXHQgICAgIHBhdGggaW50byB0aGUgcGFyYW1ldGVyICdwYXRoJy5cblx0ICAgICBgJy9maWxlcy8qcGF0aCdgIC0gZGl0dG8uXG5cdCAgICAgKi9cblx0ICAgIC8vIGF2YWxvbi5yb3V0ZXIuZ2V0KFwiL2RkZC86ZGRkSUQvXCIsY2FsbGJhY2spXG5cdCAgICAvLyBhdmFsb24ucm91dGVyLmdldChcIi9kZGQve2RkZElEfS9cIixjYWxsYmFjaylcblx0ICAgIC8vIGF2YWxvbi5yb3V0ZXIuZ2V0KFwiL2RkZC97ZGRkSUQ6WzAtOV17NH19L1wiLGNhbGxiYWNrKVxuXHQgICAgLy8gYXZhbG9uLnJvdXRlci5nZXQoXCIvZGRkL3tkZGRJRDppbnR9L1wiLGNhbGxiYWNrKVxuXHQgICAgLy8g5oiR5Lus55Sa6Iez5Y+v5Lul5Zyo6L+Z6YeM5re75Yqg5paw55qE57G75Z6L77yMYXZhbG9uLnJvdXRlci4kdHlwZS5kNCA9IHsgcGF0dGVybjogJ1swLTldezR9JywgZGVjb2RlOiBOdW1iZXJ9XG5cdCAgICAvLyBhdmFsb24ucm91dGVyLmdldChcIi9kZGQve2RkZElEOmQ0fS9cIixjYWxsYmFjaylcblx0ICAgICR0eXBlczoge1xuXHQgICAgICAgIGRhdGU6IHtcblx0ICAgICAgICAgICAgcGF0dGVybjogXCJbMC05XXs0fS0oPzowWzEtOV18MVswLTJdKS0oPzowWzEtOV18WzEtMl1bMC05XXwzWzAtMV0pXCIsXG5cdCAgICAgICAgICAgIGRlY29kZTogZnVuY3Rpb24gKHZhbCkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHZhbC5yZXBsYWNlKC9cXC0vZywgXCIvXCIpKVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblx0ICAgICAgICBzdHJpbmc6IHtcblx0ICAgICAgICAgICAgcGF0dGVybjogXCJbXlxcXFwvXSpcIixcblx0ICAgICAgICAgICAgZGVjb2RlOiBmdW5jdGlvbiAodmFsKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gdmFsO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblx0ICAgICAgICBib29sOiB7XG5cdCAgICAgICAgICAgIGRlY29kZTogZnVuY3Rpb24gKHZhbCkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApID09PSAwID8gZmFsc2UgOiB0cnVlO1xuXHQgICAgICAgICAgICB9LFxuXHQgICAgICAgICAgICBwYXR0ZXJuOiBcIjB8MVwiXG5cdCAgICAgICAgfSxcblx0ICAgICAgICAnaW50Jzoge1xuXHQgICAgICAgICAgICBkZWNvZGU6IGZ1bmN0aW9uICh2YWwpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWwsIDEwKTtcblx0ICAgICAgICAgICAgfSxcblx0ICAgICAgICAgICAgcGF0dGVybjogXCJcXFxcZCtcIlxuXHQgICAgICAgIH1cblx0ICAgIH1cblx0fSlcblxuXG5cdG1vZHVsZS5leHBvcnRzID0gYXZhbG9uLnJvdXRlciA9IG5ldyBSb3V0ZXJcblxuXG5cdGZ1bmN0aW9uIHBhcnNlUXVlcnkodXJsKSB7XG5cdCAgICB2YXIgYXJyYXkgPSB1cmwuc3BsaXQoXCI/XCIpLCBxdWVyeSA9IHt9LCBwYXRoID0gYXJyYXlbMF0sIHF1ZXJ5c3RyaW5nID0gYXJyYXlbMV1cblx0ICAgIGlmIChxdWVyeXN0cmluZykge1xuXHQgICAgICAgIHZhciBzZWcgPSBxdWVyeXN0cmluZy5zcGxpdChcIiZcIiksXG5cdCAgICAgICAgICAgICAgICBsZW4gPSBzZWcubGVuZ3RoLCBpID0gMCwgcztcblx0ICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG5cdCAgICAgICAgICAgIGlmICghc2VnW2ldKSB7XG5cdCAgICAgICAgICAgICAgICBjb250aW51ZVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHMgPSBzZWdbaV0uc3BsaXQoXCI9XCIpXG5cdCAgICAgICAgICAgIHF1ZXJ5W2RlY29kZVVSSUNvbXBvbmVudChzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQoc1sxXSlcblx0ICAgICAgICB9XG5cdCAgICB9XG5cdCAgICByZXR1cm4ge1xuXHQgICAgICAgIHBhdGg6IHBhdGgsXG5cdCAgICAgICAgcXVlcnk6IHF1ZXJ5XG5cdCAgICB9XG5cdH1cblx0ZnVuY3Rpb24gaXNMZWdhbFBhdGgocGF0aCl7XG5cdCAgICBpZihwYXRoID09PSAnLycpXG5cdCAgICAgICAgcmV0dXJuIHRydWVcblx0ICAgIGlmKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJyAmJiBwYXRoLmxlbmd0aCA+IDEgJiYgcGF0aC5jaGFyQXQoMCkgPT09ICcvJyl7XG5cdCAgICAgICAgcmV0dXJuIHRydWVcblx0ICAgIH1cblx0fVxuXG5cdGZ1bmN0aW9uIHF1ZXJ5VG9TdHJpbmcob2JqKSB7XG5cdCAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpXG5cdCAgICAgICAgcmV0dXJuIG9ialxuXHQgICAgdmFyIHN0ciA9IFtdXG5cdCAgICBmb3IgKHZhciBpIGluIG9iaikge1xuXHQgICAgICAgIGlmIChpID09PSBcInF1ZXJ5XCIpXG5cdCAgICAgICAgICAgIGNvbnRpbnVlXG5cdCAgICAgICAgc3RyLnB1c2goaSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpbaV0pKVxuXHQgICAgfVxuXHQgICAgcmV0dXJuIHN0ci5sZW5ndGggPyAnPycgKyBzdHIuam9pbihcIiZcIikgOiAnJ1xuXHR9XG5cblxuXHRmdW5jdGlvbiBxdW90ZVJlZ0V4cChzdHJpbmcsIHBhdHRlcm4sIGlzT3B0aW9uYWwpIHtcblx0ICAgIHZhciByZXN1bHQgPSBzdHJpbmcucmVwbGFjZSgvW1xcXFxcXFtcXF1cXF4kKis/LigpfHt9XS9nLCBcIlxcXFwkJlwiKTtcblx0ICAgIGlmICghcGF0dGVybilcblx0ICAgICAgICByZXR1cm4gcmVzdWx0O1xuXHQgICAgdmFyIGZsYWcgPSBpc09wdGlvbmFsID8gJz8nIDogJyc7XG5cdCAgICByZXR1cm4gcmVzdWx0ICsgZmxhZyArICcoJyArIHBhdHRlcm4gKyAnKScgKyBmbGFnO1xuXHR9XG5cblxuLyoqKi8gfSxcbi8qIDEgKi8sXG4vKiAyICovLFxuLyogMyAqLyxcbi8qIDQgKi8sXG4vKiA1ICovLFxuLyogNiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0LyohXG5cdCAqIG1tSGlzdG9yeVxuXHQgKiDnlKjkuo7nm5HlkKzlnLDlnYDmoI/nmoTlj5jljJZcblx0ICogaHR0cHM6Ly9naXRodWIuY29tL2ZsYXRpcm9uL2RpcmVjdG9yL2Jsb2IvbWFzdGVyL2xpYi9kaXJlY3Rvci9icm93c2VyLmpzXG5cdCAqIGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzL2Jsb2IvbWFzdGVyL3BhZ2UuanNcblx0ICovXG5cblx0dmFyIGxvY2F0aW9uID0gZG9jdW1lbnQubG9jYXRpb25cblx0dmFyIG9sZElFID0gYXZhbG9uLm1zaWUgPD0gN1xuXHR2YXIgc3VwcG9ydFB1c2hTdGF0ZSA9ICEhKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSlcblx0dmFyIHN1cHBvcnRIYXNoQ2hhbmdlID0gISEoXCJvbmhhc2hjaGFuZ2VcIiBpbiB3aW5kb3cgJiYgKCF3aW5kb3cuVkJBcnJheSB8fCAhb2xkSUUpKVxuXHR2YXIgZGVmYXVsdHMgPSB7XG5cdCAgICByb290OiBcIi9cIixcblx0ICAgIGh0bWw1OiBmYWxzZSxcblx0ICAgIGhhc2hQcmVmaXg6IFwiIVwiLFxuXHQgICAgaWZyYW1lSUQ6IG51bGwsIC8vSUU2LTfvvIzlpoLmnpzmnInlnKjpobXpnaLlhpnmrbvkuobkuIDkuKppZnJhbWXvvIzov5nmoLfkvLzkuY7liLfmlrDnmoTml7blgJnkuI3kvJrkuKLmjonkuYvliY3nmoTljoblj7Jcblx0ICAgIGludGVydmFsOiA1MCwgLy9JRTYtNyzkvb/nlKjova7or6LvvIzov5nmmK/lhbbml7bpl7Tml7bpmpQsXG5cdCAgICBhdXRvU2Nyb2xsOiBmYWxzZVxuXHR9XG5cdHZhciBtbUhpc3RvcnkgPSB7XG5cdCAgICBoYXNoOiBnZXRIYXNoKGxvY2F0aW9uLmhyZWYpLFxuXHQgICAgY2hlY2s6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgIHZhciBoID0gZ2V0SGFzaChsb2NhdGlvbi5ocmVmKVxuXHQgICAgICAgIGlmIChoICE9PSB0aGlzLmhhc2gpIHtcblx0ICAgICAgICAgICAgdGhpcy5oYXNoID0gaFxuXHQgICAgICAgICAgICB0aGlzLm9uSGFzaENoYW5nZWQoKVxuXHQgICAgICAgIH1cblx0ICAgIH0sXG5cdCAgICBzdGFydDogZnVuY3Rpb24ob3B0aW9ucykge1xuXHQgICAgICAgIGlmICh0aGlzLnN0YXJ0ZWQpXG5cdCAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXZhbG9uLmhpc3RvcnkgaGFzIGFscmVhZHkgYmVlbiBzdGFydGVkJylcblx0ICAgICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlXG5cdCAgICAgICAgICAgIC8v55uR5ZCs5qih5byPXG5cdCAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnYm9vbGVhbicpIHtcblx0ICAgICAgICAgICAgb3B0aW9ucyA9IHtcblx0ICAgICAgICAgICAgICAgIGh0bWw1OiBvcHRpb25zXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgICAgICBvcHRpb25zID0gYXZhbG9uLm1peCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pXG5cdCAgICAgICAgaWYgKG9wdGlvbnMuZmlyZUFuY2hvcikge1xuXHQgICAgICAgICAgICBvcHRpb25zLmF1dG9TY3JvbGwgPSB0cnVlXG5cdCAgICAgICAgfVxuXHQgICAgICAgIHZhciByb290UGF0aCA9IG9wdGlvbnMucm9vdFxuXHQgICAgICAgIGlmICghL15cXC8vLnRlc3Qocm9vdFBhdGgpKSB7XG5cdCAgICAgICAgICAgIGF2YWxvbi5lcnJvcigncm9vdOmFjee9rumhueW/hemhu+S7pS/lrZfnrKblvIDlp4ssIOS7pemdni/lrZfnrKbnu5PmnZ8nKVxuXHQgICAgICAgIH1cblx0ICAgICAgICBpZiAocm9vdFBhdGgubGVuZ3RoID4gMSkge1xuXHQgICAgICAgICAgICBvcHRpb25zLnJvb3QgPSByb290UGF0aC5yZXBsYWNlKC9cXC8kLywgJycpXG5cdCAgICAgICAgfVxuXHQgICAgICAgIHZhciBodG1sNU1vZGUgPSBvcHRpb25zLmh0bWw1XG5cdCAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuXHQgICAgICAgIHRoaXMubW9kZSA9IGh0bWw1TW9kZSA/IFwicG9wc3RhdGVcIiA6IFwiaGFzaGNoYW5nZVwiXG5cdCAgICAgICAgaWYgKCFzdXBwb3J0UHVzaFN0YXRlKSB7XG5cdCAgICAgICAgICAgIGlmIChodG1sNU1vZGUpIHtcblx0ICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKFwi5rWP6KeI5Zmo5LiN5pSv5oyBSFRNTDUgcHVzaFN0YXRl77yM5bmz56iz6YCA5YyW5Yiwb25oYXNoY2hhbmdlIVwiKVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHRoaXMubW9kZSA9IFwiaGFzaGNoYW5nZVwiXG5cdCAgICAgICAgfVxuXHQgICAgICAgIGlmICghc3VwcG9ydEhhc2hDaGFuZ2UpIHtcblx0ICAgICAgICAgICAgdGhpcy5tb2RlID0gXCJpZnJhbWVwb2xsXCJcblx0ICAgICAgICB9XG5cdCAgICAgICAgYXZhbG9uLmxvZygnYXZhbG9uIHJ1biBtbUhpc3RvcnkgaW4gdGhlICcsIHRoaXMubW9kZSwgJ21vZGUnKVxuXHQgICAgICAgICAgICAvLyDmlK/mjIFwb3BzdGF0ZSDlsLHnm5HlkKxwb3BzdGF0ZVxuXHQgICAgICAgICAgICAvLyDmlK/mjIFoYXNoY2hhbmdlIOWwseebkeWQrGhhc2hjaGFuZ2UoSUU4LElFOSxGRjMpXG5cdCAgICAgICAgICAgIC8vIOWQpuWImeeahOivneWPquiDveavj+malOS4gOauteaXtumXtOi/m+ihjOajgOa1i+S6hihJRTYsIElFNylcblx0ICAgICAgICBzd2l0Y2ggKHRoaXMubW9kZSkge1xuXHQgICAgICAgICAgICBjYXNlIFwicG9wc3RhdGVcIjpcblx0ICAgICAgICAgICAgICAgIC8vIEF0IGxlYXN0IGZvciBub3cgSFRNTDUgaGlzdG9yeSBpcyBhdmFpbGFibGUgZm9yICdtb2Rlcm4nIGJyb3dzZXJzIG9ubHlcblx0ICAgICAgICAgICAgICAgIC8vIFRoZXJlIGlzIGFuIG9sZCBidWcgaW4gQ2hyb21lIHRoYXQgY2F1c2VzIG9ucG9wc3RhdGUgdG8gZmlyZSBldmVuXG5cdCAgICAgICAgICAgICAgICAvLyB1cG9uIGluaXRpYWwgcGFnZSBsb2FkLiBTaW5jZSB0aGUgaGFuZGxlciBpcyBydW4gbWFudWFsbHkgaW4gaW5pdCgpLFxuXHQgICAgICAgICAgICAgICAgLy8gdGhpcyB3b3VsZCBjYXVzZSBDaHJvbWUgdG8gcnVuIGl0IHR3aXNlLiBDdXJyZW50bHkgdGhlIG9ubHlcblx0ICAgICAgICAgICAgICAgIC8vIHdvcmthcm91bmQgc2VlbXMgdG8gYmUgdG8gc2V0IHRoZSBoYW5kbGVyIGFmdGVyIHRoZSBpbml0aWFsIHBhZ2UgbG9hZFxuXHQgICAgICAgICAgICAgICAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NjMwNDBcblx0ICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9ucG9wc3RhdGUgPSBtbUhpc3Rvcnkub25IYXNoQ2hhbmdlZFxuXHQgICAgICAgICAgICAgICAgfSwgNTAwKVxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICAgICAgY2FzZSBcImhhc2hjaGFuZ2VcIjpcblx0ICAgICAgICAgICAgICAgIHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBtbUhpc3Rvcnkub25IYXNoQ2hhbmdlZFxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICAgICAgY2FzZSBcImlmcmFtZXBvbGxcIjpcblx0ICAgICAgICAgICAgICAgIC8v5Lmf5pyJ5Lq66L+Z5qC3546pIGh0dHA6Ly93d3cuY25ibG9ncy5jb20vbWV0ZW9yaWNfY3J5L2FyY2hpdmUvMjAxMS8wMS8xMS8xOTMzMTY0Lmh0bWxcblx0ICAgICAgICAgICAgICAgIGF2YWxvbi5yZWFkeShmdW5jdGlvbigpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJylcblx0ICAgICAgICAgICAgICAgICAgICBpZnJhbWUuaWQgPSBvcHRpb25zLmlmcmFtZUlEXG5cdCAgICAgICAgICAgICAgICAgICAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblx0ICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSlcblx0ICAgICAgICAgICAgICAgICAgICBtbUhpc3RvcnkuaWZyYW1lID0gaWZyYW1lXG5cdCAgICAgICAgICAgICAgICAgICAgbW1IaXN0b3J5LndyaXRlRnJhbWUoJycpXG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWxvbi5tc2llKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uUHJvcGVydHlDaGFuZ2UoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJvcGVydHlOYW1lID09PSAnbG9jYXRpb24nKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW1IaXN0b3J5LmNoZWNrKClcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5hdHRhY2hFdmVudCgnb25wcm9wZXJ0eWNoYW5nZScsIG9uUHJvcGVydHlDaGFuZ2UpXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIG1tSGlzdG9yeS5vblByb3BlcnR5Q2hhbmdlID0gb25Qcm9wZXJ0eUNoYW5nZVxuXHQgICAgICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgICAgIG1tSGlzdG9yeS5pbnRlcnZhbElEID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBtbUhpc3RvcnkuY2hlY2soKVxuXHQgICAgICAgICAgICAgICAgICAgIH0sIG9wdGlvbnMuaW50ZXJ2YWwpXG5cblx0ICAgICAgICAgICAgICAgIH0pXG5cdCAgICAgICAgICAgICAgICBicmVha1xuXHQgICAgICAgIH1cblx0ICAgICAgICAvL+mhtemdouWKoOi9veaXtuinpuWPkW9uSGFzaENoYW5nZWRcblx0ICAgICAgICB0aGlzLm9uSGFzaENoYW5nZWQoKVxuXHQgICAgfSxcblx0ICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG5cdCAgICAgICAgICAgIGNhc2UgXCJwb3BzdGF0ZVwiOlxuXHQgICAgICAgICAgICAgICAgd2luZG93Lm9ucG9wc3RhdGUgPSBhdmFsb24ubm9vcFxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICAgICAgY2FzZSBcImhhc2hjaGFuZ2VcIjpcblx0ICAgICAgICAgICAgICAgIHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBhdmFsb24ubm9vcFxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICAgICAgY2FzZSBcImlmcmFtZXBvbGxcIjpcblx0ICAgICAgICAgICAgICAgIGlmICh0aGlzLmlmcmFtZSkge1xuXHQgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5pZnJhbWUpXG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy5pZnJhbWUgPSBudWxsXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICBpZiAodGhpcy5vblByb3BlcnR5Q2hhbmdlKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZGV0YWNoRXZlbnQoJ29ucHJvcGVydHljaGFuZ2UnLCB0aGlzLm9uUHJvcGVydHlDaGFuZ2UpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJRClcblx0ICAgICAgICAgICAgICAgIGJyZWFrXG5cdCAgICAgICAgfVxuXHQgICAgICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlXG5cdCAgICB9LFxuXHQgICAgc2V0SGFzaDogZnVuY3Rpb24ocywgcmVwbGFjZSkge1xuXHQgICAgICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG5cdCAgICAgICAgICAgIGNhc2UgJ2lmcmFtZXBvbGwnOlxuXHQgICAgICAgICAgICAgICAgaWYgKHJlcGxhY2UpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgaWZyYW1lID0gdGhpcy5pZnJhbWVcblx0ICAgICAgICAgICAgICAgICAgICBpZiAoaWZyYW1lKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIC8vY29udGVudFdpbmRvdyDlhbzlrrnlkITkuKrmtY/op4jlmajvvIzlj6/lj5blvpflrZDnqpflj6PnmoQgd2luZG93IOWvueixoeOAglxuXHQgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnRlbnREb2N1bWVudCBGaXJlZm94IOaUr+aMge+8jD4gaWU4IOeahGll5pSv5oyB44CC5Y+v5Y+W5b6X5a2Q56qX5Y+j55qEIGRvY3VtZW50IOWvueixoeOAglxuXHQgICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5faGFzaCA9IHNcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMud3JpdGVGcmFtZShzKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICAgICAgY2FzZSAncG9wc3RhdGUnOlxuXHQgICAgICAgICAgICAgICAgdmFyIHBhdGggPSAodGhpcy5vcHRpb25zLnJvb3QgKyAnLycgKyBzKS5yZXBsYWNlKC9cXC8rL2csICcvJylcblx0ICAgICAgICAgICAgICAgIHZhciBtZXRob2QgPSByZXBsYWNlID8gJ3JlcGxhY2VTdGF0ZScgOiAncHVzaFN0YXRlJ1xuXHQgICAgICAgICAgICAgICAgaGlzdG9yeVttZXRob2RdKHt9LCBkb2N1bWVudC50aXRsZSwgcGF0aClcblx0ICAgICAgICAgICAgICAgICAgICAvLyDmiYvliqjop6blj5FvbnBvcHN0YXRlIGV2ZW50XG5cdCAgICAgICAgICAgICAgICB0aGlzLm9uSGFzaENoYW5nZWQoKVxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICAgICAgZGVmYXVsdDpcblx0ICAgICAgICAgICAgICAgIC8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85MjM1MzA0L2hvdy10by1yZXBsYWNlLXRoZS1sb2NhdGlvbi1oYXNoLWFuZC1vbmx5LWtlZXAtdGhlLWxhc3QtaGlzdG9yeS1lbnRyeVxuXHQgICAgICAgICAgICAgICAgdmFyIG5ld0hhc2ggPSB0aGlzLm9wdGlvbnMuaGFzaFByZWZpeCArIHNcblx0ICAgICAgICAgICAgICAgIGlmIChyZXBsYWNlICYmIGxvY2F0aW9uLmhhc2ggIT09IG5ld0hhc2gpIHtcblx0ICAgICAgICAgICAgICAgICAgICBoaXN0b3J5LmJhY2soKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgbG9jYXRpb24uaGFzaCA9IG5ld0hhc2hcblx0ICAgICAgICAgICAgICAgIGJyZWFrXG5cdCAgICAgICAgfVxuXHQgICAgfSxcblx0ICAgIHdyaXRlRnJhbWU6IGZ1bmN0aW9uKHMpIHtcblx0ICAgICAgICAvLyBJRSBzdXBwb3J0Li4uXG5cdCAgICAgICAgdmFyIGYgPSBtbUhpc3RvcnkuaWZyYW1lXG5cdCAgICAgICAgdmFyIGQgPSBmLmNvbnRlbnREb2N1bWVudCB8fCBmLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnRcblx0ICAgICAgICBkLm9wZW4oKVxuXHQgICAgICAgIHZhciBlbmQgPVwiL3NjcmlwdFwiXG5cdCAgICAgICAgZC53cml0ZShcIjxzY3JpcHQ+X2hhc2ggPSAnXCIgKyBzICsgXCInOyBvbmxvYWQgPSBwYXJlbnQuYXZhbG9uLmhpc3Rvcnkuc3luY0hhc2g7PFwiK2VuZCtcIj5cIilcblx0ICAgICAgICBkLmNsb3NlKClcblx0ICAgIH0sXG5cdCAgICBzeW5jSGFzaDogZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgLy8gSUUgc3VwcG9ydC4uLlxuXHQgICAgICAgIHZhciBzID0gdGhpcy5faGFzaFxuXHQgICAgICAgIGlmIChzICE9PSBnZXRIYXNoKGxvY2F0aW9uLmhyZWYpKSB7XG5cdCAgICAgICAgICAgIGxvY2F0aW9uLmhhc2ggPSBzXG5cdCAgICAgICAgfVxuXHQgICAgICAgIHJldHVybiB0aGlzXG5cdCAgICB9LFxuXG5cdCAgICBnZXRQYXRoOiBmdW5jdGlvbigpIHtcblx0ICAgICAgICB2YXIgcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UodGhpcy5vcHRpb25zLnJvb3QsICcnKVxuXHQgICAgICAgIGlmIChwYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG5cdCAgICAgICAgICAgIHBhdGggPSAnLycgKyBwYXRoXG5cdCAgICAgICAgfVxuXHQgICAgICAgIHJldHVybiBwYXRoXG5cdCAgICB9LFxuXHQgICAgb25IYXNoQ2hhbmdlZDogZnVuY3Rpb24oaGFzaCwgY2xpY2tNb2RlKSB7XG5cdCAgICAgICAgaWYgKCFjbGlja01vZGUpIHtcblx0ICAgICAgICAgICAgaGFzaCA9IG1tSGlzdG9yeS5tb2RlID09PSAncG9wc3RhdGUnID8gbW1IaXN0b3J5LmdldFBhdGgoKSA6XG5cdCAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoLy4qIyE/LywgJycpXG5cdCAgICAgICAgfVxuXHQgICAgICAgIGhhc2ggPSBkZWNvZGVVUklDb21wb25lbnQoaGFzaClcblx0ICAgICAgICBoYXNoID0gaGFzaC5jaGFyQXQoMCkgPT09ICcvJyA/IGhhc2ggOiAnLycgKyBoYXNoXG5cdCAgICAgICAgaWYgKGhhc2ggIT09IG1tSGlzdG9yeS5oYXNoKSB7XG5cdCAgICAgICAgICAgIG1tSGlzdG9yeS5oYXNoID0gaGFzaFxuXG5cdCAgICAgICAgICAgIGlmIChhdmFsb24ucm91dGVyKSB7IC8v5Y2zbW1Sb3V0ZXJcblx0ICAgICAgICAgICAgICAgIGhhc2ggPSBhdmFsb24ucm91dGVyLm5hdmlnYXRlKGhhc2gsIDApXG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICBpZiAoY2xpY2tNb2RlKSB7XG5cdCAgICAgICAgICAgICAgICBtbUhpc3Rvcnkuc2V0SGFzaChoYXNoKVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIGlmIChjbGlja01vZGUgJiYgbW1IaXN0b3J5Lm9wdGlvbnMuYXV0b1Njcm9sbCkge1xuXHQgICAgICAgICAgICAgICAgYXV0b1Njcm9sbChoYXNoLnNsaWNlKDEpKVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfVxuXG5cdCAgICB9XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRIYXNoKHBhdGgpIHtcblx0ICAgIC8vIElFNuebtOaOpeeUqGxvY2F0aW9uLmhhc2jlj5ZoYXNo77yM5Y+v6IO95Lya5Y+W5bCR5LiA6YOo5YiG5YaF5a65XG5cdCAgICAvLyDmr5TlpoIgaHR0cDovL3d3dy5jbmJsb2dzLmNvbS9ydWJ5bG91dnJlI3N0cmVhbS94eHh4eD9sYW5nPXpoX2Ncblx0ICAgIC8vIGllNiA9PiBsb2NhdGlvbi5oYXNoID0gI3N0cmVhbS94eHh4eFxuXHQgICAgLy8g5YW25LuW5rWP6KeI5ZmoID0+IGxvY2F0aW9uLmhhc2ggPSAjc3RyZWFtL3h4eHh4P2xhbmc9emhfY1xuXHQgICAgLy8gZmlyZWZveCDkvJroh6rkvZzlpJrmg4Xlr7loYXNo6L+b6KGMZGVjb2RlVVJJQ29tcG9uZW50XG5cdCAgICAvLyDlj4jmr5TlpoIgaHR0cDovL3d3dy5jbmJsb2dzLmNvbS9ydWJ5bG91dnJlLyMhL2hvbWUvcT17JTIydGhlZGF0ZSUyMjolMjIyMDEyMTAxMH4yMDEyMTAxMCUyMn1cblx0ICAgIC8vIGZpcmVmb3ggMTUgPT4gIyEvaG9tZS9xPXtcInRoZWRhdGVcIjpcIjIwMTIxMDEwfjIwMTIxMDEwXCJ9XG5cdCAgICAvLyDlhbbku5bmtY/op4jlmaggPT4gIyEvaG9tZS9xPXslMjJ0aGVkYXRlJTIyOiUyMjIwMTIxMDEwfjIwMTIxMDEwJTIyfVxuXHQgICAgdmFyIGluZGV4ID0gcGF0aC5pbmRleE9mKFwiI1wiKVxuXHQgICAgaWYgKGluZGV4ID09PSAtMSkge1xuXHQgICAgICAgIHJldHVybiAnJ1xuXHQgICAgfVxuXHQgICAgcmV0dXJuIGRlY29kZVVSSShwYXRoLnNsaWNlKGluZGV4KSlcblx0fVxuXG5cblxuXHQvL+WKq+aMgemhtemdouS4iuaJgOacieeCueWHu+S6i+S7tu+8jOWmguaenOS6i+S7tua6kOadpeiHqumTvuaOpeaIluWFtuWGhemDqO+8jFxuXHQvL+W5tuS4lOWug+S4jeS8mui3s+WHuuacrOmhte+8jOW5tuS4lOS7pVwiIy9cIuaIllwiIyEvXCLlvIDlpLTvvIzpgqPkuYjop6blj5F1cGRhdGVMb2NhdGlvbuaWueazlVxuXHRhdmFsb24uYmluZChkb2N1bWVudCwgXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XG5cdCAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9hc3VhbC9qcXVlcnktYWRkcmVzcy9ibG9iL21hc3Rlci9zcmMvanF1ZXJ5LmFkZHJlc3MuanNcblx0ICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iL21hc3Rlci9zcmMvbmcvbG9jYXRpb24uanNcblx0ICAgIC8v5LiL6Z2i5Y2B56eN5oOF5Ya15bCG6Zi75q2i6L+b5YWl6Lev55Sx57O75YiXXG5cdCAgICAvLzEuIOi3r+eUseWZqOayoeacieWQr+WKqFxuXHQgICAgaWYgKCFtbUhpc3Rvcnkuc3RhcnRlZCkge1xuXHQgICAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgLy8yLiDkuI3mmK/lt6bplK7ngrnlh7vmiJbkvb/nlKjnu4TlkIjplK5cblx0ICAgIGlmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5IHx8IGUuc2hpZnRLZXkgfHwgZS53aGljaCA9PT0gMiApIHtcblx0ICAgICAgICByZXR1cm5cblx0ICAgIH1cblx0ICAgIC8vMy4g5q2k5LqL5Lu25bey57uP6KKr6Zi75q2iXG5cdCAgICBpZiAoZS5yZXR1cm5WYWx1ZSA9PT0gZmFsc2UpIHtcblx0ICAgICAgICByZXR1cm5cblx0ICAgIH1cblx0ICAgIC8vNC4g55uu5qCH5YWD57Sg5LiNQeagh+etvizmiJbkuI3lnKhB5qCH562+5LmL5YaFXG5cdCAgICB2YXIgZWwgPSBlLnBhdGggPyBlLnBhdGhbMF0gOiAoZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50IHx8IHt9KVxuXHQgICAgd2hpbGUgKGVsLm5vZGVOYW1lICE9PSBcIkFcIikge1xuXHQgICAgICAgIGVsID0gZWwucGFyZW50Tm9kZVxuXHQgICAgICAgIGlmICghZWwgfHwgZWwudGFnTmFtZSA9PT0gXCJCT0RZXCIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuXG5cdCAgICAgICAgfVxuXHQgICAgfVxuXHQgICAgLy81LiDmsqHmnInlrprkuYlocmVm5bGe5oCn5oiW5ZyoaGFzaOaooeW8j+S4iyzlj6rmnInkuIDkuKojXG5cdCAgICAvL0lFNi8355u05o6l55SoZ2V0QXR0cmlidXRl6L+U5Zue5a6M5pW06Lev5b6EXG5cdCAgICB2YXIgaHJlZiA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicsIDIpIHx8IGVsLmdldEF0dHJpYnV0ZShcInhsaW5rOmhyZWZcIikgfHwgJydcblx0ICAgIGlmIChocmVmLnNsaWNlKDAsIDIpICE9PSAnIyEnKSB7XG5cdCAgICAgICAgcmV0dXJuXG5cdCAgICB9XG5cblx0ICAgIC8vNi4g55uu5qCH6ZO+5o6l5piv55So5LqO5LiL6L296LWE5rqQ5oiW5oyH5ZCR5aSW6YOoXG5cdCAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdkb3dubG9hZCcpICE9IG51bGwgfHwgZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJylcblx0ICAgICAgICByZXR1cm5cblxuXHQgICAgLy83LiDlj6rmmK/pgq7nrrHlnLDlnYBcblx0ICAgIGlmIChocmVmLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSB7XG5cdCAgICAgICAgcmV0dXJuXG5cdCAgICB9XG5cdCAgICAvLzguIOebruagh+mTvuaOpeimgeaWsOW8gOeql+WPo1xuXHQgICAgaWYgKGVsLnRhcmdldCAmJiBlbC50YXJnZXQgIT09ICdfc2VsZicpIHtcblx0ICAgICAgICByZXR1cm5cblx0ICAgIH1cblxuXHQgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cdCAgICAgICAgLy/nu4jkuo7ovr7liLDnm67nmoTlnLBcblx0ICAgIG1tSGlzdG9yeS5vbkhhc2hDaGFuZ2VkKGhyZWYucmVwbGFjZSgnIyEnLCAnJyksIHRydWUpXG5cblx0fSlcblxuXHQvL+W+l+WIsOmhtemdouesrOS4gOS4quespuWQiOadoeS7tueahEHmoIfnrb5cblx0ZnVuY3Rpb24gZ2V0Rmlyc3RBbmNob3IobmFtZSkge1xuXHQgICAgdmFyIGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQScpXG5cdCAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gbGlzdFtpKytdOykge1xuXHQgICAgICAgIGlmIChlbC5uYW1lID09PSBuYW1lKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBlbFxuXHQgICAgICAgIH1cblx0ICAgIH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdldE9mZnNldChlbGVtKSB7XG5cdCAgICB2YXIgcG9zaXRpb24gPSBhdmFsb24oZWxlbSkuY3NzKCdwb3NpdGlvbicpLFxuXHQgICAgICAgIG9mZnNldFxuXHQgICAgaWYgKHBvc2l0aW9uICE9PSAnZml4ZWQnKSB7XG5cdCAgICAgICAgb2Zmc2V0ID0gMFxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgICBvZmZzZXQgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbVxuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gb2Zmc2V0XG5cdH1cblxuXHRmdW5jdGlvbiBhdXRvU2Nyb2xsKGhhc2gpIHtcblx0ICAgIC8v5Y+W5b6X6aG16Z2i5oul5pyJ55u45ZCMSUTnmoTlhYPntKBcblx0ICAgIHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGFzaClcblx0ICAgIGlmICghZWxlbSkge1xuXHQgICAgICAgIC8v5Y+W5b6X6aG16Z2i5oul5pyJ55u45ZCMbmFtZeeahEHlhYPntKBcblx0ICAgICAgICBlbGVtID0gZ2V0Rmlyc3RBbmNob3IoaGFzaClcblx0ICAgIH1cblx0ICAgIGlmIChlbGVtKSB7XG5cdCAgICAgICAgZWxlbS5zY3JvbGxJbnRvVmlldygpXG5cdCAgICAgICAgdmFyIG9mZnNldCA9IGdldE9mZnNldChlbGVtKVxuXHQgICAgICAgIGlmIChvZmZzZXQpIHtcblx0ICAgICAgICAgICAgdmFyIGVsZW1Ub3AgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuXHQgICAgICAgICAgICB3aW5kb3cuc2Nyb2xsQnkoMCwgZWxlbVRvcCAtIG9mZnNldC50b3ApXG5cdCAgICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMClcblx0ICAgIH1cblx0fVxuXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBhdmFsb24uaGlzdG9yeSA9IG1tSGlzdG9yeVxuXG5cbi8qKiovIH0sXG4vKiA3ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHRcblx0ZnVuY3Rpb24gc3VwcG9ydExvY2FsU3RvcmFnZSgpIHtcblx0ICAgIHRyeSB7Ly/nnIvmmK/lkKbmlK/mjIFsb2NhbFN0b3JhZ2Vcblx0ICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImF2YWxvblwiLCAxKVxuXHQgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiYXZhbG9uXCIpXG5cdCAgICAgICAgcmV0dXJuIHRydWVcblx0ICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICByZXR1cm4gZmFsc2Vcblx0ICAgIH1cblx0fVxuXHRmdW5jdGlvbiBlc2NhcGVDb29raWUodmFsdWUpIHtcblx0ICAgIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1ssO1wiXFxcXD1cXHMlXS9nLCBmdW5jdGlvbiAoY2hhcmFjdGVyKSB7XG5cdCAgICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChjaGFyYWN0ZXIpXG5cdCAgICB9KTtcblx0fVxuXHR2YXIgcmV0ID0ge31cblx0aWYgKHN1cHBvcnRMb2NhbFN0b3JhZ2UoKSkge1xuXHQgICAgcmV0LmdldExhc3RQYXRoID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbXNMYXN0UGF0aCcpXG5cdCAgICB9XG5cdCAgICB2YXIgY29va2llSURcblx0ICAgIHJldC5zZXRMYXN0UGF0aCA9IGZ1bmN0aW9uIChwYXRoKSB7XG5cdCAgICAgICAgaWYgKGNvb2tpZUlEKSB7XG5cdCAgICAgICAgICAgIGNsZWFyVGltZW91dChjb29raWVJRClcblx0ICAgICAgICAgICAgY29va2llSUQgPSBudWxsXG5cdCAgICAgICAgfVxuXHQgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXNMYXN0UGF0aFwiLCBwYXRoKVxuXHQgICAgICAgIGNvb2tpZUlEID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7Ly/mqKHmi5/ov4fmnJ/ml7bpl7Rcblx0ICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92SXRlbShcIm1zTGFzdFBhdGhcIilcblx0ICAgICAgICB9LCAxMDAwICogNjAgKiA2MCAqIDI0KVxuXHQgICAgfVxuXHR9IGVsc2Uge1xuXG5cdCAgICByZXQuZ2V0TGFzdFBhdGggPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgcmV0dXJuIGdldENvb2tpZS5nZXRJdGVtKCdtc0xhc3RQYXRoJylcblx0ICAgIH1cblx0ICAgIHJldC5zZXRMYXN0UGF0aCA9IGZ1bmN0aW9uIChwYXRoKSB7XG5cdCAgICAgICAgc2V0Q29va2llKCdtc0xhc3RQYXRoJywgcGF0aClcblx0ICAgIH1cblx0ICAgIGZ1bmN0aW9uIHNldENvb2tpZShrZXksIHZhbHVlKSB7XG5cdCAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpLy/lsIZkYXRl6K6+572u5Li6MeWkqeS7peWQjueahOaXtumXtCBcblx0ICAgICAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAxMDAwICogNjAgKiA2MCAqIDI0KVxuXHQgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGVzY2FwZUNvb2tpZShrZXkpICsgJz0nICsgZXNjYXBlQ29va2llKHZhbHVlKSArICc7ZXhwaXJlcz0nICsgZGF0ZS50b0dNVFN0cmluZygpXG5cdCAgICB9XG5cdCAgICBmdW5jdGlvbiBnZXRDb29raWUobmFtZSkge1xuXHQgICAgICAgIHZhciBtID0gU3RyaW5nKGRvY3VtZW50LmNvb2tpZSkubWF0Y2gobmV3IFJlZ0V4cCgnKD86XnwgKScgKyBuYW1lICsgJyg/Oig/Oj0oW147XSopKXw7fCQpJykpIHx8IFtcIlwiLCBcIlwiXVxuXHQgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQobVsxXSlcblx0ICAgIH1cblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzID0gcmV0XG5cbi8qKiovIH1cbi8qKioqKiovIF0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9tbVJvdXRlci9kaXN0L21tUm91dGVyLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhdmFsb24gPSByZXF1aXJlKFwiYXZhbG9uMlwiKVxucmVxdWlyZShcIm1tUm91dGVyXCIpXG5sZXQgdm0gPSBhdmFsb24uZGVmaW5lKHtcbiAgICAkaWQ6IFwiYXBwXCIsXG4gICAgYWdlOiAxOCxcbiAgICBodG1sOiBcIjxoMT5oZWxsbyB3b3JsZDwvaDE+XCIsXG4gICAgc2hvd0xvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZtLmFnZSArPSAxMDtcbiAgICAgICAgY29uc29sZS5sb2coXCJ0aGlzIGlzIGxvZ1wiKTtcblxuICAgIH1cbn0pO1xuLy8gY29uc29sZS5sb2coYXZhbG9uLCBhdmFsb24ucm91dGVyLCBhdmFsb24ucm91dGVyLmFkZClcbmF2YWxvbi5yb3V0ZXIuYWRkKFwiL2FhYVwiLCBmdW5jdGlvbihhKSB7XG4gICAgdm0uY3VyclBhdGggPSB0aGlzLnBhdGhcbiAgICAgICAgLy8gdGhpc+mHjOmdouiDveaLv+WIsOWmguS4i+S4nOilvzpcbiAgICAgICAgLy8gcGF0aDog6Lev5b6EXG4gICAgICAgIC8vIHF1ZXJ5OiDkuIDkuKrlr7nosaHvvIzlsLHmmK/vvJ/lkI7pnaLnmoTkuJzopb/ovazmjaLmiJDnmoTlr7nosaFcbiAgICAgICAgLy8gcGFyYW1zOiDkuIDkuKrlr7nosaHvvIwg5oiR5Lus5Zyo5a6a5LmJ6Lev55Sx6KeE5YiZ5pe277yM6YKj5Lqb5Lul5YaS5Y+35byA5aeL55qE5Y+C5pWw57uE5oiQ55qE5a+56LGhXG59KTtcbmF2YWxvbi5yb3V0ZXIuYWRkKFwiL3RhYjFcIiwgZnVuY3Rpb24oKSB7XG4gICAgLy8gdm0uaHRtbCA9IHJlcXVpcmUoXCIuL2pzL3RhYjEvdGFiMS5odG1sXCIpO1xuICAgIHZtLmh0bWwgPSByZXF1aXJlKFwiLi9qcy90YWIxL3RhYjFcIik7XG59KTtcbmF2YWxvbi5yb3V0ZXIuYWRkKFwiL3RhYjJcIiwgZnVuY3Rpb24oKSB7XG4gICAgdm0uaHRtbCA9IFwiPGgxPnRhYjI8L2gxPlwiXG59KTtcbmF2YWxvbi5yb3V0ZXIuYWRkKFwiL3RhYjNcIiwgZnVuY3Rpb24oKSB7XG4gICAgdm0uaHRtbCA9IFwiPGgxPnRhYjM8L2gxPlwiXG59KTtcbi8v5ZCv5Yqo6Lev55Sx55uR5ZCsXG5hdmFsb24uaGlzdG9yeS5zdGFydCh7XG4gICAgcm9vdDogXCIvYXZhbG9uVGVzdC9cIlxufSk7XG4vLyBkZWJ1Z2dlcjsvXG5hdmFsb24uc2NhbigpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGc7XHJcblxyXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxyXG5nID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxudHJ5IHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcclxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xyXG59IGNhdGNoKGUpIHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxyXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXHJcblx0XHRnID0gd2luZG93O1xyXG59XHJcblxyXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXHJcbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXHJcbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZztcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=