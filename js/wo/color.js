/*
* Color Class
* 辅助类: RGB颜色操作
*/
define(function(require, exports, module) {

var wo = require('./wo');

function Color(ary) {
	
	if( !Array.isArray(ary) ) ary = wo.makeArray(arguments);
	
	if( ary.length < 3 || ary.some(isNaN) ) throw TypeError('Invalid color arguments')
	
	Object.defineProperty(this,'el',{
		writable : true,
		value : ary
	});

	['r','g','b','a'].forEach(function (key, i) {
		Object.defineProperty(this, key, {
			enumerable : true,
			get : function () { return this.el[i] },
			set : function(value) { this.el[i] = value },
		})
	},this);

	this.a || (this.a = 1);
};

Color.prototype = {
	toString	: function() {
		return 'rgba('+this.el.join(',')+')';
	},
	toArray	: function() {
		return this.el.slice();
	}
}

Color.random = function(max) {
	max || (max = 0xff)
	return new Color(wo.rand(max),wo.rand(max),wo.rand(max),1);
}

/*
* Color.parse('#07a')
* Color.parse('#0077aa')
* Color.parse(0x0077aa)
* => "rgba(0,119,170,1)"
* todo : '#rrggbbaa', 'rgba()'
*/
Color.parse	= function(args) {
	var map_rrggbb = function(i) { return hex >> i*8 & 0xff };
	var map_rgb = function(i) { return (hex >> i*4 & 0xf) * 17 };

	var ary = [0,0,0,1], hex;
	if(typeof args === 'number'){
		hex = args;
		ary = [2,1,0].map(map_rrggbb);
	}else{
		var color = args.slice(1), startwith = args.slice(0,1)
		hex = parseInt(color,16);
		
		if(startwith === '#'){
		  ary = [2,1,0].map(color.length === 6 ? map_rrggbb : map_rgb);
		}
	}
	return new Color(ary);
};

exports.Color = Color;

});