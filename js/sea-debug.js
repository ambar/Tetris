/* SeaJS v1.0.2 | seajs.com | MIT Licensed */

/**
 * @fileoverview A CommonJS module loader, focused on web.
 * @author lifesinger@gmail.com (Frank Wang)
 */


/**
 * Base namespace for the framework.
 */
this.seajs = { _seajs: this.seajs };


/**
 * @type {string} The version of the framework. It will be replaced
 * with "major.minor.patch" when building.
 */
seajs.version = '1.0.2';


// Module status:
//  1. downloaded - The script file has been downloaded to the browser.
//  2. define()d - The define() has been executed.
//  3. memoize()d - The module info has been added to memoizedMods.
//  4. require()d -  The module.exports is available.


/**
 * The private data. Internal use only.
 */
seajs._data = {

  /**
   * The configuration data.
   */
  config: {
    /**
     * Debug mode. It will be turned off automatically when compressing.
     * @const
     */
    debug: '%DEBUG%',

    /**
     * Modules that are needed to load before all other modules.
     */
    preload: []
  },

  /**
   * Modules that have been memoize()d.
   * { uri: { dependencies: [], factory: fn, exports: {} }, ... }
   */
  memoizedMods: {},

  /**
   * Store the module information for "real" work in the onload event.
   */
  pendingMods: []
};


/**
 * The private utils. Internal use only.
 */
seajs._util = {};


/**
 * The inner namespace for methods. Internal use only.
 */
seajs._fn = {};

/**
 * @fileoverview The minimal language enhancement.
 */

(function(util) {

  var toString = Object.prototype.toString;
  var AP = Array.prototype;


  util.isString = function(val) {
    return toString.call(val) === '[object String]';
  };


  util.isObject = function(val) {
    return val === Object(val);
  };


  util.isFunction = function(val) {
    return toString.call(val) === '[object Function]';
  };


  util.isArray = Array.isArray || function(val) {
    return toString.call(val) === '[object Array]';
  };


  util.indexOf = AP.indexOf ?
      function(arr, item) {
        return arr.indexOf(item);
      } :
      function(arr, item) {
        for (var i = 0, len = arr.length; i < len; i++) {
          if (arr[i] === item) {
            return i;
          }
        }
        return -1;
      };


  var forEach = util.forEach = AP.forEach ?
      function(arr, fn) {
        arr.forEach(fn);
      } :
      function(arr, fn) {
        for (var i = 0, len = arr.length; i < len; i++) {
          fn(arr[i], i, arr);
        }
      };


  util.map = AP.map ?
      function(arr, fn) {
        return arr.map(fn);
      } :
      function(arr, fn) {
        var ret = [];
        forEach(arr, function(item, i, arr) {
          ret.push(fn(item, i, arr));
        });
        return ret;
      };


  util.filter = AP.filter ?
      function(arr, fn) {
        return arr.filter(fn);
      } :
      function(arr, fn) {
        var ret = [];
        forEach(arr, function(item, i, arr) {
          if (fn(item, i, arr)) {
            ret.push(item);
          }
        });
        return ret;
      };


  util.now = Date.now || function() {
    return new Date().getTime();
  };

})(seajs._util);

/**
 * @fileoverview The error handler.
 */

(function(util, data) {

  var config = data.config;


  /**
   * The function to handle inner errors.
   *
   * @param {Object} o The error object.
   */
  util.error = function(o) {

    // Throw errors.
    if (o.type === 'error') {
      throw 'Error occurs! ' + dump(o);
    }
    // Output debug info.
    else if (config.debug && typeof console !== 'undefined') {
      console[o.type](dump(o));
    }
  };

  function dump(o) {
    var out = ['{'];

    for (var p in o) {
      if (typeof o[p] === 'number' || typeof o[p] === 'string') {
        out.push(p + ': ' + o[p]);
        out.push(', ');
      }
    }
    out.pop();
    out.push('}');

    return out.join('');
  }

})(seajs._util, seajs._data);

/**
 * @fileoverview The utils for the framework.
 */

(function(util, data, global) {

  var config = data.config;


  /**
   * Extracts the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b/'
   * dirname('d.js') ==> './'
   * @see http://jsperf.com/regex-vs-split/2
   */
  function dirname(path) {
    var s = path.match(/.*(?=\/.*$)/);
    return (s ? s[0] : '.') + '/';
  }


  /**
   * Canonicalizes a path.
   * realpath('./a//b/../c') ==> 'a/c'
   */
  function realpath(path) {
    // 'file:///a//b/c' ==> 'file:///a/b/c'
    // 'http://a//b/c' ==> 'http://a/b/c'
    path = path.replace(/([^:\/])\/+/g, '$1\/');

    // 'a/b/c', just return.
    if (path.indexOf('.') === -1) {
      return path;
    }

    var old = path.split('/');
    var ret = [], part, i = 0, len = old.length;

    for (; i < len; i++) {
      part = old[i];
      if (part === '..') {
        if (ret.length === 0) {
          util.error({
            message: 'invalid path: ' + path,
            type: 'error'
          });
        }
        ret.pop();
      }
      else if (part !== '.') {
        ret.push(part);
      }
    }

    return ret.join('/');
  }


  /**
   * Normalizes an url.
   */
  function normalize(url) {
    url = realpath(url);

    // Adds the default '.js' extension except that the url ends with #.
    if (/#$/.test(url)) {
      url = url.slice(0, -1);
    }
    else if (url.indexOf('?') === -1 && !/\.(?:css|js)$/.test(url)) {
      url += '.js';
    }

    return url;
  }


  /**
   * Parses alias in the module id. Only parse the prefix and suffix.
   */
  function parseAlias(id) {
    var alias = config['alias'];
    if (!alias) return id;

    var parts = id.split('/');
    var last = parts.length - 1;
    var parsed = false;

    parse(parts, 0);
    if (!parsed && last) {
      parse(parts, last);
    }

    function parse(parts, i) {
      var part = parts[i];
      if (alias && alias.hasOwnProperty(part)) {
        parts[i] = alias[part];
        parsed = true;
      }
    }

    return parts.join('/');
  }


  /**
   * Maps the module id.
   * @param {string} url The url string.
   * @param {Array=} opt_map The optional map array.
   */
  function parseMap(url, opt_map) {
    // config.map: [[match, replace], ...]
    opt_map = opt_map || config['map'] || [];
    if (!opt_map.length) return url;

    // [match, replace, -1]
    var last = [];

    util.forEach(opt_map, function(rule) {
      if (rule && rule.length > 1) {
        if (rule[2] === -1) {
          last.push([rule[0], rule[1]]);
        }
        else {
          url = url.replace(rule[0], rule[1]);
        }
      }
    });

    if (last.length) {
      url = parseMap(url, last);
    }

    return url;
  }


  /**
   * Gets the host portion from url.
   */
  function getHost(url) {
    return url.replace(/^(\w+:\/\/[^/]*)\/?.*$/, '$1');
  }


  /**
   * Normalizes pathname to start with '/'
   * Ref: https://groups.google.com/forum/#!topic/seajs/9R29Inqk1UU
   */
  function normalizePathname(pathname) {
    if (pathname.charAt(0) !== '/') {
      pathname = '/' + pathname;
    }
    return pathname;
  }


  var loc = global['location'];
  var pageUrl = loc.protocol + '//' + loc.host +
      normalizePathname(loc.pathname);

  // local file in IE: C:\path\to\xx.js
  if (pageUrl.indexOf('\\') !== -1) {
    pageUrl = pageUrl.replace(/\\/g, '/');
  }

  /**
   * Converts id to uri.
   * @param {string} id The module id.
   * @param {string=} opt_refUrl The referenced uri for relative id.
   * @param {boolean=} opt_aliasParsed When set to true, alias has been parsed.
   */
  function id2Uri(id, opt_refUrl, opt_aliasParsed) {
    if (!opt_aliasParsed) {
      id = parseAlias(id);
    }

    opt_refUrl = opt_refUrl || pageUrl;
    var ret;

    // absolute id
    if (isAbsolutePath(id)) {
      ret = id;
    }
    // relative id
    else if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
      // Converts './a' to 'a', to avoid unnecessary loop in realpath.
      id = id.replace(/^\.\//, '');
      ret = dirname(opt_refUrl) + id;
    }
    // root id
    else if (id.charAt(0) === '/') {
      ret = getHost(opt_refUrl) + id;
    }
    // top-level id
    else {
      ret = getConfigBase() + '/' + id;
    }

    ret = normalize(ret);
    ret = parseMap(ret);

    return ret;
  }


  function getConfigBase() {
    if (!config.base) {
      util.error({
        message: 'the config.base is empty',
        from: 'id2Uri',
        type: 'error'
      });
    }
    return config.base;
  }


  /**
   * Converts ids to uris.
   * @param {Array.<string>} ids The module ids.
   * @param {string=} opt_refUri The referenced uri for relative id.
   */
  function ids2Uris(ids, opt_refUri) {
    return util.map(ids, function(id) {
      return id2Uri(id, opt_refUri);
    });
  }


  var memoizedMods = data.memoizedMods;

  /**
   * Caches mod info to memoizedMods.
   */
  function memoize(id, url, mod) {
    var uri;

    // define('id', [], fn)
    if (id) {
      uri = id2Uri(id, url, true);
    }
    else {
      uri = url;
    }

    mod.id = uri; // change id to absolute path.
    mod.dependencies = ids2Uris(mod.dependencies, uri);
    memoizedMods[uri] = mod;

    // guest module in package
    if (id && url !== uri) {
      var host = memoizedMods[url];
      if (host) {
        augmentPackageHostDeps(host.dependencies, mod.dependencies);
      }
    }
  }

  /**
   * Set mod.ready to true when all the requires of the module is loaded.
   */
  function setReadyState(uris) {
    util.forEach(uris, function(uri) {
      if (memoizedMods[uri]) {
        memoizedMods[uri].ready = true;
      }
    });
  }

  /**
   * Removes the "ready = true" uris from input.
   */
  function getUnReadyUris(uris) {
    return util.filter(uris, function(uri) {
      var mod = memoizedMods[uri];
      return !mod || !mod.ready;
    });
  }

  /**
   * if a -> [b -> [c -> [a, e], d]]
   * call removeMemoizedCyclicUris(c, [a, e])
   * return [e]
   */
  function removeCyclicWaitingUris(uri, deps) {
    return util.filter(deps, function(dep) {
      return !isCyclicWaiting(memoizedMods[dep], uri);
    });
  }

  function isCyclicWaiting(mod, uri) {
    if (!mod || mod.ready) {
      return false;
    }

    var deps = mod.dependencies || [];
    if (deps.length) {
      if (util.indexOf(deps, uri) !== -1) {
        return true;
      } else {
        for (var i = 0; i < deps.length; i++) {
          if (isCyclicWaiting(memoizedMods[deps[i]], uri)) {
            return true;
          }
        }
        return false;
      }
    }
    return false;
  }


  /**
   * For example:
   *  sbuild host.js --combo
   *   define('./host', ['./guest'], ...)
   *   define('./guest', ['jquery'], ...)
   * The jquery is not combined to host.js, so we should add jquery
   * to host.dependencies
   */
  function augmentPackageHostDeps(hostDeps, guestDeps) {
    util.forEach(guestDeps, function(guestDep) {
      if (util.indexOf(hostDeps, guestDep) === -1) {
        hostDeps.push(guestDep);
      }
    });
  }


  /**
   * Determines whether the id is absolute.
   */
  function isAbsolutePath(id) {
    return id.indexOf('://') !== -1 || id.indexOf('//') === 0;
  }


  util.dirname = dirname;

  util.parseAlias = parseAlias;
  util.id2Uri = id2Uri;
  util.ids2Uris = ids2Uris;

  util.memoize = memoize;
  util.setReadyState = setReadyState;
  util.getUnReadyUris = getUnReadyUris;
  util.removeCyclicWaitingUris = removeCyclicWaitingUris;
  util.isAbsolutePath = isAbsolutePath;

  if (config.debug) {
    util.realpath = realpath;
    util.normalize = normalize;
    util.getHost = getHost;
  }

})(seajs._util, seajs._data, this);

/**
 * @fileoverview DOM utils for fetching script etc.
 */

(function(util, data) {

  var head = document.getElementsByTagName('head')[0];
  var isWebKit = navigator.userAgent.indexOf('AppleWebKit') !== -1;


  util.getAsset = function(url, callback, charset) {
    var isCSS = /\.css(?:\?|$)/i.test(url);
    var node = document.createElement(isCSS ? 'link' : 'script');
    if (charset) node.setAttribute('charset', charset);

    assetOnload(node, function() {
      if (callback) callback.call(node);
      if (isCSS) return;

      // Don't remove inserted node when debug is on.
      if (!data.config.debug) {
        try {
          // Reduces memory leak.
          if (node.clearAttributes) {
            node.clearAttributes();
          } else {
            for (var p in node) delete node[p];
          }
        } catch (x) {
        }
        head.removeChild(node);
      }
    });

    if (isCSS) {
      node.rel = 'stylesheet';
      node.href = url;
      head.appendChild(node); // keep order
    }
    else {
      node.src = url;
      head.insertBefore(node, head.firstChild);
    }

    return node;
  };

  function assetOnload(node, callback) {
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, cb);
    } else {
      styleOnload(node, cb);
    }

    var timer = setTimeout(function() {
      cb();
      util.error({
        message: 'time is out',
        from: 'getAsset',
        type: 'warn'
      });
    }, data.config.timeout);

    function cb() {
      cb.isCalled = true;
      callback();
      clearTimeout(timer);
    }
  }

  function scriptOnload(node, callback) {
    if (node.addEventListener) {
      node.addEventListener('load', callback, false);
      node.addEventListener('error', callback, false);
      // NOTICE: Nothing will happen in Opera when the file status is 404. In
      // this case, the callback will be called when time is out.
    }
    else { // for IE6-8
      node.attachEvent('onreadystatechange', function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          callback();
        }
      });
    }
  }

  function styleOnload(node, callback) {
    // for IE6-9 and Opera
    if (node.attachEvent) {
      node.attachEvent('onload', callback);
      // NOTICE:
      // 1. "onload" will be fired in IE6-9 when the file is 404, but in
      // this situation, Opera does nothing, so fallback to timeout.
      // 2. "onerror" doesn't fire in any browsers!
    }
    // polling for Firefox, Chrome, Safari
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 0); // for cache
    }
  }

  function poll(node, callback) {
    if (callback.isCalled) {
      return;
    }

    var isLoaded = false;

    if (isWebKit) {
      if (node['sheet']) {
        isLoaded = true;
      }
    }
    // for Firefox
    else if (node['sheet']) {
      try {
        if (node['sheet'].cssRules) {
          isLoaded = true;
        }
      } catch (ex) {
        // NS_ERROR_DOM_SECURITY_ERR
        if (ex.code === 1000) {
          isLoaded = true;
        }
      }
    }

    if (isLoaded) {
      // give time to render.
      setTimeout(function() {
        callback();
      }, 1);
    }
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 1);
    }
  }

  util.assetOnload = assetOnload;


  var interactiveScript = null;

  util.getInteractiveScript = function() {
    if (interactiveScript && interactiveScript.readyState === 'interactive') {
      return interactiveScript;
    }

    var scripts = head.getElementsByTagName('script');

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      if (script.readyState === 'interactive') {
        interactiveScript = script;
        return script;
      }
    }

    return null;
  };


  util.getScriptAbsoluteSrc = function(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4);
  };

})(seajs._util, seajs._data);

/**
 * references:
 *  - http://lifesinger.github.com/lab/2011/load-js-css/
 *  - ./test/issues/load-css/test.html
 */

/**
 * @fileoverview Loads a module and gets it ready to be require()d.
 */

(function(util, data, fn, global) {

  /**
   * Modules that are being downloaded.
   * { uri: scriptNode, ... }
   */
  var fetchingMods = {};

  var memoizedMods = data.memoizedMods;

  var config = data.config;


  /**
   * Loads preload modules before callback.
   * @param {function()} callback The callback function.
   */
  fn.preload = function(callback) {
    var preloadMods = config.preload;
    var len = preloadMods.length;

    if (len) {
      config.preload = preloadMods.slice(len);
      fn.load(preloadMods, function() {
        fn.preload(callback);
      });
    }
    else {
      callback();
    }
  };


  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} opt_callback The callback function.
   * @param {string=} opt_refUrl The referenced uri for relative id.
   */
  fn.load = function(ids, opt_callback, opt_refUrl) {
    if (util.isString(ids)) {
      ids = [ids];
    }
    var uris = util.ids2Uris(ids, opt_refUrl);

    provide(uris, function() {
      fn.preload(function() {
        var require = fn.createRequire({
          uri: opt_refUrl
        });

        var args = util.map(uris, function(uri) {
          return require(data.memoizedMods[uri]);
        });

        if (opt_callback) {
          opt_callback.apply(global, args);
        }
      });
    });
  };


  /**
   * Provides modules to the environment.
   * @param {Array.<string>} uris An array composed of module uri.
   * @param {function()=} opt_callback The callback function.
   */
  function provide(uris, opt_callback) {
    var unReadyUris = util.getUnReadyUris(uris);

    if (unReadyUris.length === 0) {
      return onProvide();
    }

    for (var i = 0, n = unReadyUris.length, remain = n; i < n; i++) {
      (function(uri) {

        if (memoizedMods[uri]) {
          onLoad();
        } else {
          fetch(uri, onLoad);
        }

        function onLoad() {
          var deps = (memoizedMods[uri] || 0).dependencies || [];
          var m = deps.length;

          if (m) {
            // if a -> [b -> [c -> [a, e], d]]
            // when use(['a', 'b'])
            // should remove a from c.deps
            deps = util.removeCyclicWaitingUris(uri, deps);
            m = deps.length;
          }

          if (m) {
            remain += m;
            provide(deps, function() {
              remain -= m;
              if (remain === 0) onProvide();
            });
          }
          if (--remain === 0) onProvide();
        }

      })(unReadyUris[i]);
    }

    function onProvide() {
      util.setReadyState(unReadyUris);
      opt_callback();
    }
  }


  /**
   * Fetches a module file.
   * @param {string} uri The module uri.
   * @param {function()} callback The callback function.
   */
  function fetch(uri, callback) {

    if (fetchingMods[uri]) {
      util.assetOnload(fetchingMods[uri], cb);
    }
    else {
      // See fn-define.js: "uri = data.pendingModIE"
      data.pendingModIE = uri;

      fetchingMods[uri] = util.getAsset(
          uri,
          cb,
          data.config.charset
          );

      data.pendingModIE = null;
    }

    function cb() {

      if (data.pendingMods) {
        util.forEach(data.pendingMods, function(pendingMod) {
          util.memoize(pendingMod.id, uri, pendingMod);
        });

        data.pendingMods = [];
      }

      if (fetchingMods[uri]) {
        delete fetchingMods[uri];
      }

      if (callback) {
        callback();
      }
    }
  }

})(seajs._util, seajs._data, seajs._fn, this);

/**
 * @fileoverview Module Constructor.
 */

(function(fn) {

  /**
   * Module constructor.
   * @constructor
   * @param {string=} opt_id The module id.
   * @param {Array.<string>|string=} opt_deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  fn.Module = function(opt_id, opt_deps, factory) {

    this.id = opt_id;
    this.dependencies = opt_deps || [];
    this.factory = factory;

  };

})(seajs._fn);

/**
 * @fileoverview Module authoring format.
 */

(function(util, data, fn, global) {

  /**
   * Defines a module.
   * @param {string=} opt_id The module id.
   * @param {Array.<string>|string=} opt_deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  fn.define = function(opt_id, opt_deps, factory) {
    var argsLen = arguments.length;

    // define(factory)
    if (argsLen === 1) {
      factory = opt_id;
      opt_id = undefined;
    }
    // define(id || deps, factory)
    else if (argsLen === 2) {
      factory = opt_deps;
      opt_deps = undefined;

      // define(deps, factory)
      if (util.isArray(opt_id)) {
        opt_deps = opt_id;
        opt_id = undefined;
      }
    }

    // parse deps
    if (!util.isArray(opt_deps) && util.isFunction(factory)) {
      opt_deps = parseDependencies(factory.toString());
    }

    // parse alias in id
    if (opt_id) {
      opt_id = util.parseAlias(opt_id);
    }

    var mod = new fn.Module(opt_id, opt_deps, factory);
    var url;

    // id is absolute.
    if (opt_id && util.isAbsolutePath(opt_id)) {
      url = opt_id;
    }
    else if (document.attachEvent && !global['opera']) {
      // For IE6-9 browsers, the script onload event may not fire right
      // after the the script is evaluated. Kris Zyp found that it
      // could query the script nodes and the one that is in "interactive"
      // mode indicates the current script. Ref: http://goo.gl/JHfFW
      var script = util.getInteractiveScript();
      if (script) {
        url = util.getScriptAbsoluteSrc(script);
      }

      // In IE6-9, if the script is in the cache, the "interactive" mode
      // sometimes does not work. The script code actually executes *during*
      // the DOM insertion of the script tag, so we can keep track of which
      // script is being requested in case define() is called during the DOM
      // insertion.
      else {
        url = data.pendingModIE;
      }

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the module uri.
    }

    if (url) {
      util.memoize(opt_id, url, mod);
    }
    else {
      // Saves information for "real" work in the onload event.
      data.pendingMods.push(mod);
    }

  };


  function parseDependencies(code) {
    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
    var pattern = /[^.]\brequire\s*\(\s*['"]?([^'")]*)/g;
    var ret = [], match;

    code = removeComments(code);
    while ((match = pattern.exec(code))) {
      if (match[1]) {
        ret.push(match[1]);
      }
    }

    return ret;
  }


  // http://lifesinger.github.com/lab/2011/remove-comments-safely/
  function removeComments(code) {
    return code
        .replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n')
        .replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n');
  }

})(seajs._util, seajs._data, seajs._fn, this);

/**
 * @fileoverview The factory for "require".
 */

(function(util, data, fn) {

  /**
   * The factory of "require" function.
   * @param {Object} sandbox The data related to "require" instance.
   */
  function createRequire(sandbox) {
    // sandbox: {
    //   uri: '',
    //   deps: [],
    //   parent: sandbox
    // }

    function require(id) {
      var uri, mod;

      // require(mod) ** inner use ONLY.
      if (util.isObject(id)) {
        mod = id;
        uri = mod.id;
      }
      // NOTICE: id maybe undefined in 404 etc cases.
      else if (util.isString(id)) {
        uri = util.id2Uri(id, sandbox.uri);
        mod = data.memoizedMods[uri];
      }

      // Just return null when:
      //  1. the module file is 404.
      //  2. the module file is not written with valid module format.
      //  3. other error cases.
      if (!mod) {
        return null;
      }

      // Checks cyclic dependencies.
      if (isCyclic(sandbox, uri)) {
        util.error({
          message: 'found cyclic dependencies',
          from: 'require',
          uri: uri,
          type: 'warn'
        });

        return mod.exports;
      }

      // Initializes module exports.
      if (!mod.exports) {
        initExports(mod, {
          uri: uri,
          parent: sandbox
        });
      }

      return mod.exports;
    }

    require.async = function(ids, callback) {
      fn.load(ids, callback, sandbox.uri);
    };

    return require;
  }

  function initExports(mod, sandbox) {
    var ret;
    var factory = mod.factory;

    mod.exports = {};
    delete mod.factory;
    delete mod.ready;

    if (util.isFunction(factory)) {
      checkPotentialErrors(factory, mod.id);
      ret = factory(createRequire(sandbox), mod.exports, mod);
      if (ret !== undefined) {
        mod.exports = ret;
      }
    }
    else if (factory !== undefined) {
      mod.exports = factory;
    }
  }

  function isCyclic(sandbox, uri) {
    if (sandbox.uri === uri) {
      return true;
    }
    if (sandbox.parent) {
      return isCyclic(sandbox.parent, uri);
    }
    return false;
  }

  function checkPotentialErrors(factory, uri) {
    if (factory.toString().search(/\sexports\s*=\s*[^=]/) !== -1) {
      util.error({
        message: 'found invalid setter: exports = {...}',
        from: 'require',
        uri: uri,
        type: 'error'
      });
    }
  }

  fn.createRequire = createRequire;

})(seajs._util, seajs._data, seajs._fn);

/**
 * @fileoverview The configuration.
 */

(function(util, data, fn, global) {

  var config = data.config;
  var noCacheTimeStamp = 'seajs-ts=' + util.now();


  // Async inserted script.
  var loaderScript = document.getElementById('seajsnode');

  // Static script.
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script');
    loaderScript = scripts[scripts.length - 1];
  }

  var loaderSrc = util.getScriptAbsoluteSrc(loaderScript), loaderDir;
  if (loaderSrc) {
    var base = loaderDir = util.dirname(loaderSrc);
    // When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
    // to "http://test.com/libs/"
    var match = base.match(/^(.+\/)seajs\/[\d\.]+\/$/);
    if (match) {
      base = match[1];
    }
    config.base = base;
  }
  // When script is inline code, src is empty.


  config.main = loaderScript.getAttribute('data-main') || '';


  // The max time to load a script file.
  config.timeout = 20000;


  // seajs-debug
  if (loaderDir &&
      (global.location.search.indexOf('seajs-debug') !== -1 ||
          document.cookie.indexOf('seajs=1') !== -1)) {
    config.debug = true;
    config.preload.push(loaderDir + 'plugin-map');
  }


  /**
   * The function to configure the framework.
   * config({
   *   'base': 'path/to/base',
   *   'alias': {
   *     'app': 'biz/xx',
   *     'jquery': 'jquery-1.5.2',
   *     'cart': 'cart?t=20110419'
   *   },
   *   'map': [
   *     ['test.cdn.cn', 'localhost']
   *   ],
   *   preload: [],
   *   charset: 'utf-8',
   *   timeout: 20000, // 20s
   *   debug: false,
   *   main: './init'
   * });
   *
   * @param {Object} o The config object.
   */
  fn.config = function(o) {
    for (var k in o) {
      var previous = config[k];
      var current = o[k];

      if (previous && k === 'alias') {
        for (var p in current) {
          if (current.hasOwnProperty(p)) {
            checkConflict(previous[p], current[p]);
            previous[p] = current[p];
          }
        }
      }
      else if (previous && (k === 'map' || k === 'preload')) {
        // for config({ preload: 'some-module' })
        if (!util.isArray(current)) {
          current = [current];
        }
        util.forEach(current, function(item) {
          if (item) { // Ignore empty string.
            previous.push(item);
          }
        });
        // NOTICE: no need to check conflict for map and preload.
      }
      else {
        config[k] = current;
      }
    }

    // Make sure config.base is absolute path.
    var base = config.base;
    if (!util.isAbsolutePath(base)) {
      config.base = util.id2Uri(base + '#');
    }

    // use map to implement nocache
    if (config.debug === 2) {
      config.debug = 1;
      fn.config({
        map: [
          [/.*/, function(url) {
            return url +
                (url.indexOf('?') === -1 ? '?' : '&') +
                noCacheTimeStamp;
          }, -1]
        ]
      });
    }

    return this;
  };


  function checkConflict(previous, current) {
    if (previous !== undefined && previous !== current) {
      util.error({
        'message': 'config is conflicted',
        'previous': previous,
        'current': current,
        'from': 'config',
        'type': 'error'
      });
    }
  }

})(seajs._util, seajs._data, seajs._fn, this);

/**
 * @fileoverview The bootstrap and entrances.
 */

(function(host, data, fn) {

  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} opt_callback The callback function.
   */
  fn.use = function(ids, opt_callback) {
    fn.preload(function() {
      fn.load(ids, opt_callback);
    });
  };


  // main
  var mainModuleId = data.config.main;
  if (mainModuleId) {
    fn.use([mainModuleId]);
  }


  // Parses the pre-call of seajs.config/seajs.use/define.
  // Ref: test/bootstrap/async-3.html
  (function(args) {
    if (args) {
      var hash = {
        0: 'config',
        1: 'use',
        2: 'define'
      };
      for (var i = 0; i < args.length; i += 2) {
        fn[hash[args[i]]].apply(host, args[i + 1]);
      }
      delete host._seajs;
    }
  })((host._seajs || 0)['args']);

})(seajs, seajs._data, seajs._fn);

/**
 * @fileoverview The public api of seajs.
 */

(function(host, data, fn, global) {

  // Avoids conflicting when sea.js is loaded multi times.
  if (host._seajs) {
    global.seajs = host._seajs;
    return;
  }

  // SeaJS Loader API:
  host.config = fn.config;
  host.use = fn.use;

  // Module Authoring API:
  var previousDefine = global.define;
  global.define = fn.define;


  // For custom loader name.
  host.noConflict = function(all) {
    global.seajs = host._seajs;
    if (all) {
      global.define = previousDefine;
      host.define = fn.define;
    }
    return host;
  };


  // Keeps clean!
  if (!data.config.debug) {
    delete host._util;
    delete host._data;
    delete host._fn;
    delete host._seajs;
  }

})(seajs, seajs._data, seajs._fn, this);
