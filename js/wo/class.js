/*
* Base Class
* ref: ejohn.org/blog/simple-javascript-inheritance/
*/

define(function(require, exports, module) {

    function Class() {};

    var initializing = false, 
        _super = '_super',
        has_super = new RegExp('\\b'+_super+'\\b'), 
        is_func = function(fn) {
            return typeof fn === 'function' 
        },
        wrap = function(fn,name,replacer) {
            return function() {
                var tmp    = this[name], ret;
                this[name] = replacer;
                ret        = fn.apply(this,arguments);
                this[name] = tmp;
                return ret;
            }
        }

    Class.extend = function(protos) {
        initializing = true;
        var super_proto = this.prototype;
        var derived_proto = new this();
        initializing = false;

        function ClassEx() {
            !initializing && is_func(this.init) && this.init.apply(this,arguments);
        }
        ClassEx.super = super_proto;
        ClassEx.extend = arguments.callee;
        ClassEx.prototype = Object.create(derived_proto,{ constructor : { value : ClassEx } });

        ClassEx.methods = function(protos) {
            Object.keys(protos).forEach(function(name,i) {
                var fn = protos[name];
                // 修改原型，重新绑定
                derived_proto[name] = 
                    is_func(fn) && is_func(super_proto[name]) && has_super.test(fn) 
                    ? wrap(fn,_super,super_proto[name])
                    : fn;
            });
        };

        ClassEx.methods(protos);

        return ClassEx;
    };

    module.exports = Class;
});