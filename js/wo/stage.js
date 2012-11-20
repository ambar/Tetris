/*
* stage 舞台对象
* 管理所有可视对象。添加、移除，更新、重绘、暂停、开始
*/

define(function(require, exports, module) {

var input = require('./input');
var requestAnimationFrame = require('./requestAnimationFrame');
var EventEmitter = require('./events').EventEmitter;

var now = Date.now;
var time = {
	lastUpdate : 0,
	delta : 0,
	start : 0
}

var new_ticker = function(fps,on_tick,canvas) {
	if(typeof on_tick !== 'function'){
		throw new TypeError("The argument 'on_tick' must be a function")
	}
	fps || (fps = 60);
	var ticker = {
		fps : fps,
		on_tick : on_tick,
		running : false,
		start : function() {
			this.running = true;
			if( this.fps === 60 ){
				requestAnimationFrame(this.tick,canvas);
			}else{
				setTimeout(this.tick,1000/this.fps);
			}
		},
		tick : function() {
			if(ticker.running){
				ticker.on_tick();
				ticker.start();
			}
		},
		stop : function() {
			this.running = false;
		}
	};
	return ticker;
}

// private
var _fps;

var stage = {
	ctx : null
	,width:0
	,height:0
	,detached : []
	,entities : []
	,fpsNow : 0
	,frameCount : 0
	,ticker : null
	,init	: function (canvas,width,height,scale) {
		var self = this;
		this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;

		if (!canvas) {
			if (!canvas.getContext) {
				throw new Error('CanvasRenderingContext2D is not supported.')	
			}
			throw new Error('No such canvas element.')
		}

		this.resize(width||320,height||240,scale);
		this.ctx = canvas.getContext('2d');

		this.ticker = new_ticker(_fps,this.tick.bind(this),this.canvas);
		this.run();

		time.start = now();
		
		this.init =  function() {};
	}
	// 适应缩放
	,resize : function(width,height,scale) {
		scale || (scale = 1);
		var w = width || this.width;
		var h = height || this.height;
		
		this.canvas.width        = w;
		this.canvas.height       = h;
		this.canvas.style.width  = w * scale + 'px';
		this.canvas.style.height = h * scale + 'px';

		this.width = w;
		this.height = h;
		this.emit('resize');
	}
	,add	: function (entity) {
		entity.alive = true;
		this.entities.push(entity);
		this.emit('add');
		return this;
	}
	,clear	: function () {
		this.ctx.clearRect(0,0,this.width,this.height);
		return this;
	}
	,remove	: function(entity) {
		entity.alive = false;
		this.entities.remove(entity);
		this.emit('remove',entity);
		return this;
	}
	,removeAll	: function() {
		this.entities = [];
		this.clear();
		return this;
	}
	,drawAll	: function () {
		var self = this, ctx = self.ctx;
		
		this.clear();
		this.entities.forEach(function (entity) {
			entity.alive && entity.draw(ctx);
		});

		return this;
	}
	,updateAll	: function () {

		var curr = now();
		var elapsed = curr - time.lastUpdate;
		var deltaTime = time.delta = elapsed / 1000;

		time.lastUpdate = curr;

		this.frameCount += 1;
		this.fpsNow = Math.round(1000/elapsed);

		var entities = this.entities, i = entities.length, entity;
		
		// entities.forEach(function(entity) {
		// 	entity.alive && entity.update(deltaTime);
		// })
		
		while(i-->0){
			entity = entities[i];
			entity.alive && entity.update(deltaTime);
		}

		this.emit('update',deltaTime);
		input.lock();

		return this;
	}
	,run	: function () {
		
		if(!this.ticker.running){
			this.ticker.start();
			this.emit('run');
			// 防止暂停后 deltaTime 变得极大
			time.lastUpdate = now();
		}

		return this;
	}
	,tick : function() {
		this.updateAll();
		this.drawAll();
	}
	,pause	: function () {

		if (this.ticker.running) {
			this.ticker.stop();
			this.emit('pause');
			this.drawAll();
		}

		return this;
	}
	,reset	: function() {
		this.removeAll();
		this.off();
		return this;
	}
}

Object.extend(stage,EventEmitter);

Object.defineProperties(stage,{
	running : {
		get: function() {
			return this.ticker.running;
		},
		set: function(value) {
			Boolean(value) ? this.run() : this.pause();
		}
	},
	fps : {
		get : function() { return _fps },
		set : function(value) {
			_fps = value;
			this.ticker && (this.ticker.fps = value );
		}
	}
});

stage.time = time;

module.exports = stage;

});