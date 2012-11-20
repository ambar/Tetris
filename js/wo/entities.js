define(function(require, exports, module) {
	
var Class = require('./class'), EventEmitter = require('./events').EventEmitter;

var Entity = Class.extend({
	init : function(x,y,width,height) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.vx = this.vy = 0;
		this.alive = true;
	},
	update : function(delta) {	
		this.x += this.vx;
		this.y += this.vy;
		this.emit('update',delta);
	},
	draw : function(ctx) {
		
	}
});
Object.extend(Entity.prototype,EventEmitter);

var Ball = Entity.extend({
	init : function(x,y,rad,color) {
		this._super(x,y);
		this.rad = rad || 20;
		this.color = color || 'lime';
	},
	draw : function(ctx) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.rad,0,Math.PI*2,1);
		ctx.fill();
	}
});

var GameText = Entity.extend({
	
	text        : '',
	textAlign   : 'center',
	textBaseline: 'middle',
	
	color       : 'white',
	drawTypes   : ['fill'],

	fontDefaults: ['normal','normal',12,'Tahoma'],
	fontKeys    : ['fontWeight','fontStyle','fontSize','fontFamily'],

	init : function(x,y,text,size,color) {

		text && (this.text = text);
		color && (this.color = color);

		var self = this;
		var update_font = function() {
			self.font = font_values.map(function(val,i) {
				return self.fontKeys[i] === 'fontSize' ? val+'px' : val
			}).join(' ')
		};

		var font_values = this.fontDefaults.slice();

		this.fontKeys.forEach(function(key,i) {
			Object.defineProperty(this,key,{
				enumerable : true, configurable : false,
				get : function() { return font_values[i] },
				set : function(value) {
					if( key === 'fontSize' ){
						value = parseInt(value, 10);
						if( isNaN(value) || value < 0 ) return;
					}
					if( font_values[i] !== value ){
						font_values[i] = value;
						update_font();
					}
				}
			})
		},this);

		this.fontSize = size;

		this._super(x,y,size,size);
	},
	draw : function(ctx) {
		ctx.font         = this.font;
		ctx.textAlign    = this.textAlign;
		ctx.textBaseline = this.textBaseline;
		
		this.drawTypes.forEach(function(type) {
			ctx[type+'Style'] = this.color;
			ctx[type+'Text'](this.text,this.x,this.y);
		},this)
	}
});

exports.Entity = Entity;
exports.Ball = Ball;
exports.GameText = GameText;

});