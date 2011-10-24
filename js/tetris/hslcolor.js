/*
* 辅助类：HSL颜色
* 用于绘制砖块
* new HSLColor(180,1,.94).toString()
* => 'hsl(180,100%,94%)'
*/
define(function(require, exports, module) {

var wo    = require('../wo/wo');
var Color = require('../wo/color').Color;

function HSLColor(ary) {
	
	if( !Array.isArray(ary) ) ary = wo.makeArray(arguments);
	
	if( ary.length < 3 || ary.some(isNaN) ) throw TypeError('Invalid color arguments')
	
	Object.defineProperty(this, 'el', {
		writable : true,
		value : ary
	});

	['h','s','l'].forEach(function (key, i) {
		Object.defineProperty(this, key, {
			enumerable : true,
			get : function () { return this.el[i] },
			set : function(value) { this.el[i] = value }
		})
	},this);

};

HSLColor.prototype = {
	toString : function() {
		return 'hsl(' + this.h +','+ this.s*100+'%,' + this.l*100+'%)';
	},
	toArray	: function() {
		return this.el.slice();
	},
	toRGB : function() {
		return new Color( hsl_to_rgb.apply(null,this.el) );
	},
	multiplyComponent : function(h,s,l) {
		var el = this.el;
		return new HSLColor([h,s,l].map(function(k,i) {
			return el[i] * k;
		}))
	}
}

function hsl_to_rgb(h,s,l) {
    var m1,m2,r,g,b, h = h / 360;

    if(l <= .5) m2 = l * (s + 1);
    else m2 = l + s - l * s;

    m1 = l * 2 - m2
    r = hue_to_rgb(m1, m2,h + 1/3);
    g = hue_to_rgb(m1, m2,h );
    b = hue_to_rgb(m1, m2,h - 1/3);

    return [r,g,b].map(function(n) {
    	return Math.round(n*0xff)
    });
}

function hue_to_rgb(m1, m2, h) {
    if ( h < 0 ) h += 1;
    if ( h > 1 ) h -= 1;
    if ( h*6 < 1 ) return m1 + (m2 - m1) * 6 * h;
    if ( h*2 < 1 ) return m2;
    if ( h*3 < 2 ) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
}

module.exports = HSLColor;

});