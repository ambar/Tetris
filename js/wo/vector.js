/*
* 辅助类:向量操作
*/
define(function(require, exports, module) {

function Vector(ary) {
	if (!(this instanceof Vector)) {
		return new Vector(ary);
	}
	
	Object.defineProperty(this,'el',{
		writable : true,
		value : ary || [0,0]
	});

	['x', 'y', 'z'].forEach(function (key, i) {
		Object.defineProperty(this, key, {
			enumerable : true,
			get: function () {
				return this.get(i)
			}
		})
	},this)
};
VV = Vector;
Vector.prototype = {
	get: function (i) {
		return this.el[i];
	},
	set: function (ary) {
		this.el = ary;
		return this;
	},
	add: function (vec) {
		var el = vec.el;
		return this.map(function(e,i) {
			return e + el[i];
		})
	},
	sub: function(vec) {
		var el = vec.el;
		return this.map(function(e,i) {
			return e - el[i];
		})
	},
	map: function (fn) {
		return new Vector(this.el.map(fn))
	},
	mul: function (k) {
		return this.map(function (e) {
			return e * k;
		})
	},
	eq: function (vec) {
		var el = vec.el;
		return this.el.every(function (e, i) {
			return e === el[i];
		})
	},
	inspect: function () {
		return 'Vector[' + this.el.join(',') + ']'
	}
}

Vector.up    = Vector([0, -1]);
Vector.down  = Vector([0, 1]);
Vector.left  = Vector([-1, 0]);
Vector.right = Vector([1, 0]);
Vector.zero  = Vector([0, 0]);

module.exports = Vector;

});
