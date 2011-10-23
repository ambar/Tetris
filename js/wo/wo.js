/*
* helper functions
*/

define(function(require, exports, module) {

// todo : rm this
require('./protos');

var wo = {};

wo.rand = function (max,min) {
    min || (min=0);
    return Math.round(Math.random()*(max-min)) + min;
}

wo.makeArray = function(obj) {
	return Array.prototype.slice.call(obj,0);
}

wo.throttle = function(delay,action,tail,debounce) {
    var now = Date.now, last_call = 0, last_exec = 0, timer = null, curr, diff,
        ctx, args, exec = function() {
            last_exec = now();
            action.apply(ctx,args);
        };

    return function() {
        ctx = this, args = arguments,
        curr = now(), diff = curr - (debounce?last_call:last_exec) - delay;
        
        clearTimeout(timer);

        if(debounce){
            if(tail){
                timer = setTimeout(exec,delay); 
            }else if(diff>=0){
                exec();
            }
        }else{
            if(diff>=0){
                exec();
            }else if(tail){
                timer = setTimeout(exec,-diff);
            }
        }

        last_call = curr;
    }
}

wo.debounce = function(delay,action,end) {
    return wo.throttle(delay,action,end,true);
}

wo.unfold = function(obj,incrementor){
    var r = obj, ret = [], count = 0;
    do{
        ret.push(r);
    }while( (r = incrementor(r,count++)) != null ) ;
    return ret;
}

wo.repeat = function(x,count){
  return wo.unfold(x,function(c,i) { if(i<count-1) return c })
}

wo.$query = function(id) {
	return document.querySelector(id)
}

wo.inherits = function(subclass,superclass) {
    subclass.prototype = Object.create(superclass.prototype,{
        constructor : { value : subclass }
    });
    subclass.super = superclass.prototype;
}

Object.extend = function (dest,src) {
    for(var p in src){
        dest[p] = src[p]
    }
    return dest;
}

module.exports = wo;

});