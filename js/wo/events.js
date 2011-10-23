/*
* 事件触发器
* mixin对象
*/
define(function(require, exports, module) {

var EventEmitter = {
	addListener	: function (type,fn) {
		var _evts = this._events;
		if( !_evts ) _evts = this._events = {};
		
		if(_evts.hasOwnProperty(type) && _evts[type]){
			_evts[type].push(fn);
		}else{
			this._events[type] = [fn];
		}
		return this;
	},
	fireEvent	: function (type,data) {
		var self = this, _evts = self._events;
		if( !_evts ) _evts = self._events = {};

		var evts = _evts[type];
		if( !evts ) return self;
		
		evts.forEach(function (evt) {
			evt.call(self,{type:type},data)
		});
		return self;
	},
	removeListener	: function (type,fn) {
		var _evts = this._events;
		if(!_evts || arguments.length === 0){
			this._events = {}
			return this;
		};
		var listeners = _evts[type];
		if(type && listeners){
			_evts[type] = fn ? listeners.filter(function(f) { return f !== fn }) : [] 
		}
		return this;
	},
	once : function(type,fn) {
		var self = this;
		var one = function() {
			self.off(type,one);
			fn.apply(this,arguments);
		};
		self.on(type,one);
		return self;
	}
};

// shortcut apis & prevent override
EventEmitter.on   = EventEmitter.addListener;
EventEmitter.off  = EventEmitter.removeListener;
EventEmitter.emit = EventEmitter.fireEvent;

exports.EventEmitter = EventEmitter;

});